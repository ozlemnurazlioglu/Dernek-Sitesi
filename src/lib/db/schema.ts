import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  datetime,
  date,
  decimal,
  mysqlEnum,
  primaryKey,
  index,
  json,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    fullName: varchar("full_name", { length: 191 }).notNull(),
    email: varchar("email", { length: 191 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 191 }).notNull(),
    role: mysqlEnum("role", ["admin", "member"]).notNull().default("member"),
    joinedAt: datetime("joined_at", { fsp: 3 }).notNull(),
    phone: varchar("phone", { length: 64 }),
    city: varchar("city", { length: 128 }),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const sessions = mysqlTable(
  "sessions",
  {
    token: varchar("token", { length: 128 }).primaryKey(),
    userId: varchar("user_id", { length: 64 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: datetime("created_at", { fsp: 3 }).notNull(),
    expiresAt: datetime("expires_at", { fsp: 3 }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const applications = mysqlTable(
  "applications",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    applicantId: varchar("applicant_id", { length: 64 }).notNull(),
    status: mysqlEnum("status", [
      "submitted",
      "in_review",
      "approved",
      "rejected",
    ])
      .notNull()
      .default("submitted"),
    submittedAt: datetime("submitted_at", { fsp: 3 }).notNull(),
    reviewedAt: datetime("reviewed_at", { fsp: 3 }),
    reviewerNote: text("reviewer_note"),
    score: int("score"),

    // Step 1 — Personal
    fullName: varchar("full_name", { length: 191 }).notNull(),
    nationalId: varchar("national_id", { length: 32 }).notNull(),
    birthDate: date("birth_date", { mode: "string" }).notNull(),
    gender: mysqlEnum("gender", ["kadin", "erkek", "belirtmek_istemiyorum"])
      .notNull()
      .default("belirtmek_istemiyorum"),
    email: varchar("email", { length: 191 }).notNull(),
    phone: varchar("phone", { length: 64 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 128 }).notNull(),

    // Step 2 — Education
    schoolType: mysqlEnum("school_type", [
      "lise",
      "onlisans",
      "lisans",
      "yuksek_lisans",
      "doktora",
    ]).notNull(),
    schoolName: varchar("school_name", { length: 191 }).notNull(),
    department: varchar("department", { length: 191 }).notNull(),
    grade: varchar("grade", { length: 32 }).notNull(),
    gpa: varchar("gpa", { length: 16 }).notNull(),

    // Step 3 — Family
    fatherName: varchar("father_name", { length: 191 }).notNull(),
    fatherJob: varchar("father_job", { length: 191 }).notNull(),
    fatherIncome: varchar("father_income", { length: 32 }).notNull(),
    motherName: varchar("mother_name", { length: 191 }).notNull(),
    motherJob: varchar("mother_job", { length: 191 }).notNull(),
    motherIncome: varchar("mother_income", { length: 32 }).notNull(),
    siblings: int("siblings").notNull().default(0),
    workingMembers: int("working_members").notNull().default(0),
    previousScholarship: boolean("previous_scholarship").notNull().default(false),
    previousScholarshipDetail: text("previous_scholarship_detail"),

    // Step 4 — Bank & motivation
    iban: varchar("iban", { length: 64 }).notNull(),
    motivationLetter: text("motivation_letter").notNull(),
  },
  (t) => [
    index("applications_applicant_idx").on(t.applicantId),
    index("applications_status_idx").on(t.status),
  ],
);

export const applicationDocuments = mysqlTable(
  "application_documents",
  {
    applicationId: varchar("application_id", { length: 64 })
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    docKey: varchar("doc_key", { length: 64 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    size: int("size").notNull(),
    uploadedAt: datetime("uploaded_at", { fsp: 3 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.applicationId, t.docKey] })],
);

export const news = mysqlTable(
  "news",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 191 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    cover: varchar("cover", { length: 512 }).notNull(),
    category: varchar("category", { length: 80 }).notNull().default("Haber"),
    publishedAt: datetime("published_at", { fsp: 3 }).notNull(),
    author: varchar("author", { length: 191 }).notNull(),
  },
  (t) => [index("news_slug_idx").on(t.slug)],
);

export const events = mysqlTable("events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  slug: varchar("slug", { length: 191 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  cover: varchar("cover", { length: 512 }).notNull(),
  startsAt: datetime("starts_at", { fsp: 3 }).notNull(),
  endsAt: datetime("ends_at", { fsp: 3 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  capacity: int("capacity").notNull().default(0),
  registered: int("registered").notNull().default(0),
  category: varchar("category", { length: 80 }).notNull().default("Eğitim"),
});

// Haber kategorileri (admin yönetilir)
export const newsCategories = mysqlTable(
  "news_categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 80 }).notNull().unique(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("news_categories_sort_idx").on(t.sort)],
);

// Etkinlik kategorileri (admin yönetilir)
export const eventCategories = mysqlTable(
  "event_categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 80 }).notNull().unique(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("event_categories_sort_idx").on(t.sort)],
);

export const messages = mysqlTable(
  "messages",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    email: varchar("email", { length: 191 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    message: text("message").notNull(),
    createdAt: datetime("created_at", { fsp: 3 }).notNull(),
    read: boolean("read").notNull().default(false),
  },
  (t) => [index("messages_created_idx").on(t.createdAt)],
);

/* ====================================================================
   İçerik yönetimi tabloları (admin panelinden düzenlenebilir alanlar)
   ==================================================================== */

// Tek satırlık singleton. id her zaman 'main'.
export const siteSettings = mysqlTable("site_settings", {
  id: varchar("id", { length: 16 }).primaryKey().default("main"),
  // Genel
  name: varchar("name", { length: 191 }).notNull(),
  shortName: varchar("short_name", { length: 100 }).notNull(),
  founded: int("founded").notNull(),
  slogan: varchar("slogan", { length: 255 }).notNull(),
  description: text("description").notNull(),
  // Logo (header/footer için raster ya da SVG URL'i; boşsa varsayılan SVG)
  logoUrl: varchar("logo_url", { length: 512 }).notNull().default(""),
  logoSubtitle: varchar("logo_subtitle", { length: 191 })
    .notNull()
    .default(""),
  // İletişim
  contactAddress: text("contact_address").notNull(),
  contactPhone: varchar("contact_phone", { length: 64 }).notNull(),
  contactEmail: varchar("contact_email", { length: 191 }).notNull(),
  contactWorkingHours: varchar("contact_working_hours", { length: 191 }).notNull(),
  mapEmbedUrl: text("map_embed_url").notNull(),
  // Banka
  bankName: varchar("bank_name", { length: 191 }).notNull(),
  bankAccountHolder: varchar("bank_account_holder", { length: 191 }).notNull(),
  bankIban: varchar("bank_iban", { length: 64 }).notNull(),
  bankBranch: varchar("bank_branch", { length: 191 }).notNull(),
  // Sosyal
  socialFacebook: varchar("social_facebook", { length: 512 }).notNull().default(""),
  socialInstagram: varchar("social_instagram", { length: 512 }).notNull().default(""),
  socialTwitter: varchar("social_twitter", { length: 512 }).notNull().default(""),
  socialLinkedin: varchar("social_linkedin", { length: 512 }).notNull().default(""),
  socialYoutube: varchar("social_youtube", { length: 512 }).notNull().default(""),
  // İstatistikler
  statYearsActive: int("stat_years_active").notNull().default(0),
  statScholarshipsGiven: int("stat_scholarships_given").notNull().default(0),
  statActiveMembers: int("stat_active_members").notNull().default(0),
  statCompletedProjects: int("stat_completed_projects").notNull().default(0),
  // SEO / Metadata
  seoTitle: varchar("seo_title", { length: 191 }).notNull().default(""),
  seoTitleTemplate: varchar("seo_title_template", { length: 191 })
    .notNull()
    .default(""),
  seoDescription: text("seo_description").notNull(),
  seoOgImage: varchar("seo_og_image", { length: 512 }).notNull().default(""),
  seoFaviconUrl: varchar("seo_favicon_url", { length: 512 }).notNull().default(""),
  // Analytics & Reklam — admin panelden girilen ID'ler. Boşsa ilgili
  // takip/reklam scripti hiç render edilmez.
  gaMeasurementId: varchar("ga_measurement_id", { length: 64 }).notNull().default(""),
  gtmContainerId: varchar("gtm_container_id", { length: 64 }).notNull().default(""),
  metaPixelId: varchar("meta_pixel_id", { length: 64 }).notNull().default(""),
  adsensePublisherId: varchar("adsense_publisher_id", { length: 64 }).notNull().default(""),
  customTrackingHtml: text("custom_tracking_html").notNull(),
  updatedAt: datetime("updated_at", { fsp: 3 }).notNull(),
});

// Sayfa bölümleri için key-value JSON. Esnek metin/yapı düzenlenmesi.
export const pageBlocks = mysqlTable("page_blocks", {
  blockKey: varchar("block_key", { length: 100 }).primaryKey(),
  data: json("data").notNull(),
  updatedAt: datetime("updated_at", { fsp: 3 }).notNull(),
});

// Yönetim kurulu üyeleri
export const boardMembers = mysqlTable(
  "board_members",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    role: varchar("role", { length: 191 }).notNull(),
    avatar: varchar("avatar", { length: 512 }).notNull(),
    // TiDB, text/blob türlerinde DEFAULT desteklemediğinden varchar(2000)
    // kullanıyoruz. 2000 karakter kısa biyografi için fazlasıyla yeterli.
    bio: varchar("bio", { length: 2000 }).notNull().default(""),
    /** Hiyerarşik seviye: 'baskan' | 'yonetim' | 'uye' */
    level: varchar("level", { length: 32 }).notNull().default("uye"),
    sort: int("sort").notNull().default(0),
  },
  (t) => [
    index("board_sort_idx").on(t.sort),
    index("board_level_idx").on(t.level),
  ],
);

// Tarihçe (zaman çizelgesi)
export const milestones = mysqlTable(
  "milestones",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    year: varchar("year", { length: 16 }).notNull(),
    text: text("text").notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("milestones_sort_idx").on(t.sort)],
);

// Faaliyet raporları
export const activityReports = mysqlTable(
  "activity_reports",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    year: varchar("year", { length: 16 }).notNull(),
    pdfUrl: varchar("pdf_url", { length: 512 }).notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("reports_sort_idx").on(t.sort)],
);

// Burs programları
export const scholarshipPrograms = mysqlTable(
  "scholarship_programs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    title: varchar("title", { length: 191 }).notNull(),
    monthly: varchar("monthly", { length: 64 }).notNull(),
    duration: varchar("duration", { length: 100 }).notNull(),
    targets: varchar("targets", { length: 191 }).notNull(),
    quota: int("quota").notNull().default(0),
    requirements: json("requirements").notNull(), // string[]
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("programs_sort_idx").on(t.sort)],
);

// İstenen belgeler (burs). docKey, başvuru formundaki dosya yükleme alanlarının
// kimliğidir (örn. "id_card", "transcript"). required false ise belge opsiyoneldir.
export const requiredDocuments = mysqlTable(
  "required_documents",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    docKey: varchar("doc_key", { length: 64 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull().default(""),
    icon: varchar("icon", { length: 16 }).notNull().default("📄"),
    required: boolean("required").notNull().default(true),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("docs_sort_idx").on(t.sort)],
);

// Burs başvuru takvimi
export const scholarshipTimeline = mysqlTable(
  "scholarship_timeline",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    dateLabel: varchar("date_label", { length: 100 }).notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("timeline_sort_idx").on(t.sort)],
);

// SSS
export const faqs = mysqlTable(
  "faqs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    question: varchar("question", { length: 512 }).notNull(),
    answer: text("answer").notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("faqs_sort_idx").on(t.sort)],
);

// Bursiyer yorumları
export const testimonials = mysqlTable(
  "testimonials",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    role: varchar("role", { length: 191 }).notNull(),
    avatar: varchar("avatar", { length: 512 }).notNull(),
    text: text("text").notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("testimonials_sort_idx").on(t.sort)],
);

