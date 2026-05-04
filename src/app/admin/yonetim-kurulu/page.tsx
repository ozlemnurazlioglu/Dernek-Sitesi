"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { BoardMember } from "@/lib/types";

export default function YonetimKuruluPage() {
  return (
    <ContentListAdmin
      type="board-members"
      title="Yönetim Kurulu"
      description="Hakkımızda sayfasında listelenen yönetim kurulu üyeleri."
      singular="Üye"
      fields={[
        { key: "name", label: "Ad Soyad", type: "text", required: true },
        { key: "role", label: "Görev / Rol", type: "text", required: true, placeholder: "Örn. Başkan Yardımcısı, Genel Sekreter, Üye" },
        {
          key: "level",
          label: "Hiyerarşi Seviyesi",
          type: "select",
          required: true,
          options: [
            { value: "baskan", label: "Başkan (en üstte tek kişi)" },
            { value: "yonetim", label: "Yönetim Ekibi (orta sıra)" },
            { value: "uye", label: "Üye (alt sıra)" },
          ],
        },
        { key: "avatar", label: "Fotoğraf", type: "image", placeholder: "https://… veya dosya seçin", required: true },
        { key: "bio", label: "Kısa biyografi (opsiyonel)", type: "textarea" },
      ]}
      renderRow={(item) => {
        const m = item as unknown as BoardMember;
        const levelLabel =
          m.level === "baskan"
            ? "Başkan"
            : m.level === "yonetim"
              ? "Yönetim"
              : "Üye";
        const levelColor =
          m.level === "baskan"
            ? "bg-gold-100 text-gold-700"
            : m.level === "yonetim"
              ? "bg-brand-100 text-brand-700"
              : "bg-muted text-muted-foreground";
        return (
          <div className="flex items-center gap-4 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.avatar}
              alt={m.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-50"
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-brand-900 truncate">{m.name}</div>
              <div className="text-xs text-gold-600">{m.role}</div>
            </div>
            <span
              className={
                "shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full " +
                levelColor
              }
            >
              {levelLabel}
            </span>
          </div>
        );
      }}
    />
  );
}
