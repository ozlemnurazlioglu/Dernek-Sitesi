import { db, schema } from "./db";
import {
  seedActivityReports,
  seedAgalar,
  seedAnnouncementCategories,
  seedAnnouncements,
  seedBoardMembers,
  seedDonationPresets,
  seedDonationUses,
  seedEventCategories,
  seedFaqs,
  seedFinanceItems,
  seedLegalPages,
  seedMilestones,
  seedNewsCategories,
  seedPageBlocks,
  seedRequiredDocuments,
  seedScholarshipPrograms,
  seedScholarshipTimeline,
  seedSiteSettings,
  seedSponsors,
  seedTestimonials,
} from "./seed-content";

export async function clearContentTables() {
  await db.delete(schema.pageBlocks);
  await db.delete(schema.donationUses);
  await db.delete(schema.donationPresets);
  await db.delete(schema.testimonials);
  await db.delete(schema.faqs);
  await db.delete(schema.scholarshipTimeline);
  await db.delete(schema.requiredDocuments);
  await db.delete(schema.scholarshipPrograms);
  await db.delete(schema.activityReports);
  await db.delete(schema.milestones);
  await db.delete(schema.boardMembers);
  await db.delete(schema.newsCategories);
  await db.delete(schema.eventCategories);
  await db.delete(schema.legalPages);
  await db.delete(schema.agalar);
  await db.delete(schema.financeItems);
  await db.delete(schema.announcements);
  await db.delete(schema.announcementCategories);
  await db.delete(schema.sponsors);
  await db.delete(schema.siteSettings);
}

export async function seedContent() {
  const now = new Date();

  await db.insert(schema.siteSettings).values({
    id: "main",
    ...seedSiteSettings,
    updatedAt: now,
  });

  for (const m of seedBoardMembers) {
    await db.insert(schema.boardMembers).values(m);
  }
  for (const m of seedMilestones) {
    await db.insert(schema.milestones).values(m);
  }
  for (const r of seedActivityReports) {
    await db.insert(schema.activityReports).values(r);
  }
  for (const p of seedScholarshipPrograms) {
    await db.insert(schema.scholarshipPrograms).values(p);
  }
  for (const d of seedRequiredDocuments) {
    await db.insert(schema.requiredDocuments).values(d);
  }
  for (const s of seedScholarshipTimeline) {
    await db.insert(schema.scholarshipTimeline).values(s);
  }
  for (const f of seedFaqs) {
    await db.insert(schema.faqs).values(f);
  }
  for (const t of seedTestimonials) {
    await db.insert(schema.testimonials).values(t);
  }
  for (const dp of seedDonationPresets) {
    await db.insert(schema.donationPresets).values(dp);
  }
  for (const du of seedDonationUses) {
    await db.insert(schema.donationUses).values(du);
  }
  for (const c of seedNewsCategories) {
    await db.insert(schema.newsCategories).values(c);
  }
  for (const c of seedEventCategories) {
    await db.insert(schema.eventCategories).values(c);
  }
  for (const lp of seedLegalPages) {
    await db.insert(schema.legalPages).values({
      ...lp,
      updatedAt: new Date(lp.updatedAt),
    });
  }
  for (const a of seedAgalar) {
    await db.insert(schema.agalar).values(a);
  }
  for (const f of seedFinanceItems) {
    await db.insert(schema.financeItems).values({
      ...f,
      amount: String(f.amount),
    });
  }
  for (const c of seedAnnouncementCategories) {
    await db.insert(schema.announcementCategories).values(c);
  }
  for (const a of seedAnnouncements) {
    await db.insert(schema.announcements).values(a);
  }
  for (const s of seedSponsors) {
    await db.insert(schema.sponsors).values(s);
  }

  for (const [blockKey, data] of Object.entries(seedPageBlocks)) {
    await db.insert(schema.pageBlocks).values({
      blockKey,
      data,
      updatedAt: now,
    });
  }
}
