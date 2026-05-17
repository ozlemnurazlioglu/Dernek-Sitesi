/**
 * Admin için birden çok burs başvurusunu tek istekte silen endpoint.
 *
 * `purgeApplicationFiles` tüm ID'leri tek seferde dolaşır → tek DB sorgusu
 * + Vercel Blob için tek batch çağrısı. Sonrasında `applications` tablosundan
 * toplu `DELETE` yapılır; `application_documents` CASCADE ile gider.
 *
 * Yıl bazlı toplu temizlik (örn. "2024 başvurularını sil") için UI bu
 * endpoint'i kullanır — backend ID listesi alır, "tarih filtresi" UI
 * tarafında yapılır. Bu, "yanlışlıkla 50.000 başvuru sildim" gibi
 * kazaların önüne geçer (UI explicit liste hazırlamak zorunda).
 */

import { NextResponse, type NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { purgeApplicationFiles } from "@/lib/application-files";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Tek istekte silinebilecek üst sınır (kötü niyetli payload koruması). */
const MAX_BULK = 1000;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: { ids?: unknown };
  try {
    body = (await req.json()) as { ids?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON beklendi)" },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json(
      { error: "Silinecek başvuru ID listesi (ids) gönderilmedi" },
      { status: 400 },
    );
  }

  // Tip + uzunluk + tekilleştirme.
  const ids = Array.from(
    new Set(
      body.ids.filter(
        (x): x is string => typeof x === "string" && x.length > 0,
      ),
    ),
  );

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "Geçerli bir ID bulunamadı" },
      { status: 400 },
    );
  }
  if (ids.length > MAX_BULK) {
    return NextResponse.json(
      {
        error: `Tek seferde en fazla ${MAX_BULK} başvuru silinebilir. Daha fazlasını silmek için lütfen birkaç partide deneyin.`,
      },
      { status: 400 },
    );
  }

  // DB'de gerçekten var olanları bul (UI'nin gönderdiği listede artık
  // olmayan ID'ler olabilir).
  const existing = await db
    .select({ id: applications.id })
    .from(applications)
    .where(inArray(applications.id, ids));
  const existingIds = existing.map((r) => r.id);

  if (existingIds.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0, files: null });
  }

  // 1) ÖNCE fiziksel dosyalar.
  const fileResult = await purgeApplicationFiles(existingIds);

  // 2) DB toplu silme — `application_documents` CASCADE ile düşer.
  await db.delete(applications).where(inArray(applications.id, existingIds));

  return NextResponse.json({
    ok: true,
    deleted: existingIds.length,
    files: fileResult,
  });
}
