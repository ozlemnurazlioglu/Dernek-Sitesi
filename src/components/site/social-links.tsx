"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z" />
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

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function LinkedinLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065A2.063 2.063 0 1 1 5.337 7.433Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

function YoutubeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
    </svg>
  );
}

/**
 * Tüm sosyal medya bağlantılarını ortak şekilde render eder.
 * `siteSettings.social*` alanları boşsa o ikon hiç görünmez.
 *
 * variant:
 *  - "topbar" → header üst bandı için, küçük & açık renk
 *  - "footer" → footer için, çerçeveli kareler
 */
export function SocialLinks({
  variant = "topbar",
  className,
}: {
  variant?: "topbar" | "footer";
  className?: string;
}) {
  const { siteSettings } = useStore();

  const links: { url: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { url: siteSettings.socialFacebook, label: "Facebook", Icon: FacebookLogo },
    { url: siteSettings.socialInstagram, label: "Instagram", Icon: InstagramLogo },
    { url: siteSettings.socialTwitter, label: "X (Twitter)", Icon: XLogo },
    { url: siteSettings.socialLinkedin, label: "LinkedIn", Icon: LinkedinLogo },
    { url: siteSettings.socialYoutube, label: "YouTube", Icon: YoutubeLogo },
  ].filter((l) => l.url && l.url.trim() !== "");

  if (links.length === 0) return null;

  if (variant === "topbar") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {links.map(({ url, label, Icon }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="h-9 w-9 rounded-md border border-white/15 flex items-center justify-center hover:bg-white/10"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
