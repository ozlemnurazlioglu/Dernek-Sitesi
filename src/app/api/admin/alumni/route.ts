/**
 * /api/admin/alumni  — eski bursiyerler & velileri kayıt tablosu.
 *   GET  → tüm kayıtlar (admin liste)
 *   POST → manuel kayıt (body: tüm alanlar)
 *
 * Tüm endpoint'ler admin yetkisi gerektirir.
 */

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { alumni } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { rowToAlumni } from "@/lib/db/mappers";

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
  sourceApplicationId?: unknown;
};

function asString(v: unknown, max = 191): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function parseGradYear(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1950 || i > 2100) return null;
  return i;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
  const rows = await db.select().from(alumni).orderBy(desc(alumni.createdAt));
  return NextResponse.json({ items: rows.map(rowToAlumni) });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: AlumniInput;
  try {
    body = (await req.json()) as AlumniInput;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON)" },
      { status: 400 },
    );
  }

  const fullName = asString(body.fullName);
  if (!fullName) {
    return NextResponse.json(
      { error: "Ad Soyad zorunludur" },
      { status: 400 },
    );
  }

  const id = `alm_${randomUUID().slice(0, 12)}`;
  const now = new Date();
  await db.insert(alumni).values({
    id,
    fullName,
    nationalId: asString(body.nationalId, 32),
    email: asString(body.email),
    phone: asString(body.phone, 64),
    schoolName: asString(body.schoolName),
    department: asString(body.department),
    graduationYear: parseGradYear(body.graduationYear),
    parentName: asString(body.parentName),
    parentPhone: asString(body.parentPhone, 64),
    parentRelation: asString(body.parentRelation, 80),
    notes: typeof body.notes === "string" ? body.notes.slice(0, 4000) : "",
    sourceApplicationId: asString(body.sourceApplicationId, 64) || null,
    createdAt: now,
  });

  return NextResponse.json({
    item: {
      id,
      fullName,
      nationalId: asString(body.nationalId, 32),
      email: asString(body.email),
      phone: asString(body.phone, 64),
      schoolName: asString(body.schoolName),
      department: asString(body.department),
      graduationYear: parseGradYear(body.graduationYear) ?? undefined,
      parentName: asString(body.parentName),
      parentPhone: asString(body.parentPhone, 64),
      parentRelation: asString(body.parentRelation, 80),
      notes: typeof body.notes === "string" ? body.notes.slice(0, 4000) : "",
      sourceApplicationId: asString(body.sourceApplicationId, 64) || undefined,
      createdAt: now.toISOString(),
    },
  });
}
