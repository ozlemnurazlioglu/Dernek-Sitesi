import type { BurseRules } from "../types";

/**
 * Burs sistemi kurallarının başlangıç durumu. Tüm otomatik red kuralları
 * **kapalı** başlar — komisyon önce panelden bunları açar (yanlış
 * konfigürasyon kazasını önlemek için). FF özelliği AÇIK başlar; öğrenci
 * yanlış beyanı yaygınlaşırsa admin tek tıkla devre dışı bırakır.
 */
export const DEFAULT_BURS_RULES: BurseRules = {
  autoRejectEnabled: false,
  autoRejectIfPreviouslyRejected: false,
  blockedSchoolTypes: [],
  blockedSchoolPattern: "",
  blockGraduatedYearPassed: false,
  applicationOpenDate: "",
  applicationCloseDate: "",
  failedCoursesEnabled: true,
  failedCoursesThreshold: 4,
};
