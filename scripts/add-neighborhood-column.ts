import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("→ applications tablosuna 'neighborhood' sütunu ekleniyor...");
  try {
    await db.execute(sql`ALTER TABLE applications ADD COLUMN neighborhood VARCHAR(191) NULL;`);
    console.log("✓ Sütun başarıyla eklendi.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Duplicate column name")) {
      console.log("⚠ Sütun zaten mevcut, işlem atlanıyor.");
    } else {
      console.error("✗ Beklenmedik hata:", err);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
