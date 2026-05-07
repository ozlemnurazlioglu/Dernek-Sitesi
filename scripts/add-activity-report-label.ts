/**
 * Bir kerelik migration:
 *   `activity_reports` tablosuna `label VARCHAR(128)` kolonu ekler
 *   (DEFAULT 'Faaliyet Raporu', NOT NULL). Mevcut tüm kayıtlar otomatik
 *   olarak bu varsayılana sahip olur.
 *
 *   Bu sayede "Hakkımızda" kartlarının üst etiketi (örn: "Faaliyet
 *   Raporu", "Üyelik Formu", "Kurumsal Kimlik") admin panelden
 *   yönetilebilir hâle gelir.
 *
 * İdempotenttir; kolon zaten varsa hiçbir şey yapmaz.
 *
 * Kullanım:
 *   npx tsx scripts/add-activity-report-label.ts
 */
import { config as loadEnv } from "dotenv";

type Db = typeof import("../src/lib/db").db;
type Sql = typeof import("drizzle-orm").sql;

async function rowsOf(result: unknown): Promise<unknown[]> {
  // Drizzle MySQL2 execute returns [rows, fields] tuple (native mysql2);
  // some drivers return the rows array directly, and a few wrap them
  // in `{ rows }`. Cover all three.
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

async function columnExists(
  db: Db,
  sql: Sql,
  table: string,
  column: string,
): Promise<boolean> {
  const r = await db.execute(
    sql`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ${table}
          AND COLUMN_NAME = ${column}`,
  );
  return (await rowsOf(r)).length > 0;
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv({ path: ".env" });

  const { db } = await import("../src/lib/db");
  const { sql } = await import("drizzle-orm");

  console.log("→ activity_reports.label kolonu kontrol ediliyor...");
  if (await columnExists(db, sql, "activity_reports", "label")) {
    console.log("✓ Kolon zaten mevcut. Atlanıyor.");
  } else {
    console.log("→ Kolon ekleniyor (DEFAULT 'Faaliyet Raporu')...");
    await db.execute(
      sql`ALTER TABLE activity_reports
          ADD COLUMN label VARCHAR(128) NOT NULL DEFAULT 'Faaliyet Raporu'`,
    );
    console.log("✓ activity_reports.label eklendi.");
  }

  console.log("--- ALL DONE ---");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration başarısız:", err);
  process.exit(1);
});
