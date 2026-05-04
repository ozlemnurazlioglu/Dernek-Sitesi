"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { Aga } from "@/lib/types";

export default function AgalarPage() {
  return (
    <ContentListAdmin
      type="agalar"
      title="Ağalarımız"
      description="Geleneksel Piknik Şöleni'nde derneğimizin ağalığını üstlenen değerli hemşehrilerimiz. Bu liste anasayfadaki 'Ağalarımız' bölümünde gösterilir."
      singular="Ağa"
      fields={[
        {
          key: "year",
          label: "Yıl",
          type: "text",
          placeholder: "2024",
          required: true,
        },
        {
          key: "name",
          label: "İsim",
          type: "text",
          placeholder: "Abdullah Beyrek",
          required: true,
        },
        {
          key: "photoUrl",
          label: "Fotoğraf",
          type: "image",
          required: true,
        },
        {
          key: "caption",
          label: "Üst yazı",
          type: "text",
          placeholder: "25. Geleneksel Piknik Şöleni Ağamız",
        },
        {
          key: "eventDate",
          label: "Etkinlik tarihi",
          type: "text",
          placeholder: "09.06.2024",
        },
      ]}
      renderRow={(item) => {
        const a = item as unknown as Aga;
        return (
          <div className="flex items-center gap-3">
            {a.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.photoUrl}
                alt={a.name}
                className="h-14 w-20 rounded-md object-cover bg-muted shrink-0"
              />
            ) : (
              <div className="h-14 w-20 rounded-md bg-muted shrink-0" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-brand-900 font-medium truncate">
                  {a.name}
                </span>
                <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {a.year}
                </code>
              </div>
              {a.caption && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {a.caption}
                  {a.eventDate ? ` · ${a.eventDate}` : ""}
                </p>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
