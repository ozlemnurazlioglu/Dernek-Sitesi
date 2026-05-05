/**
 * Site'ın canonical URL'ini ortam değişkenlerinden resolve eder.
 * sitemap.xml, robots.txt ve OpenGraph metadata için kullanılır.
 *
 * Öncelik:
 *  1. NEXT_PUBLIC_SITE_URL — custom domain bağlandığında manuel olarak set edilir.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel production deploy'larda otomatik
 *     gelir; custom domain bağlıysa onu, değilse *.vercel.app döner.
 *  3. VERCEL_URL — preview/per-deploy URL (her deploy için farklı).
 *  4. http://localhost:3000 — yerel geliştirme.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(ensureProtocol(explicit));

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return `https://${stripTrailingSlash(prod)}`;

  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${stripTrailingSlash(preview)}`;

  return "http://localhost:3000";
}

function ensureProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
