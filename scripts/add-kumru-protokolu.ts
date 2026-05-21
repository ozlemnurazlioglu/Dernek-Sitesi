/**
 * Kumru Protokolü modülü için migration. Idempotent — birden fazla
 * çalıştırılabilir, zaten var olan kolon/tabloları sessizce atlar.
 *
 * Yaptıkları:
 *   1. `board_members` tablosuna sosyal medya kolonlarını ekler
 *      (twitter, instagram, facebook, website)
 *   2. `protocol_levels` tablosunu oluşturup varsayılan 3 seviyeyi ekler
 *   3. `protocol_members` tablosunu oluşturur
 *   4. `header.config` page block'una "Kumru Protokolü" menü öğesi ekler
 *   5. `page.headers.protokol` varsayılan başlık + açıklamayı ekler
 *
 * Kullanım:  npx tsx --env-file=.env.local scripts/add-kumru-protokolu.ts
 */
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";
import { pageBlocks } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

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

async function ensureSocialColumn(table: string, column: string) {
  if (await columnExists(table, column)) {
    console.log(`  • ${table}.${column} zaten var, atlanıyor`);
    return;
  }
  console.log(`  • ${table}.${column} ekleniyor`);
  await db.execute(sql.raw(
    `ALTER TABLE \`${table}\` ADD \`${column}\` VARCHAR(512) NOT NULL DEFAULT ''`,
  ));
}

async function ensureShapeColumn(table: string) {
  if (await columnExists(table, "shape")) {
    console.log(`  • ${table}.shape zaten var, atlanıyor`);
    return;
  }
  console.log(`  • ${table}.shape ekleniyor`);
  await db.execute(sql.raw(
    `ALTER TABLE \`${table}\` ADD \`shape\` VARCHAR(16) NOT NULL DEFAULT 'circle'`,
  ));
}

