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
    { label: "Ana Sayfa", href: "/" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Yönetim", href: "/yonetim" },
    { label: "Burs", href: "/burs" },
    { label: "Haberler", href: "/haberler" },
    { label: "Etkinlikler", href: "/etkinlikler" },
    { label: "Duyurular", href: "/duyurular" },
    { label: "Bağış", href: "/bagis" },
    { label: "İletişim", href: "/iletisim" },
  ],
  ctaButton: {
    visible: true,
    label: "Burs Başvur",
    href: "/burs/basvuru",
  },
};
