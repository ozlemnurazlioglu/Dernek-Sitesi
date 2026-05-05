"use client";

import { useState } from "react";
import { Copy, CheckCircle2, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type {
  CommonUiText,
  DonationSidebar,
  PageHeadersMap,
} from "@/lib/types";

/**
 * Bağış sayfası — ödeme entegrasyonu içermez.
 *
 * Bağışlar manuel havale ile yapılır. Sayfa yalnızca derneğin banka hesap
 * bilgilerini (banka, şube, hesap sahibi, IBAN) gösterir; bilgiler
 * `Site Ayarları` üzerinden admin tarafından düzenlenir. Tutar seçimi ve
 * "Bağış Yap" butonu bilinçli olarak yoktur — kullanıcı IBAN'ı kopyalayıp
 * dilediği tutarı kendi bankasından yatırır.
 */
export default function BagisPage() {
  const { siteSettings, donationUses, pageBlocks } = useStore();
  const sidebar = pageBlocks["donate.sidebar"] as DonationSidebar | undefined;
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)?.bagis;
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const donationUi = {
    ...DEFAULT_COMMON_UI.donation,
    ...(ui.donation ?? {}),
  };

  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <PageHeader
        title={headers?.title ?? "Bağış"}
        description={headers?.description ?? ""}
        breadcrumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Bağış" }]}
      />
      <Container className="py-14 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-border bg-white p-7">
            <Badge tone="gold" className="mb-4">
              <Heart className="h-3 w-3" /> Manuel Havale
            </Badge>
            <h2 className="text-2xl font-semibold text-brand-900">
              {donationUi.bankInfoTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bağışınızı aşağıdaki banka hesabımıza dilediğiniz tutarda
              havale/EFT ile gönderebilirsiniz.
            </p>

            <div className="mt-6 rounded-xl bg-muted/60 border border-border p-5">
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Banka</dt>
                  <dd className="font-medium text-brand-900 mt-0.5">
                    {siteSettings.bankName}
                    {siteSettings.bankBranch
                      ? ` – ${siteSettings.bankBranch}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hesap Sahibi</dt>
                  <dd className="font-medium text-brand-900 mt-0.5">
                    {siteSettings.bankAccountHolder}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">IBAN</dt>
                  <dd className="mt-1.5 flex items-center justify-between gap-3 rounded-md bg-white border border-border px-3 h-11 font-mono text-sm font-medium text-brand-900">
                    <span className="truncate">{siteSettings.bankIban}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            siteSettings.bankIban.replace(/\s/g, ""),
                          );
                          setCopied(true);
                          toast({
                            tone: "success",
                            title: donationUi.copyToastTitle,
                          });
                          setTimeout(() => setCopied(false), 1500);
                        } catch {
                          toast({
                            tone: "error",
                            title: donationUi.copyToastError,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-900 text-xs font-medium shrink-0"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Kopyala
                        </>
                      )}
                    </button>
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                {donationUi.bankNote}
              </p>
            </div>
          </div>
        </div>

        <aside className="md:col-span-5 space-y-6">
          <div className="rounded-2xl bg-brand-950 text-white p-6">
            <Sparkles className="h-5 w-5 text-gold-300" />
            <h3 className="text-lg font-semibold mt-3">
              {sidebar?.title ?? "Bağışınız nasıl kullanılacak?"}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {donationUses.map((u) => (
                <li key={u.id} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                  {u.text}
                </li>
              ))}
            </ul>
          </div>
          {sidebar && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <ShieldCheck className="h-5 w-5 text-brand-700" />
              <h3 className="text-lg font-semibold text-brand-900 mt-3">
                {sidebar.transparencyTitle}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {sidebar.transparencyText}
              </p>
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
