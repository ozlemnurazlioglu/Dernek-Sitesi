"use client";

import { useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useStore, type ContentType } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { uid } from "@/lib/utils";
import { UploadInput } from "@/components/admin/upload-input";

export type FieldDef =
  | {
      key: string;
      label: string;
      type: "text" | "url" | "emoji" | "time";
      placeholder?: string;
      required?: boolean;
    }
  | {
      key: string;
      label: string;
      type: "textarea";
      placeholder?: string;
      required?: boolean;
      rows?: number;
    }
  | {
      key: string;
      label: string;
      type: "number";
      placeholder?: string;
      required?: boolean;
    }
  | {
      key: string;
      label: string;
      type: "list"; // string[] satır satır
      placeholder?: string;
      required?: boolean;
    }
  | {
      key: string;
      label: string;
      type: "image" | "file" | "video"; // dosya yükleme (görsel, PDF veya video)
      placeholder?: string;
      required?: boolean;
    }
  | {
      key: string;
      label: string;
      type: "select";
      options: { value: string; label: string }[];
      required?: boolean;
    }
  | {
      key: string;
      label: string;
      type: "boolean";
      hint?: string;
    };

type Item = { id: string; sort?: number } & Record<string, unknown>;

export function ContentListAdmin({
  type,
  title,
  description,
  singular,
  fields,
  renderRow,
}: {
  type: ContentType;
  title: string;
  description: string;
  singular: string;
  fields: FieldDef[];
  renderRow: (item: Item) => ReactNode;
}) {
  const store = useStore();
  // store içinden ilgili listeyi çek — yeni içerik tipi eklerken buraya da
  // satır eklemeyi unutma (TypeScript bu Record'un eksiksiz olmasını zorlar).
  const stateMap: Record<ContentType, keyof typeof store> = {
    "board-members": "boardMembers",
    milestones: "milestones",
    "activity-reports": "activityReports",
    "scholarship-programs": "scholarshipPrograms",
    "required-documents": "requiredDocuments",
    "scholarship-timeline": "scholarshipTimeline",
    faqs: "faqs",
    testimonials: "testimonials",
    "donation-presets": "donationPresets",
    "donation-uses": "donationUses",
    "news-categories": "newsCategories",
    "event-categories": "eventCategories",
    "legal-pages": "legalPages",
    agalar: "agalar",
    "finance-items": "financeItems",
    "announcement-categories": "announcementCategories",
    announcements: "announcements",
    "bank-accounts": "bankAccounts",
    "sponsor-tiers": "sponsorTiers",
    sponsors: "sponsors",
    neighborhoods: "neighborhoods",
    donors: "donors",
    "photo-categories": "photoCategories",
    photos: "photos",
    "video-categories": "videoCategories",
    videos: "videos",
  };
  const list = (store[stateMap[type]] as Item[]) ?? [];

  const { toast } = useToast();

  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function openNew() {
    const blank: Record<string, string> = {};
    for (const f of fields) blank[f.key] = "";
    blank.sort = String((list[list.length - 1]?.sort ?? 0) + 1);
    setForm(blank);
    setEditing({ id: "", sort: 0 } as Item);
  }

  function openEdit(item: Item) {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = item[f.key];
      if (f.type === "list") {
        next[f.key] = Array.isArray(v) ? (v as string[]).join("\n") : "";
      } else if (f.type === "boolean") {
        next[f.key] = v ? "1" : "";
      } else {
        next[f.key] = v == null ? "" : String(v);
      }
    }
    next.sort = String(item.sort ?? 0);
    setForm(next);
    setEditing(item);
  }

  async function save() {
    if (!editing || saving) return;
    const payload: Record<string, unknown> = { id: editing.id || `${type}-${uid()}` };
    const missing: string[] = [];
    for (const f of fields) {
      const raw = form[f.key] ?? "";
      if (f.type === "number") {
        payload[f.key] = Number(raw) || 0;
      } else if (f.type === "list") {
        payload[f.key] = raw
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === "boolean") {
        payload[f.key] = raw === "1";
      } else {
        payload[f.key] = raw;
      }
      const isRequired = "required" in f && f.required;
      // "required" yalnızca non-boolean FieldDef varyantlarında bulunduğundan
      // narrowing zaten "boolean" tipini dışlıyor.
      if (isRequired) {
        const v = payload[f.key];
        const isEmpty =
          v == null ||
          (typeof v === "string" && v.trim() === "") ||
          (Array.isArray(v) && v.length === 0);
        if (isEmpty) missing.push(f.label);
      }
    }
    payload.sort = Number(form.sort) || 0;

    if (missing.length > 0) {
      toast({
        tone: "error",
        title: "Eksik alanlar",
        description: `Lütfen şu alanları doldurun: ${missing.join(", ")}`,
      });
      return;
    }

    setSaving(true);
    try {
      await store.upsertContent(type, payload as never);
      setEditing(null);
      toast({ tone: "success", title: editing.id ? "Güncellendi" : "Eklendi" });
    } catch (err) {
      toast({
        tone: "error",
        title: "Kayıt başarısız",
        description:
          err instanceof Error ? err.message : "Bilinmeyen hata. Tekrar deneyin.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      await store.removeContent(type, id);
      toast({ tone: "info", title: "Silindi" });
    } catch (err) {
      toast({
        tone: "error",
        title: "Silinemedi",
        description:
          err instanceof Error ? err.message : "Bilinmeyen hata. Tekrar deneyin.",
      });
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button onClick={openNew} leftIcon={<Plus className="h-4 w-4" />}>
          Yeni {singular}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Henüz kayıt yok. "Yeni {singular}" ile ekleyin.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((item) => (
              <li
                key={item.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-muted/30"
              >
                <div className="flex-1 min-w-0">{renderRow(item)}</div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="h-9 w-9 rounded-md border border-border text-brand-700 hover:bg-brand-50 inline-flex items-center justify-center"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="h-9 w-9 rounded-md border border-border text-red-600 hover:bg-red-50 inline-flex items-center justify-center"
                    aria-label="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `${singular} Düzenle` : `Yeni ${singular}`}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => {
            const value = form[f.key] ?? "";
            const onChange = (v: string) =>
              setForm((prev) => ({ ...prev, [f.key]: v }));
            const colSpan =
              f.type === "textarea" ||
              f.type === "list" ||
              f.type === "image" ||
              f.type === "file" ||
              f.type === "video" ||
              f.type === "boolean"
                ? "sm:col-span-2"
                : "";
            const isBoolean = f.type === "boolean";
            return (
              <div key={f.key} className={colSpan}>
                {isBoolean ? (
                  <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-border p-3 hover:bg-muted/30">
                    <input
                      type="checkbox"
                      checked={value === "1"}
                      onChange={(e) => onChange(e.target.checked ? "1" : "")}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-brand-700"
                    />
                    <div>
                      <div className="text-sm font-medium text-brand-900">
                        {f.label}
                      </div>
                      {f.hint && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {f.hint}
                        </div>
                      )}
                    </div>
                  </label>
                ) : (
                <Field
                  label={f.label}
                  required={"required" in f ? f.required : undefined}
                >
                  {f.type === "textarea" ? (
                    <Textarea
                      rows={f.rows ?? 4}
                      placeholder={f.placeholder}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  ) : f.type === "list" ? (
                    <Textarea
                      rows={5}
                      placeholder={f.placeholder ?? "Her satıra bir madde"}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  ) : f.type === "number" ? (
                    <Input
                      type="number"
                      placeholder={f.placeholder}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  ) : f.type === "image" || f.type === "file" || f.type === "video" ? (
                    <UploadInput
                      value={value}
                      onChange={onChange}
                      kind={f.type}
                      placeholder={f.placeholder}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    >
                      <option value="">— Seçin —</option>
                      {f.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "time" ? (
                    <Input
                      type="time"
                      placeholder={f.placeholder}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  ) : (
                    <Input
                      type={f.type === "url" ? "url" : "text"}
                      placeholder={f.placeholder}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  )}
                </Field>
                )}
              </div>
            );
          })}
          <div>
            <Field label="Sıralama" required>
              <Input
                type="number"
                value={form.sort ?? "0"}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sort: e.target.value }))
                }
              />
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => setEditing(null)}
            disabled={saving}
          >
            Vazgeç
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
