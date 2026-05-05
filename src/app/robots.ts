import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin paneli, API uçları, kullanıcıya özel hesap sayfası ve auth
        // formları arama motorlarınca indekslenmesin.
        disallow: ["/admin", "/api", "/hesabim", "/giris", "/kayit"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
