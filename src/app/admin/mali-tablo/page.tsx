"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Coins,
  Plus,
  TrendingDown,
  TrendingUp,
  Pencil,
  Trash2,
  Wallet,
  ListChecks,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { uid } from "@/lib/utils";
import type { FinanceItem } from "@/lib/types";

const fmtTRY = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

type FormState = {
  id: string;
  year: string;
  kind: FinanceItem["kind"];
  label: string;
  amount: string;
};

export default function MaliTabloAdminPage() {
  const { financeItems, upsertContent, removeContent } = useStore();
  const { toast } = useToast();

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const it of financeItems) set.add(it.year);
    const list = [...set].sort((a, b) => b - a);
    return list;
  }, [financeItems]);

  const currentYear = new Date().getFullYear();
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const yearToShow = activeYear ?? years[0] ?? currentYear;

  const yearItems = useMemo(
    () =>
      financeItems
        .filter((i) => i.year === yearToShow)
        .sort((a, b) => a.sort - b.sort),
    [financeItems, yearToShow],
  );

  const incomes = useMemo(
    () => yearItems.filter((i) => i.kind === "income"),
    [yearItems],
  );
  const expenses = useMemo(
    () => yearItems.filter((i) => i.kind === "expense"),
    [yearItems],
  );

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = expenses.reduce((s, i) => s + Number(i.amount), 0);
  const net = totalIncome - totalExpense;
  const max = Math.max(totalIncome, totalExpense, 1);
  const incomePct = (totalIncome / max) * 100;
  const expensePct = (totalExpense / max) * 100;

  // Önceki yıl karşılaştırması
  const prevYearItems = useMemo(
    () => financeItems.filter((i) => i.year === yearToShow - 1),
    [financeItems, yearToShow],
  );
  const prevIncome = prevYearItems
    .filter((i) => i.kind === "income")
    .reduce((s, i) => s + Number(i.amount), 0);
  const prevExpense = prevYearItems
    .filter((i) => i.kind === "expense")
    .reduce((s, i) => s + Number(i.amount), 0);
  const incomeDelta =
    prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : null;
  const expenseDelta =
    prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : null;

  // ----- Modal state -----
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [yearModal, setYearModal] = useState(false);
  const [newYear, setNewYear] = useState<string>("");
  const [copyFromPrev, setCopyFromPrev] = useState(true);

  function openNew(kind: FinanceItem["kind"]) {
    setEditing({
      id: "",
      year: String(yearToShow),
      kind,
      label: "",
      amount: "",
    });
  }

  function openEdit(item: FinanceItem) {
    setEditing({
      id: item.id,
      year: String(item.year),
      kind: item.kind,
      label: item.label,
      amount: String(item.amount),
    });
  }

  async function save() {
    if (!editing || saving) return;
    const yearNum = Number(editing.year);
    const amountNum = Number(editing.amount);
    const missing: string[] = [];
    if (!yearNum || yearNum < 1900) missing.push("Yıl");
    if (!editing.label.trim()) missing.push("Kalem Adı");
    if (!amountNum || amountNum <= 0) missing.push("Tutar");
    if (missing.length) {
      toast({
        tone: "error",
        title: "Eksik veya hatalı alanlar",
        description: `Lütfen şu alanları doldurun: ${missing.join(", ")}`,
      });
      return;
    }

    const isEdit = Boolean(editing.id);
    const existingSort = isEdit
      ? financeItems.find((i) => i.id === editing.id)?.sort ?? 0
      : (financeItems
          .filter((i) => i.year === yearNum && i.kind === editing.kind)
          .reduce((m, i) => Math.max(m, i.sort ?? 0), 0) ?? 0) + 10;

    const payload: FinanceItem = {
      id: editing.id || `finance-${uid()}`,
      year: yearNum,
      kind: editing.kind,
      label: editing.label.trim(),
      amount: amountNum,
      sort: existingSort,
    };

    setSaving(true);
    try {
      await upsertContent("finance-items", payload);
      setEditing(null);
      toast({
        tone: "success",
        title: isEdit ? "Güncellendi" : "Eklendi",
        description: `${payload.label} • ${fmtTRY(payload.amount)}`,
      });
    } catch (err) {
      toast({
        tone: "error",
        title: "Kayıt başarısız",
        description: err instanceof Error ? err.message : "Bilinmeyen hata",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: FinanceItem) {
    if (
      !window.confirm(
        `"${item.label}" kalemini silmek istediğinize emin misiniz?`,
      )
    )
      return;
    try {
      await removeContent("finance-items", item.id);
      toast({ tone: "success", title: "Silindi" });
    } catch (err) {
      toast({
        tone: "error",
        title: "Silme başarısız",
        description: err instanceof Error ? err.message : "Bilinmeyen hata",
      });
    }
  }

  async function createYear() {
    const yNum = Number(newYear);
    if (!yNum || yNum < 1900 || yNum > 2200) {
      toast({ tone: "error", title: "Geçersiz yıl" });
      return;
    }
    if (years.includes(yNum)) {
      toast({
        tone: "error",
        title: "Bu yıl zaten mevcut",
      });
      return;
    }
    setSaving(true);
    try {
      if (copyFromPrev && years.length > 0) {
        const baseYear = years[0];
        const baseItems = financeItems.filter((i) => i.year === baseYear);
        for (const it of baseItems) {
          await upsertContent("finance-items", {
            id: `finance-${uid()}`,
            year: yNum,
            kind: it.kind,
            label: it.label,
            amount: 0,
            sort: it.sort,
          });
        }
        toast({
          tone: "success",
          title: `${yNum} yılı eklendi`,
          description: `${baseItems.length} kalem ${baseYear} yılından kopyalandı (tutarlar 0).`,
        });
      } else {
        // En az bir kalem ekleyerek yılı listede göstermek için boş bir gelir oluştur.
        await upsertContent("finance-items", {
          id: `finance-${uid()}`,
          year: yNum,
          kind: "income",
          label: "Yeni Kalem",
          amount: 0,
          sort: 10,
        });
        toast({
          tone: "success",
          title: `${yNum} yılı eklendi`,
        });
      }
      setActiveYear(yNum);
      setYearModal(false);
      setNewYear("");
      setCopyFromPrev(true);
    } catch (err) {
      toast({
        tone: "error",
        title: "Yıl eklenemedi",
        description: err instanceof Error ? err.message : "Bilinmeyen hata",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
            Mali Tablo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Yıl bazında derneğin gelir ve gider kalemlerini yönetin. Buradaki
            veriler kullanıcılara{" "}
            <span className="font-medium text-brand-800">/mali-tablo</span>{" "}
            sayfasında otomatik olarak yansır.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setYearModal(true)}
          >
            <Calendar className="h-4 w-4" /> Yeni Yıl
          </Button>
          <Button size="sm" onClick={() => openNew("income")}>
            <Plus className="h-4 w-4" /> Kalem Ekle
          </Button>
        </div>
      </div>

      {/* Yıl seçici */}
      {years.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-white">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mr-1">
            Dönem
          </span>
          {years.map((y) => {
            const active = y === yearToShow;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setActiveYear(y)}
                className={
                  "h-9 px-4 rounded-md text-sm font-medium border transition-colors " +
                  (active
                    ? "bg-brand-800 text-white border-brand-800 shadow-sm"
                    : "bg-white text-brand-900 border-border hover:bg-brand-50")
                }
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {/* Boş state */}
      {financeItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-700 mx-auto flex items-center justify-center">
            <Coins className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-brand-900">
            Henüz mali kayıt yok
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            İlk yılı ekleyerek başlayabilirsiniz. Ardından gelir ve gider
            kalemlerini ekleyip kullanıcılara şeffaf bir özet sunabilirsiniz.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button onClick={() => setYearModal(true)}>
              <Calendar className="h-4 w-4" /> Yeni Yıl Oluştur
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI kartlar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              tone="emerald"
              label={`Toplam Gelir (${yearToShow})`}
              value={fmtTRY(totalIncome)}
              icon={<TrendingUp className="h-5 w-5" />}
              delta={incomeDelta}
              deltaPositiveIsGood
            />
            <KpiCard
              tone="rose"
              label={`Toplam Gider (${yearToShow})`}
              value={fmtTRY(totalExpense)}
              icon={<TrendingDown className="h-5 w-5" />}
              delta={expenseDelta}
              deltaPositiveIsGood={false}
            />
            <KpiCard
              tone={net >= 0 ? "brand" : "rose"}
              label="Net Bilanço"
              value={fmtTRY(net)}
              icon={<Wallet className="h-5 w-5" />}
              hint={
                net >= 0
                  ? "Gelir, gideri karşılıyor"
                  : "Açık var: giderler geliri aşıyor"
              }
            />
            <KpiCard
              tone="slate"
              label="Toplam Kalem"
              value={String(yearItems.length)}
              icon={<ListChecks className="h-5 w-5" />}
              hint={`${incomes.length} gelir • ${expenses.length} gider`}
            />
          </div>

          {/* Gelir/Gider oran çubuğu */}
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-brand-900">
                Gelir & Gider Karşılaştırması
              </h3>
              <span className="text-xs text-muted-foreground">
                {yearToShow} dönemi
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <ComparisonBar
                label="Gelirler"
                value={totalIncome}
                pct={incomePct}
                tone="emerald"
              />
              <ComparisonBar
                label="Giderler"
                value={totalExpense}
                pct={expensePct}
                tone="rose"
              />
            </div>
          </div>

          {/* İki tablo: gelirler ve giderler */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ItemsCard
              title="Gelir Kalemleri"
              tone="emerald"
              icon={<TrendingUp className="h-5 w-5" />}
              total={totalIncome}
              items={incomes}
              onAdd={() => openNew("income")}
              onEdit={openEdit}
              onRemove={remove}
            />
            <ItemsCard
              title="Gider Kalemleri"
              tone="rose"
              icon={<TrendingDown className="h-5 w-5" />}
              total={totalExpense}
              items={expenses}
              onAdd={() => openNew("expense")}
              onEdit={openEdit}
              onRemove={remove}
            />
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            İpucu: Yeni bir yıla geçmek için{" "}
            <span className="font-medium text-brand-800">Yeni Yıl</span>{" "}
            butonunu kullanın. İsterseniz önceki yılın kalemlerini şablon olarak
            kopyalayabilirsiniz.
          </p>
        </>
      )}

      {/* Yeni / Düzenle Kalem modalı */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={
          editing?.id
            ? "Kalemi Düzenle"
            : editing?.kind === "income"
              ? "Yeni Gelir Kalemi"
              : "Yeni Gider Kalemi"
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Yıl" required>
                <Input
                  type="number"
                  value={editing.year}
                  onChange={(e) =>
                    setEditing({ ...editing, year: e.target.value })
                  }
                />
              </Field>
              <Field label="Tür" required>
                <Select
                  value={editing.kind}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      kind: e.target.value as FinanceItem["kind"],
                    })
                  }
                >
                  <option value="income">Gelir</option>
                  <option value="expense">Gider</option>
                </Select>
              </Field>
            </div>
            <Field label="Kalem Adı" required>
              <Input
                value={editing.label}
                onChange={(e) =>
                  setEditing({ ...editing, label: e.target.value })
                }
                placeholder={
                  editing.kind === "income"
                    ? "Örn: Aidat Gelirleri"
                    : "Örn: Burs Ödemeleri"
                }
              />
            </Field>
            <Field label="Tutar (TL)" required>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={editing.amount}
                onChange={(e) =>
                  setEditing({ ...editing, amount: e.target.value })
                }
                placeholder="45000"
              />
            </Field>
            {editing.amount && Number(editing.amount) > 0 && (
              <p className="text-xs text-muted-foreground">
                Önizleme:{" "}
                <span className="font-medium text-brand-900">
                  {fmtTRY(Number(editing.amount))}
                </span>
              </p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                İptal
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Yeni Yıl modalı */}
      <Modal
        open={yearModal}
        onClose={() => setYearModal(false)}
        title="Yeni Yıl Oluştur"
        size="sm"
      >
        <div className="space-y-4">
          <Field
            label="Yıl"
            required
            hint="Tablonuza yeni bir mali yıl eklenir."
          >
            <Input
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder={String(currentYear)}
            />
          </Field>
          {years.length > 0 && (
            <label className="flex items-start gap-2 p-3 rounded-md border border-border bg-muted/30 cursor-pointer">
              <input
                type="checkbox"
                checked={copyFromPrev}
                onChange={(e) => setCopyFromPrev(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              <span className="text-sm text-brand-900">
                <span className="font-medium">
                  {years[0]} yılındaki kalemleri kopyala
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  Aynı kalem isimleri yeni yıla kopyalanır, tutarlar 0 olarak
                  başlar. Sonra istediğiniz gibi düzenleyebilirsiniz.
                </span>
              </span>
            </label>
          )}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setYearModal(false)}
              disabled={saving}
            >
              İptal
            </Button>
            <Button onClick={createYear} disabled={saving}>
              {saving ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---------- KPI Card ----------
function KpiCard({
  label,
  value,
  icon,
  tone,
  hint,
  delta,
  deltaPositiveIsGood = true,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "emerald" | "rose" | "brand" | "slate";
  hint?: string;
  delta?: number | null;
  deltaPositiveIsGood?: boolean;
}) {
  const palette = {
    emerald: {
      iconBg: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-700",
      ring: "border-emerald-200/70",
    },
    rose: {
      iconBg: "bg-rose-100 text-rose-700",
      value: "text-rose-700",
      ring: "border-rose-200/70",
    },
    brand: {
      iconBg: "bg-brand-100 text-brand-800",
      value: "text-brand-900",
      ring: "border-brand-200/70",
    },
    slate: {
      iconBg: "bg-slate-100 text-slate-700",
      value: "text-slate-800",
      ring: "border-slate-200/70",
    },
  }[tone];

  const showDelta = delta != null && Number.isFinite(delta) && delta !== 0;
  const deltaPositive = (delta ?? 0) > 0;
  const deltaGood = deltaPositive === deltaPositiveIsGood;

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm ${palette.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${palette.iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div className={`mt-3 text-2xl md:text-[26px] font-semibold tabular-nums ${palette.value}`}>
        {value}
      </div>
      {showDelta && (
        <div
          className={
            "mt-2 inline-flex items-center gap-1 text-xs font-medium " +
            (deltaGood ? "text-emerald-700" : "text-rose-700")
          }
        >
          {deltaPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(delta!).toFixed(1)}% • geçen yıla göre
        </div>
      )}
      {!showDelta && hint && (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// ---------- Comparison Bar ----------
function ComparisonBar({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: "emerald" | "rose";
}) {
  const colors = {
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm mb-1.5">
        <span className="font-medium text-brand-900">{label}</span>
        <span className="tabular-nums text-brand-900 font-semibold">
          {fmtTRY(value)}
        </span>
      </div>
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colors} transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}

// ---------- Items Card (gelir veya gider tablosu) ----------
function ItemsCard({
  title,
  icon,
  tone,
  items,
  total,
  onAdd,
  onEdit,
  onRemove,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "emerald" | "rose";
  items: FinanceItem[];
  total: number;
  onAdd: () => void;
  onEdit: (it: FinanceItem) => void;
  onRemove: (it: FinanceItem) => void;
}) {
  const palette = {
    emerald: {
      iconBg: "bg-emerald-100 text-emerald-700",
      headBg: "bg-emerald-50/60",
      totalText: "text-emerald-700",
      ring: "border-emerald-200/70",
      addBtn:
        "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
    },
    rose: {
      iconBg: "bg-rose-100 text-rose-700",
      headBg: "bg-rose-50/60",
      totalText: "text-rose-700",
      ring: "border-rose-200/70",
      addBtn: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
    },
  }[tone];

  return (
    <section
      className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${palette.ring}`}
    >
      <header
        className={`flex items-center gap-3 px-5 py-4 border-b border-border ${palette.headBg}`}
      >
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${palette.iconBg}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-brand-900">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} kalem • Toplam{" "}
            <span className={`font-semibold ${palette.totalText}`}>
              {fmtCompact(total)} ₺
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${palette.addBtn}`}
        >
          <Plus className="h-4 w-4" /> Ekle
        </button>
      </header>

      {items.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          Bu yıl için kayıt bulunmuyor.
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4" /> İlk Kalemi Ekle
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3 font-medium w-10">#</th>
                <th className="px-5 py-3 font-medium">Kalem</th>
                <th className="px-5 py-3 font-medium text-right">Tutar</th>
                <th className="px-5 py-3 font-medium text-right w-28">
                  Pay
                </th>
                <th className="px-5 py-3 font-medium text-right w-24">
                  Eylemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it, idx) => {
                const share = total > 0 ? (Number(it.amount) / total) * 100 : 0;
                return (
                  <tr key={it.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5 text-brand-900 font-medium">
                      {it.label}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-brand-900 font-semibold">
                      {fmtTRY(Number(it.amount))}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-xs text-muted-foreground">
                      {share.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(it)}
                          className="h-8 w-8 rounded-md text-muted-foreground hover:text-brand-900 hover:bg-brand-50 inline-flex items-center justify-center"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(it)}
                          className="h-8 w-8 rounded-md text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center"
                          aria-label="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-muted/40">
                <td colSpan={2} className="px-5 py-3.5 font-semibold text-brand-900">
                  TOPLAM
                </td>
                <td
                  className={`px-5 py-3.5 text-right tabular-nums font-bold ${palette.totalText}`}
                >
                  {fmtTRY(total)}
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
