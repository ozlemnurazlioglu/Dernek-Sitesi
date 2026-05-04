/**
 * Tüm tabloları drop eder. Schema değişiklikleri (özellikle ENUM→VARCHAR
 * geçişleri ve yeni NOT NULL kolonlar) için drizzle-kit push'tan önce
 * çalıştırılır. Sonrasında `npm run db:push` + `npm run db:seed` çalıştırılmalı.
 */
import mysql from "mysql2/promise";

async function main() {
  const url =
    process.env.DATABASE_URL ??
    `mysql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? ""}@${process.env.DB_HOST ?? "127.0.0.1"}:${process.env.DB_PORT ?? "3306"}/${process.env.DB_NAME ?? "dernek"}`;

  const conn = await mysql.createConnection(url);
  console.log("→ Tüm tablolar drop ediliyor...");
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()",
  );
  for (const r of rows) {
    const name = (r.TABLE_NAME ?? r.table_name) as string;
    if (!name) continue;
    await conn.query(`DROP TABLE IF EXISTS \`${name}\``);
    console.log(`  ✗ ${name}`);
  }
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  await conn.end();
  console.log("✓ Veritabanı boşaltıldı.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Hard reset hatası:", err);
    process.exit(1);
  });
