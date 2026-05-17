import type { NotificationTemplate, NotificationTemplates } from "../types";

/**
 * Şablon değişkenleri — `{fullName}` gibi placeholder'lar bu nesneden
 * çözülür. Tanımlı olmayan placeholder'lar olduğu gibi bırakılır (kullanıcı
 * yazım hatası fark etsin).
 */
export type TemplateVars = {
  fullName?: string;
  applicationId?: string;
  associationName?: string;
  reason?: string;
  updateRequest?: string;
  applicationLink?: string;
  year?: string | number;
};

/**
 * Basit placeholder render — `{name}` formundaki tokenları map'ten çözer.
 * Bilinmeyen anahtarlar olduğu gibi kalır. HTML kaçışı yapılmaz; admin
 * şablonları zaten güvenli HTML yazmaktan sorumlu.
 */
export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const v = vars[key as keyof TemplateVars];
    return v === undefined || v === null ? match : String(v);
  });
}

export function renderNotificationTemplate(
  tpl: NotificationTemplate,
  vars: TemplateVars,
): NotificationTemplate {
  return {
    emailSubject: renderTemplate(tpl.emailSubject, vars),
    emailHtml: renderTemplate(tpl.emailHtml, vars),
    sms: renderTemplate(tpl.sms, vars),
  };
}

/** Başvuru durum değişikliğine göre şablon türü seçer. */
export type NotificationEvent = "approved" | "rejected" | "needsUpdate";

export function pickTemplate(
  templates: NotificationTemplates,
  event: NotificationEvent,
): NotificationTemplate {
  return templates[event];
}
