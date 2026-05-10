import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  applications,
  eventRegistrations,
} from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin panelinden bir üyeyi tamamen siler.
 *
 * Senaryo: bot kayıtlarını veya istenmeyen kullanıcıları temizlemek.
 *
 * Güvenlik:
 * - Yalnızca admin rolü çağırabilir.
 * - Admin **kendini silemez** (panel kilitlenmesin diye).
 *
 * Referans bütünlüğü:
 * - `sessions.userId` → users.id ON DELETE CASCADE (otomatik temizlenir).
 * - `applications.applicantId` ve `event_registrations.userId` için FK
 *   tanımlı değildir; bu yüzden tek transaction içinde elle temizleriz.
 *   Aksi halde silinen kullanıcıya ait yetim kayıtlar arşivde kalırdı.
 *
 * Bu uç tek bir id için çalışır; toplu silme için
 * `/api/admin/users/bulk-delete` ucu kullanılmalı (tek transaction içinde
 * büyük listeleri verimli işler).
 */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id } = await ctx.params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });
  }

  // Self-protect — yöneticinin kendini silmesi paneli kilitler.
  if (id === adminUser.id) {
    return NextResponse.json(
      { error: "Kendi hesabınızı silemezsiniz." },
      { status: 400 },
    );
  }

  const targetRows = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  const target = targetRows[0];
  if (!target) {
    return NextResponse.json(
      { error: "Kullanıcı bulunamadı" },
      { status: 404 },
    );
  }

  // İlişkili kayıtları + kullanıcıyı tek transaction içinde temizle.
  // Sessions zaten CASCADE; manuel silmemize gerek yok.
  await db.transaction(async (tx) => {
    await tx
      .delete(eventRegistrations)
      .where(eq(eventRegistrations.userId, id));
    await tx
      .delete(applications)
      .where(eq(applications.applicantId, id));
    await tx.delete(users).where(eq(users.id, id));
  });

  return NextResponse.json({
    ok: true,
    deleted: 1,
    email: target.email,
  });
}
