/**
 * One-shot fix — eski DB'de activity_reports tablosuna `label` kolonu
 * eklenmemiş olabilir. Bu script kolon var mı diye bakar, yoksa ekler.
 */

import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function main() {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'activity_reports'
      AND column_name = 'label'
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0])
    ? rows[0]
    : (rows as unknown as { cnt: number }[]);
  const exists = Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
  if (exists) {
    console.log("activity_reports.label zaten var, atlanıyor.");
    return;
  }
  await db.execute(sql`
    ALTER TABLE activity_reports
    ADD COLUMN label VARCHAR(128) NOT NULL DEFAULT 'Faaliyet Raporu' AFTER id
  `);
  console.log("activity_reports.label kolonu eklendi.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
