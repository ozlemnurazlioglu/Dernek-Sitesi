/**
 * /api/admin/alumni/import-from-applications
 *
 * Onaylanmış başvurulardan eski bursiyer kaydı oluşturur.
 *
 * Akış:
 *   - status = "approved" olan tüm başvuruları çek
 *   - Daha önce import edilmiş olanları (sourceApplicationId match) atla
 *   - Geri kalanlar için alumni kaydı üret
 *   - Velinin ismi/telefonu boşsa başvurudaki baba bilgilerini kullan
 *
 * Önce dry-run modu: `?dryRun=1` query string ile sadece sayım döner.
 * Gerçek import için body.confirm=true gönderin.
 */

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { alumni, applications } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { computeExpectedGradYear } from "@/lib/graduation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";

  let confirm = false;
  if (!dryRun) {
    try {
      const body = (await req.json()) as { confirm?: unknown };
      confirm = body.confirm === true;
    } catch {
      // body opsiyonel — boş gönderildiyse confirm=false
    }
  }

  // Onaylanmış tüm başvuruları çek.
  const approved = await db
    .select()
    .from(applications)
    .where(eq(applications.status, "approved"));

  if (approved.length === 0) {
    return NextResponse.json({
      ok: true,
      total: 0,
      candidates: 0,
      skipped: 0,
      inserted: 0,
      dryRun: !confirm,
    });
  }

  const approvedIds = approved.map((a) => a.id);
  // Daha önce import edilmişleri tespit et.
  const existing = await db
    .select({ src: alumni.sourceApplicationId })
    .from(alumni)
    .where(inArray(alumni.sourceApplicationId, approvedIds));
  const alreadyImported = new Set(
    existing.map((r) => r.src).filter((x): x is string => !!x),
  );

  const candidates = approved.filter((a) => !alreadyImported.has(a.id));

  if (!confirm) {
    return NextResponse.json({
      ok: true,
      total: approved.length,
      candidates: candidates.length,
      skipped: alreadyImported.size,
      inserted: 0,
      dryRun: true,
    });
  }

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      total: approved.length,
      candidates: 0,
      skipped: alreadyImported.size,
      inserted: 0,
      dryRun: false,
    });
  }

  const now = new Date();
  const rows = candidates.map((a) => {
    const expected =
      a.expectedGradYear ?? computeExpectedGradYear(a.schoolType, a.grade);
    return {
      id: `alm_${randomUUID().slice(0, 12)}`,
      fullName: a.fullName,
      nationalId: a.nationalId,
      email: a.email,
      phone: a.phone,
      schoolName: a.schoolName,
      department: a.department,
      graduationYear: expected ?? null,
      parentName: a.parentReferenceName || a.fatherName,
      parentPhone: a.parentReferencePhone || "",
      parentRelation: a.parentReferenceName ? "Veli" : "Baba",
      notes: `Onaylı başvurudan otomatik import (${a.id})`,
      sourceApplicationId: a.id,
      createdAt: now,
    };
  });

  // Toplu insert — VALUES çok büyürse Drizzle'ın chunking'i devreye girer.
  await db.insert(alumni).values(rows);

  return NextResponse.json({
    ok: true,
    total: approved.length,
    candidates: candidates.length,
    skipped: alreadyImported.size,
    inserted: rows.length,
    dryRun: false,
  });
}
