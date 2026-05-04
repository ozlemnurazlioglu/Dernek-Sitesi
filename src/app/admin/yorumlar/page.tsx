"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { Testimonial } from "@/lib/types";

export default function YorumlarPage() {
  return (
    <ContentListAdmin
      type="testimonials"
      title="Bursiyer Yorumları"
      description="Ana sayfadaki bursiyer / mezun yorumları."
      singular="Yorum"
      fields={[
        { key: "name", label: "Ad", type: "text", required: true },
        { key: "role", label: "Rol / Bölüm", type: "text", required: true },
        { key: "avatar", label: "Fotoğraf", type: "image", required: true },
        { key: "text", label: "Yorum metni", type: "textarea", rows: 4, required: true },
      ]}
      renderRow={(item) => {
        const t = item as unknown as Testimonial;
        return (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt={t.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="font-medium text-brand-900 truncate">{t.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {t.text}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
