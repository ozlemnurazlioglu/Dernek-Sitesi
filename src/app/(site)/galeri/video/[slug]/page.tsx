"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Film } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { useStore } from "@/lib/store";

/**
 * `/galeri/video/[slug]` — Bir video kategorisindeki tüm videoları
 * grid içinde HTML5 video player'ları olarak gösterir.
 */
export default function VideoKategoriSayfasi() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;
  const { videoCategories, videos, ready } = useStore();

  const category = useMemo(
    () => videoCategories.find((c) => c.slug === slug),
    [videoCategories, slug],
  );

  const items = useMemo(
    () =>
      videos
        .filter((v) => v.categorySlug === slug)
        .sort((a, b) => a.sort - b.sort),
    [videos, slug],
  );

  useEffect(() => {
    if (ready && slug && !category) {
      router.replace("/galeri/video");
    }
  }, [ready, slug, category, router]);

  if (!category) return null;

  return (
    <>
      <PageHeader
        title={category.name}
        description={category.description || "Bu kategorideki tüm videolar."}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Video Galeri", href: "/galeri/video" },
          { label: category.name },
        ]}
      />

      <section>
        <Container className="py-16">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
              <Film className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-base font-medium text-brand-900">
                Bu kategoride henüz video yok
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Yakında bu alana yeni videolar eklenecek.
              </p>
              <Link
                href="/galeri/video"
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <ChevronLeft className="h-4 w-4" /> Tüm kategoriler
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((v) => (
                <article
                  key={v.id}
                  className="rounded-2xl border border-border bg-white overflow-hidden flex flex-col"
                >
                  <div className="aspect-video bg-black">
                    <video
                      src={v.videoUrl}
                      poster={v.posterUrl || undefined}
                      controls
                      preload="metadata"
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-semibold text-brand-900">
                      {v.title}
                    </h3>
                    {v.description && (
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {v.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
