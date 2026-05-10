/**
 * Etkinliklerin geçmiş/gelecek tespiti için yardımcı fonksiyonlar.
 *
 * Tanım: Bir etkinlik `endsAt` (bitiş zamanı) **şu an'dan önce ise** geçmiştir
 * ve public listelerde gösterilmez. `endsAt` parse edilemezse fail-open
 * davranışı uygulanır — etkinlik listede kalır (yanlışlıkla bir veriyi
 * gizlemekten yana hata vermek istemiyoruz).
 *
 * `startsAt` yerine `endsAt`'i kullanıyoruz çünkü bir günlük (veya çoklu gün)
 * etkinliğin bitiş zamanı geçmedikçe etkinlik hâlâ "devam ediyor" sayılır;
 * mesela sabah 09:00'da başlayıp akşam 18:00'da bitecek bir konferans, gün
 * içinde 14:00'te de gösterilmelidir.
 */

import type { EventItem } from "@/lib/types";

export function isEventPast(
  e: Pick<EventItem, "endsAt">,
  now: Date = new Date(),
): boolean {
  const t = new Date(e.endsAt).getTime();
  if (!isFinite(t)) return false;
  return t < now.getTime();
}

export function filterUpcomingEvents<T extends Pick<EventItem, "endsAt">>(
  items: T[],
  now: Date = new Date(),
): T[] {
  return items.filter((e) => !isEventPast(e, now));
}
