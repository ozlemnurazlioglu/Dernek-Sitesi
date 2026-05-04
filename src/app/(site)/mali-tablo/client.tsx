"use client";

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { useStore } from "@/lib/store";
import type { FinanceItem, PageHeadersMap } from "@/lib/types";

const fmtTRY = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

export default function MaliTabloClient() {
  const { pageBlocks, financeItems } = useStore();
  const header = (pageBlocks["page.headers"] as PageHeadersMap | undefined)?.[
    "mali-tablo"
  ];

  // Mevcut yıllar (büyükten küçüğe).
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const it of financeItems) set.add(it.year);
    return [...set].sort((a, b) => b - a);
  }, [financeItems]);

  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? years[0] ?? null;

  const yearItems = useMemo(
    () => financeItems.filter((i) => i.year === activeYear),
    [financeItems, activeYear],
  );

  const incomes = useMemo(
    () =>
      yearItems
        .filter((i) => i.kind === "income")
        .sort((a, b) => a.sort - b.sort),
    [yearItems],
  );
  const expenses = useMemo(
    () =>
      yearItems
        .filter((i) => i.kind === "expense")
        .sort((a, b) => a.sort - b.sort),
    [yearItems],
  );

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = expenses.reduce((s, i) => s + Number(i.amount), 0);
  const net = totalIncome - totalExpense;

  return (
    <>
      <PageHeader
        title={header?.title ?? "Mali Tablo"}
        description={
          header?.description ??
          "Derneğimizin yıllık gelir ve giderlerini şeffaflık ilkesiyle kalem kalem yayınlıyoruz."
        }
      />
      <Container className="py-12 md:py-16">
        {financeItems.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-12 text-center text-muted-foreground">
            Henüz mali tablo verisi eklenmedi.
          </div>
        ) : (
          <>
            {/* Yıl seçici */}
            {years.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span className="text-sm text-muted-foreground mr-1">
                  Dönem:
                </span>
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={
                      "h-9 px-4 rounded-full text-sm font-medium border transition-colors " +
                      (y === activeYear
                        ? "bg-brand-700 text-white border-brand-700"
                        : "bg-white text-brand-900 border-border hover:bg-muted")
                    }
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            {/* Özet kartlar */}
            <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
              <SummaryCard
                tone="green"
                label={`Toplam Gelir${activeYear ? ` (${activeYear})` : ""}`}
                value={fmtTRY(totalIncome)}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <SummaryCard
                tone="red"
                label={`Toplam Gider${activeYear ? ` (${activeYear})` : ""}`}
                value={fmtTRY(totalExpense)}
                icon={<TrendingDown className="h-5 w-5" />}
              />
              <SummaryCard
                tone={net >= 0 ? "brand" : "red"}
                label="Net Durum"
                value={fmtTRY(net)}
                icon={<Wallet className="h-5 w-5" />}
              />
            </div>

            {/* Gelir & Gider tabloları */}
            <div className="grid lg:grid-cols-2 gap-6 mt-10">
              <FinanceTable
                title="Gelirler"
                tone="green"
                items={incomes}
                total={totalIncome}
              />
              <FinanceTable
                title="Giderler"
                tone="red"
                items={expenses}
                total={totalExpense}
              />
            </div>

            <p className="mt-10 text-center text-xs text-muted-foreground">
              Bu sayfa, derneğimizin{" "}
              <span className="font-medium text-brand-900">şeffaflık</span>{" "}
              ilkesi gereği yönetim kurulu kararıyla periyodik olarak
              güncellenmektedir.
            </p>
          </>
        )}
      </Container>
    </>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "green" | "red" | "brand";
}) {
  const palette = {
    green: {
      ring: "border-emerald-200",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-700",
    },
    red: {
      ring: "border-red-200",
      bg: "bg-red-50",
      iconBg: "bg-red-100 text-red-700",
      value: "text-red-700",
    },
    brand: {
      ring: "border-brand-200",
      bg: "bg-brand-50",
      iconBg: "bg-brand-100 text-brand-700",
      value: "text-brand-900",
    },
  }[tone];

  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm ${palette.ring}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${palette.iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div className={`mt-4 text-3xl font-semibold ${palette.value}`}>
        {value}
      </div>
    </div>
  );
}

function FinanceTable({
  title,
  items,
  total,
  tone,
}: {
  title: string;
  items: FinanceItem[];
  total: number;
  tone: "green" | "red";
}) {
  const headerBg = tone === "green" ? "bg-emerald-50" : "bg-red-50";
  const headerText = tone === "green" ? "text-emerald-800" : "text-red-800";
  const totalText = tone === "green" ? "text-emerald-700" : "text-red-700";

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
      <div className={`px-6 py-4 ${headerBg}`}>
        <h3 className={`text-lg font-semibold ${headerText}`}>{title}</h3>
      </div>
      {items.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Bu yıl için kayıt yok.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">Kalem</th>
              <th className="px-6 py-3 font-medium text-right">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-muted/30">
                <td className="px-6 py-3.5 text-brand-900">{it.label}</td>
                <td className="px-6 py-3.5 text-right tabular-nums text-brand-900">
                  {fmtTRY(Number(it.amount))}
                </td>
              </tr>
            ))}
            <tr className="bg-muted/40 font-semibold">
              <td className="px-6 py-3.5 text-brand-900">TOPLAM</td>
              <td
                className={`px-6 py-3.5 text-right tabular-nums ${totalText}`}
              >
                {fmtTRY(total)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
