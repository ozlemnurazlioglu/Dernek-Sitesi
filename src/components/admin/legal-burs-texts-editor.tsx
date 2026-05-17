"use client";

import { useEffect, useState } from "react";
import { BlockCard } from "@/components/admin/block-editors";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import {
  DEFAULT_BURS_APPLICATION_CLOSED,
  normalizeBursApplicationClosed,
} from "@/lib/defaults/burs-application-closed";
import { DEFAULT_KVKK_TEXT } from "@/lib/defaults/kvkk";
import type { BursApplicationClosedText } from "@/lib/types";

export function LegalBursTextsEditor() {
  const { pageBlocks, updatePageBlock } = useStore();

  const [kvkk, setKvkk] = useState(() =>
    typeof pageBlocks["legal.kvkk"] === "string" &&
    pageBlocks["legal.kvkk"].trim()
      ? (pageBlocks["legal.kvkk"] as string)
      : DEFAULT_KVKK_TEXT,
  );

  const [closed, setClosed] = useState<BursApplicationClosedText>(() =>
    normalizeBursApplicationClosed(pageBlocks["burs.application_closed"]),
  );

  useEffect(() => {
    setKvkk(
      typeof pageBlocks["legal.kvkk"] === "string" &&
        pageBlocks["legal.kvkk"].trim()
        ? (pageBlocks["legal.kvkk"] as string)
        : DEFAULT_KVKK_TEXT,
    );
    setClosed(
      normalizeBursApplicationClosed(pageBlocks["burs.application_closed"]),
    );
  }, [pageBlocks]);

  const setClosedField = <K extends keyof BursApplicationClosedText>(
    key: K,
    value: BursApplicationClosedText[K],
  ) => {
    setClosed((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 mt-6">
      <BlockCard
        title="Burs Başvurusu — KVKK Onay Metni (Modal)"
        description="Öğrenci /burs/basvuru sayfasına girdiğinde, formdan önce açılan pencerede gösterilir. Ayrı bir /kvkk yasal sayfanız varsa bu metin ondan bağımsızdır; ikisini de güncel tutun."
        blockKey="legal.kvkk"
        onSave={() => updatePageBlock("legal.kvkk", kvkk.trim())}
      >
        <Field
          label="Aydınlatma metni"
          hint="Düz metin. Paragraflar için boş satır bırakın. Öğrenci kaydırıp okuduktan sonra onaylar."
        >
          <Textarea
            rows={16}
            value={kvkk}
            onChange={(e) => setKvkk(e.target.value)}
            className="font-mono text-sm"
          />
        </Field>
        <button
          type="button"
          className="text-xs text-brand-700 hover:underline mt-2"
          onClick={() => setKvkk(DEFAULT_KVKK_TEXT)}
        >
          Varsayılana döndür
        </button>
      </BlockCard>

      <BlockCard
        title="Burs Başvurusu — Dönem Kapalı Duyurusu"
        description="Başvuru tarihleri dışında (Burs Kuralları'ndaki açılış/kapanış) yeni başvuru ekranında bu metin gösterilir. Tarih bilgisini otomatik ekleyebilirsiniz."
        blockKey="burs.application_closed"
        onSave={() => updatePageBlock("burs.application_closed", closed)}
      >
        <div className="space-y-4">
          <Field label="Başlık">
            <Input
              value={closed.title}
              onChange={(e) => setClosedField("title", e.target.value)}
              placeholder="Burs başvuruları şu an kapalı"
            />
          </Field>
          <Field
            label="Açıklama"
            hint="Ana duyuru metni. Örn. sonuç tarihi, iletişim, gelecek dönem bilgisi."
          >
            <Textarea
              rows={6}
              value={closed.description}
              onChange={(e) => setClosedField("description", e.target.value)}
            />
          </Field>
          <label className="flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer">
            <input
              type="checkbox"
              checked={closed.showSystemDate}
              onChange={(e) =>
                setClosedField("showSystemDate", e.target.checked)
              }
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm text-brand-900">
              <strong>Sistem tarih mesajını göster</strong>
              <span className="block text-muted-foreground mt-0.5">
                Burs Kuralları&apos;ndaki açılış/kapanış tarihine göre otomatik
                üretilen kısa cümleyi (örn. &quot;Başvuru süresi … sona ermiştir&quot;)
                açıklamanın altında göster.
              </span>
            </span>
          </label>
          <Field label="Alt not (küçük yazı)">
            <Textarea
              rows={2}
              value={closed.footnote}
              onChange={(e) => setClosedField("footnote", e.target.value)}
              placeholder="Mevcut başvurularınızı hesabınızdan takip edebilirsiniz."
            />
          </Field>
          <button
            type="button"
            className="text-xs text-brand-700 hover:underline"
            onClick={() => setClosed(DEFAULT_BURS_APPLICATION_CLOSED)}
          >
            Varsayılana döndür
          </button>
        </div>
      </BlockCard>
    </div>
  );
}
