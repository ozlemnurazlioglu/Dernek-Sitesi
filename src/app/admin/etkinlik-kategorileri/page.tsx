"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { EventCategory } from "@/lib/types";

export default function EtkinlikKategorileriPage() {
  return (
    <ContentListAdmin
      type="event-categories"
      title="Etkinlik Kategorileri"
      description="Etkinlik listesindeki filtreler ve etkinlik düzenleme formundaki kategori dropdown'ı için kullanılan etiketler. Etiket adı etkinlik kayıtlarında metin olarak saklandığı için, bir kategori adını değiştirirseniz mevcut etkinliklerin kategori değerini de manuel güncellemeniz gerekebilir."
      singular="Kategori"
      fields={[
        {
          key: "name",
          label: "Kategori adı",
          type: "text",
          placeholder: "Eğitim, Sosyal, Yardım, Konferans …",
          required: true,
        },
      ]}
      renderRow={(item) => {
        const c = item as unknown as EventCategory;
        return <span className="text-brand-900 font-medium">{c.name}</span>;
      }}
    />
  );
}
