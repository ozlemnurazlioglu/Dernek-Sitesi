import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { AuthError, requireAdmin } from "@/lib/auth";
import { contentLists, isContentType } from "@/lib/db/content-tables";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ type: string; id: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { type, id } = await ctx.params;
  if (!isContentType(type)) {
    return NextResponse.json({ error: "Bilinmeyen içerik tipi" }, { status: 400 });
  }

  const def = contentLists[type];
  await db
    .delete(def.table as never)
    .where(eq((def.table as unknown as { id: never }).id, id as never));

  return NextResponse.json({ ok: true });
}
