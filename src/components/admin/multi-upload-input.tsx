"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

/**
 * Birden fazla görseli liste halinde yöneten input.
 *
 * - Birden çok dosyayı aynı anda seçebilirsiniz (multiple).
 * - Her dosya `/api/admin/upload` üzerinden tek tek yüklenir; başarısız olanlar
 *   atlanır, kalanı listeye eklenir.
 * - Mevcut görseller miniatür olarak gösterilir; her birinin üstünde sıralama
 *   (sağa/sola), silme butonları bulunur.
 * - "Lightbox" gerekmez — bu admin tarafıdır, sadece dizilim/yönetim için.
 */

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  /** Liste başına bilgi satırı; opsiyonel. */
  hint?: string;
  /** Maksimum öğe sayısı; varsayılan 60. */
  max?: number;
};

export function MultiUploadInput({
  value,
  onChange,
  hint,
  max = 60,
}: Props) {
  const reactId = useId();
  const inputId = `multi-upload-${reactId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  async function uploadOne(file: File): Promise<string | null> {
    if (file.size === 0 || file.size > MAX_BYTES) return null;
    if (file.type && !ALLOWED.has(file.type)) return null;
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
    if (value.length + files.length > max) {
      const msg = `En fazla ${max} görsel ekleyebilirsiniz.`;
      setError(msg);
      toast({ tone: "error", title: "Limit aşıldı", description: msg });
      return;
    }
    setError(null);
    setBusy(true);
    setProgress({ done: 0, total: files.length });
    const added: string[] = [];
    let skipped = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        try {
          const url = await uploadOne(files[i]);
          if (url) added.push(url);
          else skipped += 1;
        } catch (e) {
          // Auth gibi kritik hatalarda döngüyü kıralım.
          throw e;
        }
        setProgress({ done: i + 1, total: files.length });
      }
      if (added.length) {
        onChange([...value, ...added]);
      }
      if (added.length && skipped === 0) {
        toast({
          tone: "success",
          title: `${added.length} görsel eklendi`,
        });
      } else if (added.length && skipped > 0) {
        toast({
          tone: "info",
          title: `${added.length} görsel eklendi, ${skipped} dosya atlandı`,
          description:
            "Sadece görseller (PNG/JPG/WEBP/GIF/SVG, en fazla 8MB) yüklenebilir.",
        });
      } else if (skipped > 0) {
        const msg =
          "Hiçbir dosya yüklenemedi. Sadece görseller (PNG/JPG/WEBP/GIF/SVG, en fazla 8MB) yüklenebilir.";
        setError(msg);
        toast({ tone: "error", title: "Yükleme hatası", description: msg });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      toast({ tone: "error", title: "Yükleme hatası", description: msg });
    } finally {
      setBusy(false);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function remove(idx: number) {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length) void handleFiles(files);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragOver) setDragOver(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  return (
    <div
      className="space-y-2"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {/* Mevcut görsellerin grid'i */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Galeri görseli ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-white/95 text-red-600 hover:bg-red-50 shadow"
                  title="Sil"
                  aria-label="Sil"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute bottom-1 inset-x-1 flex justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
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
                  onClick={() => move(idx, 1)}
                  disabled={idx === value.length - 1}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-white/95 text-brand-700 hover:bg-brand-50 shadow disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Sağa al"
                  aria-label="Sağa al"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yükleme alanı */}
      <label
        htmlFor={inputId}
        className={
          "flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-3 py-5 text-xs text-muted-foreground transition-colors cursor-pointer " +
          (busy
            ? "opacity-60 pointer-events-none border-border"
            : dragOver
              ? "border-brand-400 bg-brand-50/60 text-brand-700"
              : "border-border hover:border-brand-300 hover:bg-muted/30")
        }
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              Yükleniyor…{" "}
              {progress ? `${progress.done}/${progress.total}` : ""}
            </span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>
              <span className="text-brand-700 font-medium">Dosya seçin</span>{" "}
              veya buraya sürükleyip bırakın · birden fazla seçebilirsiniz
            </span>
            <span className="text-[10px] text-muted-foreground">
              PNG/JPG/WEBP/GIF/SVG · en fazla 8MB · {value.length}/{max}
            </span>
          </>
        )}
      </label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) void handleFiles(files);
        }}
      />

      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 -mr-1"
            aria-label="Hatayı kapat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
