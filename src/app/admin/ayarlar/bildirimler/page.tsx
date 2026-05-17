"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Mail,
  MessageSquare,
  Save,
  Send,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type {
  NotificationSettings,
  NotificationTemplate,
  NotificationTemplates,
} from "@/lib/types";

type Tab = "smtp" | "sms" | "templates";
type TemplateKey = keyof NotificationTemplates;

const TEMPLATE_TABS: { key: TemplateKey; label: string; tone: string; description: string }[] = [
  {
    key: "approved",
    label: "Onaylandı",
    tone: "bg-emerald-50 text-emerald-700",
    description:
      "Başvurusu onaylanan öğrenciye gönderilir. Tebrik mesajı + dernek bilgisi.",
  },
  {
    key: "rejected",
    label: "Reddedildi",
    tone: "bg-red-50 text-red-700",
    description:
      "Başvurusu reddedilen öğrenciye gönderilir. {reason} placeholder'ı admin gerekçesini içerir (boş bırakılabilir).",
  },
  {
    key: "needsUpdate",
    label: "Bilgi Güncellenmeli",
    tone: "bg-orange-50 text-orange-700",
    description:
      "Bilgi güncellemesi istenen başvurularda gönderilir. {updateRequest} placeholder'ı admin'in yazdığı notu içerir.",
  },
];

const PLACEHOLDERS = [
  { key: "{fullName}", desc: "Başvuran ad soyad" },
  { key: "{applicationId}", desc: "Başvuru numarası" },
  { key: "{associationName}", desc: "Dernek adı" },
  { key: "{reason}", desc: "Red gerekçesi (manuel)" },
  { key: "{updateRequest}", desc: "Bilgi güncellemesi notu" },
  { key: "{applicationLink}", desc: "/hesabim linki" },
  { key: "{year}", desc: "Yıl" },
];

