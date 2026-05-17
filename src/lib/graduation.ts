import type { ScholarshipApplication } from "./types";

/**
 * Okul tipi başına toplam ders süresi (yıl). Hazırlık + ekstra yıl
 * sapmaları admin verisinde yer almıyor; bu basit eşleme komisyona
 * yaklaşık değer verir, kesinlik gerektirmez.
 */
const TOTAL_YEARS: Record<ScholarshipApplication["schoolType"], number> = {
  lise: 4,
  onlisans: 2,
  lisans: 4,
  yuksek_lisans: 2,
  doktora: 4,
};

/**
 * `grade` alanı serbest metindir (kullanıcı "1", "2. sınıf", "Lisans 3"
 * gibi yazabilir). İlk rakam grubunu sayı olarak çıkarıp 1..N aralığına
 * sığdırırız; bulunamazsa null döner.
 */
export function parseGrade(grade: string): number | null {
  const m = String(grade).match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  if (!Number.isFinite(n) || n <= 0 || n > 8) return null;
  return n;
}

/**
 * Verilen okul tipi + sınıf + bu yıl bilgisinden, öğrencinin tahmini
 * mezuniyet yılını hesaplar. Sınıf parse edilemezse `undefined`.
 *
 * Mantık: kalan yıl = max(1, totalYears - currentGrade + 1).
 * Örnek: lisans 1. sınıf 2026 → 2026 + (4-1+1) - 1 = 2029 (4 yıl sonra).
 */
export function computeExpectedGradYear(
  schoolType: ScholarshipApplication["schoolType"],
  grade: string,
  refYear: number = new Date().getFullYear(),
): number | undefined {
  const g = parseGrade(grade);
  if (g == null) return undefined;
  const total = TOTAL_YEARS[schoolType] ?? 4;
  const remaining = Math.max(1, total - g + 1);
  // Akademik yıl yaz-sonu mezuniyetiyle bitiyor → +remaining-1 yıl sonra
  // ders yılının bitiminde mezun olur. Pratikte ufak sapma olabilir;
  // komisyon ham hesabı uyarı olarak görür, override edebilir.
  return refYear + remaining - 1;
}

/**
 * "Bu yıl son sınıfta mı?" — başvuru detayında "Bu yıl mezun olabilir"
 * uyarısı için. Mezuniyet yılı bu yıl veya daha öncesine düşüyorsa true.
 */
export function isGraduatingThisYear(
  expectedGradYear: number | undefined,
  refYear: number = new Date().getFullYear(),
): boolean {
  if (!expectedGradYear) return false;
  return expectedGradYear <= refYear;
}
