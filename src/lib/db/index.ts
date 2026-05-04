import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

declare global {
   
  var __dernekDbPool: mysql.Pool | undefined;
}

function makePool() {
  const url = process.env.DATABASE_URL;
  // SSL kararı:
  // - DATABASE_SSL=true|false ile manuel zorlanabilir.
  // - DATABASE_URL kullanılıyorsa varsayılan AÇIK (TiDB Cloud/PlanetScale gibi
  //   bulut sağlayıcılarının tamamı TLS gerektirir).
  // - Yerel host (127.0.0.1/localhost) için varsayılan KAPALI.
  const sslEnv = (process.env.DATABASE_SSL ?? "").toLowerCase();
  const localHosts = new Set([
    "127.0.0.1",
    "localhost",
    "::1",
    "0.0.0.0",
  ]);
  const fallbackHost = process.env.DB_HOST ?? "127.0.0.1";
  const remote = url
    ? true
    : !localHosts.has(fallbackHost.toLowerCase());
  const useSSL =
    sslEnv === "true" || sslEnv === "1"
      ? true
      : sslEnv === "false" || sslEnv === "0"
        ? false
        : remote;

  if (url) {
    return mysql.createPool({
      uri: url,
      ssl: useSSL ? { rejectUnauthorized: true } : undefined,
      // Serverless ortamda her instance kendi pool'unu açar, düşük tutuyoruz.
      connectionLimit: Number(process.env.DB_POOL_SIZE ?? 5),
      waitForConnections: true,
      dateStrings: false,
      timezone: "Z",
    });
  }
  return mysql.createPool({
    host: fallbackHost,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "dernek",
    ssl: useSSL ? { rejectUnauthorized: true } : undefined,
    connectionLimit: Number(process.env.DB_POOL_SIZE ?? 10),
    waitForConnections: true,
    dateStrings: false,
    timezone: "Z",
  });
}

const pool = global.__dernekDbPool ?? makePool();
if (process.env.NODE_ENV !== "production") {
  global.__dernekDbPool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
