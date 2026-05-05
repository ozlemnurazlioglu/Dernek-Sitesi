import { NextResponse, type NextRequest } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import {
  AuthError,
  SESSION_COOKIE,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Giriş yapmış kullanıcının kendi şifresini değiştirir.
 *
 * Akış:
 * 1) `currentPassword` doğrulanır (verifyPassword).
 * 2) `newPassword` validasyonu (uzunluk, eski ile aynı olmama).
 * 3) Yeni hash kaydedilir.
 * 4) Kullanıcının DİĞER cihazlardaki oturumları silinir; mevcut tarayıcının
 *    oturumu (cookie'deki token) korunur — sayfa yenilenmeden çalışmaya
 *    devam eder. (Admin sıfırlamasından farklı: orada admin kullanıcı adına
 *    işlem yaptığı için tüm oturumlar gider.)
 *
 * Body: `{ "currentPassword": "...", "newPassword": "..." }`
 */
const MIN_LEN = 6;
const MAX_LEN = 128;

export async function POST(req: NextRequest) {
  let me;
  try {
    me = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON beklendi)" },
      { status: 400 },
    );
  }

  const current =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const next =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!current) {
    return NextResponse.json(
      { error: "Mevcut şifrenizi girin" },
      { status: 400 },
    );
  }
  if (next.length < MIN_LEN) {
    return NextResponse.json(
      { error: `Yeni şifre en az ${MIN_LEN} karakter olmalı` },
      { status: 400 },
    );
  }
  if (next.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Yeni şifre çok uzun (en fazla ${MAX_LEN} karakter)` },
      { status: 400 },
    );
  }
  if (next === current) {
    return NextResponse.json(
      { error: "Yeni şifre mevcut şifre ile aynı olamaz" },
      { status: 400 },
    );
  }

  const rows = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, me.id))
    .limit(1);
  const u = rows[0];
  if (!u) {
    return NextResponse.json(
      { error: "Hesap bulunamadı" },
      { status: 404 },
    );
  }

  const ok = await verifyPassword(current, u.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Mevcut şifre hatalı" },
      { status: 400 },
    );
  }

  const newHash = await hashPassword(next);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, me.id));

  // Kendi diğer oturumlarımı sonlandır (mevcut tarayıcı korunur).
  const jar = await cookies();
  const currentToken = jar.get(SESSION_COOKIE)?.value;
  if (currentToken) {
    await db
      .delete(sessions)
      .where(
        and(eq(sessions.userId, me.id), ne(sessions.token, currentToken)),
      );
  }

  return NextResponse.json({ ok: true });
}
