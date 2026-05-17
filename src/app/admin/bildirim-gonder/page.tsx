"use client";

/**
 * Toplu bildirim sayfası — admin filtreleme (durum + yıl) yapar, önce
 * "kaç alıcı" dry-run'ı görür, sonra "Gönder" der. Bildirimi atmadan önce
 * onay modal'ı çıkar; SMS limiti / mail provider'ı kapalıysa banner gösterilir.
 *
 * Endpoint: POST /api/admin/bulk-notify
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useStore } from "@/lib/store";
import { statusOptions } from "@/components/status";
import type {
  ApplicationStatus,
  NotificationSettings,
  SmsSubscriber,
} from "@/lib/types";

type Event = "approved" | "rejected" | "needsUpdate";
type Audience = "applications" | "sms-subscribers";

type Result = {
  ok: boolean;
  total: number;
  sent: { email: number; sms: number };
  failed: { email: number; sms: number };
  errors: { applicationId: string; email?: string; sms?: string }[];
  dryRun: boolean;
};

const EVENT_OPTIONS: { value: Event; label: string; tone: string }[] = [
  { value: "approved", label: "Onaylandı şablonu", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "rejected", label: "Reddedildi şablonu", tone: "bg-red-50 text-red-700 border-red-200" },
  { value: "needsUpdate", label: "Bilgi Güncelleme şablonu", tone: "bg-orange-50 text-orange-700 border-orange-200" },
];

const CURRENT_YEAR = new Date().getFullYear();

/**
 * UI durum filtresi → API'ye gönderilen status değeri.
 * "all" => tüm durumlar, geri kalanı doğrudan `ApplicationStatus`.
 */
type StatusFilter = "all" | ApplicationStatus;