async function main() {
  console.log("→ Kumru Protokolü migration'ı başlatılıyor…\n");

  console.log("[1/5] board_members sosyal medya + shape kolonları");
  await ensureShapeColumn("board_members");
  await ensureSocialColumn("board_members", "twitter");
  await ensureSocialColumn("board_members", "instagram");
  await ensureSocialColumn("board_members", "facebook");
  await ensureSocialColumn("board_members", "website");

  console.log("\n[2/5] protocol_levels tablosu");
  if (await tableExists("protocol_levels")) {
    console.log("  • protocol_levels zaten var, atlanıyor");
  } else {
    console.log("  • protocol_levels oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`protocol_levels\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`slug\` VARCHAR(32) NOT NULL UNIQUE,
        \`name\` VARCHAR(100) NOT NULL,
        \`size\` VARCHAR(4) NOT NULL DEFAULT 'md',
        \`sort\` INT NOT NULL DEFAULT 0,
        INDEX \`protocol_levels_sort_idx\` (\`sort\`)
      )
    `);
    console.log("  • Varsayılan 3 seviye ekleniyor (baskan, yonetim, uye)");
    await db.execute(sql`
      INSERT INTO \`protocol_levels\` (\`id\`, \`slug\`, \`name\`, \`size\`, \`sort\`)
      VALUES
        ('pl-baskan', 'baskan', 'Belediye Başkanı', 'lg', 10),
        ('pl-yonetim', 'yonetim', 'Müdür / Yetkili', 'md', 20),
        ('pl-uye', 'uye', 'Üye', 'sm', 30)
    `);
  }

  console.log("\n[3/5] protocol_members tablosu");
  if (await tableExists("protocol_members")) {
    console.log("  • protocol_members zaten var, atlanıyor");
  } else {
    console.log("  • protocol_members oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`protocol_members\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(191) NOT NULL,
        \`role\` VARCHAR(191) NOT NULL,
        \`avatar\` VARCHAR(512) NOT NULL,
        \`bio\` VARCHAR(2000) NOT NULL DEFAULT '',
        \`level\` VARCHAR(32) NOT NULL DEFAULT 'uye',
        \`shape\` VARCHAR(16) NOT NULL DEFAULT 'circle',
        \`twitter\` VARCHAR(512) NOT NULL DEFAULT '',
        \`instagram\` VARCHAR(512) NOT NULL DEFAULT '',
        \`facebook\` VARCHAR(512) NOT NULL DEFAULT '',
        \`website\` VARCHAR(512) NOT NULL DEFAULT '',
        \`sort\` INT NOT NULL DEFAULT 0,
        INDEX \`protocol_sort_idx\` (\`sort\`),
        INDEX \`protocol_level_idx\` (\`level\`)
      )
    `);
  }

  console.log("\n[4/5] Header menüsüne 'Kumru Protokolü' linki");
  const existingHeader = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.blockKey, "header.config"))
    .limit(1);
  if (existingHeader.length) {
    type HeaderMenuItem = {
      label: string;
      href: string;
      enabled?: boolean;
      children?: { label: string; href: string; enabled?: boolean }[];
    };
    type HeaderCfg = {
      topBar?: unknown;
      menu: HeaderMenuItem[];
      ctaButton?: unknown;
    };
    let cfg = existingHeader[0].data as HeaderCfg | string;
    if (typeof cfg === "string") {
      try {
        cfg = JSON.parse(cfg) as HeaderCfg;
      } catch {
        console.log("  • header.config parse hatası, atlanıyor");
        cfg = null as unknown as HeaderCfg;
      }
    }
    if (cfg && Array.isArray(cfg.menu)) {
      const hasProtokol = cfg.menu.some(
        (m: HeaderMenuItem) => m.href === "/kumru-protokolu",
      );
      if (hasProtokol) {
        console.log("  • header.config içinde zaten Kumru Protokolü var, atlanıyor");
      } else {
        // Yönetim'in hemen yanına ekleyelim — protokol benzer içerik olduğu için.
        const yonetimIdx = cfg.menu.findIndex(
          (m: HeaderMenuItem) => m.href === "/yonetim",
        );
        const insertAt =
          yonetimIdx >= 0 ? yonetimIdx + 1 : cfg.menu.length;
        cfg.menu.splice(insertAt, 0, {
          label: "Kumru Protokolü",
          href: "/kumru-protokolu",
          enabled: true,
        });
        await db
          .update(pageBlocks)
          .set({ data: cfg, updatedAt: new Date() })
          .where(eq(pageBlocks.blockKey, "header.config"));
        console.log("  • header.config güncellendi (Kumru Protokolü eklendi)");
      }
    } else {
      console.log("  • header.config beklenmedik formatta, atlanıyor");
    }
  } else {
    console.log("  • header.config yok, atlanıyor (uygulama defaults'tan üretir)");
  }

  console.log("\n[5/5] page.headers.protokol varsayılan başlığı");
  const headersRow = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.blockKey, "page.headers"))
    .limit(1);
  if (headersRow.length) {
    let data = headersRow[0].data as Record<string, unknown> | string;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data) as Record<string, unknown>;
      } catch {
        console.log("  • page.headers parse hatası, atlanıyor");
        data = null as unknown as Record<string, unknown>;
      }
    }
    if (data && typeof data === "object") {
      if ((data as Record<string, unknown>).protokol) {
        console.log("  • page.headers.protokol zaten var, atlanıyor");
      } else {
        (data as Record<string, unknown>).protokol = {
          title: "Kumru Protokolü",
          description:
            "Derneğimize destek veren resmi kurum yetkililerini ve protokol üyelerini burada listeliyoruz.",
        };
        await db
          .update(pageBlocks)
          .set({ data, updatedAt: new Date() })
          .where(eq(pageBlocks.blockKey, "page.headers"));
        console.log("  • page.headers güncellendi");
      }
    }
  } else {
    console.log("  • page.headers yok, atlanıyor (uygulama defaults'tan üretir)");
  }

  console.log("\n✓ Kumru Protokolü migration tamamlandı.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n✗ Migration hatası:", err);
    process.exit(1);
  });
