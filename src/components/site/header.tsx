"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  User,
  X,
  Mail,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { navigation, siteConfig } from "@/lib/site";
import { useStore } from "@/lib/store";
import { cn, initials } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { currentUser, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountMenu(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "bg-white/85 backdrop-blur border-b border-border shadow-[0_1px_0_rgba(11,28,51,0.04)]"
          : "bg-white border-b border-transparent",
      )}
    >
      <div className="hidden md:block bg-brand-900 text-white/85 text-xs">
        <div className="mx-auto max-w-7xl px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> {siteConfig.contact.phone}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {siteConfig.contact.email}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60">{siteConfig.contact.workingHours}</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 hover:text-gold-300"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Yönetim Paneli
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 md:h-[72px] flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navigation.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 h-10 inline-flex items-center text-sm font-medium rounded-md transition-colors",
                  active
                    ? "text-brand-900 bg-brand-50"
                    : "text-brand-800/80 hover:text-brand-900 hover:bg-brand-50/60",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenu((v) => !v)}
                  className="inline-flex items-center gap-2 h-10 px-2 pr-3 rounded-md hover:bg-brand-50 border border-transparent hover:border-brand-100 transition-colors"
                >
                  <span className="h-8 w-8 rounded-full bg-brand-800 text-white text-sm font-semibold flex items-center justify-center">
                    {initials(currentUser.fullName)}
                  </span>
                  <span className="text-sm text-brand-900 font-medium max-w-[140px] truncate">
                    {currentUser.fullName.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {accountMenu && (
                  <div className="absolute right-0 top-full mt-1 w-60 rounded-lg border border-border bg-white shadow-lg overflow-hidden animate-float-up">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-brand-900 truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <Link
                      href="/hesabim"
                      className="px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-brand-50"
                    >
                      <User className="h-4 w-4 text-brand-600" /> Hesabım
                    </Link>
                    <Link
                      href="/burs/basvuru"
                      className="px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-brand-50"
                    >
                      <GraduationCap className="h-4 w-4 text-brand-600" /> Burs
                      Başvurum
                    </Link>
                    {currentUser.role === "admin" && (
                      <Link
                        href="/admin"
                        className="px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-brand-50"
                      >
                        <ShieldCheck className="h-4 w-4 text-brand-600" /> Yönetim
                        Paneli
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenu(false);
                        logout();
                      }}
                      className="w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-red-50 text-red-700 border-t border-border"
                    >
                      <LogOut className="h-4 w-4" /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <ButtonLink href="/giris" variant="ghost" size="sm">
                  Giriş Yap
                </ButtonLink>
                <ButtonLink href="/kayit" variant="outline" size="sm">
                  Üye Ol
                </ButtonLink>
              </>
            )}
            <ButtonLink href="/burs/basvuru" variant="gold" size="sm">
              Burs Başvur
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border text-brand-900"
            aria-label="Menü"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-1">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "h-11 px-3 inline-flex items-center text-sm font-medium rounded-md",
                    active
                      ? "bg-brand-50 text-brand-900"
                      : "text-brand-800 hover:bg-brand-50",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-border">
              {currentUser ? (
                <>
                  <ButtonLink href="/hesabim" variant="outline">
                    Hesabım
                  </ButtonLink>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md text-sm font-medium border border-border text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <ButtonLink href="/giris" variant="outline">
                    Giriş Yap
                  </ButtonLink>
                  <ButtonLink href="/kayit" variant="primary">
                    Üye Ol
                  </ButtonLink>
                </>
              )}
              <ButtonLink
                href="/burs/basvuru"
                variant="gold"
                className="col-span-2"
              >
                Burs Başvurusu Yap
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
