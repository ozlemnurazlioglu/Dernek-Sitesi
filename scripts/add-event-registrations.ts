/**
 * Bir kerelik migrasyon: etkinlik kayıt sistemi.
 *
 * Yaptıkları:
 *   1. `event_registrations` tablosunu CREATE TABLE IF NOT EXISTS ile oluşturur.
 *   2. Mevcut `events.registered` değerlerini olduğu gibi bırakır (eski demo
 *      sayıları korunur; gerçek üye kayıtları bunun üzerine eklenecek).
 *   3. `page_blocks.ui.common` JSON bloğunda yeni etkinlik metinlerini ekler:
 *        - events.freeNote = "" (artık gösterilmiyor)
 *        - events.loginRequiredTitle / loginRequiredMessage
 *        - events.fullButton / cancelButton
 *        - events.cancelSuccessTitle / cancelSuccessMessage
 *      Sadece eksik veya eski değer içeren alanlar değiştirilir; admin'in elle
 *      yazdığı yeni metinler korunur.
 *
 * İdempotenttir; defalarca çalıştırılabilir.
 *
 * Kullanım:
 *   npx tsx scripts/add-event-registrations.ts
 */
import { config as loadEnv } from "dotenv";

const NEW_LOGIN_TITLE = "Üye girişi gerekli";
const NEW_LOGIN_MSG =
  "Etkinliğe kayıt olmak için önce üye girişi yapmanız gerekmektedir.";
const NEW_FULL_BTN = "Kontenjan Doldu";
const NEW_CANCEL_BTN = "Kaydı İptal Et";
const NEW_CANCEL_TITLE = "Kaydınız iptal edildi";
const NEW_CANCEL_MSG =
  "Etkinlik kaydınız başarıyla iptal edildi. Dilerseniz tekrar kayıt olabilirsiniz.";

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

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const { sql } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");

  // 1) event_registrations tablosu
  console.log("→ event_registrations tablosu hazırlanıyor (CREATE IF NOT EXISTS)...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id VARCHAR(64) NOT NULL,
      event_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      created_at DATETIME(3) NOT NULL,
      PRIMARY KEY (id),
      INDEX event_registrations_event_idx (event_id),
      INDEX event_registrations_user_idx (user_id),
      UNIQUE INDEX event_registrations_event_user_uq (event_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✓ event_registrations hazır.");

  // 2) ui.common metinlerini güncelle
  console.log("→ ui.common metinleri güncelleniyor...");
  const rows = await rowsOf(
    await db.execute(
      sql`SELECT block_key, data FROM page_blocks WHERE block_key = 'ui.common'`,
    ),
  );

  if (rows.length === 0) {
    console.log("ℹ ui.common bloğu yok, defaults kullanılacak (atlanıyor).");
    process.exit(0);
  }

  const row = rows[0] as { data: unknown };
  let parsed: Record<string, unknown>;
  if (typeof row.data === "string") {
    try {
      parsed = JSON.parse(row.data);
    } catch {
      console.error("✗ ui.common.data parse edilemedi.");
      process.exit(1);
    }
  } else if (row.data && typeof row.data === "object") {
    parsed = { ...(row.data as Record<string, unknown>) };
  } else {
    console.log("ℹ ui.common.data boş.");
    process.exit(0);
  }

  let changed = false;
  const events = (parsed.events ?? {}) as Record<string, unknown>;

  // freeNote: eskiden "Ücretsiz · Üyelere ücretsiz" idi → boşalt.
  // Admin başka bir not yazmışsa ona dokunma.
  if (
    typeof events.freeNote === "string" &&
    /^.cretsiz/i.test(events.freeNote)
  ) {
    console.log("  · events.freeNote temizleniyor");
    events.freeNote = "";
    changed = true;
  }

  // Yeni alanlar yoksa ekle.
  if (typeof events.loginRequiredTitle !== "string") {
    events.loginRequiredTitle = NEW_LOGIN_TITLE;
    changed = true;
  }
  if (typeof events.loginRequiredMessage !== "string") {
    events.loginRequiredMessage = NEW_LOGIN_MSG;
    changed = true;
  }
  if (typeof events.fullButton !== "string") {
    events.fullButton = NEW_FULL_BTN;
    changed = true;
  }
  if (typeof events.cancelButton !== "string") {
    events.cancelButton = NEW_CANCEL_BTN;
    changed = true;
  }
  if (typeof events.cancelSuccessTitle !== "string") {
    events.cancelSuccessTitle = NEW_CANCEL_TITLE;
    changed = true;
  }
  if (typeof events.cancelSuccessMessage !== "string") {
    events.cancelSuccessMessage = NEW_CANCEL_MSG;
    changed = true;
  }

  if (!changed) {
    console.log("✓ ui.common.events zaten güncel.");
    process.exit(0);
  }

  parsed.events = events;
  const newJson = JSON.stringify(parsed);
  await db.execute(
    sql`UPDATE page_blocks SET data = ${newJson}, updated_at = NOW(3) WHERE block_key = 'ui.common'`,
  );
  console.log("✓ ui.common.events güncellendi.");
  process.exit(0);
}

main().catch((e) => {
  console.error("add-event-registrations failed:", e);
  process.exit(1);
});
