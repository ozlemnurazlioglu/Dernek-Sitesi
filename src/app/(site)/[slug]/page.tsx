"use client";

import { notFound, useParams } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { useStore } from "@/lib/store";
import { Markdown } from "@/lib/markdown";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText } from "@/lib/types";

/**
 * Yasal/sabit içerik sayfaları için dinamik route.
 * `legal_pages` tablosundaki `slug` ile URL doğrudan eşleşir
 * (örn. /gizlilik, /kvkk, /cerez, /tuzuk).
 *
 * Mevcut statik rotalar (/haberler, /burs, /iletisim vb.) Next.js
 * routing önceliği nedeniyle bu dinamik rotanın önünde gelir,
 * yani çakışma olmaz.
 */
export default function LegalPageView() {
  const params = useParams<{ slug: string }>();
  const { legalPages, ready, pageBlocks } = useStore();
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;

  if (!ready) {
    return (
      <Container className="py-20 text-center text-muted-foreground">
        {ui.loadingText ?? DEFAULT_COMMON_UI.loadingText}
      </Container>
    );
  }

  const page = legalPages.find((p) => p.slug === params.slug);
  if (!page) return notFound();

  return (
    <>
      <PageHeader
        title={page.title}
        description={page.description}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: page.title },
        ]}
      />
      <Container className="py-12 max-w-3xl">
        <Markdown source={page.content} className="text-muted-foreground" />
      </Container>
    </>
  );
}
