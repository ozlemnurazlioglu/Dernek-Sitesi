/**
 * Eski sabit içeriklerin DB'ye taşınmış halleri.
 * Bunlar `npm run db:seed` ve admin paneldeki "Demo verilerini sıfırla" tarafından kullanılır.
 */

import { DEFAULT_AUTH_UI } from "./defaults/auth";
import { DEFAULT_COMMON_UI } from "./defaults/ui-common";
import { DEFAULT_HEADER_CONFIG } from "./defaults/header";
import type {
  ActivityReport,
  AboutCard,
  AboutTransparencyBlock,
  Aga,
  Announcement,
  AnnouncementCategory,
  ApplicationFormText,
  AuthUiText,
  CommonUiText,
  FinanceItem,
  HeaderConfig,
  HomeSponsorsBlock,
  LegalPage,
  BoardMember,
  BurseHero,
  DonationPreset,
  DonationSidebar,
  DonationUse,
  Faq,
  FooterConfig,
  HeroBlock,
  HomeProgramCard,
  HomeScholarshipCTA,
  Milestone,
  PageHeadersMap,
  RequiredDocument,
  ScholarshipProgram,
  ScholarshipTimelineStep,
  SectionHeading,
  SiteSettings,
  Sponsor,
  Testimonial,
} from "./types";

export const seedSiteSettings: SiteSettings = {
  name: "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği",
  shortName: "Kumrulular Derneği",
  founded: 1998,
  slogan: "Kumru'dan yola çıkıyoruz, dayanışmayla büyüyoruz",
  description:
    "1998 yılından bu yana Ordu Kumru ilçesinden gelen hemşehrilerimizi bir araya getiren; eğitim, kültür ve yardımlaşma alanlarında projeler üreten bir sivil toplum kuruluşuyuz.",
  logoUrl: "/logo.png",
  logoSubtitle: "Eğitim · Kültür · Yardımlaşma",
  contactAddress:
    "Fevzi Çakmak Mahallesi 1119 Sokak, Esenler / İstanbul",
  contactPhone: "0535 678 53 43",
  contactEmail: "info@kumrulular.com",
  contactWorkingHours: "Hafta içi 09:00 – 18:00",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Fevzi+%C3%87akmak+Mahallesi+1119+Sokak+Esenler+%C4%B0stanbul&t=&z=15&ie=UTF8&iwloc=&output=embed",
  bankName: "Ziraat Bankası",
  bankAccountHolder: "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği",
  bankIban: "TR00 0000 0000 0000 0000 0000 00",
  bankBranch: "Ordu Şubesi",
  socialFacebook: "https://facebook.com/kumrulularordu",
  socialInstagram: "https://instagram.com/kumrulularordu",
  socialTwitter: "",
  socialLinkedin: "",
  socialYoutube: "",
  statYearsActive: new Date().getFullYear() - 1998,
  statScholarshipsGiven: 0,
  statActiveMembers: 0,
  statCompletedProjects: 0,
  seoTitle: "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği",
  seoTitleTemplate: "%s | Kumrulular Derneği",
  seoDescription:
    "Ordu Kumru'dan yola çıkan; eğitim, kültür ve yardımlaşma temelli projelerle hemşehrilerini bir araya getiren bir sivil toplum kuruluşu.",
  seoOgImage: "/logo.png",
  seoFaviconUrl: "/logo.png",
};

export const seedBoardMembers: BoardMember[] = [
  {
    id: "b-1",
    name: "Zekayi ALIR",
    role: "Yönetim Kurulu Başkanı",
    avatar: "https://i.pravatar.cc/240?img=33",
    bio: "",
    level: "baskan",
    sort: 10,
  },
  {
    id: "b-2",
    name: "Ahmet YILMAZ",
    role: "Başkan Yardımcısı",
    avatar: "https://i.pravatar.cc/240?img=12",
    bio: "",
    level: "yonetim",
    sort: 10,
  },
  {
    id: "b-3",
    name: "Mehmet KAYA",
    role: "Başkan Yardımcısı",
    avatar: "https://i.pravatar.cc/240?img=15",
    bio: "",
    level: "yonetim",
    sort: 20,
  },
  {
    id: "b-4",
    name: "Fatma DEMİR",
    role: "Genel Sekreter",
    avatar: "https://i.pravatar.cc/240?img=47",
    bio: "",
    level: "yonetim",
    sort: 30,
  },
  {
    id: "b-5",
    name: "Ayşe ÇELİK",
    role: "Sayman",
    avatar: "https://i.pravatar.cc/240?img=20",
    bio: "",
    level: "yonetim",
    sort: 40,
  },
  {
    id: "b-6",
    name: "Hasan ÖZTÜRK",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=68",
    bio: "",
    level: "uye",
    sort: 10,
  },
  {
    id: "b-7",
    name: "Ali ARSLAN",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=24",
    bio: "",
    level: "uye",
    sort: 20,
  },
  {
    id: "b-8",
    name: "Mustafa ŞAHİN",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=53",
    bio: "",
    level: "uye",
    sort: 30,
  },
  {
    id: "b-9",
    name: "Hüseyin DOĞAN",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=11",
    bio: "",
    level: "uye",
    sort: 40,
  },
  {
    id: "b-10",
    name: "Kemal AYDOĞAN",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=14",
    bio: "",
    level: "uye",
    sort: 50,
  },
  {
    id: "b-11",
    name: "Recep YILDIZ",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=8",
    bio: "",
    level: "uye",
    sort: 60,
  },
  {
    id: "b-12",
    name: "İbrahim KOÇAK",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=60",
    bio: "",
    level: "uye",
    sort: 70,
  },
];

