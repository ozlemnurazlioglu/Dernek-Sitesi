"use client";

/**
 * `(site)` route group'una özel 404 sayfası.
 *
 * Neden ayrı? Root `src/app/not-found.tsx` kendi `<SiteHeader />` ve
 * `<SiteFooter />`'ını render ediyor; ancak `(site)` group'tan düşen
 * 404'lerde `(site)/layout.tsx` zaten bu bileşenleri eklediği için
 * ekranda **iki kez** üst menü/altbilgi görünüyordu.
 *
 * Bu dosya yalnızca içerik kısmını render eder; header/footer'ı
 * parent layout (`(site)/layout.tsx`) sağlar. Böylece tek bir üst menü
 * ve altbilgi görünür. Root not-found dosyası `(site)` dışındaki
 * (örn. yanlış admin yolu) 404'ler için olduğu gibi kalır.
 */

import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText } from "@/lib/types";

export default function SiteNotFound() {
  const { pageBlocks } = useStore();
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const notFoundUi = {
    ...DEFAULT_COMMON_UI.notFound,
    ...(ui.notFound ?? {}),
  };

  return (
    <Container className="py-24 text-center">
      <div className="mx-auto max-w-md">
        <div className="text-7xl font-bold text-brand-200 select-none">404</div>
        <h1 className="mt-4 text-3xl font-semibold text-brand-900">
          {notFoundUi.title}
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {notFoundUi.description}
        </p>
        <ButtonLink
          href="/"
          variant="primary"
          className="mt-7"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          {notFoundUi.homeButton}
        </ButtonLink>
      </div>
    </Container>
  );
}
