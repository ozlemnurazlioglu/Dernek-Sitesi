/**
 * Yönetim kurulu hiyerarşi seviyelerini özelleştirilebilir hale getiren ve
 * üye fotoğraf şeklini ekleyen migration. Idempotent — birden fazla
 * çalıştırılabilir, zaten var olan tablo/kolonları sessizce atlar.
 *
 * Yaptıkları:
 *   1. `board_members` tablosuna `shape` kolonu ekler (varsayılan 'circle')
 *   2. `board_levels` tablosunu oluşturur ve varsayılan 3 seviye
 *      (baskan/yonetim/uye) ile doldurur — admin panelden eklenip
 *      silinebilir.
 *
 * Kullanım:  npm run db:add-board-levels
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
  console.log("→ Yönetim Kurulu seviyeleri migration'ı başlatılıyor…\n");

  console.log("[1/2] board_members.shape kolonu");
  if (await columnExists("board_members", "shape")) {
    console.log("  • board_members.shape zaten var, atlanıyor");
  } else {
    console.log("  • board_members.shape ekleniyor");
    await db.execute(sql`
      ALTER TABLE \`board_members\`
      ADD \`shape\` VARCHAR(16) NOT NULL DEFAULT 'circle'
    `);
  }

  console.log("\n[2/2] board_levels tablosu");
  if (await tableExists("board_levels")) {
    console.log("  • board_levels tablosu zaten var, atlanıyor");
  } else {
    console.log("  • board_levels tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`board_levels\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`slug\` VARCHAR(32) NOT NULL UNIQUE,
        \`name\` VARCHAR(100) NOT NULL,
        \`size\` VARCHAR(4) NOT NULL DEFAULT 'md',
        \`sort\` INT NOT NULL DEFAULT 0,
        INDEX \`board_levels_sort_idx\` (\`sort\`)
      )
    `);

    console.log("  • Varsayılan 3 seviye ekleniyor (baskan, yonetim, uye)");
    await db.execute(sql`
      INSERT INTO \`board_levels\` (\`id\`, \`slug\`, \`name\`, \`size\`, \`sort\`)
      VALUES
        ('bl-baskan', 'baskan', 'Başkan', 'lg', 10),
        ('bl-yonetim', 'yonetim', 'Yönetim', 'md', 20),
        ('bl-uye', 'uye', 'Üye', 'sm', 30)
    `);
  }

  console.log("\n✓ Tüm migration adımları tamamlandı.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n✗ Migration hatası:", err);
    process.exit(1);
  });
