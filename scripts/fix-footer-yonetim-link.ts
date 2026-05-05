/**
 * Bir kerelik elle çalıştırılan migration: page_blocks tablosundaki "footer"
 * JSON'unda "Yönetim Kurulu" linkinin href'ini "/hakkimizda#yonetim"'den
 * "/yonetim"'e günceller. Idempotent — birden fazla çalıştırılabilir,
 * zaten doğru olanlar atlanır.
 *
 * Kullanım:  npm run db:fix-footer-yonetim-link
 */
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { pageBlocks } from "../src/lib/db/schema";
import type { FooterConfig } from "../src/lib/types";

async function main() {
  console.log("→ Footer 'Yönetim Kurulu' linki güncellemesi başlatılıyor…");

  const rows = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.blockKey, "footer"));

  if (rows.length === 0) {
    console.log("  • footer page_block henüz yok, atlanıyor");
    return;
  }

  const row = rows[0];
  const cfg = row.data as FooterConfig | null;
  if (!cfg || !Array.isArray(cfg.groups)) {
    console.log("  • footer JSON beklenen formatta değil, atlanıyor");
    return;
  }

  let changed = false;
  const nextGroups = cfg.groups.map((g) => ({
    ...g,
    links: g.links.map((l) => {
      const isYonetimKurulu =
        l.label.trim().toLocaleLowerCase("tr-TR") === "yönetim kurulu";
      const isOldHref =
        l.href === "/hakkimizda#yonetim" || l.href === "#yonetim";
      if (isYonetimKurulu && isOldHref) {
        changed = true;
        return { ...l, href: "/yonetim" };
      }
      return l;
    }),
  }));

  if (!changed) {
    console.log("  • 'Yönetim Kurulu' linki zaten /yonetim'i gösteriyor (veya hiç yok)");
    return;
  }

  const next: FooterConfig = { ...cfg, groups: nextGroups };
  await db
    .update(pageBlocks)
    .set({ data: next, updatedAt: new Date() })
    .where(eq(pageBlocks.blockKey, "footer"));

  console.log("  • 'Yönetim Kurulu' linki /yonetim olarak güncellendi");
  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
