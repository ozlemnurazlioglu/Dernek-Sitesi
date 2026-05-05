/**
 * Bir kerelik elle çalıştırılan migration: announcements tablosuna `phone`
 * kolonu ekler. Idempotent — birden fazla çalıştırılabilir.
 *
 * Kullanım:  npm run db:add-announcement-phone
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

async function main() {
  console.log("→ announcements.phone migration'ı başlatılıyor…");

  if (!(await columnExists("announcements", "phone"))) {
    console.log("  • announcements.phone kolonu ekleniyor");
    await db.execute(sql`
      ALTER TABLE \`announcements\` ADD \`phone\` varchar(64) NOT NULL DEFAULT ''
    `);
  } else {
    console.log("  • announcements.phone zaten var, atlanıyor");
  }

  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
