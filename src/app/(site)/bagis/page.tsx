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
      <Container className="py-10 sm:py-14 grid md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-7 min-w-0">
          <div className="rounded-2xl border border-border bg-white p-5 sm:p-7">
            <Badge tone="gold" className="mb-4">
              <Heart className="h-3 w-3" /> Manuel Havale
            </Badge>
            <h2 className="text-xl sm:text-2xl font-semibold text-brand-900">
              {donationUi.bankInfoTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bağışınızı aşağıdaki banka hesabımıza dilediğiniz tutarda
              havale/EFT ile gönderebilirsiniz.
            </p>

            <div className="mt-6 rounded-xl bg-muted/60 border border-border p-4 sm:p-5">
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Banka</dt>
                  <dd className="font-medium text-brand-900 mt-0.5 break-words">
                    {siteSettings.bankName}
                    {siteSettings.bankBranch
                      ? ` – ${siteSettings.bankBranch}`
                      : ""}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Hesap Sahibi</dt>
                  <dd className="font-medium text-brand-900 mt-0.5 break-words">
                    {siteSettings.bankAccountHolder}
                  </dd>
                </div>
                <div className="sm:col-span-2 min-w-0">
                  <dt className="text-muted-foreground">IBAN</dt>
                  {/*
                    Mobil davranış: IBAN ve "Kopyala" butonu alt alta
                    (column) geçer, IBAN `break-all` ile tüm karakterleriyle
                    görünür — eski `truncate` IBAN'ı kesip kullanıcıya yarım
                    gösteriyordu. sm+ ekranda yan yana eski tasarım korunur.
                  */}
                  <dd className="mt-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-md bg-white border border-border px-3 py-2.5 sm:py-0 sm:h-11">
                    <span className="font-mono text-[13px] sm:text-sm font-medium text-brand-900 break-all leading-snug">
                      {siteSettings.bankIban}
                    </span>
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
                      className="self-end sm:self-auto inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-900 text-xs font-medium shrink-0"
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

        <aside className="md:col-span-5 min-w-0 space-y-6">
          <div className="rounded-2xl bg-brand-950 text-white p-5 sm:p-6">
            <Sparkles className="h-5 w-5 text-gold-300" />
            <h3 className="text-lg font-semibold mt-3">
              {sidebar?.title ?? "Bağışınız nasıl kullanılacak?"}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {donationUses.map((u) => (
                <li key={u.id} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                  <span className="break-words">{u.text}</span>
                </li>
              ))}
            </ul>
          </div>
          {sidebar && (
            <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
              <ShieldCheck className="h-5 w-5 text-brand-700" />
              <h3 className="text-lg font-semibold text-brand-900 mt-3">
                {sidebar.transparencyTitle}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed break-words">
                {sidebar.transparencyText}
              </p>
            </div>
          )}
        </aside>
      </Container>
    </>
  );
}
