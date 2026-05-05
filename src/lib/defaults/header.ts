import type { HeaderConfig } from "@/lib/types";

/**
 * Üst menü (Header) için varsayılanlar. DB'de "header.config" page block'u
 * yoksa fallback olarak kullanılır.
 */
export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  topBar: {
    showAdminLink: true,
    adminLinkLabel: "Yönetim Paneli",
  },
  menu: [
    { label: "Ana Sayfa", href: "/", enabled: true },
    {
      label: "Hakkımızda",
      href: "/hakkimizda",
      enabled: true,
      children: [
        { label: "Mahallelerimiz", href: "/hakkimizda/mahallelerimiz", enabled: true },
      ],
    },
    { label: "Yönetim", href: "/yonetim", enabled: true },
    { label: "Burs", href: "/burs", enabled: true },
    { label: "Haberler", href: "/haberler", enabled: true },
    { label: "Etkinlikler", href: "/etkinlikler", enabled: true },
    { label: "Duyurular", href: "/duyurular", enabled: true },
    {
      label: "Galeri",
      href: "/galeri/foto",
      enabled: true,
      children: [
        { label: "Foto Galeri", href: "/galeri/foto", enabled: true },
        { label: "Video Galeri", href: "/galeri/video", enabled: true },
      ],
    },
    { label: "Bağış", href: "/bagis", enabled: true },
    { label: "İletişim", href: "/iletisim", enabled: true },
  ],
  ctaButton: {
    visible: true,
    label: "Burs Başvur",
    href: "/burs/basvuru",
  },
};
