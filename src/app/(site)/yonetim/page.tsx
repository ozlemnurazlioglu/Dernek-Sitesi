"use client";

import { MemberHierarchyView } from "@/components/site/member-hierarchy";
import { useStore } from "@/lib/store";
import type { BoardLevelConfig, PageHeadersMap } from "@/lib/types";

/**
 * Yönetim Kurulu hiyerarşik organizasyon şeması.
 *
 * Seviyeler (`boardLevels`) admin panelinden yönetilir; her seviyenin avatar
 * boyutu ve sıralaması ayrı ayarlanabilir. Üyeler `level` slug'ı ile bir
 * seviyeye bağlanır, içerideki sıralamayı kendi `sort` alanı belirler.
 *
 * Detaylı render mantığı `<MemberHierarchyView>` içinde — bu bileşen aynı
 * yapıyı Kumru Protokolü sayfasında da kullanır.
 */

const FALLBACK_LEVELS: BoardLevelConfig[] = [
  { id: "fallback-baskan", slug: "baskan", name: "Başkan", size: "lg", sort: 10 },
  { id: "fallback-yonetim", slug: "yonetim", name: "Yönetim", size: "md", sort: 20 },
  { id: "fallback-uye", slug: "uye", name: "Üye", size: "sm", sort: 30 },
];

export default function YonetimPage() {
  const { boardMembers, boardLevels, pageBlocks } = useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.yonetim;

  return (
    <MemberHierarchyView
      title={headers?.title ?? "Yönetim Kurulu"}
      description={headers?.description ?? ""}
      members={boardMembers}
      levels={boardLevels}
      fallbackLevels={FALLBACK_LEVELS}
      emptyMessage="Henüz yönetim kurulu üyesi eklenmemiş."
      topLabel="Yönetim Kurulu"
    />
  );
}
