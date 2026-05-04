import { config as loadEnv } from "dotenv";
import type { Config } from "drizzle-kit";

// .env.local önceliklidir; yoksa .env'e bak
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

// Drizzle-kit, URL + ssl kombinasyonunu sağlam uygulamadığı için
// connection bilgilerini ayrı alanlara parse ediyoruz.
const databaseUrl = process.env.DATABASE_URL;
const fallbackUrl = `mysql://${process.env.DB_USER ?? "root"}:${process.env.DB_PASSWORD ?? ""}@${process.env.DB_HOST ?? "127.0.0.1"}:${process.env.DB_PORT ?? "3306"}/${process.env.DB_NAME ?? "dernek"}`;
const u = new URL(databaseUrl ?? fallbackUrl);

const sslEnv = (process.env.DATABASE_SSL ?? "").toLowerCase();
const useSSL =
  sslEnv === "true" || sslEnv === "1"
    ? true
    : sslEnv === "false" || sslEnv === "0"
      ? false
      : Boolean(databaseUrl) ||
        /tidbcloud|psdb\.cloud|aiven|planetscale/.test(u.host);

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "") || "dernek",
    ssl: useSSL ? { rejectUnauthorized: true } : undefined,
  },
  verbose: true,
  strict: true,
} satisfies Config;
