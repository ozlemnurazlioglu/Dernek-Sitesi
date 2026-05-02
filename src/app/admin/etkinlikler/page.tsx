"use client";

import { useMemo, useState } from "react";
import { Calendar, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR, slugify, uid } from "@/lib/utils";
import type { EventItem } from "@/lib/types";

const emptyItem = (): EventItem => ({
  id: `e-${uid()}`,
  slug: "",
  title: "",
  description: "",
  cover:
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80",
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  location: "",
  capacity: 100,
  registered: 0,
  category: "Sosyal",
});

const toLocalDateTime = (iso: string) => {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const localTime = new Date(d.getTime() - offset * 60 * 1000);
  return localTime.toISOString().slice(0, 16);
};

export default function AdminEventsPage() {
  const { events, upsertEvent, removeEvent } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EventItem | null>(null);

  const sorted = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
      ),
    [events],
  );

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast({ tone: "error", title: "Başlık zorunludur" });
      return;
    }
    upsertEvent({
      ...editing,
      slug: editing.slug || slugify(editing.title),
    });
    setEditing(null);
    toast({ tone: "success", title: "Etkinlik kaydedildi" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
            Etkinlikler
          </h1>
          <p className="text-muted-foreground mt-1">
            {events.length} etkinlik kayıtlı.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setEditing(emptyItem())}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Yeni Etkinlik
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sorted.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border border-border bg-white overflow-hidden flex"
          >
            <div className="relative w-32 sm:w-48 shrink-0">
              <img
                src={event.cover}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="brand">{event.category}</Badge>
                <div className="flex items-center gap-1">
                  <button
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-brand-50 text-brand-700"
                    onClick={() => setEditing(event)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 text-red-600"
                    onClick={() => setConfirmDelete(event)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-brand-900 mt-2 leading-tight line-clamp-2">
                {event.title}
              </h3>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateTimeTR(event.startsAt)}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {event.registered} / {event.capacity}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing?.title ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              İptal
            </Button>
            <Button variant="primary" onClick={save}>
              Kaydet
            </Button>
          </div>
        }
      >
        {editing && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Başlık" required>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Kategori">
              <Select
                value={editing.category}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category: e.target.value as EventItem["category"],
                  })
                }
              >
                <option>Eğitim</option>
                <option>Sosyal</option>
                <option>Yardım</option>
                <option>Konferans</option>
              </Select>
            </Field>
            <Field label="Konum">
              <Input
                value={editing.location}
                onChange={(e) =>
                  setEditing({ ...editing, location: e.target.value })
                }
              />
            </Field>
            <Field label="Başlangıç">
              <Input
                type="datetime-local"
                value={toLocalDateTime(editing.startsAt)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    startsAt: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </Field>
            <Field label="Bitiş">
              <Input
                type="datetime-local"
                value={toLocalDateTime(editing.endsAt)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    endsAt: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </Field>
            <Field label="Kontenjan">
              <Input
                type="number"
                min={0}
                value={editing.capacity}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    capacity: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
            <Field label="Mevcut Kayıt">
              <Input
                type="number"
                min={0}
                value={editing.registered}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    registered: Number(e.target.value) || 0,
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Kapak URL">
                <Input
                  value={editing.cover}
                  onChange={(e) =>
                    setEditing({ ...editing, cover: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Açıklama">
                <Textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Etkinliği sil"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDelete) {
                  removeEvent(confirmDelete.id);
                  toast({ tone: "info", title: "Etkinlik silindi" });
                  setConfirmDelete(null);
                }
              }}
            >
              Sil
            </Button>
          </div>
        }
      >
        {confirmDelete && (
          <p className="text-brand-900">
            <span className="font-semibold">{confirmDelete.title}</span>{" "}
            etkinliğini silmek istediğinize emin misiniz?
          </p>
        )}
      </Dialog>
    </div>
  );
}
