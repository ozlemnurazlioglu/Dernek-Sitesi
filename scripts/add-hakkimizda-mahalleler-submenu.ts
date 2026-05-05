/**
 * Bir kerelik elle çalıştırılan migration: page_blocks tablosundaki
 * "header.config" JSON'ında "Hakkımızda" menü öğesine "Mahallelerimiz" alt
 * öğesini ekler. Idempotent — zaten varsa atlanır.
 *
 * Kullanım:  npm run db:add-hakkimizda-mahalleler-submenu
 */
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { pageBlocks } from "../src/lib/db/schema";
import type { HeaderConfig } from "../src/lib/types";

async function main() {
  console.log("→ Hakkımızda > Mahallelerimiz submenu güncellemesi başlatılıyor…");

  const rows = await db
    .select()
    .from(pageBlocks)
    .where(eq(pageBlocks.blockKey, "header.config"));

  if (rows.length === 0) {
    console.log("  • header.config henüz yok, atlanıyor (varsayılan kullanılacak)");
    return;
  }

  const cfg = rows[0].data as HeaderConfig | null;
  if (!cfg || !Array.isArray(cfg.menu)) {
    console.log("  • header.config beklenen formatta değil, atlanıyor");
    return;
  }

  let changed = false;
  const nextMenu = cfg.menu.map((item) => {
    const isHakkimizda =
      item.label.trim().toLocaleLowerCase("tr-TR") === "hakkımızda" ||
      item.href === "/hakkimizda";
    if (!isHakkimizda) return item;

    const existing = item.children ?? [];
    const alreadyHas = existing.some(
      (c) => c.href === "/hakkimizda/mahallelerimiz",
    );
    if (alreadyHas) return item;

    changed = true;
    return {
      ...item,
      children: [
        ...existing,
        {
          label: "Mahallelerimiz",
          href: "/hakkimizda/mahallelerimiz",
          enabled: true,
        },
      ],
    };
  });

  if (!changed) {
    console.log("  • Mahallelerimiz alt menüsü zaten var (veya Hakkımızda menüsü yok)");
    return;
  }

  await db
    .update(pageBlocks)
    .set({ data: { ...cfg, menu: nextMenu }, updatedAt: new Date() })
    .where(eq(pageBlocks.blockKey, "header.config"));

  console.log("  • Hakkımızda altına 'Mahallelerimiz' alt menü öğesi eklendi");
  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
