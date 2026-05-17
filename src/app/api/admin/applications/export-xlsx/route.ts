/**
 * Admin için seçili (filtrelenmiş) başvuruları .xlsx olarak indiren endpoint.
 *
 * UI tarafı sadece `ids` listesi gönderir — backend gerçek satır verisini
 * DB'den taze çeker. Bu sayede stale UI state'i export'a sızmaz.
 *
 * `exceljs` runtime'da yüklenir (bundle'a girer); Node.js runtime şart.
 */

import { NextResponse, type NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { formatDateTimeTR } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Tek istekte export edilebilecek üst sınır. */
const MAX_IDS = 5000;

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: "Beklemede",
  in_review: "İncelemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  needs_update: "Bilgi Güncellenmeli",
};

const SCHOOL_LABELS: Record<string, string> = {
  lise: "Lise",
  onlisans: "Ön Lisans",
  lisans: "Lisans",
  yuksek_lisans: "Yüksek Lisans",
  doktora: "Doktora",
};

const GENDER_LABELS: Record<string, string> = {
  erkek: "Erkek",
  kadin: "Kadın",
  belirtmek_istemiyorum: "Belirtilmemiş",
};

/**
 * Dosyayı `requireAdmin` kontrolünden geçirip ID listesini topluyor;
 * hem POST (JSON body) hem GET (?ids=a,b,c) için ortak yardımcı.
 */
async function resolveIdsFromRequest(req: NextRequest): Promise<
  | { ok: true; ids: string[] }
  | { ok: false; error: string; status: number }
> {
  let raw: unknown[] = [];

  if (req.method === "GET") {
    const url = new URL(req.url);
    const csv = url.searchParams.get("ids") ?? "";
    raw = csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    try {
      const body = (await req.json()) as { ids?: unknown };
      if (!Array.isArray(body.ids)) {
        return {
          ok: false,
          error: "Dışa aktarılacak başvuru ID listesi (ids) gönderilmedi",
          status: 400,
        };
      }
      raw = body.ids;
    } catch {
      return {
        ok: false,
        error: "Geçersiz istek (JSON beklendi)",
        status: 400,
      };
    }
  }

  const ids = Array.from(
    new Set(raw.filter((x): x is string => typeof x === "string" && x.length > 0)),
  );
  if (ids.length === 0) {
    return { ok: false, error: "Geçerli bir ID bulunamadı", status: 400 };
  }
  if (ids.length > MAX_IDS) {
    return {
      ok: false,
      error: `Tek seferde en fazla ${MAX_IDS} başvuru dışa aktarılabilir.`,
      status: 400,
    };
  }
  return { ok: true, ids };
}

/**
 * Ortak iş yükü — ID listesinden xlsx Response üretir. POST ve GET aynı
 * fonksiyonu çağırır; sadece request parsing farkı vardır.
 */
