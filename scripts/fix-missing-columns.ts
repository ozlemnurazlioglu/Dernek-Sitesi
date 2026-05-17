/**
 * One-shot DB senkron script — eski DB'de schema.ts ile uyumsuz olan
 * eksik kolonları idempotent biçimde ekler.
 *
 * Bilinen eksikler (test sırasında bootstrap'i kıranlar):
 *   - activity_reports.label
 *   - announcements.start_time, announcements.end_time, announcements.phone
 *
 * `applyAlterIfMissing` kolon var mı diye information_schema'ya bakar,
 * yoksa ekler.
 */

import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = ${table} AND column_name = ${column}
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0])
    ? rows[0]
    : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
}

async function ensure(table: string, column: string, definition: string) {
  if (await columnExists(table, column)) {
    console.log(`OK: ${table}.${column} zaten var.`);
    return;
  }
  await db.execute(
    sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`),
  );
  console.log(`ADDED: ${table}.${column}`);
}

async function main() {
  await ensure(
    "activity_reports",
    "label",
    "`label` VARCHAR(128) NOT NULL DEFAULT 'Faaliyet Raporu' AFTER `id`",
  );
  await ensure(
    "announcements",
    "start_time",
    "`start_time` VARCHAR(5) NOT NULL DEFAULT ''",
  );
  await ensure(
    "announcements",
    "end_time",
    "`end_time` VARCHAR(5) NOT NULL DEFAULT ''",
  );
  await ensure(
    "announcements",
    "phone",
    "`phone` VARCHAR(64) NOT NULL DEFAULT ''",
  );
  console.log("Senkronizasyon tamamlandı.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
