import { NextResponse, type NextRequest } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { uid } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * "Şifremi unuttum" akışı — email gönderme altyapısı OLMADAN.
 *
 * Tasarım kararı: Otomatik reset email yerine, talep dernek yöneticilerine
 * `messages` tablosu üzerinden iletilir. Admin Mesajlar sekmesinden görür,
 * üyenin telefonundan teyit alır ve mevcut "Şifre Sıfırla" modaliyle yenisini
 * belirleyip iletişim kanalından (telefon/SMS) iletir.
 *
 * Güvenlik notları:
 * - Yanıt her zaman 200 ve aynıdır. Hesabın varlığını sızdırmamak için
 *   "kullanıcı bulunamadı" diye 404 dönmeyiz.
 * - Aynı e-posta için son 60 sn içinde talep oluşturulmuşsa yenisi
 *   yazılmaz (hafif spam koruması). Yine 200 döner.
 * - 401 yetki gereksinimi YOKTUR — kullanıcı zaten giremiyor.
 */
const SUBJECT_PREFIX = "[Şifre Sıfırlama Talebi]";
const SPAM_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  let body: {
    email?: unknown;
    phone?: unknown;
    note?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (JSON beklendi)" },
      { status: 400 },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  // Basit e-posta formatı kontrolü — bozuk girdileri DB'ye taşımamak için.
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi girin." },
      { status: 400 },
    );
  }
  if (note.length > 1000) {
    return NextResponse.json(
      { error: "Notunuz en fazla 1000 karakter olabilir." },
      { status: 400 },
    );
  }
  if (phone.length > 64) {
    return NextResponse.json(
      { error: "Telefon numarası çok uzun." },
      { status: 400 },
    );
  }

  // E-posta enumerasyonunu önlemek için: bulunmasa da yanıt aynı.
  const userRows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      phone: users.phone,
      city: users.city,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const targetUser = userRows[0];

  // Hafif spam koruması: aynı e-posta + aynı subject prefix son 60 sn içinde
  // bir talep yaratmışsa yenisini yazma. Yanıt yine başarılı görünür.
  const since = new Date(Date.now() - SPAM_WINDOW_MS);
  const recent = await db
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.email, email), gt(messages.createdAt, since)))
    .orderBy(desc(messages.createdAt))
    .limit(1);

  // Sadece kullanıcı varsa mesaj kaydı oluştur (gereksiz çöp kayıtları
  // engelle). Yanıt yine aynı.
  if (targetUser && recent.length === 0) {
    const lines: string[] = [
      "Üye, giriş sayfasındaki 'Şifremi Unuttum' formunu doldurarak şifre",
      "sıfırlama talep etti. Lütfen üyeyi telefonla teyit edin ve admin",
      "panelindeki 'Üyeler' sekmesinden 'Şifre Sıfırla' butonu ile yeni",
      "şifreyi belirleyip kendisine iletin.",
      "",
      `Üye: ${targetUser.fullName} (id: ${targetUser.id})`,
      `E-posta: ${email}`,
    ];
    if (targetUser.phone) lines.push(`Kayıtlı telefon: ${targetUser.phone}`);
    if (phone) lines.push(`Talep formundaki telefon: ${phone}`);
    if (targetUser.city) lines.push(`Şehir: ${targetUser.city}`);
    if (note) {
      lines.push("");
      lines.push("Üyenin notu:");
      lines.push(note);
    }

    await db.insert(messages).values({
      id: `pwr-${uid()}`,
      name: targetUser.fullName,
      email,
      subject: `${SUBJECT_PREFIX} ${targetUser.fullName}`,
      message: lines.join("\n"),
      createdAt: new Date(),
      read: false,
    });
  }

  // Yanıt: her zaman aynı.
  return NextResponse.json({
    ok: true,
    message:
      "Talebiniz dernek yöneticilerine iletildi. En kısa sürede sizinle iletişime geçilecektir.",
  });
}
