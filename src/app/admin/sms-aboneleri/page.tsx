"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Loader2, Phone, RefreshCcw, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { SmsSubscriber } from "@/lib/types";
import { formatTrMobile } from "@/lib/phone";
import { formatDateTimeTR } from "@/lib/utils";

export default function SmsAboneleriPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<SmsSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

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
        <div className="flex items-center gap-2">
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
    </div>
  );
}
