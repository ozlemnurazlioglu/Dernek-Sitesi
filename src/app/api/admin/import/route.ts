import { NextResponse, type NextRequest } from "next/server";
import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPPORTED_VERSIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

type Json = Record<string, unknown>;
type Rows = Record<string, unknown>[];

/**
 * `/api/admin/export` ile alınmış JSON yedeği geri yükler. Bütün **içerik
 * tabloları** ve `news`, `events`, `messages`, `applications` temizlenir,
 * sonra paketteki kayıtlar yazılır. `users` ve `sessions` korunur — geri
 * yükleme **mevcut admini kilitlemez**.
 *
 * Dosyalar (`/public/uploads/`) ayrıca yedeklenmelidir; bu endpoint sadece
 * veritabanı içeriğini alır.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let payload: Json;
  try {
    payload = (await req.json()) as Json;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const meta = payload.meta as Json | undefined;
  const version = meta?.exportVersion;
  if (typeof version !== "number" || !SUPPORTED_VERSIONS.includes(version)) {
    return NextResponse.json(
      {
        error: `Desteklenmeyen yedek sürümü: ${String(version)}. Beklenen: ${SUPPORTED_VERSIONS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const content = (payload.content as Json | undefined) ?? {};
  const publishing = (payload.publishing as Json | undefined) ?? {};
  const inbox = (payload.inbox as Json | undefined) ?? {};
  const applicationsBlock = (payload.applications as Json | undefined) ?? {};
  const siteSettingsRows = (payload.siteSettings as Rows | undefined) ?? [];
  const pageBlocksRows = (payload.pageBlocks as Rows | undefined) ?? [];

  // Temiz içerik tabloları sırası — FK'lar olmadığı için sıra çoğunlukla
  // önemsiz ama tutarlılık için aşağıdan yukarı.
  // applications -> applicationDocuments (FK), news, events bağımsız.

  // --- Temizlik fasonu ---
  // FK kontrollerini geçici devre dışı bırakırsak daha hızlı/dayanıklı olur.
  // Üyeler ve oturumlar korunur (admin kilitlenmez).
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  try {
    await db.delete(schema.applicationDocuments);
    await db.delete(schema.applications);
    await db.delete(schema.messages);
    await db.delete(schema.events);
    await db.delete(schema.news);
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
    await db.delete(schema.sponsorTiers);
    await db.delete(schema.neighborhoods);
    await db.delete(schema.donors);
    await db.delete(schema.videos);
    await db.delete(schema.videoCategories);
    await db.delete(schema.photos);
    await db.delete(schema.photoCategories);
    await db.delete(schema.siteSettings);

    /* ---------- siteSettings ---------- */
    if (siteSettingsRows.length) {
      const settings = { ...(siteSettingsRows[0] as Record<string, unknown>) };
      settings.updatedAt = parseDate(settings.updatedAt) ?? new Date();
      // v10 öncesi yedeklerde yeni eklenen analytics alanları yok — eksikse
      // boş string fallback ekle ki NOT NULL ihlali olmasın.
      settings.gaMeasurementId ??= "";
      settings.gtmContainerId ??= "";
      settings.metaPixelId ??= "";
      settings.adsensePublisherId ??= "";
      settings.customTrackingHtml ??= "";
      await db.insert(schema.siteSettings).values(settings as never);
    }

    /* ---------- pageBlocks ---------- */
    for (const row of pageBlocksRows) {
      const r = row as Record<string, unknown>;
      await db.insert(schema.pageBlocks).values({
        blockKey: String(r.blockKey),
        data: r.data,
        updatedAt: parseDate(r.updatedAt) ?? new Date(),
      });
    }

    /* ---------- içerik listeleri ---------- */
    await bulkInsert(schema.boardMembers, content.boardMembers);
    await bulkInsert(schema.milestones, content.milestones);
    await bulkInsert(schema.activityReports, content.activityReports);
    await bulkInsert(
      schema.scholarshipPrograms,
      content.scholarshipPrograms,
    );
    await bulkInsert(schema.requiredDocuments, content.requiredDocuments);
    await bulkInsert(
      schema.scholarshipTimeline,
      content.scholarshipTimeline,
    );
    await bulkInsert(schema.faqs, content.faqs);
    await bulkInsert(schema.testimonials, content.testimonials);
    await bulkInsert(schema.donationPresets, content.donationPresets);
    await bulkInsert(schema.donationUses, content.donationUses);
    await bulkInsert(schema.newsCategories, content.newsCategories);
    await bulkInsert(schema.eventCategories, content.eventCategories);
    await bulkInsert(schema.legalPages, content.legalPages, ["updatedAt"]);
    await bulkInsert(schema.agalar, content.agalar);
    await bulkInsert(schema.financeItems, content.financeItems);
    await bulkInsert(schema.announcementCategories, content.announcementCategories);
    await bulkInsert(schema.announcements, content.announcements);
    // sponsorTiers v8'de eklendi — eski yedeklerde olmayabilir, sessizce atlanır.
    await bulkInsert(schema.sponsorTiers, content.sponsorTiers);
    await bulkInsert(schema.sponsors, content.sponsors);
    // neighborhoods v9'da eklendi — eski yedeklerde olmayabilir, sessizce atlanır.
    await bulkInsert(schema.neighborhoods, content.neighborhoods);
    // donors v11'de eklendi — eski yedeklerde olmayabilir, sessizce atlanır.
    await bulkInsert(schema.donors, content.donors);
    // Galeri tabloları v10'da eklendi — eski yedeklerde olmayabilir, sessizce atlanır.
    await bulkInsert(schema.photoCategories, content.photoCategories);
    await bulkInsert(schema.photos, content.photos);
    await bulkInsert(schema.videoCategories, content.videoCategories);
    await bulkInsert(schema.videos, content.videos);

    /* ---------- yayın ---------- */
    await bulkInsert(schema.news, publishing.news, ["publishedAt"]);
    await bulkInsert(schema.events, publishing.events, ["startsAt", "endsAt"]);

    /* ---------- inbox ---------- */
    await bulkInsert(schema.messages, inbox.messages, ["createdAt"]);

    /* ---------- başvurular ---------- */
    await bulkInsert(schema.applications, applicationsBlock.applications, [
      "submittedAt",
      "reviewedAt",
    ]);
    await bulkInsert(
      schema.applicationDocuments,
      applicationsBlock.documents,
      ["uploadedAt"],
    );
  } finally {
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
  }

  return NextResponse.json({ ok: true });
}

/* ---------------- yardımcılar ---------------- */

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === "string" || typeof v === "number") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Verilen Drizzle tablosuna satırları ekler. JSON'da string olarak gelen
 * tarih alanları (örn. publishedAt) Date'e çevrilir.
 */
async function bulkInsert(
  table: unknown,
  rows: unknown,
  dateFields: string[] = [],
) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const t = table as { [key: string]: unknown };
  for (const row of rows) {
    const r = { ...(row as Record<string, unknown>) };
    for (const f of dateFields) {
      const d = parseDate(r[f]);
      if (d !== null) r[f] = d;
    }
    await db.insert(t as never).values(r as never);
  }
}
