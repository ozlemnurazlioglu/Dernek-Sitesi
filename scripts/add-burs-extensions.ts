/**
 * Burs sistemi genişletme migration'ı (11 madde + Y1/Y2/Y3 paketi).
 *
 * Idempotent — birden fazla çalıştırılabilir, zaten var olan kolon/tabloları
 * sessizce atlar.
 *
 * Yaptıkları:
 *   1. `applications.status` enum'una `needs_update` değerini ekler
 *   2. `applications` tablosuna 10 yeni kolon ekler:
 *        - failedCourses, expectedGradYear (madde 6, 9)
 *        - referenceName/Phone/Relation + parentReferenceName/Phone (madde 5)
 *        - kvkkConsentAt (madde 8)
 *        - autoRejectedReason (madde 7)
 *        - updateRequest (Y1 — needs_update flow)
 *   3. `applications` tablosuna nationalId index ekler (madde 7 hızlı sorgu)
 *   4. `alumni` tablosunu oluşturur (madde 11)
 *   5. `notification_settings` tablosunu oluşturur (Y2)
 *
 * Kullanım:  npm run db:add-burs-extensions
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

async function indexExists(table: string, indexName: string): Promise<boolean> {
  const rows = (await db.execute(sql`
    SELECT COUNT(*) AS cnt FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = ${table} AND index_name = ${indexName}
  `)) as unknown as Array<Array<{ cnt: number }>>;
  const data = Array.isArray(rows[0])
    ? rows[0]
    : (rows as unknown as { cnt: number }[]);
  return Number((data[0] as { cnt: number })?.cnt ?? 0) > 0;
}

/**
 * Mevcut `status` kolonunun enum tanımını alır ve `needs_update` değeri
 * eksikse ekler. MySQL'de enum genişletmek için MODIFY COLUMN gerekiyor.
 */
async function ensureStatusEnumNeedsUpdate(): Promise<void> {
  const rows = (await db.execute(sql`
    SELECT COLUMN_TYPE FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'applications'
      AND column_name = 'status'
  `)) as unknown as Array<Array<{ COLUMN_TYPE: string }>>;
  const data = Array.isArray(rows[0])
    ? rows[0]
    : (rows as unknown as { COLUMN_TYPE: string }[]);
  const colType = (data[0] as { COLUMN_TYPE?: string })?.COLUMN_TYPE ?? "";

  if (colType.includes("needs_update")) {
    console.log("  • status enum 'needs_update' içeriyor, atlanıyor");
    return;
  }

  console.log("  • status enum'a 'needs_update' ekleniyor");
  await db.execute(sql`
    ALTER TABLE \`applications\`
    MODIFY COLUMN \`status\` ENUM('submitted','in_review','approved','rejected','needs_update')
    NOT NULL DEFAULT 'submitted'
  `);
}

async function addColumnIfMissing(
  table: string,
  column: string,
  ddl: string,
): Promise<void> {
  if (await columnExists(table, column)) {
    console.log(`  • ${table}.${column} zaten var, atlanıyor`);
    return;
  }
  console.log(`  • ${table}.${column} ekleniyor`);
  await db.execute(sql.raw(`ALTER TABLE \`${table}\` ADD ${ddl}`));
}

async function addIndexIfMissing(
  table: string,
  indexName: string,
  columns: string,
): Promise<void> {
  if (await indexExists(table, indexName)) {
    console.log(`  • ${table}.${indexName} index zaten var, atlanıyor`);
    return;
  }
  console.log(`  • ${table}.${indexName} index ekleniyor`);
  await db.execute(
    sql.raw(`CREATE INDEX \`${indexName}\` ON \`${table}\` (${columns})`),
  );
}

