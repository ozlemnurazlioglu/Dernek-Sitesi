import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";

// .env.local önceliklidir; yoksa .env'e bak
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const url =
  process.env.DATABASE_URL ??
  `mysql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? ""}@${process.env.DB_HOST ?? "127.0.0.1"}:${process.env.DB_PORT ?? "3306"}/${process.env.DB_NAME ?? "dernek"}`;

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
} satisfies Config;
