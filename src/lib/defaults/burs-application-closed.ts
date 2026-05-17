import type { BursApplicationClosedText } from "@/lib/types";

/** Başvuru dönemi kapalıyken /burs/basvuru sayfasında gösterilen duyuru. */
export const DEFAULT_BURS_APPLICATION_CLOSED: BursApplicationClosedText = {
  title: "Burs başvuruları şu an kapalı",
  description:
    "Bu dönem için online başvuru alımı sona ermiştir. Komisyonumuz mevcut başvuruları değerlendirmeye devam etmektedir.",
  showSystemDate: true,
  footnote:
    "Daha önce gönderdiğiniz başvurunuz varsa üyelik panelinizden durumunu takip edebilirsiniz.",
};

export function normalizeBursApplicationClosed(
  raw: unknown,
): BursApplicationClosedText {
  const o =
    raw && typeof raw === "object"
      ? (raw as Partial<BursApplicationClosedText>)
      : {};
  return {
    title:
      typeof o.title === "string" && o.title.trim()
        ? o.title.trim()
        : DEFAULT_BURS_APPLICATION_CLOSED.title,
    description:
      typeof o.description === "string" && o.description.trim()
        ? o.description
        : DEFAULT_BURS_APPLICATION_CLOSED.description,
    showSystemDate:
      typeof o.showSystemDate === "boolean"
        ? o.showSystemDate
        : DEFAULT_BURS_APPLICATION_CLOSED.showSystemDate,
    footnote:
      typeof o.footnote === "string"
        ? o.footnote
        : DEFAULT_BURS_APPLICATION_CLOSED.footnote,
  };
}
