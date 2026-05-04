"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { DonationUse } from "@/lib/types";

export default function BagisKullanimiPage() {
  return (
    <ContentListAdmin
      type="donation-uses"
      title="Bağışın Kullanımı"
      description="Bağış sayfasının yan panelindeki 'Bağışınız nasıl kullanılacak?' maddeleri."
      singular="Madde"
      fields={[
        { key: "text", label: "Madde", type: "text", required: true },
      ]}
      renderRow={(item) => {
        const u = item as unknown as DonationUse;
        return <div className="text-brand-900">{u.text}</div>;
      }}
    />
  );
}
