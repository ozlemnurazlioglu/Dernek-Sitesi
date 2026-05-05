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
  /** Yüklenen dosyanın public URL'i (Vercel Blob veya /uploads/...).
   *  Eski demo başvurularda tanımsız olabilir. */
  url?: string;
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
  // Analytics & Reklam — ID'ler. Boşsa ilgili kod hiç render edilmez.
  /** Google Analytics 4 ölçüm ID'si, örn. "G-XXXXXXX". */
  gaMeasurementId: string;
  /** Google Tag Manager container ID, örn. "GTM-XXXXXX". */
  gtmContainerId: string;
  /** Meta (Facebook) Pixel ID — sadece sayısal, örn. "1234567890". */
  metaPixelId: string;
  /** Google AdSense Publisher ID, örn. "ca-pub-1234567890123456". */
  adsensePublisherId: string;
  /**
   * Özel takip/reklam HTML kodu — body kapanışından önce site genelinde
   * render edilir. Yapıştırılan HTML olduğu gibi gösterilir; sadece güvenilir
   * kaynaklardan kod ekleyin.
   */
  customTrackingHtml: string;
};

/** Sponsor (anasayfa "Sponsorlarımız" bölümünde gösterilen iş ortağı). */
export type Sponsor = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
  /**
   * Sponsor türünün slug'ı (sponsor_tiers tablosundaki slug ile eşleşir).
   * Boş ise türsüz (nötr çerçeve).
   */
  tierSlug: string;
  sort: number;
};

/**
 * Sponsor türü (Platin, Altın, Gümüş, Bronz vb.). Her türün kendi rengi
 * vardır; sponsor logosunun çevresine bu renkten çerçeve çizilir ve
 * altında küçük bir tür etiketi gösterilir.
 */
export type SponsorTier = {
  id: string;
  slug: string;
  name: string;
  /** Renk slug'ı: gold, silver, bronze, platinum, amber, slate, brand vb. */
  color: string;
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
  /**
   * İlgili kişinin iletişim numarası (opsiyonel). Doluyken duyuru kartında
   * `tel:` linki olarak gösterilir; tıklandığında telefon tuşlanır.
   */
  phone: string;
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

/* ====================== Ana Sayfa Düzeni ====================== */

/**
 * Ana sayfada bulunan blok kimlikleri. Yeni bir blok eklendiğinde buraya da
 * eklenmelidir; eski layout kayıtlarında bu yeni blok bulunmazsa otomatik
 * olarak listenin sonuna `enabled: true` ile eklenir (forward compatibility).
 */
export type HomeBlockId =
  | "hero"
  | "about"
  | "programs"
  | "scholarship_cta"
  | "news"
  | "events"
  | "testimonials"
  | "agalar"
  | "announcements"
  | "sponsors"
  | "donors"
  | "donate";

export type HomeLayoutItem = {
  id: HomeBlockId;
  /** false ise blok ana sayfada hiç render edilmez. */
  enabled: boolean;
};

/**
 * Ana sayfanın blok sırası ve görünürlük ayarları. `home.layout` page block
 * key'i altında saklanır. Admin panelinden tek tek blokların yerini değiştirip
 * gizleyebilirsiniz.
 */
export type HomeLayout = {
  items: HomeLayoutItem[];
};

/* ====================== Galeri (Foto/Video) ====================== */

/**
 * Foto galeri kategorisi (örn. "Dernek Merkezimiz", "Etkinliklerden Kareler").
 * `slug`, URL'de `/galeri/foto/<slug>` olarak görünür.
 */
export type PhotoCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Kategori kart kapağı için temsili görsel URL'i. Boş olabilir. */
  coverUrl: string;
  sort: number;
};

/** Bir foto kategorisindeki tek fotoğraf. */
export type Photo = {
  id: string;
  /** PhotoCategory.slug — kategori belirteci. */
  categorySlug: string;
  /** Görsel açıklaması / başlık (alt metin olarak da kullanılır). */
  title: string;
  imageUrl: string;
  sort: number;
};

