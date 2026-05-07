"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { ActivityReport } from "@/lib/types";

export default function RaporlarPage() {
  return (
    <ContentListAdmin
      type="activity-reports"
      title="Raporlar & Belgeler"
      description="Hakkımızda sayfasındaki kart listesi. Faaliyet raporu, üyelik formu, kurumsal kimlik gibi PDF belgeleri buradan yönetilir."
      singular="Belge"
      fields={[
        {
          key: "label",
          label: "Üst Etiket",
          type: "text",
          placeholder: "Faaliyet Raporu / Üyelik Formu / Kurumsal Kimlik",
          required: true,
        },
        {
          key: "year",
          label: "Başlık",
          type: "text",
          placeholder: "Örn: 2024 veya Üyelik Formu 2026",
          required: true,
        },
        {
          key: "pdfUrl",
          label: "PDF dosyası",
          type: "file",
          placeholder: "https://… veya PDF seçin",
          required: true,
        },
      ]}
      renderRow={(item) => {
        const r = item as unknown as ActivityReport;
        return (
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {r.label?.trim() || "Faaliyet Raporu"}
            </div>
            <div className="text-lg font-semibold text-brand-900 mt-0.5">
              {r.year}
            </div>
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {r.pdfUrl}
            </div>
          </div>
        );
      }}
    />
  );
}
