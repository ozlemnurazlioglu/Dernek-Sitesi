/**
 * Admin: Bildirim ayarlarındaki SMTP yapılandırmasını test eder.
 *
 *   POST /api/admin/notification-settings/test-email
 *     { to: "test@example.com", settings?: NotificationSettings }
 *
 * `settings` body'de verilirse o ayarlarla (kaydedilmemiş) test eder; yoksa
 * DB'deki güncel ayarları kullanır. Şifre maskeli geldiyse DB'deki gerçek
 * şifreye fallback yapılır.
 */
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin, AuthError } from "@/lib/auth";
import { getNotificationSettings, sendTestEmail } from "@/lib/notify";
import type { NotificationSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

const MASK = "********";

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
  const to = body?.to?.trim() ?? "";
  if (!to || !to.includes("@")) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi gerekli" },
      { status: 400 },
    );
  }

  const current = await getNotificationSettings();
  const draft = body?.settings ?? {};
  // Test'i hem form'daki değişikliklerle, hem DB'deki gerçek şifrelerle
  // yapabilmek için merge ediyoruz; maskeli alanlar mevcut DB değerine düşer.
  const merged: NotificationSettings = {
    ...current,
    ...draft,
    emailEnabled: true,
    smtpPass:
      typeof draft.smtpPass === "string" && draft.smtpPass !== MASK && draft.smtpPass !== ""
        ? draft.smtpPass
        : current.smtpPass,
  } as NotificationSettings;

  const result = await sendTestEmail({ to, settings: merged });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true, messageId: result.messageId });
}
