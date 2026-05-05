/**
 * Bir kerelik elle çalıştırılan migration: `donors` tablosunu oluşturur ve
 * tablo boşsa görseldeki örnek bağışçı verisini seed eder. Idempotent —
 * birden fazla çalıştırılabilir, mevcutsa atlanır.
 *
 * Kullanım:  npm run db:add-donors
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

async function rowCount(table: string): Promise<number> {
  const rows = (await db.execute(
    sql.raw(`SELECT COUNT(*) AS cnt FROM \`${table}\``),
  )) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0])
    ? rows[0]
    : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0);
}

async function main() {
  console.log("→ donors migration'ı başlatılıyor…");

  if (!(await tableExists("donors"))) {
    console.log("  • donors tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`donors\` (
        \`id\` varchar(64) NOT NULL,
        \`name\` varchar(191) NOT NULL,
        \`donated_at\` varchar(32) NOT NULL DEFAULT '',
        \`amount\` int NOT NULL DEFAULT 0,
        \`sort\` int NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`donors_sort_idx\` (\`sort\`)
      )
    `);
  } else {
    console.log("  • donors tablosu zaten var, atlanıyor");
  }

  // Tablo boşsa varsayılan örnek veriyi ekle (görseldeki gibi).
  const count = await rowCount("donors");
  if (count === 0) {
    console.log("  • donors tablosu boş, örnek veri ekleniyor");
    const samples: { id: string; name: string; donated_at: string; amount: number; sort: number }[] = [
      { id: "dn-1", name: "Ahmet Yılmaz", donated_at: "2026-05-02", amount: 5000, sort: 10 },
      { id: "dn-2", name: "Mehmet Kaya", donated_at: "2026-05-01", amount: 2500, sort: 20 },
      { id: "dn-3", name: "Fatma Demir", donated_at: "2026-04-30", amount: 1000, sort: 30 },
      { id: "dn-4", name: "Ali Özkan", donated_at: "2026-04-28", amount: 10000, sort: 40 },
      { id: "dn-5", name: "Zeynep Tekin", donated_at: "2026-04-25", amount: 500, sort: 50 },
    ];
    for (const s of samples) {
      await db.execute(sql`
        INSERT INTO \`donors\` (\`id\`, \`name\`, \`donated_at\`, \`amount\`, \`sort\`)
        VALUES (${s.id}, ${s.name}, ${s.donated_at}, ${s.amount}, ${s.sort})
      `);
    }
  } else {
    console.log(`  • donors tablosunda ${count} kayıt var, seed atlanıyor`);
  }

  // home.donors_section page block'u yoksa ekle (admin başlığı düzenleyebilsin).
  const headingRows = (await db.execute(sql`
    SELECT \`block_key\` FROM \`page_blocks\` WHERE \`block_key\` = 'home.donors_section' LIMIT 1
  `)) as unknown as Array<Array<{ block_key: string }>>;
  const headingData = Array.isArray(headingRows[0])
    ? headingRows[0]
    : (headingRows as unknown as { block_key: string }[]);
  if (!headingData[0]) {
    console.log("  • home.donors_section page block'u ekleniyor");
    const heading = {
      eyebrow: "Teşekkürler",
      title: "Bağışçılarımız",
      description: "Değerli destekçilerimize teşekkür ederiz",
    };
    await db.execute(sql`
      INSERT INTO \`page_blocks\` (\`block_key\`, \`data\`, \`updated_at\`)
      VALUES ('home.donors_section', ${JSON.stringify(heading)}, NOW(3))
    `);
  } else {
    console.log("  • home.donors_section page block'u zaten var, atlanıyor");
  }

  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
