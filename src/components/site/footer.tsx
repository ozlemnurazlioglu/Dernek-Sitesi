import Link from "next/link";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site";

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function YoutubeLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065A2.063 2.063 0 1 1 5.337 7.433Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-brand-950 text-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 max-w-sm">
          <Logo variant="light" />
          <p className="text-sm leading-relaxed text-white/65">
            {siteConfig.description}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <a
              href={siteConfig.social.instagram}
              className="h-9 w-9 rounded-md border border-white/15 flex items-center justify-center hover:bg-white/10"
              aria-label="Instagram"
            >
              <InstagramLogo className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social.twitter}
              className="h-9 w-9 rounded-md border border-white/15 flex items-center justify-center hover:bg-white/10"
              aria-label="X (Twitter)"
            >
              <XLogo className="h-3.5 w-3.5" />
            </a>
            <a
              href={siteConfig.social.linkedin}
              className="h-9 w-9 rounded-md border border-white/15 flex items-center justify-center hover:bg-white/10"
              aria-label="LinkedIn"
            >
              <LinkedinLogo className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.social.youtube}
              className="h-9 w-9 rounded-md border border-white/15 flex items-center justify-center hover:bg-white/10"
              aria-label="YouTube"
            >
              <YoutubeLogo className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
            Kurumsal
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/hakkimizda" className="hover:text-gold-300">Hakkımızda</Link></li>
            <li><Link href="/hakkimizda#yonetim" className="hover:text-gold-300">Yönetim Kurulu</Link></li>
            <li><Link href="/hakkimizda#tuzuk" className="hover:text-gold-300">Tüzük</Link></li>
            <li><Link href="/hakkimizda#raporlar" className="hover:text-gold-300">Faaliyet Raporları</Link></li>
            <li><Link href="/iletisim" className="hover:text-gold-300">İletişim</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
            Destek Ol
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/burs" className="hover:text-gold-300">Burs Başvurusu</Link></li>
            <li><Link href="/bagis" className="hover:text-gold-300">Bağış Yap</Link></li>
            <li><Link href="/kayit" className="hover:text-gold-300">Üye Ol</Link></li>
            <li><Link href="/etkinlikler" className="hover:text-gold-300">Etkinlikler</Link></li>
            <li><Link href="/haberler" className="hover:text-gold-300">Haberler</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
            İletişim
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gold-400 shrink-0" />
              <span className="text-white/75 leading-relaxed">
                {siteConfig.contact.address}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-400 shrink-0" />
              <span>{siteConfig.contact.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold-400 shrink-0" />
              <span>{siteConfig.contact.email}</span>
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

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/55">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/gizlilik" className="hover:text-white">Gizlilik Politikası</Link>
            <Link href="/kvkk" className="hover:text-white">KVKK</Link>
            <Link href="/cerez" className="hover:text-white">Çerez Politikası</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
