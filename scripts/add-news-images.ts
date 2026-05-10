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
  const result = (await db.execute(
    sqlBuilder`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ${table}
                  AND COLUMN_NAME = ${column}`,
  )) as unknown;
  // Drizzle/mysql2 farklı kabuklarda dönebiliyor:
  //  • [rows, fields] tuple (mysql2 default) → result[0] satırları
  //  • doğrudan satır dizisi → length kontrolü
  //  • { rows } objesi (TiDB serverless) → rows listesi
  let list: Array<unknown> = [];
  if (Array.isArray(result)) {
    if (Array.isArray(result[0])) {
      list = result[0] as Array<unknown>;
    } else {
      list = result;
    }
  } else if (
    result &&
    typeof result === "object" &&
    Array.isArray((result as { rows?: unknown[] }).rows)
  ) {
    list = (result as { rows: unknown[] }).rows;
  }
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
