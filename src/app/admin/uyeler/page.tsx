"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Key,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTR, initials } from "@/lib/utils";

export default function AdminMembersPage() {
  const { users, applications, bootstrap, currentUser } = useStore();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "member">("all");
  /** Şifresi sıfırlanmak üzere seçilmiş kullanıcı (modal kontrolü). */
  const [resetTarget, setResetTarget] = useState<{
    id: string;
    fullName: string;
    email: string;
  } | null>(null);
  /**
   * Toplu silme için seçili üye id'lerinin set'i. Set kullanmamızın sebebi
   * O(1) ekleme/çıkarma + büyük listelerde hızlı kontrol. Filtreleme veya
   * arama değiştiğinde seçim KORUNUR — kullanıcı sayfa sayfa gezerken
   * topladığı seçimi kaybetmesin.
   */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  /** Sil işleminin onay modal'ı. Tek üye veya toplu için aynı modal. */
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "single"; user: { id: string; fullName: string; email: string } }
    | { kind: "bulk"; ids: string[] }
    | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return users
      .filter((u) => (filter === "all" ? true : u.role === filter))
      .filter((u) =>
        query
          ? `${u.fullName} ${u.email}`
              .toLocaleLowerCase("tr-TR")
              .includes(query.toLocaleLowerCase("tr-TR"))
          : true,
      )
      .sort(
        (a, b) =>
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
      );
  }, [users, query, filter]);

  // Görünür listeden hangileri seçili? "Tümünü Seç" checkbox'ının durumunu
  // ve toplu silme bar'ının görünüp görünmeyeceğini belirler.
  const filteredIds = useMemo(
    () => filtered.map((u) => u.id),
    [filtered],
  );
  const allVisibleSelected =
    filtered.length > 0 && filteredIds.every((id) => selected.has(id));
  const selectedCount = selected.size;

  // Kendini silmek paneli kilitler — yöneticiye yumuşak bir uyarı vermek
  // yerine checkbox'ı + sil butonunu hiç gösterip kapatıyoruz.
  const canDelete = (userId: string) =>
    currentUser ? userId !== currentUser.id : true;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        // Görünür hepsi seçili → sadece görünür olanları çıkar
        // (filtre dışındakileri seçili bırak).
        for (const id of filteredIds) next.delete(id);
      } else {
        // Bazıları seçili / hiçbiri değil → görünür+silinebilir olanları ekle.
        for (const id of filteredIds) {
          if (canDelete(id)) next.add(id);
        }
      }
      return next;
    });
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "single") {
        const u = deleteTarget.user;
        const res = await fetch(
          `/api/admin/users/${encodeURIComponent(u.id)}`,
          { method: "DELETE", credentials: "same-origin" },
        );
        if (!res.ok) {
          const body = (await res
            .json()
            .catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "Silme işlemi başarısız.");
        }
        toast({
          tone: "success",
          title: "Üye silindi",
          description: `${u.fullName} ve ilişkili tüm kayıtları kaldırıldı.`,
        });
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(u.id);
          return next;
        });
      } else {
        const res = await fetch("/api/admin/users/bulk-delete", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteTarget.ids }),
        });
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          deleted?: number;
        };
        if (!res.ok) {
          throw new Error(body.error ?? "Silme işlemi başarısız.");
        }
        toast({
          tone: "success",
          title: "Üyeler silindi",
          description: `${body.deleted ?? 0} üye ve ilişkili kayıtlar kaldırıldı.`,
        });
        setSelected(new Set());
      }
      // Listeyi sunucudan tazele — yerel state DB ile senkron olsun.
      await bootstrap();
      setDeleteTarget(null);
    } catch (err) {
      toast({
        tone: "error",
        title: "Hata",
        description:
          err instanceof Error ? err.message : "Beklenmedik bir hata oluştu.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-brand-900">
          Üyeler
        </h1>
        <p className="text-muted-foreground mt-1">
          Toplam {users.length} kayıtlı kullanıcı.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white">
        <div className="px-4 sm:px-6 py-3 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: `Tümü (${users.length})` },
              {
                key: "member",
                label: `Üyeler (${users.filter((u) => u.role === "member").length})`,
              },
              {
                key: "admin",
                label: `Yöneticiler (${users.filter((u) => u.role === "admin").length})`,
              },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key as typeof filter)}
                className={
                  "h-9 px-3.5 rounded-full text-xs font-medium border transition-colors " +
                  (filter === opt.key
                    ? "bg-brand-900 text-white border-brand-900"
                    : "bg-white text-brand-800 border-border hover:border-brand-200")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ad, e-posta ile ara"
              className="pl-9"
            />
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="px-4 sm:px-6 py-2.5 border-b border-border bg-red-50/40 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-brand-900">
              <strong>{selectedCount}</strong> üye seçildi
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
                disabled={deleting}
              >
                Seçimi temizle
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={deleting}
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() =>
                  setDeleteTarget({
                    kind: "bulk",
                    ids: Array.from(selected),
                  })
                }
                className="bg-red-600 hover:bg-red-700 border-red-600"
              >
                Seçilenleri Sil ({selectedCount})
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Görünen tüm üyeleri seç"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    className="h-4 w-4 rounded border-border accent-brand-700 cursor-pointer"
                    disabled={filtered.length === 0 || deleting}
                  />
                </th>
                <th className="text-left font-medium px-6 py-3">Üye</th>
                <th className="text-left font-medium px-4 py-3">İletişim</th>
                <th className="text-left font-medium px-4 py-3">Şehir</th>
                <th className="text-left font-medium px-4 py-3">Rol</th>
                <th className="text-left font-medium px-4 py-3">Başvuru</th>
                <th className="text-left font-medium px-6 py-3">Üyelik</th>
                <th className="text-right font-medium px-6 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => {
                const apps = applications.filter(
                  (a) => a.applicantId === u.id || a.email === u.email,
                ).length;
                const isSelf = !canDelete(u.id);
                const isChecked = selected.has(u.id);
                return (
                  <tr
                    key={u.id}
                    className={
                      "hover:bg-muted/30 " +
                      (isChecked ? "bg-red-50/40" : "")
                    }
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        aria-label={`${u.fullName} üyesini seç`}
                        checked={isChecked}
                        onChange={() => toggleOne(u.id)}
                        disabled={isSelf || deleting}
                        title={
                          isSelf ? "Kendi hesabınızı silemezsiniz" : undefined
                        }
                        className="h-4 w-4 rounded border-border accent-brand-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-800 text-white text-sm font-semibold flex items-center justify-center">
                          {initials(u.fullName)}
                        </div>
                        <div>
                          <div className="font-medium text-brand-900">
                            {u.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {u.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-brand-900 inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {u.email}
                      </div>
                      {u.phone && (
                        <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {u.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.city && (
                        <span className="inline-flex items-center gap-1.5 text-brand-900">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {u.city}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={u.role === "admin" ? "gold" : "brand"}>
                        {u.role === "admin" ? "Yönetici" : "Üye"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {apps > 0 ? (
                        <Badge tone="success">{apps} başvuru</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground whitespace-nowrap">
                      {formatDateTR(u.joinedAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setResetTarget({
                              id: u.id,
                              fullName: u.fullName,
                              email: u.email,
                            })
                          }
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border border-border text-brand-800 hover:bg-brand-50 hover:border-brand-200 transition-colors"
                          title="Bu üyenin şifresini sıfırla"
                        >
                          <Key className="h-3.5 w-3.5" />
                          Şifre Sıfırla
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              kind: "single",
                              user: {
                                id: u.id,
                                fullName: u.fullName,
                                email: u.email,
                              },
                            })
                          }
                          disabled={isSelf || deleting}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-red-200"
                          title={
                            isSelf
                              ? "Kendi hesabınızı silemezsiniz"
                              : "Bu üyeyi sil"
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ResetPasswordModal
        target={resetTarget}
        onClose={() => setResetTarget(null)}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        title={
          deleteTarget?.kind === "bulk"
            ? `${deleteTarget.ids.length} üyeyi sil`
            : "Üyeyi sil"
        }
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="rounded-md bg-red-50/60 border border-red-200 px-3 py-2.5 text-sm text-red-900">
              <strong>Bu işlem geri alınamaz.</strong> Seçilen üye(ler) ile
              birlikte bu üye(ler)e ait <em>burs başvuruları</em> ve{" "}
              <em>etkinlik kayıtları</em> da DB'den kalıcı olarak silinir.
            </div>

            {deleteTarget.kind === "single" ? (
              <div className="rounded-md bg-muted/60 border border-border p-3">
                <div className="text-xs text-muted-foreground">
                  Silinecek üye
                </div>
                <div className="font-medium text-brand-900 mt-0.5">
                  {deleteTarget.user.fullName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {deleteTarget.user.email}
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-muted/60 border border-border p-3 text-sm">
                <div className="text-xs text-muted-foreground mb-1">
                  Silinecek üye sayısı
                </div>
                <div className="font-semibold text-brand-900 text-lg">
                  {deleteTarget.ids.length}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={executeDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 border-red-600"
                leftIcon={
                  deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )
                }
              >
                {deleting
                  ? "Siliniyor…"
                  : deleteTarget.kind === "bulk"
                    ? `Evet, ${deleteTarget.ids.length} üyeyi sil`
                    : "Evet, sil"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                          Şifre Sıfırla Modali                       */
/* ------------------------------------------------------------------ */

function ResetPasswordModal({
  target,
  onClose,
}: {
  target: { id: string; fullName: string; email: string } | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const open = !!target;

  // Modal her açılış/kapanışta state sıfırlansın — eski şifre kalmasın.
  useEffect(() => {
    setPassword("");
    setConfirm("");
    setShow(false);
    setSubmitting(false);
  }, [open]);

  if (!target) return null;

  function generateRandom() {
    // Aile dostu, kolay yazılan + yeterince güvenli rastgele şifre.
    // 10 karakter: harf+rakam, ambiguous karakterler (0/O, 1/l/I) hariç.
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let out = "";
    const arr = new Uint32Array(10);
    crypto.getRandomValues(arr);
    for (const n of arr) out += chars[n % chars.length];
    setPassword(out);
    setConfirm(out);
    setShow(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        tone: "error",
        title: "Şifre çok kısa",
        description: "En az 6 karakter olmalı.",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        tone: "error",
        title: "Şifreler eşleşmiyor",
        description: "İki alanın da aynı olduğundan emin olun.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(target!.id)}/password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ password }),
        },
      );
      if (!res.ok) {
        let msg = "Şifre güncellenemedi";
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) msg = body.error;
        } catch {
          // sessizce yut — generic mesaj kullan
        }
        toast({ tone: "error", title: "Hata", description: msg });
        return;
      }
      toast({
        tone: "success",
        title: "Şifre güncellendi",
        description: `${target!.fullName} kullanıcısının yeni şifresi kaydedildi. Aktif oturumları kapatıldı.`,
      });
      onClose();
    } catch (err) {
      console.error("[admin/uyeler] şifre sıfırlama hatası", err);
      toast({
        tone: "error",
        title: "Bağlantı hatası",
        description: "Lütfen tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => (submitting ? null : onClose())}
      title="Üye şifresini sıfırla"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-md bg-muted/60 border border-border p-3">
          <div className="text-xs text-muted-foreground">Hedef üye</div>
          <div className="font-medium text-brand-900 mt-0.5">
            {target.fullName}
          </div>
          <div className="text-xs text-muted-foreground">{target.email}</div>
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-brand-900 mb-1"
          >
            Yeni şifre
          </label>
          <div className="relative">
            <Input
              id="new-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="En az 6 karakter"
              minLength={6}
              disabled={submitting}
              required
              className="pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label={show ? "Gizle" : "Göster"}
              tabIndex={-1}
            >
              {show ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-brand-900 mb-1"
          >
            Yeni şifre (tekrar)
          </label>
          <Input
            id="confirm-password"
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Aynı şifreyi tekrar girin"
            minLength={6}
            disabled={submitting}
            required
            className="font-mono"
          />
          {confirm && password && confirm !== password && (
            <p className="text-xs text-red-600 mt-1">
              Şifreler eşleşmiyor.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={generateRandom}
          disabled={submitting}
          className="text-xs text-brand-700 hover:text-brand-900 hover:underline"
        >
          Rastgele güçlü şifre üret
        </button>

        <div className="rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900">
          <strong>Not:</strong> Yeni şifreyi üyeye güvenli bir kanaldan iletin
          (telefon/SMS, yüz yüze). Sıfırlama sonrası üyenin tüm aktif
          oturumları kapatılır — yeni şifre ile yeniden giriş yapması gerekir.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Vazgeç
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || password.length < 6 || password !== confirm}
            leftIcon={
              submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )
            }
          >
            {submitting ? "Kaydediliyor…" : "Şifreyi sıfırla"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
