import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { put } from "@vercel/blob";
import { AuthError, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Öğrencinin burs başvurusunda belge yüklemek için kullandığı endpoint.
 *
 * Erişim: yalnızca giriş yapmış üye.
 * Depolama: BLOB_READ_WRITE_TOKEN varsa Vercel Blob, yoksa
 *           public/uploads/applications/<userId>/<yıl>/<ay>/.
 *
 * Kabul edilen tipler: PDF, JPG, JPEG, PNG, WEBP. Maks 10 MB.
 */

const ALLOWED: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
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
  const docKey = form.get("docKey");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  if (typeof docKey !== "string" || !docKey.trim()) {
    return NextResponse.json(
      { error: "Belge tipi belirtilmemiş (docKey)" },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Dosya boş" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Dosya çok büyük (en fazla ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 413 },
    );
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      {
        error: `Desteklenmeyen dosya tipi: ${file.type || "bilinmiyor"}. Sadece PDF, JPG, PNG veya WEBP yükleyin.`,
      },
      { status: 415 },
    );
  }

  // userId klasörü ayrımı yetkisiz erişim halinde de listelemeyi zorlaştırır.
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const subdir = `applications/${user.id}/${yyyy}/${mm}`;

  const id = randomBytes(8).toString("hex");
  const safeKey = docKey.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) || "doc";
  const filename = `${Date.now()}-${id}-${safeKey}.${ext}`;
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
        size: file.size,
        type: file.type,
        name: file.name,
      });
    } catch (err) {
      console.error("[applications/upload] Vercel Blob hatası", err);
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
    size: file.size,
    type: file.type,
    name: file.name,
  });
}
