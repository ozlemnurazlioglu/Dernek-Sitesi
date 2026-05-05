"use client";

import {
  Award,
  Building2,
  Eye,
  HandHeart,
  Target,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type {
  AboutCard,
  AboutTransparencyBlock,
  PageHeadersMap,
  SectionHeading,
} from "@/lib/types";

export default function HakkimizdaPage() {
  const { siteSettings, pageBlocks, boardMembers, milestones, activityReports } =
    useStore();

  const values = (pageBlocks["about.values"] as AboutCard[]) ?? [];
  const historyIntro = pageBlocks["about.history_intro"] as
    | SectionHeading
    | undefined;
  const transparency = pageBlocks["about.transparency"] as
    | AboutTransparencyBlock
    | undefined;
  const headers = (pageBlocks["page.headers"] as PageHeadersMap | undefined)
    ?.hakkimizda;

  const fallbackIcons = [Eye, Target, HandHeart];

  return (
    <>
      <PageHeader
        title={headers?.title ?? "Hakkımızda"}
        description={headers?.description ?? siteSettings.description}
        breadcrumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hakkımızda" }]}
      />

      <section>
        <Container className="py-20 grid md:grid-cols-3 gap-6">
          {values.map((card, i) => {
            const Icon = fallbackIcons[i % fallbackIcons.length];
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-border bg-white p-7 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center text-2xl">
                  {card.icon ? card.icon : <Icon className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-semibold text-brand-900 mt-5">
                  {card.title}
                </h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {card.text}
                </p>
              </div>
            );
          })}
        </Container>
      </section>

      <section className="bg-muted/40 border-y border-border" id="yonetim">
        <Container className="py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge tone="gold" className="mb-3">
              <Award className="h-3 w-3" /> Geçmiş Dönem Başkanlarımız
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold text-brand-900">
              Bu yolda birlikte yürüdüğümüz isimler
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardMembers.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white border border-border p-6"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-50"
                />
                <h3 className="text-base font-semibold text-brand-900 mt-4">
                  {m.name}
                </h3>
                <div className="text-sm text-gold-600 font-medium">{m.role}</div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {m.bio}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-20 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Badge tone="brand" className="mb-3">
              <Building2 className="h-3 w-3" /> {historyIntro?.eyebrow ?? "Tarihçemiz"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold text-brand-900">
              {historyIntro?.title}
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              {historyIntro?.description}
            </p>
          </div>
          <div className="md:col-span-7">
            <ol className="relative border-l-2 border-brand-100 ml-3 space-y-8">
              {milestones.map((m) => (
                <li key={m.id} className="pl-6 relative">
                  <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-gold-400 ring-4 ring-white" />
                  <div className="text-sm text-gold-600 font-semibold">
                    {m.year}
                  </div>
                  <p className="text-brand-900 mt-1">{m.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {transparency && (
        <section className="bg-brand-950 text-white" id="raporlar">
          <Container className="py-20 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge tone="gold" className="mb-3">
                {transparency.badge}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-semibold">
                {transparency.title}
              </h2>
              <p className="text-white/75 mt-4 leading-relaxed">
                {transparency.description}
              </p>
              <ul className="mt-6 space-y-2.5">
                {transparency.bullets.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-2 text-white/85 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-gold-300" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {activityReports.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="text-xs uppercase tracking-widest text-white/50">
                    Faaliyet Raporu
                  </div>
                  <div className="text-3xl font-semibold mt-2">{r.year}</div>
                  <a
                    href={r.pdfUrl || "#"}
                    target={r.pdfUrl && r.pdfUrl !== "#" ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-4 text-sm font-medium text-gold-300 hover:text-gold-200 inline-flex items-center"
                  >
                    PDF olarak indir →
                  </a>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
