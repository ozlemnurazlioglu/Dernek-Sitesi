"use client";

/**
 * /admin/eski-bursiyerler
 *
 * Eski bursiyerler ve velileri için CRUD ekranı.
 *   - Onaylanmış başvurulardan toplu import (dry-run → onay)
 *   - Manuel ekleme / düzenleme / silme
 *   - Arama (ad, okul, TC, e-posta, telefon)
 *
 * UI store kullanmaz — doğrudan /api/admin/alumni endpoint'leriyle konuşur.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR } from "@/lib/utils";
import type { Alumni } from "@/lib/types";

type FormState = Omit<Alumni, "id" | "createdAt" | "graduationYear"> & {
  graduationYear: string;
};

const emptyForm: FormState = {
  fullName: "",
  nationalId: "",
  email: "",
  phone: "",
  schoolName: "",
  department: "",
  graduationYear: "",
  parentName: "",
  parentPhone: "",
  parentRelation: "",
  notes: "",
  sourceApplicationId: undefined,
};

function alumniToForm(a: Alumni): FormState {
  return {
    fullName: a.fullName,
    nationalId: a.nationalId,
    email: a.email,
    phone: a.phone,
    schoolName: a.schoolName,
    department: a.department,
    graduationYear: a.graduationYear ? String(a.graduationYear) : "",
    parentName: a.parentName,
    parentPhone: a.parentPhone,
    parentRelation: a.parentRelation,
    notes: a.notes,
    sourceApplicationId: a.sourceApplicationId,
  };
}

export default function EskiBursiyerlerPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editTarget, setEditTarget] = useState<Alumni | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Alumni | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    total: number;
    candidates: number;
    skipped: number;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alumni", {
        credentials: "same-origin",
      });
      const json = (await res.json().catch(() => null)) as
        | { items?: Alumni[]; error?: string }
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
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLocaleLowerCase("tr-TR");
    return items.filter((a) => {
      const blob =
        `${a.fullName} ${a.nationalId} ${a.email} ${a.phone} ${a.schoolName} ${a.department} ${a.parentName} ${a.parentPhone}`.toLocaleLowerCase(
          "tr-TR",
        );
      return blob.includes(q);
    });
  }, [items, query]);

  // Yeni ekleme veya düzenleme modal'ı tek form state'i paylaşır.
  function openCreate() {
    setForm(emptyForm);
    setCreateOpen(true);
  }
  function openEdit(a: Alumni) {
    setEditTarget(a);
    setForm(alumniToForm(a));
  }

  async function handleSave() {
    if (!form.fullName.trim()) {
      toast({ tone: "error", title: "Ad Soyad zorunludur" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
      };
      const url = editTarget
        ? `/api/admin/alumni/${encodeURIComponent(editTarget.id)}`
        : "/api/admin/alumni";
      const method = editTarget ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        toast({
          tone: "error",
          title: "Kaydedilemedi",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      toast({
        tone: "success",
        title: editTarget ? "Kayıt güncellendi" : "Kayıt eklendi",
      });
      setCreateOpen(false);
      setEditTarget(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/alumni/${encodeURIComponent(deleteTarget.id)}`,
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
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast({ tone: "success", title: "Kayıt silindi" });
    } finally {
      setDeleting(false);
    }
  }

  async function runImportPreview() {
    setImporting(true);
    setImportPreview(null);
    try {
      const res = await fetch(
        "/api/admin/alumni/import-from-applications?dryRun=1",
        { method: "POST", credentials: "same-origin" },
      );
      const json = (await res.json().catch(() => null)) as
        | { total?: number; candidates?: number; skipped?: number; error?: string }
        | null;
      if (!res.ok || !json) {
        toast({
          tone: "error",
          title: "Önizleme alınamadı",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      setImportPreview({
        total: json.total ?? 0,
        candidates: json.candidates ?? 0,
        skipped: json.skipped ?? 0,
      });
    } finally {
      setImporting(false);
    }
  }

  async function runImportConfirm() {
    setImporting(true);
    try {
      const res = await fetch("/api/admin/alumni/import-from-applications", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const json = (await res.json().catch(() => null)) as
        | { inserted?: number; error?: string }
        | null;
      if (!res.ok || !json) {
        toast({
          tone: "error",
          title: "İçe aktarma başarısız",
          description: json?.error || `HTTP ${res.status}`,
        });
        return;
      }
      toast({
        tone: "success",
        title: "İçe aktarma tamamlandı",
        description: `${json.inserted ?? 0} kayıt eklendi.`,
      });
      setImportOpen(false);
      setImportPreview(null);
      await load();
    } finally {
      setImporting(false);
    }
  }

  function handleExportCsv() {
    if (filtered.length === 0) return;
    const headers = [
      "Ad Soyad",
      "T.C. Kimlik",
      "E-posta",
      "Telefon",
      "Okul",
      "Bölüm",
      "Mezuniyet Yılı",
      "Veli Adı",
      "Veli Telefon",
      "Yakınlık",
      "Notlar",
      "Eklenme",
    ];
    const escape = (v: unknown) =>
      `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(",")];
    for (const a of filtered) {
      lines.push(
        [
          a.fullName,
          a.nationalId,
          a.email,
          a.phone,
          a.schoolName,
          a.department,
          a.graduationYear ?? "",
          a.parentName,
          a.parentPhone,
          a.parentRelation,
          a.notes,
          formatDateTimeTR(a.createdAt),
        ]
          .map(escape)
          .join(","),
      );
    }
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `EskiBursiyerler-${stamp}.csv`;
    const file = new File([blob], filename, { type: blob.type });
    const navAny = navigator as unknown as {
      msSaveBlob?: (b: Blob, name: string) => boolean;
    };
    if (typeof navAny.msSaveBlob === "function") {
      navAny.msSaveBlob(file, filename);
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6" /> Eski Bursiyerler
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mezun ve onaylanmış bursiyerler ile velilerini içeren kayıt
            havuzu. Onaylı başvurulardan otomatik import edebilirsiniz.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setImportOpen(true)}
            leftIcon={<UploadCloud className="h-4 w-4" />}
          >
            Başvurulardan İçe Aktar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            leftIcon={<Download className="h-4 w-4" />}
          >
            CSV İndir
          </Button>
          <Button
            type="button"
            onClick={openCreate}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Manuel Ekle
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        <div className="px-4 sm:px-6 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Toplam <strong className="text-brand-900">{items.length}</strong>{" "}
            kayıt
            {filtered.length !== items.length && (
              <> · <strong>{filtered.length}</strong> görünüyor</>
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ad, okul, TC, telefon..."
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Henüz kayıt yok.{" "}
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="text-brand-700 hover:underline"
            >
              Onaylanmış başvurulardan içe aktarın
            </button>{" "}
            veya manuel ekleyin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Ad Soyad</th>
                  <th className="text-left px-4 py-3 font-medium">Okul</th>
                  <th className="text-left px-4 py-3 font-medium">Mezuniyet</th>
                  <th className="text-left px-4 py-3 font-medium">İletişim</th>
                  <th className="text-left px-4 py-3 font-medium">Veli</th>
                  <th className="text-left px-4 py-3 font-medium">Eklenme</th>
                  <th className="text-right px-4 py-3 font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-900">
                        {a.fullName}
                      </div>
                      {a.nationalId && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {a.nationalId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-900">
                      <div>{a.schoolName || "—"}</div>
                      {a.department && (
                        <div className="text-xs text-muted-foreground">
                          {a.department}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-900">
                      {a.graduationYear ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-900">
                      <div>{a.email || "—"}</div>
                      <div className="text-muted-foreground">{a.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-900">
                      <div>{a.parentName || "—"}</div>
                      <div className="text-muted-foreground">
                        {a.parentRelation}
                        {a.parentRelation && a.parentPhone && " · "}
                        {a.parentPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTimeTR(a.createdAt)}
                      {a.sourceApplicationId && (
                        <div className="text-[10px] mt-0.5">
                          ← #{a.sourceApplicationId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          title="Düzenle"
                          className="h-9 w-9 inline-flex items-center justify-center rounded-md text-brand-700 hover:bg-brand-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(a)}
                          title="Sil"
                          className="h-9 w-9 inline-flex items-center justify-center rounded-md text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={createOpen || editTarget !== null}
        onClose={() => {
          setCreateOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? "Bursiyer düzenle" : "Yeni bursiyer"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ad Soyad" required>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Field>
            <Field label="T.C. Kimlik">
              <Input
                inputMode="numeric"
                value={form.nationalId}
                onChange={(e) =>
                  setForm({ ...form, nationalId: e.target.value })
                }
              />
            </Field>
            <Field label="E-posta">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Telefon">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Okul">
              <Input
                value={form.schoolName}
                onChange={(e) =>
                  setForm({ ...form, schoolName: e.target.value })
                }
              />
            </Field>
            <Field label="Bölüm">
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
            </Field>
            <Field label="Mezuniyet Yılı">
              <Input
                inputMode="numeric"
                placeholder="2024"
                value={form.graduationYear}
                onChange={(e) =>
                  setForm({ ...form, graduationYear: e.target.value })
                }
              />
            </Field>
            <div />
            <Field label="Veli Adı">
              <Input
                value={form.parentName}
                onChange={(e) =>
                  setForm({ ...form, parentName: e.target.value })
                }
              />
            </Field>
            <Field label="Veli Telefon">
              <Input
                value={form.parentPhone}
                onChange={(e) =>
                  setForm({ ...form, parentPhone: e.target.value })
                }
              />
            </Field>
            <Field label="Yakınlık">
              <Input
                placeholder="Anne, Baba, Vasi..."
                value={form.parentRelation}
                onChange={(e) =>
                  setForm({ ...form, parentRelation: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Notlar">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                setEditTarget(null);
              }}
              disabled={saving}
            >
              Vazgeç
            </Button>
            <Button type="button" onClick={handleSave} loading={saving}>
              {editTarget ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Kaydı sil?"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-900">
            <strong>{deleteTarget?.fullName}</strong> isimli kayıt silinecek.
            Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              loading={deleting}
              className="bg-red-700 hover:bg-red-800"
            >
              Sil
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import modal */}
      <Modal
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportPreview(null);
        }}
        title="Onaylı başvurulardan içe aktar"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-900">
            Bu işlem, statüsü <strong>Onaylandı</strong> olan tüm başvurular
            için bursiyer kaydı oluşturur. Daha önce import edilmiş başvurular
            atlanır.
          </p>
          {importPreview ? (
            <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
              <div>
                Onaylı başvuru: <strong>{importPreview.total}</strong>
              </div>
              <div>
                Daha önce eklenmiş: <strong>{importPreview.skipped}</strong>
              </div>
              <div>
                Eklenecek: <strong className="text-emerald-700">{importPreview.candidates}</strong>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={runImportPreview}
              loading={importing}
              leftIcon={<Search className="h-4 w-4" />}
            >
              Önce kontrol et
            </Button>
          )}
          {importPreview && (
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setImportOpen(false);
                  setImportPreview(null);
                }}
                disabled={importing}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={runImportConfirm}
                loading={importing}
                disabled={importPreview.candidates === 0}
                leftIcon={<UploadCloud className="h-4 w-4" />}
              >
                {importPreview.candidates} kaydı içe aktar
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
