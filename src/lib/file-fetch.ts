import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Bir başvuru belgesinin URL'ini alıp ham byte içeriğini döner.
 *
 * - HTTP(S) URL'ler için fetch kullanılır (Vercel Blob senaryosu).
 * - "/" ile başlayan URL'ler `public/` altındaki yerel dosya kabul edilir
 *   (yerel geliştirme veya BLOB_READ_WRITE_TOKEN'sız production senaryosu).
 *
 * Hata durumunda `null` döner; çağıran tarafta uygun durum kodu üretilir.
 */
export async function fetchDocumentBytes(fileUrl: string): Promise<{
  bytes: Uint8Array;
  contentType: string;
} | null> {
  if (!fileUrl) return null;

  if (/^https?:\/\//i.test(fileUrl)) {
    try {
      const res = await fetch(fileUrl, { cache: "no-store" });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      return {
        bytes: new Uint8Array(buf),
        contentType:
          res.headers.get("content-type") ?? "application/octet-stream",
      };
    } catch (err) {
      console.error("[file-fetch] uzak dosya hatası", fileUrl, err);
      return null;
    }
  }

  if (fileUrl.startsWith("/")) {
    try {
      const fsPath = path.join(process.cwd(), "public", fileUrl);
      const buf = await readFile(fsPath);
      return {
        bytes: new Uint8Array(buf),
        contentType: guessContentTypeFromPath(fileUrl),
      };
    } catch (err) {
      console.error("[file-fetch] yerel dosya hatası", fileUrl, err);
      return null;
    }
  }

  return null;
}

function guessContentTypeFromPath(p: string): string {
  const ext = (p.split("?")[0]!.split(".").pop() ?? "").toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext] ?? "application/octet-stream";
}

/** Content-Disposition header'ı için RFC 5987 uyumlu güvenli filename üretir. */
export function contentDispositionAttachment(filename: string): string {
  // Sadece ASCII karakterler kalsın diye basitleştir
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  const utf8 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${utf8}`;
}
