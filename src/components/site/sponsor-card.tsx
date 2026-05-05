import type { SponsorTier } from "@/lib/types";

/**
 * Sponsor türü renk paleti.
 *
 * Her türün; kart çerçeve rengi, gradient süslemesi (kartın üst yumuşak ışığı),
 * etiket arka planı ve etiket metin rengi tanımlanır. Renk slug'ı admin panelden
 * seçilir; bilinmeyen slug → `slate` fallback'i.
 *
 * Yeni renk eklemek için: hem `COLOR_MAP`'a sınıfları ekleyin hem de
 * `SPONSOR_COLOR_OPTIONS`'a görünen adı.
 */
const COLOR_MAP: Record<
  string,
  { border: string; ring: string; badgeBg: string; badgeText: string }
> = {
  // Sponsor türü için özel "metalik" renkler
  platinum: {
    border: "border-slate-300",
    ring: "ring-slate-200",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
  },
  gold: {
    border: "border-amber-400",
    ring: "ring-amber-200",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
  },
  silver: {
    border: "border-zinc-300",
    ring: "ring-zinc-200",
    badgeBg: "bg-zinc-100",
    badgeText: "text-zinc-700",
  },
  bronze: {
    border: "border-orange-500",
    ring: "ring-orange-200",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-800",
  },
  // Genel renkler — diğer tür adları için
  red: {
    border: "border-red-500",
    ring: "ring-red-200",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
  },
  rose: {
    border: "border-rose-500",
    ring: "ring-rose-200",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
  },
  pink: {
    border: "border-pink-500",
    ring: "ring-pink-200",
    badgeBg: "bg-pink-50",
    badgeText: "text-pink-700",
  },
  purple: {
    border: "border-purple-500",
    ring: "ring-purple-200",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
  },
  indigo: {
    border: "border-indigo-500",
    ring: "ring-indigo-200",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
  },
  blue: {
    border: "border-blue-500",
    ring: "ring-blue-200",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
  sky: {
    border: "border-sky-500",
    ring: "ring-sky-200",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
  },
  cyan: {
    border: "border-cyan-500",
    ring: "ring-cyan-200",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
  },
  emerald: {
    border: "border-emerald-500",
    ring: "ring-emerald-200",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  green: {
    border: "border-green-500",
    ring: "ring-green-200",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
  },
  amber: {
    border: "border-amber-500",
    ring: "ring-amber-200",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
  },
  orange: {
    border: "border-orange-500",
    ring: "ring-orange-200",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
  },
  slate: {
    border: "border-slate-400",
    ring: "ring-slate-200",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
  },
  brand: {
    border: "border-brand-600",
    ring: "ring-brand-200",
    badgeBg: "bg-brand-50",
    badgeText: "text-brand-700",
  },
};

export const SPONSOR_COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: "platinum", label: "Platin (Metalik Gri)" },
  { value: "gold", label: "Altın (Sarı)" },
  { value: "silver", label: "Gümüş (Açık Gri)" },
  { value: "bronze", label: "Bronz (Turuncu)" },
  { value: "brand", label: "Lacivert (Marka)" },
  { value: "red", label: "Kırmızı" },
  { value: "rose", label: "Gül" },
  { value: "pink", label: "Pembe" },
  { value: "purple", label: "Mor" },
  { value: "indigo", label: "Çivit" },
  { value: "blue", label: "Mavi" },
  { value: "sky", label: "Gök Mavi" },
  { value: "cyan", label: "Turkuaz" },
  { value: "emerald", label: "Zümrüt" },
  { value: "green", label: "Yeşil" },
  { value: "amber", label: "Amber" },
  { value: "orange", label: "Turuncu" },
  { value: "slate", label: "Gri" },
];

export function getSponsorColors(color: string | undefined) {
  return COLOR_MAP[color ?? "slate"] ?? COLOR_MAP.slate;
}

/** Slug → SponsorTier sözlüğü; tek seferlik hesaplanmış map kullanılır. */
export function makeTierMap(
  tiers: SponsorTier[],
): Record<string, SponsorTier> {
  const out: Record<string, SponsorTier> = {};
  for (const t of tiers) out[t.slug] = t;
  return out;
}
