"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { Donor } from "@/lib/types";
import { formatDateTR } from "@/lib/utils";

/**
 * Ana sayfa "Bağışçılarımız" bölümünde listelenen bağışçıları yönetir.
 * - `donatedAt` formatı: `YYYY-MM-DD` (HTML date input'una uygun).
 * - `amount` 0 girilirse miktar gizlenir (anonim/açıklanmamış bağış).
 * - `sort` küçükten büyüğe; admin kontrol eder.
 */
export default function BagiscilarAdminPage() {
  return (
    <ContentListAdmin
      type="donors"
      title="Bağışçılarımız"
      description="Ana sayfadaki Bağışçılarımız bölümünde listelenen kişiler. Tarih YYYY-AA-GG formatında (örn. 2026-05-02) girin. Miktar 0 yazarsanız listede miktar gizlenir."
      singular="Bağışçı"
      fields={[
        {
          key: "name",
          label: "İsim",
          type: "text",
          placeholder: "Ahmet Yılmaz",
          required: true,
        },
        {
          key: "donatedAt",
          label: "Bağış Tarihi (YYYY-AA-GG)",
          type: "text",
          placeholder: "2026-05-02",
          required: true,
        },
        {
          key: "amount",
          label: "Miktar (₺) — 0 girilirse gizlenir",
          type: "number",
          placeholder: "5000",
        },
      ]}
      renderRow={(item) => {
        const d = item as unknown as Donor;
        const initials = makeInitials(d.name);
        return (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-800 text-xs font-bold shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="text-brand-900 font-medium truncate">
                {d.name}
              </div>
              {d.donatedAt && (
                <div className="text-xs text-muted-foreground">
                  {formatDateTR(d.donatedAt)}
                </div>
              )}
            </div>
            <span className="ml-auto text-sm font-semibold text-gold-700">
              {d.amount > 0
                ? `₺${d.amount.toLocaleString("tr-TR")}`
                : "—"}
            </span>
          </div>
        );
      }}
    />
  );
}

/**
 * "Ahmet Yılmaz" → "AY". Türkçe karakterleri büyütür; tek kelimelik isimler
 * için ilk iki harfi alır; boş ise "?".
 */
function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("tr-TR");
}
