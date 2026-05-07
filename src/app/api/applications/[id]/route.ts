import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applicationDocuments, applications } from "@/lib/db/schema";
import {
  AuthError,
  getCurrentUser,
  requireAdmin,
  requireUser,
} from "@/lib/auth";
import { loadApplicationWithDocs } from "@/lib/db/mappers";
import type {
  ApplicationDocument,
  ApplicationStatus,
  ScholarshipApplication,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: readonly ApplicationStatus[] = [
  "submitted",
  "in_review",
  "approved",
  "rejected",
];

/** Owner'ın kendi başvurusunu güncelleyebileceği durumlar. */
const OWNER_EDITABLE_STATUSES: readonly ApplicationStatus[] = [
  "submitted",
  "in_review",
];

/* ------------------------------------------------------------------ */
/*  PATCH — Admin'in inceleme aksiyonu (durum, not, puan).            */
/* ------------------------------------------------------------------ */

export async function PATCH(
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
  let body: { status?: unknown; note?: unknown; score?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const status =
    typeof body.status === "string" &&
    (VALID_STATUSES as readonly string[]).includes(body.status)
      ? (body.status as ApplicationStatus)
      : null;
  if (!status) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }

  const updates: Partial<typeof applications.$inferInsert> = {
    status,
    reviewedAt: new Date(),
  };
  if (typeof body.note === "string") updates.reviewerNote = body.note;
  if (typeof body.score === "number") updates.score = body.score;

  await db.update(applications).set(updates).where(eq(applications.id, id));
  return NextResponse.json({ ok: true });
}

/* ------------------------------------------------------------------ */
/*  PUT — Owner (veya admin) tarafından tam güncelleme + belge diff.  */
/* ------------------------------------------------------------------ */

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  let me;
  try {
    me = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id } = await ctx.params;

  const existingRows = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  const existing = existingRows[0];
  if (!existing) {
    return NextResponse.json(
      { error: "Başvuru bulunamadı" },
      { status: 404 },
    );
  }

  const isOwner = existing.applicantId === me.id;
  const isAdmin = me.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { error: "Bu başvuruyu düzenleme yetkiniz yok" },
      { status: 403 },
    );
  }

  // Owner kullanıcı sadece beklemede / incelemede olan başvurusunu
  // düzenleyebilir; onaylanmış / reddedilmiş başvurular kilitli olur.
  if (
    isOwner &&
    !isAdmin &&
    !(OWNER_EDITABLE_STATUSES as readonly string[]).includes(existing.status)
  ) {
    return NextResponse.json(
      {
        error:
          existing.status === "approved"
            ? "Onaylanmış başvurular düzenlenemez. Lütfen yetkililerimizle iletişime geçin."
            : existing.status === "rejected"
              ? "Reddedilmiş başvurular düzenlenemez. Yeni bir başvuru oluşturabilirsiniz."
              : "Bu başvuru şu anda düzenlenemez.",
        code: "STATUS_LOCKED",
      },
      { status: 409 },
    );
  }

  let body: Partial<ScholarshipApplication> & {
    documents?: Record<string, ApplicationDocument | null | undefined>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  // Owner kendi başvurusunda status / score / reviewerNote / applicantId
  // alanlarını değiştiremez. Admin de PUT üzerinden bunlara dokunmaz;
  // bunlar için ayrı PATCH endpoint'i kullanılır.
  const updates: Partial<typeof applications.$inferInsert> = {};
  if (typeof body.fullName === "string") updates.fullName = body.fullName;
  if (typeof body.nationalId === "string") updates.nationalId = body.nationalId;
  if (typeof body.birthDate === "string") updates.birthDate = body.birthDate;
  if (
    body.gender === "kadin" ||
    body.gender === "erkek" ||
    body.gender === "belirtmek_istemiyorum"
  ) {
    updates.gender = body.gender;
  }
  if (typeof body.email === "string") updates.email = body.email;
  if (typeof body.phone === "string") updates.phone = body.phone;
  if (typeof body.address === "string") updates.address = body.address;
  if (typeof body.city === "string") updates.city = body.city;
  if (
    body.schoolType === "lise" ||
    body.schoolType === "onlisans" ||
    body.schoolType === "lisans" ||
    body.schoolType === "yuksek_lisans" ||
    body.schoolType === "doktora"
  ) {
    updates.schoolType = body.schoolType;
  }
  if (typeof body.schoolName === "string") updates.schoolName = body.schoolName;
  if (typeof body.department === "string") updates.department = body.department;
  if (typeof body.grade === "string") updates.grade = body.grade;
  if (typeof body.gpa === "string") updates.gpa = body.gpa;
  if (typeof body.fatherName === "string") updates.fatherName = body.fatherName;
  if (typeof body.fatherJob === "string") updates.fatherJob = body.fatherJob;
  if (typeof body.fatherIncome === "string")
    updates.fatherIncome = body.fatherIncome;
  if (typeof body.motherName === "string") updates.motherName = body.motherName;
  if (typeof body.motherJob === "string") updates.motherJob = body.motherJob;
  if (typeof body.motherIncome === "string")
    updates.motherIncome = body.motherIncome;
  if (typeof body.siblings === "number") updates.siblings = body.siblings;
  if (typeof body.workingMembers === "number")
    updates.workingMembers = body.workingMembers;
  if (typeof body.previousScholarship === "boolean")
    updates.previousScholarship = body.previousScholarship;
  if ("previousScholarshipDetail" in body) {
    updates.previousScholarshipDetail =
      typeof body.previousScholarshipDetail === "string"
        ? body.previousScholarshipDetail
        : null;
  }
  if (typeof body.iban === "string") updates.iban = body.iban;
  if (typeof body.motivationLetter === "string")
    updates.motivationLetter = body.motivationLetter;

  if (Object.keys(updates).length > 0) {
    await db.update(applications).set(updates).where(eq(applications.id, id));
  }

  /* ----------------- Belge diff (varsa) ----------------- */
  if (body.documents && typeof body.documents === "object") {
    const existingDocs = await db
      .select()
      .from(applicationDocuments)
      .where(eq(applicationDocuments.applicationId, id));
    const existingByKey = new Map(existingDocs.map((d) => [d.docKey, d]));

    const incoming = body.documents as Record<
      string,
      ApplicationDocument | null | undefined
    >;
    const incomingKeys = new Set<string>();

    for (const [k, v] of Object.entries(incoming)) {
      if (!v) continue; // null/undefined: silinmesi istenmiş ya da boş
      incomingKeys.add(k);
      const prev = existingByKey.get(k);
      const next = {
        applicationId: id,
        docKey: k,
        fileName: v.fileName,
        size: v.size,
        uploadedAt: v.uploadedAt ? new Date(v.uploadedAt) : new Date(),
        fileUrl: v.url ?? "",
      };
      if (!prev) {
        await db.insert(applicationDocuments).values(next);
      } else if (
        prev.fileUrl !== next.fileUrl ||
        prev.fileName !== next.fileName ||
        prev.size !== next.size
      ) {
        await db
          .update(applicationDocuments)
          .set(next)
          .where(
            and(
              eq(applicationDocuments.applicationId, id),
              eq(applicationDocuments.docKey, k),
            ),
          );
      }
    }

    // Body'de gelmeyen / null geldiği eski belgeler silinir.
    for (const [k] of existingByKey) {
      const incomingValue = incoming[k];
      if (!incomingKeys.has(k) || incomingValue === null) {
        await db
          .delete(applicationDocuments)
          .where(
            and(
              eq(applicationDocuments.applicationId, id),
              eq(applicationDocuments.docKey, k),
            ),
          );
      }
    }
  }

  const fresh = await loadApplicationWithDocs(id);
  return NextResponse.json({ application: fresh });
}

/* ------------------------------------------------------------------ */
/*  GET — owner ya da admin tek başvuruyu çekebilsin.                  */
/* ------------------------------------------------------------------ */

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const fresh = await loadApplicationWithDocs(id);
  if (!fresh) {
    return NextResponse.json({ error: "Başvuru bulunamadı" }, { status: 404 });
  }
  if (fresh.applicantId !== me.id && me.role !== "admin") {
    return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });
  }
  return NextResponse.json({ application: fresh });
}
