export type Role = "admin" | "member";

export type User = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  joinedAt: string;
  phone?: string;
  city?: string;
};

export type ApplicationStatus =
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected";

/**
 * Yüklenen başvuru belgesinin kimlik anahtarı.
 * RequiredDocument.docKey ile eşleşir; admin tarafından eklenip silinebildiği
 * için string olarak tutulur.
 */
export type DocumentKey = string;

export type ApplicationDocument = {
  key: DocumentKey;
  fileName: string;
  size: number;
  uploadedAt: string;
};

export type ScholarshipApplication = {
  id: string;
  applicantId: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
  score?: number;

  // Step 1 — Personal
  fullName: string;
  nationalId: string;
  birthDate: string;
  gender: "kadin" | "erkek" | "belirtmek_istemiyorum";
  email: string;
  phone: string;
  address: string;
  city: string;

  // Step 2 — Education
  schoolType: "lise" | "onlisans" | "lisans" | "yuksek_lisans" | "doktora";
  schoolName: string;
  department: string;
  grade: string;
  gpa: string;

  // Step 3 — Family
  fatherName: string;
  fatherJob: string;
  fatherIncome: string;
  motherName: string;
  motherJob: string;
  motherIncome: string;
  siblings: number;
  workingMembers: number;
  previousScholarship: boolean;
  previousScholarshipDetail?: string;

  // Step 4 — Bank & motivation
  iban: string;
  motivationLetter: string;

  // Documents
  documents: Partial<Record<DocumentKey, ApplicationDocument>>;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  /** Kategori adı; news_categories tablosundaki name alanıyla eşleşmesi beklenir. */
  category: string;
  publishedAt: string;
  author: string;
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  registered: number;
  /** Kategori adı; event_categories tablosundaki name alanıyla eşleşmesi beklenir. */
  category: string;
};

export type NewsCategory = {
  id: string;
  name: string;
  sort: number;
};

export type EventCategory = {
  id: string;
  name: string;
  sort: number;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
};

/* ====================== İçerik yönetimi ====================== */

export type SiteSettings = {
  name: string;
  shortName: string;
  founded: number;
  slogan: string;
  description: string;
  logoUrl: string;
  logoSubtitle: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactWorkingHours: string;
  mapEmbedUrl: string;
  bankName: string;
  bankAccountHolder: string;
  bankIban: string;
  bankBranch: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialYoutube: string;
  statYearsActive: number;
  statScholarshipsGiven: number;
  statActiveMembers: number;
  statCompletedProjects: number;
  // SEO / Metadata
  seoTitle: string;
  seoTitleTemplate: string;
  seoDescription: string;
  seoOgImage: string;
  seoFaviconUrl: string;
};

/** Sponsor (anasayfa "Sponsorlarımız" bölümünde gösterilen iş ortağı). */
export type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  sort: number;
};

/** Anasayfa "Sponsorlarımız" bölümünün başlığı + CTA butonu. */
export type HomeSponsorsBlock = SectionHeading & {
  cta: {
    visible: boolean;
    label: string;
    href: string;
  };
};

/** Hemşehri duyuru kategorisi (Vefat, Düğün, Nişan, Etkinlik vs.). */
export type AnnouncementCategory = {
  id: string;
  slug: string;
  name: string;
  /** Tailwind renk slug'ı: rose, pink, purple, indigo, blue, sky, cyan, emerald, amber, orange, red, slate, brand */
  color: string;
  sort: number;
};

/** Hemşehrilerden gelen ilan/duyuru (vefat, düğün, nişan, köy etkinliği vb.). */
export type Announcement = {
  id: string;
  categorySlug: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  sort: number;
};

/** Mali tablo kalemi (gelir veya gider). */
export type FinanceItem = {
  id: string;
  year: number;
  kind: "income" | "expense";
  label: string;
  amount: number;
  sort: number;
};

