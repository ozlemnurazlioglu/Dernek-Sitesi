/**
 * Ana sayfa blok düzeninin varsayılanları ve yardımcıları.
 *
 * Admin panelinden değiştirilebilen `home.layout` page block'unun yokluğunda
 * ya da eksik blok içermesi durumunda `mergeHomeLayout` fonksiyonu varsayılan
 * sırayı tamamlayarak güvenli bir layout döner — böylece yeni eklenen bir
 * blok admin DB'lerinde otomatik görünür hale gelir.
 */
import type { HomeBlockId, HomeLayout, HomeLayoutItem } from "../types";

/** Varsayılan blok sırası — yeni blok eklenince listeyi buraya da ekle. */
export const DEFAULT_HOME_LAYOUT: HomeLayout = {
  items: [
    { id: "hero", enabled: true },
    { id: "about", enabled: true },
    { id: "programs", enabled: true },
    { id: "scholarship_cta", enabled: true },
    { id: "news", enabled: true },
    { id: "events", enabled: true },
    { id: "testimonials", enabled: true },
    { id: "agalar", enabled: true },
    { id: "announcements", enabled: true },
    { id: "sponsors", enabled: true },
    { id: "donors", enabled: true },
    { id: "donate", enabled: true },
    { id: "sms_subscribe", enabled: true },
  ],
};

/** İnsan tarafından okunabilir blok etiketleri — admin editöründe kullanılır. */
export const HOME_BLOCK_LABELS: Record<
  HomeBlockId,
  { label: string; description: string }
> = {
  hero: {
    label: "Hero (Üst Banner)",
    description: "Sayfanın en üstündeki büyük slayt bölümü.",
  },
  about: {
    label: "Hakkımızda Önizleme",
    description: "Hakkımızda kartları ve kısa tanıtım metni.",
  },
  programs: {
    label: "Burs Programları",
    description: "Burs program kartlarının listelendiği bölüm.",
  },
  scholarship_cta: {
    label: "Burs Çağrısı (CTA)",
    description: "Burs başvurusuna yönlendiren büyük çağrı kutusu.",
  },
  news: { label: "Haberler", description: "Son haberlerin önizlemesi." },
  events: {
    label: "Etkinlikler",
    description: "Yaklaşan etkinliklerin önizlemesi.",
  },
  testimonials: {
    label: "Bursiyer Yorumları",
    description: "Bursiyerlerin yorum kartları.",
  },
  agalar: {
    label: "Ağalarımız",
    description: "Ağalarımızın kayan listesi.",
  },
  announcements: {
    label: "Hemşehri İlanları",
    description: "Filtrelenebilir duyurular bölümü.",
  },
  sponsors: {
    label: "Sponsorlar",
    description: "Tier'lı kayan sponsor logoları.",
  },
  donors: {
    label: "Bağışçılarımız",
    description: "Manuel eklenen bağışçı listesi (isim, tarih, miktar).",
  },
  donate: {
    label: "Bağış Çağrısı (CTA)",
    description: "Bağış sayfasına yönlendiren çağrı kutusu.",
  },
  sms_subscribe: {
    label: "SMS Aboneliği",
    description:
      "Ziyaretçilerin numara bırakıp dernek bilgilendirmelerine abone olduğu form.",
  },
};

const ALL_IDS = new Set<HomeBlockId>(
  DEFAULT_HOME_LAYOUT.items.map((i) => i.id),
);

/**
 * Verilen layout'u varsayılanla birleştirir:
 * 1. Geçersiz / bilinmeyen ID'ler atılır.
 * 2. Tekrar eden ID'ler bir kez sayılır.
 * 3. Default'ta var ama mevcut layout'ta yok olan bloklar (yeni eklenenler)
 *    listenin sonuna `enabled: true` olarak eklenir.
 *
 * Bu sayede:
 * - DB'de hiç `home.layout` yokken (eski kurulumlarda) ana sayfa default ile çalışır.
 * - Yeni bir blok kod tarafında eklendiğinde admin'in onu manuel eklemesine
 *   gerek kalmaz; layout'ta otomatik en sona görünür ve admin sıralamayı/aktifliği
 *   sonradan ayarlayabilir.
 */
export function mergeHomeLayout(input: HomeLayout | undefined): HomeLayout {
  if (!input?.items || !Array.isArray(input.items)) {
    return { items: DEFAULT_HOME_LAYOUT.items.map((i) => ({ ...i })) };
  }
  const seen = new Set<HomeBlockId>();
  const result: HomeLayoutItem[] = [];
  for (const item of input.items) {
    if (
      item &&
      typeof item.id === "string" &&
      ALL_IDS.has(item.id as HomeBlockId) &&
      !seen.has(item.id as HomeBlockId)
    ) {
      result.push({
        id: item.id as HomeBlockId,
        enabled: item.enabled !== false,
      });
      seen.add(item.id as HomeBlockId);
    }
  }
  for (const def of DEFAULT_HOME_LAYOUT.items) {
    if (!seen.has(def.id)) result.push({ ...def });
  }
  return { items: result };
}
