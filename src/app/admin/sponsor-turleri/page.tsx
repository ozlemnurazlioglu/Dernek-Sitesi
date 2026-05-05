"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import {
  SPONSOR_COLOR_OPTIONS,
  getSponsorColors,
} from "@/components/site/sponsor-card";
import type { SponsorTier } from "@/lib/types";

export default function SponsorTurleriAdminPage() {
  return (
    <ContentListAdmin
      type="sponsor-tiers"
      title="Sponsor Türleri"
      description="Platin, Altın, Gümüş, Bronz gibi sponsor kademeleri ve renkleri. Her sponsor bir türe atanabilir; logosunun çevresinde tür rengiyle çerçeve gösterilir."
      singular="Tür"
      fields={[
        {
          key: "slug",
          label: "Slug (URL kodu)",
          type: "text",
          placeholder: "platin",
          required: true,
        },
        {
          key: "name",
          label: "Görünen ad",
          type: "text",
          placeholder: "Platin",
          required: true,
        },
        {
          key: "color",
          label: "Renk",
          type: "select",
          required: true,
          options: SPONSOR_COLOR_OPTIONS,
        },
      ]}
      renderRow={(item) => {
        const t = item as unknown as SponsorTier;
        const colors = getSponsorColors(t.color);
        return (
          <div className="flex items-center gap-3">
            <span
              className={`h-10 w-10 rounded-lg border-2 ${colors.border} ${colors.badgeBg} flex items-center justify-center`}
              aria-hidden
            >
              <span
                className={`h-3 w-3 rounded-sm ${colors.border.replace(
                  "border-",
                  "bg-",
                )}`}
              />
            </span>
            <span
              className={`inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText}`}
            >
              {t.name}
            </span>
            <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {t.slug}
            </code>
          </div>
        );
      }}
    />
  );
}