async function exportToXlsx(ids: string[]): Promise<NextResponse> {
  const rows = await db
    .select()
    .from(applications)
    .where(inArray(applications.id, ids));

  // Submitted tarihine göre sıralama — UI ile tutarlı (yeni → eski).
  rows.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Dernek Admin";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Başvurular", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Sütun şeması — UI'daki CSV'yle aynı 38 alan + ID dahil 38 sütun.
  // `width` Excel karakter birimi (yaklaşık).
  sheet.columns = [
    { header: "ID", key: "id", width: 14 },
    { header: "Ad Soyad", key: "fullName", width: 28 },
    { header: "T.C. Kimlik", key: "nationalId", width: 14 },
    { header: "Doğum Tarihi", key: "birthDate", width: 12 },
    { header: "Cinsiyet", key: "gender", width: 12 },
    { header: "E-posta", key: "email", width: 30 },
    { header: "Telefon", key: "phone", width: 16 },
    { header: "Adres", key: "address", width: 40 },
    { header: "Şehir", key: "city", width: 14 },
    { header: "Kademe", key: "schoolType", width: 14 },
    { header: "Okul", key: "schoolName", width: 32 },
    { header: "Bölüm", key: "department", width: 28 },
    { header: "Sınıf", key: "grade", width: 10 },
    { header: "GANO", key: "gpa", width: 8 },
    { header: "FF Sayısı", key: "failedCourses", width: 10 },
    { header: "Tahmini Mezuniyet", key: "expectedGradYear", width: 18 },
    { header: "Baba Adı", key: "fatherName", width: 22 },
    { header: "Baba Mesleği", key: "fatherJob", width: 22 },
    { header: "Baba Geliri (₺)", key: "fatherIncome", width: 14 },
    { header: "Anne Adı", key: "motherName", width: 22 },
    { header: "Anne Mesleği", key: "motherJob", width: 22 },
    { header: "Anne Geliri (₺)", key: "motherIncome", width: 14 },
    { header: "Toplam Gelir (₺)", key: "totalIncome", width: 14 },
    { header: "Kardeş Sayısı", key: "siblings", width: 12 },
    { header: "Çalışan Sayısı", key: "workingMembers", width: 12 },
    { header: "Önceki Burs", key: "previousScholarship", width: 22 },
    { header: "Referans Adı", key: "referenceName", width: 22 },
    { header: "Referans Telefon", key: "referencePhone", width: 16 },
    { header: "Referans Yakınlık", key: "referenceRelation", width: 16 },
    { header: "Veli/İlgili Adı", key: "parentReferenceName", width: 22 },
    { header: "Veli/İlgili Telefon", key: "parentReferencePhone", width: 16 },
    { header: "IBAN", key: "iban", width: 32 },
    { header: "Durum", key: "status", width: 16 },
    { header: "Otomatik Red Sebebi", key: "autoRejectedReason", width: 30 },
    { header: "Komisyon Puanı", key: "score", width: 12 },
    { header: "Komisyon Notu", key: "reviewerNote", width: 30 },
    { header: "KVKK Onayı", key: "kvkkConsentAt", width: 18 },
    { header: "Başvuru Tarihi", key: "submittedAt", width: 18 },
  ];

  // Başlık stili.
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.alignment = { vertical: "middle", horizontal: "left" };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F3A5F" },
  };
  header.height = 22;

  for (const r of rows) {
    const fi = Number(r.fatherIncome) || 0;
    const mi = Number(r.motherIncome) || 0;
    sheet.addRow({
      id: r.id,
      fullName: r.fullName,
      nationalId: r.nationalId,
      birthDate: r.birthDate,
      gender: GENDER_LABELS[r.gender] ?? r.gender,
      email: r.email,
      phone: r.phone,
      address: r.address,
      city: r.city,
      schoolType: SCHOOL_LABELS[r.schoolType] ?? r.schoolType,
      schoolName: r.schoolName,
      department: r.department,
      grade: r.grade,
      gpa: r.gpa,
      failedCourses: r.failedCourses ?? 0,
      expectedGradYear: r.expectedGradYear ?? "",
      fatherName: r.fatherName,
      fatherJob: r.fatherJob,
      fatherIncome: fi,
      motherName: r.motherName,
      motherJob: r.motherJob,
      motherIncome: mi,
      totalIncome: fi + mi,
      siblings: r.siblings,
      workingMembers: r.workingMembers,
      previousScholarship: r.previousScholarship
        ? r.previousScholarshipDetail || "Evet"
        : "Hayır",
      referenceName: r.referenceName ?? "",
      referencePhone: r.referencePhone ?? "",
      referenceRelation: r.referenceRelation ?? "",
      parentReferenceName: r.parentReferenceName ?? "",
      parentReferencePhone: r.parentReferencePhone ?? "",
      iban: r.iban,
      status: STATUS_LABELS[r.status as ApplicationStatus] ?? r.status,
      autoRejectedReason: r.autoRejectedReason ?? "",
      score: r.score ?? "",
      reviewerNote: r.reviewerNote ?? "",
      kvkkConsentAt: r.kvkkConsentAt ? formatDateTimeTR(r.kvkkConsentAt) : "",
      submittedAt: formatDateTimeTR(r.submittedAt),
    });
  }

  // Para sütunlarını sayı olarak biçimle.
  for (const key of ["fatherIncome", "motherIncome", "totalIncome"]) {
    const col = sheet.getColumn(key);
    col.numFmt = '#,##0\\ ₺';
  }

  // AutoFilter — kullanıcı Excel'de kolay filtre kullanabilsin.
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  const buffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `Basvurular-${stamp}-${rows.length}adet.xlsx`;

  // RFC 5987 — Edge/Chrome/Firefox hepsi `filename*=UTF-8''...` formatına
  // saygı duyar; ASCII fallback'i de yanına koyuyoruz ki eski client'larda
  // bozulmasın.
  const encoded = encodeURIComponent(filename);
  const contentDisposition = `attachment; filename="${filename}"; filename*=UTF-8''${encoded}`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": contentDisposition,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * GET — `?ids=a,b,c` formatında ID listesi alır ve doğrudan dosyayı döner.
 * Bu sürüm tarayıcının kendi indirme yöneticisini tetikler (anchor + blob
 * gerekmez); Edge dahil tüm tarayıcılar Content-Disposition'daki adı
 * kullanır. URL uzunluğu nedeniyle ~500 ID'ye kadar güvenli.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
  const result = await resolveIdsFromRequest(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return exportToXlsx(result.ids);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
  const result = await resolveIdsFromRequest(req);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return exportToXlsx(result.ids);
}
