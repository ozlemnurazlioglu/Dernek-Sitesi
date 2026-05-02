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
import { siteConfig } from "@/lib/site";
import { seedEvents, seedNews } from "@/lib/seed-data";
import { formatDateTR } from "@/lib/utils";

export default function HomePage() {
  const latestNews = [...seedNews]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 3);

  const upcomingEvents = [...seedEvents]
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .slice(0, 2);

  return (
    <>
      <Hero />
      <Stats />
      <AboutPreview />
      <Programs />
      <ScholarshipCTA />
      <NewsPreview items={latestNews} />
      <EventsPreview items={upcomingEvents} />
      <Testimonials />
      <DonateCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <Container className="relative py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 max-w-2xl">
          <Badge tone="gold" className="mb-5">
            <Sparkles className="h-3 w-3" /> {siteConfig.founded}'den bu yana
            eğitime destek
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-brand-900 leading-[1.05]">
            Bilgiyle aydınlanan{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-brand-700">yarınlar</span>
              <span className="absolute left-0 right-0 bottom-1 h-3 bg-gold-200 -z-0" />
            </span>{" "}
            için
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
            Umut Eğitim ve Dayanışma Derneği olarak {siteConfig.stats.yearsActive}{" "}
            yılı aşkın süredir öğrencilere burs, gönüllülük ve sosyal sorumluluk
            projeleriyle umut oluyoruz. Bu yolda siz de yanımızda olun.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <ButtonLink
              href="/burs/basvuru"
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Burs Başvurusu Yap
            </ButtonLink>
            <ButtonLink href="/bagis" size="lg" variant="outline">
              Destek Ol
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
                {siteConfig.stats.activeMembers}+ aktif üye
              </span>{" "}
              değişimin parçası oldu.
            </div>
          </div>
        </div>

        <div className="md:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80"
              alt="Eğitime destek"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-900/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <div className="text-xs uppercase tracking-widest text-gold-200">
                Bu yıl
              </div>
              <div className="text-2xl font-semibold mt-1">
                500 öğrenciye burs
              </div>
              <div className="text-sm text-white/75 mt-1">
                Lise, lisans ve lisansüstü düzeyinde
              </div>
            </div>
          </div>

          <div className="absolute -left-6 top-10 hidden md:flex items-center gap-3 rounded-xl bg-white border border-border shadow-lg p-3 pr-4 animate-float-up">
            <div className="h-10 w-10 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">17. yıl</div>
              <div className="text-sm font-semibold text-brand-900">
                {siteConfig.stats.scholarshipsGiven}+ Burslu Öğrenci
              </div>
            </div>
          </div>
          <div className="absolute -right-4 bottom-12 hidden md:flex items-center gap-3 rounded-xl bg-white border border-border shadow-lg p-3 pr-4">
            <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Şeffaflık</div>
              <div className="text-sm font-semibold text-brand-900">
                Yıllık Faaliyet Raporu
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  const items = [
    {
      label: "Faaliyet yılı",
      value: `${siteConfig.stats.yearsActive}+`,
      icon: Calendar,
    },
    {
      label: "Burslu öğrenci",
      value: `${siteConfig.stats.scholarshipsGiven.toLocaleString("tr-TR")}+`,
      icon: GraduationCap,
    },
    {
      label: "Aktif üye",
      value: `${siteConfig.stats.activeMembers}+`,
      icon: Users,
    },
    {
      label: "Tamamlanan proje",
      value: `${siteConfig.stats.completedProjects}+`,
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

function AboutPreview() {
  return (
    <section>
      <Container className="py-20 grid md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5">
          <SectionHeader
            eyebrow="Hakkımızda"
            title="Eğitim için, gelecek için, birlikte"
            description="Eğitim fırsatlarına erişimi kolaylaştırmak ve toplumsal dayanışmayı güçlendirmek için 2008'den beri çalışıyoruz. Şeffaf, hesap verebilir ve gönüllülük temelli bir yaklaşımla sürdürülebilir projeler üretiyoruz."
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
          {[
            {
              icon: GraduationCap,
              title: "Karşılıksız Burs",
              text: "Lise ve üniversite öğrencileri için akademik dönem boyu sürekli destek.",
            },
            {
              icon: BookOpen,
              title: "Eğitim Projeleri",
              text: "Köy okullarına kitap, atölye ve laboratuvar desteği.",
            },
            {
              icon: HandHeart,
              title: "Sosyal Yardım",
              text: "Doğal afet bölgeleri ve dezavantajlı gruplar için saha çalışmaları.",
            },
            {
              icon: Users,
              title: "Gönüllülük",
              text: "Üyelerimizle birlikte yıl içinde 50+ etkinlik ve atölye düzenliyoruz.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-border bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-brand-900 mt-4">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Programs() {
  const items = [
    {
      title: "Lise Burs Programı",
      desc: "9–12. sınıf öğrencilerine yönelik aylık karşılıksız burs ve mentörlük.",
      number: "01",
      tag: "9 ay süreyle",
    },
    {
      title: "Üniversite Burs Programı",
      desc: "Lisans öğrencileri için akademik dönem boyu burs ve kariyer rehberliği.",
      number: "02",
      tag: "Tam akademik yıl",
    },
    {
      title: "Lisansüstü Destek",
      desc: "Yüksek lisans ve doktora öğrencilerine araştırma ve yayın desteği.",
      number: "03",
      tag: "Proje bazlı",
    },
  ];
  return (
    <section className="bg-brand-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <Container className="py-20 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeader
            eyebrow="Burs Programları"
            title={
              <span className="text-white">Eğitim hayatına kesintisiz destek</span>
            }
            description={
              <span className="text-white/70">
                Akademik dönem boyu sürekli, karşılıksız ve şeffaf burs
                programlarımız ile öğrencilerin yanındayız.
              </span>
            }
          />
          <ButtonLink href="/burs" variant="gold" size="md">
            Tüm Programlar
          </ButtonLink>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
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

function ScholarshipCTA() {
  const checks = [
    "Ücretsiz başvuru — komisyon ücreti yok",
    "Online belge yükleme & başvuru takibi",
    "Şeffaf değerlendirme süreci",
    "Akademik dönem boyu kesintisiz destek",
  ];
  return (
    <section>
      <Container className="py-20">
        <div className="rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-8 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-[0.08]" />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold-400/15 blur-3xl" />
          <div className="relative grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 text-white">
              <Badge tone="gold" className="mb-4">
                <GraduationCap className="h-3 w-3" /> 2025-2026 Başvuruları Açık
              </Badge>
              <h3 className="text-3xl md:text-4xl font-semibold leading-tight">
                Eğitiminize burs desteği için şimdi başvurun
              </h3>
              <p className="text-white/75 mt-4 max-w-xl leading-relaxed">
                Online başvuru formumuzu doldurun, gerekli evrakları yükleyin.
                Komisyonumuz başvurunuzu inceleyip 30 gün içinde geri dönüş
                yapacaktır.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
                {checks.map((c) => (
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
                <ButtonLink href="/burs/basvuru" variant="gold" size="lg">
                  Başvuruyu Başlat
                </ButtonLink>
                <ButtonLink
                  href="/burs"
                  variant="ghost"
                  size="lg"
                  className="!text-white hover:!bg-white/10"
                >
                  Burs Hakkında
                </ButtonLink>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-6">
                <div className="text-xs uppercase tracking-widest text-gold-200">
                  Başvuru Takvimi
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    { label: "Başvuru başlangıç", date: "1 Eylül 2025" },
                    { label: "Başvuru bitiş", date: "30 Eylül 2025" },
                    { label: "Mülakatlar", date: "5–10 Ekim 2025" },
                    { label: "Sonuç ilanı", date: "15 Ekim 2025" },
                  ].map((row) => (
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

function NewsPreview({ items }: { items: typeof seedNews }) {
  return (
    <section>
      <Container className="py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeader
            eyebrow="Haberler"
            title="Derneğimizden son haberler"
            description="Projelerimiz, etkinliklerimiz ve duyurularımız."
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

function EventsPreview({ items }: { items: typeof seedEvents }) {
  return (
    <section className="bg-muted/40 border-y border-border">
      <Container className="py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <SectionHeader
            eyebrow="Etkinlikler"
            title="Yaklaşan etkinliklerimiz"
            description="Bilgi paylaşımı ve dayanışma için sizi de bekliyoruz."
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

function Testimonials() {
  const items = [
    {
      name: "Ezgi A.",
      role: "İTÜ Mimarlık 4. Sınıf · Burslu",
      avatar: "https://i.pravatar.cc/96?img=49",
      text: "Bursunuzla birlikte derslerime daha çok odaklanabildim ve final dönemini bursiyer dayanışma ağı sayesinde rahat geçirdim.",
    },
    {
      name: "Murat T.",
      role: "Mezun bursiyer · Yazılım Mühendisi",
      avatar: "https://i.pravatar.cc/96?img=51",
      text: "Sadece maddi destek değil; mentörlük programıyla profesyonel hayata hazırlanmamı sağladınız. Şimdi gönüllüyüm.",
    },
    {
      name: "Selin K.",
      role: "Hacettepe Tıp 2. Sınıf",
      avatar: "https://i.pravatar.cc/96?img=29",
      text: "Şeffaf ve hızlı bir başvuru süreciydi. Belge yükleme ekranı çok kolaydı, bir gün içinde değerlendirmeye girdim.",
    },
  ];
  return (
    <section>
      <Container className="py-20">
        <SectionHeader
          eyebrow="Bursiyerlerimizden"
          title="Sözü onlara bırakıyoruz"
          align="center"
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-white p-6 relative"
            >
              <Quote className="h-8 w-8 text-gold-300 absolute -top-3 left-6 bg-white" />
              <p className="text-brand-900 leading-relaxed mt-3">
                "{t.text}"
              </p>
              <div className="mt-6 flex items-center gap-3">
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

function DonateCTA() {
  return (
    <section className="border-t border-border bg-brand-50/40">
      <Container className="py-16 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-brand-900">
            Bağışınızla bir öğrencinin yanında olabilirsiniz.
          </h3>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Tek seferlik veya düzenli bağışlarınız doğrudan burs fonumuza
            aktarılır. IBAN bilgilerimize bağış sayfamızdan ulaşabilirsiniz.
          </p>
        </div>
        <div className="md:col-span-4 flex md:justify-end gap-3">
          <ButtonLink href="/bagis" size="lg" variant="gold">
            Bağış Bilgileri
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
