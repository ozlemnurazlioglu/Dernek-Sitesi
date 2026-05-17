/**
 * Admin: Bildirim ayarlarındaki SMS yapılandırmasını test eder.
 *
 *   POST /api/admin/notification-settings/test-sms
 *     { to: "5xxxxxxxxx", settings?: NotificationSettings }
 *
 * `settings` body'de verilirse o ayarlarla (kaydedilmemiş) test eder; yoksa
 * DB'deki güncel ayarları kullanır. Şifre/token maskeli geldiyse DB
 * değerine fallback yapılır.
 */
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin, AuthError } from "@/lib/auth";
import { getNotificationSettings, sendTestSms } from "@/lib/notify";
import { normalizeTrMobile } from "@/lib/phone";
import type { NotificationSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

const MASK = "********";

function preserve(incoming: unknown, currentValue: string): string {
  if (typeof incoming !== "string") return currentValue;
  if (!incoming || incoming === MASK) return currentValue;
  return incoming;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
  const body = (await req.json().catch(() => null)) as {
    to?: string;
    settings?: Partial<NotificationSettings>;
  } | null;
  const phone = normalizeTrMobile(body?.to ?? "");
  if (!phone) {
    return NextResponse.json(
      { error: "Geçerli bir TR cep numarası gerekli" },
      { status: 400 },
    );
  }

  const current = await getNotificationSettings();
  const draft = body?.settings ?? {};
  const merged: NotificationSettings = {
    ...current,
    ...draft,
    smsEnabled: true,
    smsPass: preserve(draft.smsPass, current.smsPass),
    smsApiSecret: preserve(draft.smsApiSecret, current.smsApiSecret),
  } as NotificationSettings;

  const result = await sendTestSms({ to: phone, settings: merged });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    provider: result.provider,
    reference: result.reference,
  });
}