// Bağış preset tutarları
export const donationPresets = mysqlTable(
  "donation_presets",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    amount: int("amount").notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("presets_sort_idx").on(t.sort)],
);

// Bağışın kullanım maddeleri
export const donationUses = mysqlTable(
  "donation_uses",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    text: varchar("text", { length: 255 }).notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("uses_sort_idx").on(t.sort)],
);

// Sponsor türleri (Platin / Altın / Gümüş / Bronz vb.) — admin'den yönetilir,
// her türün kendi rengi vardır; sponsor logoları bu renkle çerçevelenir.
export const sponsorTiers = mysqlTable(
  "sponsor_tiers",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 191 }).notNull(),
    color: varchar("color", { length: 32 }).notNull().default("slate"),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("sponsor_tiers_sort_idx").on(t.sort)],
);

// Sponsorlar (anasayfa "Sponsorlarımız" bölümünde gösterilen iş ortakları).
export const sponsors = mysqlTable(
  "sponsors",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    logoUrl: varchar("logo_url", { length: 512 }).notNull().default(""),
    websiteUrl: varchar("website_url", { length: 512 }).notNull().default(""),
    /** sponsor_tiers.slug ile eşleşir; boş string → türsüz (nötr çerçeve). */
    tierSlug: varchar("tier_slug", { length: 80 }).notNull().default(""),
    sort: int("sort").notNull().default(0),
  },
  (t) => [
    index("sponsors_sort_idx").on(t.sort),
    index("sponsors_tier_idx").on(t.tierSlug),
  ],
);

