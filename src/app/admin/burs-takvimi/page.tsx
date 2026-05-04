"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { ScholarshipTimelineStep } from "@/lib/types";

export default function BursTakvimiPage() {
  return (
    <ContentListAdmin
      type="scholarship-timeline"
      title="Burs Başvuru Takvimi"
      description="Burs sayfasındaki adım adım başvuru takvimi kartları."
      singular="Adım"
      fields={[
        {
          key: "dateLabel",
          label: "Tarih (görünen)",
          type: "text",
          placeholder: "1–30 Eylül",
          required: true,
        },
        { key: "title", label: "Başlık", type: "text", required: true },
        {
          key: "description",
          label: "Açıklama",
          type: "text",
          required: true,
        },
      ]}
      renderRow={(item) => {
        const s = item as unknown as ScholarshipTimelineStep;
        return (
          <div>
            <div className="text-xs text-gold-600">{s.dateLabel}</div>
            <div className="font-medium text-brand-900">{s.title}</div>
            <div className="text-xs text-muted-foreground">{s.description}</div>
          </div>
        );
      }}
    />
  );
}