export default function BulkNotifyPage() {
  const { applications } = useStore();
  const { toast } = useToast();

  const [audience, setAudience] = useState<Audience>("applications");
  const [event, setEvent] = useState<Event>("approved");
  const [status, setStatus] = useState<StatusFilter>("approved");
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [reason, setReason] = useState("");
  const [updateRequest, setUpdateRequest] = useState("");
  // SMS Aboneleri akışı için: gönderilecek düz SMS metni + opsiyonel tarih aralığı.
  const [smsText, setSmsText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [subscribers, setSubscribers] = useState<SmsSubscriber[] | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [preview, setPreview] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // İlk render'da bildirim ayarlarını çek — provider kapalıysa kullanıcıya
  // banner göster ki "hiçbir şey atılmadı" sürprizini erken yaşasın.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/notification-settings", {
          credentials: "same-origin",
        });
        const json = (await res.json().catch(() => null)) as {
          settings?: NotificationSettings;
        } | null;
        if (!cancelled && json?.settings) setSettings(json.settings);
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // SMS Aboneleri seçilince listeyi tek seferlik çek — tahmini alıcı
  // sayısını client-side filtre ile gösterelim.
  useEffect(() => {
    if (audience !== "sms-subscribers" || subscribers !== null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/sms-subscribers", {
          credentials: "same-origin",
        });
        const json = (await res.json().catch(() => null)) as {
          items?: SmsSubscriber[];
        } | null;
        if (!cancelled && json?.items) setSubscribers(json.items);
      } catch {
        if (!cancelled) setSubscribers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [audience, subscribers]);

  // event seçilince status filtresini akıllıca kurar (örn. approved → approved).
  // Kullanıcı manuel başka bir status seçerse override edilebilir.
  const setEventSmart = useCallback((e: Event) => {
    setEvent(e);
    setResult(null);
    setPreview(null);
    if (e === "approved") setStatus("approved");
    else if (e === "rejected") setStatus("rejected");
    else if (e === "needsUpdate") setStatus("needs_update");
  }, []);

  // UI'da "tahmini alıcı" — audience'a göre farklı sayım.
  // Gerçek değer her zaman `preview` (dry-run).
  const estimated = useMemo(() => {
    if (audience === "sms-subscribers") {
      if (!subscribers) return 0;
      const from = fromDate ? new Date(fromDate) : null;
      // toDate'i kapsayıcı yapmak için 24h ekle
      const to = toDate
        ? new Date(new Date(toDate).getTime() + 24 * 60 * 60 * 1000)
        : null;
      return subscribers.filter((s) => {
        const d = new Date(s.createdAt);
        if (from && d < from) return false;
        if (to && d >= to) return false;
        return true;
      }).length;
    }
    const y = Number(year);
    const yearOk = (d: string) => {
      if (!Number.isFinite(y) || y < 1990) return true;
      return new Date(d).getFullYear() === y;
    };
    return applications.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (!yearOk(a.submittedAt)) return false;
      return true;
    }).length;
  }, [audience, subscribers, fromDate, toDate, applications, status, year]);

  function buildBody(opts: { dryRun: boolean }): Record<string, unknown> {
    if (audience === "sms-subscribers") {
      return {
        audience: "sms-subscribers",
        smsText: opts.dryRun ? undefined : smsText,
        fromDate: fromDate
          ? new Date(fromDate).toISOString()
          : undefined,
        // toDate'i bir sonraki güne çek (kapsayıcı semantik)
        toDate: toDate
          ? new Date(
              new Date(toDate).getTime() + 24 * 60 * 60 * 1000,
            ).toISOString()
          : undefined,
        dryRun: opts.dryRun,
      };
    }
    return {
      audience: "applications",
      event,
      status,
      year: year ? Number(year) : null,
      reason: !opts.dryRun && event === "rejected" ? reason : undefined,
      updateRequest:
        !opts.dryRun && event === "needsUpdate" ? updateRequest : undefined,
      dryRun: opts.dryRun,
    };
  }

  async function runPreview() {
    setPreviewing(true);
    setResult(null);
    try {
      const body = buildBody({ dryRun: true });
      const res = await fetch("/api/admin/bulk-notify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as
        | (Result & { error?: string })
        | null;
      if (!res.ok || !json) {
        toast({
          tone: "error",
          title: "Önizleme alınamadı",
          description: json?.error ?? `HTTP ${res.status}`,
        });
        return;
      }
      setPreview(json.total);
    } finally {
      setPreviewing(false);
    }
  }

  async function runSend() {
    setSending(true);
    setResult(null);
    setConfirmOpen(false);
    try {
      const body = buildBody({ dryRun: false });
      const res = await fetch("/api/admin/bulk-notify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as
        | (Result & { error?: string })
        | null;
      if (!res.ok || !json) {
        toast({
          tone: "error",
          title: "Gönderim başarısız",
          description: json?.error ?? `HTTP ${res.status}`,
        });
        return;
      }
      setResult(json);
      toast({
        tone: "success",
        title: "Bildirim gönderildi",
        description: `${json.total} alıcı · E-posta ${json.sent.email}/${json.total} · SMS ${json.sent.sms}/${json.total}`,
      });
    } finally {
      setSending(false);
    }
  }

  const emailEnabled = settings?.emailEnabled === true;
  const smsEnabled =
    settings?.smsEnabled === true && (settings?.smsProvider ?? "") !== "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">
            Toplu Bildirim
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Burs başvuranlarına şablonlu e-posta + SMS, ya da SMS abonelerine
            düz metin SMS gönderebilirsiniz. Şablonları{" "}
            <Link
              href="/admin/ayarlar/bildirimler"
              className="text-brand-700 hover:underline"
            >
              Bildirim Ayarları
            </Link>{" "}
            sayfasından düzenleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Sağlayıcı durumu — SMS aboneleri akışında sadece SMS bakılır,
          başvuranlar akışında her iki kanal da. */}
      {!settingsLoading &&
        (audience === "sms-subscribers"
          ? !smsEnabled
          : !emailEnabled || !smsEnabled) && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 space-y-1">
              <div className="font-medium">
                {audience === "sms-subscribers"
                  ? "SMS sağlayıcısı yapılandırılmamış:"
                  : "Bazı kanallar kapalı:"}
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {audience === "applications" && !emailEnabled && (
                  <li>E-posta gönderimi devre dışı.</li>
                )}
                {!smsEnabled && (
                  <li>
                    SMS gönderimi devre dışı veya sağlayıcı seçilmemiş.
                  </li>
                )}
              </ul>
              <Link
                href="/admin/ayarlar/bildirimler"
                className="inline-block mt-1 text-amber-900 underline font-medium"
              >
                Bildirim Ayarları'na git →
              </Link>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form bölümü */}
        <div className="lg:col-span-2 space-y-5">
          <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wide">
              Hedef kitle
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setAudience("applications");
                  setResult(null);
                  setPreview(null);
                }}
                className={
                  "text-left rounded-xl border-2 p-4 transition-all " +
                  (audience === "applications"
                    ? "border-brand-700 bg-brand-50"
                    : "border-border bg-white hover:border-brand-300")
                }
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <GraduationCap className="h-4 w-4 text-brand-700" />
                  <span className="font-semibold text-brand-900 text-sm">
                    Burs Başvuranları
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Başvuru durumuna göre şablonlu e-posta + SMS. Öğrencinin adı
                  ve başvuru numarası otomatik yerleştirilir.
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudience("sms-subscribers");
                  setResult(null);
                  setPreview(null);
                }}
                className={
                  "text-left rounded-xl border-2 p-4 transition-all " +
                  (audience === "sms-subscribers"
                    ? "border-brand-700 bg-brand-50"
                    : "border-border bg-white hover:border-brand-300")
                }
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Phone className="h-4 w-4 text-brand-700" />
                  <span className="font-semibold text-brand-900 text-sm">
                    SMS Aboneleri
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ana sayfa abonelik formundan veya içe aktarılan numaralara
                  düz metin SMS. Sadece SMS gider, e-posta atılmaz.
                </p>
              </button>
            </div>
          </section>

          {audience === "applications" && (
          <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wide">
              1) Şablon türü
            </h2>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((opt) => {
                const active = event === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setEventSmart(opt.value)}
                    className={
                      "h-10 px-4 rounded-full text-sm font-medium border transition-colors " +
                      (active
                        ? opt.tone
                        : "border-border bg-white text-brand-800 hover:bg-muted")
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>
          )}

          {audience === "applications" && (
          <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wide">
              2) Filtreler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Başvuru durumu">
                <Select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as StatusFilter);
                    setResult(null);
                    setPreview(null);
                  }}
                >
                  <option value="all">Tümü</option>
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Başvuru yılı">
                <Input
                  inputMode="numeric"
                  placeholder={String(CURRENT_YEAR)}
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value.replace(/[^\d]/g, ""));
                    setResult(null);
                    setPreview(null);
                  }}
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              Yılı boş bırakırsanız tüm yıllar dahil edilir.
            </p>
          </section>
          )}

          {audience === "sms-subscribers" && (
          <>
          <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wide">
              1) Abonelik tarihi filtresi (opsiyonel)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Başlangıç"
                hint="Bu tarihten itibaren abone olanlar"
              >
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setResult(null);
                    setPreview(null);
                  }}
                />
              </Field>
              <Field
                label="Bitiş"
                hint="Bu tarihe kadar (dahil) abone olanlar"
              >
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setResult(null);
                    setPreview(null);
                  }}
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              İki alanı da boş bırakırsanız tüm SMS aboneleri dahil edilir.
              Toplam {subscribers ? subscribers.length : "…"} kayıtlı abone
              var.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wide">
              2) SMS metni <span className="text-red-500">*</span>
            </h2>
            <Textarea
              rows={5}
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Örn: Sayın abonemiz, derneğimizin yeni burs başvuruları başlamıştır. Detaylar için www.kumrulular.com adresini ziyaret edin."
              maxLength={700}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Tek SMS 160 karakter (Türkçe karakter varsa ~70). Sağlayıcı
                otomatik bölüyor.
              </span>
              <span
                className={
                  smsText.length > 160
                    ? "text-amber-700 font-medium"
                    : "text-muted-foreground"
                }
              >
                {smsText.length} / 700
              </span>
            </div>
          </section>
          </>
          )}

          {event === "rejected" && (
            <section className="rounded-2xl border border-border bg-white p-5 space-y-3">
              <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wide">
                3) Red gerekçesi (opsiyonel)
              </h2>
              <Textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Örn: Akademik başarı kriterimizi karşılamadığı için..."
              />
              <p className="text-xs text-muted-foreground">
                Bu metin şablonda {"{reason}"} placeholder'ı yerine geçer. Boş
                bırakırsanız placeholder boş kalır.
              </p>
            </section>
          )}

          {event === "needsUpdate" && (
            <section className="rounded-2xl border border-border bg-white p-5 space-y-3">
              <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wide">
                3) Güncelleme talebi <span className="text-red-500">*</span>
              </h2>
              <Textarea
                rows={4}
                value={updateRequest}
                onChange={(e) => setUpdateRequest(e.target.value)}
                placeholder="Örn: Lütfen güncel transkriptinizi yükleyiniz."
              />
              <p className="text-xs text-muted-foreground">
                Bu metin şablonda {"{updateRequest}"} placeholder'ı yerine geçer.
              </p>
            </section>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={runPreview}
              loading={previewing}
              disabled={sending}
              leftIcon={<Users className="h-4 w-4" />}
            >
              Önizleme (alıcı sayısı)
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (audience === "sms-subscribers") {
                  if (!smsText.trim()) {
                    toast({
                      tone: "error",
                      title: "SMS metni gerekli",
                      description:
                        "Abonelere gönderilecek SMS metnini yazın.",
                    });
                    return;
                  }
                } else if (event === "needsUpdate" && !updateRequest.trim()) {
                  toast({
                    tone: "error",
                    title: "Açıklama gerekli",
                    description:
                      "Bilgi güncellemesi için açıklama metni boş olamaz.",
                  });
                  return;
                }
                setConfirmOpen(true);
              }}
              loading={sending}
              disabled={previewing}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Gönder
            </Button>
          </div>
        </div>

        {/* Sağ kenar: özet kart */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">
              Özet
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Hedef</dt>
                <dd className="text-brand-900 font-medium text-right">
                  {audience === "sms-subscribers"
                    ? "SMS Aboneleri"
                    : "Burs Başvuranları"}
                </dd>
              </div>
              {audience === "applications" && (
                <>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Şablon</dt>
                    <dd className="text-brand-900 font-medium text-right">
                      {EVENT_OPTIONS.find((e) => e.value === event)?.label}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Durum</dt>
                    <dd className="text-brand-900 font-medium">
                      {status === "all"
                        ? "Tümü"
                        : statusOptions.find((o) => o.value === status)?.label}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Yıl</dt>
                    <dd className="text-brand-900 font-medium">
                      {year || "Tümü"}
                    </dd>
                  </div>
                </>
              )}
              {audience === "sms-subscribers" && (
                <>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Başlangıç</dt>
                    <dd className="text-brand-900 font-medium">
                      {fromDate || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Bitiş</dt>
                    <dd className="text-brand-900 font-medium">
                      {toDate || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">SMS uzunluğu</dt>
                    <dd className="text-brand-900 font-medium">
                      {smsText.length} kar.
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between gap-3 pt-2 border-t border-border">
                <dt className="text-muted-foreground">Tahmini alıcı</dt>
                <dd className="text-brand-900 font-semibold">
                  {estimated.toLocaleString("tr-TR")}
                </dd>
              </div>
              {preview != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Gerçek alıcı (DB)</dt>
                  <dd className="text-emerald-700 font-semibold">
                    {preview.toLocaleString("tr-TR")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-3">
              Kanallar
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-700" />
                <span className="flex-1">E-posta</span>
                <span
                  className={
                    "text-xs font-medium px-2 py-0.5 rounded-full " +
                    (emailEnabled
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {emailEnabled ? "Aktif" : "Pasif"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-700" />
                <span className="flex-1">SMS</span>
                <span
                  className={
                    "text-xs font-medium px-2 py-0.5 rounded-full " +
                    (smsEnabled
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {smsEnabled ? "Aktif" : "Pasif"}
                </span>
              </div>
            </div>
          </div>

          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <div className="text-sm font-semibold text-emerald-900">
                  Gönderim raporu
                </div>
              </div>
              <ul className="text-sm text-emerald-900 space-y-1">
                <li>
                  Toplam: <strong>{result.total}</strong>
                </li>
                <li>
                  E-posta başarılı:{" "}
                  <strong>{result.sent.email}</strong> · başarısız{" "}
                  <strong>{result.failed.email}</strong>
                </li>
                <li>
                  SMS başarılı: <strong>{result.sent.sms}</strong> · başarısız{" "}
                  <strong>{result.failed.sms}</strong>
                </li>
              </ul>
              {result.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-300/60 text-xs text-emerald-900">
                  <div className="font-medium mb-1">İlk hatalar:</div>
                  <ul className="space-y-1">
                    {result.errors.map((e) => (
                      <li key={e.applicationId}>
                        <span className="font-mono">
                          #{e.applicationId.slice(-6)}
                        </span>{" "}
                        {e.email && (
                          <>
                            · E-posta: <em>{e.email}</em>
                          </>
                        )}
                        {e.sms && (
                          <>
                            {" "}
                            · SMS: <em>{e.sms}</em>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Toplu bildirimi gönder?"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-900">
            {(preview ?? estimated).toLocaleString("tr-TR")} alıcıya{" "}
            <strong>
              {audience === "sms-subscribers"
                ? "düz metin SMS"
                : EVENT_OPTIONS.find(
                    (e) => e.value === event,
                  )?.label.toLowerCase()}
            </strong>{" "}
            gönderilecek. Bu işlem geri alınamaz.
          </p>
          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            {audience === "applications" ? (
              <>
                <div>
                  Durum:{" "}
                  {status === "all"
                    ? "Tümü"
                    : statusOptions.find((o) => o.value === status)?.label}
                </div>
                <div>Yıl: {year || "Tümü"}</div>
                <div>
                  Kanallar:{" "}
                  {[emailEnabled && "E-posta", smsEnabled && "SMS"]
                    .filter(Boolean)
                    .join(" + ") || "(hiçbiri aktif değil)"}
                </div>
              </>
            ) : (
              <>
                <div>Tarih aralığı: {fromDate || "—"} → {toDate || "—"}</div>
                <div>
                  Kanal: SMS {smsEnabled ? "(aktif)" : "(devre dışı!)"}
                </div>
                <div>SMS uzunluğu: {smsText.length} karakter</div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={sending}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              onClick={runSend}
              loading={sending}
              leftIcon={
                sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )
              }
            >
              Evet, gönder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