// Hemşehri duyuru/ilan kategorileri (Vefat, Düğün, Nişan vb.) — renk slug'ları ile.
export const announcementCategories = mysqlTable(
  "announcement_categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 191 }).notNull(),
    color: varchar("color", { length: 32 }).notNull().default("slate"),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("announcement_cats_sort_idx").on(t.sort)],
);

// Hemşehrilerden gelen ilanlar/duyurular (vefat, düğün, nişan, köy etkinliği vs.).
export const announcements = mysqlTable(
  "announcements",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    categorySlug: varchar("category_slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 2000 }).notNull().default(""),
    eventDate: varchar("event_date", { length: 64 }).notNull().default(""),
    location: varchar("location", { length: 191 }).notNull().default(""),
    /** İlgili kişiye ulaşmak için telefon (opsiyonel; tel: linki olarak gösterilir). */
    phone: varchar("phone", { length: 64 }).notNull().default(""),
    sort: int("sort").notNull().default(0),
  },
  (t) => [
    index("announcements_cat_idx").on(t.categorySlug),
    index("announcements_sort_idx").on(t.sort),
  ],
);

// Mali tablo kalemleri (gelir/gider). /mali-tablo sayfasında yıl bazında listelenir.
export const financeItems = mysqlTable(
  "finance_items",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    year: int("year").notNull(),
    kind: varchar("kind", { length: 16 }).notNull(), // 'income' | 'expense'
    label: varchar("label", { length: 191 }).notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull().default("0"),
    sort: int("sort").notNull().default(0),
  },
  (t) => [
    index("finance_year_idx").on(t.year),
    index("finance_kind_idx").on(t.kind),
  ],
);

