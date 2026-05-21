"use client";

import { MemberHierarchyView } from "@/components/site/member-hierarchy";
import { useStore } from "@/lib/store";
import type { BoardLevelConfig, PageHeadersMap } from "@/lib/types";

/**
 * Kumru Protokolü hiyerarşik şeması. Yönetim Kurulu ile aynı render
 * mantığını paylaşır; tek farkı veri kaynağı (protocol_*) ve sayfa
 * başlığıdır. Sosyal medya linkleri kartların altında küçük ikonlar
 * olarak çıkar.
 */

const FALLBACK_LEVELS: BoardLevelConfig[] = [
  { id: "fallback-baskan", slug: "baskan", name: "Belediye Başkanı", size: "lg", sort: 10 },
  { id: "fallback-yonetim", slug: "yonetim", name: "Müdür / Yetkili", size: "md", sort: 20 },
  { id: "fallback-uye", slug: "uye", name: "Üye", size: "sm", sort: 30 },
];

export default function KumruProtokoluPage() {
  const { protocolMembers, protocolLevels, pageBlocks } = useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.protokol;

  return (
    <MemberHierarchyView
      title={headers?.title ?? "Kumru Protokolü"}
      description={
        headers?.description ??
        "Derneğimize destek veren resmi kurum yetkililerini ve protokol üyelerini burada listeliyoruz."
      }
      members={protocolMembers}
      levels={protocolLevels}
      fallbackLevels={FALLBACK_LEVELS}
      emptyMessage="Henüz protokol üyesi eklenmemiş."
      topLabel="Kumru Protokolü"
    />
  );
}
