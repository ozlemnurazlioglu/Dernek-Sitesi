/**
 * Bir kerelik elle çalıştırılan migration: foto ve video galeri tablolarını
 * (`photo_categories`, `photos`, `video_categories`, `videos`) oluşturur.
 * Idempotent — birden fazla çalıştırılabilir, mevcutsa atlanır.
 *
 * Kullanım:  npm run db:add-galleries
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

async function main() {
  console.log("→ Galeri tabloları migration'ı başlatılıyor…");

  if (!(await tableExists("photo_categories"))) {
    console.log("  • photo_categories tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`photo_categories\` (
        \`id\` varchar(64) NOT NULL,
        \`slug\` varchar(80) NOT NULL,
        \`name\` varchar(191) NOT NULL,
        \`description\` varchar(500) NOT NULL DEFAULT '',
        \`cover_url\` varchar(512) NOT NULL DEFAULT '',
        \`sort\` int NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`photo_categories_slug_unique\` (\`slug\`),
        KEY \`photo_cats_sort_idx\` (\`sort\`)
      )
    `);
  } else {
    console.log("  • photo_categories zaten var, atlanıyor");
  }

  if (!(await tableExists("photos"))) {
    console.log("  • photos tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`photos\` (
        \`id\` varchar(64) NOT NULL,
        \`category_slug\` varchar(80) NOT NULL,
        \`title\` varchar(255) NOT NULL DEFAULT '',
        \`image_url\` varchar(512) NOT NULL,
        \`sort\` int NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`photos_cat_idx\` (\`category_slug\`),
        KEY \`photos_sort_idx\` (\`sort\`)
      )
    `);
  } else {
    console.log("  • photos zaten var, atlanıyor");
  }

  if (!(await tableExists("video_categories"))) {
    console.log("  • video_categories tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`video_categories\` (
        \`id\` varchar(64) NOT NULL,
        \`slug\` varchar(80) NOT NULL,
        \`name\` varchar(191) NOT NULL,
        \`description\` varchar(500) NOT NULL DEFAULT '',
        \`cover_url\` varchar(512) NOT NULL DEFAULT '',
        \`sort\` int NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`video_categories_slug_unique\` (\`slug\`),
        KEY \`video_cats_sort_idx\` (\`sort\`)
      )
    `);
  } else {
    console.log("  • video_categories zaten var, atlanıyor");
  }

  if (!(await tableExists("videos"))) {
    console.log("  • videos tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`videos\` (
        \`id\` varchar(64) NOT NULL,
        \`category_slug\` varchar(80) NOT NULL,
        \`title\` varchar(255) NOT NULL DEFAULT '',
        \`description\` varchar(1000) NOT NULL DEFAULT '',
        \`video_url\` varchar(512) NOT NULL,
        \`poster_url\` varchar(512) NOT NULL DEFAULT '',
        \`sort\` int NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        KEY \`videos_cat_idx\` (\`category_slug\`),
        KEY \`videos_sort_idx\` (\`sort\`)
      )
    `);
  } else {
    console.log("  • videos zaten var, atlanıyor");
  }

  // Varsayılan kategorileri seed et (sadece tablo yeni oluştuysa, atla
  // değilse; mevcut kategoriler kullanıcı tarafından düzenlenmiş olabilir).
  const photoCount = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM \`photo_categories\`
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const pcData = Array.isArray(photoCount[0])
    ? photoCount[0]
    : (photoCount as unknown as { cnt: number }[]);
  const pcEmpty = Number((pcData[0] as { cnt: number })?.cnt ?? 0) === 0;

  if (pcEmpty) {
    console.log("  • Varsayılan foto kategorileri ekleniyor");
    await db.execute(sql`
      INSERT IGNORE INTO \`photo_categories\` (\`id\`, \`slug\`, \`name\`, \`description\`, \`cover_url\`, \`sort\`) VALUES
        ('pc-merkez', 'dernek-merkezimiz', 'Dernek Merkezimiz', 'Dernek binamızdan ve mekanlarımızdan kareler.', '', 10),
        ('pc-yonetim', 'yonetimden', 'Yönetimden Fotoğraflar', 'Yönetim kurulu toplantıları ve etkinlikleri.', '', 20),
        ('pc-etkinlik', 'etkinliklerden', 'Etkinliklerden Kareler', 'Düzenlediğimiz etkinliklerden anlar.', '', 30)
    `);
  }

  const videoCount = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM \`video_categories\`
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const vcData = Array.isArray(videoCount[0])
    ? videoCount[0]
    : (videoCount as unknown as { cnt: number }[]);
  const vcEmpty = Number((vcData[0] as { cnt: number })?.cnt ?? 0) === 0;

  if (vcEmpty) {
    console.log("  • Varsayılan video kategorileri ekleniyor");
    await db.execute(sql`
      INSERT IGNORE INTO \`video_categories\` (\`id\`, \`slug\`, \`name\`, \`description\`, \`cover_url\`, \`sort\`) VALUES
        ('vc-tanitim', 'tanitim', 'Tanıtım Filmleri', 'Derneğimizi tanıtan kısa videolar.', '', 10),
        ('vc-etkinlik', 'etkinlik', 'Etkinlik Videoları', 'Etkinliklerimizden video kayıtlar.', '', 20)
    `);
  }

  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
