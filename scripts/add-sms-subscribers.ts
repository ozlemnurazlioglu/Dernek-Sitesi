/**
 * Bir kerelik migration:
 *   1. `sms_subscribers` tablosunu CREATE TABLE IF NOT EXISTS ile kurar.
 *   2. `page_blocks` içindeki `home.sms_section` kaydını yoksa varsayılan
 *      değerlerle ekler (varsa dokunmaz — admin tarafında yapılan
 *      özelleştirmelerin üzerine yazılmaz).
 *   3. `page_blocks` içindeki `home.layout` JSON'unda `sms_subscribe`
 *      blok'u eksikse listenin sonuna `enabled: true` olarak ekler.
 *      `home.layout` hiç yoksa hiçbir şey yapmaz; uygulamadaki
 *      `mergeHomeLayout` zaten varsayılan layout'a düşer.
 *
 * İdempotenttir; tüm adımlar mevcut durumu kontrol eder.
 *
 * Kullanım:
 *   npx tsx scripts/add-sms-subscribers.ts
 */
import { config as loadEnv } from "dotenv";

type Db = typeof import("../src/lib/db").db;
type Sql = typeof import("drizzle-orm").sql;

async function rowsOf(result: unknown): Promise<unknown[]> {
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

const DEFAULT_SMS_SECTION = {
  eyebrow: "Bilgilendirme",
  title: "SMS aboneliği",
  description:
    "Etkinlik, duyuru ve önemli haberlerden ilk siz haberdar olun. Numaranızı bırakın, sadece dernek bilgilendirme mesajlarımızı gönderelim.",
  phonePlaceholder: "5XX XXX XX XX",
  buttonLabel: "Abone Ol",
  consentLabel: "{kvkk}'yı okudum, onaylıyorum.",
  consentLinkLabel: "KVKK Aydınlatma Metni",
  successMessage:
    "Aboneliğiniz alındı. Bilgilendirme mesajlarımız sizinle olacak.",
  alreadyMessage:
    "Bu numara zaten abone listemizde. Tekrar kayıt yapmanıza gerek yok.",
  invalidMessage:
    "Lütfen geçerli bir TR cep telefonu numarası girin (5XX XXX XX XX).",
  consentRequiredMessage:
    "Devam edebilmek için KVKK Aydınlatma Metni'ni onaylamanız gerekir.",
};

async function ensureTable(db: Db, sql: Sql) {
  console.log("→ sms_subscribers tablosu kontrol ediliyor...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sms_subscribers (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      phone VARCHAR(16) NOT NULL,
      consent_at DATETIME(3) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      ip VARCHAR(64) NOT NULL DEFAULT '',
      user_agent VARCHAR(255) NOT NULL DEFAULT '',
      UNIQUE KEY sms_subscribers_phone_uq (phone),
      KEY sms_subscribers_created_idx (created_at)
    ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✓ sms_subscribers tablosu hazır.");
}

async function ensureSmsSection(db: Db, sql: Sql) {
  console.log("→ page_blocks.home.sms_section kontrol ediliyor...");
  const existing = await db.execute(
    sql`SELECT block_key FROM page_blocks WHERE block_key = 'home.sms_section' LIMIT 1`,
  );
  if ((await rowsOf(existing)).length > 0) {
    console.log("✓ home.sms_section zaten mevcut, dokunulmadı.");
    return;
  }
  console.log("→ home.sms_section ekleniyor (varsayılan metinler)...");
  const json = JSON.stringify(DEFAULT_SMS_SECTION);
  await db.execute(
    sql`INSERT INTO page_blocks (block_key, data, updated_at)
        VALUES ('home.sms_section', ${json}, NOW(3))`,
  );
  console.log("✓ home.sms_section eklendi.");
}

async function ensureSmsBlockInLayout(db: Db, sql: Sql) {
  console.log("→ page_blocks.home.layout içinde sms_subscribe kontrol...");
  const layoutRows = await rowsOf(
    await db.execute(
      sql`SELECT data FROM page_blocks WHERE block_key = 'home.layout' LIMIT 1`,
    ),
  );
  if (layoutRows.length === 0) {
    console.log(
      "ℹ home.layout hiç yok; uygulama varsayılan layout'a düşecek (sms_subscribe dahil).",
    );
    return;
  }
  const row = layoutRows[0] as { data?: unknown };
  let parsed: { items?: { id: string; enabled?: boolean }[] } | null = null;
  if (typeof row.data === "string") {
    try {
      parsed = JSON.parse(row.data);
    } catch {
      parsed = null;
    }
  } else if (row.data && typeof row.data === "object") {
    parsed = row.data as unknown as typeof parsed;
  }
  if (!parsed || !Array.isArray(parsed.items)) {
    console.log("ℹ home.layout JSON yapısı tanınmadı, atlanıyor.");
    return;
  }
  const has = parsed.items.some((i) => i?.id === "sms_subscribe");
  if (has) {
    console.log("✓ home.layout zaten sms_subscribe içeriyor.");
    return;
  }
  parsed.items.push({ id: "sms_subscribe", enabled: true });
  const updated = JSON.stringify(parsed);
  await db.execute(
    sql`UPDATE page_blocks SET data = ${updated}, updated_at = NOW(3)
        WHERE block_key = 'home.layout'`,
  );
  console.log("✓ home.layout sonuna sms_subscribe eklendi.");
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv({ path: ".env" });

  const { db } = await import("../src/lib/db");
  const { sql } = await import("drizzle-orm");

  await ensureTable(db, sql);
  await ensureSmsSection(db, sql);
  await ensureSmsBlockInLayout(db, sql);

  console.log("--- ALL DONE ---");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration başarısız:", err);
  process.exit(1);
});
