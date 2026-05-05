import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  applicationDocuments,
  applications,
  requiredDocuments,
} from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { buildDocumentDownloadName } from "@/lib/filename";
import {
  contentDispositionAttachment,
  fetchDocumentBytes,
} from "@/lib/file-fetch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin için tek bir başvuru belgesini, başvuru numarası + ad-soyad +
 * belge başlığı ile yeniden adlandırarak indirir.
 *
 * Format: `{appId}-{Ad_Soyad}-{Belge_Basligi}.{ext}`
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string; docKey: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id, docKey } = await ctx.params;

  // Başvuru + ilgili belge tek seferde
  const appRows = await db
    .select({ id: applications.id, fullName: applications.fullName })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  const app = appRows[0];
  if (!app) {
    return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
  }

  const docRows = await db
    .select()
    .from(applicationDocuments)
    .where(
      and(
        eq(applicationDocuments.applicationId, id),
        eq(applicationDocuments.docKey, docKey),
      ),
    )
    .limit(1);
  const doc = docRows[0];
  if (!doc) {
    return NextResponse.json({ error: "Belge bulunamadı" }, { status: 404 });
  }
  if (!doc.fileUrl) {
    return NextResponse.json(
      { error: "Bu belge için kaydedilmiş bir dosya yok (eski demo verisi)" },
      { status: 410 },
    );
  }

  // Belge başlığı: requiredDocuments tablosundaki title'ı tercih et,
  // yoksa docKey'den türetilecek.
  const titleRows = await db
    .select({ title: requiredDocuments.title })
    .from(requiredDocuments)
    .where(eq(requiredDocuments.docKey, docKey))
    .limit(1);
  const docTitle = titleRows[0]?.title ?? docKey;

  const fetched = await fetchDocumentBytes(doc.fileUrl);
  if (!fetched) {
    return NextResponse.json(
      { error: "Dosya depodan okunamadı" },
      { status: 502 },
    );
  }

  const filename = buildDocumentDownloadName({
    applicationId: app.id,
    applicantFullName: app.fullName,
    docKey,
    docTitle,
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    contentType: fetched.contentType,
  });

  // Node.js runtime'da Response, Uint8Array'i destekler ama TypeScript'in
  // BodyInit tipi SharedArrayBuffer olasılığı için katı; cast güvenli.
  return new Response(fetched.bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": fetched.contentType,
      "Content-Disposition": contentDispositionAttachment(filename),
      "Content-Length": String(fetched.bytes.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
