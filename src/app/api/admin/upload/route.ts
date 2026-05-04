import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin dosya yükleme endpoint'i.
 *
 * - `BLOB_READ_WRITE_TOKEN` varsa (Vercel ortamı) → Vercel Blob'a yazar ve
 *   public URL döner.
 * - Yoksa (yerel geliştirme) → `public/uploads/<yıl>/<ay>/` altına yazar.
 */

const ALLOWED: Record<string, { kind: "image" | "file"; ext: string }> = {
  "image/png": { kind: "image", ext: "png" },
  "image/jpeg": { kind: "image", ext: "jpg" },
  "image/webp": { kind: "image", ext: "webp" },
  "image/gif": { kind: "image", ext: "gif" },
  "image/svg+xml": { kind: "image", ext: "svg" },
  "application/pdf": { kind: "file", ext: "pdf" },
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz form verisi" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const kindHint = form.get("kind"); // "image" | "file" — opsiyonel

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Dosya boş" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Dosya çok büyük (en fazla ${Math.round(MAX_BYTES / 1024 / 1024)} MB)` },
      { status: 413 },
    );
  }

  const meta = ALLOWED[file.type];
  if (!meta) {
    return NextResponse.json(
      {
        error: `Desteklenmeyen dosya tipi: ${file.type || "bilinmiyor"}. PNG, JPG, WEBP, GIF, SVG veya PDF yükleyin.`,
      },
      { status: 415 },
    );
  }

  if (
    typeof kindHint === "string" &&
    (kindHint === "image" || kindHint === "file") &&
    kindHint !== meta.kind
  ) {
    return NextResponse.json(
      {
        error:
          kindHint === "image"
            ? "Buraya sadece görsel yüklenebilir"
            : "Buraya sadece PDF yüklenebilir",
      },
      { status: 415 },
    );
  }

  // Yıl/ay bazlı klasörle dağıt; aynı klasörde binlerce dosya birikmesin.
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const subdir = `${yyyy}/${mm}`;

  const id = randomBytes(8).toString("hex");
  const filename = `${Date.now()}-${id}.${meta.ext}`;
  const pathname = `uploads/${subdir}/${filename}`;

  // 1) Vercel Blob — token mevcutsa
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(pathname, file, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      return NextResponse.json({
        url: blob.url,
        kind: meta.kind,
        size: file.size,
        type: file.type,
        name: file.name,
      });
    } catch (err) {
      console.error("[upload] Vercel Blob hatası", err);
      return NextResponse.json(
        { error: "Dosya depolamaya yüklenemedi" },
        { status: 500 },
      );
    }
  }

  // 2) Yerel dosya sistemi (geliştirme)
  const buf = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(uploadsDir, { recursive: true });
  const fullPath = path.join(uploadsDir, filename);
  await writeFile(fullPath, buf);

  const url = `/uploads/${subdir}/${filename}`;
  return NextResponse.json({
    url,
    kind: meta.kind,
    size: file.size,
    type: file.type,
    name: file.name,
  });
}
