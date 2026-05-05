"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { useStore } from "@/lib/store";

/**
 * `/galeri/foto/[slug]` — Bir foto kategorisindeki tüm fotoğrafları masonary
 * grid'inde gösterir. Bir karta tıklanınca lightbox açılır; klavye okları
 * ve soldaki/sağdaki butonlarla gezinilebilir, ESC veya X ile kapatılır.
 */
export default function FotoKategoriSayfasi() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;
  const { photoCategories, photos, ready } = useStore();

  const category = useMemo(
    () => photoCategories.find((c) => c.slug === slug),
    [photoCategories, slug],
  );

  const items = useMemo(
    () =>
      photos
        .filter((p) => p.categorySlug === slug)
        .sort((a, b) => a.sort - b.sort),
    [photos, slug],
  );

  /** Lightbox'ta açık olan fotoğrafın index'i; null kapalı demek. */
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Klavye kontrolleri (ok tuşları, ESC).
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIdx(null);
      else if (e.key === "ArrowRight")
        setLightboxIdx((i) =>
          i === null ? null : Math.min(items.length - 1, i + 1),
        );
      else if (e.key === "ArrowLeft")
        setLightboxIdx((i) => (i === null ? null : Math.max(0, i - 1)));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, items.length]);

  // Bootstrap tamamlandıktan sonra hâlâ kategori bulunamadıysa /galeri/foto'ya
  // yönlendir; eski/silinmiş slug'larda 404 yerine zarif fallback.
  useEffect(() => {
    if (ready && slug && !category) {
      router.replace("/galeri/foto");
    }
  }, [ready, slug, category, router]);

  if (!category) {
    return null;
  }

  const active = lightboxIdx !== null ? items[lightboxIdx] : null;

  return (
    <>
      <PageHeader
        title={category.name}
        description={category.description || "Bu kategorideki tüm fotoğraflar."}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Foto Galeri", href: "/galeri/foto" },
          { label: category.name },
        ]}
      />

      <section>
        <Container className="py-16">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-medium text-brand-900">
                Bu kategoride henüz fotoğraf yok
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Yakında bu alana yeni fotoğraflar eklenecek.
              </p>
              <Link
                href="/galeri/foto"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <ChevronLeft className="h-4 w-4" /> Tüm kategoriler
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  className="group aspect-square overflow-hidden rounded-xl bg-muted border border-border hover:border-brand-300 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.title || category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Lightbox */}
      {active && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Fotoğraf görüntüleyici"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx(null);
            }}
            className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center backdrop-blur transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          {lightboxIdx > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx - 1);
              }}
              className="absolute left-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center backdrop-blur transition-colors"
              aria-label="Önceki"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {lightboxIdx < items.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx + 1);
              }}
              className="absolute right-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center backdrop-blur transition-colors"
              aria-label="Sonraki"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div
            className="max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.imageUrl}
              alt={active.title || category.name}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
            <div className="mt-3 text-center text-white/85 text-sm">
              {active.title && (
                <div className="font-medium">{active.title}</div>
              )}
              <div className="text-white/55 text-xs mt-0.5">
                {lightboxIdx + 1} / {items.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
