"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { ScholarshipProgram } from "@/lib/types";

export default function BursProgramlariPage() {
  return (
    <ContentListAdmin
      type="scholarship-programs"
      title="Burs Programları"
      description="Burs sayfasında listelenen programlar (lise, üniversite vb.)."
      singular="Program"
      fields={[
        { key: "title", label: "Program adı", type: "text", required: true },
        {
          key: "monthly",
          label: "Aylık tutar (metin)",
          type: "text",
          placeholder: "1.500 ₺ / ay",
          required: true,
        },
        { key: "duration", label: "Süre", type: "text", placeholder: "9 ay", required: true },
        {
          key: "targets",
          label: "Hedef kitle",
          type: "text",
          placeholder: "Lisans öğrencileri",
          required: true,
        },
        { key: "quota", label: "Kontenjan", type: "number", required: true },
        {
          key: "requirements",
          label: "Şartlar (her satıra bir madde)",
          type: "list",
          placeholder: "Üniversite öğrencisi olmak",
        },
      ]}
      renderRow={(item) => {
        const p = item as unknown as ScholarshipProgram;
        return (
          <div>
            <div className="font-medium text-brand-900">{p.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {p.monthly} · {p.duration} · {p.quota} kontenjan
            </div>
          </div>
        );
      }}
    />
  );
}
