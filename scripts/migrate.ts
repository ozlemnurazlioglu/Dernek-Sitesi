import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "../src/lib/db";

async function main() {
  console.log("→ Migration uygulanıyor...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ Migration tamamlandı.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
