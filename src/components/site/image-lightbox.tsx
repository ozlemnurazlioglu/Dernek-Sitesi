"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Klavye + dokunma destekli, basit ve bağımlılıksız lightbox.
 *
 * - Esc: kapat
 * - Sol/Sağ ok: önceki/sonraki
 * - Mobil dokunma swipe: yatay sürükleme ile geçiş
 * - Arka plana tıklama: kapat
 * - Görsel kendisine tıklamak overlay'i kapatmaz
 *
 * `open` `false` iken tamamen DOM'dan kalkar; açılışta `body` scroll'u kilitlenir.
 */

type Props = {
  images: string[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

const SWIPE_PX = 50;

export function ImageLightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const next = useCallback(() => {
    if (images.length === 0) return;
    onIndexChange((index + 1) % images.length);
  }, [images.length, index, onIndexChange]);

  const prev = useCallback(() => {
    if (images.length === 0) return;
    onIndexChange((index - 1 + images.length) % images.length);
  }, [images.length, index, onIndexChange]);

  // Klavye navigasyonu — sadece açıkken bağla.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev, onClose]);

  // Body scroll lock.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Görsel değiştiğinde kısa bir fade animasyonu için key tabanlı bir flag.
  useEffect(() => {
    if (!open) return;
    setAnimating(true);
    const t = setTimeout(() => setAnimating(false), 150);
    return () => clearTimeout(t);
  }, [index, open]);

  if (!open || images.length === 0) return null;

  const current = images[index] ?? images[0];

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    if (dx < 0) next();
    else prev();
  }

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Foto görüntüleyici"
      onClick={onOverlayClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 select-none"
    >
      {/* Kapat */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Kapat"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 h-10 w-10 inline-flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Önceki */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Önceki"
          className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 h-11 w-11 inline-flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Görsel */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={current}
        src={current}
        alt={`Galeri görseli ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        className={
          "max-h-[88vh] max-w-[92vw] object-contain rounded-md shadow-2xl transition-opacity duration-150 " +
          (animating ? "opacity-0" : "opacity-100")
        }
      />

      {/* Sonraki */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Sonraki"
          className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 h-11 w-11 inline-flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Sayaç */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
