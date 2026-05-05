"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { PhotoCategory } from "@/lib/types";

export default function FotoKategorileriPage() {
  return (
    <ContentListAdmin
      type="photo-categories"
      title="Foto Galeri Kategorileri"
      description="Foto galeri için kategoriler. Her kategori, /galeri/foto/<slug> URL'ine sahip ayrı bir sayfada listelenir."
      singular="Kategori"
      fields={[
        {
          key: "slug",
          label: "URL Slug (sadece küçük harf, tire)",
          type: "text",
          placeholder: "dernek-merkezimiz",
          required: true,
        },
        {
          key: "name",
          label: "Görünen Ad",
          type: "text",
          placeholder: "Dernek Merkezimiz",
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
          placeholder: "/galeri/foto sayfasında kart kapağı olarak gösterilir",
        },
      ]}
      renderRow={(item) => {
        const c = item as unknown as PhotoCategory;
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
                /galeri/foto/{c.slug}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
