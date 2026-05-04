import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "../src/lib/db";
import {
  seedApplications,
  seedEvents,
  seedMessages,
  seedNews,
  seedUsers,
} from "../src/lib/seed-data";
import { clearContentTables, seedContent } from "../src/lib/seed-content-runner";

async function main() {
  console.log("→ Seed başlıyor...");

  // Tablolardaki tüm kayıtları temizle (FK sırası önemli)
  await db.delete(schema.sessions);
  await db.delete(schema.applicationDocuments);
  await db.delete(schema.applications);
  await db.delete(schema.messages);
  await db.delete(schema.events);
  await db.delete(schema.news);
  await db.delete(schema.users);
  await clearContentTables();

  // Users (şifreler bcrypt ile hash'lenir)
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
  console.log(`✓ ${seedUsers.length} kullanıcı eklendi`);

  // News
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
  console.log(`✓ ${seedNews.length} haber eklendi`);

  // Events
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
  console.log(`✓ ${seedEvents.length} etkinlik eklendi`);

  // Applications + documents
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
  console.log(`✓ ${seedApplications.length} başvuru eklendi`);

  // Messages
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
  console.log(`✓ ${seedMessages.length} mesaj eklendi`);

  // İçerik blokları ve admin'den yönetilen tüm metinler
  await seedContent();
  console.log("✓ Site içeriği (ayarlar, kurul, tarihçe, programlar, SSS vs.) eklendi");

  console.log("\n✓ Seed tamamlandı.");
  console.log("  Yönetici: admin@kumrulular.com / admin123");
  console.log("  Üye:      ayse@example.com    / uye123");
  // Doğrulama
  const adminCheck = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, "admin@kumrulular.com"))
    .limit(1);
  if (!adminCheck.length) throw new Error("Admin kullanıcı oluşturulamadı");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Seed hatası:", err);
    process.exit(1);
  });
