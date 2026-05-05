/**
 * Bir kerelik elle çalıştırılan migration: `neighborhoods` tablosunu
 * oluşturur. Idempotent — birden fazla çalıştırılabilir, mevcutsa atlanır.
 *
 * Kullanım:  npm run db:add-neighborhoods
 */
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function tableExists(table: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = ${table}
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0])
    ? rows[0]
    : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
}

async function main() {
  console.log("→ neighborhoods migration'ı başlatılıyor…");

  if (!(await tableExists("neighborhoods"))) {
    console.log("  • neighborhoods tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`neighborhoods\` (
        \`id\` varchar(64) NOT NULL,
        \`name\` varchar(191) NOT NULL,
        \`headman\` varchar(191) NOT NULL DEFAULT '',
        \`phone\` varchar(64) NOT NULL DEFAULT '',
        \`sort\` int NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`neighborhoods_sort_idx\` (\`sort\`)
      )
    `);
  } else {
    console.log("  • neighborhoods tablosu zaten var, atlanıyor");
  }

  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
