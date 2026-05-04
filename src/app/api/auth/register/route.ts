import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  let body: {
    fullName?: unknown;
    email?: unknown;
    password?: unknown;
    phone?: unknown;
    city?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "Ad soyad, e-posta ve şifre zorunludur." },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Şifre en az 6 karakter olmalı." },
      { status: 400 },
    );
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length) {
    return NextResponse.json(
      { error: "Bu e-posta ile kayıtlı bir hesap zaten mevcut." },
      { status: 409 },
    );
  }

  const id = `u-${uid()}`;
  const joinedAt = new Date();
  await db.insert(users).values({
    id,
    fullName,
    email,
    passwordHash: await hashPassword(password),
    role: "member",
    joinedAt,
    phone: phone || null,
    city: city || null,
  });

  await createSession(id);

  return NextResponse.json({
    user: {
      id,
      fullName,
      email,
      role: "member" as const,
      joinedAt: joinedAt.toISOString(),
      phone: phone || undefined,
      city: city || undefined,
    },
  });
}
