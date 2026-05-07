"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatEventRangeTR } from "@/lib/utils";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText, PageHeadersMap } from "@/lib/types";

export default function EtkinliklerPage() {
  const {
    events,
    eventCategories,
    pageBlocks,
    currentUser,
    myEventRegistrations,
    registerEvent,
    cancelEventRegistration,
  } = useStore();
  const { toast } = useToast();
  const router = useRouter();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.etkinlikler;
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const eventsUi = ui.events ?? DEFAULT_COMMON_UI.events;
  const allLabel = ui.filters?.allLabel ?? DEFAULT_COMMON_UI.filters.allLabel;
  const categoryNames = useMemo(
    () => eventCategories.map((c) => c.name),
    [eventCategories],
  );
  // null = "Hepsi" (filtresiz). Etiketin store'dan değişebilmesi için
  // active'i string yerine kategori adı veya null tutuyoruz.
  const [active, setActive] = useState<string | null>(null);
  // Aynı butona arka arkaya basışları engellemek + race önlemek için
  // istek hâlinde olan etkinlik id'lerini tutuyoruz.
  const [busyId, setBusyId] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      active === null
        ? events
        : events.filter((e) => e.category === active),
    [events, active],
  );

  const handleRegister = async (eventId: string) => {
    if (!currentUser) {
      toast({
        tone: "info",
        title:
          eventsUi.loginRequiredTitle ??
          DEFAULT_COMMON_UI.events.loginRequiredTitle,
        description:
          eventsUi.loginRequiredMessage ??
          DEFAULT_COMMON_UI.events.loginRequiredMessage,
      });
      router.push(
        `/giris?next=${encodeURIComponent("/etkinlikler")}`,
      );
      return;
    }
    setBusyId(eventId);
    try {
      await registerEvent(eventId);
      toast({
        tone: "success",
        title:
          eventsUi.bookSuccessTitle ??
          DEFAULT_COMMON_UI.events.bookSuccessTitle,
        description:
          eventsUi.bookSuccessMessage ??
          DEFAULT_COMMON_UI.events.bookSuccessMessage,
      });
    } catch (err) {
      const e = err as { code?: string; message?: string };
      const code = e.code;
      const fallback = e.message || "Kayıt yapılamadı";
      const description =
        code === "CAPACITY_FULL"
          ? "Etkinliğin kontenjanı dolu."
          : code === "ALREADY_REGISTERED"
            ? "Bu etkinliğe zaten kayıtlısınız."
            : fallback;
      toast({ tone: "error", title: "Kayıt yapılamadı", description });
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (eventId: string) => {
    setBusyId(eventId);
    try {
      await cancelEventRegistration(eventId);
      toast({
        tone: "info",
        title:
          eventsUi.cancelSuccessTitle ??
          DEFAULT_COMMON_UI.events.cancelSuccessTitle,
        description:
          eventsUi.cancelSuccessMessage ??
          DEFAULT_COMMON_UI.events.cancelSuccessMessage,
      });
    } catch (err) {
      const description =
        err instanceof Error ? err.message : "İşlem başarısız oldu";
      toast({ tone: "error", title: "İptal edilemedi", description });
    } finally {
      setBusyId(null);
    }
  };

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
          const capacity = Math.max(0, event.capacity);
          const occupancy =
            capacity > 0
              ? Math.min(100, Math.round((event.registered / capacity) * 100))
              : 0;
          const isFull = capacity > 0 && event.registered >= capacity;
          const isMine = myEventRegistrations.includes(event.id);
          const isBusy = busyId === event.id;

          let buttonLabel = eventsUi.bookButton ?? DEFAULT_COMMON_UI.events.bookButton;
          let buttonVariant: "primary" | "ghost" | "secondary" = "primary";
          let buttonDisabled = false;
          let onClick: () => void | Promise<void> = () => handleRegister(event.id);

          if (isMine) {
            buttonLabel =
              eventsUi.cancelButton ?? DEFAULT_COMMON_UI.events.cancelButton;
            buttonVariant = "secondary";
            onClick = () => handleCancel(event.id);
          } else if (isFull) {
            buttonLabel =
              eventsUi.fullButton ?? DEFAULT_COMMON_UI.events.fullButton;
            buttonVariant = "ghost";
            buttonDisabled = true;
            onClick = () => {};
          }

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
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                    <span className="break-words">
                      {formatEventRangeTR(event.startsAt, event.endsAt)}
                    </span>
                  </div>
                  {event.location ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Haritada aç"
                      className="flex items-start gap-2 text-muted-foreground hover:text-brand-700 hover:underline min-w-0"
                    >
                      <MapPin className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                      <span className="break-words">{event.location}</span>
                    </a>
                  ) : (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>—</span>
                    </div>
                  )}
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
                    variant={buttonVariant}
                    onClick={onClick}
                    disabled={buttonDisabled || isBusy}
                  >
                    {isBusy ? "İşleniyor..." : buttonLabel}
                  </Button>
                  {eventsUi.freeNote ? (
                    <span className="text-xs text-muted-foreground">
                      {eventsUi.freeNote}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </Container>
    </>
  );
}
