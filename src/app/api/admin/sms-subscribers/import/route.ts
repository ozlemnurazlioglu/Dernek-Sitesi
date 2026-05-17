/**
 * Admin: SMS abonelerini CSV / XLSX dosyasından toplu içe aktarır.
 *   POST /api/admin/sms-subscribers/import
 *
 * Multipart/form-data:
 *   - file:        .csv | .xlsx | .xls
 *   - kvkkConsent: "true" (zorunlu — admin "bu numaraların KVKK onayını
 *                  aldım" beyanını işaretler; aksi halde 400)
 *
 * Akış:
 *   1) Dosyayı buffer'a oku, türe göre parse et.
 *   2) Telefon kolonunu otomatik tespit et (başlığı "telefon|phone|gsm|cep"
 *      içeren ilk kolon; bulunamazsa ilk kolon kabul edilir).
 *   3) Her satır için normalize (`normalizeTrMobile`) → 10 haneli "5XXXXXXXXX".
 *   4) Aynı dosya içindeki tekrarları DOSYA bazında at, DB'deki mevcut
 *      numaraları SKIP et, geri kalanları toplu insert et.
 *   5) Rapor döndür: added / skipped (mevcut) / invalid / total satır.
 *
 * Önemli notlar:
 *   - Bulk insert chunked (250'li) yapılır — MySQL packet/limit problemi
 *     yaşamamak için.
 *   - KVKK onayı NOT NULL olduğundan, içe aktarma zamanını `consentAt`
 *     olarak yazıyoruz (admin "onayı bende var" diyor, sorumluluk admin'de).
 *   - `ip` ve `userAgent` boş bırakılır — import edilen kayıtların orijin
 *     bilgisi yok; runtime'da dolu kalan kolonu ileride filtreleyebiliriz.
 *   - Dosya boyutu üst sınırı: 5 MB. Daha büyük → 413.
 */
import { NextResponse, type NextRequest } from "next/server";
import { eq, inArray } from "drizzle-orm";
import ExcelJS from "exceljs";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { smsSubscribers } from "@/lib/db/schema";
import { requireAdmin, AuthError } from "@/lib/auth";
import { normalizeTrMobile } from "@/lib/phone";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const INSERT_CHUNK = 250;

type ImportReport = {
  ok: boolean;
  added: number;
  skipped: number;
  invalid: number;
  totalRows: number;
  invalidSamples: { row: number; value: string; reason: string }[];
};

function csvSplitLine(line: string, delim: string): string[] {
  // Çift tırnak içine alınmış değerler içinde delim olsa bile bozulmasın.
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === delim && !inQuote) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function detectDelimiter(headerLine: string): string {
  // ; > , > tab. TR Excel default'u ";", US/CSV genelde ",".
  const counts = {
    ";": (headerLine.match(/;/g) || []).length,
    ",": (headerLine.match(/,/g) || []).length,
    "\t": (headerLine.match(/\t/g) || []).length,
  } as Record<string, number>;
  let best = ",";
  let bestN = 0;
  for (const k of Object.keys(counts)) {
    if (counts[k] > bestN) {
      best = k;
      bestN = counts[k];
    }
  }
  return best;
}

function pickPhoneColumn(headerCells: string[]): number {
  // "telefon", "phone", "gsm", "cep" anahtarlarından birini bulur. Aksi
  // halde -1 (ilk kolonu kullan).
  const norm = headerCells.map((c) =>
    (c ?? "").toString().trim().toLocaleLowerCase("tr-TR"),
  );
  const aliases = ["telefon", "phone", "gsm", "cep", "numara", "no"];
  for (let i = 0; i < norm.length; i++) {
    for (const a of aliases) {
      if (norm[i].includes(a)) return i;
    }
  }
  return -1;
}

