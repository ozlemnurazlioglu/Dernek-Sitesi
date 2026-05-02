"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatDateTimeTR, initials } from "@/lib/utils";
import { StatusBadge } from "@/components/status";

export default function HesabimPage() {
  const router = useRouter();
  const { ready, currentUser, applications, logout } = useStore();

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
        title={`Merhaba, ${currentUser.fullName.split(" ")[0]}`}
        description="Üyelik bilgilerinizi görüntüleyin, burs başvurularınızın durumunu takip edin."
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
                  {currentUser.role === "admin" ? "Yönetici" : "Üye"}
                </Badge>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{currentUser.email}</span>
              </li>
              {currentUser.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{currentUser.phone}</span>
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
                  Üyelik: {new Date(currentUser.joinedAt).getFullYear()}
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
                  Yönetim Paneli
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
                Çıkış Yap
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
                  Burs Başvurularım
                </h3>
              </div>
              <ButtonLink href="/burs/basvuru" variant="primary" size="sm">
                Yeni Başvuru
              </ButtonLink>
            </div>

            {myApplications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-700 mx-auto flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <p className="text-brand-900 font-medium mt-4">
                  Henüz başvurunuz bulunmuyor
                </p>
                <p className="text-muted-foreground text-sm mt-1.5 max-w-sm mx-auto">
                  Online başvuru formunu doldurarak burs başvurusu yapabilirsiniz.
                </p>
                <ButtonLink href="/burs/basvuru" variant="gold" className="mt-5">
                  Başvuruyu Başlat
                </ButtonLink>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {myApplications.map((app) => (
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
                        <span className="font-medium">Komisyon notu:</span>{" "}
                        {app.reviewerNote}
                      </div>
                    )}
                  </div>
                ))}
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
                  Profil bilgilerinizi güncel tutun
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Burs ödemeleri, etkinlik kayıtları ve duyuruların size ulaşması
                  için iletişim bilgilerinizi güncel tutmayı unutmayın.
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  (Demo: profil düzenleme bu sürümde dosya tabanlıdır.)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
