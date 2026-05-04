import type { AuthUiText } from "@/lib/types";

/**
 * Auth (login + register + side panel) için varsayılan metinler.
 * DB'de "ui.auth" page block'u henüz yoksa fallback olarak kullanılır.
 *
 * Not: Bu dosya istemci paketine de dahil edilebilir (seedPageBlocks
 * tamamına ihtiyaç olmadan, sadece bu küçük objeyi içerir).
 */
export const DEFAULT_AUTH_UI: AuthUiText = {
  login: {
    title: "Giriş Yap",
    description:
      "Üye panelinize ve burs başvurularınıza erişmek için giriş yapın.",
    submitButton: "Giriş Yap",
    registerPrompt: "Hesabınız yok mu?",
    registerLink: "Üye olun",
  },
  register: {
    title: "Üye Olun",
    description:
      "Üye panelinizden burs başvurusu yapabilir, etkinliklere kayıt olabilirsiniz.",
    submitButton: "Üyeliği Oluştur",
    loginPrompt: "Zaten hesabınız var mı?",
    loginLink: "Giriş yapın",
  },
  sidePanel: {
    label: "Üye Topluluğumuz",
    headline:
      '"Bu yolculukta birlikte olduğumuz her gönüllü, bir öğrencinin hayatına dokunuyor."',
    description:
      "Üye olun, etkinliklerimizden ücretsiz yararlanın ve burs başvurularınızı tek panelden takip edin.",
    imageUrl:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&q=80",
  },
  showDemoAccounts: false,
  demoAccountsTitle: "Demo Hesapları",
  demoAccountsLines: [],
};
