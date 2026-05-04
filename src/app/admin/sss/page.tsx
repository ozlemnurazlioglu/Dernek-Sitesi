"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { Faq } from "@/lib/types";

export default function SssPage() {
  return (
    <ContentListAdmin
      type="faqs"
      title="Sıkça Sorulan Sorular"
      description="Burs sayfasının altındaki SSS bölümündeki sorular."
      singular="Soru"
      fields={[
        { key: "question", label: "Soru", type: "text", required: true },
        { key: "answer", label: "Cevap", type: "textarea", rows: 5, required: true },
      ]}
      renderRow={(item) => {
        const f = item as unknown as Faq;
        return (
          <div>
            <div className="font-medium text-brand-900">{f.question}</div>
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {f.answer}
            </div>
          </div>
        );
      }}
    />
  );
}
