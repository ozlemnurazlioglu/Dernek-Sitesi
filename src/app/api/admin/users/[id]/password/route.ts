import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { AuthError, hashPassword, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin için bir kullanıcının şifresini SIFIRLAR.
 *
 * Senaryo: kullanıcı şifresini unuttu — admin panelden yenisini belirler.
 *
 * Güvenlik:
 * - Yalnızca admin rolü çağırabilir.
 * - İşlem başarılı olunca o kullanıcının TÜM aktif oturumları silinir.
 *   Aksi halde başka bir cihazda hâlâ açık olan eski oturumdan eski
 *   şifre olmadan da iş yapılabilirdi. Yeni şifre ile yeniden giriş zorunlu.
 *
 * Doğrulama:
 * - Şifre 6–128 karakter arası, sadece string.
 * - Hedef kullanıcı mevcut olmalı (404 aksi halde).
 *
 * Body: `{ "password": "yeniSifre123" }`
 * Yanıt: `{ ok: true }`
 */
const MIN_LEN = 6;
const MAX_LEN = 128;

export async function POST(
  req: NextRequest,
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

  let body: { password?: unknown };
  try {
    body = (await req.json()) as { password?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON beklendi)" },
      { status: 400 },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < MIN_LEN) {
    return NextResponse.json(
      { error: `Şifre en az ${MIN_LEN} karakter olmalı` },
      { status: 400 },
    );
  }
  if (password.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Şifre çok uzun (en fazla ${MAX_LEN} karakter)` },
      { status: 400 },
    );
  }

  const userRows = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  const target = userRows[0];
  if (!target) {
    return NextResponse.json(
      { error: "Kullanıcı bulunamadı" },
      { status: 404 },
    );
  }

  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));

  // Kullanıcının tüm aktif oturumlarını geçersiz kıl. Eski cihazlarda kalan
  // session token'larıyla eski şifreyi bilmeden iş yapılmasın.
  await db.delete(sessions).where(eq(sessions.userId, id));

  return NextResponse.json({ ok: true, email: target.email });
}
