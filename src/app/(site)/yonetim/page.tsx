"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/section";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { BoardLevel, BoardMember, PageHeadersMap } from "@/lib/types";

/**
 * Yönetim Kurulu hiyerarşik organizasyon şeması.
 *  - Başkan (büyük yuvarlak avatar, en üstte)
 *  - Yönetim ekibi (orta boy, 4 sütun)
 *  - Üyeler (küçük boy, responsive grid)
 * İçerik tamamen `boardMembers` tablosundan beslenir; admin panelden
 * isim, görev, fotoğraf, level ve sıralama düzenlenebilir.
 *
 * Biyografisi olan üyelerin kartı tıklanabilirdir; tıklanınca `Modal`
 * içinde özgeçmiş gösterilir. Biyografi alanı boş olan üyelerde tıklama
 * etkisizdir (boş popup açıp kullanıcıyı şaşırtmamak için).
 */
export default function YonetimPage() {
  const { boardMembers, pageBlocks, siteSettings } = useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.yonetim;
  const [selected, setSelected] = useState<BoardMember | null>(null);

  const grouped = useMemo(() => {
    const sortFn = (a: BoardMember, b: BoardMember) => a.sort - b.sort;
    const by = (lvl: BoardLevel) =>
      boardMembers.filter((m) => m.level === lvl).sort(sortFn);
    return {
      baskan: by("baskan"),
      yonetim: by("yonetim"),
      uye: by("uye"),
    };
  }, [boardMembers]);

  const baskan = grouped.baskan[0];

  return (
    <>
      {/* Üst koyu bant — görseldekine benzer kompakt başlık alanı */}
      <section className="bg-brand-900 text-white">
        <Container className="py-8 md:py-10">
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
        </Container>
      </section>

      <Container className="py-12 md:py-20">
        {/* Dernek logo + isim — organizasyon şemasının tepesi */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-brand-900 flex items-center justify-center shadow-md ring-1 ring-brand-100">
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

        {/* BAŞKAN */}
        {baskan && (
          <>
            <div className="flex justify-center">
              <MemberBlock
                member={baskan}
                size="lg"
                widthClass="w-44"
                roleClass="text-sm text-gold-600 mt-0.5"
                nameClass="font-semibold text-brand-900 text-base"
                onSelect={setSelected}
              />
            </div>
            <Connector />
          </>
        )}

        {/* YÖNETİM EKİBİ */}
        {grouped.yonetim.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
              {grouped.yonetim.map((m) => (
                <MemberBlock
                  key={m.id}
                  member={m}
                  size="md"
                  widthClass="w-32 sm:w-36"
                  nameClass="font-semibold text-brand-900 text-sm"
                  roleClass="text-xs text-muted-foreground mt-0.5"
                  onSelect={setSelected}
                />
              ))}
            </div>
            {grouped.uye.length > 0 && <Connector />}
          </>
        )}

        {/* ÜYELER */}
        {grouped.uye.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-8 justify-items-center">
            {grouped.uye.map((m) => (
              <MemberBlock
                key={m.id}
                member={m}
                size="sm"
                widthClass="w-full max-w-[140px]"
                nameClass="font-semibold text-brand-900 text-sm"
                roleClass="text-xs text-muted-foreground mt-0.5"
                onSelect={setSelected}
              />
            ))}
          </div>
        )}

        {boardMembers.length === 0 && (
          <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Henüz yönetim kurulu üyesi eklenmemiş.
          </div>
        )}
      </Container>

      <MemberBioModal
        member={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function MemberBlock({
  member,
  size,
  widthClass,
  nameClass,
  roleClass,
  onSelect,
}: {
  member: BoardMember;
  size: "lg" | "md" | "sm";
  widthClass: string;
  nameClass: string;
  roleClass: string;
  onSelect: (m: BoardMember) => void;
}) {
  const hasBio = member.bio.trim().length > 0;

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
  return (
    <Modal open={!!member} onClose={onClose} title={member?.name ?? ""} size="md">
      {member && (
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5">
          <div className="shrink-0">
            <div className="relative h-28 w-28 rounded-full overflow-hidden bg-brand-50 ring-2 ring-brand-200">
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
  size: "lg" | "md" | "sm";
  interactive?: boolean;
}) {
  const sizeClass =
    size === "lg"
      ? "h-32 w-32 md:h-36 md:w-36"
      : size === "md"
        ? "h-20 w-20 md:h-24 md:w-24"
        : "h-16 w-16 md:h-20 md:w-20";
  const ringClass = size === "lg" ? "ring-4" : "ring-2";

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-brand-50 ring-brand-200 transition",
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
