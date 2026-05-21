"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { ProtocolLevelConfig } from "@/lib/types";

const SIZE_LABEL: Record<string, { label: string; bg: string; px: string }> = {
  lg: { label: "Büyük (Başkan)", bg: "bg-gold-100 text-gold-700", px: "h-12 w-12" },
  md: { label: "Orta (Yönetim)", bg: "bg-brand-100 text-brand-700", px: "h-10 w-10" },
  sm: { label: "Küçük (Üye)", bg: "bg-muted text-muted-foreground", px: "h-8 w-8" },
  xs: { label: "Kompakt", bg: "bg-muted text-muted-foreground", px: "h-7 w-7" },
};

export default function KumruProtokoluSeviyeleriPage() {
  return (
    <ContentListAdmin
      type="protocol-levels"
      title="Kumru Protokolü Seviyeleri"
      description="Kumru Protokolü için hiyerarşi seviyelerini (Belediye Başkanı, Müdür, Üye, vb.) buradan yönetin. Her seviyenin avatar boyutu ve sıralaması ayrı düzenlenir."
      singular="Seviye"
      fields={[
        {
          key: "slug",
          label: "Slug (kod)",
          type: "text",
          placeholder: "kaymakam",
          required: true,
          hint: "Üye kayıtlarında bu kodla eşleşir; boşluk yerine tire kullanın. Sonradan değiştirirseniz mevcut üyelerin seviyesini yeniden seçmeniz gerekir.",
        },
        {
          key: "name",
          label: "Görünen ad",
          type: "text",
          placeholder: "Kaymakam",
          required: true,
        },
        {
          key: "size",
          label: "Avatar boyutu",
          type: "select",
          required: true,
          options: [
            { value: "lg", label: "Büyük — en üst seviye (Başkan stili)" },
            { value: "md", label: "Orta — ara seviye (Yönetim stili)" },
            { value: "sm", label: "Küçük — alt seviye (Üye stili)" },
            { value: "xs", label: "Kompakt — çok kalabalık listeler için" },
          ],
        },
      ]}
      renderRow={(item) => {
        const lv = item as unknown as ProtocolLevelConfig;
        const meta = SIZE_LABEL[lv.size] ?? SIZE_LABEL.md;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`shrink-0 rounded-full bg-brand-50 ring-2 ring-brand-100 ${meta.px}`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-brand-900 truncate">
                {lv.name}
              </div>
              <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {lv.slug}
              </code>
            </div>
            <span
              className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.bg}`}
            >
              {meta.label}
            </span>
          </div>
        );
      }}
    />
  );
}
