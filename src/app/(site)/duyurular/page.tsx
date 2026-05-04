"use client";

import { useMemo, useState } from "react";
import {
  LayoutGrid,
  Heart,
  Sparkles,
  Calendar,
  Megaphone,
  HeartHandshake,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import {
  AnnouncementCard,
  getAnnouncementColors,
} from "@/components/site/announcement-card";
import { useStore } from "@/lib/store";
import type { PageHeadersMap } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  vefat: HeartHandshake,
  dugun: Heart,
  nisan: Sparkles,
  etkinlik: Calendar,
  duyuru: Megaphone,
  diger: Layers,
};

export default function DuyurularPage() {
  const { announcements, announcementCategories, pageBlocks } = useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.duyurular;

  const [active, setActive] = useState<string>("all");

  const sortedCategories = useMemo(
    () => [...announcementCategories].sort((a, b) => a.sort - b.sort),
    [announcementCategories],
  );

  const filtered = useMemo(() => {
    const sorted = [...announcements].sort((a, b) => a.sort - b.sort);
    if (active === "all") return sorted;
    return sorted.filter((a) => a.categorySlug === active);
  }, [announcements, active]);

  const catBySlug = useMemo(() => {
    const m: Record<string, (typeof announcementCategories)[number]> = {};
    for (const c of announcementCategories) m[c.slug] = c;
    return m;
  }, [announcementCategories]);

  return (
    <>
      <PageHeader
        title={headers?.title ?? "Hemşehrilerimizden İlanlar"}
        description={
          headers?.description ?? "Vefat, düğün, nişan ve etkinlik duyuruları"
        }
      />
      <Container className="py-12 md:py-16">
        {/* Filtre tabları */}
        <div className="flex flex-wrap gap-2 mb-8">
          <FilterPill
            active={active === "all"}
            onClick={() => setActive("all")}
            icon={<LayoutGrid className="h-4 w-4" />}
            color="brand"
          >
            Tümü
          </FilterPill>
          {sortedCategories.map((c) => {
            const Icon = ICONS[c.slug] ?? Layers;
            return (
              <FilterPill
                key={c.slug}
                active={active === c.slug}
                onClick={() => setActive(c.slug)}
                icon={<Icon className="h-4 w-4" />}
                color={c.color}
              >
                {c.name}
              </FilterPill>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Bu kategoride henüz ilan yok.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <AnnouncementCard
                key={a.id}
                item={a}
                category={catBySlug[a.categorySlug]}
              />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

function FilterPill({
  active,
  onClick,
  icon,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: string;
}) {
  const colors = getAnnouncementColors(color);
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium border transition-all " +
        (active
          ? `${colors.badgeBg} ${colors.badgeText} border-transparent shadow-sm`
          : "bg-white text-brand-900 border-border hover:bg-muted hover:border-brand-200")
      }
    >
      {icon}
      {children}
    </button>
  );
}
