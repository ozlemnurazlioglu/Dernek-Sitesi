"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, RotateCcw, Save, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_BURS_RULES } from "@/lib/defaults/burs-rules";
import { normalizeBurseRules } from "@/lib/burs-rules-shared";
import type { BurseRules, ScholarshipApplication } from "@/lib/types";

const normalize = normalizeBurseRules;

const SCHOOL_LABELS: Record<ScholarshipApplication["schoolType"], string> = {
  lise: "Lise",
  onlisans: "Ön Lisans",
  lisans: "Lisans",
  yuksek_lisans: "Yüksek Lisans",
  doktora: "Doktora",
};

export default function BursKurallariPage() {
  const { ready, pageBlocks, updatePageBlock } = useStore();
  const { toast } = useToast();

  const stored = useMemo(
    () => normalize(pageBlocks["burs.rules"]),
    [pageBlocks],
  );
  const [rules, setRules] = useState<BurseRules>(stored);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRules(stored);
  }, [stored]);

  function update<K extends keyof BurseRules>(key: K, value: BurseRules[K]) {
    setRules((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSchool(t: ScholarshipApplication["schoolType"]) {
    setRules((prev) => {
      const has = prev.blockedSchoolTypes.includes(t);
      return {
        ...prev,
        blockedSchoolTypes: has
          ? prev.blockedSchoolTypes.filter((x) => x !== t)
          : [...prev.blockedSchoolTypes, t],
      };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      updatePageBlock("burs.rules", rules);
      toast({
        tone: "success",
        title: "Burs kuralları kaydedildi",
        description: "Yeni başvurularda bu kurallar geçerli olacak.",
      });
    } finally {
      // updatePageBlock asenkron POST; UI'da hızlı feedback için setSaving false.
      window.setTimeout(() => setSaving(false), 300);
    }
  }

  function handleReset() {
    if (!confirm("Tüm kuralları varsayılana döndürmek istiyor musun?")) return;
    setRules({ ...DEFAULT_BURS_RULES });
  }

  if (!ready) {
    return (
      <div className="p-10 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">Burs Kuralları</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Otomatik red kuralları, başvuru dönemi tarihleri ve FF (zayıf) uyarı
          eşiği. Tüm otomatik kararlar admin tarafından override edilebilir.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <strong>Önemli:</strong> Otomatik red kuralları kapatıldığında hiçbir
          başvuru sistem tarafından otomatik reddedilmez. Auto-reject olan
          başvurular daha sonra panelden manuel "İncele/Kabul Et" şeklinde geri
          alınabilir.
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-brand-900">
          Başvuru dönemi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Başvuru açılış tarihi"
            hint="Boş bırakırsanız tarih sınırı olmaz."
          >
            <Input
              type="date"
              value={rules.applicationOpenDate}
              onChange={(e) => update("applicationOpenDate", e.target.value)}
            />
          </Field>
          <Field
            label="Başvuru kapanış tarihi"
            hint="Kapanış sonrası form gönderim ve düzenleme kapanır."
          >
            <Input
              type="date"
              value={rules.applicationCloseDate}
              onChange={(e) => update("applicationCloseDate", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 mt-1 rounded border-border"
            checked={rules.autoRejectEnabled}
            onChange={(e) => update("autoRejectEnabled", e.target.checked)}
          />
          <div className="flex-1">
            <div className="text-sm font-semibold text-brand-900">
              Otomatik red kurallarını aktif et
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kapatırsanız aşağıdaki kuralların hiçbiri uygulanmaz; tüm
              başvurular insan kararına bırakılır.
            </p>
          </div>
        </div>

        <div
          className={
            "space-y-4 pl-7 " +
            (rules.autoRejectEnabled ? "" : "opacity-50 pointer-events-none")
          }
        >
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 mt-1 rounded border-border"
              checked={rules.autoRejectIfPreviouslyRejected}
              onChange={(e) =>
                update("autoRejectIfPreviouslyRejected", e.target.checked)
              }
            />
            <span>
              <strong>Daha önce reddedilmiş TC'yi otomatik reddet.</strong>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Geçmiş yıllarda aynı TC ile reddedilmiş başvuru varsa yeni
                başvuru direkt "Reddedildi" olarak işaretlenir.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 mt-1 rounded border-border"
              checked={rules.blockGraduatedYearPassed}
              onChange={(e) =>
                update("blockGraduatedYearPassed", e.target.checked)
              }
            />
            <span>
              <strong>Mezuniyet yılı geçen başvuruları reddet.</strong>
              <span className="block text-xs text-muted-foreground mt-0.5">
                Sistem hesabına göre öğrencinin mezuniyet yılı bu yıldan
                önceyse otomatik reddedilir.
              </span>
            </span>
          </label>

          <div>
            <div className="text-sm font-medium text-brand-900 mb-2">
              Engellenen okul kademeleri
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Seçilen kademelerden gelen başvurular otomatik reddedilir.
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SCHOOL_LABELS) as ScholarshipApplication["schoolType"][]).map(
                (t) => {
                  const active = rules.blockedSchoolTypes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleSchool(t)}
                      className={
                        "h-9 px-3 rounded-full border text-xs font-medium transition-colors " +
                        (active
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-white border-border text-brand-900 hover:bg-muted")
                      }
                    >
                      {SCHOOL_LABELS[t]}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <Field
            label="Engellenen okul desenleri"
            hint='Virgülle ayırın. Okul adı bunlardan herhangi birini içerirse reddedilir. Örn: "Koç, Sabancı, Özel"'
          >
            <Textarea
              rows={2}
              placeholder="Koç, Sabancı, Bilkent"
              value={rules.blockedSchoolPattern}
              onChange={(e) => update("blockedSchoolPattern", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-brand-900">
          Başarısız ders (FF) uyarısı
        </h2>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 mt-1 rounded border-border"
            checked={rules.failedCoursesEnabled}
            onChange={(e) => update("failedCoursesEnabled", e.target.checked)}
          />
          <span>
            <strong>FF (zayıf) ders sayısı uyarısını aktif et.</strong>
            <span className="block text-xs text-muted-foreground mt-0.5">
              Aktif olduğunda başvuru formunda "Başarısız ders sayısı" sorulur
              ve eşik üzerinde admin'e kırmızı uyarı verilir. Öğrenci doğru
              beyan vermiyorsa kapatın.
            </span>
          </span>
        </label>
        <div
          className={
            "pl-7 " +
            (rules.failedCoursesEnabled ? "" : "opacity-50 pointer-events-none")
          }
        >
          <Field
            label="Uyarı eşiği (kaç FF üstünde admin uyarısı verilsin)"
            hint="Bu değer ve üzerinde admin paneli kırmızı uyarı gösterir."
          >
            <Input
              type="number"
              min={1}
              max={20}
              value={rules.failedCoursesThreshold}
              onChange={(e) =>
                update("failedCoursesThreshold", Number(e.target.value) || 4)
              }
            />
          </Field>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Varsayılana döndür
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          loading={saving}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Kaydet
        </Button>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5" />
        Kural değişikliği geçmiş başvuruları etkilemez; sadece bundan
        sonra gelen başvurular için geçerlidir.
      </div>
    </div>
  );
}
