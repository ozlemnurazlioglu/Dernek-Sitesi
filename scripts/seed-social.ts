/**
 * Mevcut site_settings kaydında sosyal medya URL'leri boş ise demo değer ekler.
 * Var olan değerleri ezmez. Tek seferlik yardımcı; kullanıcı admin panelden
 * istediği zaman değiştirebilir.
 */
import mysql from "mysql2/promise";

async function main() {
  const url =
    process.env.DATABASE_URL ??
    `mysql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? ""}@${process.env.DB_HOST ?? "127.0.0.1"}:${process.env.DB_PORT ?? "3306"}/${process.env.DB_NAME ?? "dernek"}`;
  const conn = await mysql.createConnection(url);
  try {
    await conn.query(
      `UPDATE site_settings
         SET social_facebook = IF(social_facebook = '', 'https://facebook.com/kumrulularordu', social_facebook),
             social_instagram = IF(social_instagram = '', 'https://instagram.com/kumrulularordu', social_instagram)
       WHERE id = 'main'`,
    );
    console.log("✓ Sosyal medya bağlantıları (boşsa) varsayılan ile dolduruldu.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
