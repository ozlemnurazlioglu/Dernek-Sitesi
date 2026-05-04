"use client";

import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { ApplicationForm } from "@/components/burs/application-form";
import { useStore } from "@/lib/store";
import type { PageHeadersMap } from "@/lib/types";

export default function BursBasvuruPage() {
  const { pageBlocks } = useStore();
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
        <ApplicationForm />
      </Container>
    </>
  );
}
