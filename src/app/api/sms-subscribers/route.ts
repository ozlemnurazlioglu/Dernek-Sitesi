/**
 * SMS Aboneliği — public endpoint.
 *
 *   POST /api/sms-subscribers
 *
 * Ana sayfadaki SMS aboneliği formundan çağrılır. KVKK onayı verilmiş
 * ziyaretçilerin numarasını `sms_subscribers` tablosuna kaydeder. Aynı
 * numara tekrar gelirse 409 ALREADY_SUBSCRIBED döner.
 *
 * Auth gerektirmez (üye olmadan abonelik amaç).
 *
 * Hata kodları:
 *   400 INVALID_PHONE     - geçersiz numara
 *   400 CONSENT_REQUIRED  - KVKK onayı verilmemiş
 *   409 ALREADY_SUBSCRIBED - numara zaten abone
 *   500 ...
 */
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { smsSubscribers } from "@/lib/db/schema";
import { normalizeTrMobile } from "@/lib/phone";

export const dynamic = "force-dynamic";

function uniqueId() {
  return `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isMysqlDuplicateError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; errno?: number; message?: string };
  if (e.code === "ER_DUP_ENTRY" || e.errno === 1062) return true;
  return Boolean(e.message && /duplicate/i.test(e.message));
}

export async function POST(req: NextRequest) {
  type Body = { phone?: unknown; consent?: unknown };
  let body: Body | null = null;
  try {
    body = (await req.json()) as Body;
  } catch {
    body = null;
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Geçersiz istek." },
      { status: 400 },
    );
  }
  const safe: Body = body;

  const consent = safe.consent === true;
  if (!consent) {
    return NextResponse.json(
      { error: "KVKK onayı gerekli", code: "CONSENT_REQUIRED" },
      { status: 400 },
    );
  }

  const rawPhone = typeof safe.phone === "string" ? safe.phone : "";
  const phone = normalizeTrMobile(rawPhone);
  if (!phone) {
    return NextResponse.json(
      { error: "Geçersiz numara", code: "INVALID_PHONE" },
      { status: 400 },
    );
  }

  // Hızlı duplicate ön-kontrol — race hâlinde alt UNIQUE indeks ikinci hat.
  const exists = await db
    .select({ id: smsSubscribers.id })
    .from(smsSubscribers)
    .where(eq(smsSubscribers.phone, phone))
    .limit(1);
  if (exists.length) {
    return NextResponse.json(
      { error: "Numara zaten abone", code: "ALREADY_SUBSCRIBED" },
      { status: 409 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "";
  const userAgent = req.headers.get("user-agent") ?? "";
  const now = new Date();

  try {
    await db.insert(smsSubscribers).values({
      id: uniqueId(),
      phone,
      consentAt: now,
      createdAt: now,
      ip: ip.slice(0, 64),
      userAgent: userAgent.slice(0, 255),
    });
  } catch (err) {
    if (isMysqlDuplicateError(err)) {
      return NextResponse.json(
        { error: "Numara zaten abone", code: "ALREADY_SUBSCRIBED" },
        { status: 409 },
      );
    }
    console.error("SMS abone kaydı sırasında hata:", err);
    return NextResponse.json(
      { error: "Aboneliğiniz alınamadı, lütfen tekrar deneyin." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
