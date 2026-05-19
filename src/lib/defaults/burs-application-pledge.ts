import type { BursApplicationPledge } from "@/lib/types";

/**
 * Burs başvuru formunun son adımında gösterilen vicdani sorumluluk notu.
 *
 * Default metin müşteri tarafından sağlanmıştır — yeni kurulumlarda doğrudan
 * görünür, isterse admin panelinden değiştirebilir veya `enabled=false`
 * yaparak gizleyebilir.
 */
export const DEFAULT_BURS_APPLICATION_PLEDGE: BursApplicationPledge = {
  enabled: true,
  title: "Vicdani Sorumluluk",
  body:
    "Burs alan her öğrenci mezun olduktan sonra her sene en az bir Kumrulu öğrenciye burs vermeyi vicdani bir sorumluluk olarak kabul eder.",
};

export function normalizeBursApplicationPledge(
  raw: unknown,
): BursApplicationPledge {
  const o =
    raw && typeof raw === "object"
      ? (raw as Partial<BursApplicationPledge>)
      : {};
  return {
    enabled:
      typeof o.enabled === "boolean"
        ? o.enabled
        : DEFAULT_BURS_APPLICATION_PLEDGE.enabled,
    title:
      typeof o.title === "string"
        ? o.title
        : DEFAULT_BURS_APPLICATION_PLEDGE.title,
    body:
      typeof o.body === "string" && o.body.trim()
        ? o.body
        : DEFAULT_BURS_APPLICATION_PLEDGE.body,
  };
}
