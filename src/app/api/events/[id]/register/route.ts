/**
 * Etkinliğe kayıt API'si.
 *
 *   POST /api/events/[id]/register   - Mevcut kullanıcıyı etkinliğe kaydeder.
 *   DELETE /api/events/[id]/register - Mevcut kullanıcının kaydını iptal eder.
 *
 * Kapasite tutarlılığı:
 *   - Aynı kullanıcının iki kez kayıt olması `event_registrations` üzerindeki
 *     `(event_id, user_id)` UNIQUE indeksi ile engellenir.
 *   - Kontenjan kontrolü atomik bir UPDATE ile yapılır:
 *       UPDATE events SET registered = registered + 1
 *       WHERE id = ? AND registered < capacity
 *     affectedRows = 0 ise kapasite dolu demektir; kayıt yapılmaz.
 *   - INSERT ile UPDATE, race koşulunda biri başarısız olduğunda diğerini geri
 *     almak için tek bir transaction içinde yapılır.
 */
import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { eventRegistrations, events } from "@/lib/db/schema";
import { requireUser, AuthError } from "@/lib/auth";

export const dynamic = "force-dynamic";

function uniqueId() {
  // Kayıt id'leri kısa olsa yeterli; çakışma riski uniq index ile yakalanır.
  return `er_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id: eventId } = await ctx.params;
  if (!eventId) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 400 });
  }

  const exists = await db
    .select({ id: events.id, capacity: events.capacity })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!exists.length) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 404 });
  }
  if (exists[0].capacity <= 0) {
    return NextResponse.json(
      { error: "Bu etkinlik için kayıt açık değil" },
      { status: 409 },
    );
  }

  // Hızlı (best-effort) "zaten kayıtlı mı" kontrolü; race halinde
  // INSERT'teki UNIQUE indeksi ikinci güvencemiz.
  const already = await db
    .select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.userId, user.id),
      ),
    )
    .limit(1);
  if (already.length) {
    return NextResponse.json(
      { error: "Bu etkinliğe zaten kayıtlısınız", code: "ALREADY_REGISTERED" },
      { status: 409 },
    );
  }

  try {
    const registered = await db.transaction(async (tx) => {
      const updateResult = (await tx.execute(
        sql`UPDATE events SET registered = registered + 1
            WHERE id = ${eventId} AND registered < capacity`,
      )) as unknown as Array<{ affectedRows: number }> | { affectedRows: number };

      const affected = Array.isArray(updateResult)
        ? (updateResult[0]?.affectedRows ?? 0)
        : (updateResult as { affectedRows: number }).affectedRows;

      if (!affected) {
        throw new Error("CAPACITY_FULL");
      }

      try {
        await tx.insert(eventRegistrations).values({
          id: uniqueId(),
          eventId,
          userId: user.id,
          createdAt: new Date(),
        });
      } catch (err) {
        // mysql2 unique violation: errno 1062 / code 'ER_DUP_ENTRY'.
        // Drizzle hatayı sararken cause / orig altında gerçek mysql2
        // hatasını saklayabiliyor; her olası yeri kontrol ediyoruz.
        const e = err as {
          message?: string;
          code?: string;
          errno?: number;
          cause?: { code?: string; errno?: number; message?: string };
        };
        const code = e.code ?? e.cause?.code;
        const errno = e.errno ?? e.cause?.errno;
        const text = `${e.message ?? ""} ${e.cause?.message ?? ""}`;
        if (
          code === "ER_DUP_ENTRY" ||
          errno === 1062 ||
          /duplicate|ER_DUP_ENTRY|unique/i.test(text)
        ) {
          throw new Error("ALREADY_REGISTERED");
        }
        throw err;
      }

      const [row] = await tx
        .select({ registered: events.registered })
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);
      return row?.registered ?? 0;
    });

    return NextResponse.json({ ok: true, registered });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "CAPACITY_FULL") {
      return NextResponse.json(
        { error: "Kontenjan dolu", code: "CAPACITY_FULL" },
        { status: 409 },
      );
    }
    if (msg === "ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "Bu etkinliğe zaten kayıtlısınız", code: "ALREADY_REGISTERED" },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id: eventId } = await ctx.params;
  if (!eventId) {
    return NextResponse.json({ error: "Etkinlik bulunamadı" }, { status: 400 });
  }

  const registered = await db.transaction(async (tx) => {
    // Kullanıcının bu etkinlikteki kaydını sil; affected = 0 ise zaten yok.
    const delResult = (await tx
      .delete(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, user.id),
        ),
      )) as unknown as { affectedRows?: number } | Array<{ affectedRows: number }>;
    const affected = Array.isArray(delResult)
      ? (delResult[0]?.affectedRows ?? 0)
      : (delResult.affectedRows ?? 0);

    if (affected) {
      // GREATEST koruması: yanlışlıkla negatif kayıt sayısına düşmesin.
      await tx.execute(
        sql`UPDATE events SET registered = GREATEST(registered - 1, 0)
            WHERE id = ${eventId}`,
      );
    }

    const [row] = await tx
      .select({ registered: events.registered })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    return row?.registered ?? 0;
  });

  return NextResponse.json({ ok: true, registered });
}
