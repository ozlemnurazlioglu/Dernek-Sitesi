"use client";

import { ContentListAdmin } from "@/components/admin/content-list";
import type { BankAccount } from "@/lib/types";

export default function BankaHesaplariAdminPage() {
  return (
    <ContentListAdmin
      type="bank-accounts"
      title="Banka Hesapları"
      description="Bağış sayfasında listelenen banka hesaplarını buradan yönetin. Birden fazla hesap eklenebilir (Bağış Hesabı, Burs Hesabı vb.)."
      singular="Banka Hesabı"
      fields={[
        {
          key: "label",
          label: "Başlık",
          type: "text",
          placeholder: "Bağış Hesabı / Burs Hesabı",
          required: true,
        },
        {
          key: "bankName",
          label: "Banka adı",
          type: "text",
          placeholder: "Ziraat Bankası",
        },
        {
          key: "bankBranch",
          label: "Şube",
          type: "text",
          placeholder: "Ordu Şubesi",
        },
        {
          key: "accountHolder",
          label: "Hesap sahibi",
          type: "text",
          placeholder: "Ordu Kumrulular Eğitim Kültür Yardımlaşma Derneği",
        },
        {
          key: "iban",
          label: "IBAN",
          type: "text",
          placeholder: "TR00 0000 0000 0000 0000 0000 00",
        },
        {
          key: "note",
          label: "Açıklama notu",
          type: "textarea",
          placeholder:
            "Açıklama kısmına 'Burs Bağışı' yazmayı unutmayın. (Opsiyonel)",
          rows: 2,
        },
      ]}
      renderRow={(item) => {
        const a = item as unknown as BankAccount;
        return (
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            <span className="text-brand-900 font-medium truncate">
              {a.label}
            </span>
            {(a.bankName || a.iban) && (
              <span className="ml-auto text-xs text-muted-foreground truncate">
                {[a.bankName, a.iban].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}
