import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateTR(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTimeTR(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Etkinlikler için başlangıç–bitiş aralığını derli toplu yazar.
 *  - Aynı gün → "21 Haziran 2026 · 08:00 – 18:00"
 *  - Farklı gün → "21 Haziran 2026 08:00 – 22 Haziran 2026 18:00"
 *  - Bitiş yoksa veya geçersizse sadece başlangıcı döner.
 * Türkçe `Intl.DateTimeFormat` aynı locale'i kullandığı için tarayıcı
 * locale'inden bağımsız aynı sonucu üretir.
 */
export function formatEventRangeTR(
  startValue: string | Date,
  endValue?: string | Date | null,
) {
  const start = typeof startValue === "string" ? new Date(startValue) : startValue;
  if (!endValue) return formatDateTimeTR(start);
  const end = typeof endValue === "string" ? new Date(endValue) : endValue;
  if (Number.isNaN(end.getTime())) return formatDateTimeTR(start);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const time = (d: Date) =>
    new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  if (sameDay) {
    return `${formatDateTR(start)} · ${time(start)} – ${time(end)}`;
  }
  return `${formatDateTimeTR(start)} – ${formatDateTimeTR(end)}`;
}

export function formatCurrencyTR(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
