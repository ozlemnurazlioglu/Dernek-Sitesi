"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Newspaper,
  RefreshCcw,
  Users,
  Mail,
  ExternalLink,
  X,
  Settings,
  FileText,
  UserCog,
  History,
  FileBadge,
  BookOpen,
  ListOrdered,
  HelpCircle,
  MessageSquareQuote,
  HandHeart,
  CheckSquare,
  Database,
  Tags,
  Scale,
  Crown,
  Wallet,
  Megaphone,
  Handshake,
  Home,
  Image as ImageIcon,
  Film,
  Landmark,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useStore } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type IconType = ComponentType<{ className?: string }>;

/** Tek link: doğrudan sayfaya gider. */
type LeafItem = { href: string; label: string; icon: IconType };
/**
 * Grup: birden fazla alt link içerir. `id`, group'un open/closed state'inde
 * key olarak kullanılır. `matchPrefix` (opsiyonel) bu grup başlığının da
 * "active" sayılması gerektiği path prefix'lerini belirtir.
 */
type GroupItem = {
  id: string;
  label: string;
  icon: IconType;
  children: LeafItem[];
};
type ContentItem = LeafItem | GroupItem;

const items: (LeafItem & { exact?: boolean })[] = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/basvurular", label: "Burs Başvuruları", icon: GraduationCap },
  { href: "/admin/uyeler", label: "Üyeler", icon: Users },
  { href: "/admin/haberler", label: "Haberler", icon: Newspaper },
  { href: "/admin/etkinlikler", label: "Etkinlikler", icon: Calendar },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: Mail },
];

const contentItems: ContentItem[] = [
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
  { href: "/admin/sayfalar", label: "Sayfa İçerikleri", icon: FileText },
  { href: "/admin/yonetim-kurulu", label: "Yönetim Kurulu", icon: UserCog },
  { href: "/admin/tarihce", label: "Tarihçe", icon: History },
  { href: "/admin/raporlar", label: "Raporlar & Belgeler", icon: FileBadge },
  {
    id: "burs",
    label: "Burs",
    icon: GraduationCap,
    children: [
      { href: "/admin/burs-programlari", label: "Burs Programları", icon: BookOpen },
      { href: "/admin/istenen-belgeler", label: "İstenen Belgeler", icon: CheckSquare },
      { href: "/admin/burs-takvimi", label: "Burs Takvimi", icon: ListOrdered },
      { href: "/admin/sss", label: "Sıkça Sorulanlar", icon: HelpCircle },
      { href: "/admin/yorumlar", label: "Bursiyer Yorumları", icon: MessageSquareQuote },
    ],
  },
  { href: "/admin/bagis-tutarlari", label: "Bağış Tutarları", icon: HandHeart },
  { href: "/admin/bagis-kullanimi", label: "Bağış Kullanımı", icon: HandHeart },
  { href: "/admin/banka-hesaplari", label: "Banka Hesapları", icon: Landmark },
  {
    id: "kategoriler",
    label: "Kategoriler",
    icon: Tags,
    children: [
      { href: "/admin/haber-kategorileri", label: "Haber Kategorileri", icon: Tags },
      { href: "/admin/etkinlik-kategorileri", label: "Etkinlik Kategorileri", icon: Tags },
      { href: "/admin/duyuru-kategorileri", label: "Duyuru Kategorileri", icon: Tags },
      { href: "/admin/foto-kategorileri", label: "Foto Kategorileri", icon: Tags },
      { href: "/admin/video-kategorileri", label: "Video Kategorileri", icon: Tags },
    ],
  },
  { href: "/admin/yasal-sayfalar", label: "Yasal Sayfalar", icon: Scale },
  { href: "/admin/agalar", label: "Ağalarımız", icon: Crown },
  { href: "/admin/mali-tablo", label: "Mali Tablo", icon: Wallet },
  { href: "/admin/duyurular", label: "Duyurular", icon: Megaphone },
  { href: "/admin/sponsorlar", label: "Sponsorlar", icon: Handshake },
  { href: "/admin/sponsor-turleri", label: "Sponsor Türleri", icon: Tags },
  { href: "/admin/bagiscilar", label: "Bağışçılar", icon: HandHeart },
  { href: "/admin/mahallelerimiz", label: "Mahallelerimiz", icon: Home },
  { href: "/admin/foto-galeri", label: "Foto Galeri", icon: ImageIcon },
  { href: "/admin/video-galeri", label: "Video Galeri", icon: Film },
];

