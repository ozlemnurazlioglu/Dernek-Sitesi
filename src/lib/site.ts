export const siteConfig = {
  name: "Umut Eğitim ve Dayanışma Derneği",
  shortName: "Umut Derneği",
  founded: 2008,
  slogan: "Bilgiyle aydınlanan yarınlar için",
  description:
    "2008 yılından bu yana eğitime, sosyal dayanışmaya ve gönüllülüğe dayalı projeler üreten bir sivil toplum kuruluşuyuz.",
  contact: {
    address: "Cumhuriyet Mah. Atatürk Cad. No: 42 Daire: 5, Kadıköy / İstanbul",
    phone: "+90 (216) 555 12 34",
    email: "info@umutdernegi.org",
    workingHours: "Hafta içi 09:00 – 18:00",
  },
  bank: {
    name: "Ziraat Bankası",
    accountHolder: "Umut Eğitim ve Dayanışma Derneği",
    iban: "TR12 0001 0012 3456 7890 1234 56",
    branch: "Kadıköy Şubesi",
  },
  social: {
    instagram: "https://instagram.com/umutdernegi",
    twitter: "https://twitter.com/umutdernegi",
    linkedin: "https://linkedin.com/company/umutdernegi",
    youtube: "https://youtube.com/@umutdernegi",
  },
  stats: {
    yearsActive: 17,
    scholarshipsGiven: 2480,
    activeMembers: 612,
    completedProjects: 84,
  },
} as const;

export type SiteConfig = typeof siteConfig;

export const navigation = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/burs", label: "Burs" },
  { href: "/haberler", label: "Haberler" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/bagis", label: "Bağış" },
  { href: "/iletisim", label: "İletişim" },
] as const;
