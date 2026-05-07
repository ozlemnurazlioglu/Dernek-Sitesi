/**
 * Admin: SMS abone silme.
 *   DELETE /api/admin/sms-subscribers/[id]
 *
 * Admin yetkisi zorunlu. ID ile tek bir aboneyi siler.
 */
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { smsSubscribers } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
  if (!id) {
    return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });
  }

  await db.delete(smsSubscribers).where(eq(smsSubscribers.id, id));
  return NextResponse.json({ ok: true });
}
