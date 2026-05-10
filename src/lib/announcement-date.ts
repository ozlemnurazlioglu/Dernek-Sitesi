/**
 * Hemşehri ilanlarındaki `eventDate` alanı için yardımcı fonksiyonlar.
 *
 * Geçmişte bu alan serbest metin olarak saklanıyordu (örn. "15 Haziran 2026").
 * Yeni admin formu HTML5 date picker kullandığı için artık YYYY-MM-DD
 * (ISO 8601) formatında geliyor. İki formatı da desteklemek gerekiyor:
 *
 *  - Yeni veri: "2026-06-15" → makine okunabilir, filtreye alınabilir.
 *  - Eski veri: "15 Haziran 2026" → Türkçe ay adlarını parse etmeye çalışırız;
 *    başarılı olursa filtreye dâhil olur, başarısız olursa olduğu gibi gösterilir
 *    ve "tarihi geçmiş" filtresinden muaf tutulur (verinin yanlış gizlenmemesi
 *    için fail-open davranışı).
 */
import type { Announcement } from "@/lib/types";
import { formatDateTR } from "@/lib/utils";

const TR_MONTHS: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  subat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  mayis: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  agustos: 8,
  eylül: 9,
  eylul: 9,
  ekim: 10,
  kasım: 11,
  kasim: 11,
  aralık: 12,
  aralik: 12,
};

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * `eventDate` metnini günün başlangıcı (00:00) olan bir Date'e çevirmeye
 * çalışır. Hem ISO ("YYYY-MM-DD") hem de Türkçe metin ("15 Haziran 2026")
 * destekli. Parse edilemezse `null` döner.
 */
export function parseAnnouncementEventDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const raw = s.trim();
  if (!raw) return null;

  // ISO format: YYYY-MM-DD
  const iso = ISO_DATE_RE.exec(raw);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (!isFinite(y) || !isFinite(m) || !isFinite(d)) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    const out = new Date(y, m - 1, d, 0, 0, 0, 0);
    return isNaN(out.getTime()) ? null : out;
  }

  // Türkçe metin: "15 Haziran 2026", "1 Ocak 2026", "31 Aralık 2025"
  const tr = raw
    .toLowerCase()
    .replace(/\s+/g, " ")
    .match(/^(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})$/i);
  if (tr) {
    const day = Number(tr[1]);
    const month = TR_MONTHS[tr[2]];
    const year = Number(tr[3]);
    if (!month || !isFinite(day) || !isFinite(year)) return null;
    if (day < 1 || day > 31) return null;
    const out = new Date(year, month - 1, day, 0, 0, 0, 0);
    return isNaN(out.getTime()) ? null : out;
  }

  return null;
}

/**
 * Public sayfalarda gösterilecek tarih metnini döndürür.
 *  - ISO format ise → "15 Haziran 2026" şekline çevrilir.
 *  - Eski Türkçe metin ise → olduğu gibi döndürülür (geriye uyum).
 *  - Boşsa → "" döner.
 */
export function formatAnnouncementEventDate(s: string | null | undefined): string {
  if (!s) return "";
  const raw = s.trim();
  if (!raw) return "";
  if (ISO_DATE_RE.test(raw)) {
    // formatDateTR ISO datetime de kabul ediyor; YYYY-MM-DD'yi gün başına
    // sabitlemek için T00:00:00 ekliyoruz.
    return formatDateTR(`${raw}T00:00:00`);
  }
  return raw;
}

/**
 * İlan tarihinin geçip geçmediğini söyler. "Geçmiş" tanımı: ilanın günü
 * bugünden ÖNCE ise. Aynı gün (örn. düğün bugün) hâlâ gösterilir.
 *
 * Tarih parse edilemezse `false` döner — eski serbest metin verilerin
 * yanlışlıkla gizlenmemesi için fail-open.
 */
export function isAnnouncementPast(
  item: Pick<Announcement, "eventDate">,
  now: Date = new Date(),
): boolean {
  const d = parseAnnouncementEventDate(item.eventDate);
  if (!d) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

/**
 * Listeden tarihi geçmiş ilanları çıkarır. Tarihsiz veya parse edilemeyen
 * ilanlar listede kalır.
 */
export function filterUpcomingAnnouncements<T extends Pick<Announcement, "eventDate">>(
  items: T[],
  now: Date = new Date(),
): T[] {
  return items.filter((a) => !isAnnouncementPast(a, now));
}
