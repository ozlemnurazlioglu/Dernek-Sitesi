/**
 * İndirilen başvuru belgeleri için ad üretim yardımcıları.
 *
 * Format: `{appId}-{Ad_Soyad}-{Belge_Basligi}.{ext}`
 *  - appId   ham haliyle bırakılır (ör. "a-abc12345")
 *  - Ad Soyad ve Belge Başlığı PascalCase + alt-tire (örn. "Ayse_Yilmaz",
 *    "Ogrenci_Belgesi") — bu sayede üç bölüm tireyle ayrı kalır ve
 *    okunabilirlik korunur.
 */

import type { DocumentKey } from "./types";

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "C",
  ğ: "g", Ğ: "G",
  ı: "i", İ: "I",
  ö: "o", Ö: "O",
  ş: "s", Ş: "S",
  ü: "u", Ü: "U",
};

function asciiize(s: string): string {
  return s
    .split("")
    .map((c) => TR_MAP[c] ?? c)
    .join("")
    // ek olarak yaygın aksanlı harfleri kaldır
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Bir kelime grubunu PascalCase + alt tire ile birleştirir.
 * "ayşe yılmaz   öztürk" → "Ayse_Yilmaz_Ozturk"
 * Boş/whitespace giriş için "Bilinmiyor" döner.
 */
export function pascalUnderscore(input: string): string {
  const ascii = asciiize(input).trim();
  if (!ascii) return "Bilinmiyor";
  const words = ascii
    .split(/[\s_\-]+/)
    .map((w) => w.replace(/[^A-Za-z0-9]+/g, ""))
    .filter(Boolean);
  if (words.length === 0) return "Bilinmiyor";
  return words
    .map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase())
    .join("_");
}

/** Dosyanın orijinal adından/MIME tipinden uzantıyı çıkarır. */
export function pickExtension(opts: {
  fileName?: string | null;
  fileUrl?: string | null;
  contentType?: string | null;
}): string {
  // 1) URL'in path bölümünden
  if (opts.fileUrl) {
    const path = opts.fileUrl.split("?")[0]!;
    const m = path.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (m) return m[1]!.toLowerCase();
  }
  // 2) orijinal dosya adından
  if (opts.fileName) {
    const m = opts.fileName.match(/\.([a-zA-Z0-9]{2,5})$/);
    if (m) return m[1]!.toLowerCase();
  }
  // 3) MIME type'tan
  if (opts.contentType) {
    const map: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const ext = map[opts.contentType.toLowerCase().split(";")[0]!.trim()];
    if (ext) return ext;
  }
  return "bin";
}

/**
 * Tek bir başvuru belgesi için indirilebilir dosya adını üretir.
 * Örn: `a-abc12345-Ayse_Yilmaz-Ogrenci_Belgesi.pdf`
 */
export function buildDocumentDownloadName(opts: {
  applicationId: string;
  applicantFullName: string;
  docKey: DocumentKey;
  /** Admin'in "İstenen Belgeler" sayfasında belirlediği başlık.
   *  Yoksa docKey'den türetilir. */
  docTitle?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  contentType?: string | null;
}): string {
  const ext = pickExtension({
    fileName: opts.fileName,
    fileUrl: opts.fileUrl,
    contentType: opts.contentType,
  });
  const id = opts.applicationId;
  const name = pascalUnderscore(opts.applicantFullName);
  const title = pascalUnderscore(opts.docTitle || opts.docKey);
  return `${id}-${name}-${title}.${ext}`;
}

/**
 * Bir başvurunun tüm belgelerini içeren ZIP'in adı.
 * Örn: `Basvuru-a-abc12345-Ayse_Yilmaz.zip`
 */
export function buildSingleZipName(opts: {
  applicationId: string;
  applicantFullName: string;
}): string {
  const name = pascalUnderscore(opts.applicantFullName);
  return `Basvuru-${opts.applicationId}-${name}.zip`;
}

/**
 * Birden çok başvurunun tüm belgelerini içeren toplu ZIP'in adı.
 * Örn: `Basvurular-2026-05-05-12adet.zip`
 */
export function buildBulkZipName(count: number, isoDate?: string): string {
  const d = isoDate ? new Date(isoDate) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `Basvurular-${yyyy}-${mm}-${dd}-${count}adet.zip`;
}
