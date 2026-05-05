import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { buildApplicationsZip } from "@/lib/application-zip";
import { buildSingleZipName } from "@/lib/filename";
import { contentDispositionAttachment } from "@/lib/file-fetch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Bir başvurunun tüm belgelerini ZIP olarak indirir.
 *
 * ZIP içindeki belge adları:
 *   `{appId}-{Ad_Soyad}-{Belge_Basligi}.{ext}`
 *
 * ZIP'in adı:
 *   `Basvuru-{appId}-{Ad_Soyad}.zip`
 */
export async function GET(
  _req: Request,
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

  const appRows = await db
    .select({ id: applications.id, fullName: applications.fullName })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  const app = appRows[0];
  if (!app) {
    return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
  }

  let zipBytes: Uint8Array;
  try {
    const out = await buildApplicationsZip([id]);
    zipBytes = out.zipBytes;
  } catch (err) {
    console.error("[applications/[id]/zip] ZIP üretim hatası", err);
    return NextResponse.json(
      { error: "ZIP oluşturulamadı" },
      { status: 500 },
    );
  }

  const filename = buildSingleZipName({
    applicationId: app.id,
    applicantFullName: app.fullName,
  });

  // Node.js runtime'da Response, Uint8Array'i destekler ama TypeScript'in
  // BodyInit tipi SharedArrayBuffer olasılığı için katı; cast güvenli.
  return new Response(zipBytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": contentDispositionAttachment(filename),
      "Content-Length": String(zipBytes.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
