import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, schema } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/auth";
import {
  seedApplications,
  seedEvents,
  seedMessages,
  seedNews,
  seedUsers,
} from "@/lib/seed-data";
import {
  clearContentTables,
  seedContent,
} from "@/lib/seed-content-runner";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  await db.delete(schema.sessions);
  await db.delete(schema.applicationDocuments);
  await db.delete(schema.applications);
  await db.delete(schema.messages);
  await db.delete(schema.events);
  await db.delete(schema.news);
  await db.delete(schema.users);
  await clearContentTables();

  for (const u of seedUsers) {
    await db.insert(schema.users).values({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      passwordHash: await bcrypt.hash(u.password, 10),
      role: u.role,
      joinedAt: new Date(u.joinedAt),
      phone: u.phone ?? null,
      city: u.city ?? null,
    });
  }
  for (const n of seedNews) {
    await db.insert(schema.news).values({
      id: n.id,
      slug: n.slug,
      title: n.title,
      excerpt: n.excerpt,
      body: n.body,
      cover: n.cover,
      category: n.category,
      publishedAt: new Date(n.publishedAt),
      author: n.author,
    });
  }
  for (const e of seedEvents) {
    await db.insert(schema.events).values({
      id: e.id,
      slug: e.slug,
      title: e.title,
      description: e.description,
      cover: e.cover,
      startsAt: new Date(e.startsAt),
      endsAt: new Date(e.endsAt),
      location: e.location,
      capacity: e.capacity,
      registered: e.registered,
      category: e.category,
    });
  }
  for (const a of seedApplications) {
    await db.insert(schema.applications).values({
      id: a.id,
      applicantId: a.applicantId,
      status: a.status,
      submittedAt: new Date(a.submittedAt),
      reviewedAt: a.reviewedAt ? new Date(a.reviewedAt) : null,
      reviewerNote: a.reviewerNote ?? null,
      score: a.score ?? null,
      fullName: a.fullName,
      nationalId: a.nationalId,
      birthDate: a.birthDate,
      gender: a.gender,
      email: a.email,
      phone: a.phone,
      address: a.address,
      city: a.city,
      schoolType: a.schoolType,
      schoolName: a.schoolName,
      department: a.department,
      grade: a.grade,
      gpa: a.gpa,
      fatherName: a.fatherName,
      fatherJob: a.fatherJob,
      fatherIncome: a.fatherIncome,
      motherName: a.motherName,
      motherJob: a.motherJob,
      motherIncome: a.motherIncome,
      siblings: a.siblings,
      workingMembers: a.workingMembers,
      previousScholarship: a.previousScholarship,
      previousScholarshipDetail: a.previousScholarshipDetail ?? null,
      iban: a.iban,
      motivationLetter: a.motivationLetter,
    });
    for (const doc of Object.values(a.documents)) {
      if (!doc) continue;
      await db.insert(schema.applicationDocuments).values({
        applicationId: a.id,
        docKey: doc.key,
        fileName: doc.fileName,
        size: doc.size,
        uploadedAt: new Date(doc.uploadedAt),
      });
    }
  }
  for (const m of seedMessages) {
    await db.insert(schema.messages).values({
      id: m.id,
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      createdAt: new Date(m.createdAt),
      read: m.read,
    });
  }

  await seedContent();

  return NextResponse.json({ ok: true });
}
