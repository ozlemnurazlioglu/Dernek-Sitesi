/**
 * Admin panelinden yönetilebilen içerik listelerinin tek noktadan tanımı.
 * Yeni bir içerik tablosu eklemek için sadece bu dosyayı genişletmek yeterli.
 */
import {
  activityReports,
  agalar,
  announcementCategories,
  announcements,
  boardMembers,
  donationPresets,
  donationUses,
  eventCategories,
  faqs,
  financeItems,
  legalPages,
  milestones,
  newsCategories,
  requiredDocuments,
  scholarshipPrograms,
  scholarshipTimeline,
  sponsors,
  testimonials,
} from "./schema";

export const contentLists = {
  "board-members": {
    table: boardMembers,
    fields: ["id", "name", "role", "avatar", "bio", "level", "sort"] as const,
  },
  milestones: {
    table: milestones,
    fields: ["id", "year", "text", "sort"] as const,
  },
  "activity-reports": {
    table: activityReports,
    fields: ["id", "year", "pdfUrl", "sort"] as const,
  },
  "scholarship-programs": {
    table: scholarshipPrograms,
    fields: [
      "id",
      "title",
      "monthly",
      "duration",
      "targets",
      "quota",
      "requirements",
      "sort",
    ] as const,
  },
  "required-documents": {
    table: requiredDocuments,
    fields: [
      "id",
      "docKey",
      "title",
      "description",
      "icon",
      "required",
      "sort",
    ] as const,
  },
  "scholarship-timeline": {
    table: scholarshipTimeline,
    fields: ["id", "dateLabel", "title", "description", "sort"] as const,
  },
  faqs: {
    table: faqs,
    fields: ["id", "question", "answer", "sort"] as const,
  },
  testimonials: {
    table: testimonials,
    fields: ["id", "name", "role", "avatar", "text", "sort"] as const,
  },
  "donation-presets": {
    table: donationPresets,
    fields: ["id", "amount", "sort"] as const,
  },
  "donation-uses": {
    table: donationUses,
    fields: ["id", "text", "sort"] as const,
  },
  "news-categories": {
    table: newsCategories,
    fields: ["id", "name", "sort"] as const,
  },
  "event-categories": {
    table: eventCategories,
    fields: ["id", "name", "sort"] as const,
  },
  "legal-pages": {
    table: legalPages,
    fields: [
      "id",
      "slug",
      "title",
      "description",
      "content",
      "sort",
    ] as const,
  },
  agalar: {
    table: agalar,
    fields: [
      "id",
      "year",
      "name",
      "photoUrl",
      "caption",
      "eventDate",
      "sort",
    ] as const,
  },
  "finance-items": {
    table: financeItems,
    fields: ["id", "year", "kind", "label", "amount", "sort"] as const,
  },
  "announcement-categories": {
    table: announcementCategories,
    fields: ["id", "slug", "name", "color", "sort"] as const,
  },
  announcements: {
    table: announcements,
    fields: [
      "id",
      "categorySlug",
      "title",
      "description",
      "eventDate",
      "location",
      "sort",
    ] as const,
  },
  sponsors: {
    table: sponsors,
    fields: ["id", "name", "logoUrl", "websiteUrl", "sort"] as const,
  },
} as const;

export type ContentListType = keyof typeof contentLists;

export const allContentTypes = Object.keys(contentLists) as ContentListType[];

export function isContentType(s: string): s is ContentListType {
  return s in contentLists;
}
