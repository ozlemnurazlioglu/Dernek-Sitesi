"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Film, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { useStore } from "@/lib/store";

/**
 * `/galeri/video` — Tüm video kategorilerini kart grid'i olarak listeler.
 */
export default function VideoGaleriIndexPage() {
  const { videoCategories, videos } = useStore();

  const categoriesSorted = useMemo(
    () => [...videoCategories].sort((a, b) => a.sort - b.sort),
    [videoCategories],
  );

  const videosByCat = useMemo(() => {
    const m: Record<string, typeof videos> = {};
    for (const v of videos) {
      (m[v.categorySlug] ??= []).push(v);
    }
    return m;
  }, [videos]);

  return (
    <>
      <PageHeader
        title="Video Galeri"
        description="Etkinliklerimizden ve özel anılarımızdan video kayıtları."
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Video Galeri" },
        ]}
      />

      <section>
        <Container className="py-16">
          {categoriesSorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
              <Film className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-medium text-brand-900">
                Henüz video kategorisi yok
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Yetkili kullanıcılar yönetim panelinden kategori ekleyebilir.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoriesSorted.map((cat) => {
                const catVideos = videosByCat[cat.slug] ?? [];
                const cover =
                  cat.coverUrl ||
                  catVideos.find((v) => v.posterUrl)?.posterUrl ||
                  "";
                return (
                  <Link
                    key={cat.id}
                    href={`/galeri/video/${cat.slug}`}
                    className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md hover:border-brand-200 transition-all"
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <Film className="h-10 w-10" />
                        </div>
                      )}
                      {/* Oynat sembolü overlay'i */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-white/95 text-brand-900 inline-flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-8 w-8" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-medium">
                        <Film className="h-3 w-3" />
                        {catVideos.length} video
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-brand-900 group-hover:text-brand-700 transition-colors">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
