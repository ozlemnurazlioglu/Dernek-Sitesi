/**
 * /api/admin/alumni/[id]
 *   PUT    → kaydı güncelle (kısmi alanlar)
 *   DELETE → kaydı sil
 */

import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { alumni } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AlumniInput = {
  fullName?: unknown;
  nationalId?: unknown;
  email?: unknown;
  phone?: unknown;
  schoolName?: unknown;
  department?: unknown;
  graduationYear?: unknown;
  parentName?: unknown;
  parentPhone?: unknown;
  parentRelation?: unknown;
  notes?: unknown;
};

function asString(v: unknown, max = 191): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function parseGradYear(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1950 || i > 2100) return null;
  return i;
}

export async function PUT(
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

  let body: AlumniInput;
  try {
    body = (await req.json()) as AlumniInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON)" },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};
  if (body.fullName !== undefined) {
    const v = asString(body.fullName);
    if (!v) {
      return NextResponse.json(
        { error: "Ad Soyad boş olamaz" },
        { status: 400 },
      );
    }
    updates.fullName = v;
  }
  if (body.nationalId !== undefined) updates.nationalId = asString(body.nationalId, 32);
  if (body.email !== undefined) updates.email = asString(body.email);
  if (body.phone !== undefined) updates.phone = asString(body.phone, 64);
  if (body.schoolName !== undefined) updates.schoolName = asString(body.schoolName);
  if (body.department !== undefined) updates.department = asString(body.department);
  if (body.graduationYear !== undefined) {
    const y = parseGradYear(body.graduationYear);
    if (y !== undefined) updates.graduationYear = y;
  }
  if (body.parentName !== undefined) updates.parentName = asString(body.parentName);
  if (body.parentPhone !== undefined) updates.parentPhone = asString(body.parentPhone, 64);
  if (body.parentRelation !== undefined)
    updates.parentRelation = asString(body.parentRelation, 80);
  if (body.notes !== undefined) {
    updates.notes =
      typeof body.notes === "string" ? body.notes.slice(0, 4000) : "";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Güncellenecek alan gönderilmedi" },
      { status: 400 },
    );
  }

  await db.update(alumni).set(updates).where(eq(alumni.id, id));
  return NextResponse.json({ ok: true });
}

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
  await db.delete(alumni).where(eq(alumni.id, id));
  return NextResponse.json({ ok: true });
}
