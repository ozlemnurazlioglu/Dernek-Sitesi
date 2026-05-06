/**
 * Bir kerelik migration: `announcements` tablosuna `start_time` ve
 * `end_time` (her ikisi de `VARCHAR(5) NOT NULL DEFAULT ''`) kolonlarını
 * ekler. İdempotenttir — kolonlar zaten varsa atlanır.
 *
 * Hem TiDB Cloud (lokal `.env.local` → `DATABASE_URL`) hem cPanel MariaDB
 * üzerinde aynı script ile çalıştırılır.
 *
 * Kullanım:
 *   npx tsx scripts/add-announcement-times.ts
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

  const hasStart = await columnExists(db, sql, "announcements", "start_time");
  const hasEnd = await columnExists(db, sql, "announcements", "end_time");

  if (hasStart && hasEnd) {
    console.log("✓ start_time ve end_time zaten var, yapılacak iş yok.");
    process.exit(0);
  }

  if (!hasStart) {
    console.log("→ start_time ekleniyor...");
    await db.execute(sql`
      ALTER TABLE announcements
        ADD COLUMN start_time VARCHAR(5) NOT NULL DEFAULT ''
    `);
  }
  if (!hasEnd) {
    console.log("→ end_time ekleniyor...");
    await db.execute(sql`
      ALTER TABLE announcements
        ADD COLUMN end_time VARCHAR(5) NOT NULL DEFAULT ''
    `);
  }

  console.log("✓ Tamamlandı.");
  process.exit(0);
}

main().catch((e) => {
  console.error("add-announcement-times failed:", e);
  process.exit(1);
});
