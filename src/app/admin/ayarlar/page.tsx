"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { UploadInput } from "@/components/admin/upload-input";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { SiteSettings } from "@/lib/types";

const STRING_KEYS: { key: keyof SiteSettings; label: string; multi?: boolean; placeholder?: string }[] = [
  { key: "name", label: "Tam adı" },
  { key: "shortName", label: "Kısa ad" },
  { key: "logoSubtitle", label: "Logo alt yazısı (örn. Eğitim · Kültür · Yardımlaşma)" },
  { key: "slogan", label: "Slogan" },
  { key: "description", label: "Açıklama (footer / hakkımızda üst yazı)", multi: true },
  { key: "contactAddress", label: "Adres", multi: true },
  { key: "contactPhone", label: "Telefon" },
  { key: "contactEmail", label: "E-posta" },
  { key: "contactWorkingHours", label: "Çalışma saatleri" },
  { key: "mapEmbedUrl", label: "Harita embed URL", multi: true, placeholder: "https://maps.google.com/maps?...&output=embed" },
  { key: "socialFacebook", label: "Facebook URL" },
  { key: "socialInstagram", label: "Instagram URL" },
  { key: "socialTwitter", label: "Twitter / X URL" },
  { key: "socialLinkedin", label: "LinkedIn URL" },
  { key: "socialYoutube", label: "YouTube URL" },
];

const ANALYTICS_KEYS: {
  key: keyof SiteSettings;
  label: string;
  placeholder?: string;
  hint?: string;
}[] = [
  {
    key: "gaMeasurementId",
    label: "Google Analytics 4 — Ölçüm Kimliği",
    placeholder: "G-XXXXXXXXXX",
    hint: "analytics.google.com → Yönetici → Veri Akışları sayfasından alabilirsiniz. Boş bırakırsanız hiçbir Google Analytics kodu eklenmez.",
  },
  {
    key: "gtmContainerId",
    label: "Google Tag Manager — Container ID",
    placeholder: "GTM-XXXXXX",
    hint: "tagmanager.google.com'da oluşturduğunuz konteynerin kimliği. GA, Pixel ve diğer takip araçlarını GTM üzerinden yönetebilirsiniz.",
  },
  {
    key: "metaPixelId",
    label: "Meta (Facebook) Pixel ID",
    placeholder: "1234567890123456",
    hint: "Meta Events Manager → Veri Kaynakları sayfasından alın. Yalnızca sayısal piksel kimliği yapıştırın.",
  },
  {
    key: "adsensePublisherId",
    label: "Google AdSense — Yayıncı Kimliği",
    placeholder: "ca-pub-1234567890123456",
    hint: "AdSense panelinden alacağınız yayıncı kimliği. Doldurulduğunda Auto Ads aktifleşir; Google sitenizin uygun yerlerine otomatik reklam yerleştirir.",
  },
];

const SEO_KEYS: { key: keyof SiteSettings; label: string; multi?: boolean; placeholder?: string; hint?: string }[] = [
  {
    key: "seoTitle",
    label: "SEO — Varsayılan başlık",
    placeholder: "Umut Eğitim ve Dayanışma Derneği",
    hint: "Anasayfa ve başlığı olmayan sayfalarda kullanılır.",
  },
  {
    key: "seoTitleTemplate",
    label: "SEO — Başlık şablonu",
    placeholder: "%s | Umut Derneği",
    hint: "%s alt sayfa başlığıyla değiştirilir. Boşsa otomatik şablon üretilir.",
  },
  {
    key: "seoDescription",
    label: "SEO — Varsayılan açıklama",
    multi: true,
    placeholder: "Site hakkında 150-160 karakterlik kısa tanıtım.",
  },
  {
    key: "seoOgImage",
    label: "SEO — Sosyal paylaşım görseli (URL)",
    placeholder: "https://… (1200x630 öneriliyor)",
    hint: "Sosyal medyada paylaşıldığında gözüken kapak görseli.",
  },
  {
    key: "seoFaviconUrl",
    label: "SEO — Favicon URL'i",
    placeholder: "https://… (.ico, .png, .svg)",
    hint: "Tarayıcı sekmesinde gözüken minik simge.",
  },
];

const NUM_KEYS: { key: keyof SiteSettings; label: string }[] = [
  { key: "founded", label: "Kuruluş yılı" },
  { key: "statYearsActive", label: "İstatistik: Faaliyet yılı" },
  { key: "statScholarshipsGiven", label: "İstatistik: Verilen burs sayısı" },
  { key: "statActiveMembers", label: "İstatistik: Aktif üye" },
  { key: "statCompletedProjects", label: "İstatistik: Tamamlanan proje" },
];

