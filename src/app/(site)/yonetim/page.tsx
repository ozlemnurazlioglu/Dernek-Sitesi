"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/section";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type {
  BoardLevelConfig,
  BoardMember,
  PageHeadersMap,
} from "@/lib/types";

/**
 * Yönetim Kurulu hiyerarşik organizasyon şeması.
 *
 * Seviyeler (`boardLevels`) admin panelinden yönetilir; her seviyenin avatar
 * boyutu ve sıralaması ayrı ayarlanabilir. Üyeler `level` slug'ı ile bir
 * seviyeye bağlanır, içerideki sıralamayı kendi `sort` alanı belirler.
 *
 * Üyenin `shape` alanı yuvarlak ya da kare avatar seçimini taşır; her üye
 * için ayrı seçilebilir. Biyografisi olan üyelerin kartı tıklanabilirdir;
 * tıklanınca `Modal` içinde özgeçmiş gösterilir.
 *
 * "PDF olarak İndir" butonu tarayıcının yazdırma diyaloğunu açar — kullanıcı
 * çıktı hedefini "PDF olarak kaydet" seçince sayfa olduğu gibi PDF olarak
 * indirilir. Yazdırılırken header/footer/butonlar `print:hidden` ile gizlenir.
 */

const FALLBACK_LEVELS: BoardLevelConfig[] = [
  { id: "fallback-baskan", slug: "baskan", name: "Başkan", size: "lg", sort: 10 },
  { id: "fallback-yonetim", slug: "yonetim", name: "Yönetim", size: "md", sort: 20 },
  { id: "fallback-uye", slug: "uye", name: "Üye", size: "sm", sort: 30 },
];

