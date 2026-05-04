import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";
import type { ApplicationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: readonly ApplicationStatus[] = [
  "submitted",
  "in_review",
  "approved",
  "rejected",
];

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id } = await ctx.params;
  let body: { status?: unknown; note?: unknown; score?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const status =
    typeof body.status === "string" &&
    (VALID_STATUSES as readonly string[]).includes(body.status)
      ? (body.status as ApplicationStatus)
      : null;
  if (!status) {
    return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
  }

  const updates: Partial<typeof applications.$inferInsert> = {
    status,
    reviewedAt: new Date(),
  };
  if (typeof body.note === "string") updates.reviewerNote = body.note;
  if (typeof body.score === "number") updates.score = body.score;

  await db.update(applications).set(updates).where(eq(applications.id, id));
  return NextResponse.json({ ok: true });
}
