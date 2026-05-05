import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { applications, applicationDocuments } from "@/lib/db/schema";
import { loadApplicationWithDocs } from "@/lib/db/mappers";
import type { ScholarshipApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  let body: Partial<ScholarshipApplication> & { applicantId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const id = `a-${uid()}`;
  const submittedAt = new Date();
  const applicantId = body.applicantId ?? "guest";

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
