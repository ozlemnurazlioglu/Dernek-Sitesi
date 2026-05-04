"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { LegalPage } from "@/lib/types";

export default function YasalSayfalarPage() {
  return (
    <ContentListAdmin
      type="legal-pages"
      title="Yasal & Kurumsal Sayfalar"
      description="Gizlilik, KVKK, Çerez Politikası, Tüzük gibi sayfalar. Slug değeri URL ile eşleşir; örneğin slug 'gizlilik' ise sayfa /gizlilik adresinde yayınlanır. İçerik markdown destekler — başlıklar için ## , madde için - kullanın."
      singular="Sayfa"
      fields={[
        {
          key: "slug",
          label: "URL Slug",
          type: "text",
          placeholder: "gizlilik, kvkk, cerez, tuzuk …",
          required: true,
        },
        {
          key: "title",
          label: "Sayfa Başlığı",
          type: "text",
          placeholder: "Gizlilik Politikası",
          required: true,
        },
        {
          key: "description",
          label: "Üst başlık altı açıklama",
          type: "text",
          placeholder: "Kısa bir tanıtım metni",
        },
        {
          key: "content",
          label: "İçerik (Markdown)",
          type: "textarea",
          placeholder: "## Bölüm Başlığı\n\nMetin...\n\n- Madde 1\n- Madde 2",
          required: true,
          rows: 16,
        },
      ]}
      renderRow={(item) => {
        const p = item as unknown as LegalPage;
        return (
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-brand-900 font-medium truncate">
                {p.title}
              </span>
              <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                /{p.slug}
              </code>
            </div>
            {p.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {p.description}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
