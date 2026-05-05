import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  activityReports,
  agalar,
  announcementCategories,
  announcements,
  applicationDocuments,
  applications,
  boardMembers,
  donationPresets,
  donationUses,
  donors,
  eventCategories,
  events,
  faqs,
  financeItems,
  legalPages,
  messages,
  milestones,
  neighborhoods,
  news,
  newsCategories,
  pageBlocks,
  photoCategories,
  photos,
  requiredDocuments,
  scholarshipPrograms,
  scholarshipTimeline,
  siteSettings,
  sponsorTiers,
  sponsors,
  testimonials,
  users,
  videoCategories,
  videos,
} from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Sürüm — şema değişirse bumplanmalı, import bunu kontrol eder. */
const EXPORT_VERSION = 11;

/**
 * Tüm site içeriğini ve uygulama verisini tek bir JSON paketi olarak döndürür.
 *
 * Hassas veri politikası:
 * - `users` dahil edilir AMA `passwordHash` her zaman elenir. Üye bilgileri
 *   korunmalıdır; gerekirse bu endpoint kapatılabilir.
 * - `sessions` dahil edilmez (geçicidir, dışa aktarmanın anlamı yok).
 * - Yüklenen dosyalar (`/public/uploads/`) ayrıdır; JSON yedeği yalnızca veritabanı
 *   içeriğidir. Dosyaları manuel olarak yedeklemek gerekir.
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const [
    siteSettingsRows,
    pageBlocksRows,
    boardMembersRows,
    milestonesRows,
    activityReportsRows,
    scholarshipProgramsRows,
    requiredDocumentsRows,
    scholarshipTimelineRows,
    faqsRows,
    testimonialsRows,
    donationPresetsRows,
    donationUsesRows,
    newsCategoriesRows,
    eventCategoriesRows,
    legalPagesRows,
    agalarRows,
    financeItemsRows,
    announcementCategoriesRows,
    announcementsRows,
    sponsorTiersRows,
    sponsorsRows,
    neighborhoodsRows,
    donorsRows,
    photoCategoriesRows,
    photosRows,
    videoCategoriesRows,
    videosRows,
    newsRows,
    eventsRows,
    messagesRows,
    usersRows,
    applicationsRows,
    applicationDocumentsRows,
  ] = await Promise.all([
    db.select().from(siteSettings),
    db.select().from(pageBlocks),
    db.select().from(boardMembers),
    db.select().from(milestones),
    db.select().from(activityReports),
    db.select().from(scholarshipPrograms),
    db.select().from(requiredDocuments),
    db.select().from(scholarshipTimeline),
    db.select().from(faqs),
    db.select().from(testimonials),
    db.select().from(donationPresets),
    db.select().from(donationUses),
    db.select().from(newsCategories),
    db.select().from(eventCategories),
    db.select().from(legalPages),
    db.select().from(agalar),
    db.select().from(financeItems),
    db.select().from(announcementCategories),
    db.select().from(announcements),
    db.select().from(sponsorTiers),
    db.select().from(sponsors),
    db.select().from(neighborhoods),
    db.select().from(donors),
    db.select().from(photoCategories),
    db.select().from(photos),
    db.select().from(videoCategories),
    db.select().from(videos),
    db.select().from(news),
    db.select().from(events),
    db.select().from(messages),
    db.select().from(users),
    db.select().from(applications),
    db.select().from(applicationDocuments),
  ]);

  // passwordHash'i strip'le — üye verilerinin güvenliğini koru.
  const safeUsers = usersRows.map(({ passwordHash: _ph, ...rest }) => rest);

  const payload = {
    meta: {
      exportVersion: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      generator: "dernek-admin",
    },
    siteSettings: siteSettingsRows,
    pageBlocks: pageBlocksRows,
    content: {
      boardMembers: boardMembersRows,
      milestones: milestonesRows,
      activityReports: activityReportsRows,
      scholarshipPrograms: scholarshipProgramsRows,
      requiredDocuments: requiredDocumentsRows,
      scholarshipTimeline: scholarshipTimelineRows,
      faqs: faqsRows,
      testimonials: testimonialsRows,
      donationPresets: donationPresetsRows,
      donationUses: donationUsesRows,
      newsCategories: newsCategoriesRows,
      eventCategories: eventCategoriesRows,
      legalPages: legalPagesRows,
      agalar: agalarRows,
      financeItems: financeItemsRows,
      announcementCategories: announcementCategoriesRows,
      announcements: announcementsRows,
      sponsorTiers: sponsorTiersRows,
      sponsors: sponsorsRows,
      neighborhoods: neighborhoodsRows,
      donors: donorsRows,
      photoCategories: photoCategoriesRows,
      photos: photosRows,
      videoCategories: videoCategoriesRows,
      videos: videosRows,
    },
    publishing: {
      news: newsRows,
      events: eventsRows,
    },
    inbox: {
      messages: messagesRows,
    },
    members: {
      users: safeUsers,
    },
    applications: {
      applications: applicationsRows,
      documents: applicationDocumentsRows,
    },
  };

  const filename = `dernek-yedek-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
