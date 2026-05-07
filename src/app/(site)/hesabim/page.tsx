"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { formatDateTimeTR, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/status";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText, PageHeadersMap } from "@/lib/types";

export default function HesabimPage() {
  const router = useRouter();
  const { ready, currentUser, applications, logout, pageBlocks } = useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.hesabim;
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const accountUi = { ...DEFAULT_COMMON_UI.account, ...(ui.account ?? {}) };

  useEffect(() => {
    if (ready && !currentUser) {
      router.replace("/giris?redirect=/hesabim");
    }
  }, [ready, currentUser, router]);

  if (!currentUser) return null;

  const myApplications = applications.filter(
    (a) => a.applicantId === currentUser.id || a.email === currentUser.email,
  );

  return (
    <>
      <PageHeader
        title={
          headers?.title
            ? headers.title.replace(
                "{firstName}",
                currentUser.fullName.split(" ")[0],
              )
            : `Merhaba, ${currentUser.fullName.split(" ")[0]}`
        }
        description={headers?.description ?? ""}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Hesabım" },
        ]}
      />
      <Container className="py-12 grid md:grid-cols-12 gap-8">
        <aside className="md:col-span-4">
          <div className="rounded-2xl border border-border bg-white p-6 sticky top-24">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-brand-800 text-white text-lg font-semibold flex items-center justify-center">
                {initials(currentUser.fullName)}
              </div>
              <div className="min-w-0">
                <div className="text-base font-semibold text-brand-900 truncate">
                  {currentUser.fullName}
                </div>
                <Badge tone={currentUser.role === "admin" ? "gold" : "brand"}>
                  {currentUser.role === "admin"
                    ? accountUi.roleAdminLabel
                    : accountUi.roleMemberLabel}
                </Badge>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${currentUser.email}`}
                  className="truncate hover:text-brand-700 underline-offset-2 hover:underline"
                  title="E-posta gönder"
                >
                  {currentUser.email}
                </a>
              </li>
              {currentUser.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${currentUser.phone.replace(/\s+/g, "")}`}
                    className="hover:text-brand-700 underline-offset-2 hover:underline"
                    title="Ara"
                  >
                    {currentUser.phone}
                  </a>
                </li>
              )}
              {currentUser.city && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{currentUser.city}</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {accountUi.membershipLabel}{" "}
                  {new Date(currentUser.joinedAt).getFullYear()}
                </span>
              </li>
            </ul>
            <div className="mt-6 pt-5 border-t border-border space-y-2">
              {currentUser.role === "admin" && (
                <ButtonLink
                  href="/admin"
                  variant="outline"
                  className="w-full justify-center"
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                >
                  {accountUi.adminPanelButton}
                </ButtonLink>
              )}
              <Button
                variant="ghost"
                className="w-full justify-center"
                leftIcon={<LogOut className="h-4 w-4" />}
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                {accountUi.logoutButton}
              </Button>
            </div>
          </div>
        </aside>

        <div className="md:col-span-8 space-y-6">
          <div className="rounded-2xl border border-border bg-white">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-700" />
                <h3 className="font-semibold text-brand-900">
                  {accountUi.applicationsTitle}
                </h3>
              </div>
              <ButtonLink href="/burs/basvuru" variant="primary" size="sm">
                {accountUi.newApplicationButton}
              </ButtonLink>
            </div>

            {myApplications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-700 mx-auto flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-brand-900 font-medium mt-4">
                  {accountUi.emptyTitle}
                </p>
                <p className="text-muted-foreground text-sm mt-1.5 max-w-sm mx-auto">
                  {accountUi.emptyDescription}
                </p>
                <ButtonLink href="/burs/basvuru" variant="gold" className="mt-5">
                  {accountUi.startApplicationButton}
                </ButtonLink>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {myApplications.map((app) => {
                  const editable =
                    app.status === "submitted" || app.status === "in_review";
                  return (
                    <div key={app.id} className="px-6 py-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              #{app.id}
                            </span>
                            <StatusBadge status={app.status} />
                          </div>
                          <h4 className="text-base font-semibold text-brand-900 mt-1">
                            {app.schoolName} – {app.department}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {app.schoolType.replace("_", " ")} · {app.grade}.
                            sınıf · GANO {app.gpa}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTimeTR(app.submittedAt)}
                          </div>
                          {app.score && (
                            <div className="mt-2 text-sm">
                              Puan:{" "}
                              <span className="font-semibold text-brand-900">
                                {app.score}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {app.reviewerNote && (
                        <div className="mt-3 rounded-md bg-muted/60 border border-border px-3 py-2 text-sm text-brand-900">
                          <span className="font-medium">
                            {accountUi.reviewerNoteLabel}
                          </span>{" "}
                          {app.reviewerNote}
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-end">
                        {editable ? (
                          <ButtonLink
                            href={`/hesabim/basvuru/${app.id}/duzenle`}
                            variant="outline"
                            size="sm"
                            leftIcon={<Pencil className="h-4 w-4" />}
                          >
                            Düzenle
                          </ButtonLink>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                            title={
                              app.status === "approved"
                                ? "Onaylanmış başvurular düzenlenemez"
                                : app.status === "rejected"
                                  ? "Reddedilmiş başvurular düzenlenemez"
                                  : "Bu başvuru düzenlenemez"
                            }
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Düzenleme kapalı
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-brand-50/40 p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-md bg-white border border-border text-brand-700 flex items-center justify-center shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-brand-900">
                  {accountUi.profileTipTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {accountUi.profileTipDescription}
                </p>
                {accountUi.profileTipNote && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {accountUi.profileTipNote}
                  </p>
                )}
              </div>
            </div>
          </div>

          <ChangePasswordCard />
        </div>
      </Container>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*                       Şifre Değiştir Kartı                          */
/* ------------------------------------------------------------------ */

/**
 * Hesabım sayfasında, kullanıcının kendi şifresini değiştirebileceği
 * inline kart. Mevcut şifre + yeni şifre (× 2) ister; başarı sonrası
 * formu sıfırlar. Mevcut tarayıcı oturumu korunur — kullanıcı sayfada
 * kalır. Diğer cihazlardaki oturumlar API tarafında sonlandırılır.
 */
function ChangePasswordCard() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
    setShowCurrent(false);
    setShowNext(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!current) {
      toast({
        tone: "error",
        title: "Mevcut şifre boş",
        description: "Devam etmek için mevcut şifrenizi girin.",
      });
      return;
    }
    if (next.length < 6) {
      toast({
        tone: "error",
        title: "Yeni şifre çok kısa",
        description: "En az 6 karakter olmalı.",
      });
      return;
    }
    if (next !== confirm) {
      toast({
        tone: "error",
        title: "Şifreler eşleşmiyor",
        description: "Yeni şifre ile tekrarı aynı olmalı.",
      });
      return;
    }
    if (next === current) {
      toast({
        tone: "error",
        title: "Aynı şifre",
        description: "Yeni şifre mevcut şifre ile aynı olamaz.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!res.ok) {
        let msg = "Şifre güncellenemedi";
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) msg = body.error;
        } catch {
          // generic mesaj kullanılır
        }
        toast({ tone: "error", title: "Hata", description: msg });
        return;
      }
      toast({
        tone: "success",
        title: "Şifreniz güncellendi",
        description: "Diğer cihazlardaki oturumlarınız kapatıldı.",
      });
      reset();
      setOpen(false);
    } catch (err) {
      console.error("[hesabim] şifre değiştirme hatası", err);
      toast({
        tone: "error",
        title: "Bağlantı hatası",
        description: "Lütfen tekrar deneyin.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-md bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-brand-900">
              Şifre Değiştir
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hesabınızın güvenliği için şifrenizi düzenli aralıklarla
              güncelleyin. Şifreyi değiştirdiğinizde diğer cihazlardaki
              oturumlarınız otomatik olarak kapatılır.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            leftIcon={<KeyRound className="h-4 w-4" />}
          >
            Şifreyi Değiştir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 rounded-md bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center shrink-0">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-brand-900">
            Şifreyi Değiştir
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mevcut şifrenizi girip yeni bir tane belirleyin.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="cur-pass"
            className="block text-sm font-medium text-brand-900 mb-1"
          >
            Mevcut şifre
          </label>
          <div className="relative">
            <Input
              id="cur-pass"
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label={showCurrent ? "Gizle" : "Göster"}
            >
              {showCurrent ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="new-pass"
              className="block text-sm font-medium text-brand-900 mb-1"
            >
              Yeni şifre
            </label>
            <div className="relative">
              <Input
                id="new-pass"
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                placeholder="En az 6 karakter"
                minLength={6}
                required
                disabled={submitting}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNext((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label={showNext ? "Gizle" : "Göster"}
              >
                {showNext ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="confirm-pass"
              className="block text-sm font-medium text-brand-900 mb-1"
            >
              Yeni şifre (tekrar)
            </label>
            <Input
              id="confirm-pass"
              type={showNext ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="Aynı şifreyi tekrar girin"
              minLength={6}
              required
              disabled={submitting}
            />
            {confirm && next && confirm !== next && (
              <p className="text-xs text-red-600 mt-1">
                Şifreler eşleşmiyor.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            disabled={submitting}
          >
            Vazgeç
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              submitting ||
              !current ||
              next.length < 6 ||
              next !== confirm ||
              next === current
            }
            leftIcon={
              submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )
            }
          >
            {submitting ? "Kaydediliyor…" : "Şifreyi Güncelle"}
          </Button>
        </div>
      </form>
    </div>
  );
}
