/**
 * Admin: SMS abone listesini CSV (Excel uyumlu) olarak indirir.
 *   GET /api/admin/sms-subscribers/export
 *
 * Format detayları:
 * - UTF-8 BOM ile başlar — Excel'de Türkçe karakterler doğru görünür.
 * - Alan ayırıcı `;` (Türk Excel locale'inde varsayılan).
 * - Satır sonu CRLF (Windows Excel uyumluluğu).
 * - Telefon `0 5XX XXX XX XX` biçiminde basılır.
 * - Telefon hücresinin başına apostrof (') eklenir → Excel onu metin
 *   olarak yorumlar; aksi halde "5551234567" gibi sayıya çevirip baştaki
 *   sıfırı yiyebilir.
 * - İçindeki ", ;, satır sonu olan değerler çift tırnak ile sarmalanır.
 */
import { NextResponse, type NextRequest } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { smsSubscribers } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";
import { formatTrMobile } from "@/lib/phone";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[";\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toLocaleDateTime(value: unknown): string {
  // "2026-05-07 19:32:11.234" formatına çevir; Excel'de okunabilir.
  const d = value instanceof Date ? value : new Date(String(value));
  if (isNaN(d.getTime())) return "";
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
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

  const headers = ["Sıra", "Telefon", "Abonelik Tarihi", "KVKK Onay Tarihi"];
  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(";"));
  rows.forEach((r, i) => {
    // Apostrof öneki Excel'in numarayı sayı olarak yorumlamasını engeller.
    const phoneCell = `'${formatTrMobile(r.phone)}`;
    lines.push(
      [
        String(i + 1),
        csvEscape(phoneCell),
        csvEscape(toLocaleDateTime(r.createdAt)),
        csvEscape(toLocaleDateTime(r.consentAt)),
      ].join(";"),
    );
  });

  // BOM + CRLF satır sonları
  const body = "\uFEFF" + lines.join("\r\n") + "\r\n";

  const today = new Date();
  const filename = `sms-aboneleri-${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
