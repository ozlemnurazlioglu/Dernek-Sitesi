"use client";

import { useMemo, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminMessagesPage() {
  const { messages, toggleMessageRead, removeMessage } = useStore();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(messages[0]?.id ?? null);

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [messages],
  );

  const active = sorted.find((m) => m.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
          Mesajlar
        </h1>
        <p className="text-muted-foreground mt-1">
          {messages.filter((m) => !m.read).length} okunmamış mesajınız var.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white grid lg:grid-cols-12 overflow-hidden">
        <ul className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-border max-h-[640px] overflow-y-auto scrollbar-thin">
          {sorted.length === 0 ? (
            <li className="p-10 text-center text-muted-foreground">
              Henüz mesaj yok.
            </li>
          ) : (
            sorted.map((m) => (
              <li
                key={m.id}
                onClick={() => {
                  setSelected(m.id);
                  if (!m.read) toggleMessageRead(m.id, true);
                }}
                className={cn(
                  "px-5 py-4 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-muted/40",
                  selected === m.id && "bg-brand-50/60",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!m.read && (
                        <span className="h-2 w-2 rounded-full bg-brand-600 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-brand-900 truncate">
                        {m.name}
                      </span>
                    </div>
                    <p className="text-sm text-brand-800 mt-0.5 truncate">
                      {m.subject}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {m.message}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTimeTR(m.createdAt)}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="lg:col-span-7 p-6">
          {active ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-brand-900">
                    {active.subject}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {active.name} · {active.email} ·{" "}
                    {formatDateTimeTR(active.createdAt)}
                  </p>
                </div>
                <Badge tone={active.read ? "neutral" : "info"}>
                  {active.read ? "Okundu" : "Yeni"}
                </Badge>
              </div>
              <div className="mt-6 rounded-lg bg-muted/30 border border-border p-5 leading-relaxed text-brand-900 whitespace-pre-line">
                {active.message}
              </div>

              <div className="mt-6 flex items-center justify-between gap-2 pt-5 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleMessageRead(active.id, !active.read)}
                    leftIcon={
                      active.read ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <MailOpen className="h-4 w-4" />
                      )
                    }
                  >
                    {active.read ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                  </Button>
                  <a
                    href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(active.subject)}`}
                    className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md bg-brand-800 text-white text-sm font-medium hover:bg-brand-700"
                  >
                    Yanıtla
                  </a>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => {
                    removeMessage(active.id);
                    setSelected(null);
                    toast({ tone: "info", title: "Mesaj silindi" });
                  }}
                >
                  Sil
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center text-muted-foreground">
              Soldan bir mesaj seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