/** Geleneksel Piknik Şöleni Ağası (anasayfa "Ağalarımız" bölümü). */
export type Aga = {
  id: string;
  year: string;
  name: string;
  photoUrl: string;
  caption: string;
  eventDate: string;
  sort: number;
};

/** Yasal sayfa (Gizlilik, KVKK, Çerez Politikası, Tüzük gibi). */
export type LegalPage = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  sort: number;
  updatedAt: string;
};

/** Yönetim Kurulu hiyerarşi seviyesi. */
export type BoardLevel = "baskan" | "yonetim" | "uye";

export type BoardMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  level: BoardLevel;
  sort: number;
};

export type Milestone = {
  id: string;
  year: string;
  text: string;
  sort: number;
};

export type ActivityReport = {
  id: string;
  year: string;
  pdfUrl: string;
  sort: number;
};

export type ScholarshipProgram = {
  id: string;
  title: string;
  monthly: string;
  duration: string;
  targets: string;
  quota: number;
  requirements: string[];
  sort: number;
};

export type RequiredDocument = {
  id: string;
  /** Başvuru formundaki dosya yükleme alanını eşleştiren benzersiz anahtar. */
  docKey: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  sort: number;
};

export type ScholarshipTimelineStep = {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
  sort: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort: number;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
  sort: number;
};

export type DonationPreset = {
  id: string;
  amount: number;
  sort: number;
};

export type DonationUse = {
  id: string;
  text: string;
  sort: number;
};

/* Sayfa blokları (key-value JSON içerikleri) */
export type HeroBlock = {
  badgeText: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  primaryButton: { label: string; href: string };
  secondaryButton: { label: string; href: string };
  imageUrl: string;
  imageOverlayLabel: string;
  imageOverlayTitle: string;
  imageOverlayDesc: string;
  floatBadge1: { label: string; value: string };
  floatBadge2: { label: string; value: string };
};

export type AboutCard = {
  icon: string; // emoji
  title: string;
  text: string;
};

export type HomeProgramCard = {
  number: string;
  title: string;
  desc: string;
  tag: string;
};

export type ScholarshipCheck = string;
export type ScholarshipCalendarRow = { label: string; date: string };

export type HomeScholarshipCTA = {
  badge: string;
  title: string;
  description: string;
  checks: ScholarshipCheck[];
  calendar: ScholarshipCalendarRow[];
  primaryButton: { label: string; href: string };
  secondaryButton: { label: string; href: string };
};

export type SectionHeading = {
  eyebrow: string;
  title: string;
  description?: string;
};

export type AboutValueCard = AboutCard; // aynı yapı (Vizyon/Misyon/Değerler)

export type AboutTransparencyBlock = {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
};

export type BurseHero = {
  badge: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
};

export type DonationSidebar = {
  title: string;
  transparencyTitle: string;
  transparencyText: string;
};

export type FooterLinkGroup = {
  title: string;
  links: { label: string; href: string }[];
};

export type FooterConfig = {
  groups: FooterLinkGroup[];
  legalLinks: { label: string; href: string }[];
};

/** Header (üst menü) konfigürasyonu — admin'den yönetilir. */
export type HeaderConfig = {
  /** Üst bar (telefon/email çubuğunun sağındaki) admin paneli linki. */
  topBar: {
    showAdminLink: boolean;
    adminLinkLabel: string;
  };
  /** Ana navigasyon menüsü. */
  menu: { label: string; href: string }[];
  /** Sağdaki sarı CTA butonu (Burs Başvur). visible=false ise gizlenir. */
  ctaButton: {
    visible: boolean;
    label: string;
    href: string;
  };
};

/** Sayfa üst başlıkları (PageHeader): her public sayfa için title + description */
export type PageHeaderItem = { title: string; description: string };
export type PageHeadersMap = {
  hakkimizda: PageHeaderItem;
  burs: PageHeaderItem;
  burs_basvuru: PageHeaderItem;
  bagis: PageHeaderItem;
  haberler: PageHeaderItem;
  etkinlikler: PageHeaderItem;
  duyurular: PageHeaderItem;
  yonetim: PageHeaderItem;
  iletisim: PageHeaderItem;
  "mali-tablo": PageHeaderItem;
  hesabim: PageHeaderItem;
};

