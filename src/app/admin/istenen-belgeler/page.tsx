"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import { Badge } from "@/components/ui/badge";
import type { RequiredDocument } from "@/lib/types";

export default function IstenenBelgelerPage() {
  return (
    <ContentListAdmin
      type="required-documents"
      title="İstenen Belgeler"
      description="Burs sayfasında listelenen ve başvuru formunda yüklenmesi istenen belgeler. 'Anahtar' alanı, başvuru formundaki dosya yükleme alanlarının kimliğidir; benzersiz olmalıdır."
      singular="Belge"
      fields={[
        {
          key: "docKey",
          label: "Anahtar (key)",
          type: "text",
          placeholder: "id_card, transcript, photo …",
          required: true,
        },
        {
          key: "title",
          label: "Belge adı",
          type: "text",
          placeholder: "Nüfus Cüzdanı / Kimlik",
          required: true,
        },
        {
          key: "description",
          label: "Kısa açıklama",
          type: "text",
          placeholder: "Ön ve arka yüzü, PDF veya JPG",
        },
        {
          key: "icon",
          label: "İkon (emoji)",
          type: "text",
          placeholder: "📄",
          required: true,
        },
        {
          key: "required",
          label: "Bu belge zorunlu",
          type: "boolean",
          hint: "Kapalıysa başvuran isterse atlayabilir.",
        },
      ]}
      renderRow={(item) => {
        const d = item as unknown as RequiredDocument;
        return (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{d.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-brand-900 font-medium">{d.title}</span>
                {d.required ? (
                  <Badge tone="danger">Zorunlu</Badge>
                ) : (
                  <Badge tone="brand">Opsiyonel</Badge>
                )}
                <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {d.docKey}
                </code>
              </div>
              {d.description && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {d.description}
                </p>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
