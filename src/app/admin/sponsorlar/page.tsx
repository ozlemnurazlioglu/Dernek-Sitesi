"use client";

import { useMemo } from "react";
import { ContentListAdmin } from "@/components/admin/content-list";
import { getSponsorColors, makeTierMap } from "@/components/site/sponsor-card";
import { useStore } from "@/lib/store";
import type { Sponsor } from "@/lib/types";

export default function SponsorlarAdminPage() {
  const { sponsorTiers } = useStore();

  // Tür seçimi için dropdown opsiyonlarını sıraya göre üret.
  const tierOptions = useMemo(() => {
    const sorted = [...sponsorTiers].sort((a, b) => a.sort - b.sort);
    return [
      { value: "", label: "— Türsüz —" },
      ...sorted.map((t) => ({ value: t.slug, label: t.name })),
    ];
  }, [sponsorTiers]);

  const tierMap = useMemo(() => makeTierMap(sponsorTiers), [sponsorTiers]);

  return (
    <ContentListAdmin
      type="sponsors"
      title="Sponsorlarımız"
      description="Anasayfa 'Sponsorlarımız' bölümünde gösterilen iş ortakları. Logo, isim, opsiyonel web sitesi ve sponsor türü ekleyin. Türleri 'Sponsor Türleri' menüsünden yönetin."
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
        {
          key: "tierSlug",
          label: "Sponsor Türü",
          type: "select",
          options: tierOptions,
        },
      ]}
      renderRow={(item) => {
        const s = item as unknown as Sponsor;
        const tier = s.tierSlug ? tierMap[s.tierSlug] : undefined;
        const colors = getSponsorColors(tier?.color);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-12 w-20 rounded-md border-2 ${colors.border} bg-white flex items-center justify-center shrink-0 overflow-hidden`}
            >
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-brand-900 font-medium truncate">
                  {s.name}
                </span>
                {tier ? (
                  <span
                    className={`inline-flex text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText}`}
                  >
                    {tier.name}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">
                    türsüz
                  </span>
                )}
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
