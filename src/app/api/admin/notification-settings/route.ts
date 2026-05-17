/**
 * Admin: Bildirim (e-posta + SMS) ayarları.
 *
 *   GET  /api/admin/notification-settings  → mevcut ayarları döner
 *                                            (şifre/token alanları maskelenir)
 *   PUT  /api/admin/notification-settings  → ayarları günceller
 *                                            (boş şifre alanı geleni korur)
 *
 * Sadece admin role'üne sahip kullanıcılar erişebilir.
 */
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notificationSettings } from "@/lib/db/schema";
import { rowToNotificationSettings } from "@/lib/db/mappers";
import { requireAdmin, AuthError } from "@/lib/auth";
import { invalidateNotificationSettingsCache } from "@/lib/notify";
import { DEFAULT_NOTIFICATION_TEMPLATES } from "@/lib/defaults/notification-templates";
import type { NotificationSettings, NotificationTemplates } from "@/lib/types";

export const dynamic = "force-dynamic";

const PROVIDER_VALUES = new Set(["", "netgsm", "iletimerkezi", "twilio"]);
const MASK = "********";

function maskSecret(s: string): string {
  return s && s.length > 0 ? MASK : "";
}

/**
 * Settings nesnesindeki gizli alanları maskeler. UI form'da bu maske
 * gözükür; kullanıcı değişiklik yapmazsa PUT'a aynı maske geri gelir ve
 * sunucu eski değeri korur. Gerçek değişiklikte UI maske'yi temizler.
 */
function withMaskedSecrets(s: NotificationSettings): NotificationSettings {
  return {
    ...s,
    smtpPass: maskSecret(s.smtpPass),
    smsPass: maskSecret(s.smsPass),
    smsApiSecret: maskSecret(s.smsApiSecret),
  };
}

async function readSingleton(): Promise<NotificationSettings | null> {
  const rows = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.id, "main"))
    .limit(1);
  return rows[0] ? rowToNotificationSettings(rows[0]) : null;
}

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
  const settings = (await readSingleton()) ?? {
    emailEnabled: false,
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
    smsEnabled: false,
    smsProvider: "" as const,
    smsUser: "",
    smsPass: "",
    smsHeader: "",
    smsApiKey: "",
    smsApiSecret: "",
    smsFromNumber: "",
    templates: DEFAULT_NOTIFICATION_TEMPLATES,
    updatedAt: new Date(0).toISOString(),
  };
  return NextResponse.json({
    settings: withMaskedSecrets(settings),
    defaults: { templates: DEFAULT_NOTIFICATION_TEMPLATES },
  });
}

function asString(v: unknown, def = ""): string {
  return typeof v === "string" ? v : def;
}
function asBool(v: unknown, def = false): boolean {
  return typeof v === "boolean" ? v : def;
}
function asInt(v: unknown, def: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : def;
}

