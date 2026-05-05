/**
 * Tüm idempotent migration scriptlerini sırayla çalıştırır.
 * `.env.local`'daki DATABASE_URL'e bağlanır — production DB'ye işaret
 * ediyorsa doğrudan production'ı günceller.
 *
 * Kullanım:  npm run db:migrate-all
 *
 * Her adım kendi içinde tekrar çalıştırılabilir; tablo/kolon zaten varsa
 * sessizce atlar. Bir adım hata verirse zincir durur ve kalan adımları
 * elle sürdürebilirsin.
 */
import { spawn } from "node:child_process";
import path from "node:path";

const STEPS: { label: string; script: string }[] = [
  { label: "1/9 Sponsor türleri tablosu",         script: "scripts/add-sponsor-tiers.ts" },
  { label: "2/9 announcements.phone kolonu",      script: "scripts/add-announcement-phone.ts" },
  { label: "3/9 Footer 'Yönetim Kurulu' linki",   script: "scripts/fix-footer-yonetim-link.ts" },
  { label: "4/9 neighborhoods tablosu",           script: "scripts/add-neighborhoods.ts" },
  { label: "5/9 Hakkımızda > Mahallelerimiz alt menüsü", script: "scripts/add-hakkimizda-mahalleler-submenu.ts" },
  { label: "6/9 Galeri tabloları",                script: "scripts/add-galleries.ts" },
  { label: "7/9 Üst menüye 'Galeri' alt menüsü",  script: "scripts/add-galeri-submenu.ts" },
  { label: "8/9 site_settings analytics/reklam kolonları", script: "scripts/add-analytics-fields.ts" },
  { label: "9/9 donors tablosu + örnek veri",     script: "scripts/add-donors.ts" },
];

function runStep(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Windows'ta `npx.cmd` çağrısının düzgün çalışması için shell:true.
    // Path argümanlarındaki boşluk/Türkçe karakter olabilir diye script
    // yolunu çift tırnağa alıyoruz.
    const child = spawn(
      `npx tsx --env-file=.env.local "${scriptPath}"`,
      { stdio: "inherit", shell: true, cwd: path.resolve(".") },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Script ${scriptPath} ${code} koduyla çıktı`));
    });
  });
}

async function main() {
  console.log("════════════════════════════════════════════════════════════");
  console.log("  Production DB Migration — 9 adım");
  console.log("  DATABASE_URL üzerinden bağlanılacak (.env.local)");
  console.log("════════════════════════════════════════════════════════════\n");

  for (const step of STEPS) {
    console.log(`\n▶ ${step.label}`);
    console.log(`  ${step.script}`);
    console.log("  ─────────────────────────────────────────────────");
    await runStep(step.script);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log("  ✓ Tüm migration adımları tamamlandı.");
  console.log("════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("\n✗ Migration zinciri durdu:", err.message);
  console.error("  Hata veren adımı düzeltip yeniden çalıştırabilirsin.");
  process.exit(1);
});
