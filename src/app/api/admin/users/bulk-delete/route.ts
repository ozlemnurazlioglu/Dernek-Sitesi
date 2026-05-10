import { NextResponse, type NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  applications,
  eventRegistrations,
} from "@/lib/db/schema";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Tek istek içinde silinebilecek üst sınır. Çok büyük listeler için
 *  istemcinin parçalı (batch'li) çağrı yapması beklenir. */
const MAX_BULK = 500;

/**
 * Admin panelinden BİRDEN ÇOK üyeyi tek istekte siler. Bot kayıtlarını
 * topluca temizlemek için tasarlanmıştır.
 *
 * Body: `{ "ids": ["u-abc", "u-def", ...] }`
 *
 * Davranış:
 * - Yalnızca admin rolü çağırabilir.
 * - Mevcut admin **kendi id'sini** listede gönderirse istek tamamen
 *   reddedilir (yanlışlıkla paneli kilitlemesin diye).
 * - Geçersiz / boş id'ler atılır; çakışma yoksa diğer id'ler silinir.
 * - Sessions zaten CASCADE; bu uç o yüzden sadece event_registrations,
 *   applications ve users tablolarını tek transaction içinde temizler.
 *
 * Yanıt: `{ ok: true, deleted: <gerçek silinen sayısı> }`
 */
export async function POST(req: NextRequest) {
  let adminUser;
  try {
    adminUser = await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  let body: { ids?: unknown };
  try {
    body = (await req.json()) as { ids?: unknown };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON beklendi)" },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.ids)) {
    return NextResponse.json(
      { error: "`ids` bir dizi olmalı" },
      { status: 400 },
    );
  }

  // Sadece geçerli string id'leri al + tekrarlananları çıkar.
  const ids = Array.from(
    new Set(
      body.ids
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((s) => s.trim()),
    ),
  );

  if (ids.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }
  if (ids.length > MAX_BULK) {
    return NextResponse.json(
      {
        error: `Tek istekte en fazla ${MAX_BULK} kullanıcı silinebilir. Lütfen seçimi küçültün.`,
      },
      { status: 400 },
    );
  }

  if (ids.includes(adminUser.id)) {
    return NextResponse.json(
      {
        error:
          "Seçim içinde kendi hesabınız var. Kendi hesabınızı silemezsiniz.",
      },
      { status: 400 },
    );
  }

  // İlişkili kayıtları + kullanıcıları tek transaction içinde temizle.
  // Geri sayım için users tablosunda var olanların sayısını önceden alıp
  // gerçekten kaç tane silindiğini istemciye döneriz (var olmayan id'ler
  // sessizce atlanır).
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.id, ids));
  const existingIds = existing.map((r) => r.id);

  if (existingIds.length === 0) {
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(eventRegistrations)
      .where(inArray(eventRegistrations.userId, existingIds));
    await tx
      .delete(applications)
      .where(inArray(applications.applicantId, existingIds));
    await tx.delete(users).where(inArray(users.id, existingIds));
  });

  return NextResponse.json({ ok: true, deleted: existingIds.length });
}
