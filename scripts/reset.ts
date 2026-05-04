import { db, schema } from "../src/lib/db";
import { clearContentTables } from "../src/lib/seed-content-runner";

async function main() {
  console.log("→ Tüm tablolar temizleniyor...");
  await db.delete(schema.sessions);
  await db.delete(schema.applicationDocuments);
  await db.delete(schema.applications);
  await db.delete(schema.messages);
  await db.delete(schema.events);
  await db.delete(schema.news);
  await db.delete(schema.users);
  await clearContentTables();
  console.log("✓ Tablolar temizlendi.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Reset hatası:", err);
    process.exit(1);
  });
