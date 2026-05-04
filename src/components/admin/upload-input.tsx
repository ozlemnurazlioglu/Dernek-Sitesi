"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { AlertCircle, FileText, Image as ImageIcon, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type Props = {
  /** Mevcut URL (boşsa input boş gösterilir) */
  value: string;
  onChange: (url: string) => void;
  /** "image" → sadece görsel, "file" → sadece PDF, "any" → her ikisi */
  kind?: "image" | "file" | "any";
  placeholder?: string;
  /** İsteğe bağlı: önizleme göster (görsel için) */
  preview?: boolean;
};

const ACCEPT: Record<NonNullable<Props["kind"]>, string> = {
  image: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml",
  file: "application/pdf",
  any: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB — backend ile eş

const ALLOWED_TYPES: Record<NonNullable<Props["kind"]>, Set<string>> = {
  image: new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ]),
  file: new Set(["application/pdf"]),
  any: new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
  ]),
};

const KIND_HINT: Record<NonNullable<Props["kind"]>, string> = {
  image: "Görsel: PNG, JPG, WEBP, GIF veya SVG. En fazla 8MB.",
  file: "PDF dosyası. En fazla 8MB.",
  any: "Görsel (PNG/JPG/WEBP/GIF/SVG) veya PDF. En fazla 8MB.",
};

/**
 * URL girişi + dosya yükleme tek alanda.
 *
 * Üç farklı yolla kullanım:
 *  1) URL'yi doğrudan input alanına yapıştırarak,
 *  2) "Yükle" etiketine tıklayıp dosya seçici ile,
 *  3) Drop zone üzerine dosyayı sürükleyip bırakarak.
 *
 * "Yükle" elemanı `<label htmlFor>` mekanizmasıyla bağlandığı için JavaScript
 * tıklama gerektirmez — tüm tarayıcılarda ve gömülü preview'larda yerel olarak
 * file picker açar.
 */
export function UploadInput({
  value,
  onChange,
  kind = "any",
  placeholder = "https://… veya dosya seçin",
  preview = true,
}: Props) {
  const reactId = useId();
  const inputId = `upload-${reactId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  async function handleFile(file: File) {
    setError(null);

    if (file.size === 0) {
      const msg = "Dosya boş görünüyor.";
      setError(msg);
      toast({ tone: "error", title: "Yükleme hatası", description: msg });
      return;
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      const msg = `Dosya çok büyük (${mb} MB). En fazla 8 MB yükleyebilirsiniz.`;
      setError(msg);
      toast({ tone: "error", title: "Dosya çok büyük", description: msg });
      return;
    }
    const allowed = ALLOWED_TYPES[kind];
    if (file.type && !allowed.has(file.type)) {
      const msg = `Desteklenmeyen tip: ${file.type}. ${KIND_HINT[kind]}`;
      setError(msg);
      toast({ tone: "error", title: "Desteklenmeyen dosya", description: msg });
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (kind !== "any") fd.append("kind", kind);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      let data: { url?: string; error?: string } = {};
      try {
        data = (await res.json()) as { url?: string; error?: string };
      } catch {
        /* boş gövde */
      }
      if (res.status === 401 || res.status === 403) {
        throw new Error(
          "Oturumunuz geçersiz. Lütfen yönetici olarak yeniden giriş yapın.",
        );
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error || `Yükleme başarısız (HTTP ${res.status})`);
      }
      onChange(data.url);
      toast({ tone: "success", title: "Dosya yüklendi" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Bilinmeyen hata";
      setError(msg);
      toast({ tone: "error", title: "Yükleme hatası", description: msg });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
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

  const showImagePreview = preview && kind !== "file" && isImageUrl(value);
  const showFileLink = preview && kind !== "image" && isPdfUrl(value);

  return (
    <div
      className="space-y-2"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => {
            setError(null);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="flex-1"
        />

        {/* Native dosya seçimi — label/htmlFor mekanizması her tarayıcıda
            programatik click'e gerek kalmadan picker açar. */}
        <label
          htmlFor={inputId}
          aria-disabled={busy}
          className={
            "inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-border bg-white text-sm font-medium text-brand-800 hover:border-brand-300 cursor-pointer whitespace-nowrap select-none " +
            (busy ? "opacity-60 pointer-events-none" : "")
          }
        >
          <Upload className="h-4 w-4" />
          {busy ? "Yükleniyor…" : "Yükle"}
        </label>

        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-border bg-white text-muted-foreground hover:text-red-600 hover:border-red-300"
            title="Temizle"
            aria-label="Temizle"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Görünmez ama erişilebilir file input. sr-only stili keyboard
            kullanıcılarına da odaklanma imkânı verir. */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT[kind]}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* Drag & drop alanı — kullanıcı dosyayı doğrudan buraya bırakabilir. */}
      {!value && (
        <label
          htmlFor={inputId}
          className={
            "flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-3 py-4 text-xs text-muted-foreground transition-colors cursor-pointer " +
            (dragOver
              ? "border-brand-400 bg-brand-50/60 text-brand-700"
              : "border-border hover:border-brand-300 hover:bg-muted/30")
          }
        >
          <Upload className="h-4 w-4" />
          <span>
            <span className="text-brand-700 font-medium">Dosya seçin</span>{" "}
            veya buraya sürükleyip bırakın
          </span>
          <span className="text-[10px] text-muted-foreground">
            {KIND_HINT[kind]}
          </span>
        </label>
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

      {showImagePreview && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-2">
          <div className="h-14 w-14 rounded-md overflow-hidden bg-white border border-border flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Önizleme"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-brand-800 font-medium mb-0.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Görsel
            </div>
            <div className="truncate">{value}</div>
          </div>
        </div>
      )}

      {showFileLink && (
        <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-2">
          <div className="h-10 w-10 rounded-md bg-white border border-border flex items-center justify-center text-brand-700 flex-shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-xs text-muted-foreground flex-1">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-brand-700 font-medium hover:underline"
            >
              PDF'i aç
            </a>
            <div className="truncate">{value}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function isImageUrl(url: string) {
  if (!url) return false;
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);
}

function isPdfUrl(url: string) {
  if (!url) return false;
  return /\.pdf(\?.*)?$/i.test(url);
}
