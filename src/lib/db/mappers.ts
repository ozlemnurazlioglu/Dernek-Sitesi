import { eq } from "drizzle-orm";
import { db } from "./index";
import { applicationDocuments, applications, siteSettings } from "./schema";
import type {
  ApplicationDocument,
  ContactMessage,
  DocumentKey,
  EventItem,
  NewsItem,
  ScholarshipApplication,
  SiteSettings,
} from "../types";

type DbDocRow = typeof applicationDocuments.$inferSelect;
type DbAppRow = typeof applications.$inferSelect;

export function rowToNews(r: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  category: NewsItem["category"];
  publishedAt: Date;
  author: string;
}): NewsItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    cover: r.cover,
    category: r.category,
    publishedAt: r.publishedAt.toISOString(),
    author: r.author,
  };
}

export function rowToEvent(r: {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  capacity: number;
  registered: number;
  category: EventItem["category"];
}): EventItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    cover: r.cover,
    startsAt: r.startsAt.toISOString(),
    endsAt: r.endsAt.toISOString(),
    location: r.location,
    capacity: r.capacity,
    registered: r.registered,
    category: r.category,
  };
}

export function rowToMessage(r: {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  read: boolean;
}): ContactMessage {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    read: r.read,
  };
}

export function rowToDocument(r: DbDocRow): ApplicationDocument {
  return {
    key: r.docKey as DocumentKey,
    fileName: r.fileName,
    size: r.size,
    uploadedAt: r.uploadedAt.toISOString(),
  };
}

export function rowToApplication(
  r: DbAppRow,
  docs: DbDocRow[],
): ScholarshipApplication {
  const documents: Partial<Record<DocumentKey, ApplicationDocument>> = {};
  for (const d of docs) {
    documents[d.docKey as DocumentKey] = rowToDocument(d);
  }
  return {
    id: r.id,
    applicantId: r.applicantId,
    status: r.status,
    submittedAt: r.submittedAt.toISOString(),
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : undefined,
    reviewerNote: r.reviewerNote ?? undefined,
    score: r.score ?? undefined,
    fullName: r.fullName,
    nationalId: r.nationalId,
    birthDate: r.birthDate,
    gender: r.gender,
    email: r.email,
    phone: r.phone,
    address: r.address,
    city: r.city,
    schoolType: r.schoolType,
    schoolName: r.schoolName,
    department: r.department,
    grade: r.grade,
    gpa: r.gpa,
    fatherName: r.fatherName,
    fatherJob: r.fatherJob,
    fatherIncome: r.fatherIncome,
    motherName: r.motherName,
    motherJob: r.motherJob,
    motherIncome: r.motherIncome,
    siblings: r.siblings,
    workingMembers: r.workingMembers,
    previousScholarship: r.previousScholarship,
    previousScholarshipDetail: r.previousScholarshipDetail ?? undefined,
    iban: r.iban,
    motivationLetter: r.motivationLetter,
    documents,
  };
}

type DbSiteSettingsRow = typeof siteSettings.$inferSelect;

export function rowToSiteSettings(r: DbSiteSettingsRow): SiteSettings {
  return {
    name: r.name,
    shortName: r.shortName,
    founded: r.founded,
    slogan: r.slogan,
    description: r.description,
    logoUrl: r.logoUrl,
    logoSubtitle: r.logoSubtitle,
    contactAddress: r.contactAddress,
    contactPhone: r.contactPhone,
    contactEmail: r.contactEmail,
    contactWorkingHours: r.contactWorkingHours,
    mapEmbedUrl: r.mapEmbedUrl,
    bankName: r.bankName,
    bankAccountHolder: r.bankAccountHolder,
    bankIban: r.bankIban,
    bankBranch: r.bankBranch,
    socialFacebook: r.socialFacebook,
    socialInstagram: r.socialInstagram,
    socialTwitter: r.socialTwitter,
    socialLinkedin: r.socialLinkedin,
    socialYoutube: r.socialYoutube,
    statYearsActive: r.statYearsActive,
    statScholarshipsGiven: r.statScholarshipsGiven,
    statActiveMembers: r.statActiveMembers,
    statCompletedProjects: r.statCompletedProjects,
    seoTitle: r.seoTitle,
    seoTitleTemplate: r.seoTitleTemplate,
    seoDescription: r.seoDescription,
    seoOgImage: r.seoOgImage,
    seoFaviconUrl: r.seoFaviconUrl,
    gaMeasurementId: r.gaMeasurementId,
    gtmContainerId: r.gtmContainerId,
    metaPixelId: r.metaPixelId,
    adsensePublisherId: r.adsensePublisherId,
    customTrackingHtml: r.customTrackingHtml,
  };
}

export async function loadApplicationWithDocs(id: string) {
  const apps = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  const a = apps[0];
  if (!a) return null;
  const docs = await db
    .select()
    .from(applicationDocuments)
    .where(eq(applicationDocuments.applicationId, id));
  return rowToApplication(a, docs);
}
