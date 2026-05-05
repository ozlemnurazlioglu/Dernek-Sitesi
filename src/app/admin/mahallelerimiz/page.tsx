"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { Neighborhood } from "@/lib/types";

export default function MahallelerimizAdminPage() {
  return (
    <ContentListAdmin
      type="neighborhoods"
      title="Mahallelerimiz"
      description="/hakkimizda/mahallelerimiz sayfasındaki tabloda gösterilen mahalleler. Mahalle adı, görevli muhtar ve iletişim telefonu bilgilerini buradan yönetin."
      singular="Mahalle"
      fields={[
        {
          key: "name",
          label: "Mahalle Adı",
          type: "text",
          placeholder: "Yalı Mahallesi",
          required: true,
        },
        {
          key: "headman",
          label: "Muhtar",
          type: "text",
          placeholder: "Ahmet Yılmaz",
        },
        {
          key: "phone",
          label: "Telefon (tıklanınca aranır)",
          type: "text",
          placeholder: "0535 123 45 67",
        },
      ]}
      renderRow={(item) => {
        const n = item as unknown as Neighborhood;
        return (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-brand-900 font-medium truncate">
              {n.name}
            </span>
            {n.headman && (
              <span className="text-sm text-muted-foreground">
                · Muhtar: <span className="text-brand-800">{n.headman}</span>
              </span>
            )}
            {n.phone && (
              <span className="ml-auto text-xs text-muted-foreground font-mono">
                {n.phone}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}