/**
 * Video galeri kategorisi (örn. "Etkinlik Videoları", "Tanıtım Filmleri").
 * `slug`, URL'de `/galeri/video/<slug>` olarak görünür.
 */
export type VideoCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Kategori kart kapağı için temsili görsel URL'i. Boş olabilir. */
  coverUrl: string;
  sort: number;
};

/** Bir video kategorisindeki tek video. Yüklenen MP4/WebM dosyası. */
export type Video = {
  id: string;
  /** VideoCategory.slug — kategori belirteci. */
  categorySlug: string;
  title: string;
  description: string;
  /** Yüklenen video dosyasının public URL'i. */
  videoUrl: string;
  /** Opsiyonel poster (kapak görseli). Boşsa video ilk frame'i kullanılır. */
  posterUrl: string;
  sort: number;
};

/**
 * Mahalle kaydı — `/hakkimizda/mahallelerimiz` sayfasındaki tabloda satır
 * olarak görünür. Admin panelden eklenip çıkarılabilir.
 */
export type Neighborhood = {
  id: string;
  /** Mahallenin adı (örn. "Yalı Mahallesi"). */
  name: string;
  /** Görevli muhtarın tam adı. */
  headman: string;
  /** İletişim için telefon (boş bırakılabilir; doluysa tel: linki olur). */
  phone: string;
  sort: number;
};

/**
 * Bağışçı kaydı — ana sayfadaki "Bağışçılarımız" listesinde gösterilir.
 * Admin panelinden manuel eklenir; otomatik bir bağış işleme entegrasyonu
 * yoktur. `donatedAt` ISO string ya da `YYYY-MM-DD` formatında gelebilir;
 * UI tarafında `formatDateTR` ile insanca formatlanır.
 */