export const seedMilestones: Milestone[] = [
  {
    id: "m-1",
    year: "1998",
    text: "Dernek, Kumru'dan göç eden hemşehrilerin dayanışması için kuruldu.",
    sort: 10,
  },
  {
    id: "m-2",
    year: "2005",
    text: "İlk yıllık geleneksel hemşehri buluşması düzenlendi.",
    sort: 20,
  },
  {
    id: "m-3",
    year: "2010",
    text: "Eğitim destek fonu oluşturuldu.",
    sort: 30,
  },
  {
    id: "m-4",
    year: "2015",
    text: "Kültür ve sanat etkinlikleri programı başlatıldı.",
    sort: 40,
  },
  {
    id: "m-5",
    year: "2020",
    text: "Pandemi döneminde sosyal yardım kampanyaları yürütüldü.",
    sort: 50,
  },
];

export const seedActivityReports: ActivityReport[] = [
  { id: "r-2024", year: "2024", pdfUrl: "#", sort: 10 },
  { id: "r-2023", year: "2023", pdfUrl: "#", sort: 20 },
  { id: "r-2022", year: "2022", pdfUrl: "#", sort: 30 },
  { id: "r-2021", year: "2021", pdfUrl: "#", sort: 40 },
];

export const seedScholarshipPrograms: ScholarshipProgram[] = [
  {
    id: "sp-1",
    title: "Lise Burs Programı",
    monthly: "1.500 ₺ / ay",
    duration: "9 ay",
    targets: "9–12. sınıf öğrencileri",
    quota: 200,
    requirements: [
      "T.C. vatandaşı olmak",
      "Önceki yılın not ortalamasının 75/100 üstü olması",
      "Aile gelirinin asgari ücretin 2 katını aşmaması",
    ],
    sort: 10,
  },
  {
    id: "sp-2",
    title: "Üniversite Burs Programı",
    monthly: "3.000 ₺ / ay",
    duration: "9 ay",
    targets: "Lisans öğrencileri",
    quota: 250,
    requirements: [
      "Bir devlet veya vakıf üniversitesinde okuyor olmak",
      "Genel not ortalamasının 2.50/4.00 üstü olması",
      "Disiplin cezası bulunmaması",
    ],
    sort: 20,
  },
  {
    id: "sp-3",
    title: "Lisansüstü Destek",
    monthly: "5.000 ₺ / ay",
    duration: "Proje süresince",
    targets: "Yüksek lisans / doktora öğrencileri",
    quota: 50,
    requirements: [
      "Tezli yüksek lisans veya doktora programında olmak",
      "Akademik araştırma planı sunmak",
      "Akademik danışman onayı bulunmak",
    ],
    sort: 30,
  },
];

export const seedRequiredDocuments: RequiredDocument[] = [
  {
    id: "rd-1",
    docKey: "id_card",
    title: "Nüfus Cüzdanı / Kimlik",
    description: "Ön ve arka yüzü, PDF veya JPG",
    icon: "🪪",
    required: true,
    sort: 10,
  },
  {
    id: "rd-2",
    docKey: "student_certificate",
    title: "Öğrenci Belgesi",
    description: "e-Devlet üzerinden alınabilir",
    icon: "🎓",
    required: true,
    sort: 20,
  },
  {
    id: "rd-3",
    docKey: "transcript",
    title: "Transkript",
    description: "Güncel not döküm belgesi",
    icon: "📄",
    required: true,
    sort: 30,
  },
  {
    id: "rd-4",
    docKey: "income_proof",
    title: "Gelir Durumu Belgesi",
    description: "Anne/baba gelirini gösteren belge",
    icon: "💳",
    required: true,
    sort: 40,
  },
  {
    id: "rd-5",
    docKey: "residence",
    title: "İkametgâh Belgesi",
    description: "e-Devlet üzerinden alınabilir",
    icon: "🏠",
    required: false,
    sort: 50,
  },
  {
    id: "rd-6",
    docKey: "photo",
    title: "Vesikalık Fotoğraf",
    description: "JPG, son 6 ay içinde çekilmiş",
    icon: "👤",
    required: false,
    sort: 60,
  },
];

export const seedNewsCategories = [
  { id: "nc-1", name: "Duyuru", sort: 10 },
  { id: "nc-2", name: "Haber", sort: 20 },
  { id: "nc-3", name: "Basın", sort: 30 },
  { id: "nc-4", name: "Proje", sort: 40 },
];

export const seedEventCategories = [
  { id: "ec-1", name: "Eğitim", sort: 10 },
  { id: "ec-2", name: "Sosyal", sort: 20 },
  { id: "ec-3", name: "Yardım", sort: 30 },
  { id: "ec-4", name: "Konferans", sort: 40 },
];

