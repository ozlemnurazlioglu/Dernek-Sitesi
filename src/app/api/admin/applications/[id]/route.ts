/**
 * Admin için tek bir burs başvurusunu kalıcı olarak silen endpoint.
 *
 * - `applicationDocuments.applicationId` FK'si `onDelete: "cascade"` ile
 *   tanımlı olduğundan, `applications` satırını silmek yeterli; ilgili
 *   belge kayıtları DB tarafında otomatik düşer.
 * - Bunun yanında *fiziksel* dosyalar (Vercel Blob veya
 *   `public/uploads/applications/...`) da temizlenir; aksi halde başvuru
 *   silinse bile diskte / Blob'da yetim dosyalar kalır.
 *
 * Dosya silme `purgeApplicationFiles` içinde "best-effort"tur: bir dosyanın
 * silinmesi başarısız olsa (örn. zaten yok) bile başvurunun DB silinmesi
 * yine de gerçekleşir.
 */

import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { purgeApplicationFiles } from "@/lib/application-files";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id } = await ctx.params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Geçersiz başvuru kimliği" }, {
      status: 400,
    });
  }

  // Başvurunun var olup olmadığını kontrol et — 404 vs 200 ayrımı için.
  const rows = await db
    .select({ id: applications.id, fullName: applications.fullName })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  const target = rows[0];
  if (!target) {
    return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
  }

  // 1) ÖNCE fiziksel dosyaları temizle (best-effort).
  //    Sıra önemli: DB silindikten sonra `fileUrl`'lere ulaşamayız çünkü
  //    `application_documents` satırları CASCADE ile düşer.
  const fileResult = await purgeApplicationFiles([id]);

  // 2) Şimdi DB satırını sil — `application_documents` da CASCADE ile gider.
  await db.delete(applications).where(eq(applications.id, id));

  return NextResponse.json({
    ok: true,
    deleted: 1,
    fullName: target.fullName,
    files: fileResult,
  });
}
