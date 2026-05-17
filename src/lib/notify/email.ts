import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { getNotificationSettings, invalidateNotificationSettingsCache } from "./config";
import type { NotificationSettings } from "../types";

/**
 * SMTP transporter cache'i — SMTP ayarlarının her değişimini kovalamamak
 * için ayarlarla beraber tutulur, ayar farkını fark ettiğinde yeniden kurar.
 */
let cachedTransporter: {
  fingerprint: string;
  transporter: Transporter;
} | null = null;

function buildFingerprint(s: NotificationSettings): string {
  return [
    s.smtpHost,
    s.smtpPort,
    s.smtpSecure ? "1" : "0",
    s.smtpUser,
    s.smtpPass.length, // şifre direkt logda olmasın diye uzunluğu yeterli
    s.smtpFrom,
  ].join("|");
}

function getTransporter(settings: NotificationSettings): Transporter {
  const fp = buildFingerprint(settings);
  if (cachedTransporter && cachedTransporter.fingerprint === fp) {
    return cachedTransporter.transporter;
  }
  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth:
      settings.smtpUser && settings.smtpPass
        ? { user: settings.smtpUser, pass: settings.smtpPass }
        : undefined,
  });
  cachedTransporter = { fingerprint: fp, transporter };
  return transporter;
}

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: string };

/**
 * SMTP üzerinden tek bir e-posta gönderir. Admin paneli `emailEnabled=false`
 * yaptıysa sessizce skip eder ve `{ ok:false, reason:'disabled' }` döner.
 * Başvuru API'leri bunu kritik hata olarak ele almıyor — komisyon kararı
 * mail atılmasa da yazılmalı.
 */
export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  /** Override için; verilmezse settings'teki smtpFrom kullanılır. */
  from?: string;
  /** Override için; verilmezse cache'ten çekilir (test endpoint'inde işe yarar). */
  settings?: NotificationSettings;
}): Promise<SendEmailResult> {
  const s = args.settings ?? (await getNotificationSettings());
  if (!s.emailEnabled) return { ok: false, reason: "disabled" };
  if (!s.smtpHost) return { ok: false, reason: "missing-host" };
  if (!args.to || !args.to.includes("@")) {
    return { ok: false, reason: "invalid-recipient" };
  }
  const from = args.from || s.smtpFrom || s.smtpUser;
  if (!from) return { ok: false, reason: "missing-from" };
  try {
    const transporter = getTransporter(s);
    const info = await transporter.sendMail({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[notify/email] gönderim hatası:", reason);
    return { ok: false, reason };
  }
}

/**
 * Test e-postası — admin "Bağlantıyı Test Et" butonuna basınca settings
 * cache'ini invalidate edip mevcut form değerleriyle bir kez gönderir.
 */
export async function sendTestEmail(args: {
  to: string;
  settings: NotificationSettings;
}): Promise<SendEmailResult> {
  invalidateNotificationSettingsCache();
  return sendEmail({
    to: args.to,
    subject: "[Test] Bildirim ayarları doğru çalışıyor",
    html: `<p>Bu e-posta, dernek yönetim panelinden gönderildi.</p>
<p>SMTP bağlantınız aktif ve mesaj gönderebilir durumda.</p>
<p>Sunucu: ${args.settings.smtpHost}:${args.settings.smtpPort}</p>
<p>Gönderim zamanı: ${new Date().toLocaleString("tr-TR")}</p>`,
    settings: args.settings,
  });
}
