import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cache } from "react";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import {
  AnalyticsNoscriptFallbacks,
  AnalyticsScripts,
} from "@/components/site/analytics-scripts";
import { db } from "@/lib/db";
import { siteSettings as siteSettingsTable } from "@/lib/db/schema";
import { rowToSiteSettings } from "@/lib/db/mappers";
import { seedSiteSettings } from "@/lib/seed-content";
import { getSiteUrl } from "@/lib/site-url";
import type { SiteSettings } from "@/lib/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Site ayarlarını DB'den okur; aynı request içinde hem `generateMetadata`
 * hem de `RootLayout` çağırdığı için React `cache()` ile memoize ediyoruz —
 * tek SQL query yapılır.
 */
const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await db.select().from(siteSettingsTable).limit(1);
    if (rows[0]) return rowToSiteSettings(rows[0]);
  } catch {
    // db yoksa seed varsayılanları kullanılır
  }
  return seedSiteSettings;
});

/**
 * Tüm sayfanın varsayılan metadata'sı admin panelinden yönetilen
 * SiteSettings.seo* alanlarından dinamik olarak üretilir. Bu sayede
 * site adı, başlık şablonu, açıklama ve OG görseli kod değiştirmeden
 * güncellenebilir. Veritabanına ulaşılamazsa seed varsayılanlarına
 * fallback yapılır.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();

  const defaultTitle = s.seoTitle?.trim() || s.name;
  const template = s.seoTitleTemplate?.trim() || `%s | ${s.name}`;
  const description =
    s.seoDescription?.trim() || s.description || seedSiteSettings.description;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: defaultTitle,
      template,
    },
    description,
    icons: s.seoFaviconUrl ? { icon: s.seoFaviconUrl } : undefined,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: defaultTitle,
      description,
      siteName: s.name,
      type: "website",
      locale: "tr_TR",
      ...(s.seoOgImage ? { images: [{ url: s.seoOgImage }] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AnalyticsNoscriptFallbacks settings={settings} />
        <AppProviders>{children}</AppProviders>
        <AnalyticsScripts settings={settings} />
      </body>
    </html>
  );
}
