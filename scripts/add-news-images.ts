/**
 * Bir kerelik migration: `news` tablosuna `images` (LONGTEXT NULL) kolonunu
 * ekler. İdempotenttir — kolon zaten varsa atlanır.
 *
 * Bu kolon, haber detay sayfasının altında "Fotoğraf Galerisi" olarak
 * gösterilen ek görsel URL'lerinin JSON dizisini tutar (`string[]`).
 * Kapak (`cover`) ile karıştırılmamalıdır; o ayrı kalır.
 *
 * Hem TiDB Cloud (lokal `.env.local` → `DATABASE_URL`) hem cPanel MariaDB
 * üzerinde aynı script ile çalıştırılır.
 *
 * Kullanım:
 *   npx tsx scripts/add-news-images.ts
 */
import { config as loadEnv } from "dotenv";

async function columnExists(
  db: typeof import("../src/lib/db").db,
  sqlBuilder: typeof import("drizzle-orm").sql,
  table: string,
  column: string,
): Promise<boolean> {
  const rows = (await db.execute(
    sqlBuilder`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ${table}
                  AND COLUMN_NAME = ${column}`,
  )) as unknown as Array<{ COLUMN_NAME?: string; column_name?: string }> | {
    rows?: Array<{ COLUMN_NAME?: string; column_name?: string }>;
  };
  // mysql2 array, drizzle bazen { rows } sarar. İkisini de destekle.
  const list = Array.isArray(rows) ? rows : (rows.rows ?? []);
  return list.length > 0;
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const { sql } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");

  const hasImages = await columnExists(db, sql, "news", "images");

  if (hasImages) {
    console.log("✓ news.images zaten var, yapılacak iş yok.");
    process.exit(0);
  }

  console.log("→ news.images ekleniyor...");
  // LONGTEXT NULL: JSON string[] tutar. Eski kayıtlar NULL kalır,
  // mapper bunu boş dizi olarak yorumlar. cover kolonundan ayrıdır.
  await db.execute(sql`
    ALTER TABLE news
      ADD COLUMN images LONGTEXT NULL
  `);

  console.log("✓ Tamamlandı.");
  process.exit(0);
}

main().catch((e) => {
  console.error("add-news-images failed:", e);
  process.exit(1);
});
