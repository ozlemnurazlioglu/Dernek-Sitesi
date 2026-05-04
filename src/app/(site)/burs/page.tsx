"use client";

import {
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { BurseHero, PageHeadersMap } from "@/lib/types";

export default function BursPage() {
  const {
    pageBlocks,
    scholarshipPrograms,
    requiredDocuments,
    scholarshipTimeline,
    faqs,
  } = useStore();

  const hero = pageBlocks["burs.hero"] as BurseHero | undefined;
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)?.burs;

  return (
    <>
      <PageHeader
        title={headers?.title ?? "Burs Programlarımız"}
        description={headers?.description ?? ""}
        breadcrumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Burs" }]}
      />

      {hero && (
        <section>
          <Container className="py-14">
            <div className="rounded-2xl bg-gradient-to-br from-brand-800 to-brand-900 text-white p-8 md:p-10 grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8">
                <Badge tone="gold">
                  <Sparkles className="h-3 w-3" /> {hero.badge}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-semibold mt-3">
                  {hero.title}
                </h2>
                <p className="text-white/75 mt-2">{hero.description}</p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <ButtonLink href={hero.buttonHref} variant="gold" size="lg">
                  {hero.buttonLabel}
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      )}

      <section>
        <Container className="py-10">
          <div className="grid md:grid-cols-3 gap-6">
            {scholarshipPrograms.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-white p-6 flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <Badge tone="brand">{p.duration}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {p.quota} kontenjan
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-brand-900 mt-4">
                  {p.title}
                </h3>
                <div className="mt-3 text-3xl font-semibold text-brand-900">
                  {p.monthly}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{p.targets}</p>
                <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
                  <div className="text-xs uppercase tracking-wider text-gold-500 font-semibold mb-2">
                    Şartlar
                  </div>
                  {p.requirements.map((r) => (
                    <div
                      key={r}
                      className="flex items-start gap-2 text-brand-900/85"
                    >
                      <CheckCircle2 className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
                <ButtonLink
                  href="/burs/basvuru"
                  variant="outline"
                  className="mt-6"
                >
                  Bu Programa Başvur
                </ButtonLink>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted/40 border-y border-border">
        <Container className="py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Badge tone="gold" className="mb-3">
              <FileText className="h-3 w-3" /> İstenen Belgeler
            </Badge>
            <h2 className="text-3xl font-semibold text-brand-900">
              Başvuru için gerekli evraklar
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Aşağıdaki belgeleri PDF veya JPG formatında, her biri en fazla 10
              MB olacak şekilde başvuru sırasında sisteme yükleyebilirsiniz.
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="grid sm:grid-cols-2 gap-3">
              {requiredDocuments.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl bg-white border border-border p-4 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 text-xl">
                    {d.icon || "📄"}
                  </div>
                  <span className="text-sm font-medium text-brand-900">
                    {d.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge tone="brand" className="mb-3">
              <Clock className="h-3 w-3" /> Takvim
            </Badge>
            <h2 className="text-3xl font-semibold text-brand-900">
              Başvuru süreci nasıl işliyor?
            </h2>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {scholarshipTimeline.map((step, i) => (
              <div
                key={step.id}
                className="rounded-xl border border-border bg-white p-5 relative"
              >
                <div className="absolute -top-3 left-5 h-7 w-7 rounded-full bg-gold-400 text-brand-900 font-semibold text-xs flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {step.dateLabel}
                </div>
                <h3 className="text-base font-semibold text-brand-900 mt-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted/40 border-t border-border">
        <Container className="py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Badge tone="brand" className="mb-3">
              <HelpCircle className="h-3 w-3" /> SSS
            </Badge>
            <h2 className="text-3xl font-semibold text-brand-900">
              Sıkça sorulanlar
            </h2>
            <p className="mt-3 text-muted-foreground">
              Yanıtını bulamadığınız bir soru varsa{" "}
              <a href="/iletisim" className="text-brand-700 hover:underline">
                bize ulaşın
              </a>
              .
            </p>
          </div>
          <div className="md:col-span-8 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.id}
                className="group rounded-xl border border-border bg-white p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="text-base font-medium text-brand-900">
                    {item.question}
                  </span>
                  <span className="h-8 w-8 rounded-full border border-border text-brand-700 inline-flex items-center justify-center group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
