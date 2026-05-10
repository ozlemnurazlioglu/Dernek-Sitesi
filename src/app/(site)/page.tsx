"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  Heart,
  HeartHandshake,
  Users,
  CheckCircle2,
  Quote,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HandHeart,
  BookOpen,
  Trophy,
  LayoutGrid,
  Layers,
  Megaphone,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Container, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { formatDateTR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { filterUpcomingAnnouncements } from "@/lib/announcement-date";
import { filterUpcomingEvents } from "@/lib/event-date";
import {
  AnnouncementCard,
  getAnnouncementColors,
} from "@/components/site/announcement-card";
import {
  getSponsorColors,
  makeTierMap,
} from "@/components/site/sponsor-card";
import type {
  AboutCard,
  Aga,
  Announcement,
  AnnouncementCategory,
  Donor,
  EventItem,
  HeroBlock,
  HeroSlide,
  HomeBlockId,
  HomeLayout,
  HomeProgramCard,
  HomeScholarshipCTA,
  HomeSmsSubscribeBlock,
  HomeSponsorsBlock,
  NewsItem,
  SectionHeading,
  SiteSettings,
  Sponsor,
  SponsorTier,
  Testimonial,
} from "@/lib/types";
import { mergeHomeLayout } from "@/lib/defaults/home-layout";

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
    sponsorTiers,
    donors,
  } = store;

  const latestNews = [...news]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 3);

  // Bitiş zamanı geçmiş etkinlikleri anasayfada gizle. `filterUpcomingEvents`
  // fail-open: parse edilemeyen `endsAt`'lerde etkinlik listede kalır, böylece
  // yanlışlıkla bir veri kaybolmaz.
  const upcomingEvents = filterUpcomingEvents([...events])
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
  // Sağ taraftaki kart grid'inin üstüne çıkan opsiyonel mini başlık.
  // Kullanıcı "Faaliyet Alanlarımız" gibi bir alt-başlık + açıklama yazdırmak
  // istedi. Block tanımlı değilse hiç render edilmez (geriye dönük uyum).
  const aboutCardsHeading = pageBlocks["home.about_cards_heading"] as
    | SectionHeading
    | undefined;
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
  // Tarihi geçmiş hemşehri ilanlarını anasayfada gizle (düğün, nişan,
  // etkinlik vb. zaman geçtikten sonra otomatik düşsün). Tarihsiz ilanlar
  // (örn. süresiz duyurular) listede kalır.
  const sortedAnnouncements = filterUpcomingAnnouncements(
    [...announcements].sort((a, b) => a.sort - b.sort),
  );
  const sponsorsBlock = pageBlocks["home.sponsors_section"] as
    | HomeSponsorsBlock
    | undefined;
  const donorsSection = pageBlocks["home.donors_section"] as
    | SectionHeading
    | undefined;
  /**
   * Bağışçıları tarihe göre yeniden eskiye sıralarız (kullanıcının seçimi).
   * Aynı tarihe sahipse `sort` (admin'in girdiği) tiebreak olarak kullanılır.
   */
  const sortedDonors = [...donors].sort((a, b) => {
    const dt = new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime();
    if (!Number.isNaN(dt) && dt !== 0) return dt;
    return a.sort - b.sort;
  });
  const donateCta = pageBlocks["home.donate_cta"] as
    | { title: string; description: string; buttonLabel: string; buttonHref: string }
    | undefined;
  const smsSection = pageBlocks["home.sms_section"] as
    | HomeSmsSubscribeBlock
    | undefined;

  /**
   * Ana sayfa blok düzeni — admin panelinden yönetilir. DB'de yoksa veya
   * eksik blok içeriyorsa varsayılan sıra ile birleştirilir.
   */
  const layout = mergeHomeLayout(pageBlocks["home.layout"] as HomeLayout | undefined);

  /**
   * Bir blok kimliğine göre uygun bileşeni döndürür. İlgili veri (heading,
   * liste vb.) yoksa null döner — layout'ta enabled olsa bile görünmez.
   */
  function renderBlock(id: HomeBlockId): React.ReactNode {
    switch (id) {
      case "hero":
        return hero ? <Hero hero={hero} settings={siteSettings} /> : null;
      case "about":
        return aboutSection ? (
          <AboutPreview
            heading={aboutSection}
            cards={aboutCards}
            cardsHeading={aboutCardsHeading}
          />
        ) : null;
      case "programs":
        return programsSection ? (
          <Programs heading={programsSection} programs={programs} />
        ) : null;
      case "scholarship_cta":
        return scholarshipCta ? <ScholarshipCTA cta={scholarshipCta} /> : null;
      case "news":
        return newsSection ? (
          <NewsPreview heading={newsSection} items={latestNews} />
        ) : null;
      case "events":
        return eventsSection ? (
          <EventsPreview heading={eventsSection} items={upcomingEvents} />
        ) : null;
      case "testimonials":
        return testimonialsSection ? (
          <Testimonials heading={testimonialsSection} items={testimonials} />
        ) : null;
      case "agalar":
        return agalarSection && agalar.length > 0 ? (
          <AgalarSection heading={agalarSection} items={agalar} />
        ) : null;
      case "announcements":
        return announcementsSection && sortedAnnouncements.length > 0 ? (
          <AnnouncementsPreview
            heading={announcementsSection}
            items={sortedAnnouncements}
            categories={announcementCategories}
          />
        ) : null;
      case "sponsors":
        return sponsorsBlock && sponsors.length > 0 ? (
          <SponsorsSection
            block={sponsorsBlock}
            items={sponsors}
            tiers={sponsorTiers}
          />
        ) : null;
      case "donors":
        return donorsSection && sortedDonors.length > 0 ? (
          <DonorsSection heading={donorsSection} items={sortedDonors} />
        ) : null;
      case "donate":
        return donateCta ? <DonateCTA cta={donateCta} /> : null;
      case "sms_subscribe":
        return smsSection ? <SmsSubscribeSection block={smsSection} /> : null;
      default:
        return null;
    }
  }

  return (
    <>
      {layout.items
        .filter((it) => it.enabled)
        .map((it) => (
          <Fragment key={it.id}>{renderBlock(it.id)}</Fragment>
        ))}
    </>
  );
}

