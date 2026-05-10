import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { news } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let item: Partial<NewsItem>;
  try {
    item = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  if (!item.id || !item.slug || !item.title) {
    return NextResponse.json(
      { error: "id, slug ve title zorunludur" },
      { status: 400 },
    );
  }

  // Galeri görselleri — body'den ayrı, opsiyonel string[].
  // Geçersiz girdileri (string olmayan, boş, çok uzun) eleyelim.
  const images = Array.isArray(item.images)
    ? item.images
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
        .slice(0, 60)
    : [];

  const values = {
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt ?? "",
    body: item.body ?? "",
    cover: item.cover ?? "",
    images: images.length > 0 ? images : null,
    category: item.category ?? "Haber",
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
    author: item.author ?? "",
  };

  const existing = await db
    .select({ id: news.id })
    .from(news)
    .where(eq(news.id, item.id))
    .limit(1);

  if (existing.length) {
    await db.update(news).set(values).where(eq(news.id, item.id));
  } else {
    await db.insert(news).values(values);
  }
  return NextResponse.json({ ok: true });
}