export type Donor = {
  id: string;
  /** Bağışçının görünen adı (örn. "Ahmet Yılmaz"). */
  name: string;
  /** Bağış tarihi — `YYYY-MM-DD` ya da ISO string. */
  donatedAt: string;
  /** TL cinsinden bağış miktarı. 0 ise UI'da miktar gizlenir. */
  amount: number;
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

/**
 * Hero kartında dönen tek bir slayt. Admin panelinden dilenen sayıda
 * eklenebilir; site Hero alanı bu listeyi otomatik kayan + sürüklenebilir
 * bir slider olarak gösterir.
 */
export type HeroSlide = {
  imageUrl: string;
  overlayLabel: string;
  overlayTitle: string;
  overlayDesc: string;
  /**
   * Slayt üzerinde gösterilen küçük bilgi kutusunu (etiket / başlık / açıklama)
   * göstermek isteyip istemediğini belirler. Tanımlı değilse `true` kabul edilir.
   */
  showOverlay?: boolean;
  /**
   * Bu slayta özel birincil buton — tanımlıysa ve label doluysa hero'nun
   * GLOBAL birincil butonu yerine bunu gösterir. label boşsa global butona
   * geri düşer (geriye dönük uyumluluk: eski slaytlarda alan tanımsız).
   *
   * Kullanım örneği: bir slayt habere, başkası burs başvurusuna,
   * başkası etkinliğe yönlendirsin.
   */
  primaryButton?: { label: string; href: string };
  /**
   * Bu slayta özel ikincil buton — birincil ile aynı mantık. label boşsa
   * global ikincil butona geri düşer.
   */
  secondaryButton?: { label: string; href: string };

  /* —————— Slayta özel METİN override'ları ——————
   * Hepsi opsiyoneldir; boş/tanımsızsa hero'nun ortak (global) değeri kullanılır.
   * Bu sayede her slayt; rozet, başlık, alt yazı ve yüzen rozetlerini
   * kendi temasına göre değiştirebilir (ör. burs slaytı vs etkinlik slaytı). */

  /** Slaytın sol üstündeki rozet metni. Doldurulursa
   *  `{founded}{hero.badgeText}` yerine SADECE bu metin gösterilir. */
  badgeText?: string;
  /** Başlık üç parçası — herhangi biri non-empty ise bu üç alan global
   *  başlığın TAMAMINI yerine geçer (boş alanlar boş olarak basılır). */
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  /** Alt yazı — non-empty ise global subtitle yerine kullanılır.
   *  `{yearsActive}` yer tutucusu burada da çalışır. */
  subtitle?: string;
  /** Sağ üstteki ilk yüzen rozet override'ı. Hem label hem value boşsa
   *  global `floatBadge1` kullanılır. */
  floatBadge1?: { label: string; value: string };
  /** Sağ üstteki ikinci yüzen rozet override'ı. */
  floatBadge2?: { label: string; value: string };
};

export type HeroBlock = {
  badgeText: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  subtitle: string;
  primaryButton: { label: string; href: string };
  secondaryButton: { label: string; href: string };
  /**
   * Yeni — Hero kartında dönen slaytlar. Boş veya tanımsızsa Hero
   * komponenti aşağıdaki tek-görsel alanlarından (imageUrl / imageOverlay*)
   * otomatik olarak tek bir slayt türetir (geriye dönük uyumluluk).
   */
  slides?: HeroSlide[];
  /** @deprecated `slides[0].imageUrl` kullanın. Geriye uyumluluk için tutuluyor. */
  imageUrl?: string;
  /** @deprecated `slides[0].overlayLabel` kullanın. */
  imageOverlayLabel?: string;
  /** @deprecated `slides[0].overlayTitle` kullanın. */
  imageOverlayTitle?: string;
  /** @deprecated `slides[0].overlayDesc` kullanın. */
  imageOverlayDesc?: string;
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
  /**
   * Sitenin en altında küçük bir şerit halinde listelenen şirket bağlantıları.
   * Her biri ad + URL içerir; tıklandığında yeni sekmede açılır. Boş array
   * veya tanımsız ise bu blok hiç gösterilmez. Geri uyumluluk için opsiyonel.
   */
  supporters?: { name: string; href: string }[];
  /**
   * Destekçiler şeridinin başlığı.
   *  - `undefined` → varsayılan "Destekçilerimiz" başlığı kullanılır
   *  - `""` (boş string) → başlık hiç gösterilmez, sadece destekçi adları
   *  - Başka bir değer → bu metin başlık olarak gösterilir (ör. "Site Sponsoru")
   */
  supportersTitle?: string;
};

/**
 * Header'da bir menü öğesi. Tek seviye alt menü desteği vardır:
 * `children` doluysa öğe üzerine gelindiğinde dropdown açılır. İç içe
 * (alt-altın altı) submenu desteklenmez — UI sade kalsın diye bilinçli
 * tercih.
 */
export type HeaderMenuItem = {
  label: string;
  href: string;
  enabled?: boolean;
  /**
   * Alt menü öğeleri. Tanımsız veya boş array ise submenu yok, öğe
   * doğrudan link olarak çalışır.
   */
  children?: { label: string; href: string; enabled?: boolean }[];
};

/** Header (üst menü) konfigürasyonu — admin'den yönetilir. */
export type HeaderConfig = {
  /** Üst bar (telefon/email çubuğunun sağındaki) admin paneli linki. */
  topBar: {
    showAdminLink: boolean;
    adminLinkLabel: string;
  };
  /**
   * Ana navigasyon menüsü. Sıra dizideki sıraya göredir; admin panelden
   * yukarı/aşağı taşınarak değiştirilir.
   *
   * `enabled` tanımlı değilse veya `true` ise öğe gösterilir.
   * `enabled === false` olan öğeler menüde **hiç** görünmez (örn. "Burs"
   * dönemi bittiğinde geçici olarak kapatmak için).
   */
  menu: HeaderMenuItem[];
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
