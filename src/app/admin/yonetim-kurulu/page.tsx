"use client";

import { ContentListAdmin, type FieldDef } from "@/components/admin/content-list";
import { useStore } from "@/lib/store";
import type { BoardMember } from "@/lib/types";

export default function YonetimKuruluPage() {
  const { boardLevels } = useStore();

  // Hiyerarşi seviyeleri admin tarafından yönetildiği için seçenek listesini
  // store'dan dinamik olarak inşa ediyoruz. Eski sabit 3 seviye (baskan/
  // yonetim/uye) ile geriye uyumluluk: tablo boşsa fallback dizinin tamamı.
  const levelOptions = (boardLevels.length > 0
    ? [...boardLevels].sort((a, b) => a.sort - b.sort)
    : [
        { id: "fallback-baskan", slug: "baskan", name: "Başkan", size: "lg" as const, sort: 10 },
        { id: "fallback-yonetim", slug: "yonetim", name: "Yönetim", size: "md" as const, sort: 20 },
        { id: "fallback-uye", slug: "uye", name: "Üye", size: "sm" as const, sort: 30 },
      ]
  ).map((lv) => ({ value: lv.slug, label: lv.name }));

  const fields: FieldDef[] = [
    { key: "name", label: "Ad Soyad", type: "text", required: true },
    {
      key: "role",
      label: "Görev / Rol",
      type: "text",
      required: true,
      placeholder: "Örn. Başkan Yardımcısı, Genel Sekreter, Üye",
    },
    {
      key: "level",
      label: "Hiyerarşi Seviyesi",
      type: "select",
      required: true,
      options: levelOptions,
    },
    {
      key: "shape",
      label: "Fotoğraf Şekli",
      type: "select",
      required: true,
      options: [
        { value: "circle", label: "Yuvarlak" },
        { value: "square", label: "Kare (yumuşatılmış köşe)" },
      ],
    },
    {
      key: "avatar",
      label: "Fotoğraf",
      type: "image",
      placeholder: "https://… veya dosya seçin",
      required: true,
    },
    { key: "bio", label: "Kısa biyografi (opsiyonel)", type: "textarea" },
  ];

  // Seviye slug → görünen ad eşlemesi (renderRow rozeti için).
  const levelLabelMap = new Map<string, string>();
  for (const lv of boardLevels) levelLabelMap.set(lv.slug, lv.name);

  return (
    <ContentListAdmin
      type="board-members"
      title="Yönetim Kurulu"
      description="Hakkımızda sayfasında listelenen yönetim kurulu üyeleri. Seviyeler 'Yönetim Kurulu Seviyeleri' sayfasından özelleştirilebilir."
      singular="Üye"
      fields={fields}
      renderRow={(item) => {
        const m = item as unknown as BoardMember;
        const levelLabel = levelLabelMap.get(m.level) ?? m.level;
        const shape = m.shape === "square" ? "square" : "circle";
        const imgShape = shape === "square" ? "rounded-lg" : "rounded-full";
        return (
          <div className="flex items-center gap-4 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.avatar}
              alt={m.name}
              className={`h-12 w-12 object-cover ring-2 ring-brand-50 ${imgShape}`}
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-brand-900 truncate">{m.name}</div>
              <div className="text-xs text-gold-600">{m.role}</div>
            </div>
            <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
              {levelLabel}
            </span>
            <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {shape === "square" ? "Kare" : "Yuvarlak"}
            </span>
          </div>
        );
      }}
    />
  );
}
