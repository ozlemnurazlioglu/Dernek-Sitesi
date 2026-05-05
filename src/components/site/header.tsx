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
import { SocialLinks } from "@/components/site/social-links";
import { ButtonLink } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { DEFAULT_HEADER_CONFIG } from "@/lib/defaults/header";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText, HeaderConfig, HeaderMenuItem } from "@/lib/types";

/** Verilen menü öğesinin görünür alt menü öğelerini döner. */
function visibleChildren(item: HeaderMenuItem) {
  return (item.children ?? []).filter((c) => c.enabled !== false);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { currentUser, logout, siteSettings, pageBlocks } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountMenu, setAccountMenu] = useState(false);
  /** Desktop'ta açık olan dropdown'un index'i; null ise hiçbiri açık değil. */
  const [openSubmenuIdx, setOpenSubmenuIdx] = useState<number | null>(null);

  const cfg =
    (pageBlocks["header.config"] as HeaderConfig | undefined) ??
    DEFAULT_HEADER_CONFIG;
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const headerUi = { ...DEFAULT_COMMON_UI.header, ...(ui.header ?? {}) };
  // Yalnızca aktif (enabled !== false) öğeler kullanıcılara gösterilir.
  // Eski kayıtlarla geri uyumluluk için `enabled` tanımlı değilse aktif sayılır.
  const navigation = (cfg.menu ?? DEFAULT_HEADER_CONFIG.menu).filter(
    (item) => item.enabled !== false,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountMenu(false);
    setOpenSubmenuIdx(null);
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
            {siteSettings.contactPhone && (
              <a
                href={`tel:${siteSettings.contactPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-gold-300"
              >
                <Phone className="h-3.5 w-3.5" /> {siteSettings.contactPhone}
              </a>
            )}
            {siteSettings.contactEmail && (
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="inline-flex items-center gap-1.5 hover:text-gold-300"
              >
                <Mail className="h-3.5 w-3.5" /> {siteSettings.contactEmail}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            <SocialLinks variant="topbar" />
          </div>
        </div>
      </div>

      {/*
        Header düzen: logo ve nav SOLDA yapışık dururken, hesap/CTA bloğu
        sağa itilir. Eski düzen `justify-between` idi — logo, nav ve hesap
        bloğu üç eşit bölüme yayılıyor, logonun sağında ve solunda boşluk
        bırakıyordu. `ml-auto` ile sadece sağ blok itilir, böylece menü
        eklendikçe logo ile yapışık kalır ve boş alan kullanılır.
      */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 md:h-[72px] flex items-center gap-4 lg:gap-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/*
          Desktop nav yalnızca 1400px+ ekranlarda görünür. Bu eşiğin altında
          (yani çoğu 1366px laptop ekranı dahil) menü öğeleri + sağ blok (Giriş
          Yap, Üye Ol, Burs Başvur) sığmıyor ve yatay scroll bar tetikliyordu.
          Standart `xl` (1280px) yerine custom `[1400px]` kullanıyoruz — 1280
          breakpoint'inde hesap dropdown'u kesiliyordu. 1399 altında hamburger.
        */}
        <nav className="hidden min-[1400px]:flex items-center gap-0.5 xl:gap-1">
          {navigation.map((item, idx) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const children = visibleChildren(item);
            const hasChildren = children.length > 0;
            const isSubOpen = openSubmenuIdx === idx;

            const linkClasses = cn(
              "px-2.5 xl:px-3 h-10 inline-flex items-center gap-1 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              active
                ? "text-brand-900 bg-brand-50"
                : "text-brand-800/80 hover:text-brand-900 hover:bg-brand-50/60",
            );

            if (!hasChildren) {
              return (
                <Link key={item.href} href={item.href} className={linkClasses}>
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.href + idx}
                className="relative"
                onMouseEnter={() => setOpenSubmenuIdx(idx)}
                onMouseLeave={() => setOpenSubmenuIdx(null)}
              >
                <Link
                  href={item.href}
                  className={linkClasses}
                  aria-haspopup="menu"
                  aria-expanded={isSubOpen}
                  onFocus={() => setOpenSubmenuIdx(idx)}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isSubOpen && "rotate-180",
                    )}
                  />
                </Link>
                {isSubOpen && (
                  <div
                    className="absolute left-0 top-full pt-2 z-50"
                    role="menu"
                  >
                    <ul className="min-w-[220px] rounded-xl border border-border bg-white shadow-lg overflow-hidden py-1.5 animate-float-up">
                      {children.map((child) => {
                        const childActive = pathname.startsWith(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              role="menuitem"
                              className={cn(
                                "block px-4 py-2 text-sm transition-colors",
                                childActive
                                  ? "bg-brand-50 text-brand-900 font-medium"
                                  : "text-brand-800/85 hover:bg-brand-50 hover:text-brand-900",
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <div className="hidden md:flex items-center gap-1.5">
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
                      <User className="h-4 w-4 text-brand-600" />{" "}
                      {headerUi.accountMenuTitle}
                    </Link>
                    <Link
                      href="/burs/basvuru"
                      className="px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-brand-50"
                    >
                      <GraduationCap className="h-4 w-4 text-brand-600" />{" "}
                      {headerUi.accountMenuApplication}
                    </Link>
                    {currentUser.role === "admin" && (
                      <Link
                        href="/admin"
                        className="px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-brand-50"
                      >
                        <ShieldCheck className="h-4 w-4 text-brand-600" />{" "}
                        {headerUi.accountMenuAdmin}
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
                      <LogOut className="h-4 w-4" /> {headerUi.accountMenuLogout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="px-2.5 h-10 inline-flex items-center text-sm font-medium text-brand-800/80 hover:text-brand-900 rounded-md transition-colors whitespace-nowrap"
                >
                  {headerUi.loginButton}
                </Link>
                <Link
                  href="/kayit"
                  className="px-2.5 h-10 inline-flex items-center text-sm font-semibold text-brand-900 hover:text-brand-700 rounded-md transition-colors whitespace-nowrap"
                >
                  {headerUi.registerButton}
                </Link>
              </>
            )}
            {cfg.ctaButton.visible && (
              <ButtonLink
                href={cfg.ctaButton.href}
                variant="gold"
                size="sm"
              >
                {cfg.ctaButton.label}
              </ButtonLink>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="min-[1400px]:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border text-brand-900"
            aria-label={headerUi.menuLabel}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="min-[1400px]:hidden border-t border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-1">
            {navigation.map((item, idx) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const children = visibleChildren(item);
              return (
                <div key={item.href + idx} className="flex flex-col">
                  <Link
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
                  {children.length > 0 && (
                    <ul className="ml-3 mt-0.5 mb-1 border-l border-border pl-3 flex flex-col gap-0.5">
                      {children.map((child) => {
                        const childActive = pathname.startsWith(child.href);
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "h-10 px-3 inline-flex items-center text-sm rounded-md w-full",
                                childActive
                                  ? "bg-brand-50 text-brand-900 font-medium"
                                  : "text-brand-800/85 hover:bg-brand-50",
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-border">
              {currentUser ? (
                <>
                  <ButtonLink href="/hesabim" variant="outline">
                    {headerUi.accountMenuTitle}
                  </ButtonLink>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md text-sm font-medium border border-border text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> {headerUi.accountMenuLogout}
                  </button>
                </>
              ) : (
                <>
                  <ButtonLink href="/giris" variant="outline">
                    {headerUi.loginButton}
                  </ButtonLink>
                  <ButtonLink href="/kayit" variant="primary">
                    {headerUi.registerButton}
                  </ButtonLink>
                </>
              )}
              {cfg.ctaButton.visible && (
                <ButtonLink
                  href={cfg.ctaButton.href}
                  variant="gold"
                  className="col-span-2"
                >
                  {headerUi.mobileApplyButton}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
