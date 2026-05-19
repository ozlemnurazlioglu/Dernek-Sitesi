"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { UploadInput } from "@/components/admin/upload-input";
import { useStore } from "@/lib/store";
import { cn, uid } from "@/lib/utils";
import type { Photo, PhotoCategory } from "@/lib/types";

/**
 * Foto Galeri yönetimi.
 *
 * Eski tek listeden farklı olarak fotoğraflar **kategorilerine göre ayrı
 * bölümler** halinde gösterilir; her bölümde toplu yükleme butonu, sıralama
 * okları ve düzenle/sil aksiyonları bulunur. Yüzlerce foto eklendiğinde de
 * sayfa gezilebilir kalır.
 *
 * Toplu yükleme tek dosyaya bölüştürülmüş `/api/admin/upload` çağrılarıyla
 * yapılır (sunucu side birden çok dosyayı tek istekte kabul etmiyor). Yükleme
 * sırasında basit bir progress göstergesi kullanıcıyı bilgilendirir.
 */

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export default function FotoGaleriAdminPage() {
  const { photoCategories, photos } = useStore();

  const orderedCategories = useMemo(
    () => [...photoCategories].sort((a, b) => a.sort - b.sort),
    [photoCategories],
  );

  const photosByCategory = useMemo(() => {
    const m = new Map<string, Photo[]>();
    for (const p of photos) {
      const arr = m.get(p.categorySlug) ?? [];
      arr.push(p);
      m.set(p.categorySlug, arr);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.sort - b.sort);
    }
    return m;
  }, [photos]);

  // Kategorisi silinmiş ama hâlâ DB'de duran foto'ları "tanımsız kategori"
  // başlığı altında topla; veri kaybolmadan görünür kalsın.
  const orphanPhotos = useMemo(() => {
    const known = new Set(orderedCategories.map((c) => c.slug));
    return photos.filter((p) => !known.has(p.categorySlug)).sort(
      (a, b) => a.sort - b.sort,
    );
  }, [photos, orderedCategories]);

  if (orderedCategories.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold text-brand-900">Foto Galeri</h1>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Henüz foto kategorisi yok. Fotoğraf ekleyebilmek için önce en az bir
          kategori oluşturun.
          <div className="mt-4">
            <Link
              href="/admin/foto-kategorileri"
              className="inline-flex items-center text-sm font-medium text-amber-800 underline underline-offset-4"
            >
              Foto kategorilerine git →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Foto Galeri</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fotoğraflar kategori bölümleri halinde listelenir. Her bölümün
            başlığındaki <strong>Toplu Yükle</strong> butonuyla bir kerede
            birden fazla görsel ekleyebilirsiniz.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {orderedCategories.map((category) => (
          <PhotoCategorySection
            key={category.id}
            category={category}
            photos={photosByCategory.get(category.slug) ?? []}
          />
        ))}

        {orphanPhotos.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
            <h2 className="text-base font-semibold text-amber-900">
              Kategorisi silinmiş fotoğraflar ({orphanPhotos.length})
            </h2>
            <p className="text-xs text-amber-900/80 mt-1">
              Bu fotoğraflar bir kategoriye bağlı değil. Foto kategorileri
              sayfasından eksik kategoriyi oluşturup foto'yu düzenleyerek o
              kategoriye atayabilirsiniz; ya da silebilirsiniz.
            </p>
            <PhotoGrid photos={orphanPhotos} categorySlug={null} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Kategori başlığı + toplu yükleme + foto grid
   ──────────────────────────────────────────────────────────── */

function PhotoCategorySection({
  category,
  photos,
}: {
  category: PhotoCategory;
  photos: Photo[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-white overflow-hidden">
      <header className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border bg-muted/30">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-brand-900 truncate">
            {category.name}
            <span className="ml-2 inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 align-middle">
              {photos.length}
            </span>
          </h2>
          {category.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {category.description}
            </p>
          )}
        </div>
        <BulkUploadButton categorySlug={category.slug} existingCount={photos.length} />
      </header>

      {photos.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-muted-foreground">
          Bu kategoride henüz foto yok. <strong>Toplu Yükle</strong> ile
          ekleyin.
        </div>
      ) : (
        <PhotoGrid photos={photos} categorySlug={category.slug} />
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   Toplu yükleme butonu — multi file picker + drag&drop
   ──────────────────────────────────────────────────────────── */

function BulkUploadButton({
  categorySlug,
  existingCount,
}: {
  categorySlug: string;
  existingCount: number;
}) {
  const { upsertContent } = useStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  async function uploadOne(file: File): Promise<string | null> {
    if (file.size === 0 || file.size > MAX_BYTES) return null;
    if (file.type && !ALLOWED_TYPES.has(file.type)) return null;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", "image");
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "same-origin",
    });
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Oturumunuz geçersiz. Lütfen yönetici olarak yeniden giriş yapın.",
      );
    }
    if (!res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as { url?: string };
    return typeof data.url === "string" && data.url.length > 0 ? data.url : null;
  }

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;
    setBusy(true);
    setProgress({ done: 0, total: files.length });
    let added = 0;
    let skipped = 0;
    try {
      // Her dosya: yükle → photos tablosuna kayıt ekle. Sıralı çalışır;
      // paralel yapsak sort numarası yarışırdı.
      for (let i = 0; i < files.length; i++) {
        let url: string | null;
        try {
          url = await uploadOne(files[i]);
        } catch (e) {
          // Auth gibi kritik hatalarda döngüyü kıralım.
          throw e;
        }
        if (url) {
          const sort = (existingCount + added + 1) * 10;
          await upsertContent("photos", {
            id: `photo-${uid()}`,
            categorySlug,
            title: "",
            imageUrl: url,
            sort,
          });
          added += 1;
        } else {
          skipped += 1;
        }
        setProgress({ done: i + 1, total: files.length });
      }
      if (added > 0 && skipped === 0) {
        toast({ tone: "success", title: `${added} foto eklendi` });
      } else if (added > 0 && skipped > 0) {
        toast({
          tone: "info",
          title: `${added} foto eklendi, ${skipped} dosya atlandı`,
          description:
            "Sadece görseller (PNG/JPG/WEBP/GIF/SVG, en fazla 8MB) yüklenebilir.",
        });
      } else {
        toast({
          tone: "error",
          title: "Hiçbir dosya yüklenemedi",
          description:
            "Sadece görseller (PNG/JPG/WEBP/GIF/SVG, en fazla 8MB) yüklenebilir.",
        });
      }
    } catch (e) {
      toast({
        tone: "error",
        title: "Yükleme hatası",
        description: e instanceof Error ? e.message : "Bilinmeyen hata",
      });
    } finally {
      setBusy(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="shrink-0">
      <label
        className={cn(
          "inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-brand-900 text-white text-sm font-medium hover:bg-brand-800 cursor-pointer whitespace-nowrap select-none",
          busy && "opacity-60 pointer-events-none",
        )}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress ? `${progress.done}/${progress.total}` : "Yükleniyor…"}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Toplu Yükle
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length) void handleFiles(files);
          }}
        />
      </label>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Foto grid — thumbnail + edit/delete/sıra
   ──────────────────────────────────────────────────────────── */

function PhotoGrid({
  photos,
  categorySlug,
}: {
  photos: Photo[];
  categorySlug: string | null;
}) {
  const { upsertContent, removeContent } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Photo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function move(photo: Photo, dir: -1 | 1) {
    const sorted = [...photos];
    const idx = sorted.findIndex((p) => p.id === photo.id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= sorted.length) return;
    const other = sorted[target];
    // Sort'ları takas et — küçük sort numarası önce.
    try {
      await Promise.all([
        upsertContent("photos", { ...photo, sort: other.sort }),
        upsertContent("photos", { ...other, sort: photo.sort }),
      ]);
    } catch (e) {
      toast({
        tone: "error",
        title: "Sıralama değiştirilemedi",
        description: e instanceof Error ? e.message : "Tekrar deneyin.",
      });
    }
  }

  async function remove(photo: Photo) {
    if (!confirm("Bu fotoğrafı silmek istiyor musunuz?")) return;
    try {
      await removeContent("photos", photo.id);
      toast({ tone: "info", title: "Foto silindi" });
    } catch (e) {
      toast({
        tone: "error",
        title: "Silinemedi",
        description: e instanceof Error ? e.message : "Tekrar deneyin.",
      });
    }
  }

  // Grid'in kendisi de drop hedefi — sürükle-bırakla bu kategoriye eklemek
  // için. categorySlug null ise (orphan'lar) drop devre dışı.
  async function handleDrop(files: FileList | File[]) {
    if (!categorySlug) return;
    const arr = Array.from(files).filter(
      (f) => f.size > 0 && f.size <= MAX_BYTES && ALLOWED_TYPES.has(f.type),
    );
    if (!arr.length) {
      toast({
        tone: "error",
        title: "Hiçbir dosya yüklenemedi",
        description: "Sadece görseller (en fazla 8MB) kabul edilir.",
      });
      return;
    }
    setBusy(true);
    let added = 0;
    try {
      for (const file of arr) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("kind", "image");
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
          credentials: "same-origin",
        });
        if (!res.ok) continue;
        const data = (await res.json().catch(() => ({}))) as { url?: string };
        if (!data.url) continue;
        const sort = (photos.length + added + 1) * 10;
        await upsertContent("photos", {
          id: `photo-${uid()}`,
          categorySlug,
          title: "",
          imageUrl: data.url,
          sort,
        });
        added += 1;
      }
      if (added > 0) toast({ tone: "success", title: `${added} foto eklendi` });
    } catch (e) {
      toast({
        tone: "error",
        title: "Yükleme hatası",
        description: e instanceof Error ? e.message : "Bilinmeyen hata",
      });
    } finally {
      setBusy(false);
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    if (!categorySlug) return;
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    if (!categorySlug) return;
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length) void handleDrop(files);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 transition-colors",
        dragOver && "bg-brand-50/60 ring-2 ring-inset ring-brand-400",
      )}
    >
      {photos.map((photo, idx) => (
        <div
          key={photo.id}
          className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted/30"
        >
          {photo.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.imageUrl}
              alt={photo.title || "Foto"}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Görsel yok
            </div>
          )}

          {photo.title && (
            <div className="absolute top-1 left-1 right-12 text-[10px] font-medium bg-black/55 text-white px-1.5 py-0.5 rounded truncate">
              {photo.title}
            </div>
          )}

          {/* Aksiyon butonları — hover'da görünür */}
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setEditing(photo)}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-white/95 text-brand-700 hover:bg-brand-50 shadow"
              title="Düzenle"
              aria-label="Düzenle"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => void remove(photo)}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-white/95 text-red-600 hover:bg-red-50 shadow"
              title="Sil"
              aria-label="Sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="absolute bottom-1 inset-x-1 flex justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => void move(photo, -1)}
              disabled={idx === 0}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-white/95 text-brand-700 hover:bg-brand-50 shadow disabled:opacity-40 disabled:cursor-not-allowed"
              title="Sola al"
              aria-label="Sola al"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <span className="inline-flex items-center justify-center text-[10px] font-semibold text-white bg-brand-900/80 rounded px-1.5">
              {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => void move(photo, 1)}
              disabled={idx === photos.length - 1}
              className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-white/95 text-brand-700 hover:bg-brand-50 shadow disabled:opacity-40 disabled:cursor-not-allowed"
              title="Sağa al"
              aria-label="Sağa al"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* "+" foto ekleme kartı — tek dosya seçer; toplu için üstteki buton */}
      {categorySlug && (
        <label
          htmlFor={`add-photo-${categorySlug}`}
          className={cn(
            "aspect-square rounded-md border-2 border-dashed border-border hover:border-brand-300 hover:bg-muted/30 flex flex-col items-center justify-center gap-1 cursor-pointer text-xs text-muted-foreground transition-colors",
            busy && "opacity-60 pointer-events-none",
          )}
        >
          <Plus className="h-5 w-5" />
          <span>Foto ekle</span>
          <input
            ref={inputRef}
            id={`add-photo-${categorySlug}`}
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length) void handleDrop(files);
            }}
          />
        </label>
      )}

      {dragOver && categorySlug && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-50/80 rounded-md">
          <span className="text-sm font-medium text-brand-900 inline-flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bu kategoriye yükle
          </span>
        </div>
      )}

      <PhotoEditModal
        photo={editing}
        onClose={() => setEditing(null)}
        onSave={async (next) => {
          try {
            await upsertContent("photos", next);
            toast({ tone: "success", title: "Güncellendi" });
            setEditing(null);
          } catch (e) {
            toast({
              tone: "error",
              title: "Kaydedilemedi",
              description:
                e instanceof Error ? e.message : "Tekrar deneyin.",
            });
          }
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Foto düzenle modal'ı — başlık, görsel ve sort değişimi
   ──────────────────────────────────────────────────────────── */

function PhotoEditModal({
  photo,
  onClose,
  onSave,
}: {
  photo: Photo | null;
  onClose: () => void;
  onSave: (next: Photo) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sort, setSort] = useState("0");
  const [saving, setSaving] = useState(false);

  // Modal her açıldığında veya farklı foto seçildiğinde state'i o foto'ya
  // göre resetle.
  useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setImageUrl(photo.imageUrl);
      setSort(String(photo.sort));
    } else {
      setTitle("");
      setImageUrl("");
      setSort("0");
    }
  }, [photo]);

  async function handleSave() {
    if (!photo) return;
    setSaving(true);
    try {
      await onSave({
        ...photo,
        title: title.trim(),
        imageUrl,
        sort: Number(sort) || 0,
      });
      setTitle("");
      setImageUrl("");
      setSort("0");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setTitle("");
    setImageUrl("");
    setSort("0");
    onClose();
  }

  return (
    <Modal open={!!photo} onClose={handleClose} title="Fotoğraf Düzenle">
      <div className="space-y-4">
        <Field label="Başlık / Alt metin">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Etkinlik fotoğrafı"
          />
        </Field>
        <Field label="Fotoğraf">
          <UploadInput
            value={imageUrl}
            onChange={setImageUrl}
            kind="image"
          />
        </Field>
        <Field label="Sıralama">
          <Input
            type="number"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </Field>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={handleClose} disabled={saving}>
          Vazgeç
        </Button>
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </Modal>
  );
}
