"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { Sponsor } from "@/lib/types";

export default function SponsorlarAdminPage() {
  return (
    <ContentListAdmin
      type="sponsors"
      title="Sponsorlarımız"
      description="Anasayfa 'Sponsorlarımız' bölümünde gösterilen iş ortakları. Logo, isim ve isteğe bağlı web sitesi bilgisi ekleyin."
      singular="Sponsor"
      fields={[
        {
          key: "name",
          label: "İsim",
          type: "text",
          placeholder: "ABC Şirketi",
          required: true,
        },
        {
          key: "logoUrl",
          label: "Logo",
          type: "image",
          required: true,
        },
        {
          key: "websiteUrl",
          label: "Web Sitesi (opsiyonel)",
          type: "url",
          placeholder: "https://www.ornek.com",
        },
      ]}
      renderRow={(item) => {
        const s = item as unknown as Sponsor;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-20 rounded-md border border-border bg-white flex items-center justify-center shrink-0 overflow-hidden">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-muted-foreground">logo yok</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-brand-900 font-medium truncate">
                {s.name}
              </div>
              {s.websiteUrl && (
                <div className="text-xs text-muted-foreground truncate">
                  {s.websiteUrl}
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}
