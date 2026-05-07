/**
 * Admin: SMS abone listesi.
 *   GET /api/admin/sms-subscribers
 *
 * Admin yetkisi zorunlu. Tüm aboneleri en yeniden eskiye sıralayarak döner.
 */
import { NextResponse, type NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { smsSubscribers } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";
import type { SmsSubscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const rows = await db
    .select()
    .from(smsSubscribers)
    .orderBy(desc(smsSubscribers.createdAt));

  const items: SmsSubscriber[] = rows.map((r) => ({
    id: r.id,
    phone: r.phone,
    consentAt: toIso(r.consentAt),
    createdAt: toIso(r.createdAt),
  }));

  return NextResponse.json({ items });
}
