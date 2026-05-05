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
  // Admin DB'de bir logo URL'i tanımladıysa onu, yoksa repo'daki gerçek
  // dernek armasını kullan. Böylece DB henüz yüklenmemiş olsa bile (ilk
  // mount'ta) doğru marka anında görünür.
  const logoUrl = siteSettings.logoUrl?.trim() || "/logo.png";

  // Sidebar'da kompakt; header'da daha hâkim bir varlık için biraz büyütüldü
  // (44px → 48px md+, 52px lg+). Wide ekranlarda logonun belirgin olması
  // markayı güçlendirir.
  const iconSize = compact ? "h-9 w-9" : "h-12 w-12 lg:h-[52px] lg:w-[52px]";

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md",
          iconSize,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={shortName}
          // Logo geniş bir görsel; arma sol tarafta. object-cover + sol
          // hizalama ile yalnız yuvarlak arma görünür.
          className="absolute inset-0 h-full w-full object-cover object-left"
        />
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <span
          className={cn(
            "font-bold uppercase truncate",
            compact
              ? "text-[13px] tracking-[0.04em]"
              : "text-[17px] lg:text-lg tracking-[0.12em]",
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
                : "text-[11px] lg:text-[12px] tracking-[0.18em]",
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