async function main() {
  console.log("→ Burs sistemi genişletme migration'ı başlatılıyor…\n");

  console.log("[1/5] applications.status enum genişletme");
  await ensureStatusEnumNeedsUpdate();

  console.log("\n[2/5] applications tablosuna 10 yeni kolon");
  await addColumnIfMissing(
    "applications",
    "failed_courses",
    "`failed_courses` INT NOT NULL DEFAULT 0",
  );
  await addColumnIfMissing(
    "applications",
    "expected_grad_year",
    "`expected_grad_year` INT NULL",
  );
  await addColumnIfMissing(
    "applications",
    "reference_name",
    "`reference_name` VARCHAR(191) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "applications",
    "reference_phone",
    "`reference_phone` VARCHAR(64) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "applications",
    "reference_relation",
    "`reference_relation` VARCHAR(80) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "applications",
    "parent_reference_name",
    "`parent_reference_name` VARCHAR(191) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "applications",
    "parent_reference_phone",
    "`parent_reference_phone` VARCHAR(64) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "applications",
    "kvkk_consent_at",
    "`kvkk_consent_at` DATETIME(3) NULL",
  );
  await addColumnIfMissing(
    "applications",
    "auto_rejected_reason",
    "`auto_rejected_reason` VARCHAR(255) NOT NULL DEFAULT ''",
  );
  await addColumnIfMissing(
    "applications",
    "update_request",
    "`update_request` TEXT NULL",
  );

  console.log("\n[3/5] applications.national_id index");
  await addIndexIfMissing(
    "applications",
    "applications_national_id_idx",
    "`national_id`",
  );

  console.log("\n[4/5] alumni tablosu");
  if (!(await tableExists("alumni"))) {
    console.log("  • alumni tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`alumni\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`full_name\` VARCHAR(191) NOT NULL,
        \`national_id\` VARCHAR(32) NOT NULL DEFAULT '',
        \`email\` VARCHAR(191) NOT NULL DEFAULT '',
        \`phone\` VARCHAR(64) NOT NULL DEFAULT '',
        \`school_name\` VARCHAR(191) NOT NULL DEFAULT '',
        \`department\` VARCHAR(191) NOT NULL DEFAULT '',
        \`graduation_year\` INT NULL,
        \`parent_name\` VARCHAR(191) NOT NULL DEFAULT '',
        \`parent_phone\` VARCHAR(64) NOT NULL DEFAULT '',
        \`parent_relation\` VARCHAR(80) NOT NULL DEFAULT '',
        \`notes\` TEXT NULL,
        \`source_application_id\` VARCHAR(64) NULL,
        \`created_at\` DATETIME(3) NOT NULL,
        INDEX \`alumni_full_name_idx\` (\`full_name\`),
        INDEX \`alumni_national_id_idx\` (\`national_id\`),
        INDEX \`alumni_school_idx\` (\`school_name\`)
      )
    `);
  } else {
    console.log("  • alumni tablosu zaten var, atlanıyor");
  }

  console.log("\n[5/5] notification_settings tablosu");
  if (!(await tableExists("notification_settings"))) {
    console.log("  • notification_settings tablosu oluşturuluyor");
    await db.execute(sql`
      CREATE TABLE \`notification_settings\` (
        \`id\` VARCHAR(16) NOT NULL PRIMARY KEY DEFAULT 'main',
        \`email_enabled\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`smtp_host\` VARCHAR(191) NOT NULL DEFAULT '',
        \`smtp_port\` INT NOT NULL DEFAULT 587,
        \`smtp_secure\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`smtp_user\` VARCHAR(191) NOT NULL DEFAULT '',
        \`smtp_pass\` VARCHAR(191) NOT NULL DEFAULT '',
        \`smtp_from\` VARCHAR(191) NOT NULL DEFAULT '',
        \`sms_enabled\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`sms_provider\` VARCHAR(32) NOT NULL DEFAULT '',
        \`sms_user\` VARCHAR(191) NOT NULL DEFAULT '',
        \`sms_pass\` VARCHAR(191) NOT NULL DEFAULT '',
        \`sms_header\` VARCHAR(32) NOT NULL DEFAULT '',
        \`sms_api_key\` VARCHAR(255) NOT NULL DEFAULT '',
        \`sms_api_secret\` VARCHAR(255) NOT NULL DEFAULT '',
        \`sms_from_number\` VARCHAR(32) NOT NULL DEFAULT '',
        \`templates\` JSON NULL,
        \`updated_at\` DATETIME(3) NOT NULL
      )
    `);

    // Default singleton satırı oluştur (id='main').
    console.log("  • notification_settings.main default satırı oluşturuluyor");
    await db.execute(sql`
      INSERT INTO \`notification_settings\` (\`id\`, \`updated_at\`)
      VALUES ('main', NOW(3))
    `);
  } else {
    console.log("  • notification_settings tablosu zaten var, atlanıyor");
    // Singleton satır yoksa ekle (idempotent).
    const rows = (await db.execute(sql`
      SELECT COUNT(*) AS cnt FROM notification_settings WHERE id = 'main'
    `)) as unknown as Array<Array<{ cnt: number }>>;
    const data = Array.isArray(rows[0])
      ? rows[0]
      : (rows as unknown as { cnt: number }[]);
    const cnt = Number((data[0] as { cnt: number })?.cnt ?? 0);
    if (cnt === 0) {
      console.log("  • notification_settings.main satırı yok, ekleniyor");
      await db.execute(sql`
        INSERT INTO \`notification_settings\` (\`id\`, \`updated_at\`)
        VALUES ('main', NOW(3))
      `);
    }
  }

  console.log("\n✓ Tüm migration adımları tamamlandı.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n✗ Migration hatası:", err);
    process.exit(1);
  });