export const seedScholarshipTimeline: ScholarshipTimelineStep[] = [
  { id: "st-1", dateLabel: "1–30 Eylül", title: "Online başvuru", description: "Form ve evrak yükleme", sort: 10 },
  { id: "st-2", dateLabel: "1–4 Ekim", title: "Belge incelemesi", description: "Komisyon ön elemesi", sort: 20 },
  { id: "st-3", dateLabel: "5–10 Ekim", title: "Mülakatlar", description: "Online veya yüz yüze", sort: 30 },
  { id: "st-4", dateLabel: "15 Ekim", title: "Sonuçlar", description: "Üyelik panelinden duyurulur", sort: 40 },
  { id: "st-5", dateLabel: "20 Ekim", title: "Ödemelerin başlaması", description: "IBAN üzerinden aylık", sort: 50 },
];

export const seedFaqs: Faq[] = [
  {
    id: "f-1",
    question: "Başvuru için üye olmak zorunda mıyım?",
    answer:
      "Hayır. Üyelik zorunlu değildir, ancak başvurunuzu sonradan takip edebilmek için kayıt olmanızı öneririz.",
    sort: 10,
  },
  {
    id: "f-2",
    question: "Hangi dosya formatlarını yükleyebilirim?",
    answer:
      "Belgelerinizi PDF veya JPG formatında yükleyebilirsiniz. Her dosya en fazla 10 MB olabilir.",
    sort: 20,
  },
  {
    id: "f-3",
    question: "Eksik belge ile başvuru yapabilir miyim?",
    answer:
      "Sistem sadece zorunlu belgeleri yüklediğinizde başvurunuzu kaydetmenize izin verir. Sonradan eksik belge yüklemek için panelinizden başvurunuzu güncelleyebilirsiniz.",
    sort: 30,
  },
  {
    id: "f-4",
    question: "Sonuçlar ne zaman ve nasıl açıklanır?",
    answer:
      "Sonuçlar Ekim ayının ortasında üyelik paneliniz üzerinden ve kayıtlı e-posta adresinize bildirilir.",
    sort: 40,
  },
  {
    id: "f-5",
    question: "Bursunuzu birden fazla yıl alabilir miyim?",
    answer:
      "Evet, akademik başarınızı ve ekonomik durumunuzu gösteren belgelerle her yıl yeniden başvurarak bursunuza devam edebilirsiniz.",
    sort: 50,
  },
];

export const seedTestimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Ezgi A.",
    role: "İTÜ Mimarlık 4. Sınıf · Burslu",
    avatar: "https://i.pravatar.cc/96?img=49",
    text: "Bursunuzla birlikte derslerime daha çok odaklanabildim ve final dönemini bursiyer dayanışma ağı sayesinde rahat geçirdim.",
    sort: 10,
  },
  {
    id: "t-2",
    name: "Murat T.",
    role: "Mezun bursiyer · Yazılım Mühendisi",
    avatar: "https://i.pravatar.cc/96?img=51",
    text: "Sadece maddi destek değil; mentörlük programıyla profesyonel hayata hazırlanmamı sağladınız. Şimdi gönüllüyüm.",
    sort: 20,
  },
  {
    id: "t-3",
    name: "Selin K.",
    role: "Hacettepe Tıp 2. Sınıf",
    avatar: "https://i.pravatar.cc/96?img=29",
    text: "Şeffaf ve hızlı bir başvuru süreciydi. Belge yükleme ekranı çok kolaydı, bir gün içinde değerlendirmeye girdim.",
    sort: 30,
  },
];

/* ====================== Geleneksel Piknik Şöleni Ağaları ====================== */

export const seedAgalar: Aga[] = [
  {
    id: "aga-2022",
    year: "2022",
    name: "Nihat Akıcı",
    photoUrl: "/uploads/agalar/aga-1.png",
    caption: "23. Geleneksel Piknik Şöleni Ağamız",
    eventDate: "03.07.2022",
    sort: 10,
  },
  {
    id: "aga-2023",
    year: "2023",
    name: "Halis Teber",
    photoUrl: "/uploads/agalar/aga-2.png",
    caption: "24. Geleneksel Piknik Şöleni Ağamız",
    eventDate: "18.06.2023",
    sort: 20,
  },
  {
    id: "aga-2024",
    year: "2024",
    name: "Abdullah Beyrek",
    photoUrl: "/uploads/agalar/aga-3.png",
    caption: "25. Geleneksel Piknik Şöleni Ağamız",
    eventDate: "09.06.2024",
    sort: 30,
  },
];

/* ====================== Mali Tablo (Gelir/Gider) ====================== */

