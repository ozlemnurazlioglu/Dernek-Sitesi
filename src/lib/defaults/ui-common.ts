import type { CommonUiText } from "@/lib/types";

/**
 * Public sayfalardaki küçük UI metinleri için varsayılanlar.
 *
 * DB'de "ui.common" page block'u henüz yoksa veya admin panelinden bazı
 * alanlar kaldırılmışsa fallback olarak kullanılır. İstemci paketine
 * bağımlılığını minimumda tutmak için seed-content.ts'i değil bu dosyayı
 * import edin.
 */
export const DEFAULT_COMMON_UI: CommonUiText = {
  loadingText: "Yükleniyor…",

  filters: {
    allLabel: "Tümü",
  },

  newsList: {
    searchPlaceholder: "Haberlerde ara...",
    emptyState: "Aradığınız kriterlere uygun haber bulunamadı.",
  },

  newsDetail: {
    backLink: "Tüm haberler",
    sidebarTitle: "Diğer haberler",
  },

  events: {
    bookButton: "Hemen Kayıt Ol",
    freeNote: "",
    bookSuccessTitle: "Kaydınız alındı",
    bookSuccessMessage:
      "Etkinliğe kaydınız oluşturuldu. Yetkililerimiz gerektiğinde sizinle iletişime geçecektir.",
    loginRequiredTitle: "Üye girişi gerekli",
    loginRequiredMessage:
      "Etkinliğe kayıt olmak için önce üye girişi yapmanız gerekmektedir.",
    fullButton: "Kontenjan Doldu",
    cancelButton: "Kaydı İptal Et",
    cancelSuccessTitle: "Kaydınız iptal edildi",
    cancelSuccessMessage:
      "Etkinlik kaydınız başarıyla iptal edildi. Dilerseniz tekrar kayıt olabilirsiniz.",
  },

  account: {
    logoutButton: "Çıkış Yap",
    adminPanelButton: "Yönetim Paneli",
    applicationsTitle: "Burs Başvurularım",
    newApplicationButton: "Yeni Başvuru",
    emptyTitle: "Henüz başvurunuz bulunmuyor",
    emptyDescription:
      "Online başvuru formunu doldurarak burs başvurusu yapabilirsiniz.",
    startApplicationButton: "Başvuruyu Başlat",
    profileTipTitle: "Profil bilgilerinizi güncel tutun",
    profileTipDescription:
      "Burs ödemeleri, etkinlik kayıtları ve duyuruların size ulaşması için iletişim bilgilerinizi güncel tutmayı unutmayın.",
    profileTipNote: "",
    reviewerNoteLabel: "Komisyon notu:",
    membershipLabel: "Üyelik:",
    roleAdminLabel: "Yönetici",
    roleMemberLabel: "Üye",
  },

  donation: {
    presetBadge: "Bağış Tutarınızı Seçin",
    presetTitle: "Ne kadar bağış yapmak istiyorsunuz?",
    customAmountLabel: "Özel tutar girin",
    customAmountPlaceholder: "Örn. 750",
    bankInfoTitle: "Banka Hesap Bilgilerimiz",
    bankNote:
      'Açıklama kısmına "Burs Bağışı" yazmayı unutmayın. Dilerseniz adınızı anonim bırakabilirsiniz.',
    summaryLabel: "Bağış tutarı",
    submitButton: "Bağış Yap",
    submitToastTitle: "Online ödeme yakında",
    submitToastMessage:
      "Online ödeme entegrasyonu henüz aktif değil. IBAN üzerinden havale ile bağış yapabilirsiniz.",
    copyToastTitle: "IBAN kopyalandı",
    copyToastError: "Kopyalanamadı",
  },

  contact: {
    formTitle: "Bize yazın",
    formDescription:
      "Formu doldurun, en geç 2 iş günü içinde size dönüş yapalım.",
    submitButton: "Gönder",
    kvkkNote:
      "Verileriniz KVKK kapsamında işlenir, üçüncü taraflarla paylaşılmaz.",
    successTitle: "Mesajınız iletildi",
    successDescription: "En kısa sürede size dönüş yapacağız.",
    sidebarTitle: "İletişim Bilgileri",
  },

  notFound: {
    title: "Sayfa bulunamadı",
    description:
      "Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Anasayfaya dönerek devam edebilirsiniz.",
    homeButton: "Ana sayfaya dön",
  },

  header: {
    loginButton: "Giriş Yap",
    registerButton: "Üye Ol",
    accountMenuTitle: "Hesabım",
    accountMenuApplication: "Burs Başvurum",
    accountMenuAdmin: "Yönetim Paneli",
    accountMenuLogout: "Çıkış Yap",
    mobileApplyButton: "Burs Başvurusu Yap",
    menuLabel: "Menü",
  },
};
