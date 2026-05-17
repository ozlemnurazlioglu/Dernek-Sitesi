/**
 * Toplu bildirim endpoint'i — admin paneli "Toplu Bildirim" sayfasından
 * iki farklı hedef kitleye gönderim yapar:
 *
 *   audience = "applications" (default)
 *     - Başvuranlara şablonlu e-posta + SMS
 *     - Filtre: event (approved/rejected/needsUpdate) + status + year
 *     - Şablondaki placeholder'lar runtime'da öğrenci verileriyle dolar
 *
 *   audience = "sms-subscribers" (yeni)
 *     - Ana sayfa SMS abonelik formundan toplanan numaralara DÜZ METİN SMS
 *     - Şablon yok (abonelerin ismi/başvurusu olmadığı için placeholder
 *       dolduramayız). Admin metnin tamamını kendisi yazar.
 *     - Filtre: opsiyonel abonelik tarih aralığı (fromDate, toDate)
 *     - E-posta atılmaz, sadece SMS.
 *
 * Önemli notlar:
 *   - Bu endpoint başvurunun STATUS'unu değiştirmez. Yalnızca bildirim atar.
 *   - Sağlayıcı rate-limit'ine takılmamak için seri olarak gönderir.
 *   - Tek seferde maks 500 alıcı.
 */

import { NextResponse, type NextRequest } from "next/server";
import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applicationDocuments,
  applications,
  smsSubscribers,
} from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { rowToApplication } from "@/lib/db/mappers";
import {
  notifyApplicationEvent,
  type NotificationEvent,
  getNotificationSettings,
} from "@/lib/notify";
import { sendSms } from "@/lib/notify/sms";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES: ApplicationStatus[] = [
  "submitted",
  "in_review",
  "approved",
  "rejected",
  "needs_update",
];

const VALID_EVENTS: NotificationEvent[] = [
  "approved",
  "rejected",
  "needsUpdate",
];

/** Tek istekte gönderilebilecek üst sınır. Sağlayıcı limitlerine takılmamak için. */
const MAX_RECIPIENTS = 500;

function getBaseUrl(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }
  return "";
}

type BulkNotifyBody = {
  /** Hedef kitle: "applications" (default) veya "sms-subscribers". */
  audience?: unknown;
  event?: unknown;
  /** filtre: status — "all" veya belirli durum (sadece applications için). */
  status?: unknown;
  /** filtre: başvuru yılı, örn 2026 (sadece applications için). */
  year?: unknown;
  /** filtre: id allow-list (UI'da kullanıcı manuel seçim yaptıysa). */
  ids?: unknown;
  /** Override metin — admin red sebebi/açıklamasını girebilir. */
  reason?: unknown;
  updateRequest?: unknown;
  /** SMS aboneleri için: gönderilecek düz SMS metni. */
  smsText?: unknown;
  /** SMS aboneleri için: abonelik tarihi alt/üst sınırı (ISO). */
  fromDate?: unknown;
  toDate?: unknown;
  /** Önizleme modu — gerçekten gönderme, sadece alıcı sayısını dön. */
  dryRun?: unknown;
};

