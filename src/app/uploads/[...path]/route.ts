import { NextResponse, type NextRequest } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Yüklenen kullanıcı dosyalarını runtime'da disk'ten okuyup serve eden
 * dynamic route handler.
 *
 * Neden gerekli?
 *  Next.js 16'nın varsayılan davranışında public/uploads altındaki dosyalar
 *  build sırasında bir snapshot olarak değerlendiriliyor; build-time'da
 *  henüz yazılmamış dosyalar için /uploads/... URL'i 404 olarak prerender
 *  edilip edge cache'e işleniyor (yanıt başlığı: x-nextjs-cache: HIT,
 *  x-nextjs-prerender: 1). Sonradan disk'e yeni bir dosya yazılsa bile
 *  cache 404 cevabını dönmeye devam ediyor → admin panelden yüklenen
 *  yeni görseller "kırık ikon" olarak görünüyor.
 *
 *  Bu route /uploads/* trafiğini her zaman runtime'da işliyor (dynamic
 *  = "force-dynamic"). public/uploads klasöründen dosyayı her istekte
 *  doğrudan okuyup stream ediyor; böylece yüklendikten anında erişilebilir
 *  oluyor.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

function notFound() {
  return new NextResponse("Not Found", { status: 404 });
}

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/uploads/[...path]">,
) {
  // request.url'e dokunarak prerender'dan kesinlikle çıkıyoruz; statik
  // optimizer bu satır sayesinde route'u dynamic kabul ediyor.
  void req.url;

  const { path: parts } = await ctx.params;
  if (!Array.isArray(parts) || parts.length === 0) {
    return notFound();
  }

  // Path traversal koruması: ".." veya gizli dosya isteklerini reddet.
  for (const seg of parts) {
    if (
      !seg ||
      seg === "." ||
      seg === ".." ||
      seg.includes("/") ||
      seg.includes("\\") ||
      seg.startsWith(".")
    ) {
      return notFound();
    }
  }

  const fullPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    ...parts,
  );

  let info;
  try {
    info = await stat(fullPath);
  } catch {
    return notFound();
  }
  if (!info.isFile()) return notFound();

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  const buf = await readFile(fullPath);
  // Bytes'i bir Uint8Array'e açıkça kopyalıyoruz; Buffer Web Response API'si
  // tarafından doğrudan kabul edilmeyebilir.
  const body = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(info.size),
      // Yüklenen dosya isimleri timestamp + rastgele hash içerdiğinden
      // değişmez kabul ediyoruz. 30 gün tarayıcı cache yeterli.
      "Cache-Control": "public, max-age=2592000, immutable",
      "Last-Modified": info.mtime.toUTCString(),
    },
  });
}
