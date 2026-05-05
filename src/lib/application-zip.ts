import { eq, inArray } from "drizzle-orm";
import JSZip from "jszip";
import { db } from "./db";
import {
  applicationDocuments,
  applications,
  requiredDocuments,
} from "./db/schema";
import {
  buildDocumentDownloadName,
  pascalUnderscore,
} from "./filename";
import { fetchDocumentBytes } from "./file-fetch";

/**
 * Verilen başvuru ID'leri için bir ZIP oluşturur.
 *  - Tek başvuru → ZIP kökünde belgeler ({appId}-{Ad}-{Belge}.{ext})
 *  - Birden çok → her başvuru için ayrı klasör + içinde belgeler
 *  - Her klasörde "eksik" belgeler için "EKSIK_BELGELER.txt" raporu üretilir.
 *  - İçeriği okunamayan belgeler için "OKUNAMAYAN_BELGELER.txt" yazılır
 *    (URL'i bozuk veya storage'dan dönmüyor olabilir).
 *
 * Bellekte tutar; toplam ~60 MB altında kalması beklenir (her başvuru
 * en fazla ~6 belge × 10 MB sınırı).
 */
export async function buildApplicationsZip(applicationIds: string[]): Promise<{
  zipBytes: Uint8Array;
  count: number;
}> {
  if (applicationIds.length === 0) {
    throw new Error("En az bir başvuru ID gerekli");
  }

  // 1) Başvuruları çek
  const apps = await db
    .select({
      id: applications.id,
      fullName: applications.fullName,
    })
    .from(applications)
    .where(inArray(applications.id, applicationIds));

  if (apps.length === 0) {
    throw new Error("Hiçbir başvuru bulunamadı");
  }

  // 2) Belgeleri çek
  const docs = await db
    .select()
    .from(applicationDocuments)
    .where(inArray(applicationDocuments.applicationId, applicationIds));

  // 3) RequiredDocuments başlık eşlemesi
  const reqDocs = await db
    .select({
      docKey: requiredDocuments.docKey,
      title: requiredDocuments.title,
    })
    .from(requiredDocuments);
  const titleByKey = new Map<string, string>();
  for (const r of reqDocs) titleByKey.set(r.docKey, r.title);

  const docsByApp = new Map<string, typeof docs>();
  for (const d of docs) {
    const arr = docsByApp.get(d.applicationId) ?? [];
    arr.push(d);
    docsByApp.set(d.applicationId, arr);
  }

  const isMulti = apps.length > 1;
  const zip = new JSZip();

  for (const app of apps) {
    const appDocs = docsByApp.get(app.id) ?? [];
    const folderName = isMulti
      ? `${app.id}-${pascalUnderscore(app.fullName)}`
      : "";
    const target = isMulti ? zip.folder(folderName)! : zip;

    const missing: string[] = [];
    const broken: string[] = [];

    for (const d of appDocs) {
      if (!d.fileUrl) {
        broken.push(
          `${d.docKey} (${d.fileName}) — kaydedilmiş bir dosya yok (eski demo verisi)`,
        );
        continue;
      }
      const fetched = await fetchDocumentBytes(d.fileUrl);
      if (!fetched) {
        broken.push(
          `${d.docKey} (${d.fileName}) — dosya depodan okunamadı: ${d.fileUrl}`,
        );
        continue;
      }
      const name = buildDocumentDownloadName({
        applicationId: app.id,
        applicantFullName: app.fullName,
        docKey: d.docKey,
        docTitle: titleByKey.get(d.docKey) ?? d.docKey,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        contentType: fetched.contentType,
      });
      target.file(name, fetched.bytes);
    }

    // Bu başvuruya hiç belge yüklenmediyse ya da hep bozuksa rapor düş
    if (appDocs.length === 0) {
      missing.push("Bu başvuruya hiç belge yüklenmemiş.");
    }

    if (missing.length > 0) {
      target.file(
        "EKSIK_BELGELER.txt",
        [
          `Başvuru: ${app.id} — ${app.fullName}`,
          "",
          ...missing,
        ].join("\r\n"),
      );
    }
    if (broken.length > 0) {
      target.file(
        "OKUNAMAYAN_BELGELER.txt",
        [
          `Başvuru: ${app.id} — ${app.fullName}`,
          "",
          ...broken,
        ].join("\r\n"),
      );
    }
  }

  const buf = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { zipBytes: buf, count: apps.length };
}
