import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-posta ve şifre gerekli." },
      { status: 400 },
    );
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const u = rows[0];
  if (!u) {
    return NextResponse.json(
      { error: "E-posta veya şifre hatalı." },
      { status: 401 },
    );
  }
  const ok = await verifyPassword(password, u.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "E-posta veya şifre hatalı." },
      { status: 401 },
    );
  }

  await createSession(u.id);

  return NextResponse.json({
    user: {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      joinedAt: u.joinedAt.toISOString(),
      phone: u.phone ?? undefined,
      city: u.city ?? undefined,
    },
  });
}
