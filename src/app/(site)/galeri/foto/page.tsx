"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { useStore } from "@/lib/store";

/**
 * `/galeri/foto` — Tüm foto kategorilerini kart grid'i olarak listeler.
 * Her kart o kategorinin foto sayısını ve kapak görselini gösterir.
 */
export default function FotoGaleriIndexPage() {
  const { photoCategories, photos } = useStore();

  const categoriesSorted = useMemo(
    () => [...photoCategories].sort((a, b) => a.sort - b.sort),
    [photoCategories],
  );

  // Her kategorinin foto sayısı + kapak fallback'i (kapak yoksa ilk foto).
  const photosByCat = useMemo(() => {
    const m: Record<string, typeof photos> = {};
    for (const p of photos) {
      (m[p.categorySlug] ??= []).push(p);
    }
    return m;
  }, [photos]);

  return (
    <>
      <PageHeader
        title="Foto Galeri"
        description="Derneğimizin etkinliklerinden, mekanlarımızdan ve özel anlardan kareler."
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Foto Galeri" },
        ]}
      />

      <section>
        <Container className="py-16">
          {categoriesSorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-medium text-brand-900">
                Henüz galeri kategorisi yok
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Yetkili kullanıcılar yönetim panelinden kategori ekleyebilir.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoriesSorted.map((cat) => {
                const catPhotos = photosByCat[cat.slug] ?? [];
                const cover = cat.coverUrl || catPhotos[0]?.imageUrl || "";
                return (
                  <Link
                    key={cat.id}
                    href={`/galeri/foto/${cat.slug}`}
                    className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md hover:border-brand-200 transition-all"
                  >
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-medium">
                        <ImageIcon className="h-3 w-3" />
                        {catPhotos.length} foto
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
