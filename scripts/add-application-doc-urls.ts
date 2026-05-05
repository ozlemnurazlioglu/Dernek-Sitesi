/**
 * Bir kerelik elle çalıştırılan migration: `application_documents` tablosuna
 * `file_url` kolonu ekler. Önceden var olan kayıtların file_url'si boş kalır;
 * admin paneli bunu "demo dönemi belgesi (URL yok)" olarak gösterir.
 *
 * Idempotent — birden fazla çalıştırılabilir.
 *
 * Kullanım:  npm run db:add-application-doc-urls
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
  console.log("→ application_documents.file_url migration'ı başlatılıyor…");

  if (!(await columnExists("application_documents", "file_url"))) {
    console.log("  • application_documents.file_url kolonu ekleniyor");
    await db.execute(sql`
      ALTER TABLE \`application_documents\`
      ADD \`file_url\` varchar(512) NOT NULL DEFAULT ''
    `);
  } else {
    console.log("  • application_documents.file_url zaten var, atlanıyor");
  }

  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
