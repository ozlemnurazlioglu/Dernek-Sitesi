/**
 * Tüm başvuru ID'lerini "{YYYY}burs{NN}" formatına çevirir.
 *
 *   eski: "a-erbo3h4b" / "a-1" / "a-2" gibi rastgele kimlikler
 *   yeni: "2025burs01", "2025burs02", ..., "2026burs01" gibi
 *         (yıl başına sıra; her yıl 01'den başlar; min 2 hane sıfır dolgulu).
 *
 * Akış:
 *   1) Tüm başvurular `submitted_at` ASC ile çekilir.
 *   2) Yıla göre gruplanır; grup içinde sıra numarası 1'den başlar.
 *   3) Her başvuru için (oldId → newId) eşlemesi çıkarılır.
 *   4) `application_documents.application_id` (foreign key) önce güncellenir,
 *      sonra `applications.id` güncellenir. MySQL'in PK→FK referansını
 *      `SET FOREIGN_KEY_CHECKS=0` ile geçici kapatıyoruz; iki UPDATE'in
 *      sırası nedeniyle ara durumda da veri tutarlı.
 *   5) Geri açılır. İdempotenttir; zaten yeni formatta olan ID'ler atlanır.
 *
 * Bu script hem TiDB Cloud (lokal tsx ile) hem de cPanel MariaDB
 * (sunucudaki Node ortamında tsx ile) çalıştırılır; her DB kendi
 * kayıtlarını bağımsız renumber eder.
 *
 * Kullanım:
 *   npx tsx scripts/renumber-applications.ts            # uygula
 *   npx tsx scripts/renumber-applications.ts --dry-run  # planı göster, DB'ye dokunma
 */
import { config as loadEnv } from "dotenv";

const DRY = process.argv.includes("--dry-run");

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

async function main() {
  loadEnv({ path: ".env.local" });
  loadEnv();

  const { sql, asc } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");
  const { applications, applicationDocuments } = await import(
    "../src/lib/db/schema"
  );

  const all = await db
    .select({
      id: applications.id,
      submittedAt: applications.submittedAt,
      fullName: applications.fullName,
    })
    .from(applications)
    .orderBy(asc(applications.submittedAt));

  if (all.length === 0) {
    console.log("Hiç başvuru yok, yapılacak iş yok.");
    return;
  }

  // Yıla göre grupla, sıra ata.
  const idMap: { oldId: string; newId: string; fullName: string }[] = [];
  const seqByYear = new Map<number, number>();
  for (const row of all) {
    const year = new Date(row.submittedAt).getFullYear();
    const next = (seqByYear.get(year) ?? 0) + 1;
    seqByYear.set(year, next);
    const newId = `${year}burs${pad2(next)}`;
    idMap.push({ oldId: row.id, newId, fullName: row.fullName });
  }

  console.log(`Toplam ${idMap.length} başvuru için renumber planı:`);
  for (const m of idMap) {
    const arrow = m.oldId === m.newId ? "= (zaten doğru format)" : "→";
    console.log(`  ${m.oldId.padEnd(20)} ${arrow} ${m.newId}   (${m.fullName})`);
  }

  if (DRY) {
    console.log("\n--dry-run: DB'ye dokunulmadı.");
    return;
  }

  // Geçici çakışma riskini önlemek için iki aşamalı strateji:
  // 1) Önce `__tmp__{newId}` adına çek (eski/yeni ID'leri arasında çakışma olursa
  //    da güvenli; örn. "a-1" → "2025burs01" ve "2025burs03" → "2025burs02"
  //    gibi kayma senaryoları),
  // 2) Sonra `__tmp__{newId}` → `{newId}`.
  //
  // FOREIGN_KEY_CHECKS kapalı tutulur ki UPDATE arası FK doğrulaması yapılmasın.
  await db.execute(sql`SET FOREIGN_KEY_CHECKS=0`);
  try {
    // Aşama 1: hepsini geçici prefix'e taşı
    for (const m of idMap) {
      const tmp = `__tmp__${m.newId}`;
      await db.execute(
        sql`UPDATE application_documents SET application_id = ${tmp} WHERE application_id = ${m.oldId}`,
      );
      await db.execute(
        sql`UPDATE applications SET id = ${tmp} WHERE id = ${m.oldId}`,
      );
    }
    // Aşama 2: geçici prefix'ten gerçek hedef ID'ye taşı
    for (const m of idMap) {
      const tmp = `__tmp__${m.newId}`;
      await db.execute(
        sql`UPDATE application_documents SET application_id = ${m.newId} WHERE application_id = ${tmp}`,
      );
      await db.execute(
        sql`UPDATE applications SET id = ${m.newId} WHERE id = ${tmp}`,
      );
    }
  } finally {
    await db.execute(sql`SET FOREIGN_KEY_CHECKS=1`);
  }

  console.log(`\n✓ ${idMap.length} başvuru renumber edildi.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("renumber-applications failed:", err);
    process.exit(1);
  });
