import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pageBlocks } from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";
import { BURS_RULES_BLOCK_KEY, invalidateBurseRulesCache } from "@/lib/burs-rules";

export const dynamic = "force-dynamic";

const KEY_RE = /^[a-z][a-z0-9._-]{1,99}$/;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ key: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { key } = await ctx.params;
  if (!KEY_RE.test(key)) {
    return NextResponse.json({ error: "Geçersiz blok anahtarı" }, { status: 400 });
  }

  let data: unknown;
  try {
    const body = await req.json();
    data = body && typeof body === "object" && "data" in body
      ? (body as { data: unknown }).data
      : body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const updatedAt = new Date();

  const existing = await db
    .select({ blockKey: pageBlocks.blockKey })
    .from(pageBlocks)
    .where(eq(pageBlocks.blockKey, key))
    .limit(1);

  if (existing.length) {
    await db
      .update(pageBlocks)
      .set({ data, updatedAt })
      .where(eq(pageBlocks.blockKey, key));
  } else {
    await db.insert(pageBlocks).values({ blockKey: key, data, updatedAt });
  }

  // Burs kuralları cache'i (60s TTL) hemen düşsün — yoksa kuralı değiştiren
  // admin'in ayarı, gelen sonraki başvurularda 1 dakikaya kadar etki etmezdi.
  if (key === BURS_RULES_BLOCK_KEY) {
    invalidateBurseRulesCache();
  }

  return NextResponse.json({ ok: true });
}
