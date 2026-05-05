/**
 * Bir kerelik elle çalıştırılan migration: site_settings tablosuna
 * analytics & reklam ID alanlarını ekler. Idempotent — birden fazla
 * çalıştırılabilir, mevcut sütunlar atlanır.
 *
 * Eklenen sütunlar:
 *   - ga_measurement_id        (Google Analytics 4)
 *   - gtm_container_id         (Google Tag Manager)
 *   - meta_pixel_id            (Meta / Facebook Pixel)
 *   - adsense_publisher_id     (Google AdSense Auto Ads)
 *   - custom_tracking_html     (özel takip/reklam HTML)
 *
 * Kullanım:  npm run db:add-analytics-fields
 */
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ${table}
      AND column_name = ${column}
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0])
    ? rows[0]
    : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
}

async function addColumnIfMissing(
  table: string,
  column: string,
  definition: string,
) {
  if (await columnExists(table, column)) {
    console.log(`  • ${table}.${column} zaten var, atlanıyor`);
    return;
  }
  console.log(`  • ${table}.${column} ekleniyor`);
  await db.execute(
    sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`),
  );
}

async function main() {
  console.log("→ Site settings — analytics alanları migration'ı başlatılıyor…");

  await addColumnIfMissing(
    "site_settings",
    "ga_measurement_id",
    "varchar(64) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "site_settings",
    "gtm_container_id",
    "varchar(64) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "site_settings",
    "meta_pixel_id",
    "varchar(64) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "site_settings",
    "adsense_publisher_id",
    "varchar(64) NOT NULL DEFAULT ''",
  );
  // text türü için DEFAULT '' MySQL'de bazı sürümlerde reddedilir; NULL'a izin
  // verip sonra mevcut satırları '' ile dolduruyoruz, böylece NOT NULL olarak
  // okuyabiliyoruz.
  if (!(await columnExists("site_settings", "custom_tracking_html"))) {
    console.log("  • site_settings.custom_tracking_html ekleniyor");
    await db.execute(sql`
      ALTER TABLE \`site_settings\` ADD COLUMN \`custom_tracking_html\` text
    `);
    await db.execute(sql`
      UPDATE \`site_settings\` SET \`custom_tracking_html\` = '' WHERE \`custom_tracking_html\` IS NULL
    `);
    await db.execute(sql`
      ALTER TABLE \`site_settings\` MODIFY COLUMN \`custom_tracking_html\` text NOT NULL
    `);
  } else {
    console.log("  • site_settings.custom_tracking_html zaten var, atlanıyor");
  }

  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
