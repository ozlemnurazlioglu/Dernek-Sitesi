"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ContentListAdmin } from "@/components/admin/content-list";
import { useStore } from "@/lib/store";
import type { Photo } from "@/lib/types";

export default function FotoGaleriAdminPage() {
  const { photoCategories } = useStore();

  const categoryOptions = useMemo(
    () =>
      [...photoCategories]
        .sort((a, b) => a.sort - b.sort)
        .map((c) => ({ value: c.slug, label: c.name })),
    [photoCategories],
  );

  const catBySlug = useMemo(() => {
    const m: Record<string, (typeof photoCategories)[number]> = {};
    for (const c of photoCategories) m[c.slug] = c;
    return m;
  }, [photoCategories]);

  if (categoryOptions.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-brand-900">Foto Galeri</h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Henüz foto kategorisi yok. Fotoğraf ekleyebilmek için önce en az bir
          kategori oluşturun.
          <div className="mt-4">
            <Link
              href="/admin/foto-kategorileri"
              className="inline-flex items-center text-sm font-medium text-amber-800 underline underline-offset-4"
            >
              Foto kategorilerine git →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ContentListAdmin
      type="photos"
      title="Foto Galeri"
      description="Galeri kategorilerine fotoğraf ekleyin. Her fotoğraf bir kategoriye atanır ve /galeri/foto/<kategori> sayfasında görüntülenir."
      singular="Fotoğraf"
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
          label: "Başlık / Alt metin",
          type: "text",
          placeholder: "Etkinlik fotoğrafı",
        },
        {
          key: "imageUrl",
          label: "Fotoğraf",
          type: "image",
          required: true,
        },
      ]}
      renderRow={(item) => {
        const p = item as unknown as Photo;
        const cat = catBySlug[p.categorySlug];
        return (
          <div className="flex items-center gap-3 flex-wrap">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.title || "Fotoğraf"}
                className="h-12 w-16 rounded object-cover bg-muted border border-border"
              />
            ) : null}
            <div className="flex flex-col min-w-0">
              <span className="inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 self-start">
                {cat?.name ?? p.categorySlug}
              </span>
              {p.title && (
                <span className="text-brand-900 font-medium truncate mt-1">
                  {p.title}
                </span>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
