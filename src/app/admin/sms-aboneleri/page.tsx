"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Phone,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { SmsSubscriber } from "@/lib/types";
import { formatTrMobile } from "@/lib/phone";
import { formatDateTimeTR } from "@/lib/utils";

type ImportReport = {
  ok: boolean;
  added: number;
  skipped: number;
  invalid: number;
  totalRows: number;
  invalidSamples: { row: number; value: string; reason: string }[];
};

export default function SmsAboneleriPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<SmsSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importKvkk, setImportKvkk] = useState(false);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sms-subscribers", {
        credentials: "same-origin",
      });
      const json = (await res.json().catch(() => null)) as
        | { items?: SmsSubscriber[]; error?: string }
        | null;
      if (!res.ok || !json?.items) {
        toast({
          tone: "error",
          title: "Liste yüklenemedi",
          description: json?.error || `HTTP ${res.status}`,
        });
        setItems([]);
      } else {
        setItems(json.items);
      }
    } catch (err) {
      toast({
        tone: "error",
        title: "Bağlantı hatası",
        description: String(err instanceof Error ? err.message : err),
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(
        `/api/admin/sms-subscribers/${encodeURIComponent(id)}`,
        { method: "DELETE", credentials: "same-origin" },
      );
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        toast({
          tone: "error",
          title: "Silinemedi",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast({ tone: "success", title: "Abone silindi" });
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  }

  function handleExport() {
    setExporting(true);
    // Doğrudan link tetikleyerek tarayıcıya download verdiriyoruz; ek state
    // gerekmiyor (cookie auth aynı origin'de zaten gider).
    window.location.href = "/api/admin/sms-subscribers/export";
    // Buton spinner'ını çok kısa süre sonra geri kapat — gerçek indirme
    // arka planda devam eder, kullanıcı ek işlem yapabilir.
    window.setTimeout(() => setExporting(false), 1500);
  }

  function openImport() {
    setImportFile(null);
    setImportKvkk(false);
    setImportReport(null);
    setImportOpen(true);
  }

  async function runImport() {
    if (!importFile) {
      toast({ tone: "warning", title: "Dosya seçiniz" });
      return;
    }
    if (!importKvkk) {
      toast({
        tone: "warning",
        title: "KVKK onayı zorunlu",
        description:
          "Bu numaraların KVKK izinli olduğunu onaylamadan içe aktarma yapılamaz.",
      });
      return;
    }
    setImporting(true);
    setImportReport(null);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      fd.append("kvkkConsent", "true");
      const res = await fetch("/api/admin/sms-subscribers/import", {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      const json = (await res.json().catch(() => null)) as
        | (ImportReport & { error?: string })
        | null;
      if (!res.ok || !json) {
        toast({
          tone: "error",
          title: "İçe aktarma başarısız",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      setImportReport(json);
      toast({
        tone: "success",
        title: "İçe aktarma tamamlandı",
        description: `${json.added} eklendi · ${json.skipped} mevcuttu · ${json.invalid} hatalı`,
      });
      // Liste yenile — yeni numaralar üstte görünsün.
      await load();
    } catch (err) {
      toast({
        tone: "error",
        title: "Bağlantı hatası",
        description: String(err instanceof Error ? err.message : err),
      });
    } finally {
      setImporting(false);
    }
  }

  const formatted = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        formattedPhone: formatTrMobile(it.phone),
        formattedCreatedAt: formatDateTimeTR(it.createdAt),
      })),
    [items],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">SMS Aboneleri</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Ana sayfadaki SMS aboneliği formundan numara bırakan ziyaretçiler.
            KVKK onayı verilmiş olarak kayıt edilirler. Listeyi Excel'de açmak
            için CSV olarak indirebilir, istediğiniz numarayı silebilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-border text-sm text-brand-900 hover:bg-muted transition-colors"
            disabled={loading}
            title="Listeyi yenile"
          >
            <RefreshCcw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Yenile
          </button>
          <button
            type="button"
            onClick={openImport}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-brand-300 bg-white text-sm font-medium text-brand-900 hover:bg-brand-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            İçe Aktar (CSV/Excel)
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || items.length === 0}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-900 text-white text-sm font-medium hover:bg-brand-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Excel olarak indir
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="text-sm font-medium text-brand-900">
            Toplam {formatted.length} abone
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
          </div>
        ) : formatted.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            Henüz abone yok. Ana sayfadaki SMS aboneliği formu üzerinden
            ziyaretçiler kendilerini ekledikçe burada görüneceklerdir.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {formatted.map((it, i) => {
              const isConfirmingThis = pendingDeleteId === it.id;
              const isDeletingThis = deletingId === it.id;
              return (
                <li
                  key={it.id}
                  className="px-5 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="text-xs text-muted-foreground tabular-nums w-8 shrink-0">
                    {i + 1}
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-brand-900 tabular-nums">
                      {it.formattedPhone}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {it.formattedCreatedAt}
                    </div>
                  </div>

                  {isConfirmingThis ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-700">Silinsin mi?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(it.id)}
                        disabled={isDeletingThis}
                        className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium disabled:opacity-60"
                      >
                        {isDeletingThis ? "Siliniyor…" : "Evet, sil"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        disabled={isDeletingThis}
                        className="h-8 px-3 rounded-lg border border-border text-xs text-brand-900 hover:bg-muted"
                      >
                        Vazgeç
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDeleteId(it.id)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Aboneyi sil"
                      aria-label="Aboneyi sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        open={importOpen}
        onClose={() => (importing ? undefined : setImportOpen(false))}
        title="SMS Abonelerini İçe Aktar"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Daha önce elinizde bulunan numaraları topluca yükleyin.
            Desteklenen formatlar: <strong>.csv</strong> ve{" "}
            <strong>.xlsx</strong>. Dosyanızda "Telefon", "Phone", "GSM" gibi
            bir sütun varsa otomatik tespit edilir; tek sütunluk dosyalarda
            ilk sütun kullanılır. Aynı numara birden fazla kez varsa atlanır.
          </p>

          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                setImportFile(e.target.files?.[0] ?? null);
                setImportReport(null);
              }}
              disabled={importing}
            />
            {importFile ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-brand-900">
                  {importFile.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(importFile.size / 1024).toFixed(1)} KB
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-brand-700 hover:underline"
                  disabled={importing}
                >
                  Farklı bir dosya seç
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-border text-sm font-medium text-brand-900 hover:bg-brand-50"
              >
                <Upload className="h-4 w-4" />
                Dosya seç
              </button>
            )}
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={importKvkk}
              onChange={(e) => setImportKvkk(e.target.checked)}
              disabled={importing}
              className="mt-0.5 h-4 w-4 rounded border-amber-400 text-brand-700"
            />
            <span className="text-sm text-amber-900">
              <strong>KVKK Onayı:</strong> Yüklediğim numaraların{" "}
              <em>kişisel verilerinin işlenmesi ve ticari elektronik ileti
              alınması konusunda</em> daha önce onay verdiğini ve bu onayların
              elimde belgeli olduğunu beyan ederim. Yanlış beyanın hukuki
              sorumluluğu derneği bağlar.
            </span>
          </label>

          {importReport && (
            <div
              className={
                "rounded-xl border p-4 text-sm space-y-2 " +
                (importReport.invalid === 0
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-orange-200 bg-orange-50 text-orange-900")
              }
            >
              <div className="flex items-center gap-2 font-semibold">
                {importReport.invalid === 0 ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                Aktarım raporu
              </div>
              <ul className="space-y-0.5 ml-1">
                <li>
                  Toplam okunan satır:{" "}
                  <strong>{importReport.totalRows}</strong>
                </li>
                <li>
                  Yeni eklendi: <strong>{importReport.added}</strong>
                </li>
                <li>
                  Zaten kayıtlıydı (atlandı):{" "}
                  <strong>{importReport.skipped}</strong>
                </li>
                <li>
                  Hatalı / geçersiz:{" "}
                  <strong>{importReport.invalid}</strong>
                </li>
              </ul>
              {importReport.invalidSamples.length > 0 && (
                <div className="mt-2 pt-2 border-t border-current/20 text-xs">
                  <div className="font-medium mb-1">İlk hatalı satırlar:</div>
                  <ul className="space-y-0.5 list-disc pl-4">
                    {importReport.invalidSamples.map((s, i) => (
                      <li key={i}>
                        {s.row > 0 ? `Satır ${s.row}: ` : ""}
                        <span className="font-mono">{s.value || "(boş)"}</span>{" "}
                        — {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              disabled={importing}
              className="h-10 px-4 rounded-lg border border-border text-sm text-brand-900 hover:bg-muted disabled:opacity-60"
            >
              {importReport ? "Kapat" : "Vazgeç"}
            </button>
            <button
              type="button"
              onClick={runImport}
              disabled={importing || !importFile || !importKvkk}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand-900 text-white text-sm font-medium hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {importing ? "Aktarılıyor…" : "İçe Aktar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
