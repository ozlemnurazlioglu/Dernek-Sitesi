import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  activityReports,
  agalar,
  announcementCategories,
  announcements,
  applications,
  applicationDocuments,
  bankAccounts,
  boardMembers,
  donationPresets,
  donationUses,
  donors,
  eventCategories,
  eventRegistrations,
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
import {
  rowToApplication,
  rowToEvent,
  rowToMessage,
  rowToNews,
  rowToSiteSettings,
} from "@/lib/db/mappers";
import { getCurrentUser } from "@/lib/auth";
import type { User } from "@/lib/types";
import { seedSiteSettings } from "@/lib/seed-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getCurrentUser();

  const [
    userRows,
    newsRows,
    eventRows,
    messageRows,
    appRows,
    docRows,
    settingsRows,
    pageBlocksRows,
    boardRows,
    milestoneRows,
    reportRows,
    programRows,
    docTypeRows,
    timelineRows,
    faqRows,
    testimonialRows,
    presetRows,
    useRows,
    newsCatRows,
    eventCatRows,
    legalPageRows,
    agaRows,
    financeRows,
    announcementCatRows,
    announcementRows,
    bankAccountRows,
    sponsorTierRows,
    sponsorRows,
    neighborhoodRows,
    donorRows,
    photoCategoryRows,
    photoRows,
    videoCategoryRows,
    videoRows,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(news),
    db.select().from(events),
    db.select().from(messages),
    db.select().from(applications),
    db.select().from(applicationDocuments),
    db.select().from(siteSettings),
    db.select().from(pageBlocks),
    db.select().from(boardMembers).orderBy(asc(boardMembers.sort)),
    db.select().from(milestones).orderBy(asc(milestones.sort)),
    db.select().from(activityReports).orderBy(asc(activityReports.sort)),
    db.select().from(scholarshipPrograms).orderBy(asc(scholarshipPrograms.sort)),
    db.select().from(requiredDocuments).orderBy(asc(requiredDocuments.sort)),
    db.select().from(scholarshipTimeline).orderBy(asc(scholarshipTimeline.sort)),
    db.select().from(faqs).orderBy(asc(faqs.sort)),
    db.select().from(testimonials).orderBy(asc(testimonials.sort)),
    db.select().from(donationPresets).orderBy(asc(donationPresets.sort)),
    db.select().from(donationUses).orderBy(asc(donationUses.sort)),
    db.select().from(newsCategories).orderBy(asc(newsCategories.sort)),
    db.select().from(eventCategories).orderBy(asc(eventCategories.sort)),
    db.select().from(legalPages).orderBy(asc(legalPages.sort)),
    db.select().from(agalar).orderBy(asc(agalar.sort)),
    db.select().from(financeItems).orderBy(asc(financeItems.sort)),
    db
      .select()
      .from(announcementCategories)
      .orderBy(asc(announcementCategories.sort)),
    db.select().from(announcements).orderBy(asc(announcements.sort)),
    db.select().from(bankAccounts).orderBy(asc(bankAccounts.sort)),
    db.select().from(sponsorTiers).orderBy(asc(sponsorTiers.sort)),
    db.select().from(sponsors).orderBy(asc(sponsors.sort)),
    db.select().from(neighborhoods).orderBy(asc(neighborhoods.sort)),
    db.select().from(donors).orderBy(asc(donors.sort)),
    db.select().from(photoCategories).orderBy(asc(photoCategories.sort)),
    db.select().from(photos).orderBy(asc(photos.sort)),
    db.select().from(videoCategories).orderBy(asc(videoCategories.sort)),
    db.select().from(videos).orderBy(asc(videos.sort)),
  ]);

  // Login olan kullanıcının kayıtlı olduğu etkinliklerin id listesi.
  // Anonim kullanıcı için sorgu hiç atılmaz; hepsi bir defa bootstrap'ta
  // gelir, sonra istemci taraflı state üzerinden güncellenir.
  const myEventRegistrations: string[] = me
    ? (
        await db
          .select({ eventId: eventRegistrations.eventId })
          .from(eventRegistrations)
          .where(eq(eventRegistrations.userId, me.id))
      ).map((r) => r.eventId)
    : [];

  const docsByApp = new Map<string, typeof docRows>();
  for (const d of docRows) {
    const arr = docsByApp.get(d.applicationId) ?? [];
    arr.push(d);
    docsByApp.set(d.applicationId, arr);
  }

  const usersOut: User[] = userRows.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    password: "",
    role: u.role,
    joinedAt: u.joinedAt.toISOString(),
    phone: u.phone ?? undefined,
    city: u.city ?? undefined,
  }));

  const settings = settingsRows[0]
    ? rowToSiteSettings(settingsRows[0])
    : seedSiteSettings;

  const pageBlocksMap: Record<string, unknown> = {};
  for (const b of pageBlocksRows) {
    let value: unknown = b.data;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        // Bazı block'lar (legal.kvkk, ui metinleri gibi) düz string olarak
        // saklanır — JSON.parse başarısız olunca null'a düşürmek admin'in
        // kaydettiği metni silmiş gibi gösterir. Mevcut string'i koru.
      }
    }
    pageBlocksMap[b.blockKey] = value;
  }

  return NextResponse.json({
    currentUser: me,
    users: usersOut,
    news: newsRows.map(rowToNews),
    events: eventRows.map(rowToEvent),
    messages: messageRows.map(rowToMessage),
    applications: appRows.map((a) =>
      rowToApplication(a, docsByApp.get(a.id) ?? []),
    ),
    siteSettings: settings,
    pageBlocks: pageBlocksMap,
    boardMembers: boardRows,
    milestones: milestoneRows,
    activityReports: reportRows,
    scholarshipPrograms: programRows.map((p) => {
      let reqs: unknown = p.requirements;
      if (typeof reqs === "string") {
        try {
          reqs = JSON.parse(reqs);
        } catch {
          reqs = [];
        }
      }
      return {
        ...p,
        requirements: Array.isArray(reqs) ? (reqs as string[]) : [],
      };
    }),
    requiredDocuments: docTypeRows,
    scholarshipTimeline: timelineRows,
    faqs: faqRows,
    testimonials: testimonialRows,
    donationPresets: presetRows,
    donationUses: useRows,
    newsCategories: newsCatRows,
    eventCategories: eventCatRows,
    legalPages: legalPageRows.map((p) => ({
      ...p,
      updatedAt: p.updatedAt.toISOString(),
    })),
    agalar: agaRows,
    financeItems: financeRows.map((r) => ({
      ...r,
      amount: Number(r.amount),
    })),
    announcementCategories: announcementCatRows,
    announcements: announcementRows,
    bankAccounts: bankAccountRows,
    sponsorTiers: sponsorTierRows,
    sponsors: sponsorRows,
    neighborhoods: neighborhoodRows,
    donors: donorRows,
    photoCategories: photoCategoryRows,
    photos: photoRows,
    videoCategories: videoCategoryRows,
    videos: videoRows,
    myEventRegistrations,
  });
}