export const seedFinanceItems: FinanceItem[] = [
  // 2025
  { id: "fin-2025-i-1", year: 2025, kind: "income", label: "Aidat Gelirleri", amount: 45000, sort: 10 },
  { id: "fin-2025-i-2", year: 2025, kind: "income", label: "Bağışlar", amount: 85000, sort: 20 },
  { id: "fin-2025-i-3", year: 2025, kind: "income", label: "Etkinlik Gelirleri", amount: 15000, sort: 30 },
  { id: "fin-2025-i-4", year: 2025, kind: "income", label: "Diğer", amount: 5000, sort: 40 },
  { id: "fin-2025-e-1", year: 2025, kind: "expense", label: "Burs Ödemeleri", amount: 60000, sort: 10 },
  { id: "fin-2025-e-2", year: 2025, kind: "expense", label: "Etkinlik Giderleri", amount: 25000, sort: 20 },
  { id: "fin-2025-e-3", year: 2025, kind: "expense", label: "Kira & Fatura", amount: 18000, sort: 30 },
  { id: "fin-2025-e-4", year: 2025, kind: "expense", label: "Yatırımlar", amount: 35000, sort: 40 },
  { id: "fin-2025-e-5", year: 2025, kind: "expense", label: "Diğer", amount: 12000, sort: 50 },
  // 2024
  { id: "fin-2024-i-1", year: 2024, kind: "income", label: "Aidat Gelirleri", amount: 38000, sort: 10 },
  { id: "fin-2024-i-2", year: 2024, kind: "income", label: "Bağışlar", amount: 72000, sort: 20 },
  { id: "fin-2024-i-3", year: 2024, kind: "income", label: "Etkinlik Gelirleri", amount: 12000, sort: 30 },
  { id: "fin-2024-i-4", year: 2024, kind: "income", label: "Diğer", amount: 4000, sort: 40 },
  { id: "fin-2024-e-1", year: 2024, kind: "expense", label: "Burs Ödemeleri", amount: 50000, sort: 10 },
  { id: "fin-2024-e-2", year: 2024, kind: "expense", label: "Etkinlik Giderleri", amount: 22000, sort: 20 },
  { id: "fin-2024-e-3", year: 2024, kind: "expense", label: "Kira & Fatura", amount: 15000, sort: 30 },
  { id: "fin-2024-e-4", year: 2024, kind: "expense", label: "Yatırımlar", amount: 28000, sort: 40 },
  { id: "fin-2024-e-5", year: 2024, kind: "expense", label: "Diğer", amount: 9000, sort: 50 },
];

/* ====================== Hemşehri Duyuru Kategorileri & İlanlar ====================== */

export const seedAnnouncementCategories: AnnouncementCategory[] = [
  { id: "ac-vefat", slug: "vefat", name: "Vefat", color: "red", sort: 10 },
  { id: "ac-dugun", slug: "dugun", name: "Düğün", color: "rose", sort: 20 },
  { id: "ac-nisan", slug: "nisan", name: "Nişan", color: "purple", sort: 30 },
  { id: "ac-etkinlik", slug: "etkinlik", name: "Etkinlik", color: "sky", sort: 40 },
  { id: "ac-duyuru", slug: "duyuru", name: "Duyuru", color: "amber", sort: 50 },
  { id: "ac-diger", slug: "diger", name: "Diğer", color: "slate", sort: 60 },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: "an-1",
    categorySlug: "etkinlik",
    title: "Kumru Şenliği 2026",
    description:
      "Geleneksel Kumru Şenliğimiz bu yıl da düzenlenecek. Tüm hemşehrilerimizi bekliyoruz.",
    eventDate: "1 Temmuz 2026",
    location: "Kumru Mesire Alanı",
    sort: 10,
  },
  {
    id: "an-2",
    categorySlug: "dugun",
    title: "Ayşe & Mehmet Düğünü",
    description:
      "Kızımız Ayşe ile Mehmet'in düğün törenine tüm hemşehrilerimizi davet ediyoruz.",
    eventDate: "15 Haziran 2026",
    location: "Kumru Düğün Salonu",
    sort: 20,
  },
  {
    id: "an-3",
    categorySlug: "nisan",
    title: "Zeynep & Ali Nişan Töreni",
    description:
      "Kızımız Zeynep ile Ali'nin nişan törenine tüm hemşehrilerimizi davetlisiniz.",
    eventDate: "20 Mayıs 2026",
    location: "Kumru Kültür Merkezi",
    sort: 30,
  },
  {
    id: "an-4",
    categorySlug: "duyuru",
    title: "Kumru Köyü Yol Yapım Çalışması",
    description:
      "Köyümüzün ana yolunun asfaltlanması için başlatılan çalışmalar hakkında detaylar.",
    eventDate: "10 Mayıs 2026",
    location: "Kumru Köyü",
    sort: 40,
  },
  {
    id: "an-5",
    categorySlug: "vefat",
    title: "Fatma Demir",
    description:
      "Değerli hemşehrimiz Fatma Demir'in vefat haberini üzüntüyle aldık. Allah rahmet eylesin.",
    eventDate: "8 Mayıs 2026",
    location: "Kumru Merkez Camii",
    sort: 50,
  },
  {
    id: "an-6",
    categorySlug: "vefat",
    title: "Ahmet Yılmaz",
    description:
      "Değerli hemşehrimiz Ahmet Yılmaz'ın vefat haberini üzüntüyle aldık. Allah rahmet eylesin.",
    eventDate: "5 Mayıs 2026",
    location: "Kumru Merkez Camii",
    sort: 60,
  },
];

/* ====================== Sponsorlar ====================== */

