import "server-only";
import type { ScholarshipApplication } from "../types";
import { getAssociationName, getNotificationSettings } from "./config";
import { sendEmail, type SendEmailResult } from "./email";
import { sendSms, type SendSmsResult } from "./sms";
import {
  pickTemplate,
  renderNotificationTemplate,
  type NotificationEvent,
} from "./template";

export type { NotificationEvent } from "./template";
export { getNotificationSettings, invalidateNotificationSettingsCache } from "./config";
export { sendTestEmail } from "./email";
export { sendTestSms } from "./sms";

/**
 * Tek bir başvuru için durum değişikliğine ait mail + SMS bildirimini
 * tetikler. Sağlayıcı veya alıcı verisi yoksa skip eder, asla throw etmez.
 * Geri dönüş: hangi kanal başarılı/başarısız oldu raporu (admin loglayabilsin).
 */
export async function notifyApplicationEvent(args: {
  event: NotificationEvent;
  application: ScholarshipApplication;
  /** Public site URL'i (e-posta içindeki link). Yoksa /hesabim. */
  baseUrl?: string;
  /** Mail/SMS metnine ek olarak admin'in yazdığı serbest gerekçe. */
  reason?: string;
  /** needs_update olayında öğrenciye iletilen açıklama. */
  updateRequest?: string;
}): Promise<{ email: SendEmailResult; sms: SendSmsResult }> {
  const settings = await getNotificationSettings();
  const associationName = await getAssociationName();
  const tpl = pickTemplate(settings.templates, args.event);
  const vars = {
    fullName: args.application.fullName,
    applicationId: args.application.id,
    associationName,
    reason: args.reason ?? args.application.reviewerNote ?? "",
    updateRequest:
      args.updateRequest ?? args.application.updateRequest ?? "",
    applicationLink: `${args.baseUrl ?? ""}/hesabim`,
    year: new Date().getFullYear(),
  };
  const rendered = renderNotificationTemplate(tpl, vars);

  // Sıralı çalıştır — mail ve SMS bağımsız; biri başarısız olsa diğeri çalışsın.
  const emailResult = settings.emailEnabled && args.application.email
    ? await sendEmail({
        to: args.application.email,
        subject: rendered.emailSubject,
        html: rendered.emailHtml,
        settings,
      })
    : ({ ok: false, reason: "disabled-or-missing-email" } as SendEmailResult);

  const smsResult = settings.smsEnabled && args.application.phone
    ? await sendSms({
        to: args.application.phone,
        text: rendered.sms,
        settings,
      })
    : ({ ok: false, reason: "disabled-or-missing-phone" } as SendSmsResult);

  return { email: emailResult, sms: smsResult };
}