/** Giriş / Kayıt sayfaları + auth layout sağ paneli için metinler */
export type AuthUiText = {
  login: {
    title: string;
    description: string;
    submitButton: string;
    registerPrompt: string;
    registerLink: string;
  };
  register: {
    title: string;
    description: string;
    submitButton: string;
    loginPrompt: string;
    loginLink: string;
  };
  sidePanel: {
    label: string;
    headline: string;
    description: string;
    imageUrl: string;
  };
  /** true ise login sayfasında demo hesap bölümü gösterilir. Üretimde kapatın. */
  showDemoAccounts: boolean;
  demoAccountsTitle: string;
  /** Her satır: "etiket | e-posta / parola" formatı */
  demoAccountsLines: string[];
};

/**
 * Public sayfalardaki küçük UI metinleri (filtre etiketleri, boş durum
 * yazıları, butonlar, toast başlıkları vb.). Tek bir "ui.common" page block'u
 * altında tutulur ve admin panelinden bütünüyle yönetilir.
 */
export type CommonUiText = {
  /** Genel: yükleniyor metni (sayfa içi spinner alternatifi). */
  loadingText: string;

  /** Liste filtreleri: "Tümü" gibi ortak etiketler. */
  filters: {
    allLabel: string;
  };

  /** /haberler liste sayfası */
  newsList: {
    searchPlaceholder: string;
    emptyState: string;
  };

  /** /haberler/[slug] detay sayfası */
  newsDetail: {
    backLink: string;
    sidebarTitle: string;
  };

  /** /etkinlikler kartı + kayıt etkileşimi */
  events: {
    bookButton: string;
    freeNote: string;
    bookSuccessTitle: string;
    bookSuccessMessage: string;
  };

  /** /hesabim sayfası */
  account: {
    logoutButton: string;
    adminPanelButton: string;
    applicationsTitle: string;
    newApplicationButton: string;
    emptyTitle: string;
    emptyDescription: string;
    startApplicationButton: string;
    profileTipTitle: string;
    profileTipDescription: string;
    profileTipNote: string;
    reviewerNoteLabel: string;
    membershipLabel: string;
    roleAdminLabel: string;
    roleMemberLabel: string;
  };

  /** /bagis sayfası */
  donation: {
    presetBadge: string;
    presetTitle: string;
    customAmountLabel: string;
    customAmountPlaceholder: string;
    bankInfoTitle: string;
    bankNote: string;
    summaryLabel: string;
    submitButton: string;
    submitToastTitle: string;
    submitToastMessage: string;
    copyToastTitle: string;
    copyToastError: string;
  };

  /** /iletisim sayfası */
  contact: {
    formTitle: string;
    formDescription: string;
    submitButton: string;
    kvkkNote: string;
    successTitle: string;
    successDescription: string;
    sidebarTitle: string;
  };

  /** Bulunamayan sayfa (not-found) */
  notFound: {
    title: string;
    description: string;
    homeButton: string;
  };

  /** Header (üst menü) butonları ve hesap dropdown metinleri */
  header: {
    loginButton: string;
    registerButton: string;
    accountMenuTitle: string;
    accountMenuApplication: string;
    accountMenuAdmin: string;
    accountMenuLogout: string;
    mobileApplyButton: string;
    menuLabel: string;
  };
};

/** Burs başvuru formu: adım başlıkları, butonlar, onay metni, başarı ekranı */
export type ApplicationFormText = {
  steps: {
    personal: PageHeaderItem;
    education: PageHeaderItem;
    family: PageHeaderItem;
    documents: PageHeaderItem;
    finalize: PageHeaderItem;
  };
  consentText: string;
  buttons: {
    prev: string;
    next: string;
    submit: string;
  };
  success: {
    title: string;
    description: string;
    newApplicationButton: string;
    accountButton: string;
  };
};