function sanitizeTemplate(
  input: unknown,
  fallback: NotificationTemplates[keyof NotificationTemplates],
) {
  const obj = (input ?? {}) as Record<string, unknown>;
  return {
    emailSubject: asString(obj.emailSubject, fallback.emailSubject),
    emailHtml: asString(obj.emailHtml, fallback.emailHtml),
    sms: asString(obj.sms, fallback.sms),
  };
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const body = (await req.json().catch(() => null)) as Partial<
    NotificationSettings
  > | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const current = await readSingleton();

  // Şifre alanı boş ya da MASK ise eski değeri koru — UI tarafından zaten
  // maskeli geliyor, kullanıcı değişiklik yapmadıysa silmek istemeyiz.
  function preserveSecret(incoming: unknown, currentValue: string): string {
    const s = asString(incoming, "");
    if (!s || s === MASK) return currentValue;
    return s;
  }

  const providerInput = asString(body.smsProvider, current?.smsProvider ?? "");
  const smsProvider = PROVIDER_VALUES.has(providerInput)
    ? (providerInput as NotificationSettings["smsProvider"])
    : "";

  const port = asInt(body.smtpPort, current?.smtpPort ?? 587);
  if (port < 1 || port > 65535) {
    return NextResponse.json({ error: "Geçersiz SMTP portu" }, { status: 400 });
  }

  const next: NotificationSettings = {
    emailEnabled: asBool(body.emailEnabled, current?.emailEnabled ?? false),
    smtpHost: asString(body.smtpHost, current?.smtpHost ?? ""),
    smtpPort: port,
    smtpSecure: asBool(body.smtpSecure, current?.smtpSecure ?? false),
    smtpUser: asString(body.smtpUser, current?.smtpUser ?? ""),
    smtpPass: preserveSecret(body.smtpPass, current?.smtpPass ?? ""),
    smtpFrom: asString(body.smtpFrom, current?.smtpFrom ?? ""),

    smsEnabled: asBool(body.smsEnabled, current?.smsEnabled ?? false),
    smsProvider,
    smsUser: asString(body.smsUser, current?.smsUser ?? ""),
    smsPass: preserveSecret(body.smsPass, current?.smsPass ?? ""),
    smsHeader: asString(body.smsHeader, current?.smsHeader ?? ""),
    smsApiKey: asString(body.smsApiKey, current?.smsApiKey ?? ""),
    smsApiSecret: preserveSecret(body.smsApiSecret, current?.smsApiSecret ?? ""),
    smsFromNumber: asString(body.smsFromNumber, current?.smsFromNumber ?? ""),

    templates: {
      approved: sanitizeTemplate(
        body.templates?.approved,
        DEFAULT_NOTIFICATION_TEMPLATES.approved,
      ),
      rejected: sanitizeTemplate(
        body.templates?.rejected,
        DEFAULT_NOTIFICATION_TEMPLATES.rejected,
      ),
      needsUpdate: sanitizeTemplate(
        body.templates?.needsUpdate,
        DEFAULT_NOTIFICATION_TEMPLATES.needsUpdate,
      ),
    },
    updatedAt: new Date().toISOString(),
  };

  // Singleton satırı varsa UPDATE, yoksa INSERT (migration script eklemeyi
  // unutmuş olabiliriz diye fail-safe).
  if (current) {
    await db
      .update(notificationSettings)
      .set({
        emailEnabled: next.emailEnabled,
        smtpHost: next.smtpHost,
        smtpPort: next.smtpPort,
        smtpSecure: next.smtpSecure,
        smtpUser: next.smtpUser,
        smtpPass: next.smtpPass,
        smtpFrom: next.smtpFrom,
        smsEnabled: next.smsEnabled,
        smsProvider: next.smsProvider,
        smsUser: next.smsUser,
        smsPass: next.smsPass,
        smsHeader: next.smsHeader,
        smsApiKey: next.smsApiKey,
        smsApiSecret: next.smsApiSecret,
        smsFromNumber: next.smsFromNumber,
        templates: next.templates,
        updatedAt: new Date(),
      })
      .where(eq(notificationSettings.id, "main"));
  } else {
    await db.insert(notificationSettings).values({
      id: "main",
      emailEnabled: next.emailEnabled,
      smtpHost: next.smtpHost,
      smtpPort: next.smtpPort,
      smtpSecure: next.smtpSecure,
      smtpUser: next.smtpUser,
      smtpPass: next.smtpPass,
      smtpFrom: next.smtpFrom,
      smsEnabled: next.smsEnabled,
      smsProvider: next.smsProvider,
      smsUser: next.smsUser,
      smsPass: next.smsPass,
      smsHeader: next.smsHeader,
      smsApiKey: next.smsApiKey,
      smsApiSecret: next.smsApiSecret,
      smsFromNumber: next.smsFromNumber,
      templates: next.templates,
      updatedAt: new Date(),
    });
  }

  invalidateNotificationSettingsCache();

  return NextResponse.json({ ok: true, settings: withMaskedSecrets(next) });
}