function isGroup(item: ContentItem): item is GroupItem {
  return "children" in item;
}

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { currentUser, logout, applications, messages, resetDemo } = useStore();
  const { toast } = useToast();

  // Yan menü rozetleri "ilgilenilmesi gereken" sayıları gösterir
  // (toplam değil). Burs Başvuruları için bu, henüz karara bağlanmamış
  // yani Beklemede + İnceleniyor durumundaki başvuruların sayısıdır;
  // Onaylandı/Reddedildi kararlananları sayıma katmaz. Mesajlarda da
  // benzer şekilde sadece okunmamış mesajlar sayılır. Hover'da
  // (title attribute) ne anlama geldiği açıklanır.
  const pendingApps = applications.filter(
    (a) => a.status === "submitted" || a.status === "in_review",
  ).length;
  const unread = messages.filter((m) => !m.read).length;

  const counts: Record<string, number> = {
    "/admin/basvurular": pendingApps,
    "/admin/mesajlar": unread,
  };
  const countTitles: Record<string, string> = {
    "/admin/basvurular":
      "İlgilenilmesi gereken başvurular (Beklemede + İnceleniyor). Karara bağlanmış başvurular sayıma dâhil değildir.",
    "/admin/mesajlar": "Okunmamış mesajlar",
  };

  /**
   * Açık tutulan grup id'leri. Sayfa yüklendiğinde ve route değiştiğinde
   * mevcut path'i içeren grup otomatik açılır; kullanıcı manuel toggle
   * de yapabilir. Set yapısı, çoklu grup açık kalmasına izin verir.
   */
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of contentItems) {
      if (isGroup(item) && item.children.some((c) => pathname.startsWith(c.href))) {
        initial.add(item.id);
      }
    }
    return initial;
  });

  // Route değişince aktif yolu içeren grubu otomatik aç (kullanıcı geri/ileri
  // navigasyonu sonrasında menüyü manuel açmak zorunda kalmasın).
  useEffect(() => {
    setOpenGroups((prev) => {
      let next = prev;
      for (const item of contentItems) {
        if (
          isGroup(item) &&
          item.children.some((c) => pathname.startsWith(c.href)) &&
          !prev.has(item.id)
        ) {
          if (next === prev) next = new Set(prev);
          next.add(item.id);
        }
      }
      return next;
    });
  }, [pathname]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-brand-950/40 lg:hidden transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-brand-950 text-white flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-4 h-16 flex items-center justify-between gap-2 border-b border-white/10">
          <Logo variant="light" compact className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden h-9 w-9 rounded-md text-white/70 hover:bg-white/10 inline-flex items-center justify-center"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 overflow-y-auto scrollbar-thin">
          <p className="px-3 text-[11px] uppercase tracking-widest text-white/40 mb-3">
            Yönetim
          </p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const count = counts[item.href];
              const countTitle = countTitles[item.href];
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {count ? (
                      <span
                        title={countTitle}
                        className="text-[11px] font-semibold rounded-full bg-gold-400 text-brand-900 h-5 min-w-5 px-1.5 inline-flex items-center justify-center cursor-help"
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 px-3 text-[11px] uppercase tracking-widest text-white/40 mb-3">
            İçerik Yönetimi
          </p>
          <ul className="space-y-0.5">
            {contentItems.map((item) => {
              if (isGroup(item)) {
                const isOpen = openGroups.has(item.id);
                const hasActiveChild = item.children.some((c) =>
                  pathname.startsWith(c.href),
                );
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.id)}
                      aria-expanded={isOpen}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors",
                        hasActiveChild && !isOpen
                          ? "text-white bg-white/5"
                          : "text-white/70 hover:text-white hover:bg-white/5",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-white/50 transition-transform",
                          isOpen ? "rotate-0" : "-rotate-90",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <ul className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5">
                        {item.children.map((child) => {
                          const childActive = pathname.startsWith(child.href);
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 h-9 rounded-md text-sm transition-colors",
                                  childActive
                                    ? "bg-white/10 text-white font-medium"
                                    : "text-white/65 hover:text-white hover:bg-white/5",
                                )}
                              >
                                <child.icon className="h-3.5 w-3.5" />
                                <span className="flex-1">{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 px-3 text-[11px] uppercase tracking-widest text-white/40 mb-3">
            Site
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Siteyi Görüntüle</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/yedek"
                className={cn(
                  "flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/admin/yedek")
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5",
                )}
              >
                <Database className="h-4 w-4" />
                <span>Yedek / İçe Aktar</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  resetDemo();
                  toast({
                    tone: "info",
                    title: "Demo verileri sıfırlandı",
                    description: "Tüm değişiklikler geri alındı.",
                  });
                }}
                className="w-full flex items-center gap-3 px-3 h-10 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Demo Verilerini Sıfırla</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gold-400 text-brand-900 font-semibold flex items-center justify-center">
            {currentUser ? initials(currentUser.fullName) : "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {currentUser?.fullName ?? "—"}
            </div>
            <div className="text-xs text-white/55 truncate">
              {currentUser?.email}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Çıkış"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { messages } = useStore();
  const unread = messages.filter((m) => !m.read).length;
  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-border h-16 flex items-center px-4 sm:px-6 gap-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden h-10 w-10 rounded-md border border-border text-brand-900 inline-flex items-center justify-center"
        aria-label="Menü"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Yönetim Paneli</div>
        <div className="text-sm font-medium text-brand-900">
          Hoş geldiniz, derneğinizi buradan yönetin.
        </div>
      </div>
      <Link
        href="/admin/mesajlar"
        className="relative h-10 w-10 inline-flex items-center justify-center rounded-md border border-border hover:bg-brand-50"
        aria-label="Bildirimler"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </Link>
    </header>
  );
}
