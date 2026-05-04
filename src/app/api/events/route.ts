import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";
import type { EventItem } from "@/lib/types";

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

  let item: Partial<EventItem>;
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

  const values = {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description ?? "",
    cover: item.cover ?? "",
    startsAt: item.startsAt ? new Date(item.startsAt) : new Date(),
    endsAt: item.endsAt ? new Date(item.endsAt) : new Date(),
    location: item.location ?? "",
    capacity: item.capacity ?? 0,
    registered: item.registered ?? 0,
    category: item.category ?? "Eğitim",
  };

  const existing = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, item.id))
    .limit(1);

  if (existing.length) {
    await db.update(events).set(values).where(eq(events.id, item.id));
  } else {
    await db.insert(events).values(values);
  }
  return NextResponse.json({ ok: true });
}
