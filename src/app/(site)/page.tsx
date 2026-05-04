"use client";

import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Heart,
  Users,
  CheckCircle2,
  Quote,
  Calendar,
  ChevronRight,
  Sparkles,
  HandHeart,
  BookOpen,
  Trophy,
} from "lucide-react";
import { Container, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatDateTR } from "@/lib/utils";
import { AnnouncementCard } from "@/components/site/announcement-card";
import type {
  AboutCard,
  Aga,
  Announcement,
  AnnouncementCategory,
  EventItem,
  HeroBlock,
  HomeProgramCard,
  HomeScholarshipCTA,
  HomeSponsorsBlock,
  NewsItem,
  SectionHeading,
  SiteSettings,
  Sponsor,
  Testimonial,
} from "@/lib/types";

export default function HomePage() {
  const store = useStore();
  const {
    siteSettings,
    pageBlocks,
    news,
    events,
    testimonials,
    agalar,
    announcements,
    announcementCategories,
    sponsors,
  } = store;

  const latestNews = [...news]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 3);

  const upcomingEvents = [...events]
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .slice(0, 2);

  const hero = pageBlocks["home.hero"] as HeroBlock | undefined;
  const aboutSection = pageBlocks["home.about_section"] as
    | SectionHeading
    | undefined;
  const aboutCards = (pageBlocks["home.about_cards"] as AboutCard[]) ?? [];
  const programsSection = pageBlocks["home.programs_section"] as
    | SectionHeading
    | undefined;
  const programs = (pageBlocks["home.programs"] as HomeProgramCard[]) ?? [];
  const scholarshipCta = pageBlocks["home.scholarship_cta"] as
    | HomeScholarshipCTA
    | undefined;
  const newsSection = pageBlocks["home.news_section"] as
    | SectionHeading
    | undefined;
  const eventsSection = pageBlocks["home.events_section"] as
    | SectionHeading
    | undefined;
  const testimonialsSection = pageBlocks["home.testimonials_section"] as
    | SectionHeading
    | undefined;
  const agalarSection = pageBlocks["home.agalar_section"] as
    | SectionHeading
    | undefined;
  const announcementsSection = pageBlocks["home.announcements_section"] as
    | SectionHeading
    | undefined;
  const recentAnnouncements = [...announcements]
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 6);
  const sponsorsBlock = pageBlocks["home.sponsors_section"] as
    | HomeSponsorsBlock
    | undefined;
  const donateCta = pageBlocks["home.donate_cta"] as
    | { title: string; description: string; buttonLabel: string; buttonHref: string }
    | undefined;

  return (
    <>
      {hero && <Hero hero={hero} settings={siteSettings} />}
      <Stats settings={siteSettings} />
      {aboutSection && <AboutPreview heading={aboutSection} cards={aboutCards} />}
      {programsSection && (
        <Programs heading={programsSection} programs={programs} />
      )}
      {scholarshipCta && <ScholarshipCTA cta={scholarshipCta} />}
      {newsSection && <NewsPreview heading={newsSection} items={latestNews} />}
      {eventsSection && (
        <EventsPreview heading={eventsSection} items={upcomingEvents} />
      )}
      {testimonialsSection && (
        <Testimonials heading={testimonialsSection} items={testimonials} />
      )}
      {agalarSection && agalar.length > 0 && (
        <AgalarSection heading={agalarSection} items={agalar} />
      )}
      {announcementsSection && recentAnnouncements.length > 0 && (
        <AnnouncementsPreview
          heading={announcementsSection}
          items={recentAnnouncements}
          categories={announcementCategories}
        />
      )}
      {sponsorsBlock && sponsors.length > 0 && (
        <SponsorsSection block={sponsorsBlock} items={sponsors} />
      )}
      {donateCta && <DonateCTA cta={donateCta} />}
    </>
  );
}

