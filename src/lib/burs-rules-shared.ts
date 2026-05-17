import { DEFAULT_BURS_RULES } from "./defaults/burs-rules";
import type { BurseRules, ScholarshipApplication } from "./types";

/**
 * Server-only depolama erişimi olmayan, sadece tip dönüşümü + window
 * kontrolü gibi saf işler. Hem client (admin form'ları) hem server
 * (notify/api) tarafında güvenle import edilebilir.
 */

const SCHOOL_TYPES: ScholarshipApplication["schoolType"][] = [
  "lise",
  "onlisans",
  "lisans",
  "yuksek_lisans",
  "doktora",
];

function isSchoolType(s: unknown): s is ScholarshipApplication["schoolType"] {
  return (
    typeof s === "string" &&
    (SCHOOL_TYPES as readonly string[]).includes(s)
  );
}

/**
 * Defaultlarla birleştirip, gelen veriden sadece tip-uyumlu alanları
 * koruyarak güvenli bir `BurseRules` nesnesi döner. Eksik/yanlış değerler
 * default'a düşer.
 */
export function normalizeBurseRules(input: unknown): BurseRules {
  const o = (input ?? {}) as Record<string, unknown>;
  const types = Array.isArray(o.blockedSchoolTypes)
    ? (o.blockedSchoolTypes.filter(isSchoolType) as ScholarshipApplication["schoolType"][])
    : DEFAULT_BURS_RULES.blockedSchoolTypes;
  return {
    autoRejectEnabled:
      typeof o.autoRejectEnabled === "boolean"
        ? o.autoRejectEnabled
        : DEFAULT_BURS_RULES.autoRejectEnabled,
    autoRejectIfPreviouslyRejected:
      typeof o.autoRejectIfPreviouslyRejected === "boolean"
        ? o.autoRejectIfPreviouslyRejected
        : DEFAULT_BURS_RULES.autoRejectIfPreviouslyRejected,
    blockedSchoolTypes: types,
    blockedSchoolPattern:
      typeof o.blockedSchoolPattern === "string"
        ? o.blockedSchoolPattern
        : DEFAULT_BURS_RULES.blockedSchoolPattern,
    blockGraduatedYearPassed:
      typeof o.blockGraduatedYearPassed === "boolean"
        ? o.blockGraduatedYearPassed
        : DEFAULT_BURS_RULES.blockGraduatedYearPassed,
    applicationOpenDate:
      typeof o.applicationOpenDate === "string"
        ? o.applicationOpenDate
        : DEFAULT_BURS_RULES.applicationOpenDate,
    applicationCloseDate:
      typeof o.applicationCloseDate === "string"
        ? o.applicationCloseDate
        : DEFAULT_BURS_RULES.applicationCloseDate,
    failedCoursesEnabled:
      typeof o.failedCoursesEnabled === "boolean"
        ? o.failedCoursesEnabled
        : DEFAULT_BURS_RULES.failedCoursesEnabled,
    failedCoursesThreshold:
      typeof o.failedCoursesThreshold === "number"
        ? Math.trunc(o.failedCoursesThreshold)
        : DEFAULT_BURS_RULES.failedCoursesThreshold,
  };
}

/**
 * Başvuru süresi kuralı — açılış/kapanış tarihleri tanımlıysa şu an
 * aralıkta mı kontrol eder. Boş tarihler "sınırsız" demektir.
 *
 * @returns null = açık, string = kapalı sebep (UI/mesaj için).
 */
export function checkApplicationWindow(
  rules: BurseRules,
  now: Date = new Date(),
): string | null {
  const today = now.toISOString().slice(0, 10);
  if (rules.applicationOpenDate && today < rules.applicationOpenDate) {
    return `Başvurular ${rules.applicationOpenDate} tarihinde açılacaktır.`;
  }
  if (rules.applicationCloseDate && today > rules.applicationCloseDate) {
    return `Başvuru süresi ${rules.applicationCloseDate} tarihinde sona ermiştir.`;
  }
  return null;
}

/**
 * Madde 1: kullanıcı bilgilerini başvuru bitene kadar düzenleyebilsin.
 * Düzenleme penceresi açılış/kapanış tarihlerine eşit; kapalıysa edit kilitli.
 */
export function isEditWindowOpen(rules: BurseRules, now: Date = new Date()): boolean {
  return checkApplicationWindow(rules, now) === null;
}
