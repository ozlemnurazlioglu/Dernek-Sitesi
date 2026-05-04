import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { sessions, users } from "./db/schema";
import type { Role } from "./types";

export const SESSION_COOKIE = "dernek_session";
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  joinedAt: string;
  phone?: string;
  city?: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function newSessionToken() {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string) {
  const token = newSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.insert(sessions).values({
    token,
    userId,
    createdAt: now,
    expiresAt,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    expires: expiresAt,
  });
  return token;
}

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  jar.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Lazy cleanup of expired sessions (cheap; runs occasionally).
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

  const rows = await db
    .select({
      sessionUser: users,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.token, token))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }
  const u = row.sessionUser;
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    joinedAt: u.joinedAt.toISOString(),
    phone: u.phone ?? undefined,
    city: u.city ?? undefined,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Yetkisiz erişim", 401);
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new AuthError("Bu işlem için yetkiniz yok", 403);
  }
  return user;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
