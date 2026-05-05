"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * İlk açılış splash ekranı.
 *
 * Site tamamen client-side render edildiğinden ve veriler `/api/bootstrap`
 * çağrısından sonra geldiğinden ilk render'da hero/listeler boş kalır ve
 * çirkin bir ara hal görünür. Bu bileşen `store.ready` `true` olana kadar
 * tam ekran kapatıcı koyu bir splash gösterir, sonra yumuşakça söner.
 *
 * Tasarım:
 * - Brand-950 koyu lacivert zemin + nazik ışık halesi + ince grid dokusu
 * - Ortada brand renkli yuvarlatılmış kare içinde logo (yoksa baş harf)
 * - Etrafında yavaşça dönen altın renkli kesikli halka
 * - Beyaz başlık + altın alt yazı + altta altın divider çizgisi
 *
 * `ready` bir kez `true` olduktan sonra DOM'dan tamamen kaldırılır;
 * sayfalar arası geçişlerde tekrar gözükmez.
 */
export function SiteSplash() {
  const { ready, siteSettings } = useStore();
  const [mounted, setMounted] = useState(true);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const fade = setTimeout(() => setHiding(true), 120);
    const remove = setTimeout(() => setMounted(false), 720);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, [ready]);

  if (!mounted) return null;

  const title = siteSettings.shortName?.trim() || "Kumrulular Derneği";
  const subtitleRaw =
    siteSettings.logoSubtitle?.trim() || siteSettings.slogan || "";
  const subtitle = subtitleRaw.toLocaleUpperCase("tr-TR");
  const logoUrl = siteSettings.logoUrl?.trim();
  const initial = (title.charAt(0) || "K").toLocaleUpperCase("tr-TR");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Yükleniyor"
      aria-hidden={hiding}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ease-out",
        hiding ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
      style={{
        background:
          "radial-gradient(1100px 700px at 50% 35%, rgba(47, 90, 156, 0.22), transparent 60%), radial-gradient(900px 500px at 90% 100%, rgba(201, 163, 90, 0.10), transparent 60%), #0b1c33",
      }}
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.06]" />

      <div className="relative flex flex-col items-center px-6">
        <div className="relative flex h-[150px] w-[150px] items-center justify-center">
          <svg
            viewBox="0 0 150 150"
            className="absolute inset-0 h-full w-full animate-splash-spin text-gold-400"
            aria-hidden="true"
          >
            <circle
              cx="75"
              cy="75"
              r="68"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.85"
              strokeWidth="1.4"
              strokeDasharray="3 6"
              strokeLinecap="round"
            />
            <circle
              cx="75"
              cy="75"
              r="62"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="0.8"
            />
          </svg>

          <div
            className="relative h-[78px] w-[78px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            style={{
              background:
                "linear-gradient(135deg, #2f5a9c 0%, #163357 60%, #102542 100%)",
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-contain p-2"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[36px] font-semibold leading-none text-gold-300 drop-shadow-sm">
                  {initial}
                </span>
              </div>
            )}
            <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/12 to-transparent" />
          </div>
        </div>

        <div className="mt-7 text-center">
          <div className="text-xl font-semibold tracking-tight text-white md:text-2xl">
            {title}
          </div>
          {subtitle && (
            <div className="mt-2.5 text-[10px] uppercase tracking-[0.32em] text-gold-200/80 md:text-[11px]">
              {subtitle}
            </div>
          )}
        </div>

        <div className="mt-5 h-px w-32 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <span className="sr-only">Site yükleniyor…</span>
      </div>
    </div>
  );
}
