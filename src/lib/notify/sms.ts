import "server-only";
import type { NotificationSettings } from "../types";
import { getNotificationSettings } from "./config";
import { normalizeTrMobile } from "../phone";

export type SendSmsResult =
  | { ok: true; provider: string; reference?: string }
  | { ok: false; reason: string };

/**
 * Sağlayıcı bağımsız SMS gönderim arayüzü. Admin seçimine göre `netgsm`,
 * `iletimerkezi` veya `twilio` adapter'larına yönlendirir. Disabled veya
 * konfigürasyonu eksikse sessizce skip eder.
 */
export async function sendSms(args: {
  to: string;
  text: string;
  settings?: NotificationSettings;
}): Promise<SendSmsResult> {
  const s = args.settings ?? (await getNotificationSettings());
  if (!s.smsEnabled) return { ok: false, reason: "disabled" };
  if (!s.smsProvider) return { ok: false, reason: "no-provider" };
  // Telefon normalize — yurtdışı/sabit hat olursa hata; +90 ya da 0 ekli
  // gelse bile 10 haneye çekilir.
  const phone10 = normalizeTrMobile(args.to);
  if (!phone10) return { ok: false, reason: "invalid-recipient" };
  // İçerikte TR karakterlerini sağlayıcılar genelde GSM7'ye düşürür; metni
  // olduğu gibi gönderiyoruz. Boş içerik gönderme.
  if (!args.text || !args.text.trim()) {
    return { ok: false, reason: "empty-text" };
  }
  try {
    if (s.smsProvider === "netgsm") return await sendViaNetgsm(s, phone10, args.text);
    if (s.smsProvider === "iletimerkezi")
      return await sendViaIletimerkezi(s, phone10, args.text);
    if (s.smsProvider === "twilio") return await sendViaTwilio(s, phone10, args.text);
    return { ok: false, reason: `unknown-provider:${s.smsProvider}` };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[notify/sms/${s.smsProvider}] gönderim hatası:`, reason);
    return { ok: false, reason };
  }
}

/* ====================== NetGSM ====================== */

/**
 * NetGSM "sms/send/otp" değil, klasik "1:n" gönderim (xml/json). Kolay
 * test için XML-form endpoint'i tercih ediyoruz; yanıt body düz metin gelir,
 * 00 / 01 başlıyorsa başarı.
 *
 * Kimlik: smsUser=NetGSM kodu, smsPass=şifre, smsHeader=onaylı başlık.
 */
async function sendViaNetgsm(
  s: NotificationSettings,
  phone10: string,
  text: string,
): Promise<SendSmsResult> {
  if (!s.smsUser || !s.smsPass || !s.smsHeader) {
    return { ok: false, reason: "netgsm-missing-credentials" };
  }
  const url = "https://api.netgsm.com.tr/sms/send/get";
  const params = new URLSearchParams({
    usercode: s.smsUser,
    password: s.smsPass,
    gsmno: "0" + phone10,
    message: text,
    msgheader: s.smsHeader,
    filter: "0",
  });
  const res = await fetch(`${url}?${params.toString()}`, { method: "GET" });
  const body = (await res.text()).trim();
  // Yanıt formatı: "00 <bulkid>" başarı, "00", "01" başarı; sayısal kod hata.
  if (body.startsWith("00") || body.startsWith("01")) {
    return { ok: true, provider: "netgsm", reference: body };
  }
  return { ok: false, reason: `netgsm:${body}` };
}

/* ====================== İletiMerkezi ====================== */

/**
 * İletiMerkezi v1 JSON API. `smsApiKey` => username, `smsPass` => password;
 * `smsHeader` opsiyoneldir (yoksa default sender kullanılır).
 *
 * Not: İletiMerkezi'nin REST API'si XML-ağırlıklı eski sürüm + JSON yeni
 * sürüm halinde 2 farklı endpoint'e bölünmüş durumda. JSON sürümünü
 * kullanıyoruz; doğrulama panelden yapılır.
 */
async function sendViaIletimerkezi(
  s: NotificationSettings,
  phone10: string,
  text: string,
): Promise<SendSmsResult> {
  if (!s.smsApiKey || !s.smsPass) {
    return { ok: false, reason: "iletimerkezi-missing-credentials" };
  }
  const url = "https://api.iletimerkezi.com/v1/send-sms/json";
  const payload = {
    request: {
      authentication: { key: s.smsApiKey, hash: s.smsPass },
      order: {
        sender: s.smsHeader || undefined,
        message: { text, receipents: { number: ["0" + phone10] } },
      },
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json().catch(() => null)) as
    | { response?: { status?: { code?: number; message?: string } } }
    | null;
  const code = json?.response?.status?.code;
  if (code === 200) {
    return { ok: true, provider: "iletimerkezi" };
  }
  return {
    ok: false,
    reason: `iletimerkezi:${code ?? "?"}:${json?.response?.status?.message ?? ""}`,
  };
}

/* ====================== Twilio ====================== */

/**
 * Twilio Messages API. `smsApiKey` => Account SID, `smsApiSecret` => Auth
 * Token; `smsFromNumber` => Twilio'da satın alınmış E.164 numarası.
 *
 * TR cep numarası için "+90" prefix'i ekliyoruz; yurtdışı kullanımda Twilio
 * doğru numara formatı zaten admin tarafından girilmiş olur.
 */
async function sendViaTwilio(
  s: NotificationSettings,
  phone10: string,
  text: string,
): Promise<SendSmsResult> {
  if (!s.smsApiKey || !s.smsApiSecret || !s.smsFromNumber) {
    return { ok: false, reason: "twilio-missing-credentials" };
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(s.smsApiKey)}/Messages.json`;
  const body = new URLSearchParams({
    From: s.smsFromNumber,
    To: "+90" + phone10,
    Body: text,
  });
  const auth = Buffer.from(`${s.smsApiKey}:${s.smsApiSecret}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  const json = (await res.json().catch(() => null)) as
    | { sid?: string; message?: string; status?: string }
    | null;
  if (res.ok && json?.sid) {
    return { ok: true, provider: "twilio", reference: json.sid };
  }
  return { ok: false, reason: `twilio:${res.status}:${json?.message ?? ""}` };
}

/** Admin "SMS Test" butonu için kısa bir sabit metin gönderir. */
export async function sendTestSms(args: {
  to: string;
  settings: NotificationSettings;
}): Promise<SendSmsResult> {
  return sendSms({
    to: args.to,
    text:
      "[Test] Dernek paneli SMS ayarlari calisiyor. Saat: " +
      new Date().toLocaleString("tr-TR"),
    settings: args.settings,
  });
}