export default function BildirimAyarlariPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("smtp");
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [defaults, setDefaults] = useState<NotificationTemplates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSms, setTestingSms] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testSmsTo, setTestSmsTo] = useState("");
  const [templateTab, setTemplateTab] = useState<TemplateKey>("approved");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notification-settings", {
        credentials: "same-origin",
      });
      const json = (await res.json().catch(() => null)) as {
        settings?: NotificationSettings;
        defaults?: { templates: NotificationTemplates };
        error?: string;
      } | null;
      if (!res.ok || !json?.settings) {
        toast({
          tone: "error",
          title: "Yüklenemedi",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      setSettings(json.settings);
      setDefaults(json.defaults?.templates ?? null);
    } catch (err) {
      toast({
        tone: "error",
        title: "Bağlantı hatası",
        description: String(err instanceof Error ? err.message : err),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function update<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function updateTemplate(
    key: TemplateKey,
    field: keyof NotificationTemplate,
    value: string,
  ) {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        templates: {
          ...prev.templates,
          [key]: { ...prev.templates[key], [field]: value },
        },
      };
    });
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/notification-settings", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        settings?: NotificationSettings;
        error?: string;
      } | null;
      if (!res.ok || !json?.ok) {
        toast({
          tone: "error",
          title: "Kaydedilemedi",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      if (json.settings) setSettings(json.settings);
      toast({
        tone: "success",
        title: "Ayarlar güncellendi",
        description: "Bildirim ayarları kaydedildi.",
      });
    } catch (err) {
      toast({
        tone: "error",
        title: "Hata",
        description: String(err instanceof Error ? err.message : err),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    if (!settings || !testEmailTo.includes("@")) {
      toast({
        tone: "warning",
        title: "Geçersiz e-posta",
        description: "Önce test gönderilecek e-posta adresini gir.",
      });
      return;
    }
    setTestingEmail(true);
    try {
      const res = await fetch(
        "/api/admin/notification-settings/test-email",
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: testEmailTo, settings }),
        },
      );
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        messageId?: string;
        error?: string;
      } | null;
      if (!res.ok || !json?.ok) {
        toast({
          tone: "error",
          title: "Test başarısız",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      toast({
        tone: "success",
        title: "Test e-postası gönderildi",
        description: `Message ID: ${json.messageId}`,
      });
    } finally {
      setTestingEmail(false);
    }
  }

  async function handleTestSms() {
    if (!settings) return;
    if (!testSmsTo) {
      toast({
        tone: "warning",
        title: "Telefon gerekli",
        description: "Test gönderilecek cep numarasını gir.",
      });
      return;
    }
    setTestingSms(true);
    try {
      const res = await fetch("/api/admin/notification-settings/test-sms", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testSmsTo, settings }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        provider?: string;
        reference?: string;
        error?: string;
      } | null;
      if (!res.ok || !json?.ok) {
        toast({
          tone: "error",
          title: "Test başarısız",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      toast({
        tone: "success",
        title: "Test SMS gönderildi",
        description: `${json.provider} • ${json.reference ?? ""}`,
      });
    } finally {
      setTestingSms(false);
    }
  }

  const currentTemplate = useMemo(
    () => settings?.templates?.[templateTab],
    [settings, templateTab],
  );

  if (loading || !settings) {
    return (
      <div className="p-10 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">
          Bildirim Ayarları
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Burs başvurusu onaylandığında, reddedildiğinde veya bilgi
          güncellemesi istendiğinde otomatik gönderilecek e-posta + SMS
          ayarları. Sağlayıcı bilgilerini girip <em>Bağlantıyı Test Et</em>
          butonuyla doğrulayabilirsiniz.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <strong>Güvenlik:</strong> Şifre / API anahtarı alanları
          veritabanında saklanır. Bu paneli yalnızca güvenli ortamlarda açın;
          API anahtarınızı sağlayıcı panelinden gerektiğinde rotate edin.
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {[
          { key: "smtp" as const, label: "E-posta (SMTP)", icon: Mail },
          { key: "sms" as const, label: "SMS Sağlayıcı", icon: MessageSquare },
          { key: "templates" as const, label: "Şablonlar", icon: Send },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                "inline-flex items-center gap-2 h-10 px-4 text-sm border-b-2 -mb-px transition-colors " +
                (active
                  ? "border-brand-700 text-brand-900 font-medium"
                  : "border-transparent text-muted-foreground hover:text-brand-900")
              }
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "smtp" && (
        <section className="rounded-2xl border border-border bg-white p-5 space-y-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={settings.emailEnabled}
              onChange={(e) => update("emailEnabled", e.target.checked)}
            />
            <span className="text-brand-900 font-medium">
              E-posta bildirimlerini aktif et
            </span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="SMTP sunucu (host)" required>
              <Input
                placeholder="smtp.gmail.com"
                value={settings.smtpHost}
                onChange={(e) => update("smtpHost", e.target.value)}
              />
            </Field>
            <Field label="Port" required hint="Genelde 587 (TLS) veya 465 (SSL)">
              <Input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => update("smtpPort", Number(e.target.value))}
              />
            </Field>
            <Field label="Kullanıcı adı (genelde e-posta)">
              <Input
                placeholder="info@dernek.org"
                value={settings.smtpUser}
                onChange={(e) => update("smtpUser", e.target.value)}
              />
            </Field>
            <Field
              label="Şifre / Uygulama parolası"
              hint="Boş bırakırsanız mevcut şifre korunur."
            >
              <Input
                type="password"
                placeholder="••••••••"
                value={settings.smtpPass}
                onChange={(e) => update("smtpPass", e.target.value)}
              />
            </Field>
            <Field
              label="Gönderici (From)"
              hint='Örnek: "Dernek Adı <info@dernek.org>"'
            >
              <Input
                value={settings.smtpFrom}
                onChange={(e) => update("smtpFrom", e.target.value)}
              />
            </Field>
            <Field
              label="SSL/TLS bağlantısı"
              hint="465 portu için aç, 587 için kapalı bırak."
            >
              <label className="inline-flex items-center gap-2 h-11 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={settings.smtpSecure}
                  onChange={(e) => update("smtpSecure", e.target.checked)}
                />
                <span>Secure (SSL/TLS)</span>
              </label>
            </Field>
          </div>

          <div className="border-t border-border pt-5">
            <div className="text-sm font-medium text-brand-900 mb-3">
              Test e-postası gönder
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="test@ornek.com"
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestEmail}
                loading={testingEmail}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Test gönder
              </Button>
            </div>
          </div>
        </section>
      )}

      {tab === "sms" && (
        <section className="rounded-2xl border border-border bg-white p-5 space-y-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={settings.smsEnabled}
              onChange={(e) => update("smsEnabled", e.target.checked)}
            />
            <span className="text-brand-900 font-medium">
              SMS bildirimlerini aktif et
            </span>
          </label>

          <Field
            label="SMS sağlayıcı"
            hint="Sağlayıcı seçimine göre gerekli alanlar aşağıda görünür."
          >
            <Select
              value={settings.smsProvider}
              onChange={(e) =>
                update(
                  "smsProvider",
                  e.target.value as NotificationSettings["smsProvider"],
                )
              }
            >
              <option value="">Seçilmedi (devre dışı)</option>
              <option value="netgsm">NetGSM</option>
              <option value="iletimerkezi">İletiMerkezi</option>
              <option value="twilio">Twilio</option>
            </Select>
          </Field>

          {settings.smsProvider === "netgsm" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="NetGSM kullanıcı kodu" required>
                <Input
                  value={settings.smsUser}
                  onChange={(e) => update("smsUser", e.target.value)}
                />
              </Field>
              <Field
                label="Şifre"
                required
                hint="Boş bırakırsanız mevcut şifre korunur."
              >
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={settings.smsPass}
                  onChange={(e) => update("smsPass", e.target.value)}
                />
              </Field>
              <Field
                label="Gönderici başlığı"
                required
                hint="NetGSM'de onaylı 'msgheader' değeri."
              >
                <Input
                  value={settings.smsHeader}
                  onChange={(e) => update("smsHeader", e.target.value)}
                />
              </Field>
            </div>
          )}

          {settings.smsProvider === "iletimerkezi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="API kullanıcı adı / key" required>
                <Input
                  value={settings.smsApiKey}
                  onChange={(e) => update("smsApiKey", e.target.value)}
                />
              </Field>
              <Field label="API hash / parola" required>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={settings.smsPass}
                  onChange={(e) => update("smsPass", e.target.value)}
                />
              </Field>
              <Field
                label="Gönderici başlığı"
                hint="Boş bırakırsanız hesabınızın varsayılan sender'ı kullanılır."
              >
                <Input
                  value={settings.smsHeader}
                  onChange={(e) => update("smsHeader", e.target.value)}
                />
              </Field>
            </div>
          )}

          {settings.smsProvider === "twilio" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Account SID" required>
                <Input
                  value={settings.smsApiKey}
                  onChange={(e) => update("smsApiKey", e.target.value)}
                />
              </Field>
              <Field
                label="Auth Token"
                required
                hint="Boş bırakırsanız mevcut token korunur."
              >
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={settings.smsApiSecret}
                  onChange={(e) => update("smsApiSecret", e.target.value)}
                />
              </Field>
              <Field
                label="Gönderici numarası (E.164)"
                required
                hint="+90... formatında veya Twilio'da aldığın numara."
              >
                <Input
                  placeholder="+1XXXXXXXXXX"
                  value={settings.smsFromNumber}
                  onChange={(e) => update("smsFromNumber", e.target.value)}
                />
              </Field>
            </div>
          )}

          {!settings.smsProvider && (
            <div className="text-sm text-muted-foreground italic">
              Sağlayıcı seçmediğinizde SMS'ler gönderilmez.
            </div>
          )}

          <div className="border-t border-border pt-5">
            <div className="text-sm font-medium text-brand-900 mb-3">
              Test SMS gönder
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="05XX XXX XX XX"
                value={testSmsTo}
                onChange={(e) => setTestSmsTo(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestSms}
                loading={testingSms}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Test gönder
              </Button>
            </div>
          </div>
        </section>
      )}

      {tab === "templates" && currentTemplate && (
        <section className="space-y-4">
          <div className="flex items-center gap-1 flex-wrap">
            {TEMPLATE_TABS.map((t) => {
              const active = templateTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemplateTab(t.key)}
                  className={
                    "h-9 px-3 rounded-full text-xs font-medium transition-colors " +
                    (active ? t.tone : "bg-muted text-muted-foreground hover:bg-zinc-200")
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
            <p className="text-xs text-muted-foreground">
              {TEMPLATE_TABS.find((t) => t.key === templateTab)?.description}
            </p>

            <Field
              label="E-posta konusu"
              hint="Placeholder'lar: aşağıdaki yardımcıya bak."
            >
              <Input
                value={currentTemplate.emailSubject}
                onChange={(e) =>
                  updateTemplate(templateTab, "emailSubject", e.target.value)
                }
              />
            </Field>
            <Field
              label="E-posta gövdesi (HTML)"
              hint="HTML kullanabilirsin. Boş bırakırsan varsayılana dönmez — düz metin görünür."
            >
              <Textarea
                rows={10}
                value={currentTemplate.emailHtml}
                onChange={(e) =>
                  updateTemplate(templateTab, "emailHtml", e.target.value)
                }
              />
            </Field>
            <Field
              label="SMS metni"
              hint="Tek SMS 160 karakter (Türkçe karakter varsa ~70). Sağlayıcı genelde otomatik bölüyor."
            >
              <Textarea
                rows={3}
                value={currentTemplate.sms}
                onChange={(e) =>
                  updateTemplate(templateTab, "sms", e.target.value)
                }
              />
            </Field>

            {defaults && (
              <div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (!confirm("Bu şablonu varsayılana döndürmek istiyor musun?")) return;
                    const def = defaults[templateTab];
                    updateTemplate(templateTab, "emailSubject", def.emailSubject);
                    updateTemplate(templateTab, "emailHtml", def.emailHtml);
                    updateTemplate(templateTab, "sms", def.sms);
                  }}
                >
                  Varsayılana döndür
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <div className="text-sm font-medium text-brand-900 mb-2">
              Kullanılabilir placeholder'lar
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {PLACEHOLDERS.map((p) => (
                <li key={p.key} className="flex items-center gap-2">
                  <code className="bg-brand-50 text-brand-800 px-2 py-0.5 rounded">
                    {p.key}
                  </code>
                  <span className="text-muted-foreground">{p.desc}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Bilinmeyen anahtarlar olduğu gibi kalır; yazımı kontrol edin.
            </p>
          </div>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          loading={saving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Kaydet
        </Button>
      </div>
    </div>
  );
}