// Geleneksel Piknik Şöleni Ağaları (anasayfa "Ağalarımız" bölümü).
export const agalar = mysqlTable(
  "agalar",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    year: varchar("year", { length: 16 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    photoUrl: varchar("photo_url", { length: 512 }).notNull(),
    caption: varchar("caption", { length: 191 }).notNull().default(""),
    eventDate: varchar("event_date", { length: 32 }).notNull().default(""),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("agalar_sort_idx").on(t.sort)],
);

// Foto galeri kategorileri (örn. "Dernek Merkezimiz"). slug URL'de kullanılır.
export const photoCategories = mysqlTable(
  "photo_categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 191 }).notNull(),
    description: varchar("description", { length: 500 }).notNull().default(""),
    coverUrl: varchar("cover_url", { length: 512 }).notNull().default(""),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("photo_cats_sort_idx").on(t.sort)],
);

// Foto galeri öğeleri — admin panelden yüklenen tek tek fotoğraflar.
export const photos = mysqlTable(
  "photos",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    categorySlug: varchar("category_slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 255 }).notNull().default(""),
    imageUrl: varchar("image_url", { length: 512 }).notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [
    index("photos_cat_idx").on(t.categorySlug),
    index("photos_sort_idx").on(t.sort),
  ],
);

// Video galeri kategorileri.
export const videoCategories = mysqlTable(
  "video_categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 191 }).notNull(),
    description: varchar("description", { length: 500 }).notNull().default(""),
    coverUrl: varchar("cover_url", { length: 512 }).notNull().default(""),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("video_cats_sort_idx").on(t.sort)],
);

// Video galeri öğeleri — admin panelden yüklenen MP4/WebM dosyaları.
export const videos = mysqlTable(
  "videos",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    categorySlug: varchar("category_slug", { length: 80 }).notNull(),
    title: varchar("title", { length: 255 }).notNull().default(""),
    description: varchar("description", { length: 1000 }).notNull().default(""),
    videoUrl: varchar("video_url", { length: 512 }).notNull(),
    posterUrl: varchar("poster_url", { length: 512 }).notNull().default(""),
    sort: int("sort").notNull().default(0),
  },
  (t) => [
    index("videos_cat_idx").on(t.categorySlug),
    index("videos_sort_idx").on(t.sort),
  ],
);

// Mahalle bilgileri — /hakkimizda/mahallelerimiz sayfasındaki tablonun verileri.
// Her satır bir mahalleyi temsil eder: ad + muhtar + telefon.
export const neighborhoods = mysqlTable(
  "neighborhoods",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    headman: varchar("headman", { length: 191 }).notNull().default(""),
    phone: varchar("phone", { length: 64 }).notNull().default(""),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("neighborhoods_sort_idx").on(t.sort)],
);

// Bağışçılar (anasayfa "Bağışçılarımız" bölümünde listelenir).
// donatedAt: 'YYYY-MM-DD' formatında string olarak saklanır (zone problemi yok).
// amount: 0 ise UI'da miktar gizlenebilir (anonim bağış).
export const donors = mysqlTable(
  "donors",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 191 }).notNull(),
    donatedAt: varchar("donated_at", { length: 32 }).notNull().default(""),
    amount: int("amount").notNull().default(0),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("donors_sort_idx").on(t.sort)],
);

// Yasal/sabit içerik sayfaları (Gizlilik, KVKK, Çerez, Tüzük vb.).
// slug, /[slug] yoluyla doğrudan URL'e karşılık gelir. content markdown'dur.
export const legalPages = mysqlTable(
  "legal_pages",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    title: varchar("title", { length: 191 }).notNull(),
    description: varchar("description", { length: 255 }).notNull().default(""),
    content: text("content").notNull(),
    sort: int("sort").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("legal_pages_slug_idx").on(t.slug)],
);
