"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { ActivityReport } from "@/lib/types";

export default function RaporlarPage() {
  return (
    <ContentListAdmin
      type="activity-reports"
      title="Faaliyet Raporları"
      description="Hakkımızda sayfasında yıllık olarak listelenen faaliyet raporu PDF'leri."
      singular="Rapor"
      fields={[
        { key: "year", label: "Yıl", type: "text", required: true },
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
            <div className="text-lg font-semibold text-brand-900">{r.year}</div>
            <div className="text-xs text-muted-foreground truncate">
              {r.pdfUrl}
            </div>
          </div>
        );
      }}
    />
  );
}
