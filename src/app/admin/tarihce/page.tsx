"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { Milestone } from "@/lib/types";

export default function TarihcePage() {
  return (
    <ContentListAdmin
      type="milestones"
      title="Tarihçe (Zaman Çizelgesi)"
      description="Hakkımızda sayfasındaki yıl bazlı kilometre taşları."
      singular="Kilometre Taşı"
      fields={[
        { key: "year", label: "Yıl", type: "text", placeholder: "2008", required: true },
        { key: "text", label: "Açıklama", type: "textarea", required: true },
      ]}
      renderRow={(item) => {
        const m = item as unknown as Milestone;
        return (
          <div className="flex items-start gap-4">
            <span className="inline-flex h-9 px-3 rounded-md bg-gold-100 text-gold-700 font-semibold items-center text-sm shrink-0">
              {m.year}
            </span>
            <p className="text-brand-900">{m.text}</p>
          </div>
        );
      }}
    />
  );
}