type Audience = "applications" | "sms-subscribers";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: BulkNotifyBody;
  try {
    body = (await req.json()) as BulkNotifyBody;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON beklendi)" },
      { status: 400 },
    );
  }

  const audience: Audience =
    body.audience === "sms-subscribers" ? "sms-subscribers" : "applications";
  const dryRun = body.dryRun === true;

  // ============================================================
  // BRANCH 2: SMS Aboneleri — düz metin SMS gönderimi
  // ============================================================
  if (audience === "sms-subscribers") {
    return handleSmsSubscribers(body, dryRun);
  }

  // ============================================================
  // BRANCH 1: Başvuranlara şablonlu bildirim (mevcut akış)
  // ============================================================
  const event = body.event;
  if (typeof event !== "string" || !VALID_EVENTS.includes(event as NotificationEvent)) {
    return NextResponse.json(
      {
        error: `Geçersiz event. Beklenen: ${VALID_EVENTS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const status = body.status;
  const statusFilter: ApplicationStatus | null =
    typeof status === "string" && status !== "all"
      ? VALID_STATUSES.includes(status as ApplicationStatus)
        ? (status as ApplicationStatus)
        : null
      : null;
  if (typeof status === "string" && status !== "all" && !statusFilter) {
    return NextResponse.json(
      { error: "Geçersiz status filtresi" },
      { status: 400 },
    );
  }

  const yearRaw = body.year;
  let yearFilter: number | null = null;
  if (yearRaw !== undefined && yearRaw !== null && yearRaw !== "") {
    const n = Number(yearRaw);
    if (!Number.isFinite(n) || n < 1990 || n > 2999) {
      return NextResponse.json(
        { error: "Geçersiz yıl filtresi" },
        { status: 400 },
      );
    }
    yearFilter = Math.trunc(n);
  }

  let idsFilter: string[] | null = null;
  if (Array.isArray(body.ids)) {
    idsFilter = body.ids.filter(
      (x): x is string => typeof x === "string" && x.length > 0,
    );
    if (idsFilter.length === 0) {
      return NextResponse.json(
        { error: "ids boş listeyle gönderildi" },
        { status: 400 },
      );
    }
  }

  const reason =
    typeof body.reason === "string" ? body.reason.trim() : undefined;
  const updateRequest =
    typeof body.updateRequest === "string"
      ? body.updateRequest.trim()
      : undefined;

  // Filtre clause'larını WHERE içine birleştir.
  const clauses = [];
  if (statusFilter) clauses.push(eq(applications.status, statusFilter));
  if (idsFilter) clauses.push(inArray(applications.id, idsFilter));
  if (yearFilter != null) {
    const start = new Date(yearFilter, 0, 1);
    const end = new Date(yearFilter + 1, 0, 1);
    clauses.push(gte(applications.submittedAt, start));
    clauses.push(lt(applications.submittedAt, end));
  }

  const rows = await db
    .select()
    .from(applications)
    .where(clauses.length > 0 ? and(...clauses) : undefined);

  if (rows.length === 0) {
    return NextResponse.json({
      ok: true,
      total: 0,
      sent: { email: 0, sms: 0 },
      failed: { email: 0, sms: 0 },
      errors: [],
      dryRun,
    });
  }

  if (rows.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      {
        error: `Tek seferde en fazla ${MAX_RECIPIENTS} alıcıya gönderilebilir (${rows.length} eşleşti). Filtrelerinizi daraltın.`,
      },
      { status: 400 },
    );
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      total: rows.length,
      sent: { email: 0, sms: 0 },
      failed: { email: 0, sms: 0 },
      errors: [],
      dryRun: true,
    });
  }

  // Doküman join — `rowToApplication` belge map'i istiyor; toplu bildirim
  // için belge bilgisi şart değil → boş geçiyoruz (bu sadece şablon
  // değişkenlerinde kullanılmıyor).
  const ids = rows.map((r) => r.id);
  const docs = ids.length
    ? await db
        .select()
        .from(applicationDocuments)
        .where(inArray(applicationDocuments.applicationId, ids))
    : [];
  const docsByApp = new Map<string, typeof docs>();
  for (const d of docs) {
    const arr = docsByApp.get(d.applicationId) ?? [];
    arr.push(d);
    docsByApp.set(d.applicationId, arr);
  }

  const baseUrl = getBaseUrl(req);
  let emailOk = 0;
  let emailFail = 0;
  let smsOk = 0;
  let smsFail = 0;
  const errors: { applicationId: string; email?: string; sms?: string }[] = [];

  for (const row of rows) {
    const app = rowToApplication(row, docsByApp.get(row.id) ?? []);
    try {
      const r = await notifyApplicationEvent({
        event: event as NotificationEvent,
        application: app,
        baseUrl,
        reason,
        updateRequest,
      });
      let appErr: { applicationId: string; email?: string; sms?: string } | null = null;
      if (r.email.ok) emailOk += 1;
      else {
        emailFail += 1;
        appErr = appErr || { applicationId: row.id };
        appErr.email = r.email.reason;
      }
      if (r.sms.ok) smsOk += 1;
      else {
        smsFail += 1;
        appErr = appErr || { applicationId: row.id };
        appErr.sms = r.sms.reason;
      }
      if (appErr && errors.length < 5) errors.push(appErr);
    } catch (err) {
      emailFail += 1;
      smsFail += 1;
      if (errors.length < 5) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push({ applicationId: row.id, email: msg, sms: msg });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    sent: { email: emailOk, sms: smsOk },
    failed: { email: emailFail, sms: smsFail },
    errors,
    dryRun: false,
  });
}

/* ============================================================
 * SMS Aboneleri için düz metin gönderim handler'ı.
 *
 * - Şablon yok: admin'in girdiği `smsText` aynen gönderilir.
 * - E-posta atılmaz (abonenin e-postası yok); response'taki email
 *   sayaçları her zaman 0.
 * - Opsiyonel tarih filtresi: `fromDate` ve `toDate` arasında abone
 *   olanlara gönderilir. Boş bırakılırsa tüm aboneler dahil.
 * - dryRun=true ise sadece alıcı sayısını döner.
 * ============================================================ */
async function handleSmsSubscribers(
  body: BulkNotifyBody,
  dryRun: boolean,
): Promise<NextResponse> {
  const smsText =
    typeof body.smsText === "string" ? body.smsText.trim() : "";
  if (!dryRun && !smsText) {
    return NextResponse.json(
      {
        error:
          "SMS metni zorunludur. Abonelere gönderilecek metni yazınız.",
      },
      { status: 400 },
    );
  }
  if (smsText.length > 700) {
    // Tek SMS 160 karakter (TR 70). Sağlayıcı bölüyor ama 700 karakter
    // (~5 SMS) sınırını aşma — yanlışlıkla devasa metin gönderilmesin.
    return NextResponse.json(
      {
        error:
          "SMS metni çok uzun (700 karakteri aşıyor). Daha kısa bir metin yazın.",
      },
      { status: 400 },
    );
  }

  // Tarih filtreleri (opsiyonel, ISO formatında)
  const parseDate = (v: unknown): Date | null => {
    if (typeof v !== "string" || !v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };
  const fromDate = parseDate(body.fromDate);
  const toDate = parseDate(body.toDate);

  const clauses = [];
  if (fromDate) clauses.push(gte(smsSubscribers.createdAt, fromDate));
  if (toDate) clauses.push(lt(smsSubscribers.createdAt, toDate));

  const rows = await db
    .select()
    .from(smsSubscribers)
    .where(clauses.length > 0 ? and(...clauses) : undefined);

  if (rows.length === 0) {
    return NextResponse.json({
      ok: true,
      total: 0,
      sent: { email: 0, sms: 0 },
      failed: { email: 0, sms: 0 },
      errors: [],
      dryRun,
    });
  }
  if (rows.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      {
        error: `Tek seferde en fazla ${MAX_RECIPIENTS} aboneye gönderilebilir (${rows.length} eşleşti). Tarih filtresi ile daraltın.`,
      },
      { status: 400 },
    );
  }
  if (dryRun) {
    return NextResponse.json({
      ok: true,
      total: rows.length,
      sent: { email: 0, sms: 0 },
      failed: { email: 0, sms: 0 },
      errors: [],
      dryRun: true,
    });
  }

  const settings = await getNotificationSettings();
  if (!settings.smsEnabled || !settings.smsProvider) {
    return NextResponse.json(
      {
        error:
          "SMS gönderimi devre dışı veya sağlayıcı seçili değil. Bildirim Ayarları'ndan etkinleştirin.",
      },
      { status: 400 },
    );
  }

  let smsOk = 0;
  let smsFail = 0;
  const errors: {
    applicationId: string;
    email?: string;
    sms?: string;
  }[] = [];
  for (const r of rows) {
    try {
      const res = await sendSms({ to: r.phone, text: smsText, settings });
      if (res.ok) {
        smsOk += 1;
      } else {
        smsFail += 1;
        if (errors.length < 5) {
          errors.push({ applicationId: r.phone, sms: res.reason });
        }
      }
    } catch (err) {
      smsFail += 1;
      if (errors.length < 5) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push({ applicationId: r.phone, sms: msg });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    total: rows.length,
    sent: { email: 0, sms: smsOk },
    failed: { email: 0, sms: smsFail },
    errors,
    dryRun: false,
  });
}