export default function YonetimPage() {
  const { boardMembers, boardLevels, pageBlocks, siteSettings, currentUser } =
    useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.yonetim;
  const [selected, setSelected] = useState<BoardMember | null>(null);
  // PDF indirme yalnızca admin için anlamlı (yetkili rapor / arşiv).
  // Normal ziyaretçi ve üye giriş yapmış olsa bile butonu görmemeli.
  const canDownloadPdf = currentUser?.role === "admin";

  // Admin seviye tanımlamadıysa eski 3'lü hiyerarşiyle geriye uyumluluk
  // koru. Aksi takdirde DB'deki sıraya göre render et.
  const levels = useMemo<BoardLevelConfig[]>(
    () =>
      boardLevels.length > 0
        ? [...boardLevels].sort((a, b) => a.sort - b.sort)
        : FALLBACK_LEVELS,
    [boardLevels],
  );

  // Her seviye için üyeleri grupla (sort artan). Slug'ı bilinmeyen üyeler
  // — örneğin admin seviye silmiş ama üyeler eskide kalmış — son bir
  // "Diğer" grubunda gösterilir; veriden kaybolmasın.
  const groups = useMemo(() => {
    const sortFn = (a: BoardMember, b: BoardMember) => a.sort - b.sort;
    const known = new Set(levels.map((lv) => lv.slug));
    const out: { level: BoardLevelConfig; members: BoardMember[] }[] = levels.map(
      (lv) => ({
        level: lv,
        members: boardMembers.filter((m) => m.level === lv.slug).sort(sortFn),
      }),
    );
    const orphans = boardMembers.filter((m) => !known.has(m.level)).sort(sortFn);
    if (orphans.length > 0) {
      out.push({
        level: {
          id: "orphans",
          slug: "_orphans",
          name: "Diğer",
          size: "sm",
          sort: 9999,
        },
        members: orphans,
      });
    }
    return out.filter((g) => g.members.length > 0);
  }, [levels, boardMembers]);

  function handleDownloadPdf() {
    if (typeof window === "undefined") return;
    // Tarayıcı yazdırma diyaloğunu açar. Kullanıcı "PDF olarak kaydet"
    // hedefini seçince şemayı dosya olarak indirir; @media print kuralları
    // header/footer'ı gizleyip beyaz bir A4 sayfası bırakır.
    window.print();
  }

  return (
    <>
      {/* Üst koyu bant — yazdırırken gizlenir */}
      <section className="bg-brand-900 text-white print:hidden">
        <Container className="py-8 md:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              {headers?.title && (
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {headers.title}
                </h1>
              )}
              {headers?.description && (
                <p className="mt-2 text-sm md:text-base text-white/70 max-w-2xl">
                  {headers.description}
                </p>
              )}
            </div>
            {canDownloadPdf && (
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                leftIcon={<Download className="h-4 w-4" />}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                PDF olarak İndir
              </Button>
            )}
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-20">
        {/* Dernek logo + isim — organizasyon şemasının tepesi */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-brand-900 flex items-center justify-center shadow-md ring-1 ring-brand-100 print:no-shadow">
            {siteSettings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.shortName || "Dernek"}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <span className="text-gold-300 text-2xl font-bold tracking-wider">
                {(siteSettings.shortName || "K").charAt(0)}
              </span>
            )}
          </div>
          <h2 className="mt-4 text-xl md:text-2xl font-bold text-brand-900">
            {siteSettings.name ||
              siteSettings.shortName ||
              "Kumrulular Derneği"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Yönetim Kurulu</p>
        </div>

        {/* Seviyelere göre hiyerarşi şeması. Tek bir üye varsa yatayda
            ortalanır, çok varsa wrap'lı esnek bir satır. Seviye geçişlerinde
            dikey konektör çizgisi çizilir (son seviyeden sonra hariç). */}
        {groups.map((g, idx) => {
          const size = g.level.size;
          const isLast = idx === groups.length - 1;
          const isSolo = g.members.length === 1;

          // Grid yerine flex-wrap kullanıyoruz; tek kişi varsa ortada,
          // çok kişi varsa eşit aralıklarla yerleşsin diye.
          return (
            <div key={g.level.id}>
              <div
                className={cn(
                  "flex flex-wrap justify-center",
                  size === "lg"
                    ? "gap-x-12 gap-y-10"
                    : size === "md"
                      ? "gap-x-10 gap-y-8"
                      : "gap-x-4 gap-y-8",
                )}
              >
                {g.members.map((m) => (
                  <MemberBlock
                    key={m.id}
                    member={m}
                    size={size}
                    isSolo={isSolo}
                    onSelect={setSelected}
                  />
                ))}
              </div>
              {!isLast && <Connector />}
            </div>
          );
        })}

        {boardMembers.length === 0 && (
          <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Henüz yönetim kurulu üyesi eklenmemiş.
          </div>
        )}
      </Container>

      <MemberBioModal member={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function MemberBlock({
  member,
  size,
  isSolo,
  onSelect,
}: {
  member: BoardMember;
  size: BoardLevelConfig["size"];
  isSolo: boolean;
  onSelect: (m: BoardMember) => void;
}) {
  const hasBio = member.bio.trim().length > 0;

  const widthClass =
    size === "lg"
      ? "w-44"
      : size === "md"
        ? "w-32 sm:w-36"
        : size === "xs"
          ? "w-24 sm:w-28"
          : isSolo
            ? "w-32"
            : "w-full max-w-[140px]";
  const nameClass =
    size === "lg"
      ? "font-semibold text-brand-900 text-base"
      : "font-semibold text-brand-900 text-sm";
  const roleClass =
    size === "lg"
      ? "text-sm text-gold-600 mt-0.5"
      : "text-xs text-muted-foreground mt-0.5";

  const inner = (
    <>
      <PersonAvatar member={member} size={size} interactive={hasBio} />
      <div className="mt-3 text-center">
        <div
          className={cn(
            nameClass,
            hasBio &&
              "group-hover:text-brand-700 group-focus-visible:text-brand-700 transition-colors",
          )}
        >
          {member.name}
        </div>
        <div className={roleClass}>{member.role}</div>
      </div>
    </>
  );

  if (!hasBio) {
    return (
      <div className={cn("flex flex-col items-center", widthClass)}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(member)}
      title="Biyografiyi gör"
      aria-label={`${member.name} biyografisini gör`}
      className={cn(
        "group flex flex-col items-center text-center cursor-pointer rounded-xl",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
        widthClass,
      )}
    >
      {inner}
    </button>
  );
}

function MemberBioModal({
  member,
  onClose,
}: {
  member: BoardMember | null;
  onClose: () => void;
}) {
  const shape = member?.shape === "square" ? "square" : "circle";
  const radiusClass = shape === "square" ? "rounded-2xl" : "rounded-full";
  return (
    <Modal open={!!member} onClose={onClose} title={member?.name ?? ""} size="md">
      {member && (
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5">
          <div className="shrink-0">
            <div
              className={cn(
                "relative h-28 w-28 overflow-hidden bg-brand-50 ring-2 ring-brand-200",
                radiusClass,
              )}
            >
              {member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-400 text-2xl font-semibold">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-brand-900">
              {member.name}
            </div>
            <div className="text-sm text-gold-600 mt-0.5">{member.role}</div>
            <p className="mt-4 text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
              {member.bio}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function PersonAvatar({
  member,
  size,
  interactive = false,
}: {
  member: BoardMember;
  size: BoardLevelConfig["size"];
  interactive?: boolean;
}) {
  const sizeClass =
    size === "lg"
      ? "h-32 w-32 md:h-36 md:w-36"
      : size === "md"
        ? "h-20 w-20 md:h-24 md:w-24"
        : size === "xs"
          ? "h-14 w-14 md:h-16 md:w-16"
          : "h-16 w-16 md:h-20 md:w-20";
  const ringClass = size === "lg" ? "ring-4" : "ring-2";
  const shape = member.shape === "square" ? "square" : "circle";
  const radiusClass = shape === "square" ? "rounded-2xl" : "rounded-full";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-brand-50 ring-brand-200 transition",
        radiusClass,
        sizeClass,
        ringClass,
        interactive &&
          "group-hover:ring-brand-400 group-hover:scale-[1.04] group-focus-visible:ring-brand-400",
      )}
    >
      {member.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.avatar}
          alt={member.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-brand-400 font-semibold">
          {member.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-center my-6 md:my-8">
      <div className="w-px h-10 md:h-14 bg-brand-200" />
    </div>
  );
}
