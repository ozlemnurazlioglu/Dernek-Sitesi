"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SocialLinks } from "@/components/site/social-links";
import { useStore } from "@/lib/store";
import type { FooterConfig } from "@/lib/types";

const DEFAULT_FOOTER: FooterConfig = {
  groups: [],
  legalLinks: [],
  supporters: [],
};

/** Bağlantının harici (http/https/mailto/tel) olup olmadığını döner. */
function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

export function SiteFooter() {
  const { siteSettings, pageBlocks } = useStore();
  const footer = (pageBlocks["footer"] as FooterConfig) ?? DEFAULT_FOOTER;
  const supporters = footer.supporters ?? [];

  return (
    <footer className="mt-24 bg-brand-950 text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 max-w-sm">
          <Logo variant="light" />
          <p className="text-sm leading-relaxed text-white/65">
            {siteSettings.description}
          </p>
          <SocialLinks variant="footer" className="pt-2" />
        </div>

        {footer.groups.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              {group.title}
            </h4>
            <ul className="space-y-2 text-sm">
              {group.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="hover:text-gold-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
            İletişim
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gold-400 shrink-0" />
              {siteSettings.contactAddress ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteSettings.contactAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/75 leading-relaxed hover:text-gold-300 underline-offset-2 hover:underline"
                  title="Haritada aç"
                >
                  {siteSettings.contactAddress}
                </a>
              ) : null}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-400 shrink-0" />
              {siteSettings.contactPhone ? (
                <a
                  href={`tel:${siteSettings.contactPhone.replace(/\s+/g, "")}`}
                  className="hover:text-gold-300 underline-offset-2 hover:underline"
                  title="Ara"
                >
                  {siteSettings.contactPhone}
                </a>
              ) : null}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold-400 shrink-0" />
              {siteSettings.contactEmail ? (
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="hover:text-gold-300 underline-offset-2 hover:underline break-all"
                  title="E-posta gönder"
                >
                  {siteSettings.contactEmail}
                </a>
              ) : null}
            </li>
          </ul>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-gold-300 hover:text-gold-200"
          >
            Bize Ulaşın <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {supporters.length > 0 && (
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center text-center gap-3">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white/45">
                Destekçilerimiz
              </span>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
                {supporters.map((s, idx) => {
                  const external = isExternalHref(s.href);
                  return (
                    <span key={`${s.href}-${idx}`} className="inline-flex items-center">
                      {idx > 0 && (
                        <span
                          aria-hidden
                          className="mr-5 hidden sm:inline-block h-1 w-1 rounded-full bg-white/25"
                        />
                      )}
                      {s.href ? (
                        external ? (
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-gold-300 font-medium underline-offset-4 hover:underline"
                          >
                            {s.name}
                          </a>
                        ) : (
                          <Link
                            href={s.href}
                            className="text-white/80 hover:text-gold-300 font-medium underline-offset-4 hover:underline"
                          >
                            {s.name}
                          </Link>
                        )
                      ) : (
                        <span className="text-white/70 font-medium">{s.name}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/55">
          <p>
            © {new Date().getFullYear()} {siteSettings.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-5">
            {footer.legalLinks.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
