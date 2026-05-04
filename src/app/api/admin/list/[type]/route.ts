import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { AuthError, requireAdmin } from "@/lib/auth";
import { contentLists, isContentType } from "@/lib/db/content-tables";

export const dynamic = "force-dynamic";

// POST: id varsa update, yoksa insert (upsert).
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ type: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { type } = await ctx.params;
  if (!isContentType(type)) {
    return NextResponse.json({ error: "Bilinmeyen içerik tipi" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const def = contentLists[type];
  // Sadece izin verilen alanları al
  const values: Record<string, unknown> = {};
  for (const f of def.fields) {
    if (f in body) values[f] = (body as Record<string, unknown>)[f];
  }

  if (typeof values.id !== "string" || !values.id) {
    return NextResponse.json({ error: "id zorunlu" }, { status: 400 });
  }

  const id = values.id as string;
  const table = def.table as unknown as {
    id: { name: string };
  };

  // Insert or update (drizzle MySQL)
  const existing = await db
    .select()
    .from(def.table as never)
    .where(eq((def.table as unknown as { id: never }).id, id as never))
    .limit(1);

  if (existing.length) {
    await db
      .update(def.table as never)
      .set(values as never)
      .where(eq((def.table as unknown as { id: never }).id, id as never));
  } else {
    await db.insert(def.table as never).values(values as never);
  }

  void table; // silence unused
  return NextResponse.json({ ok: true });
}
