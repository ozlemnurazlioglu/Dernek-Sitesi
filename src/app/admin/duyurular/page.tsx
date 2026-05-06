"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ContentListAdmin } from "@/components/admin/content-list";
import { getAnnouncementColors } from "@/components/site/announcement-card";
import { useStore } from "@/lib/store";
import type { Announcement } from "@/lib/types";

export default function DuyurularAdminPage() {
  const { announcementCategories } = useStore();

  const categoryOptions = useMemo(
    () =>
      [...announcementCategories]
        .sort((a, b) => a.sort - b.sort)
        .map((c) => ({ value: c.slug, label: c.name })),
    [announcementCategories],
  );

  const catBySlug = useMemo(() => {
    const m: Record<string, (typeof announcementCategories)[number]> = {};
    for (const c of announcementCategories) m[c.slug] = c;
    return m;
  }, [announcementCategories]);

  if (categoryOptions.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-brand-900">
          Hemşehri İlanları
        </h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Henüz duyuru kategorisi yok. İlan ekleyebilmek için önce en az bir
          kategori (Vefat, Düğün vb.) tanımlayın.
          <div className="mt-4">
            <Link
              href="/admin/duyuru-kategorileri"
              className="inline-flex items-center text-sm font-medium text-amber-800 underline underline-offset-4"
            >
              Kategorilere git →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ContentListAdmin
      type="announcements"
      title="Hemşehri İlanları"
      description="Vefat, düğün, nişan, etkinlik gibi hemşehri duyurularını buradan yönetin. Bu liste anasayfa ve /duyurular sayfasında görüntülenir."
      singular="İlan"
      fields={[
        {
          key: "categorySlug",
          label: "Kategori",
          type: "select",
          required: true,
          options: categoryOptions,
        },
        {
          key: "title",
          label: "Başlık",
          type: "text",
          placeholder: "Ayşe & Mehmet Düğünü",
          required: true,
        },
        {
          key: "description",
          label: "Açıklama",
          type: "textarea",
          placeholder: "Kısa bir açıklama yazın",
          rows: 3,
        },
        {
          key: "eventDate",
          label: "Tarih",
          type: "text",
          placeholder: "15 Haziran 2026",
        },
        {
          key: "startTime",
          label: "Başlangıç saati",
          type: "time",
          placeholder: "14:00",
        },
        {
          key: "endTime",
          label: "Bitiş saati",
          type: "time",
          placeholder: "18:00",
        },
        {
          key: "location",
          label: "Yer (haritada açılır)",
          type: "text",
          placeholder: "Kumru Düğün Salonu",
        },
        {
          key: "phone",
          label: "Telefon (tıklanınca aranır)",
          type: "text",
          placeholder: "0535 123 45 67",
        },
      ]}
      renderRow={(item) => {
        const a = item as unknown as Announcement;
        const cat = catBySlug[a.categorySlug];
        const colors = getAnnouncementColors(cat?.color);
        return (
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText}`}
            >
              {cat?.name ?? a.categorySlug}
            </span>
            <span className="text-brand-900 font-medium truncate">
              {a.title}
            </span>
            {(a.eventDate || a.location) && (
              <span className="ml-auto text-xs text-muted-foreground">
                {[a.eventDate, a.location].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}
