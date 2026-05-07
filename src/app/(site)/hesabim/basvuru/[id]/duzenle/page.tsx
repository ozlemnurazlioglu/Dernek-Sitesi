"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { ApplicationForm } from "@/components/burs/application-form";
import { ButtonLink } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { ApplicationStatus } from "@/lib/types";

const OWNER_EDITABLE: readonly ApplicationStatus[] = ["submitted", "in_review"];

export default function BasvuruDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { ready, currentUser, applications } = useStore();
  const [redirecting, setRedirecting] = useState(false);

  const application = useMemo(
    () => applications.find((a) => a.id === id),
    [applications, id],
  );

  // Auth: login yoksa giris sayfasina yonlendir.
  useEffect(() => {
    if (!ready) return;
    if (!currentUser) {
      router.replace(
        `/giris?redirect=${encodeURIComponent(`/hesabim/basvuru/${id}/duzenle`)}`,
      );
      return;
    }
  }, [ready, currentUser, router, id]);

  // Erişim ve düzenlenebilirlik kontrolleri (kullanıcı login olduktan sonra).
  useEffect(() => {
    if (!ready || !currentUser) return;
    if (!application) {
      // Cache'te yoksa /hesabim'a yolla; sayfa yenilemesi sonrası store
      // doluysa burada bulunur. Yine yoksa kullanıcı yetkisiz olabilir.
      setRedirecting(true);
      toast({
        tone: "error",
        title: "Başvuru bulunamadı",
        description: "Bu başvuru kayıtlarımızda görünmüyor.",
      });
      router.replace("/hesabim");
      return;
    }
    const isOwner =
      application.applicantId === currentUser.id ||
      application.email === currentUser.email;
    const isAdmin = currentUser.role === "admin";
    if (!isOwner && !isAdmin) {
      setRedirecting(true);
      toast({
        tone: "error",
        title: "Yetkisiz erişim",
        description: "Bu başvuruyu yalnızca sahibi düzenleyebilir.",
      });
      router.replace("/hesabim");
      return;
    }
    if (
      isOwner &&
      !isAdmin &&
      !(OWNER_EDITABLE as readonly string[]).includes(application.status)
    ) {
      // Owner için kilitli durumda — sayfayı render etmeyip uyarı gösterelim.
      // Ekrandaki kilit panelini aşağıda zaten gösteriyoruz; redirect etmiyoruz.
    }
  }, [ready, currentUser, application, router, toast]);

  if (!ready) {
    return (
      <Container className="py-12">
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted-foreground">
          Yükleniyor…
        </div>
      </Container>
    );
  }

  if (!currentUser || redirecting) return null;

  if (!application) {
    return (
      <Container className="py-12">
        <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted-foreground">
          Başvuru yükleniyor…
        </div>
      </Container>
    );
  }

  const isOwner =
    application.applicantId === currentUser.id ||
    application.email === currentUser.email;
  const isAdmin = currentUser.role === "admin";
  const ownerLocked =
    isOwner &&
    !isAdmin &&
    !(OWNER_EDITABLE as readonly string[]).includes(application.status);

  return (
    <>
      <PageHeader
        title="Başvuruyu Düzenle"
        description={`#${application.id} numaralı başvurunuzun bilgilerini güncelleyebilirsiniz.`}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Hesabım", href: "/hesabim" },
          { label: `#${application.id}` },
        ]}
      />
      <Container className="py-12">
        {ownerLocked ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-amber-50/50 p-8 md:p-10 text-center">
            <div className="h-14 w-14 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-semibold text-brand-900 mt-5">
              {application.status === "approved"
                ? "Başvurunuz onaylandı"
                : "Başvurunuz değerlendirme sürecini tamamladı"}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {application.status === "approved"
                ? "Onaylanan başvurularda değişiklik yapılamaz. Bilgilerinizi güncellemek için lütfen bizimle iletişime geçin."
                : application.status === "rejected"
                  ? "Reddedilen başvurularda değişiklik yapılamaz. İsterseniz yeni bir başvuru oluşturabilirsiniz."
                  : "Bu başvuru şu anda düzenlemeye kapalı."}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <ButtonLink href="/hesabim" variant="primary">
                Hesabıma Dön
              </ButtonLink>
              {application.status === "rejected" && (
                <ButtonLink href="/burs/basvuru" variant="outline">
                  Yeni Başvuru
                </ButtonLink>
              )}
            </div>
          </div>
        ) : (
          <ApplicationForm
            mode="edit"
            applicationId={application.id}
            initial={application}
          />
        )}
      </Container>
    </>
  );
}