export const seedSponsors: Sponsor[] = [
  {
    id: "sp-1",
    name: "Sponsor 1",
    logoUrl: "https://placehold.co/200x80/F8FAFC/475569?text=Sponsor+1",
    websiteUrl: "",
    sort: 10,
  },
  {
    id: "sp-2",
    name: "Sponsor 2",
    logoUrl: "https://placehold.co/200x80/F8FAFC/475569?text=Sponsor+2",
    websiteUrl: "",
    sort: 20,
  },
  {
    id: "sp-3",
    name: "Sponsor 3",
    logoUrl: "https://placehold.co/200x80/F8FAFC/475569?text=Sponsor+3",
    websiteUrl: "",
    sort: 30,
  },
  {
    id: "sp-4",
    name: "Sponsor 4",
    logoUrl: "https://placehold.co/200x80/F8FAFC/475569?text=Sponsor+4",
    websiteUrl: "",
    sort: 40,
  },
  {
    id: "sp-5",
    name: "Sponsor 5",
    logoUrl: "https://placehold.co/200x80/F8FAFC/475569?text=Sponsor+5",
    websiteUrl: "",
    sort: 50,
  },
  {
    id: "sp-6",
    name: "Sponsor 6",
    logoUrl: "https://placehold.co/200x80/F8FAFC/475569?text=Sponsor+6",
    websiteUrl: "",
    sort: 60,
  },
];

export const seedDonationPresets: DonationPreset[] = [
  { id: "dp-1", amount: 100, sort: 10 },
  { id: "dp-2", amount: 250, sort: 20 },
  { id: "dp-3", amount: 500, sort: 30 },
  { id: "dp-4", amount: 1000, sort: 40 },
  { id: "dp-5", amount: 2500, sort: 50 },
];

export const seedDonationUses: DonationUse[] = [
  { id: "du-1", text: "Aylık burs ödemeleri (öncelikli)", sort: 10 },
  { id: "du-2", text: "Eğitim malzemesi ve kitap tedariki", sort: 20 },
  { id: "du-3", text: "Sosyal sorumluluk projeleri", sort: 30 },
  { id: "du-4", text: "Mentörlük ve kariyer programları", sort: 40 },
];

/* ============== Sayfa blokları (key-value JSON) ============== */

