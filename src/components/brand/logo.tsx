"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export function Logo({
  className,
  variant = "dark",
  compact = false,
}: {
  className?: string;
  variant?: "dark" | "light";
  /** Dar alanlar (sidebar vb.) için kompakt versiyon — küçük yazı, sıkışık tracking. */
  compact?: boolean;
}) {
  const { siteSettings } = useStore();
  const textColor = variant === "dark" ? "text-brand-900" : "text-white";
  const subColor =
    variant === "dark" ? "text-muted-foreground" : "text-white/70";

  const shortName = siteSettings.shortName?.trim() || "Dernek";
  const subtitle =
    siteSettings.logoSubtitle?.trim() || siteSettings.slogan || "";
  const logoUrl = siteSettings.logoUrl?.trim();

  const iconSize = compact ? "h-9 w-9" : "h-11 w-11";

  return (
    <div className={cn("flex items-center gap-2.5 min-w-0", className)}>
      <div className={cn("relative shrink-0", iconSize)}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={shortName}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <svg
            viewBox="0 0 48 48"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0" stopColor="#163357" />
                <stop offset="1" stopColor="#0b1c33" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#logo-grad)" />
            <path
              d="M14 30c0-5.523 4.477-10 10-10s10 4.477 10 10"
              stroke="#c9a35a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="24" cy="20" r="4" stroke="#c9a35a" strokeWidth="2.2" />
            <path
              d="M18 34h12"
              stroke="#ffffff"
              strokeOpacity="0.55"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <span
          className={cn(
            "font-bold uppercase truncate",
            compact
              ? "text-[13px] tracking-[0.04em]"
              : "text-base tracking-[0.12em]",
            textColor,
          )}
        >
          {shortName}
        </span>
        {subtitle && (
          <span
            className={cn(
              "uppercase truncate",
              compact
                ? "text-[9px] tracking-[0.08em]"
                : "text-[11px] tracking-[0.18em]",
              subColor,
            )}
            title={subtitle}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