function Hero({ hero, settings }: { hero: HeroBlock; settings: SiteSettings }) {
  const subtitle = hero.subtitle.replace(
    "{yearsActive}",
    String(settings.statYearsActive),
  );
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <Container className="relative py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 max-w-2xl">
          <Badge tone="gold" className="mb-5">
            <Sparkles className="h-3 w-3" /> {settings.founded}
            {hero.badgeText}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-brand-900 leading-[1.05]">
            {hero.titlePrefix}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-700">
                {hero.titleHighlight}
              </span>
              <span className="absolute left-0 right-0 bottom-1 h-3 bg-gold-200 -z-0" />
            </span>{" "}
            {hero.titleSuffix}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <ButtonLink
              href={hero.primaryButton.href}
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {hero.primaryButton.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryButton.href} size="lg" variant="outline">
              {hero.secondaryButton.label}
            </ButtonLink>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[
                "https://i.pravatar.cc/64?img=12",
                "https://i.pravatar.cc/64?img=32",
                "https://i.pravatar.cc/64?img=47",
                "https://i.pravatar.cc/64?img=58",
              ].map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-9 w-9 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-brand-900">
                {settings.statActiveMembers}+ aktif üye
              </span>{" "}
              değişimin parçası oldu.
            </div>
          </div>
        </div>

        <div className="md:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.imageUrl}
              alt="Eğitime destek"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-900/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="text-xs uppercase tracking-widest text-gold-200">
                {hero.imageOverlayLabel}
              </div>
              <div className="text-2xl font-semibold mt-1">
                {hero.imageOverlayTitle}
              </div>
              <div className="text-sm text-white/75 mt-1">
                {hero.imageOverlayDesc}
              </div>
            </div>
          </div>

          <div className="absolute -left-6 top-10 hidden md:flex items-center gap-3 rounded-xl bg-white border border-border shadow-lg p-3 pr-4 animate-float-up">
            <div className="h-10 w-10 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {hero.floatBadge1.label}
              </div>
              <div className="text-sm font-semibold text-brand-900">
                {settings.statScholarshipsGiven}+ {hero.floatBadge1.value}
              </div>
            </div>
          </div>
          <div className="absolute -right-4 bottom-12 hidden md:flex items-center gap-3 rounded-xl bg-white border border-border shadow-lg p-3 pr-4">
            <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                {hero.floatBadge2.label}
              </div>
              <div className="text-sm font-semibold text-brand-900">
                {hero.floatBadge2.value}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stats({ settings }: { settings: SiteSettings }) {
  const items = [
    {
      label: "Faaliyet yılı",
      value: `${settings.statYearsActive}+`,
      icon: Calendar,
    },
    {
      label: "Burslu öğrenci",
      value: `${settings.statScholarshipsGiven.toLocaleString("tr-TR")}+`,
      icon: GraduationCap,
    },
    {
      label: "Aktif üye",
      value: `${settings.statActiveMembers}+`,
      icon: Users,
    },
    {
      label: "Tamamlanan proje",
      value: `${settings.statCompletedProjects}+`,
      icon: HandHeart,
    },
  ];
  return (
    <section className="border-y border-border bg-brand-50/40">
      <Container className="py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-border text-brand-700 flex items-center justify-center shadow-sm">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-semibold text-brand-900 leading-none">
                {item.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-1">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

function AboutPreview({
  heading,
  cards,
}: {
  heading: SectionHeading;
  cards: AboutCard[];
}) {
  // İkonlar emoji olarak saklanır; eski kart yapısını korumak için fallback ikon var.
  const fallbackIcons = [GraduationCap, BookOpen, HandHeart, Users];
  return (
    <section>
      <Container className="py-20 grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <SectionHeader
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
          <ButtonLink
            href="/hakkimizda"
            variant="outline"
            className="mt-7"
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Detaylı Bilgi
          </ButtonLink>
        </div>
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
          {cards.map((card, i) => {
            const Icon = fallbackIcons[i % fallbackIcons.length];
            return (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-xl">
                  {card.icon ? card.icon : <Icon className="h-5 w-5" />}
                </div>
                <h3 className="text-base font-semibold text-brand-900 mt-4">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function Programs({
  heading,
  programs,
}: {
  heading: SectionHeading;
  programs: HomeProgramCard[];
}) {
  return (
    <section className="bg-brand-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <Container className="py-20 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeader
            eyebrow={heading.eyebrow}
            title={<span className="text-white">{heading.title}</span>}
            description={
              <span className="text-white/70">{heading.description}</span>
            }
          />
          <ButtonLink href="/burs" variant="gold" size="md">
            Tüm Programlar
          </ButtonLink>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div className="text-gold-300 text-sm font-mono">{item.number}</div>
              <h3 className="text-xl font-semibold mt-3">{item.title}</h3>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">
                {item.desc}
              </p>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  {item.tag}
                </span>
                <Link
                  href="/burs/basvuru"
                  className="text-sm font-medium text-gold-300 hover:text-gold-200 inline-flex items-center gap-1"
                >
                  Başvur <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ScholarshipCTA({ cta }: { cta: HomeScholarshipCTA }) {
  return (
    <section>
      <Container className="py-20">
        <div className="rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-8 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-[0.08]" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold-400/15 blur-3xl" />
          <div className="relative grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 text-white">
              <Badge tone="gold" className="mb-4">
                <GraduationCap className="h-3 w-3" /> {cta.badge}
              </Badge>
              <h3 className="text-3xl md:text-4xl font-semibold leading-tight">
                {cta.title}
              </h3>
              <p className="text-white/75 mt-4 max-w-xl leading-relaxed">
                {cta.description}
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
                {cta.checks.map((c) => (
                  <div
                    key={c}
                    className="flex items-center gap-2 text-sm text-white/85"
                  >
                    <CheckCircle2 className="h-4 w-4 text-gold-300 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <ButtonLink href={cta.primaryButton.href} variant="gold" size="lg">
                  {cta.primaryButton.label}
                </ButtonLink>
                <ButtonLink
                  href={cta.secondaryButton.href}
                  variant="ghost"
                  size="lg"
                  className="!text-white hover:!bg-white/10"
                >
                  {cta.secondaryButton.label}
                </ButtonLink>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-6">
                <div className="text-xs uppercase tracking-widest text-gold-200">
                  Başvuru Takvimi
                </div>
                <div className="mt-4 space-y-4">
                  {cta.calendar.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between text-sm border-b border-white/10 pb-3 last:border-0 last:pb-0 text-white"
                    >
                      <span className="text-white/70">{row.label}</span>
                      <span className="font-medium">{row.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function NewsPreview({
  heading,
  items,
}: {
  heading: SectionHeading;
  items: NewsItem[];
}) {
  return (
    <section>
      <Container className="py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeader
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
          <ButtonLink href="/haberler" variant="outline">
            Tüm Haberler
          </ButtonLink>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/haberler/${item.slug}`}
              className="group rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.cover}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge tone="brand" className="absolute top-3 left-3 bg-white">
                  {item.category}
                </Badge>
              </div>
              <div className="p-5">
                <div className="text-xs text-muted-foreground">
                  {formatDateTR(item.publishedAt)}
                </div>
                <h3 className="text-lg font-semibold text-brand-900 mt-2 leading-tight group-hover:text-brand-700">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {item.excerpt}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-brand-700">
                  Devamını oku <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EventsPreview({
  heading,
  items,
}: {
  heading: SectionHeading;
  items: EventItem[];
}) {
  return (
    <section className="bg-muted/40 border-y border-border">
      <Container className="py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeader
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
          <ButtonLink href="/etkinlikler" variant="outline">
            Tüm Etkinlikler
          </ButtonLink>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl bg-white border border-border overflow-hidden flex flex-col md:flex-row"
            >
              <div className="md:w-2/5 relative aspect-[4/3] md:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.cover}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="p-6 flex-1">
                <Badge tone="brand">{event.category}</Badge>
                <h3 className="text-xl font-semibold text-brand-900 mt-3 leading-tight">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {event.description}
                </p>
                <div className="mt-5 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-brand-600" />
                    <span>{formatDateTR(event.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-brand-600" />
                    <span>
                      {event.registered} / {event.capacity} kayıt
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials({
  heading,
  items,
}: {
  heading: SectionHeading;
  items: Testimonial[];
}) {
  return (
    <section>
      <Container className="py-20">
        <SectionHeader
          eyebrow={heading.eyebrow}
          title={heading.title}
          align="center"
          description={heading.description}
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-border bg-white p-6 relative"
            >
              <Quote className="h-8 w-8 text-gold-300 absolute -top-3 left-6 bg-white" />
              <p className="text-brand-900 leading-relaxed mt-3">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-brand-900">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SponsorsSection({
  block,
  items,
}: {
  block: HomeSponsorsBlock;
  items: Sponsor[];
}) {
  const cta = block.cta ?? {
    visible: false,
    label: "",
    href: "",
  };
  const sorted = [...items].sort((a, b) => a.sort - b.sort);
  // Liste iki kez render edilir → translate(-50%) ile sıfır-sıçrama döngü.
  const loopItems = [...sorted, ...sorted];
  // Daha uzun listede daha yavaş hız — her sponsor ~5s aksın.
  const duration = Math.max(20, sorted.length * 5);

  return (
    <section>
      <Container className="py-16 md:py-20">
        <SectionHeader
          eyebrow={block.eyebrow}
          title={block.title}
          description={block.description}
          align="center"
        />

        {/* Marquee bandı — soldan sağa sürekli kayan tek satır.
            Üzerine gelindiğinde hover ile durur. */}
        <div
          className="marquee-pause group relative mt-10 overflow-hidden"
          style={
            {
              maskImage:
                "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
              ["--marquee-duration" as string]: `${duration}s`,
            } as React.CSSProperties
          }
        >
          <div className="animate-marquee flex w-max items-center gap-4 md:gap-6">
            {loopItems.map((s, i) => {
              const card = (
                <div className="h-24 md:h-28 w-44 md:w-52 shrink-0 rounded-xl border border-border bg-white p-4 flex items-center justify-center transition-all hover:border-gold-300 hover:shadow-md">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logoUrl}
                      alt={s.name}
                      className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground text-center">
                      {s.name}
                    </span>
                  )}
                </div>
              );
              return s.websiteUrl ? (
                <a
                  key={`${s.id}-${i}`}
                  href={s.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  aria-hidden={i >= sorted.length}
                  tabIndex={i >= sorted.length ? -1 : 0}
                >
                  {card}
                </a>
              ) : (
                <div
                  key={`${s.id}-${i}`}
                  title={s.name}
                  aria-hidden={i >= sorted.length}
                >
                  {card}
                </div>
              );
            })}
          </div>
        </div>

        {cta.visible && cta.label && cta.href && (
          <div className="mt-8 flex justify-center">
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 px-5 h-11 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:text-brand-900 hover:border-brand-300 hover:bg-brand-50/40 transition-colors"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[14px] leading-none">
                +
              </span>
              {cta.label}
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}

function AnnouncementsPreview({
  heading,
  items,
  categories,
}: {
  heading: SectionHeading;
  items: Announcement[];
  categories: AnnouncementCategory[];
}) {
  const catBySlug: Record<string, AnnouncementCategory> = {};
  for (const c of categories) catBySlug[c.slug] = c;
  return (
    <section>
      <Container className="py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeader
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
          <ButtonLink href="/duyurular" variant="outline">
            Tüm İlanlar
          </ButtonLink>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              category={catBySlug[item.categorySlug]}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function AgalarSection({
  heading,
  items,
}: {
  heading: SectionHeading;
  items: Aga[];
}) {
  return (
    <section className="bg-muted/30 border-y border-border">
      <Container className="py-20">
        <SectionHeader
          eyebrow={heading.eyebrow}
          title={heading.title}
          align="center"
          description={heading.description}
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a) => (
            <article
              key={a.id}
              className="group rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {a.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.photoUrl}
                    alt={a.name}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                )}
              </div>
              <div className="p-5 text-center">
                {a.caption && (
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {a.caption}
                  </p>
                )}
                <h3 className="text-lg font-semibold text-brand-900 mt-1.5">
                  {a.name}
                </h3>
                {a.eventDate && (
                  <p className="text-xs text-gold-600 mt-1 font-medium">
                    {a.eventDate}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function DonateCTA({
  cta,
}: {
  cta: { title: string; description: string; buttonLabel: string; buttonHref: string };
}) {
  return (
    <section className="border-t border-border bg-brand-50/40">
      <Container className="py-16 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-brand-900">
            {cta.title}
          </h3>
          <p className="mt-3 text-muted-foreground max-w-2xl">{cta.description}</p>
        </div>
        <div className="md:col-span-4 flex md:justify-end gap-3">
          <ButtonLink href={cta.buttonHref} size="lg" variant="gold">
            {cta.buttonLabel}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