export const seedPageBlocks: Record<string, unknown> = {
  "home.hero": {
    badgeText: "'den bu yana hemşehri dayanışması",
    titlePrefix: "Kumru'dan",
    titleHighlight: "dayanışmaya",
    titleSuffix: "bir adım",
    subtitle:
      "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği olarak {yearsActive} yılı aşkın süredir hemşehrilerimizi bir araya getiriyor; eğitim, kültür ve yardımlaşma projeleriyle yan yana yürüyoruz.",
    primaryButton: { label: "Bize Katıl", href: "/kayit" },
    secondaryButton: { label: "Destek Ol", href: "/bagis" },
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    imageOverlayLabel: "Memleket",
    imageOverlayTitle: "Kumru / Ordu",
    imageOverlayDesc: "Karadeniz'in yeşil ilçesi",
    floatBadge1: { label: "1998'den beri", value: "Hemşehri Dayanışması" },
    floatBadge2: { label: "Şeffaflık", value: "Yıllık Faaliyet Raporu" },
  } satisfies HeroBlock,

  "home.about_section": {
    eyebrow: "Hakkımızda",
    title: "Memleketten gelen, birlikte büyüyen bir topluluk",
    description:
      "Eğitim fırsatlarına erişimi kolaylaştırmak, kültürel bağları güçlendirmek ve hemşehrilerimiz arasında dayanışmayı sürdürmek için 1998'den beri çalışıyoruz. Şeffaf, hesap verebilir ve gönüllülük temelli bir yaklaşımla projeler üretiyoruz.",
  } satisfies SectionHeading,

  "home.about_cards": [
    { icon: "🎓", title: "Karşılıksız Burs", text: "Lise ve üniversite öğrencileri için akademik dönem boyu sürekli destek." },
    { icon: "📚", title: "Eğitim Projeleri", text: "Köy okullarına kitap, atölye ve laboratuvar desteği." },
    { icon: "🤝", title: "Sosyal Yardım", text: "Doğal afet bölgeleri ve dezavantajlı gruplar için saha çalışmaları." },
    { icon: "👥", title: "Gönüllülük", text: "Üyelerimizle birlikte yıl içinde 50+ etkinlik ve atölye düzenliyoruz." },
  ] satisfies AboutCard[],

  "home.programs_section": {
    eyebrow: "Burs Programları",
    title: "Eğitim hayatına kesintisiz destek",
    description:
      "Akademik dönem boyu sürekli, karşılıksız ve şeffaf burs programlarımız ile öğrencilerin yanındayız.",
  } satisfies SectionHeading,

  "home.programs": [
    { number: "01", title: "Lise Burs Programı", desc: "9–12. sınıf öğrencilerine yönelik aylık karşılıksız burs ve mentörlük.", tag: "9 ay süreyle" },
    { number: "02", title: "Üniversite Burs Programı", desc: "Lisans öğrencileri için akademik dönem boyu burs ve kariyer rehberliği.", tag: "Tam akademik yıl" },
    { number: "03", title: "Lisansüstü Destek", desc: "Yüksek lisans ve doktora öğrencilerine araştırma ve yayın desteği.", tag: "Proje bazlı" },
  ] satisfies HomeProgramCard[],

  "home.scholarship_cta": {
    badge: "2025-2026 Başvuruları Açık",
    title: "Eğitiminize burs desteği için şimdi başvurun",
    description:
      "Online başvuru formumuzu doldurun, gerekli evrakları yükleyin. Komisyonumuz başvurunuzu inceleyip 30 gün içinde geri dönüş yapacaktır.",
    checks: [
      "Ücretsiz başvuru — komisyon ücreti yok",
      "Online belge yükleme & başvuru takibi",
      "Şeffaf değerlendirme süreci",
      "Akademik dönem boyu kesintisiz destek",
    ],
    calendar: [
      { label: "Başvuru başlangıç", date: "1 Eylül 2025" },
      { label: "Başvuru bitiş", date: "30 Eylül 2025" },
      { label: "Mülakatlar", date: "5–10 Ekim 2025" },
      { label: "Sonuç ilanı", date: "15 Ekim 2025" },
    ],
    primaryButton: { label: "Başvuruyu Başlat", href: "/burs/basvuru" },
    secondaryButton: { label: "Burs Hakkında", href: "/burs" },
  } satisfies HomeScholarshipCTA,

  "home.news_section": {
    eyebrow: "Haberler",
    title: "Derneğimizden son haberler",
    description: "Projelerimiz, etkinliklerimiz ve duyurularımız.",
  } satisfies SectionHeading,

  "home.events_section": {
    eyebrow: "Etkinlikler",
    title: "Yaklaşan etkinliklerimiz",
    description: "Bilgi paylaşımı ve dayanışma için sizi de bekliyoruz.",
  } satisfies SectionHeading,

  "home.testimonials_section": {
    eyebrow: "Bursiyerlerimizden",
    title: "Sözü onlara bırakıyoruz",
  } satisfies SectionHeading,

  "home.agalar_section": {
    eyebrow: "Kumrulular Derneği",
    title: "Ağalarımız",
    description:
      "Her yıl düzenlediğimiz Geleneksel Piknik Şöleni'nde derneğimizin ağalığını üstlenen değerli hemşehrilerimiz.",
  } satisfies SectionHeading,

  "home.announcements_section": {
    eyebrow: "Duyurular",
    title: "Hemşehrilerimizden İlanlar",
    description: "Vefat, düğün, nişan ve etkinlik duyuruları",
  } satisfies SectionHeading,

  "home.sponsors_section": {
    eyebrow: "Destekçilerimiz",
    title: "Sponsorlarımız",
    description: "Değerli iş ortaklarımıza teşekkür ederiz",
    cta: {
      visible: true,
      label: "Sponsor Olmak İstiyorum",
      href: "/iletisim",
    },
  } satisfies HomeSponsorsBlock,

  "home.donate_cta": {
    title: "Bağışınızla bir öğrencinin yanında olabilirsiniz.",
    description:
      "Tek seferlik veya düzenli bağışlarınız doğrudan burs fonumuza aktarılır. IBAN bilgilerimize bağış sayfamızdan ulaşabilirsiniz.",
    buttonLabel: "Bağış Bilgileri",
    buttonHref: "/bagis",
  },

  "about.values": [
    { icon: "👁️", title: "Vizyonumuz", text: "Eğitim fırsatlarına erişimi engelleyen tüm bariyerlerin kalktığı bir Türkiye." },
    { icon: "🎯", title: "Misyonumuz", text: "Burs, eğitim projeleri ve sosyal dayanışma ile gençlerin yanında olmak." },
    { icon: "🤝", title: "Değerlerimiz", text: "Şeffaflık, hesap verebilirlik, eşitlik ve gönüllülük." },
  ] satisfies AboutCard[],

  "about.history_intro": {
    eyebrow: "Tarihçemiz",
    title: "17 yıllık bir yolculuk",
    description:
      "Küçük bir gönüllü grubunun başlattığı yardımlaşma hareketi, bugün binlerce öğrenciye dokunan bir sivil toplum kuruluşuna dönüştü.",
  } satisfies SectionHeading,

  "about.transparency": {
    badge: "Şeffaflık",
    title: "Hesap verebilir, denetlenebilir",
    description:
      "Bağışlarınız ve burs fonu hareketleri her yıl bağımsız denetim raporlarımızda kamuoyuyla paylaşılır.",
    bullets: [
      "Yıllık denetim raporları",
      "Yönetim kurulu toplantı tutanakları",
      "Detaylı bağış ve harcama kalemleri",
      "Bağımsız mali müşavir onayı",
    ],
  } satisfies AboutTransparencyBlock,

  "burs.hero": {
    badge: "2025-2026 Başvurular Açık",
    title: "Online başvuruyla 5 dakikada başlayın",
    description:
      "Başvuru formunu doldurun, gerekli belgeleri yükleyin, tüm süreci üyelik panelinizden takip edin.",
    buttonLabel: "Başvuruyu Başlat",
    buttonHref: "/burs/basvuru",
  } satisfies BurseHero,

  "donate.sidebar": {
    title: "Bağışınız nasıl kullanılacak?",
    transparencyTitle: "Şeffaflık taahhüdümüz",
    transparencyText:
      "Bağışlarınızın her kuruşu yıllık denetim raporlarımızda kamuoyuyla paylaşılır. Hesap dökümlerimiz ve burs dağılımları için Faaliyet Raporları sayfamızı inceleyebilirsiniz.",
  } satisfies DonationSidebar,

  "page.headers": {
    hakkimizda: {
      title: "Hakkımızda",
      description:
        "1998 yılından bu yana Ordu Kumru ilçesinden gelen hemşehrilerimizi bir araya getiren; eğitim, kültür ve yardımlaşma alanlarında projeler üreten bir sivil toplum kuruluşuyuz.",
    },
    burs: {
      title: "Burs Programlarımız",
      description:
        "Eğitim hayatınıza kesintisiz destek sunan burs programlarımız hakkında detaylı bilgi ve başvuru rehberi.",
    },
    burs_basvuru: {
      title: "Burs Başvurusu",
      description:
        "Lütfen tüm adımları eksiksiz doldurun. Yıldız (*) işaretli alanlar zorunludur.",
    },
    bagis: {
      title: "Bağış",
      description:
        "Bağışınız, bir öğrencinin eğitim hayatına dokunan en somut destektir.",
    },
    haberler: {
      title: "Haberler & Duyurular",
      description:
        "Derneğimizin son haberleri, projeleri ve duyurularına buradan ulaşabilirsiniz.",
    },
    etkinlikler: {
      title: "Etkinlikler",
      description:
        "Eğitimden sosyal sorumluluğa, dayanışmadan kariyer mentörlüğüne kadar yaklaşan tüm etkinliklerimiz.",
    },
    iletisim: {
      title: "İletişim",
      description:
        "Sorularınız, iş birliği önerileriniz veya gönüllü olmak için bize yazın.",
    },
    duyurular: {
      title: "Hemşehrilerimizden İlanlar",
      description:
        "Vefat, düğün, nişan ve etkinlik duyurularımızı buradan takip edebilirsiniz.",
    },
    yonetim: {
      title: "Yönetim Kurulu",
      description:
        "Derneğimizi gönüllü olarak yöneten Yönetim Kurulu üyelerimizi tanıyın.",
    },
    "mali-tablo": {
      title: "Mali Tablo",
      description:
        "Derneğimizin yıllık gelir ve giderlerini şeffaflık ilkesiyle kalem kalem yayınlıyoruz.",
    },
    hesabim: {
      title: "Merhaba, {firstName}",
      description:
        "Üyelik bilgilerinizi görüntüleyin, burs başvurularınızın durumunu takip edin.",
    },
  } satisfies PageHeadersMap,

  "ui.auth": DEFAULT_AUTH_UI satisfies AuthUiText,

  "ui.common": DEFAULT_COMMON_UI satisfies CommonUiText,

  "header.config": DEFAULT_HEADER_CONFIG satisfies HeaderConfig,

  "burs.application_form": {
    steps: {
      personal: {
        title: "Kişisel Bilgiler",
        description:
          "Lütfen kimlik bilgilerinizi resmi belgelerinizle birebir aynı girin.",
      },
      education: {
        title: "Eğitim Bilgileri",
        description:
          "Halen devam ettiğiniz eğitim kademesi ve okul bilgilerinizi girin.",
      },
      family: {
        title: "Aile Bilgileri",
        description:
          "Burs değerlendirmemizde gelir durumu önemli kriterlerden biridir.",
      },
      documents: {
        title: "Belgeler",
        description:
          "Lütfen aşağıdaki belgeleri PDF veya JPG formatında, her biri en fazla 10 MB olacak şekilde yükleyin.",
      },
      finalize: {
        title: "Son Adım: Banka & Motivasyon",
        description:
          "Burs onaylanması durumunda ödemenin yapılacağı IBAN ve motivasyon mektubunuzu giriniz.",
      },
    },
    consentText:
      "Verdiğim bilgilerin ve yüklediğim belgelerin doğruluğunu kabul ederim. Yanlış beyan halinde başvurum geçersiz sayılacaktır. Verilerim KVKK kapsamında işlenir.",
    buttons: {
      prev: "Geri",
      next: "Devam Et",
      submit: "Başvuruyu Gönder",
    },
    success: {
      title: "Başvurunuz başarıyla alındı",
      description:
        "Başvurunuz komisyonumuz tarafından incelenecektir. Sonuç durumunu üyelik panelinizden ve e-posta adresinizden takip edebilirsiniz.",
      newApplicationButton: "Yeni Başvuru",
      accountButton: "Hesabıma Git",
    },
  } satisfies ApplicationFormText,

  "footer": {
    groups: [
      {
        title: "Kurumsal",
        links: [
          { label: "Hakkımızda", href: "/hakkimizda" },
          { label: "Yönetim Kurulu", href: "/hakkimizda#yonetim" },
          { label: "Tüzük", href: "/tuzuk" },
          { label: "Faaliyet Raporları", href: "/hakkimizda#raporlar" },
          { label: "İletişim", href: "/iletisim" },
        ],
      },
      {
        title: "Destek Ol",
        links: [
          { label: "Burs Başvurusu", href: "/burs" },
          { label: "Bağış Yap", href: "/bagis" },
          { label: "Üye Ol", href: "/kayit" },
          { label: "Etkinlikler", href: "/etkinlikler" },
          { label: "Haberler", href: "/haberler" },
        ],
      },
    ],
    legalLinks: [
      { label: "Gizlilik Politikası", href: "/gizlilik" },
      { label: "KVKK", href: "/kvkk" },
      { label: "Çerez Politikası", href: "/cerez" },
    ],
  } satisfies FooterConfig,
};

