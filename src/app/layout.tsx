import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { db } from "@/lib/db";
import { siteSettings as siteSettingsTable } from "@/lib/db/schema";
import { rowToSiteSettings } from "@/lib/db/mappers";
import { seedSiteSettings } from "@/lib/seed-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Tüm sayfanın varsayılan metadata'sı admin panelinden yönetilen
 * SiteSettings.seo* alanlarından dinamik olarak üretilir. Bu sayede
 * site adı, başlık şablonu, açıklama ve OG görseli kod değiştirmeden
 * güncellenebilir. Veritabanına ulaşılamazsa seed varsayılanlarına
 * fallback yapılır.
 */
export async function generateMetadata(): Promise<Metadata> {
  let s = seedSiteSettings;
  try {
    const rows = await db.select().from(siteSettingsTable).limit(1);
    if (rows[0]) s = rowToSiteSettings(rows[0]);
  } catch {
    // db yoksa seed varsayılanları kullanılır
  }

  const defaultTitle = s.seoTitle?.trim() || s.name;
  const template = s.seoTitleTemplate?.trim() || `%s | ${s.name}`;
  const description =
    s.seoDescription?.trim() || s.description || seedSiteSettings.description;

  return {
    title: {
      default: defaultTitle,
      template,
    },
    description,
    icons: s.seoFaviconUrl ? { icon: s.seoFaviconUrl } : undefined,
    openGraph: {
      title: defaultTitle,
      description,
      siteName: s.name,
      ...(s.seoOgImage ? { images: [{ url: s.seoOgImage }] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
