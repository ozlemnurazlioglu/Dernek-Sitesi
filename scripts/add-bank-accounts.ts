/**
 * Bir kerelik migration:
 *   1. `bank_accounts` tablosunu oluşturur (CREATE TABLE IF NOT EXISTS).
 *   2. `site_settings` üzerindeki eski `bank_*` kolonlardan tek hesabı
 *      `bank_accounts`'a "Genel Bağış Hesabı" başlığıyla aktarır
 *      (bank_accounts boşsa ve eski kolonlarda IBAN ya da Hesap Sahibi varsa).
 *   3. `site_settings.bank_*` kolonlarını DROP eder (artık uygulamada
 *      kullanılmıyor; aksi halde Drizzle INSERT'leri NOT NULL constraint
 *      yüzünden hata verirdi).
 *
 * İdempotenttir; tüm adımlar mevcut durumu kontrol eder.
 *
 * Kullanım:
 *   npx tsx scripts/add-bank-accounts.ts
 */
import { config as loadEnv } from "dotenv";

type Db = typeof import("../src/lib/db").db;
type Sql = typeof import("drizzle-orm").sql;

async function rowsOf(result: unknown): Promise<unknown[]> {
  // Drizzle MySQL2 execute returns [rows, fields] tuple (native mysql2);
  // some drivers return the rows array directly, and a few wrap them
  // in `{ rows }`. Cover all three.
  if (Array.isArray(result)) {
    const first = (result as unknown[])[0];
    if (Array.isArray(first)) return first as unknown[];
    return result as unknown[];
  }
  if (result && typeof result === "object" && "rows" in result) {
    const r = (result as { rows?: unknown[] }).rows;
    return Array.isArray(r) ? r : [];
  }
  return [];
}

async function columnExists(
  db: Db,
  sql: Sql,
  table: string,
  column: string,
): Promise<boolean> {
  const r = await db.execute(
    sql`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ${table}
          AND COLUMN_NAME = ${column}`,
  );
  return (await rowsOf(r)).length > 0;
}

function pickField(row: Record<string, unknown>, ...names: string[]): string {
  for (const n of names) {
    const v = row[n];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const { sql } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");

  // 1) bank_accounts tablosunu oluştur (idempotent — IF NOT EXISTS).
  //    INFORMATION_SCHEMA bazen güvenilmez (TiDB cache), bu yüzden direkt
  //    CREATE TABLE IF NOT EXISTS kullanıyoruz.
  console.log("→ bank_accounts tablosu hazırlanıyor (CREATE IF NOT EXISTS)...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id VARCHAR(64) NOT NULL,
      label VARCHAR(191) NOT NULL,
      bank_name VARCHAR(191) NOT NULL DEFAULT '',
      bank_branch VARCHAR(191) NOT NULL DEFAULT '',
      account_holder VARCHAR(191) NOT NULL DEFAULT '',
      iban VARCHAR(64) NOT NULL DEFAULT '',
      note VARCHAR(500) NOT NULL DEFAULT '',
      sort INT NOT NULL DEFAULT 0,
      PRIMARY KEY (id),
      INDEX bank_accounts_sort_idx (sort)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 2) Tablo boşsa, site_settings'teki eski hesabı taşı
  const countRows = await rowsOf(
    await db.execute(sql`SELECT COUNT(*) AS c FROM bank_accounts`),
  );
  const currentCount = Number(
    (countRows[0] as Record<string, unknown> | undefined)?.c ?? 0,
  );

  if (currentCount === 0) {
    const hasOldBankName = await columnExists(
      db,
      sql,
      "site_settings",
      "bank_name",
    );
    if (hasOldBankName) {
      const settingsRows = await rowsOf(
        await db.execute(sql`SELECT * FROM site_settings LIMIT 1`),
      );
      const settings = settingsRows[0] as Record<string, unknown> | undefined;
      if (settings) {
        const bankName = pickField(settings, "bank_name", "bankName");
        const bankBranch = pickField(settings, "bank_branch", "bankBranch");
        const accountHolder = pickField(
          settings,
          "bank_account_holder",
          "bankAccountHolder",
        );
        const iban = pickField(settings, "bank_iban", "bankIban");

        if (bankName || iban || accountHolder) {
          console.log("→ Eski banka hesabı bank_accounts'a taşınıyor...");
          await db.execute(sql`
            INSERT INTO bank_accounts
              (id, label, bank_name, bank_branch, account_holder, iban, note, sort)
            VALUES
              ('bk-genel', 'Genel Bağış Hesabı', ${bankName}, ${bankBranch},
               ${accountHolder}, ${iban}, '', 10)
          `);
        } else {
          console.log("ℹ Eski site_settings.bank_* alanları boş, taşıma atlandı.");
        }
      }
    }
  } else {
    console.log(`✓ bank_accounts zaten ${currentCount} kayıt içeriyor, taşıma atlandı.`);
  }

  // 3) site_settings.bank_* kolonlarını DROP et (artık uygulama kullanmıyor;
  //    NOT NULL olduklarından bırakılırsa Drizzle INSERT'leri patlar)
  for (const col of ["bank_name", "bank_branch", "bank_account_holder", "bank_iban"]) {
    if (await columnExists(db, sql, "site_settings", col)) {
      console.log(`→ site_settings.${col} kaldırılıyor...`);
      // Identifier'ı doğrudan template literal ile (SQL injection değil; sabit liste).
      await db.execute(
        sql.raw(`ALTER TABLE site_settings DROP COLUMN \`${col}\``),
      );
    }
  }

  console.log("✓ Tamamlandı.");
  process.exit(0);
}

main().catch((e) => {
  console.error("add-bank-accounts failed:", e);
  process.exit(1);
});