/* ====================== Yasal sayfalar (Gizlilik, KVKK, Çerez, Tüzük) ====================== */

export const seedLegalPages: LegalPage[] = [
  {
    id: "lp-gizlilik",
    slug: "gizlilik",
    title: "Gizlilik Politikası",
    description:
      "Web sitemizi kullanırken kişisel verilerinizin nasıl işlendiği ve korunduğu hakkında bilgilendirme.",
    content: [
      "## Giriş",
      "",
      "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği olarak ziyaretçilerimizin gizliliğine önem veriyoruz. Bu metin, web sitemizi ziyaret ettiğinizde topladığımız bilgileri ve bunları nasıl kullandığımızı açıklar.",
      "",
      "## Topladığımız Bilgiler",
      "",
      "- İletişim formu doldurduğunuzda: ad, soyad, e-posta ve mesaj içeriği",
      "- Üyelik / burs başvurusu yaparken: kimlik, eğitim ve aile bilgileri",
      "- Sunucu logları: IP adresi, tarayıcı bilgisi (yalnızca güvenlik amacıyla)",
      "",
      "## Verilerin Kullanımı",
      "",
      "Verileriniz yalnızca derneğimizin faaliyetleri kapsamında kullanılır. Üçüncü kişilerle paylaşılmaz; yasal zorunluluklar bunun dışındadır.",
      "",
      "## Haklarınız",
      "",
      "KVKK kapsamında verilerinize erişme, düzeltme, silme ve itiraz etme haklarına sahipsiniz. Talepleriniz için **info@umutdernegi.org** adresinden bize ulaşabilirsiniz.",
    ].join("\n"),
    sort: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lp-kvkk",
    slug: "kvkk",
    title: "KVKK Aydınlatma Metni",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metnimiz.",
    content: [
      "## Veri Sorumlusu",
      "",
      "**Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği**, 6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") uyarınca veri sorumlusu sıfatıyla hareket eder.",
      "",
      "## İşlenen Veri Kategorileri",
      "",
      "- Kimlik (ad, soyad, T.C. kimlik no)",
      "- İletişim (telefon, e-posta, adres)",
      "- Eğitim ve mali bilgiler (burs başvurusu için)",
      "- Görsel kayıtlar (etkinliklerde rıza ile)",
      "",
      "## İşleme Amaçları",
      "",
      "- Burs başvurularının değerlendirilmesi",
      "- Üyelik kayıtlarının tutulması",
      "- Etkinlik ve duyuru iletişimi",
      "- Yasal yükümlülüklerin yerine getirilmesi",
      "",
      "## Saklama Süresi",
      "",
      "Verileriniz, yasal zaman aşımı süreleri boyunca güvenli ortamda saklanır ve süre dolduğunda imha edilir.",
      "",
      "## İletişim",
      "",
      "Detaylı bilgi için: **info@umutdernegi.org**",
    ].join("\n"),
    sort: 20,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lp-cerez",
    slug: "cerez",
    title: "Çerez Politikası",
    description:
      "Sitemizde kullandığımız çerezler ve amaçları hakkında bilgilendirme.",
    content: [
      "## Çerez Nedir?",
      "",
      "Çerezler, web sitelerinin tarayıcınıza gönderdiği ve sitenin sizi tanımasını sağlayan küçük metin dosyalarıdır.",
      "",
      "## Kullandığımız Çerezler",
      "",
      "- **Zorunlu çerezler:** Oturum açma ve form doldurma için gereklidir.",
      "- **İstatistiksel çerezler:** Sitenin nasıl kullanıldığını anlamak için anonim verileri toplar.",
      "",
      "Üçüncü taraf reklam veya pazarlama çerezi kullanmıyoruz.",
      "",
      "## Çerezleri Yönetme",
      "",
      "Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Engelleme durumunda bazı özellikler düzgün çalışmayabilir.",
    ].join("\n"),
    sort: 30,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lp-tuzuk",
    slug: "tuzuk",
    title: "Dernek Tüzüğü",
    description:
      "Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği'nin resmi tüzüğü.",
    content: [
      "## Madde 1 — Derneğin Adı ve Merkezi",
      "",
      "Derneğin adı **\"Kumrulular Ordu Eğitim Kültür Yardımlaşma Derneği\"** dir. Derneğin merkezi Ordu'dadır.",
      "",
      "## Madde 2 — Derneğin Amacı",
      "",
      "Eğitim fırsatlarına erişimi kolaylaştırmak, dezavantajlı öğrencilere burs vermek, sosyal sorumluluk projeleri gerçekleştirmek ve gönüllülük temelli toplumsal dayanışmayı güçlendirmek.",
      "",
      "## Madde 3 — Faaliyet Alanları",
      "",
      "- Burs verilmesi ve eğitim destekleri",
      "- Mentörlük ve kariyer rehberliği programları",
      "- Atölye, konferans, panel düzenlenmesi",
      "- Kitap ve eğitim materyali bağışı",
      "- Doğal afet bölgelerinde eğitim acil müdahale çalışmaları",
      "",
      "## Madde 4 — Üyelik",
      "",
      "Fiil ehliyetine sahip, derneğin amaçlarını benimseyen ve giriş ödentisini ödeyen herkes üye olabilir. Üyelik başvurusu yönetim kurulu tarafından değerlendirilir.",
      "",
      "## Madde 5 — Yönetim Kurulu",
      "",
      "Yönetim kurulu, genel kurul tarafından 2 yıl için seçilen 7 asıl ve 5 yedek üyeden oluşur.",
      "",
      "*Bu örnek metindir. Resmi tüzük PDF dökümanı için derneğimize başvurabilirsiniz.*",
    ].join("\n"),
    sort: 40,
    updatedAt: new Date().toISOString(),
  },
];
