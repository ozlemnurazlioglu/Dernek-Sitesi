/**
 * TR cep telefonu numarası yardımcıları.
 *
 * Kabul edilen girdi formatları (hepsi aynı sonucu üretir):
 *   "5551234567"
 *   "05551234567"
 *   "0 555 123 45 67"
 *   "+90 555 123 45 67"
 *   "(555) 123 45 67"
 *
 * Hepsi 10 haneye normalize edilir: "5551234567".
 * Sadece 5 ile başlayan TR cep numaraları geçerli sayılır (sabit hat ve
 * yurtdışı reddedilir — derneğin SMS aboneliği için yeterli).
 */

/** Görsel ya da farklı formatta gelen numarayı 10 hane "5XXXXXXXXX" yapar; geçersizse null. */
export function normalizeTrMobile(input: string): string | null {
  if (typeof input !== "string") return null;
  // Yalnızca rakamları al.
  const digits = input.replace(/\D+/g, "");
  if (!digits) return null;

  let core = digits;
  // +90 ya da 90 ile başlıyorsa kes.
  if (core.length === 12 && core.startsWith("90")) core = core.slice(2);
  // 0 ile başlayan 11 hane ise sıfırı at.
  if (core.length === 11 && core.startsWith("0")) core = core.slice(1);
  // Geriye 10 hane kalmalı ve 5 ile başlamalı.
  if (core.length !== 10) return null;
  if (!core.startsWith("5")) return null;
  return core;
}

/** "5551234567" → "0 555 123 45 67" (görselleştirme/dışa aktarma için). */
export function formatTrMobile(phone: string): string {
  const p = normalizeTrMobile(phone);
  if (!p) return phone;
  return `0 ${p.slice(0, 3)} ${p.slice(3, 6)} ${p.slice(6, 8)} ${p.slice(8, 10)}`;
}
