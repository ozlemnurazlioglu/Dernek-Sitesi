/**
 * Tek seferlik geçiş: site_settings tablosuna social_facebook kolonu ekler.
 * Var olan veriyi korur — yalnızca yeni kolonu ekler.
 */
import mysql from "mysql2/promise";

async function main() {
  const url =
    process.env.DATABASE_URL ??
    `mysql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? ""}@${process.env.DB_HOST ?? "127.0.0.1"}:${process.env.DB_PORT ?? "3306"}/${process.env.DB_NAME ?? "dernek"}`;

  const conn = await mysql.createConnection(url);
  try {
    const [cols] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COLUMN_NAME FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'site_settings'
          AND COLUMN_NAME = 'social_facebook'`,
    );
    if (cols.length > 0) {
      console.log("✓ social_facebook kolonu zaten mevcut.");
      return;
    }
    await conn.query(
      "ALTER TABLE `site_settings` ADD COLUMN `social_facebook` VARCHAR(512) NOT NULL DEFAULT '' AFTER `bank_branch`",
    );
    console.log("✓ social_facebook kolonu eklendi.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
