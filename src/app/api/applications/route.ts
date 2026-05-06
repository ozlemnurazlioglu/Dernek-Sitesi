import { NextResponse, type NextRequest } from "next/server";
import { like } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, applicationDocuments } from "@/lib/db/schema";
import { loadApplicationWithDocs } from "@/lib/db/mappers";
import type { ScholarshipApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Yeni başvuru için "{YYYY}burs{NN}" formatında ID üretir.
 *
 * Aynı yıl içinde mevcut başvurulardan en büyük sıra bulunur, +1 atılır,
 * 2 hane sıfır dolgulu yazılır (100+ olunca doğal olarak 3 haneye geçer).
 * Eş zamanlı iki POST aynı sıraya çakışırsa PK violation alır;
 * `insertWithRetry` bunu yakalayıp bir sonraki sıra ile tekrar dener.
 */
async function nextApplicationId(year: number): Promise<string> {
  const prefix = `${year}burs`;
  const rows = await db
    .select({ id: applications.id })
    .from(applications)
    .where(like(applications.id, `${prefix}%`));
  let max = 0;
  for (const r of rows) {
    const n = parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  let body: Partial<ScholarshipApplication> & { applicantId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const submittedAt = new Date();
  const year = submittedAt.getFullYear();
  const applicantId = body.applicantId ?? "guest";

  // Çakışma durumunda 5 kez yeniden dener.
  let id = await nextApplicationId(year);
  let attempts = 5;
  while (attempts-- > 0) {
    try {
      await db.insert(applications).values({
        id,
        applicantId,
        status: "submitted",
        submittedAt,
        fullName: body.fullName ?? "",
        nationalId: body.nationalId ?? "",
        birthDate: body.birthDate ?? "1970-01-01",
        gender: body.gender ?? "belirtmek_istemiyorum",
        email: body.email ?? "",
        phone: body.phone ?? "",
        address: body.address ?? "",
        city: body.city ?? "",
        schoolType: body.schoolType ?? "lisans",
        schoolName: body.schoolName ?? "",
        department: body.department ?? "",
        grade: body.grade ?? "",
        gpa: body.gpa ?? "",
        fatherName: body.fatherName ?? "",
        fatherJob: body.fatherJob ?? "",
        fatherIncome: body.fatherIncome ?? "0",
        motherName: body.motherName ?? "",
        motherJob: body.motherJob ?? "",
        motherIncome: body.motherIncome ?? "0",
        siblings: body.siblings ?? 0,
        workingMembers: body.workingMembers ?? 0,
        previousScholarship: body.previousScholarship ?? false,
        previousScholarshipDetail: body.previousScholarshipDetail ?? null,
        iban: body.iban ?? "",
        motivationLetter: body.motivationLetter ?? "",
      });
      break;
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code: string }).code
          : "";
      if (code === "ER_DUP_ENTRY" && attempts > 0) {
        id = await nextApplicationId(year);
        continue;
      }
      throw err;
    }
  }

  const docs = body.documents ?? {};
  for (const doc of Object.values(docs)) {
    if (!doc) continue;
    await db.insert(applicationDocuments).values({
      applicationId: id,
      docKey: doc.key,
      fileName: doc.fileName,
      size: doc.size,
      uploadedAt: new Date(doc.uploadedAt),
      fileUrl: doc.url ?? "",
    });
  }

  const created = await loadApplicationWithDocs(id);
  return NextResponse.json({ application: created });
}
