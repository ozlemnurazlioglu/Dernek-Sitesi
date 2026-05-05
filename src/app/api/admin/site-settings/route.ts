import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

const STRING_FIELDS = [
  "name",
  "shortName",
  "slogan",
  "description",
  "logoUrl",
  "logoSubtitle",
  "contactAddress",
  "contactPhone",
  "contactEmail",
  "contactWorkingHours",
  "mapEmbedUrl",
  "bankName",
  "bankAccountHolder",
  "bankIban",
  "bankBranch",
  "socialFacebook",
  "socialInstagram",
  "socialTwitter",
  "socialLinkedin",
  "socialYoutube",
  "seoTitle",
  "seoTitleTemplate",
  "seoDescription",
  "seoOgImage",
  "seoFaviconUrl",
  "gaMeasurementId",
  "gtmContainerId",
  "metaPixelId",
  "adsensePublisherId",
  "customTrackingHtml",
] as const;

const INT_FIELDS = [
  "founded",
  "statYearsActive",
  "statScholarshipsGiven",
  "statActiveMembers",
  "statCompletedProjects",
] as const;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: Partial<SiteSettings>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const f of STRING_FIELDS) {
    if (typeof body[f] === "string") updates[f] = body[f];
  }
  for (const f of INT_FIELDS) {
    if (typeof body[f] === "number" && Number.isFinite(body[f]))
      updates[f] = body[f];
  }

  const existing = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.id, "main"))
    .limit(1);

  if (existing.length) {
    await db.update(siteSettings).set(updates).where(eq(siteSettings.id, "main"));
  } else {
    // Build full insert with defaults from incoming body (must have all NOT NULL)
    await db.insert(siteSettings).values({
      id: "main",
      name: String(body.name ?? ""),
      shortName: String(body.shortName ?? ""),
      founded: Number(body.founded ?? new Date().getFullYear()),
      slogan: String(body.slogan ?? ""),
      description: String(body.description ?? ""),
      logoUrl: String(body.logoUrl ?? ""),
      logoSubtitle: String(body.logoSubtitle ?? ""),
      contactAddress: String(body.contactAddress ?? ""),
      contactPhone: String(body.contactPhone ?? ""),
      contactEmail: String(body.contactEmail ?? ""),
      contactWorkingHours: String(body.contactWorkingHours ?? ""),
      mapEmbedUrl: String(body.mapEmbedUrl ?? ""),
      bankName: String(body.bankName ?? ""),
      bankAccountHolder: String(body.bankAccountHolder ?? ""),
      bankIban: String(body.bankIban ?? ""),
      bankBranch: String(body.bankBranch ?? ""),
      socialFacebook: String(body.socialFacebook ?? ""),
      socialInstagram: String(body.socialInstagram ?? ""),
      socialTwitter: String(body.socialTwitter ?? ""),
      socialLinkedin: String(body.socialLinkedin ?? ""),
      socialYoutube: String(body.socialYoutube ?? ""),
      statYearsActive: Number(body.statYearsActive ?? 0),
      statScholarshipsGiven: Number(body.statScholarshipsGiven ?? 0),
      statActiveMembers: Number(body.statActiveMembers ?? 0),
      statCompletedProjects: Number(body.statCompletedProjects ?? 0),
      seoTitle: String(body.seoTitle ?? ""),
      seoTitleTemplate: String(body.seoTitleTemplate ?? ""),
      seoDescription: String(body.seoDescription ?? ""),
      seoOgImage: String(body.seoOgImage ?? ""),
      seoFaviconUrl: String(body.seoFaviconUrl ?? ""),
      gaMeasurementId: String(body.gaMeasurementId ?? ""),
      gtmContainerId: String(body.gtmContainerId ?? ""),
      metaPixelId: String(body.metaPixelId ?? ""),
      adsensePublisherId: String(body.adsensePublisherId ?? ""),
      customTrackingHtml: String(body.customTrackingHtml ?? ""),
      updatedAt: new Date(),
    });
  }

  return NextResponse.json({ ok: true });
}
