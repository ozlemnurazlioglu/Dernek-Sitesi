import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { applications } from "./db/schema";
import type { BurseRules, ScholarshipApplication } from "./types";

export type AutoRejectInput = {
  nationalId: string;
  schoolType: ScholarshipApplication["schoolType"];
  schoolName: string;
  expectedGradYear?: number;
};

/**
 * Yeni gelen başvuruyu burs kurallarına göre otomatik reddedip
 * reddetmeyeceğine karar verir. Birden fazla kurala takılırsa ilkini
 * sebep olarak alır (sıralama: önceki red → kademe → okul → mezuniyet).
 *
 * @returns Auto-reject olmuyorsa null; oluyorsa kısa Türkçe sebep.
 */
export async function evaluateAutoReject(
  rules: BurseRules,
  input: AutoRejectInput,
): Promise<string | null> {
  if (!rules.autoRejectEnabled) return null;

  // 1) Aynı TC ile daha önce reddedilmiş başvuru var mı?
  if (rules.autoRejectIfPreviouslyRejected && input.nationalId) {
    try {
      const prev = await db
        .select({ id: applications.id })
        .from(applications)
        .where(
          and(
            eq(applications.nationalId, input.nationalId),
            eq(applications.status, "rejected"),
          ),
        )
        .limit(1);
      if (prev.length > 0) {
        return "Bu T.C. kimlik numarası ile yapılan önceki başvuru reddedilmişti.";
      }
    } catch (err) {
      console.warn("[auto-reject] önceki red sorgusu başarısız", err);
    }
  }

  // 2) Engellenen kademe
  if (rules.blockedSchoolTypes.includes(input.schoolType)) {
    return `Bu eğitim kademesinden (${input.schoolType}) başvuru kabul edilmemektedir.`;
  }

  // 3) Engellenen okul adı pattern'leri (case-insensitive)
  if (rules.blockedSchoolPattern && input.schoolName) {
    const patterns = rules.blockedSchoolPattern
      .split(/[,\n]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const lower = input.schoolName.toLowerCase();
    for (const p of patterns) {
      if (lower.includes(p.toLowerCase())) {
        return `Beyan ettiğiniz okul (${input.schoolName}) burs kapsamı dışındadır.`;
      }
    }
  }

  // 4) Mezuniyet yılı geçmiş mi?
  if (
    rules.blockGraduatedYearPassed &&
    input.expectedGradYear &&
    input.expectedGradYear < new Date().getFullYear()
  ) {
    return `Sistem hesabına göre ${input.expectedGradYear} yılında mezun olmuş görünüyorsunuz.`;
  }

  return null;
}
