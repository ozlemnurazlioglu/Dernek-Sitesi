"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
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
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { useStore } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const items = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/basvurular", label: "Burs Başvuruları", icon: GraduationCap },
  { href: "/admin/uyeler", label: "Üyeler", icon: Users },
  { href: "/admin/haberler", label: "Haberler", icon: Newspaper },
  { href: "/admin/etkinlikler", label: "Etkinlikler", icon: Calendar },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: Mail },
];

const contentItems = [
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
  { href: "/admin/sayfalar", label: "Sayfa İçerikleri", icon: FileText },
  { href: "/admin/yonetim-kurulu", label: "Yönetim Kurulu", icon: UserCog },
  { href: "/admin/tarihce", label: "Tarihçe", icon: History },
  { href: "/admin/raporlar", label: "Faaliyet Raporları", icon: FileBadge },
  { href: "/admin/burs-programlari", label: "Burs Programları", icon: BookOpen },
  { href: "/admin/istenen-belgeler", label: "İstenen Belgeler", icon: CheckSquare },
  { href: "/admin/burs-takvimi", label: "Burs Takvimi", icon: ListOrdered },
  { href: "/admin/sss", label: "Sıkça Sorulanlar", icon: HelpCircle },
  { href: "/admin/yorumlar", label: "Bursiyer Yorumları", icon: MessageSquareQuote },
  { href: "/admin/bagis-tutarlari", label: "Bağış Tutarları", icon: HandHeart },
  { href: "/admin/bagis-kullanimi", label: "Bağış Kullanımı", icon: HandHeart },
  { href: "/admin/haber-kategorileri", label: "Haber Kategorileri", icon: Tags },
  {
    href: "/admin/etkinlik-kategorileri",
    label: "Etkinlik Kategorileri",
    icon: Tags,
  },
  { href: "/admin/yasal-sayfalar", label: "Yasal Sayfalar", icon: Scale },
  { href: "/admin/agalar", label: "Ağalarımız", icon: Crown },
  { href: "/admin/mali-tablo", label: "Mali Tablo", icon: Wallet },
  { href: "/admin/duyurular", label: "Duyurular", icon: Megaphone },
  { href: "/admin/duyuru-kategorileri", label: "Duyuru Kategorileri", icon: Tags },
  { href: "/admin/sponsorlar", label: "Sponsorlar", icon: Handshake },
];

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

  const pendingApps = applications.filter(
    (a) => a.status === "submitted" || a.status === "in_review",
  ).length;
  const unread = messages.filter((m) => !m.read).length;

  const counts: Record<string, number> = {
    "/admin/basvurular": pendingApps,
    "/admin/mesajlar": unread,
  };

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
                      <span className="text-[11px] font-semibold rounded-full bg-gold-400 text-brand-900 h-5 min-w-5 px-1.5 inline-flex items-center justify-center">
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