/**
 * Hero — full-bleed banner.
 *
 * Görsel slaytlar bölümün arka planını tamamen kaplar; üstte koyu bir
 * gradient ile metin okunabilirliği sağlanır. Slaytlar arasında 6 saniyede
 * bir yumuşak fade + Ken Burns (yavaş yakınlaşma) ile geçiş yapılır.
 * Slayt sayısı 1 ise oklar/dot'lar gizlenir; otomatik geçiş durur.
 */
function Hero({ hero, settings }: { hero: HeroBlock; settings: SiteSettings }) {
  // Eski tek-görselli `imageUrl` alanı yerine yeni `slides` listesi kullanılır;
  // ikisi de boşsa boş bir placeholder slayt çıkarılır.
  const slides = useMemo<HeroSlide[]>(() => {
    if (hero.slides && hero.slides.length > 0) return hero.slides;
    return [
      {
        imageUrl: hero.imageUrl ?? "",
        overlayLabel: hero.imageOverlayLabel ?? "",
        overlayTitle: hero.imageOverlayTitle ?? "",
        overlayDesc: hero.imageOverlayDesc ?? "",
        showOverlay: true,
      },
    ];
  }, [hero]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Aktif slaytın Ken Burns animasyonunu her geçişte baştan başlatmak için
  // remount tetikleyici. Index değiştikçe artar, key prop'una eklenir.
  const [cycle, setCycle] = useState(0);
  const isMulti = slides.length > 1;

  function goTo(target: number) {
    const next = ((target % slides.length) + slides.length) % slides.length;
    if (next === index) return;
    setIndex(next);
    setCycle((c) => c + 1);
  }

  useEffect(() => {
    if (!isMulti || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
      setCycle((c) => c + 1);
    }, 6000);
    return () => window.clearInterval(id);
  }, [isMulti, paused, slides.length]);

  const activeSlide = slides[index];
  const overlayVisible =
    activeSlide?.showOverlay !== false &&
    Boolean(
      activeSlide?.overlayLabel ||
        activeSlide?.overlayTitle ||
        activeSlide?.overlayDesc,
    );

  // ——— Slayt-özel METİN/BUTON override mantığı ———
  // Her alan için: aktif slaytta non-empty değer varsa onu, yoksa global
  // hero değerini kullan. Eski hero kayıtları (slayt-bazlı alan yok) hâlâ
  // çalışır.
  const primaryBtn =
    activeSlide?.primaryButton && activeSlide.primaryButton.label.trim()
      ? activeSlide.primaryButton
      : hero.primaryButton;
  const secondaryBtn =
    activeSlide?.secondaryButton && activeSlide.secondaryButton.label.trim()
      ? activeSlide.secondaryButton
      : hero.secondaryButton;

  // Rozet metni: slaytta non-empty ise SADECE onu göster (founded prefix yok),
  // değilse hep ki "{founded}{hero.badgeText}" gösterilir.
  const badgeContent = activeSlide?.badgeText?.trim()
    ? activeSlide.badgeText
    : `${settings.founded}${hero.badgeText}`;

  // Başlık üç-parça: herhangi bir parça non-empty ise üçü birden slayttan
  // alınır (boş alanlar boş basılır). Aksi takdirde global başlık kullanılır.
  const slideTitleSet = Boolean(
    activeSlide?.titlePrefix?.trim() ||
      activeSlide?.titleHighlight?.trim() ||
      activeSlide?.titleSuffix?.trim(),
  );
  const titlePrefix = slideTitleSet
    ? (activeSlide?.titlePrefix ?? "")
    : hero.titlePrefix;
  const titleHighlight = slideTitleSet
    ? (activeSlide?.titleHighlight ?? "")
    : hero.titleHighlight;
  const titleSuffix = slideTitleSet
    ? (activeSlide?.titleSuffix ?? "")
    : hero.titleSuffix;

  // Alt yazı: slaytta non-empty ise onu, değilse global. {yearsActive}
  // yer tutucusu her iki kaynak için de değiştirilir.
  const subtitleRaw = activeSlide?.subtitle?.trim()
    ? activeSlide.subtitle
    : hero.subtitle;
  const subtitle = subtitleRaw.replace(
    "{yearsActive}",
    String(settings.statYearsActive),
  );

  // Yüzen rozetler: slaytta label VEYA value non-empty ise slayt değerleri
  // (object olarak) kullanılır; değilse global. Tek alanda kısmi override
  // değil — bütün-veya-hiç davranışı UI tarafında daha öngörülebilir.
  const slideFb1Filled = Boolean(
    activeSlide?.floatBadge1 &&
      (activeSlide.floatBadge1.label.trim() ||
        activeSlide.floatBadge1.value.trim()),
  );
  const floatBadge1 = slideFb1Filled
    ? activeSlide!.floatBadge1!
    : hero.floatBadge1;

  const slideFb2Filled = Boolean(
    activeSlide?.floatBadge2 &&
      (activeSlide.floatBadge2.label.trim() ||
        activeSlide.floatBadge2.value.trim()),
  );
  const floatBadge2 = slideFb2Filled
    ? activeSlide!.floatBadge2!
    : hero.floatBadge2;

  // Slayt değişiminde metin/rozet bloklarını yumuşakça yeniden mount edip
  // animate-float-up animasyonunu tetiklemek için içerik parmak izi key'leri.
  // Eğer iki slayt arasında gerçek metin değişimi yoksa key aynı kalır →
  // gereksiz animasyon olmaz.
  const heroTextKey = `${badgeContent}|${titlePrefix}|${titleHighlight}|${titleSuffix}|${subtitle}|${primaryBtn.label}|${primaryBtn.href}|${secondaryBtn.label}|${secondaryBtn.href}`;
  const floatBadgesKey = `${floatBadge1.label}|${floatBadge1.value}|${floatBadge2.label}|${floatBadge2.value}`;

  return (
    <section
      className="relative isolate overflow-hidden bg-brand-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription={isMulti ? "carousel" : undefined}
    >
      {/* Slayt katmanı — tüm hero'yu kaplar */}
      <div className="absolute inset-0">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              className={cn(
                "absolute inset-0 ease-out",
                active
                  ? "opacity-100 duration-[1500ms] z-[1] transition-opacity"
                  : "opacity-0 duration-[800ms] z-0 transition-opacity",
              )}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${slides.length}`}
              aria-hidden={!active}
            >
              {/*
                Aktif slayt için key'e cycle eklenir → her geçişte remount
                olur ve animate-hero-zoom CSS animasyonu baştan başlar. Pasif
                slaytlar stabil key tutar (gereksiz remount yok).
              */}
              <div
                key={active ? `act-${i}-${cycle}` : `idle-${i}`}
                className={cn(
                  "absolute inset-0 h-full w-full",
                  active && "animate-hero-zoom",
                )}
              >
                {s.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.imageUrl}
                    alt={s.overlayTitle || `Hero görseli ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Okunabilirlik için katmanlı gradientler + hafif grid dokusu */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-brand-950/85 via-brand-950/55 to-brand-950/15" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-brand-950/80 via-transparent to-brand-950/35" />
      <div className="absolute inset-0 z-[2] bg-grid opacity-[0.05]" />

      {/*
        Metin içeriği — görselin üzerinde.
        Yükseklik stratejisi:
        - Sticky header ≈ 112px (topbar + nav). Hero'nun ekrana tam oturması için
          `min-h` viewport'a göre dinamik hesaplanır: `100svh - 128px` (header +
          ufak nefes). Eski sabit 680px değeri 1024×768 laptop'larda taşıyordu.
        - svh = "small viewport height" → mobil tarayıcı çubukları açıkken bile
          stabil kalır (vh'nin neden olduğu zıplamayı önler).
        - max() ile bir alt sınır: çok kısa pencerelerde hero garip biçimde
          ezilmesin. Üst sınır yok — uzun ekranda doğal olarak büyür.
        - Padding `py-10 md:py-16 lg:py-20` — eski py-44 yarıdan fazla azaltıldı.
      */}
      <Container className="relative z-10 py-10 md:py-16 lg:py-20 min-h-[480px] md:min-h-[max(560px,calc(100svh-128px))] flex items-center">
        <div className="max-w-2xl">
          {/*
            Slayt-özel metin override aktifse heroTextKey değişir → bu wrapper
            remount olur ve animate-float-up devreye girer. Aksi halde key
            sabit kaldığı için geçişler statik (animation yok).
          */}
          <div key={heroTextKey} className="animate-float-up">
            <Badge
              tone="gold"
              className="mb-5 !bg-gold-300/15 !text-gold-100 !border-gold-200/30 backdrop-blur-sm"
            >
              <Sparkles className="h-3 w-3" /> {badgeContent}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-white leading-[1.05] drop-shadow-sm">
              {titlePrefix}
              {titleHighlight ? " " : ""}
              {titleHighlight && (
                <span className="relative inline-block">
                  <span className="relative z-10 text-gold-200">
                    {titleHighlight}
                  </span>
                  <span className="absolute left-0 right-0 bottom-1 h-3 bg-gold-300/25 -z-0" />
                </span>
              )}
              {titleSuffix ? " " : ""}
              {titleSuffix}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 leading-relaxed max-w-xl">
              {subtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {primaryBtn.label.trim() && (
                <ButtonLink
                  href={primaryBtn.href}
                  size="lg"
                  variant="gold"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  {primaryBtn.label}
                </ButtonLink>
              )}
              {secondaryBtn.label.trim() && (
                <ButtonLink
                  href={secondaryBtn.href}
                  size="lg"
                  variant="outline"
                  className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20 hover:!border-white/50 backdrop-blur-sm"
                >
                  {secondaryBtn.label}
                </ButtonLink>
              )}
            </div>
          </div>

          <div className="mt-6 md:mt-10 flex items-center gap-4">
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
                  className="h-9 w-9 rounded-full ring-2 ring-white/40 object-cover"
                />
              ))}
            </div>
            <div className="text-sm text-white/80">
              <span className="font-semibold text-white">
                {settings.statActiveMembers}+ aktif üye
              </span>{" "}
              değişimin parçası oldu.
            </div>
          </div>
        </div>
      </Container>

      {/* Sağ üst — yüzen rozetler (slayt-bazlı override edilebilir) */}
      <div
        key={floatBadgesKey}
        className="pointer-events-none absolute right-6 top-8 hidden md:flex flex-col gap-3 z-10 items-end"
      >
        {(floatBadge1.label.trim() || floatBadge1.value.trim()) && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-3 pr-4 animate-float-up">
            <div className="h-10 w-10 rounded-lg bg-gold-300/20 text-gold-100 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-white/70">{floatBadge1.label}</div>
              <div className="text-sm font-semibold text-white">
                {/*
                  Sadece global rozet kullanılırken faaliyet sayısı önek olarak
                  basılır (eski tasarım). Slayt-özel override aktifse kullanıcı
                  "değer" alanına ne yazarsa o gösterilir; öneki istemezler.
                */}
                {!slideFb1Filled && `${settings.statScholarshipsGiven}+ `}
                {floatBadge1.value}
              </div>
            </div>
          </div>
        )}
        {(floatBadge2.label.trim() || floatBadge2.value.trim()) && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-3 pr-4 animate-float-up">
            <div className="h-10 w-10 rounded-lg bg-brand-300/20 text-brand-100 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-white/70">{floatBadge2.label}</div>
              <div className="text-sm font-semibold text-white">
                {floatBadge2.value}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sağ alt — slayt başına opsiyonel bilgi kutusu (admin toggle'lı) */}
      {overlayVisible && (
        <div
          key={`overlay-${index}-${cycle}`}
          className="absolute bottom-20 right-6 hidden lg:block z-10 max-w-xs animate-float-up"
        >
          <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-4">
            {activeSlide.overlayLabel && (
              <div className="text-xs uppercase tracking-widest text-gold-200">
                {activeSlide.overlayLabel}
              </div>
            )}
            {activeSlide.overlayTitle && (
              <div className="text-xl font-semibold mt-1 text-white">
                {activeSlide.overlayTitle}
              </div>
            )}
            {activeSlide.overlayDesc && (
              <div className="text-sm text-white/80 mt-1">
                {activeSlide.overlayDesc}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ok butonları + nokta indikatörü (yalnızca >1 slayt) */}
      {isMulti && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Önceki slayt"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 md:h-12 md:w-12 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white border border-white/20 shadow-lg flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Sonraki slayt"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 md:h-12 md:w-12 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white border border-white/20 shadow-lg flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}. slayta git`}
                aria-current={i === index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  i === index
                    ? "bg-white w-8"
                    : "bg-white/40 hover:bg-white/70 w-2",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function AboutPreview({
  heading,
  cards,
  cardsHeading,
}: {
  heading: SectionHeading;
  cards: AboutCard[];
  cardsHeading?: SectionHeading;
}) {
  // İkonlar emoji olarak saklanır; eski kart yapısını korumak için fallback ikon var.
  const fallbackIcons = [GraduationCap, BookOpen, HandHeart, Users];
  // cardsHeading bloğu: en az bir alanı doluysa kartların üstüne mini başlık
  // bloğu çıkarırız. Üçü de boşsa eski tek-kolonlu görünüm korunur.
  const showCardsHeading = Boolean(
    cardsHeading?.eyebrow?.trim() ||
      cardsHeading?.title?.trim() ||
      cardsHeading?.description?.trim(),
  );
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
        <div className="md:col-span-7">
          {showCardsHeading && (
            <div className="mb-6">
              {cardsHeading?.eyebrow?.trim() && (
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">
                  {cardsHeading.eyebrow}
                </div>
              )}
              {cardsHeading?.title?.trim() && (
                <h3 className="text-2xl md:text-[26px] font-semibold text-brand-900 mt-1.5 leading-tight">
                  {cardsHeading.title}
                </h3>
              )}
              {cardsHeading?.description?.trim() && (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                  {cardsHeading.description}
                </p>
              )}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
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
  tiers,
}: {
  block: HomeSponsorsBlock;
  items: Sponsor[];
  tiers: SponsorTier[];
}) {
  const cta = block.cta ?? {
    visible: false,
    label: "",
    href: "",
  };

  // Slug → SponsorTier eşlemesi.
  const tierMap = useMemo(() => makeTierMap(tiers), [tiers]);
  // Slug → tür sırası; sıralamada bilinmeyen / boş → en sona.
  const tierOrder = useMemo(() => {
    const map = new Map<string, number>();
    [...tiers]
      .sort((a, b) => a.sort - b.sort)
      .forEach((t, i) => map.set(t.slug, i));
    return map;
  }, [tiers]);

  // Önce tür sırasına, sonra sponsor.sort'a göre sırala — Platin önce gelir.
  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a, b) => {
      const ta = tierOrder.get(a.tierSlug) ?? Number.MAX_SAFE_INTEGER;
      const tb = tierOrder.get(b.tierSlug) ?? Number.MAX_SAFE_INTEGER;
      if (ta !== tb) return ta - tb;
      return a.sort - b.sort;
    });
    return arr;
  }, [items, tierOrder]);

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
          <div className="animate-marquee flex w-max items-stretch gap-4 md:gap-6 py-2">
            {loopItems.map((s, i) => {
              const tier = s.tierSlug ? tierMap[s.tierSlug] : undefined;
              const colors = getSponsorColors(tier?.color);
              const card = (
                <div
                  className={cn(
                    "shrink-0 w-44 md:w-52 rounded-xl bg-white border-2 transition-all hover:shadow-md flex flex-col overflow-hidden",
                    colors.border,
                  )}
                >
                  <div className="h-20 md:h-24 flex items-center justify-center p-4">
                    {s.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logoUrl}
                        alt={s.name}
                        className="max-h-full max-w-full object-contain opacity-90 hover:opacity-100 transition"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground text-center">
                        {s.name}
                      </span>
                    )}
                  </div>
                  {tier && (
                    <div
                      className={cn(
                        "py-1 text-center text-[10px] font-semibold uppercase tracking-wider border-t",
                        colors.badgeBg,
                        colors.badgeText,
                        colors.border,
                      )}
                    >
                      {tier.name}
                    </div>
                  )}
                </div>
              );
              return s.websiteUrl ? (
                <a
                  key={`${s.id}-${i}`}
                  href={s.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={tier ? `${s.name} · ${tier.name}` : s.name}
                  aria-hidden={i >= sorted.length}
                  tabIndex={i >= sorted.length ? -1 : 0}
                >
                  {card}
                </a>
              ) : (
                <div
                  key={`${s.id}-${i}`}
                  title={tier ? `${s.name} · ${tier.name}` : s.name}
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

/**
 * Anasayfa filtre tabları için kategori slug → ikon eşlemesi.
 * Bilinmeyen slug'larda generic `Layers` ikonu kullanılır.
 */
const ANNOUNCEMENT_FILTER_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  vefat: HeartHandshake,
  dugun: Heart,
  nisan: Sparkles,
  etkinlik: Calendar,
  duyuru: Megaphone,
  diger: Layers,
};

function AnnouncementsPreview({
  heading,
  items,
  categories,
}: {
  heading: SectionHeading;
  items: Announcement[];
  categories: AnnouncementCategory[];
}) {
  const [active, setActive] = useState<string>("all");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort - b.sort),
    [categories],
  );

  const catBySlug = useMemo(() => {
    const m: Record<string, AnnouncementCategory> = {};
    for (const c of categories) m[c.slug] = c;
    return m;
  }, [categories]);

  // Filtre uygula → en fazla 6 öğe göster.
  const filtered = useMemo(() => {
    const list =
      active === "all"
        ? items
        : items.filter((a) => a.categorySlug === active);
    return list.slice(0, 6);
  }, [items, active]);

  // Anasayfa filtreleri sadece içinde duyuru olan kategorileri gösterir;
  // boş kategoriler için sekme açmamak ana sayfayı temiz tutar.
  const availableCategories = useMemo(() => {
    const slugsWithItems = new Set(items.map((a) => a.categorySlug));
    return sortedCategories.filter((c) => slugsWithItems.has(c.slug));
  }, [items, sortedCategories]);

  return (
    <section>
      <Container className="py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <SectionHeader
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
          <ButtonLink href="/duyurular" variant="outline">
            Tüm İlanlar
          </ButtonLink>
        </div>

        {availableCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <HomeFilterPill
              active={active === "all"}
              onClick={() => setActive("all")}
              icon={<LayoutGrid className="h-4 w-4" />}
              color="brand"
            >
              Tümü
            </HomeFilterPill>
            {availableCategories.map((c) => {
              const Icon = ANNOUNCEMENT_FILTER_ICONS[c.slug] ?? Layers;
              return (
                <HomeFilterPill
                  key={c.slug}
                  active={active === c.slug}
                  onClick={() => setActive(c.slug)}
                  icon={<Icon className="h-4 w-4" />}
                  color={c.color}
                >
                  {c.name}
                </HomeFilterPill>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-12 text-center text-muted-foreground">
            Bu kategoride henüz ilan yok.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                category={catBySlug[item.categorySlug]}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function HomeFilterPill({
  active,
  onClick,
  icon,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: string;
}) {
  const colors = getAnnouncementColors(color);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium border transition-all",
        active
          ? `${colors.badgeBg} ${colors.badgeText} border-transparent shadow-sm`
          : "bg-white text-brand-900 border-border hover:bg-muted hover:border-brand-200",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function AgalarSection({
  heading,
  items,
}: {
  heading: SectionHeading;
  items: Aga[];
}) {
  // sort alanına göre sırala; sonra listeyi iki kez render et:
  // marquee animasyonu translateX(-50%) ile ilk kümeyi ekran dışına çıkarınca
  // ikinci küme aynı görüntüyü vererek sıfır-sıçrama döngü sağlar.
  const sorted = [...items].sort((a, b) => a.sort - b.sort);
  const loopItems = [...sorted, ...sorted];
  // Daha kalabalık listede daha yavaş hız — her ağa için ~6 saniye akış.
  const duration = Math.max(30, sorted.length * 6);

  return (
    <section className="bg-muted/30 border-y border-border">
      <Container className="py-20">
        <SectionHeader
          eyebrow={heading.eyebrow}
          title={heading.title}
          align="center"
          description={heading.description}
        />

        {/* Yatay marquee — kartlar soldan sağa sürekli kayar; üzerine
            gelindiğinde animasyon hover ile durur. Kenarlarda yumuşak
            kaybolma için CSS mask gradient. */}
        <div
          className="marquee-pause group relative mt-12 overflow-hidden"
          style={
            {
              maskImage:
                "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
              ["--marquee-duration" as string]: `${duration}s`,
            } as React.CSSProperties
          }
        >
          <div className="animate-marquee flex w-max items-stretch gap-6">
            {loopItems.map((a, i) => (
              <article
                key={`${a.id}-${i}`}
                aria-hidden={i >= sorted.length}
                className="group/card w-64 sm:w-72 shrink-0 rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {a.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.photoUrl}
                      alt={a.name}
                      className="absolute inset-0 h-full w-full object-cover group-hover/card:scale-[1.03] transition-transform duration-500"
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
        </div>
      </Container>
    </section>
  );
}

/**
 * "Bağışçılarımız" bölümü — ana sayfada kullanılır.
 *
 * Görsel: dikey kart, üstte kalp ikonu + başlık + açıklama; altta liste.
 * Her satır: yuvarlak avatar (baş harfler), isim + tarih, sağda altın renkli
 * miktar. Liste uzunsa kart içinde dikey scroll yapılır (max-height kontrolü).
 *
 * Karar notları:
 * - `amount === 0` ise miktar gizlenir (anonim bağış görünümü).
 * - Tarih hatalı/boşsa satır gizlenmez ama tarih satırı gösterilmez.
 * - Avatar arka planı sırayla rotate edilen ton listesinden seçilir; aynı
 *   isim her zaman aynı renge denk gelsin diye basit bir hash kullanılır.
 */
function DonorsSection({
  heading,
  items,
}: {
  heading: SectionHeading;
  items: Donor[];
}) {
  return (
    <section className="border-t border-border bg-muted/30">
      <Container className="py-14">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl border border-border bg-white shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-4 pb-5 border-b border-border">
              <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                {heading.eyebrow && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                    {heading.eyebrow}
                  </p>
                )}
                <h2 className="text-2xl font-semibold text-brand-900 mt-0.5">
                  {heading.title}
                </h2>
                {heading.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {heading.description}
                  </p>
                )}
              </div>
            </div>

            {/*
              Liste — kart içinde max yükseklik 26rem (görseldeki scroll davranışı).
              custom scrollbar: ince ve gold renkli rail.
            */}
            <ul
              className={cn(
                "mt-5 space-y-2 pr-2",
                "max-h-[26rem] overflow-y-auto",
                "scrollbar-thin scrollbar-thumb-gold-400 scrollbar-track-transparent",
              )}
              style={{ scrollbarWidth: "thin", scrollbarColor: "#d4a437 transparent" }}
            >
              {items.map((d) => (
                <DonorRow key={d.id} donor={d} />
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function DonorRow({ donor }: { donor: Donor }) {
  const initials = makeDonorInitials(donor.name);
  const tone = donorAvatarTone(donor.name);
  const formattedDate = formatDonorDate(donor.donatedAt);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/70 bg-white px-3 py-2.5 hover:border-brand-200 transition-colors">
      <span
        className={cn(
          "h-10 w-10 rounded-full inline-flex items-center justify-center text-xs font-bold shrink-0",
          tone,
        )}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-brand-900 truncate">
          {donor.name}
        </div>
        {formattedDate && (
          <div className="text-xs text-muted-foreground">{formattedDate}</div>
        )}
      </div>
      {donor.amount > 0 && (
        <span className="text-sm font-bold text-gold-700 shrink-0 tabular-nums">
          ₺{donor.amount.toLocaleString("tr-TR")}
        </span>
      )}
    </li>
  );
}

function makeDonorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("tr-TR");
}

const DONOR_TONES = [
  "bg-brand-100 text-brand-800",
  "bg-rose-50 text-rose-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-800",
  "bg-sky-50 text-sky-700",
  "bg-violet-50 text-violet-700",
];

/** İsim sabitse aynı renk gelsin diye basit deterministic hash. */
function donorAvatarTone(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return DONOR_TONES[Math.abs(h) % DONOR_TONES.length];
}

/** "2026-05-02" → "2 Mayıs 2026". Geçersiz girdi için boş string döner. */
function formatDonorDate(value: string): string {
  if (!value) return "";
  return formatDateTR(value);
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

/**
 * Ana sayfa "SMS Aboneliği" bölümü.
 *
 * Üye olmayan ziyaretçiler de buradan numara bırakıp dernek bilgilendirme
 * mesajlarına abone olabilir. KVKK onayı zorunludur; metin admin panelden
 * düzenlenebilir ve `{kvkk}` yer tutucusu KVKK aydınlatma metninin link'i
 * ile değiştirilir.
 *
 * Form sonucu inline banner olarak gösterilir; aynı numara tekrar gelirse
 * "zaten kayıtlı" mesajı çıkar (server tarafından 409 ile döner).
 */
function SmsSubscribeSection({ block }: { block: HomeSmsSubscribeBlock }) {
  type Status =
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok"; message: string }
    | { kind: "err"; message: string; tone: "warn" | "error" };

  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // KVKK link metnini consentLabel içindeki "{kvkk}" yer tutucusu ile değiştirip
  // 3 parçaya ayır; aksi halde tüm metnin sonuna link ekle.
  const consentParts = useMemo(() => {
    const placeholder = "{kvkk}";
    const idx = block.consentLabel.indexOf(placeholder);
    if (idx === -1) {
      return {
        before: block.consentLabel + " ",
        link: block.consentLinkLabel,
        after: "",
      };
    }
    return {
      before: block.consentLabel.slice(0, idx),
      link: block.consentLinkLabel,
      after: block.consentLabel.slice(idx + placeholder.length),
    };
  }, [block.consentLabel, block.consentLinkLabel]);

  // Türk cep formatı için input maskesi: input'u her değişiminde
  // "0 555 123 45 67" şeklinde yeniden gruplandırılır.
  //
  // Kritik: input'un kendisi zaten "0 " prefix'i ile basıldığı için
  // gelen ham değerde o "0" mevcut. Onu rakam olarak yeniden sayarsak
  // her tuş basışında başa bir "0" daha eklenmiş gibi görünür
  // ("0 005 55" gibi). Bu nedenle:
  //   1) tüm rakamları topla
  //   2) ülke kodu öneklerini at: "+90", "0090" → 12 hane ve "90" başı
  //   3) baştaki TÜM 0'ları sıyır (görsel "0 " prefix'i sabittir)
  //   4) en fazla 10 haneye kırp ve grupla.
  function formatVisible(raw: string) {
    let d = raw.replace(/\D+/g, "");
    if (d.length === 12 && d.startsWith("90")) d = d.slice(2);
    d = d.replace(/^0+/, "");
    d = d.slice(0, 10);
    if (d.length === 0) return "";
    if (d.length <= 3) return `0 ${d}`;
    if (d.length <= 6) return `0 ${d.slice(0, 3)} ${d.slice(3)}`;
    if (d.length <= 8)
      return `0 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    return `0 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "loading") return;
    if (!consent) {
      setStatus({
        kind: "err",
        message: block.consentRequiredMessage,
        tone: "error",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/sms-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, consent: true }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; code?: string }
        | null;
      if (res.ok && json?.ok) {
        setStatus({ kind: "ok", message: block.successMessage });
        setPhone("");
        setConsent(false);
        return;
      }
      if (res.status === 409 || json?.code === "ALREADY_SUBSCRIBED") {
        setStatus({
          kind: "err",
          message: block.alreadyMessage,
          tone: "warn",
        });
        return;
      }
      if (json?.code === "INVALID_PHONE") {
        setStatus({
          kind: "err",
          message: block.invalidMessage,
          tone: "error",
        });
        return;
      }
      setStatus({
        kind: "err",
        message: json?.error || "Bir sorun oluştu, lütfen tekrar deneyin.",
        tone: "error",
      });
    } catch {
      setStatus({
        kind: "err",
        message: "Bağlantı hatası. Lütfen tekrar deneyin.",
        tone: "error",
      });
    }
  }

  const loading = status.kind === "loading";

  return (
    <section className="border-t border-border bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white">
      <Container className="py-16 md:py-20">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6">
            <Badge tone="gold" className="mb-4 !bg-gold-300/15 !text-gold-100 !border-gold-200/30">
              <MessageCircle className="h-3 w-3" /> {block.eyebrow}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
              {block.title}
            </h2>
            <p className="text-white/75 mt-4 leading-relaxed max-w-xl">
              {block.description}
            </p>
          </div>
          <div className="md:col-span-6">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm p-5 md:p-6"
              noValidate
            >
              <label className="block">
                <span className="sr-only">Telefon</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={block.phonePlaceholder}
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatVisible(e.target.value));
                    if (status.kind !== "idle") setStatus({ kind: "idle" });
                  }}
                  className="w-full h-12 rounded-xl bg-white/10 border border-white/20 px-4 text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-gold-300/60 focus:border-gold-300/40 transition"
                  disabled={loading}
                  required
                  aria-label="Telefon numarası"
                />
              </label>

              <label className="mt-3 flex items-start gap-2.5 text-sm text-white/85 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (status.kind !== "idle") setStatus({ kind: "idle" });
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-gold-400 focus:ring-gold-300/60 cursor-pointer"
                  disabled={loading}
                  aria-required="true"
                />
                <span>
                  {consentParts.before}
                  <Link
                    href="/kvkk"
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold-300 hover:text-gold-200 underline underline-offset-2"
                  >
                    {consentParts.link}
                  </Link>
                  {consentParts.after}
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "mt-4 inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold transition-colors",
                  "bg-gold-400 text-brand-950 hover:bg-gold-300",
                  loading && "opacity-70 cursor-not-allowed",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gönderiliyor…
                  </>
                ) : (
                  <>
                    {block.buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {status.kind === "ok" && (
                <div
                  role="status"
                  className="mt-4 rounded-xl border border-emerald-300/40 bg-emerald-400/10 text-emerald-100 px-4 py-3 text-sm flex items-start gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-300" />
                  <span>{status.message}</span>
                </div>
              )}
              {status.kind === "err" && (
                <div
                  role="alert"
                  className={cn(
                    "mt-4 rounded-xl border px-4 py-3 text-sm flex items-start gap-2",
                    status.tone === "warn"
                      ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                      : "border-rose-300/40 bg-rose-400/10 text-rose-100",
                  )}
                >
                  <span>{status.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
