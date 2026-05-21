"use client";

import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/section";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { BoardLevelConfig, BoardMember } from "@/lib/types";

// Lucide-react bu projedeki versiyonda marka logolarını export etmediği
// için inline SVG kullanıyoruz. `social-links.tsx` ile aynı path verisi.
function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z" />
    </svg>
  );
}
function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}
function WebsiteLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/**
 * Yönetim Kurulu ve Kumru Protokolü sayfalarının ortak görünümü.
 *
 * Aynı hiyerarşik organizasyon şeması yapısını kullanan iki public sayfa
 * tek bir yerden render ediliyor. Tek farkları veri kaynakları (board vs
 * protocol) ve sayfa başlığı/açıklamasıdır.
 *
 * `members` ve `levels` parametreleri admin'in kaydettiği listelerdir;
 * `fallbackLevels` admin hiç seviye tanımlamadıysa kullanılır. Her üye için
 * `bio` doluysa kart tıklanabilir hale gelir ve modal'da özgeçmiş gösterilir;
 * `twitter/instagram/facebook/website` doluysa kartın altında o ikona link
 * çıkar.
 */
export function MemberHierarchyView({
  title,
  description,
  members,
  levels,
  fallbackLevels,
  emptyMessage,
  topLabel,
}: {
  title: string;
  description: string;
  members: BoardMember[];
  levels: BoardLevelConfig[];
  fallbackLevels: BoardLevelConfig[];
  /** Hiç üye yokken gösterilecek metin. */
  emptyMessage: string;
  /** Şemanın en tepesindeki başlık altı (örn. "Yönetim Kurulu" veya "Protokol"). */
  topLabel: string;
}) {
  const { siteSettings, currentUser } = useStore();
  const [selected, setSelected] = useState<BoardMember | null>(null);
  const canDownloadPdf = currentUser?.role === "admin";

  const effectiveLevels = useMemo<BoardLevelConfig[]>(
    () =>
      levels.length > 0
        ? [...levels].sort((a, b) => a.sort - b.sort)
        : fallbackLevels,
    [levels, fallbackLevels],
  );

  const groups = useMemo(() => {
    const sortFn = (a: BoardMember, b: BoardMember) => a.sort - b.sort;
    const known = new Set(effectiveLevels.map((lv) => lv.slug));
    const out: { level: BoardLevelConfig; members: BoardMember[] }[] =
      effectiveLevels.map((lv) => ({
        level: lv,
        members: members.filter((m) => m.level === lv.slug).sort(sortFn),
      }));
    const orphans = members.filter((m) => !known.has(m.level)).sort(sortFn);
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
  }, [effectiveLevels, members]);

  function handleDownloadPdf() {
    if (typeof window === "undefined") return;
    window.print();
  }

  return (
    <>
      <section className="bg-brand-900 text-white print:hidden">
        <Container className="py-8 md:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              {title && (
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 text-sm md:text-base text-white/70 max-w-2xl">
                  {description}
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
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-brand-900 flex items-center justify-center shadow-md ring-1 ring-brand-100 print:shadow-none">
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
          <p className="text-sm text-muted-foreground mt-1">{topLabel}</p>
        </div>

        {groups.map((g, idx) => {
          const size = g.level.size;
          const isLast = idx === groups.length - 1;
          const isSolo = g.members.length === 1;

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

        {members.length === 0 && (
          <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center text-muted-foreground">
            {emptyMessage}
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

  const cardInner = (
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

  // Sosyal ikonların bio butonunun içinde olmaması lazım — yoksa link
  // tıklamasında modal açılır. Bu yüzden wrapper her zaman bir div;
  // bio butonu sadece avatar + ad + rol kapsar, ikonlar ayrı bir blok.
  return (
    <div className={cn("flex flex-col items-center", widthClass)}>
      {hasBio ? (
        <button
          type="button"
          onClick={() => onSelect(member)}
          title="Biyografiyi gör"
          aria-label={`${member.name} biyografisini gör`}
          className={cn(
            "group flex flex-col items-center text-center cursor-pointer rounded-xl w-full",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
          )}
        >
          {cardInner}
        </button>
      ) : (
        cardInner
      )}
      <SocialLinks member={member} />
    </div>
  );
}

function SocialLinks({ member }: { member: BoardMember }) {
  type IconType = ComponentType<{ className?: string }>;
  const links: { url: string; label: string; Icon: IconType }[] = [];
  if (member.twitter?.trim()) {
    links.push({ url: member.twitter, label: "Twitter / X", Icon: XLogo });
  }
  if (member.instagram?.trim()) {
    links.push({ url: member.instagram, label: "Instagram", Icon: InstagramLogo });
  }
  if (member.facebook?.trim()) {
    links.push({ url: member.facebook, label: "Facebook", Icon: FacebookLogo });
  }
  if (member.website?.trim()) {
    links.push({ url: member.website, label: "Web sayfası", Icon: WebsiteLogo });
  }
  if (links.length === 0) return null;
  return (
    <div className="mt-2 flex items-center justify-center gap-1.5 print:hidden">
      {links.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand-700 hover:text-white transition-colors"
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
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
            <SocialLinks member={member} />
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
