import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  activityReports,
  agalar,
  announcementCategories,
  announcements,
  applications,
  applicationDocuments,
  boardMembers,
  donationPresets,
  donationUses,
  eventCategories,
  events,
  faqs,
  financeItems,
  legalPages,
  messages,
  milestones,
  news,
  newsCategories,
  pageBlocks,
  requiredDocuments,
  scholarshipPrograms,
  scholarshipTimeline,
  siteSettings,
  sponsors,
  testimonials,
  users,
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
    sponsorRows,
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
    db.select().from(sponsors).orderBy(asc(sponsors.sort)),
  ]);

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
    pageBlocksMap[b.blockKey] = b.data;
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
    scholarshipPrograms: programRows.map((p) => ({
      ...p,
      requirements: Array.isArray(p.requirements)
        ? (p.requirements as string[])
        : [],
    })),
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
    sponsors: sponsorRows,
  });
}
