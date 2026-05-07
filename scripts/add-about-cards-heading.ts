/**
 * Bir kerelik migration:
 *   page_blocks içine `home.about_cards_heading` kaydını yoksa varsayılan
 *   değerlerle ekler. Ana sayfadaki "Hakkımızda" kartlarının üstüne çıkan
 *   ikinci başlığı (eyebrow + title + description) yönetebilmek için.
 *
 * İdempotenttir; kayıt zaten varsa dokunulmaz (admin'in özelleştirmeleri
 * korunur).
 *
 * Kullanım:
 *   npx tsx scripts/add-about-cards-heading.ts
 */
import { config as loadEnv } from "dotenv";

type Db = typeof import("../src/lib/db").db;
type Sql = typeof import("drizzle-orm").sql;

async function rowsOf(result: unknown): Promise<unknown[]> {
  if (Array.isArray(result)) {
    const first = (result as unknown[])[0];
    if (Array.isArray(first)) return first as unknown[];
    return result as unknown[];
  }
  if (result && typeof result === "object" && "rows" in result) {
    const r = (result as { rows?: unknown[] }).rows;
    return Array.isArray(r) ? r : [];
  }
  return [];
}

const DEFAULT_ABOUT_CARDS_HEADING = {
  eyebrow: "Faaliyet Alanlarımız",
  title: "Birlikte yaptıklarımız",
  description:
    "Eğitim, kültür ve dayanışma temasında öne çıkardığımız çalışma başlıklarımız.",
};

async function ensureBlock(db: Db, sql: Sql) {
  console.log("→ page_blocks.home.about_cards_heading kontrol ediliyor...");
  const existing = await db.execute(
    sql`SELECT block_key FROM page_blocks WHERE block_key = 'home.about_cards_heading' LIMIT 1`,
  );
  if ((await rowsOf(existing)).length > 0) {
    console.log("✓ home.about_cards_heading zaten mevcut, dokunulmadı.");
    return;
  }
  console.log("→ home.about_cards_heading ekleniyor (varsayılan metinler)...");
  const json = JSON.stringify(DEFAULT_ABOUT_CARDS_HEADING);
  await db.execute(
    sql`INSERT INTO page_blocks (block_key, data, updated_at)
        VALUES ('home.about_cards_heading', ${json}, NOW(3))`,
  );
  console.log("✓ home.about_cards_heading eklendi.");
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv({ path: ".env" });

  const { db } = await import("../src/lib/db");
  const { sql } = await import("drizzle-orm");

  await ensureBlock(db, sql);

  console.log("--- ALL DONE ---");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration başarısız:", err);
  process.exit(1);
});
