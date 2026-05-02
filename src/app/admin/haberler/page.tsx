"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTR, slugify, uid } from "@/lib/utils";
import type { NewsItem } from "@/lib/types";

const emptyItem = (): NewsItem => ({
  id: `n-${uid()}`,
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  cover:
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&q=80",
  category: "Haber",
  publishedAt: new Date().toISOString(),
  author: "",
});

export default function AdminNewsPage() {
  const { news, upsertNews, removeNews } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<NewsItem | null>(null);

  const sorted = useMemo(
    () =>
      [...news].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      ),
    [news],
  );

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.excerpt.trim()) {
      toast({
        tone: "error",
        title: "Eksik alan",
        description: "Başlık ve özet zorunludur.",
      });
      return;
    }
    const final: NewsItem = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      author: editing.author || "Editör",
      publishedAt: editing.publishedAt || new Date().toISOString(),
    };
    upsertNews(final);
    setEditing(null);
    toast({ tone: "success", title: "Haber kaydedildi" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
            Haberler
          </h1>
          <p className="text-muted-foreground mt-1">
            {news.length} haber/duyuru bulunuyor.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setEditing(emptyItem())}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Yeni Haber
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-border bg-white overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[16/9]">
              <img
                src={item.cover}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <Badge
                tone="brand"
                className="absolute top-3 left-3 bg-white"
              >
                {item.category}
              </Badge>
            </div>
            <div className="p-4 flex-1">
              <div className="text-xs text-muted-foreground">
                {formatDateTR(item.publishedAt)} · {item.author}
              </div>
              <h3 className="text-base font-semibold text-brand-900 mt-1 leading-tight line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {item.excerpt}
              </p>
            </div>
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-mono truncate">
                /{item.slug}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-brand-50 text-brand-700"
                  onClick={() => setEditing(item)}
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-red-50 text-red-600"
                  onClick={() => setConfirmDelete(item)}
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing?.title ? "Haberi Düzenle" : "Yeni Haber"}
        description="Haber detaylarını doldurun. Slug otomatik oluşturulur."
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
            <Field label="Slug" hint="Boş bırakılırsa otomatik oluşturulur">
              <Input
                value={editing.slug}
                onChange={(e) =>
                  setEditing({ ...editing, slug: e.target.value })
                }
                placeholder={slugify(editing.title)}
              />
            </Field>
            <Field label="Kategori">
              <Select
                value={editing.category}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category: e.target.value as NewsItem["category"],
                  })
                }
              >
                <option>Haber</option>
                <option>Duyuru</option>
                <option>Basın</option>
                <option>Proje</option>
              </Select>
            </Field>
            <Field label="Yazar">
              <Input
                value={editing.author}
                onChange={(e) =>
                  setEditing({ ...editing, author: e.target.value })
                }
              />
            </Field>
            <Field label="Yayın Tarihi">
              <Input
                type="date"
                value={editing.publishedAt.slice(0, 10)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    publishedAt: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Kapak Görseli URL">
                <Input
                  value={editing.cover}
                  onChange={(e) =>
                    setEditing({ ...editing, cover: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Özet" required>
                <Textarea
                  value={editing.excerpt}
                  onChange={(e) =>
                    setEditing({ ...editing, excerpt: e.target.value })
                  }
                  rows={2}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="İçerik">
                <Textarea
                  value={editing.body}
                  onChange={(e) =>
                    setEditing({ ...editing, body: e.target.value })
                  }
                  rows={6}
                />
              </Field>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Haberi sil"
        description="Bu işlem geri alınamaz."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDelete) {
                  removeNews(confirmDelete.id);
                  toast({ tone: "info", title: "Haber silindi" });
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
            <span className="font-semibold">{confirmDelete.title}</span> başlıklı
            haberi silmek istediğinize emin misiniz?
          </p>
        )}
      </Dialog>
    </div>
  );
}
