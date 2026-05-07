"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { UploadInput } from "@/components/admin/upload-input";
import { DEFAULT_AUTH_UI } from "@/lib/defaults/auth";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import { DEFAULT_HEADER_CONFIG } from "@/lib/defaults/header";
import type {
  AboutCard,
  AboutTransparencyBlock,
  ApplicationFormText,
  AuthUiText,
  BurseHero,
  CommonUiText,
  HeaderConfig,
  HeaderMenuItem,
  DonationSidebar,
  FooterConfig,
  FooterLinkGroup,
  HeroBlock,
  HeroSlide,
  HomeBlockId,
  HomeLayout,
  HomeLayoutItem,
  HomeProgramCard,
  HomeScholarshipCTA,
  HomeSmsSubscribeBlock,
  HomeSponsorsBlock,
  PageHeaderItem,
  PageHeadersMap,
  ScholarshipCalendarRow,
  SectionHeading,
} from "@/lib/types";
import {
  DEFAULT_HOME_LAYOUT,
  HOME_BLOCK_LABELS,
  mergeHomeLayout,
} from "@/lib/defaults/home-layout";

/* --------------- Genel saracı --------------- */

export function BlockCard({
  title,
  description,
  blockKey,
  children,
  onSave,
}: {
  title: string;
  description?: string;
  blockKey: string;
  children: ReactNode;
  onSave: () => void;
}) {
  const { toast } = useToast();
  return (
    <div className="rounded-2xl border border-border bg-white p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 pb-5 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-brand-900">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          <code className="mt-2 inline-block text-xs text-muted-foreground/80 bg-muted px-2 py-0.5 rounded">
            {blockKey}
          </code>
        </div>
        <Button
          size="sm"
          leftIcon={<Save className="h-4 w-4" />}
          onClick={() => {
            onSave();
            toast({ tone: "success", title: "Kaydedildi" });
          }}
        >
          Kaydet
        </Button>
      </div>
      {children}
    </div>
  );
}

/* --------------- Section Heading --------------- */

export function SectionHeadingEditor({
  blockKey,
  title,
  description,
}: {
  blockKey: string;
  title: string;
  description?: string;
}) {
  const { pageBlocks, updatePageBlock } = useStore();
  const initial = (pageBlocks[blockKey] as SectionHeading) ?? {
    eyebrow: "",
    title: "",
    description: "",
  };
  const [v, setV] = useState<SectionHeading>(initial);
  useEffect(() => setV(initial), [pageBlocks[blockKey]]);

  return (
    <BlockCard
      title={title}
      description={description}
      blockKey={blockKey}
      onSave={() => updatePageBlock(blockKey, v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Üst başlık (eyebrow)">
          <Input value={v.eyebrow} onChange={(e) => setV({ ...v, eyebrow: e.target.value })} />
        </Field>
        <Field label="Başlık">
          <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Açıklama">
            <Textarea
              value={v.description ?? ""}
              onChange={(e) => setV({ ...v, description: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- Hero (ana sayfa) --------------- */

/**
 * Eski tek-görselli hero verisini yeni `slides` formatına çevirir.
 * `slides` zaten doluysa olduğu gibi döndürür; boşsa eski
 * imageUrl/imageOverlay* alanlarından tek slayt türetir; ikisi de boşsa
 * boş bir başlangıç slaytı verir.
 */
function normalizeHeroSlides(block: HeroBlock | undefined): HeroSlide[] {
  if (block?.slides && block.slides.length > 0) {
    // Eski kayıtlar showOverlay alanı içermeyebilir; varsayılanı `true` kabul ederiz.
    return block.slides.map((s) => ({ showOverlay: true, ...s }));
  }
  if (block && (block.imageUrl || block.imageOverlayTitle)) {
    return [
      {
        imageUrl: block.imageUrl ?? "",
        overlayLabel: block.imageOverlayLabel ?? "",
        overlayTitle: block.imageOverlayTitle ?? "",
        overlayDesc: block.imageOverlayDesc ?? "",
        showOverlay: true,
      },
    ];
  }
  return [
    {
      imageUrl: "",
      overlayLabel: "",
      overlayTitle: "",
      overlayDesc: "",
      showOverlay: true,
    },
  ];
}

export function HeroEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const fallback: HeroBlock = {
    badgeText: "",
    titlePrefix: "",
    titleHighlight: "",
    titleSuffix: "",
    subtitle: "",
    primaryButton: { label: "", href: "" },
    secondaryButton: { label: "", href: "" },
    slides: [
      {
        imageUrl: "",
        overlayLabel: "",
        overlayTitle: "",
        overlayDesc: "",
        showOverlay: true,
      },
    ],
    floatBadge1: { label: "", value: "" },
    floatBadge2: { label: "", value: "" },
  };

  function init(): HeroBlock {
    const stored = pageBlocks["home.hero"] as HeroBlock | undefined;
    if (!stored) return fallback;
    return { ...stored, slides: normalizeHeroSlides(stored) };
  }

  const [v, setV] = useState<HeroBlock>(init);
  useEffect(() => {
    setV(init());
    // pageBlocks referans değişimine bağlı olarak yenile
  }, [pageBlocks["home.hero"]]);

  const slides = v.slides ?? [];

  function updateSlide(i: number, patch: Partial<HeroSlide>) {
    setV((prev) => ({
      ...prev,
      slides: (prev.slides ?? []).map((s, idx) =>
        idx === i ? { ...s, ...patch } : s,
      ),
    }));
  }
  function addSlide() {
    setV((prev) => ({
      ...prev,
      slides: [
        ...(prev.slides ?? []),
        {
          imageUrl: "",
          overlayLabel: "",
          overlayTitle: "",
          overlayDesc: "",
          showOverlay: true,
        },
      ],
    }));
  }
  function removeSlide(i: number) {
    setV((prev) => ({
      ...prev,
      slides: (prev.slides ?? []).filter((_, idx) => idx !== i),
    }));
  }
  function moveSlide(i: number, dir: -1 | 1) {
    setV((prev) => {
      const list = [...(prev.slides ?? [])];
      const j = i + dir;
      if (j < 0 || j >= list.length) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, slides: list };
    });
  }

  function handleSave() {
    // Geri uyumluluk: ilk slaytı eski tekil alanlara da yansıtırız;
    // böylece eski sürüm Hero'ları varsa veya başka bir yerde okunuyorsa bozulmaz.
    const first = (v.slides ?? [])[0];
    const payload: HeroBlock = {
      ...v,
      slides: v.slides ?? [],
      imageUrl: first?.imageUrl ?? "",
      imageOverlayLabel: first?.overlayLabel ?? "",
      imageOverlayTitle: first?.overlayTitle ?? "",
      imageOverlayDesc: first?.overlayDesc ?? "",
    };
    updatePageBlock("home.hero", payload);
  }

  return (
    <BlockCard
      title="Ana Sayfa Hero (Üst Bölüm)"
      description="Sitenin en üstündeki büyük başlık alanı ve sağdaki görsel slider'ı."
      blockKey="home.hero"
      onSave={handleSave}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Rozet sonrası metin">
          <Input
            value={v.badgeText}
            onChange={(e) => setV({ ...v, badgeText: e.target.value })}
            placeholder="'den bu yana eğitime destek"
          />
        </Field>
        <Field label="Başlık ön kısım">
          <Input
            value={v.titlePrefix}
            onChange={(e) => setV({ ...v, titlePrefix: e.target.value })}
          />
        </Field>
        <Field label="Vurgulu kelime">
          <Input
            value={v.titleHighlight}
            onChange={(e) => setV({ ...v, titleHighlight: e.target.value })}
          />
        </Field>
        <Field label="Başlık son kısım">
          <Input
            value={v.titleSuffix}
            onChange={(e) => setV({ ...v, titleSuffix: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Alt yazı"
            hint="Aşağıdaki '{yearsActive}' yer tutucusu, Site Ayarları → Faaliyet yılı değeriyle değiştirilir."
          >
            <Textarea
              value={v.subtitle}
              onChange={(e) => setV({ ...v, subtitle: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Birincil buton metni">
          <Input
            value={v.primaryButton.label}
            onChange={(e) =>
              setV({
                ...v,
                primaryButton: { ...v.primaryButton, label: e.target.value },
              })
            }
          />
        </Field>
        <Field label="Birincil buton linki">
          <Input
            value={v.primaryButton.href}
            onChange={(e) =>
              setV({
                ...v,
                primaryButton: { ...v.primaryButton, href: e.target.value },
              })
            }
          />
        </Field>
        <Field label="İkincil buton metni">
          <Input
            value={v.secondaryButton.label}
            onChange={(e) =>
              setV({
                ...v,
                secondaryButton: { ...v.secondaryButton, label: e.target.value },
              })
            }
          />
        </Field>
        <Field label="İkincil buton linki">
          <Input
            value={v.secondaryButton.href}
            onChange={(e) =>
              setV({
                ...v,
                secondaryButton: { ...v.secondaryButton, href: e.target.value },
              })
            }
          />
        </Field>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-3 mt-2">
            <div>
              <h4 className="text-sm font-semibold text-brand-900">
                Slaytlar (Hero kart slider'ı)
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Eklediğiniz görseller hero kartında otomatik olarak değişerek
                gösterilir. Ziyaretçi swipe / sürükleme ile de kaydırabilir.
                Tek slayt eklerseniz slider devre dışı kalır.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={addSlide}
            >
              Slayt ekle
            </Button>
          </div>

          <div className="space-y-3">
            {slides.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Henüz slayt yok. "Slayt ekle" butonuyla başlayın.
              </p>
            )}
            {slides.map((slide, i) => (
              <div
                key={i}
                className="rounded-xl border border-border p-4 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Slayt #{i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSlide(i, -1)}
                      disabled={i === 0}
                      aria-label="Yukarı taşı"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSlide(i, 1)}
                      disabled={i === slides.length - 1}
                      aria-label="Aşağı taşı"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSlide(i)}
                      disabled={slides.length <= 1}
                      aria-label="Slaytı sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Field label="Görsel">
                      <UploadInput
                        value={slide.imageUrl}
                        onChange={(url) => updateSlide(i, { imageUrl: url })}
                        kind="image"
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2 rounded-lg border border-border bg-white p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.showOverlay !== false}
                        onChange={(e) =>
                          updateSlide(i, { showOverlay: e.target.checked })
                        }
                        className="mt-0.5 h-4 w-4 rounded border-border accent-brand-700"
                      />
                      <span>
                        <span className="block text-sm font-medium text-brand-900">
                          Slayt üzerinde bilgi kutusunu göster
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          Hero görselinin sağ alt köşesinde gösterilen üst
                          etiket / başlık / açıklama kutusunu açıp kapatır.
                          Kapalıyken yalnızca görsel görünür.
                        </span>
                      </span>
                    </label>
                  </div>

                  <Field label="Üst etiket">
                    <Input
                      value={slide.overlayLabel}
                      onChange={(e) =>
                        updateSlide(i, { overlayLabel: e.target.value })
                      }
                      placeholder="ör. Memleket"
                      disabled={slide.showOverlay === false}
                    />
                  </Field>
                  <Field label="Başlık">
                    <Input
                      value={slide.overlayTitle}
                      onChange={(e) =>
                        updateSlide(i, { overlayTitle: e.target.value })
                      }
                      placeholder="ör. Kumru / Ordu"
                      disabled={slide.showOverlay === false}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Açıklama">
                      <Input
                        value={slide.overlayDesc}
                        onChange={(e) =>
                          updateSlide(i, { overlayDesc: e.target.value })
                        }
                        placeholder="ör. Karadeniz'in yeşil ilçesi"
                        disabled={slide.showOverlay === false}
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2 mt-2">
                    <details className="group rounded-lg border border-dashed border-border bg-white/60">
                      <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between gap-2 select-none">
                        <span>
                          <span className="block text-xs font-semibold text-brand-900 uppercase tracking-wider">
                            Bu slayta özel metinler &amp; butonlar
                          </span>
                          <span className="block text-[11px] text-muted-foreground mt-0.5">
                            Boş bırakılan alanlar için yukarıdaki ortak hero
                            metinleri kullanılır. Doldurulanlar bu slayt
                            aktifken o değerleri override eder — her slayta
                            farklı başlık, alt yazı ve buton verebilirsiniz.
                          </span>
                        </span>
                        <ArrowDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                      </summary>

                      <div className="px-3 pb-3 pt-1 space-y-4 border-t border-dashed border-border/60">
                        <div className="grid sm:grid-cols-2 gap-3 pt-3">
                          <div className="sm:col-span-2">
                            <Field
                              label="Rozet metni (bu slayt)"
                              hint="Doldurursanız sol üstteki '1998…' rozetinin yerine SADECE bu metin gösterilir."
                            >
                              <Input
                                value={slide.badgeText ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, { badgeText: e.target.value })
                                }
                                placeholder="Boş = ortak rozet kullanılsın"
                              />
                            </Field>
                          </div>

                          <Field label="Başlık ön (bu slayt)">
                            <Input
                              value={slide.titlePrefix ?? ""}
                              onChange={(e) =>
                                updateSlide(i, {
                                  titlePrefix: e.target.value,
                                })
                              }
                              placeholder="Boş = ortak başlık"
                            />
                          </Field>
                          <Field label="Vurgulu kelime (bu slayt)">
                            <Input
                              value={slide.titleHighlight ?? ""}
                              onChange={(e) =>
                                updateSlide(i, {
                                  titleHighlight: e.target.value,
                                })
                              }
                              placeholder="altın çizgili kelime"
                            />
                          </Field>
                          <div className="sm:col-span-2">
                            <Field
                              label="Başlık son (bu slayt)"
                              hint="Üç başlık alanından biri bile dolu olursa, bu slaytta üç parça birden slayt değerleriyle gösterilir; boş alanlar boş basılır."
                            >
                              <Input
                                value={slide.titleSuffix ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    titleSuffix: e.target.value,
                                  })
                                }
                                placeholder=""
                              />
                            </Field>
                          </div>

                          <div className="sm:col-span-2">
                            <Field
                              label="Alt yazı (bu slayt)"
                              hint="{yearsActive} yer tutucusu burada da çalışır."
                            >
                              <Textarea
                                value={slide.subtitle ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    subtitle: e.target.value,
                                  })
                                }
                                placeholder="Boş = ortak alt yazı kullanılsın"
                              />
                            </Field>
                          </div>
                        </div>

                        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
                          <div className="text-xs font-semibold text-brand-900">
                            Sağ üst yüzen rozetler (bu slayt)
                          </div>
                          <p className="text-[11px] text-muted-foreground -mt-2">
                            Bir rozetin label veya value alanı doluysa o rozet
                            için slayt değerleri kullanılır; ikisi de boşsa
                            ortak rozet gösterilir.
                          </p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Rozet 1 — etiket">
                              <Input
                                value={slide.floatBadge1?.label ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    floatBadge1: {
                                      label: e.target.value,
                                      value: slide.floatBadge1?.value ?? "",
                                    },
                                  })
                                }
                                placeholder="ör. Aktif Etkinlik"
                              />
                            </Field>
                            <Field label="Rozet 1 — değer">
                              <Input
                                value={slide.floatBadge1?.value ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    floatBadge1: {
                                      label: slide.floatBadge1?.label ?? "",
                                      value: e.target.value,
                                    },
                                  })
                                }
                                placeholder="ör. Geleneksel Piknik"
                              />
                            </Field>
                            <Field label="Rozet 2 — etiket">
                              <Input
                                value={slide.floatBadge2?.label ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    floatBadge2: {
                                      label: e.target.value,
                                      value: slide.floatBadge2?.value ?? "",
                                    },
                                  })
                                }
                                placeholder="ör. Tarih"
                              />
                            </Field>
                            <Field label="Rozet 2 — değer">
                              <Input
                                value={slide.floatBadge2?.value ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    floatBadge2: {
                                      label: slide.floatBadge2?.label ?? "",
                                      value: e.target.value,
                                    },
                                  })
                                }
                                placeholder="ör. 12 Haziran 2026"
                              />
                            </Field>
                          </div>
                        </div>

                        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
                          <div className="text-xs font-semibold text-brand-900">
                            Butonlar (bu slayt)
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label="Birincil buton metni">
                              <Input
                                value={slide.primaryButton?.label ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    primaryButton: {
                                      label: e.target.value,
                                      href: slide.primaryButton?.href ?? "",
                                    },
                                  })
                                }
                                placeholder="Boş = ortak buton"
                              />
                            </Field>
                            <Field label="Birincil buton linki">
                              <Input
                                value={slide.primaryButton?.href ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    primaryButton: {
                                      label: slide.primaryButton?.label ?? "",
                                      href: e.target.value,
                                    },
                                  })
                                }
                                placeholder="ör. /haberler/yeni-burs-donemi"
                              />
                            </Field>
                            <Field label="İkincil buton metni">
                              <Input
                                value={slide.secondaryButton?.label ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    secondaryButton: {
                                      label: e.target.value,
                                      href:
                                        slide.secondaryButton?.href ?? "",
                                    },
                                  })
                                }
                                placeholder="Boş = ortak buton"
                              />
                            </Field>
                            <Field label="İkincil buton linki">
                              <Input
                                value={slide.secondaryButton?.href ?? ""}
                                onChange={(e) =>
                                  updateSlide(i, {
                                    secondaryButton: {
                                      label:
                                        slide.secondaryButton?.label ?? "",
                                      href: e.target.value,
                                    },
                                  })
                                }
                                placeholder="ör. /etkinlikler/piknik-2026"
                              />
                            </Field>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Field label="Yüzen rozet 1 — etiket">
          <Input
            value={v.floatBadge1.label}
            onChange={(e) =>
              setV({ ...v, floatBadge1: { ...v.floatBadge1, label: e.target.value } })
            }
          />
        </Field>
        <Field label="Yüzen rozet 1 — değer">
          <Input
            value={v.floatBadge1.value}
            onChange={(e) =>
              setV({ ...v, floatBadge1: { ...v.floatBadge1, value: e.target.value } })
            }
          />
        </Field>
        <Field label="Yüzen rozet 2 — etiket">
          <Input
            value={v.floatBadge2.label}
            onChange={(e) =>
              setV({ ...v, floatBadge2: { ...v.floatBadge2, label: e.target.value } })
            }
          />
        </Field>
        <Field label="Yüzen rozet 2 — değer">
          <Input
            value={v.floatBadge2.value}
            onChange={(e) =>
              setV({ ...v, floatBadge2: { ...v.floatBadge2, value: e.target.value } })
            }
          />
        </Field>
      </div>
    </BlockCard>
  );
}

