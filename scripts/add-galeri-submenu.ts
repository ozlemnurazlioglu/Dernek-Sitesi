/**
 * Bir kerelik elle çalıştırılan migration: page_blocks tablosundaki
 * "header.config" JSON'ında "Bağış" menü öğesinden ÖNCE (yoksa sonuna)
 * "Galeri" parent öğesini Foto Galeri / Video Galeri alt menüleriyle ekler.
 *
 * Idempotent — zaten varsa atlanır.
 *
 * Kullanım:  npm run db:add-galeri-submenu
 */
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { pageBlocks } from "../src/lib/db/schema";
import type { HeaderConfig } from "../src/lib/types";

async function main() {
  console.log("→ Header > Galeri submenu güncellemesi başlatılıyor…");

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

  const alreadyHasGaleri = cfg.menu.some(
    (item) =>
      item.label.trim().toLocaleLowerCase("tr-TR") === "galeri" ||
      item.href === "/galeri/foto" ||
      item.href === "/galeri",
  );

  if (alreadyHasGaleri) {
    console.log("  • Galeri menüsü zaten var, atlanıyor");
    return;
  }

  const galeriItem = {
    label: "Galeri",
    href: "/galeri/foto",
    enabled: true,
    children: [
      { label: "Foto Galeri", href: "/galeri/foto", enabled: true },
      { label: "Video Galeri", href: "/galeri/video", enabled: true },
    ],
  };

  // "Bağış" / "İletişim"den önce eklemeye çalış. Yoksa sona koy.
  const insertBeforeLabels = ["bağış", "i̇letişim", "iletişim"];
  let insertIdx = cfg.menu.findIndex((item) =>
    insertBeforeLabels.includes(item.label.trim().toLocaleLowerCase("tr-TR")),
  );
  if (insertIdx < 0) insertIdx = cfg.menu.length;

  const nextMenu = [...cfg.menu];
  nextMenu.splice(insertIdx, 0, galeriItem);

  await db
    .update(pageBlocks)
    .set({ data: { ...cfg, menu: nextMenu }, updatedAt: new Date() })
    .where(eq(pageBlocks.blockKey, "header.config"));

  console.log(
    `  • Galeri menüsü ${insertIdx}. konuma eklendi (Foto Galeri + Video Galeri alt menüleriyle)`,
  );
  console.log("✓ Tamam.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Migration hatası:", err);
    process.exit(1);
  });
