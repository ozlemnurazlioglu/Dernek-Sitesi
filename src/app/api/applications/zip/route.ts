import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { buildApplicationsZip } from "@/lib/application-zip";
import { buildBulkZipName } from "@/lib/filename";
import { contentDispositionAttachment } from "@/lib/file-fetch";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Birden çok başvurunun belgelerini tek bir ZIP olarak indirir.
 *
 * Kullanım:
 *   GET /api/applications/zip?ids=a-1,a-2,a-3
 *
 * ZIP yapısı:
 *   Basvurular-2026-05-05-3adet.zip
 *   ├─ a-1-Ali_Veli/
 *   │  ├─ a-1-Ali_Veli-Transkript.pdf
 *   │  └─ ...
 *   ├─ a-2-Ayse_Yilmaz/
 *   │  └─ ...
 *
 * Maksimum 50 başvuru bir kerede indirilir (timeout/memory koruması).
 */
const MAX_IDS = 50;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "En az bir başvuru ID belirtin (?ids=a-1,a-2)" },
      { status: 400 },
    );
  }

  if (ids.length > MAX_IDS) {
    return NextResponse.json(
      {
        error: `Tek seferde en fazla ${MAX_IDS} başvuru indirilebilir (istenen: ${ids.length})`,
      },
      { status: 400 },
    );
  }

  let zipBytes: Uint8Array;
  let count: number;
  try {
    const out = await buildApplicationsZip(ids);
    zipBytes = out.zipBytes;
    count = out.count;
  } catch (err) {
    console.error("[applications/zip] ZIP üretim hatası", err);
    return NextResponse.json(
      { error: "ZIP oluşturulamadı" },
      { status: 500 },
    );
  }

  const filename = buildBulkZipName(count);

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
