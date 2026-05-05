import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import {
  events,
  legalPages,
  news,
  photoCategories,
  videoCategories,
} from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Yeni bir sayfa/haber/etkinlik eklendiğinde sitemap'in güncel kalması için
 * 1 saatte bir yeniden üretilir. DB query'leri her crawler isteğinde değil,
 * yalnızca cache süresi dolduğunda çalışır.
 */
export const revalidate = 3600;

type StaticEntry = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

const STATIC_PATHS: StaticEntry[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/hakkimizda", priority: 0.7, changeFrequency: "monthly" },
  { path: "/hakkimizda/mahallelerimiz", priority: 0.5, changeFrequency: "monthly" },
  { path: "/yonetim", priority: 0.6, changeFrequency: "monthly" },
  { path: "/burs", priority: 0.8, changeFrequency: "weekly" },
  { path: "/burs/basvuru", priority: 0.7, changeFrequency: "weekly" },
  { path: "/etkinlikler", priority: 0.8, changeFrequency: "daily" },
  { path: "/haberler", priority: 0.8, changeFrequency: "daily" },
  { path: "/duyurular", priority: 0.7, changeFrequency: "daily" },
  { path: "/galeri/foto", priority: 0.6, changeFrequency: "weekly" },
  { path: "/galeri/video", priority: 0.6, changeFrequency: "weekly" },
  { path: "/mali-tablo", priority: 0.4, changeFrequency: "monthly" },
  { path: "/bagis", priority: 0.6, changeFrequency: "monthly" },
  { path: "/iletisim", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((s) => ({
    url: `${base}${s.path}`,
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  // DB'ye ulaşılamazsa (örn. ortam değişkeni eksikse) sitemap'i tamamen
  // boş döndürmek yerine en azından statik route'ları sun.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [newsRows, eventRows, legalRows, photoCatRows, videoCatRows] =
      await Promise.all([
        db.select({ slug: news.slug, publishedAt: news.publishedAt }).from(news),
        db.select({ slug: events.slug, startsAt: events.startsAt }).from(events),
        db
          .select({ slug: legalPages.slug, updatedAt: legalPages.updatedAt })
          .from(legalPages),
        db.select({ slug: photoCategories.slug }).from(photoCategories),
        db.select({ slug: videoCategories.slug }).from(videoCategories),
      ]);

    dynamicEntries = [
      ...newsRows.map((n) => ({
        url: `${base}/haberler/${n.slug}`,
        lastModified: n.publishedAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...eventRows.map((e) => ({
        url: `${base}/etkinlikler/${e.slug}`,
        lastModified: e.startsAt ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...legalRows.map((p) => ({
        url: `${base}/${p.slug}`,
        lastModified: p.updatedAt ?? now,
        changeFrequency: "yearly" as const,
        priority: 0.3,
      })),
      ...photoCatRows.map((c) => ({
        url: `${base}/galeri/foto/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...videoCatRows.map((c) => ({
        url: `${base}/galeri/video/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch (err) {
    console.error("[sitemap] dinamik içerik okunamadı:", err);
  }

  return [...staticEntries, ...dynamicEntries];
}
