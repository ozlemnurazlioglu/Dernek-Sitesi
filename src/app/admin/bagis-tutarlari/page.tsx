"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { DonationPreset } from "@/lib/types";

export default function BagisTutarlariPage() {
  return (
    <ContentListAdmin
      type="donation-presets"
      title="Bağış Tutar Önerileri"
      description="Bağış sayfasında hızlı seçim olarak gösterilen tutar butonları (₺)."
      singular="Tutar"
      fields={[
        { key: "amount", label: "Tutar (₺)", type: "number", required: true },
      ]}
      renderRow={(item) => {
        const p = item as unknown as DonationPreset;
        return (
          <div className="text-lg font-semibold text-brand-900">
            {p.amount.toLocaleString("tr-TR")} ₺
          </div>
        );
      }}
    />
  );
}