export default function AyarlarPage() {
  const { siteSettings, updateSiteSettings } = useStore();
  const { toast } = useToast();
  const [form, setForm] = useState<SiteSettings>(siteSettings);

  useEffect(() => {
    setForm(siteSettings);
  }, [siteSettings]);

  function setField<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    updateSiteSettings(form);
    toast({ tone: "success", title: "Site ayarları kaydedildi" });
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Site Ayarları</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tüm sayfalarda ortak görünen bilgiler — iletişim, banka, sosyal medya
            hesapları ve istatistikler.
          </p>
        </div>
        <Button onClick={save} leftIcon={<Save className="h-4 w-4" />}>
          Kaydet
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 mb-6">
        <Field
          label="Logo görseli"
          hint="Header ve footer'da kullanılır. Boş bırakırsanız varsayılan SVG logo gösterilir. PNG/SVG önerilir."
        >
          <UploadInput
            value={form.logoUrl}
            onChange={(url) => setField("logoUrl", url)}
            kind="image"
            placeholder="/logo.png veya https://…"
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 grid sm:grid-cols-2 gap-5">
        {STRING_KEYS.map((f) => (
          <div key={f.key} className={f.multi ? "sm:col-span-2" : ""}>
            <Field label={f.label}>
              {f.multi ? (
                <Textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => setField(f.key, e.target.value as SiteSettings[typeof f.key])}
                />
              ) : (
                <Input
                  placeholder={f.placeholder}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => setField(f.key, e.target.value as SiteSettings[typeof f.key])}
                />
              )}
            </Field>
          </div>
        ))}
        {NUM_KEYS.map((f) => (
          <Field key={f.key} label={f.label}>
            <Input
              type="number"
              value={String(form[f.key] ?? 0)}
              onChange={(e) =>
                setField(f.key, (Number(e.target.value) || 0) as SiteSettings[typeof f.key])
              }
            />
          </Field>
        ))}
      </div>

      <div className="mt-8 mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">
            SEO & Sosyal Paylaşım
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tarayıcı sekmesinde gözüken başlık, arama motoru açıklaması, favicon
            ve sosyal medya kapak görseli.
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6 grid sm:grid-cols-2 gap-5">
        {SEO_KEYS.map((f) => (
          <div key={f.key} className={f.multi ? "sm:col-span-2" : ""}>
            <Field label={f.label} hint={f.hint}>
              {f.multi ? (
                <Textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) =>
                    setField(f.key, e.target.value as SiteSettings[typeof f.key])
                  }
                />
              ) : (
                <Input
                  placeholder={f.placeholder}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) =>
                    setField(f.key, e.target.value as SiteSettings[typeof f.key])
                  }
                />
              )}
            </Field>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-3">
        <h2 className="text-lg font-semibold text-brand-900">
          Analytics & Reklam
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Google Analytics, Tag Manager, Meta Pixel ve AdSense gibi takip
          araçlarının kimliklerini buradan tanımlayın. Boş bırakılan alana ait
          script hiç yüklenmez. Doldurduğunuz alanlar tüm site genelinde
          (admin paneli hariç) otomatik olarak çalışır.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6 grid sm:grid-cols-2 gap-5">
        {ANALYTICS_KEYS.map((f) => (
          <div key={f.key}>
            <Field label={f.label} hint={f.hint}>
              <Input
                placeholder={f.placeholder}
                value={String(form[f.key] ?? "")}
                onChange={(e) =>
                  setField(f.key, e.target.value as SiteSettings[typeof f.key])
                }
              />
            </Field>
          </div>
        ))}
        <div className="sm:col-span-2">
          <Field
            label="Özel Takip / Reklam Kodu (HTML)"
            hint="Yapıştırdığınız HTML, sayfanın body kapanışından hemen önce site genelinde aynen render edilir. Yalnızca güvendiğiniz kodları yapıştırın — yanlış kod siteyi bozabilir."
          >
            <Textarea
              rows={5}
              placeholder={`<!-- Örn. Hotjar, Yandex Metrica, özel reklam ağı kodu vb. -->\n<script>\n  // …\n</script>`}
              value={form.customTrackingHtml}
              onChange={(e) => setField("customTrackingHtml", e.target.value)}
              className="font-mono text-xs"
            />
          </Field>
          <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Bu alan ham HTML çalıştırır. Hatalı kod sitenin görünümünü
              bozabilir veya güvenlik açığı oluşturabilir. Yalnızca güvenilir
              sağlayıcıların verdiği kod parçalarını ekleyin.
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <Button onClick={save} leftIcon={<Save className="h-4 w-4" />}>
          Tüm Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
}
