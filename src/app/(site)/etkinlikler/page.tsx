"use client";

import { useMemo, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR } from "@/lib/utils";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText, PageHeadersMap } from "@/lib/types";

export default function EtkinliklerPage() {
  const { events, eventCategories, pageBlocks } = useStore();
  const { toast } = useToast();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.etkinlikler;
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const allLabel = ui.filters?.allLabel ?? DEFAULT_COMMON_UI.filters.allLabel;
  const categoryNames = useMemo(
    () => eventCategories.map((c) => c.name),
    [eventCategories],
  );
  // null = "Hepsi" (filtresiz). Etiketin store'dan değişebilmesi için
  // active'i string yerine kategori adı veya null tutuyoruz.
  const [active, setActive] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      active === null
        ? events
        : events.filter((e) => e.category === active),
    [events, active],
  );

  return (
    <>
      <PageHeader
        title={headers?.title ?? "Etkinlikler"}
        description={headers?.description ?? ""}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Etkinlikler" },
        ]}
      />
      <Container className="py-10">
        {categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              key="__all__"
              type="button"
              onClick={() => setActive(null)}
              className={
                "h-9 px-4 rounded-full text-sm font-medium border transition-colors " +
                (active === null
                  ? "bg-brand-900 text-white border-brand-900"
                  : "bg-white text-brand-800 border-border hover:border-brand-200")
              }
            >
              {allLabel}
            </button>
            {categoryNames.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={
                  "h-9 px-4 rounded-full text-sm font-medium border transition-colors " +
                  (active === c
                    ? "bg-brand-900 text-white border-brand-900"
                    : "bg-white text-brand-800 border-border hover:border-brand-200")
                }
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </Container>
      <Container className="pb-14 grid md:grid-cols-2 gap-6">
        {filtered.map((event) => {
          const occupancy = Math.min(
            100,
            Math.round((event.registered / event.capacity) * 100),
          );
          return (
            <div
              key={event.id}
              className="rounded-2xl border border-border bg-white overflow-hidden"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={event.cover}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <Badge tone="gold" className="absolute top-3 left-3 bg-white">
                  {event.category}
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-brand-900 leading-tight">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {event.description}
                </p>
                <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-brand-600" />
                    <span>{formatDateTimeTR(event.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {event.registered} / {event.capacity} kayıt
                    </span>
                    <span>%{occupancy} dolu</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gold-400"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button
                    variant="primary"
                    onClick={() =>
                      toast({
                        tone: "success",
                        title:
                          ui.events?.bookSuccessTitle ??
                          DEFAULT_COMMON_UI.events.bookSuccessTitle,
                        description:
                          ui.events?.bookSuccessMessage ??
                          DEFAULT_COMMON_UI.events.bookSuccessMessage,
                      })
                    }
                  >
                    {ui.events?.bookButton ??
                      DEFAULT_COMMON_UI.events.bookButton}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {ui.events?.freeNote ?? DEFAULT_COMMON_UI.events.freeNote}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </Container>
    </>
  );
}
