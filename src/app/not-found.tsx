"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Container } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { DEFAULT_COMMON_UI } from "@/lib/defaults/ui-common";
import type { CommonUiText } from "@/lib/types";

export default function NotFound() {
  const { pageBlocks } = useStore();
  const ui =
    (pageBlocks["ui.common"] as CommonUiText | undefined) ?? DEFAULT_COMMON_UI;
  const notFoundUi = {
    ...DEFAULT_COMMON_UI.notFound,
    ...(ui.notFound ?? {}),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-24 text-center">
          <div className="mx-auto max-w-md">
            <div className="text-7xl font-bold text-brand-200 select-none">
              404
            </div>
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
      </main>
      <SiteFooter />
    </div>
  );
}
