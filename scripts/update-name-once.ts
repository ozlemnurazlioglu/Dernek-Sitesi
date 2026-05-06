/**
 * Bir kerelik elle çalıştırılan migration: dernek adını
 * "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği"
 *   →
 * "Ordu Kumrulular Eğitim Kültür Yardımlaşma Derneği"
 * şeklinde tüm metin alanlarında günceller. Idempotent.
 *
 * Kapsam: site_settings (name, bank_account_holder, seo_title),
 * page_blocks.data (JSON LONGTEXT — string match), legal_pages
 * (description + content). cPanel MariaDB için doğrudan SQL ile
 * uygulandı; bu script Vercel/TiDB tarafını da senkron tutar.
 *
 * Çalıştırma:
 *   npx tsx scripts/update-name-once.ts
 */
import { config as loadEnv } from "dotenv";

const OLD_NAME = "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği";
const NEW_NAME = "Ordu Kumrulular Eğitim Kültür Yardımlaşma Derneği";

async function main() {
  // Önce env'i yükle, sonra db modülünü import et — yoksa pool boş URL'le açılır.
  loadEnv({ path: ".env.local" });
  loadEnv();
  const { sql } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");

  console.log(`→ "${OLD_NAME}" → "${NEW_NAME}"`);

  const settingsResult = await db.execute(sql`
    UPDATE site_settings
       SET name = REPLACE(name, ${OLD_NAME}, ${NEW_NAME}),
           bank_account_holder = REPLACE(bank_account_holder, ${OLD_NAME}, ${NEW_NAME}),
           seo_title = REPLACE(seo_title, ${OLD_NAME}, ${NEW_NAME})
  `);
  console.log("site_settings:", settingsResult);

  const blocksResult = await db.execute(sql`
    UPDATE page_blocks
       SET data = REPLACE(data, ${OLD_NAME}, ${NEW_NAME})
     WHERE data LIKE ${"%" + OLD_NAME + "%"}
  `);
  console.log("page_blocks:", blocksResult);

  const legalResult = await db.execute(sql`
    UPDATE legal_pages
       SET description = REPLACE(description, ${OLD_NAME}, ${NEW_NAME}),
           content = REPLACE(content, ${OLD_NAME}, ${NEW_NAME})
     WHERE content LIKE ${"%" + OLD_NAME + "%"}
        OR description LIKE ${"%" + OLD_NAME + "%"}
  `);
  console.log("legal_pages:", legalResult);

  const verify = await db.execute(sql`
    SELECT name, bank_account_holder, seo_title FROM site_settings LIMIT 1
  `);
  console.log("verify:", verify);

  process.exit(0);
}

main().catch((e) => {
  console.error("update-name-once failed:", e);
  process.exit(1);
});
