import "server-only";
import { eq } from "drizzle-orm";
import { db, parseDbJson } from "./db";
import { pageBlocks } from "./db/schema";
import { DEFAULT_BURS_RULES } from "./defaults/burs-rules";
import { normalizeBurseRules } from "./burs-rules-shared";
import type { BurseRules } from "./types";

export {
  normalizeBurseRules,
  checkApplicationWindow,
  isEditWindowOpen,
} from "./burs-rules-shared";

export const BURS_RULES_BLOCK_KEY = "burs.rules";

let cache: { value: BurseRules; expiresAt: number } | null = null;
const TTL_MS = 60_000;

/**
 * `page_blocks.burs.rules`'i (cache'li) okuyup BurseRules olarak döner.
 * Tablo yoksa veya block hiç oluşturulmamışsa default'a düşer.
 */
export async function getBurseRules(): Promise<BurseRules> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;
  try {
    const rows = await db
      .select()
      .from(pageBlocks)
      .where(eq(pageBlocks.blockKey, BURS_RULES_BLOCK_KEY))
      .limit(1);
    const raw = rows[0]?.data;
    const parsed = typeof raw === "string" ? parseDbJson(raw) : raw;
    const value = normalizeBurseRules(parsed);
    cache = { value, expiresAt: now + TTL_MS };
    return value;
  } catch {
    return { ...DEFAULT_BURS_RULES };
  }
}

export function invalidateBurseRulesCache(): void {
  cache = null;
}
