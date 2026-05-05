"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { VideoCategory } from "@/lib/types";

export default function VideoKategorileriPage() {
  return (
    <ContentListAdmin
      type="video-categories"
      title="Video Galeri Kategorileri"
      description="Video galeri için kategoriler. Her kategori, /galeri/video/<slug> URL'ine sahip ayrı bir sayfada listelenir."
      singular="Kategori"
      fields={[
        {
          key: "slug",
          label: "URL Slug (sadece küçük harf, tire)",
          type: "text",
          placeholder: "tanitim",
          required: true,
        },
        {
          key: "name",
          label: "Görünen Ad",
          type: "text",
          placeholder: "Tanıtım Filmleri",
          required: true,
        },
        {
          key: "description",
          label: "Açıklama",
          type: "textarea",
          placeholder: "Kategorinin kısa tanıtımı (opsiyonel).",
          rows: 2,
        },
        {
          key: "coverUrl",
          label: "Kapak Görseli",
          type: "image",
          placeholder: "/galeri/video sayfasında kart kapağı olarak gösterilir",
        },
      ]}
      renderRow={(item) => {
        const c = item as unknown as VideoCategory;
        return (
          <div className="flex items-center gap-3 flex-wrap">
            {c.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.coverUrl}
                alt={c.name}
                className="h-10 w-10 rounded object-cover bg-muted border border-border"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-muted border border-border" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-brand-900 font-medium truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground font-mono truncate">
                /galeri/video/{c.slug}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