/* --------------- About Cards Editor (icon/title/text) --------------- */

export function AboutCardListEditor({
  blockKey,
  title,
  description,
}: {
  blockKey: string;
  title: string;
  description?: string;
}) {
  const { pageBlocks, updatePageBlock } = useStore();
  const initial = (pageBlocks[blockKey] as AboutCard[]) ?? [];
  const [v, setV] = useState<AboutCard[]>(initial);
  useEffect(() => setV((pageBlocks[blockKey] as AboutCard[]) ?? []), [pageBlocks[blockKey]]);

  function update(i: number, patch: Partial<AboutCard>) {
    setV((p) => p.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function add() {
    setV((p) => [...p, { icon: "✨", title: "", text: "" }]);
  }
  function remove(i: number) {
    setV((p) => p.filter((_, idx) => idx !== i));
  }

  return (
    <BlockCard
      title={title}
      description={description}
      blockKey={blockKey}
      onSave={() => updatePageBlock(blockKey, v)}
    >
      <div className="space-y-4">
        {v.map((card, i) => (
          <div
            key={i}
            className="rounded-xl border border-border p-4 grid sm:grid-cols-[80px_1fr_auto] gap-3 items-start"
          >
            <Field label="Emoji">
              <Input
                value={card.icon}
                onChange={(e) => update(i, { icon: e.target.value })}
                className="text-center text-xl"
              />
            </Field>
            <div className="grid gap-3">
              <Field label="Başlık">
                <Input
                  value={card.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                />
              </Field>
              <Field label="Metin">
                <Textarea
                  rows={2}
                  value={card.text}
                  onChange={(e) => update(i, { text: e.target.value })}
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="h-9 w-9 rounded-md text-red-600 hover:bg-red-50 inline-flex items-center justify-center mt-7"
              aria-label="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={add}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Kart Ekle
        </Button>
      </div>
    </BlockCard>
  );
}

/* --------------- Home Programs Editor --------------- */

export function HomeProgramsEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const initial = (pageBlocks["home.programs"] as HomeProgramCard[]) ?? [];
  const [v, setV] = useState<HomeProgramCard[]>(initial);
  useEffect(
    () => setV((pageBlocks["home.programs"] as HomeProgramCard[]) ?? []),
    [pageBlocks["home.programs"]],
  );

  function update(i: number, patch: Partial<HomeProgramCard>) {
    setV((p) => p.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function add() {
    setV((p) => [
      ...p,
      { number: "0" + (p.length + 1), title: "", desc: "", tag: "" },
    ]);
  }
  function remove(i: number) {
    setV((p) => p.filter((_, idx) => idx !== i));
  }

  return (
    <BlockCard
      title="Ana Sayfa Programları"
      description="Anasayfada büyük siyah blokta gösterilen 3 program kartı."
      blockKey="home.programs"
      onSave={() => updatePageBlock("home.programs", v)}
    >
      <div className="space-y-4">
        {v.map((p, i) => (
          <div key={i} className="rounded-xl border border-border p-4 grid sm:grid-cols-2 gap-3 relative">
            <Field label="Numara">
              <Input
                value={p.number}
                onChange={(e) => update(i, { number: e.target.value })}
              />
            </Field>
            <Field label="Etiket (sağ alt)">
              <Input
                value={p.tag}
                onChange={(e) => update(i, { tag: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Başlık">
                <Input
                  value={p.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Açıklama">
                <Textarea
                  rows={2}
                  value={p.desc}
                  onChange={(e) => update(i, { desc: e.target.value })}
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-3 right-3 h-8 w-8 rounded-md text-red-600 hover:bg-red-50 inline-flex items-center justify-center"
              aria-label="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={add} leftIcon={<Plus className="h-4 w-4" />}>
          Program Ekle
        </Button>
      </div>
    </BlockCard>
  );
}

/* --------------- Scholarship CTA --------------- */

export function ScholarshipCTAEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const fb: HomeScholarshipCTA = {
    badge: "",
    title: "",
    description: "",
    checks: [],
    calendar: [],
    primaryButton: { label: "", href: "" },
    secondaryButton: { label: "", href: "" },
  };
  const [v, setV] = useState<HomeScholarshipCTA>(
    (pageBlocks["home.scholarship_cta"] as HomeScholarshipCTA) ?? fb,
  );
  useEffect(() => {
    setV((pageBlocks["home.scholarship_cta"] as HomeScholarshipCTA) ?? fb);
  }, [pageBlocks["home.scholarship_cta"]]);

  return (
    <BlockCard
      title="Burs CTA Bloğu"
      description="Ana sayfanın altındaki büyük lacivert burs çağrısı kutusu."
      blockKey="home.scholarship_cta"
      onSave={() => updatePageBlock("home.scholarship_cta", v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Rozet metni">
          <Input value={v.badge} onChange={(e) => setV({ ...v, badge: e.target.value })} />
        </Field>
        <Field label="Başlık">
          <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Açıklama">
            <Textarea
              value={v.description}
              onChange={(e) => setV({ ...v, description: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Özellik maddeleri (her satıra bir madde)">
            <Textarea
              rows={5}
              value={v.checks.join("\n")}
              onChange={(e) =>
                setV({
                  ...v,
                  checks: e.target.value
                    .split(/\r?\n/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Takvim (her satır: 'etiket | tarih')"
            hint="Örnek satır: Başvuru başlangıç | 1 Eylül 2025"
          >
            <Textarea
              rows={5}
              value={v.calendar.map((r) => `${r.label} | ${r.date}`).join("\n")}
              onChange={(e) => {
                const rows: ScholarshipCalendarRow[] = e.target.value
                  .split(/\r?\n/)
                  .map((line) => {
                    const [label, date] = line.split("|").map((s) => s.trim());
                    return { label: label ?? "", date: date ?? "" };
                  })
                  .filter((r) => r.label || r.date);
                setV({ ...v, calendar: rows });
              }}
            />
          </Field>
        </div>

        <Field label="Birincil buton metni">
          <Input
            value={v.primaryButton.label}
            onChange={(e) =>
              setV({ ...v, primaryButton: { ...v.primaryButton, label: e.target.value } })
            }
          />
        </Field>
        <Field label="Birincil buton linki">
          <Input
            value={v.primaryButton.href}
            onChange={(e) =>
              setV({ ...v, primaryButton: { ...v.primaryButton, href: e.target.value } })
            }
          />
        </Field>
        <Field label="İkincil buton metni">
          <Input
            value={v.secondaryButton.label}
            onChange={(e) =>
              setV({ ...v, secondaryButton: { ...v.secondaryButton, label: e.target.value } })
            }
          />
        </Field>
        <Field label="İkincil buton linki">
          <Input
            value={v.secondaryButton.href}
            onChange={(e) =>
              setV({ ...v, secondaryButton: { ...v.secondaryButton, href: e.target.value } })
            }
          />
        </Field>
      </div>
    </BlockCard>
  );
}

/* --------------- Donate CTA (basit) --------------- */

export function DonateCTAEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  type V = { title: string; description: string; buttonLabel: string; buttonHref: string };
  const fb: V = { title: "", description: "", buttonLabel: "", buttonHref: "" };
  const [v, setV] = useState<V>((pageBlocks["home.donate_cta"] as V) ?? fb);
  useEffect(
    () => setV((pageBlocks["home.donate_cta"] as V) ?? fb),
    [pageBlocks["home.donate_cta"]],
  );

  return (
    <BlockCard
      title="Bağış CTA (ana sayfa altı)"
      description="Ana sayfanın en altındaki bağış çağrısı şeridi."
      blockKey="home.donate_cta"
      onSave={() => updatePageBlock("home.donate_cta", v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Başlık">
            <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Açıklama">
            <Textarea
              value={v.description}
              onChange={(e) => setV({ ...v, description: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Buton metni">
          <Input
            value={v.buttonLabel}
            onChange={(e) => setV({ ...v, buttonLabel: e.target.value })}
          />
        </Field>
        <Field label="Buton linki">
          <Input
            value={v.buttonHref}
            onChange={(e) => setV({ ...v, buttonHref: e.target.value })}
          />
        </Field>
      </div>
    </BlockCard>
  );
}

/* --------------- Home SMS Subscribe --------------- */

export function HomeSmsSubscribeEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const fb: HomeSmsSubscribeBlock = {
    eyebrow: "",
    title: "",
    description: "",
    phonePlaceholder: "",
    buttonLabel: "",
    consentLabel: "",
    consentLinkLabel: "",
    successMessage: "",
    alreadyMessage: "",
    invalidMessage: "",
    consentRequiredMessage: "",
  };
  const [v, setV] = useState<HomeSmsSubscribeBlock>(
    (pageBlocks["home.sms_section"] as HomeSmsSubscribeBlock) ?? fb,
  );
  useEffect(
    () => setV((pageBlocks["home.sms_section"] as HomeSmsSubscribeBlock) ?? fb),
    [pageBlocks["home.sms_section"]],
  );

  return (
    <BlockCard
      title="SMS Aboneliği (ana sayfa)"
      description="Ana sayfadaki SMS aboneliği bölümünün başlıkları, KVKK onay metni ve form geri bildirim mesajları. Onay metnindeki '{kvkk}' yer tutucusu KVKK aydınlatma metninin link'iyle değiştirilir."
      blockKey="home.sms_section"
      onSave={() => updatePageBlock("home.sms_section", v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Üst etiket">
          <Input
            value={v.eyebrow}
            onChange={(e) => setV({ ...v, eyebrow: e.target.value })}
          />
        </Field>
        <Field label="Başlık">
          <Input
            value={v.title}
            onChange={(e) => setV({ ...v, title: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Açıklama">
            <Textarea
              value={v.description}
              onChange={(e) => setV({ ...v, description: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Numara placeholder'ı">
          <Input
            value={v.phonePlaceholder}
            onChange={(e) => setV({ ...v, phonePlaceholder: e.target.value })}
          />
        </Field>
        <Field label="Buton metni">
          <Input
            value={v.buttonLabel}
            onChange={(e) => setV({ ...v, buttonLabel: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="KVKK onay metni — '{kvkk}' link metniyle değiştirilir">
            <Input
              value={v.consentLabel}
              onChange={(e) => setV({ ...v, consentLabel: e.target.value })}
            />
          </Field>
        </div>
        <Field label="KVKK link etiketi">
          <Input
            value={v.consentLinkLabel}
            onChange={(e) => setV({ ...v, consentLinkLabel: e.target.value })}
          />
        </Field>
        <Field label="Onay verilmediğinde mesaj">
          <Input
            value={v.consentRequiredMessage}
            onChange={(e) =>
              setV({ ...v, consentRequiredMessage: e.target.value })
            }
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Başarılı abonelik mesajı">
            <Textarea
              rows={2}
              value={v.successMessage}
              onChange={(e) => setV({ ...v, successMessage: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Numara zaten kayıtlı mesajı">
            <Textarea
              rows={2}
              value={v.alreadyMessage}
              onChange={(e) => setV({ ...v, alreadyMessage: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Geçersiz numara mesajı">
            <Textarea
              rows={2}
              value={v.invalidMessage}
              onChange={(e) => setV({ ...v, invalidMessage: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- About Transparency --------------- */

export function AboutTransparencyEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const fb: AboutTransparencyBlock = {
    badge: "",
    title: "",
    description: "",
    bullets: [],
  };
  const [v, setV] = useState<AboutTransparencyBlock>(
    (pageBlocks["about.transparency"] as AboutTransparencyBlock) ?? fb,
  );
  useEffect(
    () => setV((pageBlocks["about.transparency"] as AboutTransparencyBlock) ?? fb),
    [pageBlocks["about.transparency"]],
  );

  return (
    <BlockCard
      title="Hakkımızda Şeffaflık Bloğu"
      description="Hakkımızda sayfasındaki siyah arka planlı şeffaflık bölümü."
      blockKey="about.transparency"
      onSave={() => updatePageBlock("about.transparency", v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Rozet">
          <Input value={v.badge} onChange={(e) => setV({ ...v, badge: e.target.value })} />
        </Field>
        <Field label="Başlık">
          <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Açıklama">
            <Textarea
              value={v.description}
              onChange={(e) => setV({ ...v, description: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Maddeler (her satıra bir madde)">
            <Textarea
              rows={5}
              value={v.bullets.join("\n")}
              onChange={(e) =>
                setV({
                  ...v,
                  bullets: e.target.value
                    .split(/\r?\n/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- Burs Hero --------------- */

export function BurseHeroEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const fb: BurseHero = {
    badge: "",
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
  };
  const [v, setV] = useState<BurseHero>((pageBlocks["burs.hero"] as BurseHero) ?? fb);
  useEffect(
    () => setV((pageBlocks["burs.hero"] as BurseHero) ?? fb),
    [pageBlocks["burs.hero"]],
  );
  return (
    <BlockCard
      title="Burs Sayfası Hero"
      description="Burs sayfasının üst kısmındaki büyük lacivert kutu."
      blockKey="burs.hero"
      onSave={() => updatePageBlock("burs.hero", v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Rozet">
          <Input value={v.badge} onChange={(e) => setV({ ...v, badge: e.target.value })} />
        </Field>
        <Field label="Başlık">
          <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Açıklama">
            <Textarea
              value={v.description}
              onChange={(e) => setV({ ...v, description: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Buton metni">
          <Input
            value={v.buttonLabel}
            onChange={(e) => setV({ ...v, buttonLabel: e.target.value })}
          />
        </Field>
        <Field label="Buton linki">
          <Input
            value={v.buttonHref}
            onChange={(e) => setV({ ...v, buttonHref: e.target.value })}
          />
        </Field>
      </div>
    </BlockCard>
  );
}

/* --------------- Donate Sidebar --------------- */

export function DonateSidebarEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const fb: DonationSidebar = {
    title: "",
    transparencyTitle: "",
    transparencyText: "",
  };
  const [v, setV] = useState<DonationSidebar>(
    (pageBlocks["donate.sidebar"] as DonationSidebar) ?? fb,
  );
  useEffect(
    () => setV((pageBlocks["donate.sidebar"] as DonationSidebar) ?? fb),
    [pageBlocks["donate.sidebar"]],
  );

  return (
    <BlockCard
      title="Bağış Sayfası Yan Panel"
      description="Bağış sayfasının yan tarafındaki kullanım ve şeffaflık metinleri."
      blockKey="donate.sidebar"
      onSave={() => updatePageBlock("donate.sidebar", v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Başlık (Bağışınız nasıl kullanılacak?)">
          <Input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>
        <Field label="Şeffaflık başlığı">
          <Input
            value={v.transparencyTitle}
            onChange={(e) => setV({ ...v, transparencyTitle: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Şeffaflık açıklaması">
            <Textarea
              value={v.transparencyText}
              onChange={(e) => setV({ ...v, transparencyText: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- Page Headers Editor --------------- */

const PAGE_HEADER_LABELS: { key: keyof PageHeadersMap; name: string; hint?: string }[] =
  [
    { key: "hakkimizda", name: "Hakkımızda" },
    { key: "burs", name: "Burs" },
    { key: "burs_basvuru", name: "Burs Başvurusu" },
    { key: "bagis", name: "Bağış" },
    { key: "haberler", name: "Haberler" },
    { key: "etkinlikler", name: "Etkinlikler" },
    { key: "duyurular", name: "Duyurular (Hemşehri İlanları)" },
    { key: "yonetim", name: "Yönetim Kurulu" },
    { key: "iletisim", name: "İletişim" },
    { key: "mali-tablo", name: "Mali Tablo" },
    {
      key: "hesabim",
      name: "Hesabım",
      hint: "Başlıkta '{firstName}' yazarsanız üyenin adı ile değiştirilir.",
    },
  ];

const EMPTY_HEADER: PageHeaderItem = { title: "", description: "" };
const EMPTY_HEADERS: PageHeadersMap = {
  hakkimizda: EMPTY_HEADER,
  burs: EMPTY_HEADER,
  burs_basvuru: EMPTY_HEADER,
  bagis: EMPTY_HEADER,
  haberler: EMPTY_HEADER,
  etkinlikler: EMPTY_HEADER,
  duyurular: EMPTY_HEADER,
  yonetim: EMPTY_HEADER,
  iletisim: EMPTY_HEADER,
  "mali-tablo": EMPTY_HEADER,
  hesabim: EMPTY_HEADER,
};

export function PageHeadersEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const [v, setV] = useState<PageHeadersMap>(
    (pageBlocks["page.headers"] as PageHeadersMap) ?? EMPTY_HEADERS,
  );
  useEffect(() => {
    setV((pageBlocks["page.headers"] as PageHeadersMap) ?? EMPTY_HEADERS);
  }, [pageBlocks["page.headers"]]);

  function update(key: keyof PageHeadersMap, patch: Partial<PageHeaderItem>) {
    setV((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? EMPTY_HEADER), ...patch },
    }));
  }

  return (
    <BlockCard
      title="Sayfa Başlıkları"
      description="Her public sayfanın üst kısmındaki büyük başlık ve açıklama metni."
      blockKey="page.headers"
      onSave={() => updatePageBlock("page.headers", v)}
    >
      <div className="space-y-5">
        {PAGE_HEADER_LABELS.map(({ key, name, hint }) => {
          const item = v[key] ?? EMPTY_HEADER;
          return (
            <div key={key} className="rounded-xl border border-border p-4">
              <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
                {name}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Başlık" hint={hint}>
                  <Input
                    value={item.title}
                    onChange={(e) => update(key, { title: e.target.value })}
                  />
                </Field>
                <Field label="Açıklama">
                  <Input
                    value={item.description}
                    onChange={(e) => update(key, { description: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          );
        })}
      </div>
    </BlockCard>
  );
}

/* --------------- Application Form Editor --------------- */

const APP_STEP_LABELS: {
  key: keyof ApplicationFormText["steps"];
  name: string;
}[] = [
  { key: "personal", name: "Adım 1 — Kişisel Bilgiler" },
  { key: "education", name: "Adım 2 — Eğitim Bilgileri" },
  { key: "family", name: "Adım 3 — Aile Bilgileri" },
  { key: "documents", name: "Adım 4 — Belgeler" },
  { key: "finalize", name: "Adım 5 — Son Adım" },
];

const EMPTY_APP_FORM: ApplicationFormText = {
  steps: {
    personal: { title: "", description: "" },
    education: { title: "", description: "" },
    family: { title: "", description: "" },
    documents: { title: "", description: "" },
    finalize: { title: "", description: "" },
  },
  consentText: "",
  buttons: { prev: "", next: "", submit: "" },
  success: {
    title: "",
    description: "",
    newApplicationButton: "",
    accountButton: "",
  },
};

export function ApplicationFormEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const [v, setV] = useState<ApplicationFormText>(
    (pageBlocks["burs.application_form"] as ApplicationFormText) ??
      EMPTY_APP_FORM,
  );
  useEffect(() => {
    setV(
      (pageBlocks["burs.application_form"] as ApplicationFormText) ??
        EMPTY_APP_FORM,
    );
  }, [pageBlocks["burs.application_form"]]);

  function updateStep(
    key: keyof ApplicationFormText["steps"],
    patch: Partial<PageHeaderItem>,
  ) {
    setV((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        [key]: { ...prev.steps[key], ...patch },
      },
    }));
  }

  return (
    <BlockCard
      title="Burs Başvuru Formu"
      description="5 adımlı başvuru formundaki başlıklar, butonlar, onay metni ve başarı ekranı."
      blockKey="burs.application_form"
      onSave={() => updatePageBlock("burs.application_form", v)}
    >
      <div className="space-y-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Adım Başlıkları
          </div>
          <div className="space-y-3">
            {APP_STEP_LABELS.map(({ key, name }) => {
              const item = v.steps[key];
              return (
                <div key={key} className="rounded-xl border border-border p-4">
                  <div className="text-xs font-medium text-brand-700 mb-3">
                    {name}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Başlık">
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          updateStep(key, { title: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="Açıklama">
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateStep(key, { description: e.target.value })
                        }
                      />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Buton Metinleri
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Geri">
              <Input
                value={v.buttons.prev}
                onChange={(e) =>
                  setV({
                    ...v,
                    buttons: { ...v.buttons, prev: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Devam Et">
              <Input
                value={v.buttons.next}
                onChange={(e) =>
                  setV({
                    ...v,
                    buttons: { ...v.buttons, next: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Gönder">
              <Input
                value={v.buttons.submit}
                onChange={(e) =>
                  setV({
                    ...v,
                    buttons: { ...v.buttons, submit: e.target.value },
                  })
                }
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            KVKK / Onay Metni
          </div>
          <Field
            label="Son adımda gösterilen onay metni"
            hint="Başında 'Onay:' etiketiyle vurgulanır."
          >
            <Textarea
              rows={4}
              value={v.consentText}
              onChange={(e) => setV({ ...v, consentText: e.target.value })}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Başarı Ekranı
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Başlık">
              <Input
                value={v.success.title}
                onChange={(e) =>
                  setV({
                    ...v,
                    success: { ...v.success, title: e.target.value },
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Açıklama">
                <Textarea
                  rows={3}
                  value={v.success.description}
                  onChange={(e) =>
                    setV({
                      ...v,
                      success: { ...v.success, description: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="'Yeni Başvuru' butonu">
              <Input
                value={v.success.newApplicationButton}
                onChange={(e) =>
                  setV({
                    ...v,
                    success: {
                      ...v.success,
                      newApplicationButton: e.target.value,
                    },
                  })
                }
              />
            </Field>
            <Field label="'Hesabıma Git' butonu">
              <Input
                value={v.success.accountButton}
                onChange={(e) =>
                  setV({
                    ...v,
                    success: {
                      ...v.success,
                      accountButton: e.target.value,
                    },
                  })
                }
              />
            </Field>
          </div>
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- Footer Editor --------------- */

/**
 * Bir footer link'ini textarea satırına dönüştürür.
 *
 * Kritik UX detayı: href boşsa otomatik " | " EKLENMEZ. Aksi halde
 * kullanıcı sadece etiket yazarken (henüz |'ye gelmemişken) textarea'ya
 * her tuş başına " | " inject olur ve cursor doğal akışı bozulur.
 */
function serializeFooterLink(l: { label: string; href: string }): string {
  if (!l.label && !l.href) return "";
  if (l.href) return `${l.label} | ${l.href}`;
  return l.label;
}

/**
 * Textarea içeriğini link listesine çevirir. Boş satırlar `{label:'',href:''}`
 * olarak korunur — re-render sırasında kaybolup yazma akışını bozmasınlar.
 * (Eski sürümde burada `.filter(l => l.label || l.href)` vardı; bu yüzden
 * Enter ile yeni satır açıldığı anda satır siliniyor, kullanıcı "yeni
 * öğe eklenmiyor" davranışını görüyordu.) Save sırasında temizlenirler.
 */
function parseFooterLinkLines(text: string): { label: string; href: string }[] {
  return text.split(/\r?\n/).map((line) => {
    const idx = line.indexOf("|");
    const label = (idx === -1 ? line : line.slice(0, idx)).trim();
    const href = (idx === -1 ? "" : line.slice(idx + 1)).trim();
    return { label, href };
  });
}

function cleanFooterLinks(
  links: { label: string; href: string }[],
): { label: string; href: string }[] {
  return links.filter((l) => l.label.trim() || l.href.trim());
}

export function FooterEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const fb: FooterConfig = { groups: [], legalLinks: [], supporters: [] };
  const [v, setV] = useState<FooterConfig>((pageBlocks["footer"] as FooterConfig) ?? fb);
  useEffect(
    () => setV((pageBlocks["footer"] as FooterConfig) ?? fb),
    [pageBlocks["footer"]],
  );

  // v.supporters eski kayıtlarda olmayabilir; her zaman dizi olarak çalış.
  const supporters = v.supporters ?? [];

  function updateGroup(i: number, patch: Partial<FooterLinkGroup>) {
    setV({
      ...v,
      groups: v.groups.map((g, idx) => (idx === i ? { ...g, ...patch } : g)),
    });
  }
  function addGroup() {
    setV({ ...v, groups: [...v.groups, { title: "Yeni Grup", links: [] }] });
  }
  function removeGroup(i: number) {
    setV({ ...v, groups: v.groups.filter((_, idx) => idx !== i) });
  }

  function updateSupporter(
    idx: number,
    patch: Partial<{ name: string; href: string }>,
  ) {
    setV({
      ...v,
      supporters: supporters.map((s, i) =>
        i === idx ? { ...s, ...patch } : s,
      ),
    });
  }
  function addSupporter() {
    setV({ ...v, supporters: [...supporters, { name: "", href: "" }] });
  }
  function removeSupporter(idx: number) {
    setV({ ...v, supporters: supporters.filter((_, i) => i !== idx) });
  }
  function moveSupporter(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= supporters.length) return;
    const next = [...supporters];
    [next[idx], next[target]] = [next[target], next[idx]];
    setV({ ...v, supporters: next });
  }

  return (
    <BlockCard
      title="Site Altı (Footer)"
      description="Footer'daki link grupları ve yasal linkler. Sosyal medya hesapları Site Ayarları'ndan düzenlenir."
      blockKey="footer"
      onSave={() => {
        // Kaydetme anında boş satırları (yazılırken durup kalmış olanlar)
        // ve boş destekçi kayıtlarını temizle. Textarea'larda korumamız
        // gereken boş satır → kalıcı veriye sızmasın.
        const cleaned: FooterConfig = {
          ...v,
          groups: v.groups.map((g) => ({
            ...g,
            links: cleanFooterLinks(g.links),
          })),
          legalLinks: cleanFooterLinks(v.legalLinks),
          supporters: (v.supporters ?? []).filter(
            (s) => s.name.trim() || s.href.trim(),
          ),
        };
        updatePageBlock("footer", cleaned);
      }}
    >
      <div className="space-y-4">
        {v.groups.map((g, gi) => (
          <div key={gi} className="rounded-xl border border-border p-4 relative">
            <Field label="Grup başlığı">
              <Input
                value={g.title}
                onChange={(e) => updateGroup(gi, { title: e.target.value })}
              />
            </Field>
            <Field
              label="Linkler (her satır: 'metin | href')"
              hint="Örnek: Hakkımızda | /hakkimizda. Yeni satır eklemek için Enter'a basın; boş satırlar kaydetme sırasında otomatik temizlenir."
            >
              <Textarea
                rows={5}
                value={g.links.map(serializeFooterLink).join("\n")}
                onChange={(e) =>
                  updateGroup(gi, {
                    links: parseFooterLinkLines(e.target.value),
                  })
                }
              />
            </Field>
            <button
              type="button"
              onClick={() => removeGroup(gi)}
              className="absolute top-3 right-3 h-8 w-8 rounded-md text-red-600 hover:bg-red-50 inline-flex items-center justify-center"
              aria-label="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={addGroup}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Grup Ekle
        </Button>
        <div className="border-t border-border pt-4 mt-4">
          <Field
            label="Yasal linkler (her satır: 'metin | href')"
            hint="Footer'ın altındaki Gizlilik / KVKK / Çerez linkleri. Yeni satır için Enter'a basın; kaydederken boş satırlar otomatik temizlenir."
          >
            <Textarea
              rows={4}
              value={v.legalLinks.map(serializeFooterLink).join("\n")}
              onChange={(e) =>
                setV({
                  ...v,
                  legalLinks: parseFooterLinkLines(e.target.value),
                })
              }
            />
          </Field>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">
                Destekçiler / Site Sponsorları
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sitenin EN ALTINDA — copyright satırının altında — küçük bir
                şerit halinde listelenen kuruluş/sponsor bağlantıları. Hiç
                destekçi eklenmezse şerit hiç gösterilmez. Bağlantı dış link
                (https://...) veya site içi yol (/yonetim) olabilir.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={addSupporter}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Destekçi Ekle
            </Button>
          </div>

          <div className="mb-4">
            <Field
              label="Şerit başlığı"
              hint="Boş bırakırsanız başlık hiç gösterilmez. 'Destekçilerimiz' yerine 'Site Sponsoru', 'İş Ortaklarımız' gibi alternatif yazabilirsiniz."
            >
              <Input
                value={v.supportersTitle ?? "Destekçilerimiz"}
                onChange={(e) =>
                  setV({ ...v, supportersTitle: e.target.value })
                }
                placeholder="Boş bırakılırsa başlık gizlenir"
              />
            </Field>
          </div>

          {supporters.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
              Henüz destekçi eklenmedi.
            </div>
          ) : (
            <ul className="space-y-2">
              {supporters.map((s, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-border bg-white p-3"
                >
                  <div className="flex items-stretch gap-2">
                    <div className="flex flex-col items-center justify-between gap-1 shrink-0 pt-1">
                      <button
                        type="button"
                        onClick={() => moveSupporter(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Yukarı taşı"
                        className="h-6 w-6 inline-flex items-center justify-center rounded text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => moveSupporter(idx, 1)}
                        disabled={idx === supporters.length - 1}
                        aria-label="Aşağı taşı"
                        className="h-6 w-6 inline-flex items-center justify-center rounded text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 grid sm:grid-cols-[1fr_1.4fr] gap-2 min-w-0">
                      <Input
                        placeholder="Şirket adı (örn. ABC Yazılım)"
                        value={s.name}
                        onChange={(e) =>
                          updateSupporter(idx, { name: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Bağlantı (https://www.abc.com)"
                        value={s.href}
                        onChange={(e) =>
                          updateSupporter(idx, { href: e.target.value })
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSupporter(idx)}
                      aria-label="Sil"
                      className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50 self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- Auth (Giriş / Kayıt) Editor --------------- */

export function AuthUiTextEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const [v, setV] = useState<AuthUiText>(
    (pageBlocks["ui.auth"] as AuthUiText | undefined) ?? DEFAULT_AUTH_UI,
  );
  useEffect(() => {
    setV(
      (pageBlocks["ui.auth"] as AuthUiText | undefined) ?? DEFAULT_AUTH_UI,
    );
  }, [pageBlocks["ui.auth"]]);

  return (
    <BlockCard
      title="Giriş & Üyelik"
      description="Giriş, kayıt sayfaları ve sağ taraftaki tanıtım panelinde görünen tüm metinler. Demo hesap bölümü üretimde mutlaka kapatılmalıdır."
      blockKey="ui.auth"
      onSave={() => updatePageBlock("ui.auth", v)}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Giriş Sayfası
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Başlık">
              <Input
                value={v.login.title}
                onChange={(e) =>
                  setV({ ...v, login: { ...v.login, title: e.target.value } })
                }
              />
            </Field>
            <Field label="Buton (Gönder)">
              <Input
                value={v.login.submitButton}
                onChange={(e) =>
                  setV({
                    ...v,
                    login: { ...v.login, submitButton: e.target.value },
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Açıklama">
                <Textarea
                  rows={2}
                  value={v.login.description}
                  onChange={(e) =>
                    setV({
                      ...v,
                      login: { ...v.login, description: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="'Hesabınız yok mu?' metni">
              <Input
                value={v.login.registerPrompt}
                onChange={(e) =>
                  setV({
                    ...v,
                    login: { ...v.login, registerPrompt: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Kayıt linki etiketi">
              <Input
                value={v.login.registerLink}
                onChange={(e) =>
                  setV({
                    ...v,
                    login: { ...v.login, registerLink: e.target.value },
                  })
                }
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Üye Olma Sayfası
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Başlık">
              <Input
                value={v.register.title}
                onChange={(e) =>
                  setV({
                    ...v,
                    register: { ...v.register, title: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Buton (Gönder)">
              <Input
                value={v.register.submitButton}
                onChange={(e) =>
                  setV({
                    ...v,
                    register: { ...v.register, submitButton: e.target.value },
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Açıklama">
                <Textarea
                  rows={2}
                  value={v.register.description}
                  onChange={(e) =>
                    setV({
                      ...v,
                      register: { ...v.register, description: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <Field label="'Zaten hesabınız var mı?' metni">
              <Input
                value={v.register.loginPrompt}
                onChange={(e) =>
                  setV({
                    ...v,
                    register: { ...v.register, loginPrompt: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Giriş linki etiketi">
              <Input
                value={v.register.loginLink}
                onChange={(e) =>
                  setV({
                    ...v,
                    register: { ...v.register, loginLink: e.target.value },
                  })
                }
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Sağ Taraf Tanıtım Paneli
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Üst etiket" hint="Örn: 'Üye Topluluğumuz'">
              <Input
                value={v.sidePanel.label}
                onChange={(e) =>
                  setV({
                    ...v,
                    sidePanel: { ...v.sidePanel, label: e.target.value },
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Ana Başlık">
                <Textarea
                  rows={2}
                  value={v.sidePanel.headline}
                  onChange={(e) =>
                    setV({
                      ...v,
                      sidePanel: { ...v.sidePanel, headline: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Açıklama">
                <Textarea
                  rows={3}
                  value={v.sidePanel.description}
                  onChange={(e) =>
                    setV({
                      ...v,
                      sidePanel: {
                        ...v.sidePanel,
                        description: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Arka Plan Görseli"
                hint="Yatay (geniş) görsel önerilir. Boş bırakılırsa sadece marka rengi gösterilir."
              >
                <UploadInput
                  kind="image"
                  value={v.sidePanel.imageUrl}
                  onChange={(url) =>
                    setV({
                      ...v,
                      sidePanel: { ...v.sidePanel, imageUrl: url },
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4">
          <div className="text-xs uppercase tracking-wider text-amber-800 mb-3 font-semibold">
            Demo Hesapları
          </div>
          <p className="text-xs text-amber-900 mb-3">
            <strong>Güvenlik uyarısı:</strong> Üretim ortamında bu bölümü
            kapatın. Kapalıyken giriş sayfasında demo hesap kutusu hiç
            gösterilmez.
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={v.showDemoAccounts}
                onChange={(e) =>
                  setV({ ...v, showDemoAccounts: e.target.checked })
                }
                className="h-4 w-4 rounded border-amber-400"
              />
              Demo hesap bölümünü göster
            </label>
            <Field label="Bölüm başlığı">
              <Input
                value={v.demoAccountsTitle}
                onChange={(e) =>
                  setV({ ...v, demoAccountsTitle: e.target.value })
                }
                disabled={!v.showDemoAccounts}
              />
            </Field>
            <Field
              label="Hesap satırları (her satır bir hesap)"
              hint="Format: 'Etiket | e-posta / parola'  ·  Örn: 'Yönetici | admin@example.com / sifre123'"
            >
              <Textarea
                rows={4}
                value={v.demoAccountsLines.join("\n")}
                onChange={(e) =>
                  setV({
                    ...v,
                    demoAccountsLines: e.target.value
                      .split(/\r?\n/)
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                disabled={!v.showDemoAccounts}
              />
            </Field>
          </div>
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- Genel UI Metinleri Editor --------------- */

/** Küçük yardımcı: gruplama kutusu (akordeon stili). */
function UiGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
        {title}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

export function CommonUiTextEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const initial =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const [v, setV] = useState<CommonUiText>(initial);
  useEffect(() => {
    setV(
      (pageBlocks["ui.common"] as CommonUiText | undefined) ??
        DEFAULT_COMMON_UI,
    );
  }, [pageBlocks["ui.common"]]);

  const set = <K extends keyof CommonUiText>(
    key: K,
    patch: Partial<CommonUiText[K]>,
  ) => {
    setV((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as object), ...patch },
    }));
  };

  return (
    <BlockCard
      title="Genel UI Metinleri"
      description="Filtre etiketleri, boş durum mesajları, butonlar ve toast başlıkları gibi public sayfalardaki kısa UI metinlerini buradan yönetin."
      blockKey="ui.common"
      onSave={() => updatePageBlock("ui.common", v)}
    >
      <div className="space-y-5">
        <UiGroup title="Genel">
          <Field label="Yükleniyor metni">
            <Input
              value={v.loadingText}
              onChange={(e) => setV({ ...v, loadingText: e.target.value })}
            />
          </Field>
          <Field label='Filtre "Tümü" etiketi'>
            <Input
              value={v.filters.allLabel}
              onChange={(e) => set("filters", { allLabel: e.target.value })}
            />
          </Field>
        </UiGroup>

        <UiGroup title="Haberler — Liste">
          <Field label="Arama placeholder">
            <Input
              value={v.newsList.searchPlaceholder}
              onChange={(e) =>
                set("newsList", { searchPlaceholder: e.target.value })
              }
            />
          </Field>
          <Field label="Boş sonuç metni">
            <Input
              value={v.newsList.emptyState}
              onChange={(e) =>
                set("newsList", { emptyState: e.target.value })
              }
            />
          </Field>
        </UiGroup>

        <UiGroup title="Haber Detay">
          <Field label="Geri dön linki">
            <Input
              value={v.newsDetail.backLink}
              onChange={(e) =>
                set("newsDetail", { backLink: e.target.value })
              }
            />
          </Field>
          <Field label="Yan kolon başlığı">
            <Input
              value={v.newsDetail.sidebarTitle}
              onChange={(e) =>
                set("newsDetail", { sidebarTitle: e.target.value })
              }
            />
          </Field>
        </UiGroup>

        <UiGroup title="Etkinlik Kartı">
          <Field label="Kayıt butonu">
            <Input
              value={v.events.bookButton}
              onChange={(e) => set("events", { bookButton: e.target.value })}
            />
          </Field>
          <Field label="Ücret notu">
            <Input
              value={v.events.freeNote}
              onChange={(e) => set("events", { freeNote: e.target.value })}
            />
          </Field>
          <Field label="Kayıt başarılı toast başlığı">
            <Input
              value={v.events.bookSuccessTitle}
              onChange={(e) =>
                set("events", { bookSuccessTitle: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Kayıt başarılı toast açıklaması">
              <Textarea
                rows={2}
                value={v.events.bookSuccessMessage}
                onChange={(e) =>
                  set("events", { bookSuccessMessage: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Üye girişi gerekli toast başlığı">
            <Input
              value={v.events.loginRequiredTitle}
              onChange={(e) =>
                set("events", { loginRequiredTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Kontenjan doldu butonu">
            <Input
              value={v.events.fullButton}
              onChange={(e) =>
                set("events", { fullButton: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Üye girişi gerekli toast açıklaması">
              <Textarea
                rows={2}
                value={v.events.loginRequiredMessage}
                onChange={(e) =>
                  set("events", { loginRequiredMessage: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Kaydı iptal et butonu">
            <Input
              value={v.events.cancelButton}
              onChange={(e) =>
                set("events", { cancelButton: e.target.value })
              }
            />
          </Field>
          <Field label="Kayıt iptal toast başlığı">
            <Input
              value={v.events.cancelSuccessTitle}
              onChange={(e) =>
                set("events", { cancelSuccessTitle: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Kayıt iptal toast açıklaması">
              <Textarea
                rows={2}
                value={v.events.cancelSuccessMessage}
                onChange={(e) =>
                  set("events", { cancelSuccessMessage: e.target.value })
                }
              />
            </Field>
          </div>
        </UiGroup>

        <UiGroup title="Hesabım">
          <Field label="Yönetici rol etiketi">
            <Input
              value={v.account.roleAdminLabel}
              onChange={(e) =>
                set("account", { roleAdminLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Üye rol etiketi">
            <Input
              value={v.account.roleMemberLabel}
              onChange={(e) =>
                set("account", { roleMemberLabel: e.target.value })
              }
            />
          </Field>
          <Field label='"Üyelik:" etiketi'>
            <Input
              value={v.account.membershipLabel}
              onChange={(e) =>
                set("account", { membershipLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Yönetim Paneli butonu">
            <Input
              value={v.account.adminPanelButton}
              onChange={(e) =>
                set("account", { adminPanelButton: e.target.value })
              }
            />
          </Field>
          <Field label="Çıkış Yap butonu">
            <Input
              value={v.account.logoutButton}
              onChange={(e) =>
                set("account", { logoutButton: e.target.value })
              }
            />
          </Field>
          <Field label="Burs Başvurularım başlığı">
            <Input
              value={v.account.applicationsTitle}
              onChange={(e) =>
                set("account", { applicationsTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Yeni Başvuru butonu">
            <Input
              value={v.account.newApplicationButton}
              onChange={(e) =>
                set("account", { newApplicationButton: e.target.value })
              }
            />
          </Field>
          <Field label="Boş başvuru başlığı">
            <Input
              value={v.account.emptyTitle}
              onChange={(e) =>
                set("account", { emptyTitle: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Boş başvuru açıklaması">
              <Textarea
                rows={2}
                value={v.account.emptyDescription}
                onChange={(e) =>
                  set("account", { emptyDescription: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label='"Başvuruyu Başlat" butonu'>
            <Input
              value={v.account.startApplicationButton}
              onChange={(e) =>
                set("account", { startApplicationButton: e.target.value })
              }
            />
          </Field>
          <Field label="Komisyon notu etiketi">
            <Input
              value={v.account.reviewerNoteLabel}
              onChange={(e) =>
                set("account", { reviewerNoteLabel: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Profil ipucu başlığı">
              <Input
                value={v.account.profileTipTitle}
                onChange={(e) =>
                  set("account", { profileTipTitle: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Profil ipucu açıklaması">
              <Textarea
                rows={2}
                value={v.account.profileTipDescription}
                onChange={(e) =>
                  set("account", { profileTipDescription: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Profil ipucu küçük not"
              hint="Boş bırakılırsa hiç gösterilmez. Üretimde kaldırmak isteyebilirsiniz."
            >
              <Input
                value={v.account.profileTipNote}
                onChange={(e) =>
                  set("account", { profileTipNote: e.target.value })
                }
              />
            </Field>
          </div>
        </UiGroup>

        <UiGroup title="Bağış Sayfası">
          <Field label='"Tutar Seçin" rozet metni'>
            <Input
              value={v.donation.presetBadge}
              onChange={(e) =>
                set("donation", { presetBadge: e.target.value })
              }
            />
          </Field>
          <Field label="Tutar seçim başlığı">
            <Input
              value={v.donation.presetTitle}
              onChange={(e) =>
                set("donation", { presetTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Özel tutar etiketi">
            <Input
              value={v.donation.customAmountLabel}
              onChange={(e) =>
                set("donation", { customAmountLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Özel tutar placeholder">
            <Input
              value={v.donation.customAmountPlaceholder}
              onChange={(e) =>
                set("donation", { customAmountPlaceholder: e.target.value })
              }
            />
          </Field>
          <Field label="Banka bilgileri başlığı">
            <Input
              value={v.donation.bankInfoTitle}
              onChange={(e) =>
                set("donation", { bankInfoTitle: e.target.value })
              }
            />
          </Field>
          <Field label='"Bağış tutarı" özet etiketi'>
            <Input
              value={v.donation.summaryLabel}
              onChange={(e) =>
                set("donation", { summaryLabel: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Banka altı not">
              <Textarea
                rows={2}
                value={v.donation.bankNote}
                onChange={(e) =>
                  set("donation", { bankNote: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Bağış Yap butonu">
            <Input
              value={v.donation.submitButton}
              onChange={(e) =>
                set("donation", { submitButton: e.target.value })
              }
            />
          </Field>
          <Field label="Online ödeme toast başlığı">
            <Input
              value={v.donation.submitToastTitle}
              onChange={(e) =>
                set("donation", { submitToastTitle: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Online ödeme toast açıklaması">
              <Textarea
                rows={2}
                value={v.donation.submitToastMessage}
                onChange={(e) =>
                  set("donation", { submitToastMessage: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="IBAN kopyalandı toast'ı">
            <Input
              value={v.donation.copyToastTitle}
              onChange={(e) =>
                set("donation", { copyToastTitle: e.target.value })
              }
            />
          </Field>
          <Field label="IBAN kopyalanamadı toast'ı">
            <Input
              value={v.donation.copyToastError}
              onChange={(e) =>
                set("donation", { copyToastError: e.target.value })
              }
            />
          </Field>
        </UiGroup>

        <UiGroup title="İletişim Sayfası">
          <Field label="Form başlığı">
            <Input
              value={v.contact.formTitle}
              onChange={(e) =>
                set("contact", { formTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Gönder butonu">
            <Input
              value={v.contact.submitButton}
              onChange={(e) =>
                set("contact", { submitButton: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Form açıklaması">
              <Textarea
                rows={2}
                value={v.contact.formDescription}
                onChange={(e) =>
                  set("contact", { formDescription: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="KVKK alt notu">
              <Textarea
                rows={2}
                value={v.contact.kvkkNote}
                onChange={(e) =>
                  set("contact", { kvkkNote: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Başarılı gönderim toast başlığı">
            <Input
              value={v.contact.successTitle}
              onChange={(e) =>
                set("contact", { successTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Başarılı gönderim toast açıklaması">
            <Input
              value={v.contact.successDescription}
              onChange={(e) =>
                set("contact", { successDescription: e.target.value })
              }
            />
          </Field>
          <Field label="Yan panel başlığı">
            <Input
              value={v.contact.sidebarTitle}
              onChange={(e) =>
                set("contact", { sidebarTitle: e.target.value })
              }
            />
          </Field>
        </UiGroup>

        <UiGroup title="404 (Sayfa Bulunamadı)">
          <Field label="Başlık">
            <Input
              value={v.notFound.title}
              onChange={(e) =>
                set("notFound", { title: e.target.value })
              }
            />
          </Field>
          <Field label="Anasayfa butonu">
            <Input
              value={v.notFound.homeButton}
              onChange={(e) =>
                set("notFound", { homeButton: e.target.value })
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Açıklama">
              <Textarea
                rows={3}
                value={v.notFound.description}
                onChange={(e) =>
                  set("notFound", { description: e.target.value })
                }
              />
            </Field>
          </div>
        </UiGroup>

        <UiGroup title="Header — Butonlar & Hesap Menüsü">
          <Field label="Giriş Yap butonu">
            <Input
              value={v.header.loginButton}
              onChange={(e) =>
                set("header", { loginButton: e.target.value })
              }
            />
          </Field>
          <Field label="Üye Ol butonu">
            <Input
              value={v.header.registerButton}
              onChange={(e) =>
                set("header", { registerButton: e.target.value })
              }
            />
          </Field>
          <Field label="Hesap menüsü — Hesabım">
            <Input
              value={v.header.accountMenuTitle}
              onChange={(e) =>
                set("header", { accountMenuTitle: e.target.value })
              }
            />
          </Field>
          <Field label="Hesap menüsü — Burs Başvurum">
            <Input
              value={v.header.accountMenuApplication}
              onChange={(e) =>
                set("header", { accountMenuApplication: e.target.value })
              }
            />
          </Field>
          <Field label="Hesap menüsü — Yönetim Paneli">
            <Input
              value={v.header.accountMenuAdmin}
              onChange={(e) =>
                set("header", { accountMenuAdmin: e.target.value })
              }
            />
          </Field>
          <Field label="Hesap menüsü — Çıkış Yap">
            <Input
              value={v.header.accountMenuLogout}
              onChange={(e) =>
                set("header", { accountMenuLogout: e.target.value })
              }
            />
          </Field>
          <Field label="Mobil — Burs Başvurusu butonu">
            <Input
              value={v.header.mobileApplyButton}
              onChange={(e) =>
                set("header", { mobileApplyButton: e.target.value })
              }
            />
          </Field>
          <Field label="Mobil menü açma erişilebilirlik etiketi">
            <Input
              value={v.header.menuLabel}
              onChange={(e) =>
                set("header", { menuLabel: e.target.value })
              }
            />
          </Field>
        </UiGroup>
      </div>
    </BlockCard>
  );
}

/* --------------- Header (Üst Menü) Editor --------------- */

export function HeaderEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const initial =
    (pageBlocks["header.config"] as HeaderConfig | undefined) ??
    DEFAULT_HEADER_CONFIG;
  const [v, setV] = useState<HeaderConfig>(initial);
  useEffect(() => {
    setV(
      (pageBlocks["header.config"] as HeaderConfig | undefined) ??
        DEFAULT_HEADER_CONFIG,
    );
  }, [pageBlocks["header.config"]]);

  /**
   * Hangi parent menü item'ın alt menü düzenleyicisi açık.
   * `null` → hiçbir submenu paneli açık değil.
   */
  const [openSubmenuIdx, setOpenSubmenuIdx] = useState<number | null>(null);

  const updateMenuItem = (
    idx: number,
    patch: Partial<HeaderMenuItem>,
  ) => {
    setV({
      ...v,
      menu: v.menu.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    });
  };

  const moveMenuItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= v.menu.length) return;
    const next = [...v.menu];
    [next[idx], next[target]] = [next[target], next[idx]];
    setV({ ...v, menu: next });
    if (openSubmenuIdx === idx) setOpenSubmenuIdx(target);
    else if (openSubmenuIdx === target) setOpenSubmenuIdx(idx);
  };

  const removeMenuItem = (idx: number) => {
    setV({ ...v, menu: v.menu.filter((_, i) => i !== idx) });
    if (openSubmenuIdx === idx) setOpenSubmenuIdx(null);
  };

  const addMenuItem = () => {
    setV({
      ...v,
      menu: [...v.menu, { label: "Yeni Öğe", href: "/", enabled: true }],
    });
  };

  // ----- Alt menü (children) yardımcıları -----

  const getChildren = (idx: number) => v.menu[idx]?.children ?? [];

  const updateChild = (
    parentIdx: number,
    childIdx: number,
    patch: Partial<{ label: string; href: string; enabled: boolean }>,
  ) => {
    const children = [...getChildren(parentIdx)];
    children[childIdx] = { ...children[childIdx], ...patch };
    updateMenuItem(parentIdx, { children });
  };

  const moveChild = (parentIdx: number, childIdx: number, dir: -1 | 1) => {
    const children = [...getChildren(parentIdx)];
    const target = childIdx + dir;
    if (target < 0 || target >= children.length) return;
    [children[childIdx], children[target]] = [children[target], children[childIdx]];
    updateMenuItem(parentIdx, { children });
  };

  const removeChild = (parentIdx: number, childIdx: number) => {
    const children = getChildren(parentIdx).filter((_, i) => i !== childIdx);
    updateMenuItem(parentIdx, { children });
  };

  const addChild = (parentIdx: number) => {
    const children = [
      ...getChildren(parentIdx),
      { label: "Yeni Alt Öğe", href: "/", enabled: true },
    ];
    updateMenuItem(parentIdx, { children });
  };

  return (
    <BlockCard
      title="Header (Üst Menü)"
      description="Sayfanın en üstündeki menü bağlantıları, üst bar admin linki ve sağdaki sarı CTA butonu. Buton metinlerini 'Genel UI → Header' bölümünden düzenleyebilirsiniz."
      blockKey="header.config"
      onSave={() => updatePageBlock("header.config", v)}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Üst Bar (Telefon/Email çubuğu)
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Yönetim Paneli linkini göster"
              hint="Kapalıyken üst bar sağındaki link gizlenir."
            >
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={v.topBar.showAdminLink}
                  onChange={(e) =>
                    setV({
                      ...v,
                      topBar: {
                        ...v.topBar,
                        showAdminLink: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Aktif</span>
              </label>
            </Field>
            <Field label="Yönetim Paneli link metni">
              <Input
                value={v.topBar.adminLinkLabel}
                onChange={(e) =>
                  setV({
                    ...v,
                    topBar: { ...v.topBar, adminLinkLabel: e.target.value },
                  })
                }
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold-600 font-semibold">
                Ana Menü
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Menüde gösterilecek bağlantılar. <strong>Aktif</strong> kapalıysa
                öğe menüden tamamen gizlenir (silinmez). Sıralamayı yukarı/aşağı
                oklarıyla değiştirebilirsiniz.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={addMenuItem}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Yeni Öğe
            </Button>
          </div>

          {/*
            Menü kalabalık uyarısı.
            Admin panelinden 9'dan fazla aktif ana menü öğesi olduğunda
            laptop ekranlarında (1366px civarı) header sığmaya başlar ve
            site otomatik olarak hamburger moduna geçer. Bu uyarı, admin'in
            farkında olmasını sağlar — istemiyorsa öğeleri alt menülere
            taşıma seçeneği önerir. Yalnızca aktif öğeler sayılır.
          */}
          {v.menu.filter((m) => m.enabled !== false).length > 9 && (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-xs text-amber-900 leading-relaxed">
              <strong>Bilgi:</strong> Şu an{" "}
              <strong>
                {v.menu.filter((m) => m.enabled !== false).length} aktif
              </strong>{" "}
              ana menü öğeniz var. 9+ öğe küçük dizüstü ekranlarda header'a
              sığmaz; site otomatik olarak hamburger menüye geçer. Tam menünün
              tüm ekranlarda görünmesi için bazı öğeleri (örn.{" "}
              <em>Bağış</em>, <em>Mali Tablo</em>) bir üst öğenin{" "}
              <strong>alt menüsüne</strong> taşımanızı öneririz — aşağıda her
              satırın <em>"Alt Menüler"</em> bölümünden ekleyebilirsiniz.
            </div>
          )}

          {v.menu.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
              Henüz menü öğesi yok. "Yeni Öğe" butonuyla ekleyin.
            </div>
          ) : (
            <ul className="space-y-2">
              {v.menu.map((item, idx) => {
                const enabled = item.enabled !== false;
                return (
                  <li
                    key={idx}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      enabled
                        ? "border-border bg-white"
                        : "border-border/60 bg-muted/40",
                    )}
                  >
                    <div className="flex items-stretch gap-2">
                      {/* Sıra göstergesi + taşıma okları */}
                      <div className="flex flex-col items-center justify-between gap-1 shrink-0 pt-1">
                        <button
                          type="button"
                          onClick={() => moveMenuItem(idx, -1)}
                          disabled={idx === 0}
                          aria-label="Yukarı taşı"
                          className="h-6 w-6 inline-flex items-center justify-center rounded text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveMenuItem(idx, 1)}
                          disabled={idx === v.menu.length - 1}
                          aria-label="Aşağı taşı"
                          className="h-6 w-6 inline-flex items-center justify-center rounded text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Aktif checkbox */}
                      <label
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 px-2 cursor-pointer shrink-0 rounded border text-center min-w-[64px]",
                          enabled
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-border bg-muted text-muted-foreground",
                        )}
                        title={enabled ? "Aktif — menüde gösteriliyor" : "Pasif — menüden gizli"}
                      >
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) =>
                            updateMenuItem(idx, { enabled: e.target.checked })
                          }
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {enabled ? "Aktif" : "Pasif"}
                        </span>
                      </label>

                      {/* Etiket + href */}
                      <div className="flex-1 grid sm:grid-cols-[1fr_1.4fr] gap-2 min-w-0">
                        <Input
                          placeholder="Etiket (örn. Burs)"
                          value={item.label}
                          onChange={(e) =>
                            updateMenuItem(idx, { label: e.target.value })
                          }
                          className={cn(!enabled && "opacity-60")}
                        />
                        <Input
                          placeholder="Bağlantı (örn. /burs)"
                          value={item.href}
                          onChange={(e) =>
                            updateMenuItem(idx, { href: e.target.value })
                          }
                          className={cn("font-mono text-xs", !enabled && "opacity-60")}
                        />
                      </div>

                      {/* Sil butonu */}
                      <button
                        type="button"
                        onClick={() => removeMenuItem(idx)}
                        aria-label="Sil"
                        className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md border border-border text-red-600 hover:bg-red-50 self-start"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Alt menü düzenleyicisi: aç/kapa toggle + liste */}
                    {(() => {
                      const subOpen = openSubmenuIdx === idx;
                      const children = item.children ?? [];
                      const childCount = children.length;
                      return (
                        <div className="mt-2 ml-12 pl-4 border-l-2 border-dashed border-border/70">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenSubmenuIdx(subOpen ? null : idx)
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 hover:text-brand-900 py-1"
                          >
                            {subOpen ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                            Alt menü{" "}
                            <span className="text-muted-foreground font-normal">
                              ({childCount})
                            </span>
                          </button>

                          {subOpen && (
                            <div className="pt-2 pb-1 space-y-2">
                              {childCount === 0 ? (
                                <div className="text-xs text-muted-foreground py-2 px-3 rounded-md bg-muted/40">
                                  Alt menü öğesi yok. Üzerine gelince dropdown
                                  açılması için en az bir alt öğe ekleyin.
                                </div>
                              ) : (
                                <ul className="space-y-1.5">
                                  {children.map((child, ci) => {
                                    const cEnabled = child.enabled !== false;
                                    return (
                                      <li
                                        key={ci}
                                        className={cn(
                                          "rounded-md border p-2 transition-colors",
                                          cEnabled
                                            ? "border-border bg-white"
                                            : "border-border/60 bg-muted/40",
                                        )}
                                      >
                                        <div className="flex items-stretch gap-1.5">
                                          <div className="flex flex-col items-center justify-between gap-0.5 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                moveChild(idx, ci, -1)
                                              }
                                              disabled={ci === 0}
                                              aria-label="Yukarı taşı"
                                              className="h-5 w-5 inline-flex items-center justify-center rounded text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                              <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                moveChild(idx, ci, 1)
                                              }
                                              disabled={ci === childCount - 1}
                                              aria-label="Aşağı taşı"
                                              className="h-5 w-5 inline-flex items-center justify-center rounded text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                              <ArrowDown className="h-3 w-3" />
                                            </button>
                                          </div>

                                          <label
                                            className={cn(
                                              "flex items-center gap-1 px-1.5 cursor-pointer shrink-0 rounded border text-center min-w-[52px]",
                                              cEnabled
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                : "border-border bg-muted text-muted-foreground",
                                            )}
                                            title={
                                              cEnabled
                                                ? "Aktif — alt menüde gösteriliyor"
                                                : "Pasif — gizli"
                                            }
                                          >
                                            <input
                                              type="checkbox"
                                              checked={cEnabled}
                                              onChange={(e) =>
                                                updateChild(idx, ci, {
                                                  enabled: e.target.checked,
                                                })
                                              }
                                              className="h-3.5 w-3.5 accent-emerald-600"
                                            />
                                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                                              {cEnabled ? "Aktif" : "Pasif"}
                                            </span>
                                          </label>

                                          <div className="flex-1 grid sm:grid-cols-[1fr_1.4fr] gap-1.5 min-w-0">
                                            <Input
                                              placeholder="Etiket"
                                              value={child.label}
                                              onChange={(e) =>
                                                updateChild(idx, ci, {
                                                  label: e.target.value,
                                                })
                                              }
                                              className={cn(
                                                "h-8 text-sm",
                                                !cEnabled && "opacity-60",
                                              )}
                                            />
                                            <Input
                                              placeholder="Bağlantı"
                                              value={child.href}
                                              onChange={(e) =>
                                                updateChild(idx, ci, {
                                                  href: e.target.value,
                                                })
                                              }
                                              className={cn(
                                                "h-8 font-mono text-xs",
                                                !cEnabled && "opacity-60",
                                              )}
                                            />
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => removeChild(idx, ci)}
                                            aria-label="Alt öğeyi sil"
                                            className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded border border-border text-red-600 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addChild(idx)}
                                leftIcon={<Plus className="h-3.5 w-3.5" />}
                              >
                                Alt Öğe Ekle
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="text-xs uppercase tracking-wider text-gold-600 mb-3 font-semibold">
            Sağdaki Sarı CTA Butonu
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="CTA butonunu göster"
              hint="Kapalıyken sağdaki sarı buton gizlenir."
            >
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={v.ctaButton.visible}
                  onChange={(e) =>
                    setV({
                      ...v,
                      ctaButton: {
                        ...v.ctaButton,
                        visible: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Aktif</span>
              </label>
            </Field>
            <Field label="Buton metni (masaüstü)">
              <Input
                value={v.ctaButton.label}
                onChange={(e) =>
                  setV({
                    ...v,
                    ctaButton: { ...v.ctaButton, label: e.target.value },
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Buton hedef linki">
                <Input
                  value={v.ctaButton.href}
                  onChange={(e) =>
                    setV({
                      ...v,
                      ctaButton: { ...v.ctaButton, href: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </BlockCard>
  );
}


/* --------------- Sponsorlar (Anasayfa) Editor --------------- */

const SPONSORS_FALLBACK: HomeSponsorsBlock = {
  eyebrow: "Destekçilerimiz",
  title: "Sponsorlarımız",
  description: "Değerli iş ortaklarımıza teşekkür ederiz",
  cta: {
    visible: true,
    label: "Sponsor Olmak İstiyorum",
    href: "/iletisim",
  },
};

export function HomeSponsorsEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const [v, setV] = useState<HomeSponsorsBlock>(
    (pageBlocks["home.sponsors_section"] as HomeSponsorsBlock) ??
      SPONSORS_FALLBACK,
  );
  useEffect(() => {
    setV(
      (pageBlocks["home.sponsors_section"] as HomeSponsorsBlock) ??
        SPONSORS_FALLBACK,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageBlocks["home.sponsors_section"]]);

  const cta = v.cta ?? SPONSORS_FALLBACK.cta;

  return (
    <BlockCard
      title="Ana Sayfa — Sponsorlar Başlığı & CTA"
      description="“Sponsorlarımız” bölümünün başlığı ve altındaki çağrı (CTA) butonu. Sponsor logolarını sol menüdeki ‘Sponsorlar’ ekranından ekleyin."
      blockKey="home.sponsors_section"
      onSave={() => updatePageBlock("home.sponsors_section", v)}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Üst etiket (eyebrow)">
          <Input
            value={v.eyebrow ?? ""}
            onChange={(e) => setV({ ...v, eyebrow: e.target.value })}
          />
        </Field>
        <Field label="Başlık">
          <Input
            value={v.title}
            onChange={(e) => setV({ ...v, title: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Açıklama">
            <Input
              value={v.description ?? ""}
              onChange={(e) => setV({ ...v, description: e.target.value })}
            />
          </Field>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cta.visible}
            onChange={(e) =>
              setV({ ...v, cta: { ...cta, visible: e.target.checked } })
            }
            className="h-4 w-4 rounded border-border accent-brand-700"
          />
          <span className="text-sm font-medium text-brand-900">
            “Sponsor Olmak İstiyorum” butonunu göster
          </span>
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Buton metni">
            <Input
              value={cta.label}
              onChange={(e) =>
                setV({ ...v, cta: { ...cta, label: e.target.value } })
              }
            />
          </Field>
          <Field label="Buton hedef linki">
            <Input
              value={cta.href}
              onChange={(e) =>
                setV({ ...v, cta: { ...cta, href: e.target.value } })
              }
            />
          </Field>
        </div>
      </div>
    </BlockCard>
  );
}

/* --------------- Ana Sayfa Düzeni (sıra + aktif/pasif) --------------- */

/**
 * Ana sayfada görünen blokların sırasını yukarı/aşağı butonları ile değiştirir,
 * her bloğu aktif/pasif yapabilir. `home.layout` page block'una kaydeder.
 *
 * - Eksik veya bozuk veride `mergeHomeLayout` ile varsayılana fallback edilir.
 * - "Varsayılana sıfırla" butonu listenin başlangıç sırasına döndürür.
 * - Pasif edilen blok ana sayfada hiç render edilmez (DOM'da bile yer almaz).
 */
export function HomeLayoutEditor() {
  const { pageBlocks, updatePageBlock } = useStore();
  const init = mergeHomeLayout(pageBlocks["home.layout"] as HomeLayout | undefined);
  const [v, setV] = useState<HomeLayout>(init);

  useEffect(() => {
    setV(mergeHomeLayout(pageBlocks["home.layout"] as HomeLayout | undefined));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageBlocks["home.layout"]]);

  function move(idx: number, dir: -1 | 1) {
    setV((prev) => {
      const items = [...prev.items];
      const target = idx + dir;
      if (target < 0 || target >= items.length) return prev;
      [items[idx], items[target]] = [items[target], items[idx]];
      return { items };
    });
  }

  function toggle(idx: number) {
    setV((prev) => {
      const items = prev.items.map((it, i) =>
        i === idx ? { ...it, enabled: !it.enabled } : it,
      );
      return { items };
    });
  }

  function resetToDefault() {
    setV({ items: DEFAULT_HOME_LAYOUT.items.map((i) => ({ ...i })) });
  }

  const activeCount = v.items.filter((i) => i.enabled).length;

  return (
    <BlockCard
      title="Ana Sayfa Blok Düzeni"
      description="Ana sayfadaki bölümlerin sırasını değiştirin ve istediklerinizi pasif yapın. Pasif bölümler ana sayfada hiç görünmez."
      blockKey="home.layout"
      onSave={() => updatePageBlock("home.layout", v)}
    >
      <div className="flex items-center justify-between gap-3 mb-4 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-brand-900">{activeCount}</span> /{" "}
          {v.items.length} blok aktif
        </span>
        <button
          type="button"
          onClick={resetToDefault}
          className="text-brand-700 hover:text-brand-800 underline-offset-2 hover:underline"
        >
          Varsayılan sıraya sıfırla
        </button>
      </div>

      <ul className="space-y-2">
        {v.items.map((item, idx) => {
          const meta = HOME_BLOCK_LABELS[item.id];
          const isFirst = idx === 0;
          const isLast = idx === v.items.length - 1;
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                item.enabled
                  ? "border-border bg-white"
                  : "border-dashed border-border bg-muted/40",
              )}
            >
              {/* Sıra numarası + taşıma butonları */}
              <div className="flex items-center gap-1">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-800 text-xs font-semibold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={isFirst}
                    className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Yukarı taşı"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={isLast}
                    className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Aşağı taşı"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Blok bilgisi */}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium",
                    item.enabled ? "text-brand-900" : "text-muted-foreground",
                  )}
                >
                  {meta?.label ?? item.id}
                </div>
                {meta?.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {meta.description}
                  </div>
                )}
              </div>

              {/* Aktif/Pasif toggle */}
              <label className="inline-flex items-center gap-2 text-xs cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => toggle(idx)}
                  className="h-4 w-4 rounded border-border accent-brand-700"
                />
                <span
                  className={cn(
                    "font-medium",
                    item.enabled ? "text-brand-700" : "text-muted-foreground",
                  )}
                >
                  {item.enabled ? "Aktif" : "Pasif"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </BlockCard>
  );
}

// HomeBlockId / HomeLayoutItem TypeScript "unused import" lint'inden kaçınmak
// için type-only re-export — runtime'da tüketilmez ama dosya içinde başka
// editor'larda kullanılabilir hale getirir.
export type { HomeBlockId, HomeLayoutItem };