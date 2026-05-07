"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ListChecks,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { DateTimeInput } from "@/components/ui/date-time-input";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR, slugify, uid } from "@/lib/utils";
import type { EventItem, EventRegistration } from "@/lib/types";
import { UploadInput } from "@/components/admin/upload-input";

const emptyItem = (defaultCategory: string): EventItem => ({
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
  category: defaultCategory,
});

export default function AdminEventsPage() {
  const { events, eventCategories, upsertEvent, removeEvent } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<EventItem | null>(null);
  const [registrationsFor, setRegistrationsFor] = useState<EventItem | null>(
    null,
  );
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(
    null,
  );
  const defaultCategory = eventCategories[0]?.name ?? "Eğitim";

  useEffect(() => {
    if (!registrationsFor) {
      setRegistrations([]);
      setRegistrationsError(null);
      return;
    }
    let cancelled = false;
    setRegistrationsLoading(true);
    setRegistrationsError(null);
    fetch(
      `/api/admin/events/${encodeURIComponent(registrationsFor.id)}/registrations`,
      { credentials: "same-origin", cache: "no-store" },
    )
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => null);
          throw new Error(
            body?.error || `Kayıtlar alınamadı (HTTP ${r.status})`,
          );
        }
        return (await r.json()) as { items: EventRegistration[] };
      })
      .then((data) => {
        if (cancelled) return;
        setRegistrations(data.items ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setRegistrationsError(
          err instanceof Error ? err.message : "Kayıtlar alınamadı",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setRegistrationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [registrationsFor]);

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
          onClick={() => setEditing(emptyItem(defaultCategory))}
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
            {/*
              `min-w-0` kritik: aksi halde içerideki uzun, boşluksuz konum metni
              flex item'ı şişirir, kart grid hücresinin dışına taşar ve sağdaki
              aksiyon butonları (Düzenle / Sil / Kayıtlılar) ekran dışında kalır.
            */}
            <div className="flex-1 p-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="brand">{event.category}</Badge>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-brand-50 text-brand-700"
                    title="Kayıtlıları gör"
                    onClick={() => setRegistrationsFor(event)}
                  >
                    <ListChecks className="h-4 w-4" />
                  </button>
                  <button
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-brand-50 text-brand-700"
                    title="Düzenle"
                    onClick={() => setEditing(event)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 text-red-600"
                    title="Sil"
                    onClick={() => setConfirmDelete(event)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-brand-900 mt-2 leading-tight line-clamp-2 break-words">
                {event.title}
              </h3>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {formatDateTimeTR(event.startsAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate min-w-0">{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0" />
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
            <Field
              label="Kategori"
              hint={
                eventCategories.length === 0
                  ? "Henüz kategori yok. 'Etkinlik Kategorileri' sayfasından ekleyebilirsiniz."
                  : undefined
              }
            >
              <Select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              >
                {eventCategories.length === 0 ? (
                  <option>{editing.category}</option>
                ) : (
                  eventCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                )}
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
              <DateTimeInput
                valueIso={editing.startsAt}
                onChangeIso={(iso) =>
                  setEditing({ ...editing, startsAt: iso })
                }
              />
            </Field>
            <Field label="Bitiş">
              <DateTimeInput
                valueIso={editing.endsAt}
                onChangeIso={(iso) => setEditing({ ...editing, endsAt: iso })}
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
              <Field label="Kapak Görseli">
                <UploadInput
                  value={editing.cover}
                  onChange={(url) => setEditing({ ...editing, cover: url })}
                  kind="image"
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

      <Dialog
        open={!!registrationsFor}
        onClose={() => setRegistrationsFor(null)}
        size="lg"
        title={
          registrationsFor
            ? `Kayıtlılar — ${registrationsFor.title}`
            : "Kayıtlılar"
        }
      >
        {registrationsFor && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {registrationsFor.registered} / {registrationsFor.capacity}{" "}
                kayıt
              </span>
            </div>

            {registrationsLoading ? (
              <p className="text-sm text-muted-foreground">Yükleniyor...</p>
            ) : registrationsError ? (
              <p className="text-sm text-red-600">{registrationsError}</p>
            ) : registrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bu etkinliğe henüz kayıt olan üye yok.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium text-brand-900">
                        Ad-Soyad
                      </th>
                      <th className="px-3 py-2 font-medium text-brand-900">
                        İletişim
                      </th>
                      <th className="px-3 py-2 font-medium text-brand-900 whitespace-nowrap">
                        Kayıt Tarihi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-3 py-2 align-top text-brand-900">
                          {r.userFullName}
                        </td>
                        <td className="px-3 py-2 align-top text-muted-foreground">
                          <a
                            href={`mailto:${r.userEmail}`}
                            className="inline-flex items-center gap-1.5 hover:text-brand-700 break-all"
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {r.userEmail}
                          </a>
                          {r.userPhone ? (
                            <div className="mt-1">
                              <a
                                href={`tel:${r.userPhone}`}
                                className="inline-flex items-center gap-1.5 hover:text-brand-700"
                              >
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                {r.userPhone}
                              </a>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 align-top text-muted-foreground whitespace-nowrap">
                          {formatDateTimeTR(r.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