async function parseCsv(buffer: Buffer): Promise<string[][]> {
  // UTF-8 BOM at, sonra split. Çok büyük dosyalarda performans önemli
  // değil (5 MB üst sınır).
  let text = buffer.toString("utf-8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const delim = detectDelimiter(lines[0]);
  return lines.map((l) => csvSplitLine(l, delim));
}

async function parseXlsx(buffer: Buffer): Promise<string[][]> {
  // İlk worksheet'i okur. exceljs `getRow(i).values` 1-indexed döner;
  // sıfırıncı eleman boş gelir, bunu temizliyoruz.
  const wb = new ExcelJS.Workbook();
  // exceljs `load` ArrayBuffer bekliyor; Node Buffer'ı uyumsuz görüyor
  // (Buffer<ArrayBufferLike>). Buffer'ın aynı bellek alanına bakan
  // ArrayBuffer dilimini çıkarıp veriyoruz — kopyalama yok, sadece tip.
  const ab = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  await wb.xlsx.load(ab);
  const ws = wb.worksheets[0];
  if (!ws) return [];
  const rows: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    const vals = row.values as unknown[];
    // 1-indexed → 0-indexed slice
    const cells = (vals as unknown[]).slice(1).map((v) => {
      if (v == null) return "";
      if (typeof v === "object") {
        const r = v as { text?: unknown; result?: unknown; richText?: unknown };
        if (typeof r.text === "string") return r.text;
        if (typeof r.result === "string" || typeof r.result === "number")
          return String(r.result);
        if (Array.isArray(r.richText)) {
          return (r.richText as { text?: string }[])
            .map((rt) => rt.text ?? "")
            .join("");
        }
      }
      return String(v);
    });
    rows.push(cells);
  });
  return rows;
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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek (multipart/form-data beklendi)" },
      { status: 400 },
    );
  }

  const kvkkValue = form.get("kvkkConsent");
  if (kvkkValue !== "true") {
    return NextResponse.json(
      {
        error:
          "KVKK onayı işaretlenmelidir. Yüklediğiniz numaraların kişisel veri kullanım onayını aldığınızı beyan etmelisiniz.",
      },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Dosya bulunamadı (alan adı: file)" },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Dosya boş" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `Dosya çok büyük (${Math.round(file.size / 1024 / 1024)} MB). En fazla ${MAX_FILE_SIZE / 1024 / 1024} MB olabilir.`,
      },
      { status: 413 },
    );
  }

  const name = file.name.toLowerCase();
  const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls");
  const isCsv = name.endsWith(".csv") || name.endsWith(".txt");
  if (!isXlsx && !isCsv) {
    return NextResponse.json(
      {
        error:
          "Desteklenmeyen dosya formatı. Sadece .csv ve .xlsx kabul edilir.",
      },
      { status: 415 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let rows: string[][];
  try {
    rows = isXlsx ? await parseXlsx(buf) : await parseCsv(buf);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Dosya okunamadı: ${msg}` },
      { status: 400 },
    );
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "Dosya boş" }, { status: 400 });
  }

  // Başlık tespiti: ilk satır rakamsız bir hücre içeriyorsa başlık say.
  const firstRow = rows[0];
  const phoneColInHeader = pickPhoneColumn(firstRow);
  const hasHeader =
    phoneColInHeader >= 0 ||
    firstRow.some((c) => /[a-zA-Z\u00c0-\u017f]/.test(c));
  const phoneCol = phoneColInHeader >= 0 ? phoneColInHeader : 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const report: ImportReport = {
    ok: true,
    added: 0,
    skipped: 0,
    invalid: 0,
    totalRows: dataRows.length,
    invalidSamples: [],
  };

  if (dataRows.length === 0) {
    return NextResponse.json(report);
  }

  const seenInFile = new Set<string>();
  const candidates: string[] = [];
  dataRows.forEach((cells, idx) => {
    const raw = (cells[phoneCol] ?? "").toString();
    const phone = normalizeTrMobile(raw);
    if (!phone) {
      report.invalid += 1;
      if (report.invalidSamples.length < 10) {
        report.invalidSamples.push({
          row: idx + (hasHeader ? 2 : 1),
          value: raw.slice(0, 40),
          reason: "Geçersiz TR cep numarası",
        });
      }
      return;
    }
    if (seenInFile.has(phone)) {
      // Aynı dosya içinde tekrar — atla, ama "skipped" sayma; raporlamada
      // gürültü olmasın.
      return;
    }
    seenInFile.add(phone);
    candidates.push(phone);
  });

  if (candidates.length === 0) {
    return NextResponse.json(report);
  }

  // DB'de zaten var olanları çek; bunları skip edeceğiz.
  const existing = new Set<string>();
  for (let i = 0; i < candidates.length; i += INSERT_CHUNK) {
    const chunk = candidates.slice(i, i + INSERT_CHUNK);
    const rows = await db
      .select({ phone: smsSubscribers.phone })
      .from(smsSubscribers)
      .where(inArray(smsSubscribers.phone, chunk));
    for (const r of rows) existing.add(r.phone);
  }

  const now = new Date();
  const toInsert = candidates
    .filter((p) => {
      if (existing.has(p)) {
        report.skipped += 1;
        return false;
      }
      return true;
    })
    .map((phone) => ({
      id: randomUUID(),
      phone,
      consentAt: now,
      createdAt: now,
      ip: "",
      userAgent: "import",
    }));

  for (let i = 0; i < toInsert.length; i += INSERT_CHUNK) {
    const chunk = toInsert.slice(i, i + INSERT_CHUNK);
    if (chunk.length === 0) continue;
    try {
      await db.insert(smsSubscribers).values(chunk);
      report.added += chunk.length;
    } catch (err) {
      // Çakışma race condition'ı: chunk arası başka bir admin aynı
      // numarayı eklemiş olabilir. Tek tek dene, ER_DUP_ENTRY ise skip.
      for (const row of chunk) {
        try {
          await db.insert(smsSubscribers).values(row);
          report.added += 1;
        } catch (innerErr) {
          const msg =
            innerErr instanceof Error ? innerErr.message : String(innerErr);
          if (/duplicate|unique/i.test(msg)) {
            report.skipped += 1;
          } else {
            report.invalid += 1;
            if (report.invalidSamples.length < 10) {
              report.invalidSamples.push({
                row: -1,
                value: row.phone,
                reason: msg.slice(0, 80),
              });
            }
          }
        }
      }
    }
  }

  return NextResponse.json(report);
}
