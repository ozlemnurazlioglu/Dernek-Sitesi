/**
 * Burs başvurularına ait fiziksel dosyaların (Vercel Blob veya
 * `public/uploads/...` altındaki yerel dosyalar) temizlenmesi.
 *
 * `applicationDocuments.applicationId` ilişkisi `onDelete: "cascade"` ile
 * tanımlı olduğu için DB satırları zaten otomatik silinir. Bu modül *fiziksel*
 * dosyaları sızdırmamak için ek bir temizlik adımıdır.
 *
 * "Best-effort" çalışır: bir dosyanın silinmesi başarısız olsa bile DB silme
 * işlemini engellemez; yalnızca uyarı log'lanır. Bunun nedeni, dosya zaten
 * yoksa (manuel silinmiş, geçici hata, vs.) admin'in başvuruyu silmesini
 * engellememek.
 */

import { unlink } from "node:fs/promises";
import path from "node:path";
import { inArray } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { applicationDocuments } from "@/lib/db/schema";

/**
 * Verilen başvuru ID(leri)ne ait tüm belgelerin fiziksel dosyalarını sil.
 *
 * NOT: Bu fonksiyon DB satırlarına dokunmaz; sadece dosya sistemini / Blob
 * deposunu temizler. DB silme işlemi çağıran route'ta yapılmalıdır (CASCADE
 * sayesinde `applications` satırı silinince `application_documents` da
 * otomatik gider).
 *
 * @returns Silinen / atlanan dosya sayısı (telemetri için).
 */
export async function purgeApplicationFiles(
  applicationIds: string[],
): Promise<{ deleted: number; skipped: number; failed: number }> {
  if (applicationIds.length === 0) {
    return { deleted: 0, skipped: 0, failed: 0 };
  }

  // Tek seferde tüm fileUrl'leri çek — başvuru başına ayrı sorgu açmaktan
  // çok daha hızlı.
  const docs = await db
    .select({ fileUrl: applicationDocuments.fileUrl })
    .from(applicationDocuments)
    .where(inArray(applicationDocuments.applicationId, applicationIds));

  let deleted = 0;
  let skipped = 0;
  let failed = 0;

  // Vercel Blob URL'lerini paralel silmek için ayrı topla; yerel dosyaları
  // sıralı sil (disk I/O zaten ucuz).
  const blobUrls: string[] = [];

  for (const { fileUrl } of docs) {
    if (!fileUrl || fileUrl.length === 0) {
      // Eski demo verisi; saklayacak dosya yok.
      skipped++;
      continue;
    }

    if (fileUrl.startsWith("/uploads/")) {
      // Yerel disk: public/<fileUrl ilk slash hariç>
      const absolute = path.join(
        process.cwd(),
        "public",
        fileUrl.replace(/^\/+/, ""),
      );
      try {
        await unlink(absolute);
        deleted++;
      } catch (err: unknown) {
        const code =
          typeof err === "object" && err && "code" in err
            ? (err as { code: string }).code
            : undefined;
        if (code === "ENOENT") {
          // Dosya zaten yok — admin için sorun değil.
          skipped++;
        } else {
          failed++;
          console.warn(
            "[application-files] yerel dosya silinemedi",
            absolute,
            err,
          );
        }
      }
    } else if (/^https?:\/\//i.test(fileUrl)) {
      // Vercel Blob (veya başka uzak depo) — paralel batch için topla.
      blobUrls.push(fileUrl);
    } else {
      // Tanınmayan format — güvenli tarafta kal, dokunma.
      skipped++;
      console.warn("[application-files] tanınmayan fileUrl atlandı:", fileUrl);
    }
  }

  if (blobUrls.length > 0) {
    // @vercel/blob `del()` hem tek string hem string[] kabul eder ve eksik
    // BLOB_READ_WRITE_TOKEN durumunda atar — bu durumda atlayalım.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(blobUrls);
        deleted += blobUrls.length;
      } catch (err) {
        failed += blobUrls.length;
        console.warn(
          "[application-files] Vercel Blob silme başarısız",
          { count: blobUrls.length },
          err,
        );
      }
    } else {
      // Token yok — fiziksel Blob'a erişemediğimiz için "skip" sayıyoruz,
      // hata değil. (Self-hosted ortamlar için.)
      skipped += blobUrls.length;
    }
  }

  return { deleted, skipped, failed };
}
