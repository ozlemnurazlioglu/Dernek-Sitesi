"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { ApplicationForm } from "@/components/burs/application-form";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { PageHeadersMap } from "@/lib/types";

export default function BursBasvuruPage() {
  const { pageBlocks, currentUser, ready } = useStore();
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.burs_basvuru;

  return (
    <>
      <PageHeader
        title={headers?.title ?? "Burs Başvurusu"}
        description={headers?.description ?? ""}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Burs", href: "/burs" },
          { label: "Başvuru" },
        ]}
      />
      <Container className="py-12">
        {!ready ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center text-muted-foreground">
            Yükleniyor…
          </div>
        ) : currentUser ? (
          <ApplicationForm />
        ) : (
          <LoginRequired />
        )}
      </Container>
    </>
  );
}

function LoginRequired() {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-amber-200 bg-amber-50/50 p-8 md:p-10 text-center">
      <div className="h-14 w-14 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center">
        <LogIn className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-semibold text-brand-900 mt-5">
        Önce üye girişi yapın
      </h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto">
        Burs başvurusu yapabilmek ve belgelerinizi güvenli şekilde
        yükleyebilmek için lütfen üye hesabınızla giriş yapın. Hesabınız yoksa
        ücretsiz kayıt olabilirsiniz.
      </p>
      <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/giris?redirect=/burs/basvuru">
          <Button variant="primary" leftIcon={<LogIn className="h-4 w-4" />}>
            Giriş Yap
          </Button>
        </Link>
        <Link href="/kayit?redirect=/burs/basvuru">
          <Button
            variant="outline"
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Yeni Hesap Oluştur
          </Button>
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Başvurunuz hesabınıza bağlı saklanır; ilerlemesini "Hesabım"
        sayfasından takip edebilirsiniz.
      </p>
    </div>
  );
}
