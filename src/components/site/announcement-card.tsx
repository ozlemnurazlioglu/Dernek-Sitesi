import { Calendar, MapPin, Phone } from "lucide-react";
import type { Announcement, AnnouncementCategory } from "@/lib/types";

/** Adres metnini Google Maps arama URL'ine çevirir. */
function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location,
  )}`;
}

/** Telefon numarasındaki boşluk/tire vb. karakterleri tel: linki için temizler. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Tarih + opsiyonel başlangıç/bitiş saatini birleştirir.
 *  - Hepsi yoksa "" döner (üstteki conditional bunu zaten kontrol ediyor).
 *  - Tarih + bitiş + başlangıç → "1 Temmuz 2026 · 14:00 – 18:00"
 *  - Tarih + sadece başlangıç → "1 Temmuz 2026 · 14:00"
 *  - Sadece tarih → "1 Temmuz 2026"
 *  - Sadece saat (tarih boş, az olası) → "14:00 – 18:00" / "14:00"
 */
function formatAnnouncementDate(item: Announcement): string {
  const parts: string[] = [];
  if (item.eventDate) parts.push(item.eventDate);
  let timePart = "";
  if (item.startTime && item.endTime) {
    timePart = `${item.startTime} – ${item.endTime}`;
  } else if (item.startTime) {
    timePart = item.startTime;
  } else if (item.endTime) {
    timePart = item.endTime;
  }
  if (timePart) parts.push(timePart);
  return parts.join(" · ");
}

/**
 * Kategori renk slug'ları → Tailwind sınıf grupları.
 * "color" alanına bilinen bir slug girilmemişse `slate` fallback kullanılır.
 */
const COLOR_MAP: Record<
  string,
  { topBar: string; badgeBg: string; badgeText: string }
> = {
  red: {
    topBar: "bg-red-500",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
  },
  rose: {
    topBar: "bg-rose-500",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
  },
  pink: {
    topBar: "bg-pink-500",
    badgeBg: "bg-pink-50",
    badgeText: "text-pink-700",
  },
  purple: {
    topBar: "bg-purple-500",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
  },
  indigo: {
    topBar: "bg-indigo-500",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
  },
  blue: {
    topBar: "bg-blue-500",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
  sky: {
    topBar: "bg-sky-500",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
  },
  cyan: {
    topBar: "bg-cyan-500",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
  },
  emerald: {
    topBar: "bg-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  green: {
    topBar: "bg-green-500",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
  },
  amber: {
    topBar: "bg-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  orange: {
    topBar: "bg-orange-500",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
  },
  yellow: {
    topBar: "bg-yellow-500",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-700",
  },
  slate: {
    topBar: "bg-slate-500",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
  },
  brand: {
    topBar: "bg-brand-700",
    badgeBg: "bg-brand-50",
    badgeText: "text-brand-700",
  },
};

export const ANNOUNCEMENT_COLOR_OPTIONS: { value: string; label: string }[] = [
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
  { value: "yellow", label: "Sarı" },
  { value: "slate", label: "Gri" },
  { value: "brand", label: "Lacivert (Marka)" },
];

export function getAnnouncementColors(color: string | undefined) {
  return COLOR_MAP[color ?? "slate"] ?? COLOR_MAP.slate;
}

export function AnnouncementCard({
  item,
  category,
}: {
  item: Announcement;
  category?: AnnouncementCategory;
}) {
  const colors = getAnnouncementColors(category?.color);
  return (
    <article className="group rounded-xl border border-border bg-white overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={`h-1.5 ${colors.topBar}`} />
      <div className="p-5">
        <span
          className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${colors.badgeBg} ${colors.badgeText}`}
        >
          {category?.name ?? item.categorySlug}
        </span>
        <h3 className="text-lg font-semibold text-brand-900 mt-3 leading-tight group-hover:text-brand-700">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}
        {(item.eventDate ||
          item.startTime ||
          item.endTime ||
          item.location ||
          item.phone) && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {(item.eventDate || item.startTime || item.endTime) && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-600" />
                {formatAnnouncementDate(item)}
              </span>
            )}
            {item.location && (
              <a
                href={mapsUrl(item.location)}
                target="_blank"
                rel="noopener noreferrer"
                title="Haritada aç"
                className="inline-flex items-center gap-1.5 hover:text-brand-700 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-600" />
                {item.location}
              </a>
            )}
            {item.phone && (
              <a
                href={telHref(item.phone)}
                title="Telefonu ara"
                className="inline-flex items-center gap-1.5 hover:text-brand-700 hover:underline"
              >
                <Phone className="h-3.5 w-3.5 text-brand-600" />
                {item.phone}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
