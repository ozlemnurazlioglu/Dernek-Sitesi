"use client";

import { useState } from "react";
import { Copy, CheckCircle2, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type {
  CommonUiText,
  DonationSidebar,
  PageHeadersMap,
} from "@/lib/types";

export default function BagisPage() {
  const { siteSettings, donationPresets, donationUses, pageBlocks } = useStore();
  const sidebar = pageBlocks["donate.sidebar"] as DonationSidebar | undefined;
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)?.bagis;
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const donationUi = {
    ...DEFAULT_COMMON_UI.donation,
    ...(ui.donation ?? {}),
  };

  const presetAmounts = donationPresets.map((p) => p.amount);
  const initialPreset = presetAmounts[Math.floor(presetAmounts.length / 2)] ?? 500;

  const [amount, setAmount] = useState<number>(initialPreset);
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const finalAmount = custom ? Number(custom) || 0 : amount;

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
              <Heart className="h-3 w-3" /> {donationUi.presetBadge}
            </Badge>
            <h2 className="text-2xl font-semibold text-brand-900">
              {donationUi.presetTitle}
            </h2>

            <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presetAmounts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setAmount(p);
                    setCustom("");
                  }}
                  className={
                    "h-12 rounded-md border text-sm font-semibold transition-colors " +
                    (amount === p && !custom
                      ? "bg-brand-900 text-white border-brand-900"
                      : "bg-white text-brand-800 border-border hover:border-brand-200")
                  }
                >
                  {p.toLocaleString("tr-TR")} ₺
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-sm text-muted-foreground">
                {donationUi.customAmountLabel}
              </label>
              <div className="mt-1.5 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={donationUi.customAmountPlaceholder}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="w-full h-12 rounded-md border border-border bg-white pl-3 pr-12 text-base font-medium focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ₺
                </span>
              </div>
            </div>

            <div className="mt-7 rounded-xl bg-muted/60 border border-border p-5">
              <h3 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">
                {donationUi.bankInfoTitle}
              </h3>
              <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Banka</dt>
                  <dd className="font-medium text-brand-900 mt-0.5">
                    {siteSettings.bankName} – {siteSettings.bankBranch}
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

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 rounded-md border border-border bg-white px-4 h-12 inline-flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {donationUi.summaryLabel}
                </span>
                <span className="text-base font-semibold text-brand-900">
                  {finalAmount > 0
                    ? `${finalAmount.toLocaleString("tr-TR")} ₺`
                    : "—"}
                </span>
              </div>
              <Button
                variant="gold"
                size="lg"
                onClick={() =>
                  toast({
                    tone: "info",
                    title: donationUi.submitToastTitle,
                    description: donationUi.submitToastMessage,
                  })
                }
              >
                {donationUi.submitButton}
              </Button>
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
