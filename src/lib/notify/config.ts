import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { notificationSettings, siteSettings } from "../db/schema";
import { rowToNotificationSettings } from "../db/mappers";
import type { NotificationSettings } from "../types";
import { DEFAULT_NOTIFICATION_TEMPLATES } from "../defaults/notification-templates";

/**
 * Bildirim ayarları için 60 saniyelik in-memory cache. PATCH/POST sırasında
 * her başvuru için DB'ye gitmek istemiyoruz; admin paneli güncelleme yapınca
 * cache invalidate edilir (`invalidateNotificationSettingsCache`).
 */
let cache: { value: NotificationSettings; expiresAt: number } | null = null;
const TTL_MS = 60_000;

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: false,
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  smsEnabled: false,
  smsProvider: "",
  smsUser: "",
  smsPass: "",
  smsHeader: "",
  smsApiKey: "",
  smsApiSecret: "",
  smsFromNumber: "",
  templates: DEFAULT_NOTIFICATION_TEMPLATES,
  updatedAt: new Date(0).toISOString(),
};

/**
 * Bildirim ayarları singleton'unu DB'den (cache'li) çeker. Hiç oluşturulmamışsa
 * (migration atlandı gibi edge case) default değerleri döner — kod patlamasın.
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;
  try {
    const rows = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.id, "main"))
      .limit(1);
    const row = rows[0];
    const value = row ? rowToNotificationSettings(row) : DEFAULT_SETTINGS;
    cache = { value, expiresAt: now + TTL_MS };
    return value;
  } catch (err) {
    console.warn("[notify/config] DB okunamadı, default'a düşülüyor", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Cache'i tamamen temizler — admin paneli ayarları güncelleyince çağırılır.
 * Bundan sonraki ilk `getNotificationSettings` DB'ye gider.
 */
export function invalidateNotificationSettingsCache(): void {
  cache = null;
}

/**
 * Şablon placeholder'larına bastırılacak ortak değişkenleri toplar.
 * Derneğin adı dinamik olduğu için site_settings'ten çekilir.
 */
export async function getAssociationName(): Promise<string> {
  try {
    const rows = await db
      .select({ name: siteSettings.name })
      .from(siteSettings)
      .limit(1);
    return rows[0]?.name ?? "Dernek";
  } catch {
    return "Dernek";
  }
}
