"use client";

import { useState } from "react";
import { Copy, CheckCircle2, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { useToast } from "@/components/ui/toast";

const presets = [100, 250, 500, 1000, 2500];

export default function BagisPage() {
  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const finalAmount = custom ? Number(custom) || 0 : amount;

  return (
    <>
      <PageHeader
        title="Bağış"
        description="Bağışınız, bir öğrencinin eğitim hayatına dokunan en somut destektir."
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Bağış" },
        ]}
      />
      <Container className="py-14 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-border bg-white p-7">
            <Badge tone="gold" className="mb-4">
              <Heart className="h-3 w-3" /> Bağış Tutarınızı Seçin
            </Badge>
            <h2 className="text-2xl font-semibold text-brand-900">
              Ne kadar bağış yapmak istiyorsunuz?
            </h2>

            <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {presets.map((p) => (
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
                Özel tutar girin
              </label>
              <div className="mt-1.5 relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Örn. 750"
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
                Banka Hesap Bilgilerimiz
              </h3>
              <dl className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Banka</dt>
                  <dd className="font-medium text-brand-900 mt-0.5">
                    {siteConfig.bank.name} – {siteConfig.bank.branch}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hesap Sahibi</dt>
                  <dd className="font-medium text-brand-900 mt-0.5">
                    {siteConfig.bank.accountHolder}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">IBAN</dt>
                  <dd className="mt-1.5 flex items-center justify-between gap-3 rounded-md bg-white border border-border px-3 h-11 font-mono text-sm font-medium text-brand-900">
                    <span className="truncate">{siteConfig.bank.iban}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            siteConfig.bank.iban.replace(/\s/g, ""),
                          );
                          setCopied(true);
                          toast({
                            tone: "success",
                            title: "IBAN kopyalandı",
                          });
                          setTimeout(() => setCopied(false), 1500);
                        } catch {
                          toast({
                            tone: "error",
                            title: "Kopyalanamadı",
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
                Açıklama kısmına "Burs Bağışı" yazmayı unutmayın. Dilerseniz adınızı
                anonim bırakabilirsiniz.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 rounded-md border border-border bg-white px-4 h-12 inline-flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Bağış tutarı
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
                    title: "Online ödeme yakında",
                    description:
                      "Demo sürümünde ödeme entegrasyonu pasif. IBAN üzerinden bağış yapabilirsiniz.",
                  })
                }
              >
                Bağış Yap
              </Button>
            </div>
          </div>
        </div>

        <aside className="md:col-span-5 space-y-6">
          <div className="rounded-2xl bg-brand-950 text-white p-6">
            <Sparkles className="h-5 w-5 text-gold-300" />
            <h3 className="text-lg font-semibold mt-3">
              Bağışınız nasıl kullanılacak?
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                Aylık burs ödemeleri (öncelikli)
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                Eğitim malzemesi ve kitap tedariki
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                Sosyal sorumluluk projeleri
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                Mentörlük ve kariyer programları
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6">
            <ShieldCheck className="h-5 w-5 text-brand-700" />
            <h3 className="text-lg font-semibold text-brand-900 mt-3">
              Şeffaflık taahhüdümüz
            </h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Bağışlarınızın her kuruşu yıllık denetim raporlarımızda kamuoyuyla
              paylaşılır. Hesap dökümlerimiz ve burs dağılımları için
              <a href="/hakkimizda#raporlar" className="text-brand-700 hover:underline ml-1">
                Faaliyet Raporları
              </a>{" "}
              sayfamızı inceleyebilirsiniz.
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
