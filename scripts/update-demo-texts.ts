/**
 * Bir kerelik içerik migrasyonu: `page_blocks` üzerindeki `ui.common` JSON
 * bloğundaki "demo" metinlerini production metinleriyle değiştirir.
 *
 *   - events.bookSuccessMessage  → "Etkinliğe kaydınız oluşturuldu..."
 *   - account.profileTipNote     → ""
 *   - donation.submitToastMessage → "Online ödeme entegrasyonu..."
 *
 * İdempotenttir; sadece eski string'i barındıran kayıtları günceller.
 *
 * Kullanım:
 *   npx tsx scripts/update-demo-texts.ts
 */
import { config as loadEnv } from "dotenv";

const NEW_BOOK_SUCCESS =
  "Etkinliğe kaydınız oluşturuldu. Yetkililerimiz gerektiğinde sizinle iletişime geçecektir.";
const NEW_DONATION_TOAST =
  "Online ödeme entegrasyonu henüz aktif değil. IBAN üzerinden havale ile bağış yapabilirsiniz.";

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

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();
  const { sql } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");

  const rows = await rowsOf(
    await db.execute(
      sql`SELECT block_key, data FROM page_blocks WHERE block_key = 'ui.common'`,
    ),
  );

  if (rows.length === 0) {
    console.log("ℹ ui.common bloğu yok, yapılacak iş yok.");
    process.exit(0);
  }

  const row = rows[0] as { block_key: string; data: unknown };
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
  if (typeof events.bookSuccessMessage === "string" && events.bookSuccessMessage !== NEW_BOOK_SUCCESS) {
    console.log(`→ events.bookSuccessMessage güncelleniyor`);
    events.bookSuccessMessage = NEW_BOOK_SUCCESS;
    parsed.events = events;
    changed = true;
  }

  const account = (parsed.account ?? {}) as Record<string, unknown>;
  if (typeof account.profileTipNote === "string" && account.profileTipNote !== "") {
    console.log(`→ account.profileTipNote temizleniyor`);
    account.profileTipNote = "";
    parsed.account = account;
    changed = true;
  }

  const donation = (parsed.donation ?? {}) as Record<string, unknown>;
  if (typeof donation.submitToastMessage === "string" && donation.submitToastMessage !== NEW_DONATION_TOAST) {
    console.log(`→ donation.submitToastMessage güncelleniyor`);
    donation.submitToastMessage = NEW_DONATION_TOAST;
    parsed.donation = donation;
    changed = true;
  }

  if (!changed) {
    console.log("✓ Tüm metinler zaten güncel, yapılacak iş yok.");
    process.exit(0);
  }

  const newJson = JSON.stringify(parsed);
  await db.execute(
    sql`UPDATE page_blocks SET data = ${newJson}, updated_at = NOW(3) WHERE block_key = 'ui.common'`,
  );

  console.log("✓ Tamamlandı.");
  process.exit(0);
}

main().catch((e) => {
  console.error("update-demo-texts failed:", e);
  process.exit(1);
});
