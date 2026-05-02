"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR } from "@/lib/utils";

export default function EtkinliklerPage() {
  const { events } = useStore();
  const { toast } = useToast();

  return (
    <>
      <PageHeader
        title="Etkinlikler"
        description="Eğitimden sosyal sorumluluğa, dayanışmadan kariyer mentörlüğüne kadar yaklaşan tüm etkinliklerimiz."
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Etkinlikler" },
        ]}
      />
      <Container className="py-14 grid md:grid-cols-2 gap-6">
        {events.map((event) => {
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
                        title: "Kaydınız alındı",
                        description:
                          "Bu bir demo sürümdür. Gerçek kayıt için yetkililerimize ulaşabilirsiniz.",
                      })
                    }
                  >
                    Hemen Kayıt Ol
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Ücretsiz · Üyelere ücretsiz
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
