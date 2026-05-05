"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Film } from "lucide-react";
import { ContentListAdmin } from "@/components/admin/content-list";
import { useStore } from "@/lib/store";
import type { Video } from "@/lib/types";

export default function VideoGaleriAdminPage() {
  const { videoCategories } = useStore();

  const categoryOptions = useMemo(
    () =>
      [...videoCategories]
        .sort((a, b) => a.sort - b.sort)
        .map((c) => ({ value: c.slug, label: c.name })),
    [videoCategories],
  );

  const catBySlug = useMemo(() => {
    const m: Record<string, (typeof videoCategories)[number]> = {};
    for (const c of videoCategories) m[c.slug] = c;
    return m;
  }, [videoCategories]);

  if (categoryOptions.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-brand-900">Video Galeri</h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Henüz video kategorisi yok. Video ekleyebilmek için önce en az bir
          kategori oluşturun.
          <div className="mt-4">
            <Link
              href="/admin/video-kategorileri"
              className="inline-flex items-center text-sm font-medium text-amber-800 underline underline-offset-4"
            >
              Video kategorilerine git →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ContentListAdmin
      type="videos"
      title="Video Galeri"
      description="Galeri kategorilerine video dosyası yükleyin. MP4 ya da WebM formatlarında, en fazla 100 MB."
      singular="Video"
      fields={[
        {
          key: "categorySlug",
          label: "Kategori",
          type: "select",
          required: true,
          options: categoryOptions,
        },
        {
          key: "title",
          label: "Başlık",
          type: "text",
          placeholder: "Etkinlik tanıtım videosu",
          required: true,
        },
        {
          key: "description",
          label: "Açıklama",
          type: "textarea",
          rows: 2,
          placeholder: "Videonun kısa açıklaması (opsiyonel).",
        },
        {
          key: "videoUrl",
          label: "Video Dosyası (MP4/WebM)",
          type: "video",
          required: true,
        },
        {
          key: "posterUrl",
          label: "Poster Görseli (opsiyonel)",
          type: "image",
          placeholder: "Video oynatılmadan önce gösterilen kapak resmi",
        },
      ]}
      renderRow={(item) => {
        const v = item as unknown as Video;
        const cat = catBySlug[v.categorySlug];
        return (
          <div className="flex items-center gap-3 flex-wrap">
            {v.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={v.posterUrl}
                alt={v.title}
                className="h-12 w-16 rounded object-cover bg-muted border border-border"
              />
            ) : (
              <div className="h-12 w-16 rounded bg-muted border border-border inline-flex items-center justify-center text-muted-foreground">
                <Film className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 self-start">
                {cat?.name ?? v.categorySlug}
              </span>
              <span className="text-brand-900 font-medium truncate mt-1">
                {v.title}
              </span>
            </div>
          </div>
        );
      }}
    />
  );
}
