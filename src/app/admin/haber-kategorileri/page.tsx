"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { NewsCategory } from "@/lib/types";

export default function HaberKategorileriPage() {
  return (
    <ContentListAdmin
      type="news-categories"
      title="Haber Kategorileri"
      description="Haber listesinde filtre olarak gösterilen ve haber düzenleme formundaki kategori dropdown'ında çıkan etiketler. Etiket adı haber kayıtlarında metin olarak saklandığı için, bir kategori adını değiştirirseniz mevcut haberlerin kategori değerini de manuel güncellemeniz gerekebilir."
      singular="Kategori"
      fields={[
        {
          key: "name",
          label: "Kategori adı",
          type: "text",
          placeholder: "Duyuru, Haber, Basın, Proje …",
          required: true,
        },
      ]}
      renderRow={(item) => {
        const c = item as unknown as NewsCategory;
        return <span className="text-brand-900 font-medium">{c.name}</span>;
      }}
    />
  );
}
