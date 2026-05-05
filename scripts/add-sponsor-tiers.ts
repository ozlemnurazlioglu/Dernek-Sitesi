/**
 * Bir kerelik elle çalıştırılan migration: sponsor_tiers tablosunu kurar
 * ve sponsors tablosuna tier_slug kolonunu ekler. Idempotent — birden fazla
 * çalıştırılabilir.
 *
 * Kullanım:  npm run db:add-sponsor-tiers
 */
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";

async function tableExists(name: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_name = ${name}
  `)) as unknown as Array<Array<{ cnt: number }>>;
  // mysql2 driver Drizzle aracılığıyla [rows, fields] döndürür.
  const data = Array.isArray(rows[0]) ? rows[0] : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = ${table} AND column_name = ${column}
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0]) ? rows[0] : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
}

async function indexExists(table: string, indexName: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = ${table} AND index_name = ${indexName}
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0]) ? rows[0] : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
}

async function main() {
  console.log("→ Sponsor türleri migration'ı başlatılıyor…");

  if (!(await tableExists("sponsor_tiers"))) {
    console.log("  • sponsor_tiers tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`sponsor_tiers\` (
        \`id\` varchar(64) NOT NULL,
        \`slug\` varchar(80) NOT NULL,
        \`name\` varchar(191) NOT NULL,
        \`color\` varchar(32) NOT NULL DEFAULT 'slate',
        \`sort\` int NOT NULL DEFAULT 0,
        CONSTRAINT \`sponsor_tiers_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`sponsor_tiers_slug_unique\` UNIQUE(\`slug\`)
      )
    `);
  } else {
    console.log("  • sponsor_tiers tablosu zaten var, atlanıyor");
  }

  if (!(await indexExists("sponsor_tiers", "sponsor_tiers_sort_idx"))) {
    console.log("  • sponsor_tiers.sort indeksi ekleniyor");
    await db.execute(
      sql`CREATE INDEX \`sponsor_tiers_sort_idx\` ON \`sponsor_tiers\` (\`sort\`)`,
    );
  }

  if (!(await columnExists("sponsors", "tier_slug"))) {
    console.log("  • sponsors.tier_slug kolonu ekleniyor");
    await db.execute(sql`
      ALTER TABLE \`sponsors\` ADD \`tier_slug\` varchar(80) NOT NULL DEFAULT ''
    `);
  } else {
    console.log("  • sponsors.tier_slug zaten var, atlanıyor");
  }

  if (!(await indexExists("sponsors", "sponsors_tier_idx"))) {
    console.log("  • sponsors.tier_slug indeksi ekleniyor");
    await db.execute(
      sql`CREATE INDEX \`sponsors_tier_idx\` ON \`sponsors\` (\`tier_slug\`)`,
    );
  }

  console.log("→ Varsayılan sponsor türleri ekleniyor (yoksa)…");
  const defaults: Array<{
    id: string;
    slug: string;
    name: string;
    color: string;
    sort: number;
  }> = [
    { id: "st-platin", slug: "platin", name: "Platin", color: "platinum", sort: 10 },
    { id: "st-altin", slug: "altin", name: "Altın", color: "gold", sort: 20 },
    { id: "st-gumus", slug: "gumus", name: "Gümüş", color: "silver", sort: 30 },
    { id: "st-bronz", slug: "bronz", name: "Bronz", color: "bronze", sort: 40 },
  ];
  for (const t of defaults) {
    await db.execute(sql`
      INSERT IGNORE INTO \`sponsor_tiers\` (\`id\`, \`slug\`, \`name\`, \`color\`, \`sort\`)
      VALUES (${t.id}, ${t.slug}, ${t.name}, ${t.color}, ${t.sort})
    `);
  }

  console.log("✓ Tamam. Sponsor türleri kuruldu.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
