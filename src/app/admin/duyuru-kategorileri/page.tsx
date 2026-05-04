"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import {
  ANNOUNCEMENT_COLOR_OPTIONS,
  getAnnouncementColors,
} from "@/components/site/announcement-card";
import type { AnnouncementCategory } from "@/lib/types";

export default function DuyuruKategorileriAdminPage() {
  return (
    <ContentListAdmin
      type="announcement-categories"
      title="Duyuru Kategorileri"
      description="Hemşehri ilanları için kullanılan kategoriler ve renkleri. /duyurular sayfasındaki filtre tabları bu listeden gelir."
      singular="Kategori"
      fields={[
        {
          key: "slug",
          label: "Slug (URL kodu)",
          type: "text",
          placeholder: "vefat",
          required: true,
        },
        {
          key: "name",
          label: "Görünen ad",
          type: "text",
          placeholder: "Vefat",
          required: true,
        },
        {
          key: "color",
          label: "Renk",
          type: "select",
          required: true,
          options: ANNOUNCEMENT_COLOR_OPTIONS,
        },
      ]}
      renderRow={(item) => {
        const c = item as unknown as AnnouncementCategory;
        const colors = getAnnouncementColors(c.color);
        return (
          <div className="flex items-center gap-3">
            <span className={`h-8 w-1.5 rounded ${colors.topBar}`} />
            <span
              className={`inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText}`}
            >
              {c.name}
            </span>
            <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {c.slug}
            </code>
          </div>
        );
      }}
    />
  );
}
