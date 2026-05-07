/**
 * Admin: bir etkinliğe kaydolanların listesi.
 *   GET /api/admin/events/[id]/registrations
 *
 * Admin yetkisi zorunlu. Kullanıcı tablosuyla join'lenip ad-soyad,
 * e-posta, telefon ve kayıt tarihi döner.
 */
import { NextResponse, type NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventRegistrations, users } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";
import type { EventRegistration } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
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

  const { id: eventId } = await ctx.params;
  if (!eventId) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 400 });
  }

  const rows = await db
    .select({
      id: eventRegistrations.id,
      eventId: eventRegistrations.eventId,
      userId: eventRegistrations.userId,
      userFullName: users.fullName,
      userEmail: users.email,
      userPhone: users.phone,
      createdAt: eventRegistrations.createdAt,
    })
    .from(eventRegistrations)
    .innerJoin(users, eq(users.id, eventRegistrations.userId))
    .where(eq(eventRegistrations.eventId, eventId))
    .orderBy(desc(eventRegistrations.createdAt));

  const data: EventRegistration[] = rows.map((r) => ({
    id: r.id,
    eventId: r.eventId,
    userId: r.userId,
    userFullName: r.userFullName,
    userEmail: r.userEmail,
    userPhone: r.userPhone ?? "",
    createdAt: r.createdAt instanceof Date
      ? r.createdAt.toISOString()
      : String(r.createdAt),
  }));

  return NextResponse.json({ items: data });
}
