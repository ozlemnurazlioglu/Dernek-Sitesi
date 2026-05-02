import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata = { title: "Burs" };

const programs = [
  {
    title: "Lise Burs Programı",
    monthly: "1.500 ₺ / ay",
    duration: "9 ay",
    targets: "9–12. sınıf öğrencileri",
    quota: 200,
    requirements: [
      "T.C. vatandaşı olmak",
      "Önceki yılın not ortalamasının 75/100 üstü olması",
      "Aile gelirinin asgari ücretin 2 katını aşmaması",
    ],
  },
  {
    title: "Üniversite Burs Programı",
    monthly: "3.000 ₺ / ay",
    duration: "9 ay",
    targets: "Lisans öğrencileri",
    quota: 250,
    requirements: [
      "Bir devlet veya vakıf üniversitesinde okuyor olmak",
      "Genel not ortalamasının 2.50/4.00 üstü olması",
      "Disiplin cezası bulunmaması",
    ],
  },
  {
    title: "Lisansüstü Destek",
    monthly: "5.000 ₺ / ay",
    duration: "Proje süresince",
    targets: "Yüksek lisans / doktora öğrencileri",
    quota: 50,
    requirements: [
      "Tezli yüksek lisans veya doktora programında olmak",
      "Akademik araştırma planı sunmak",
      "Akademik danışman onayı bulunmak",
    ],
  },
];

const requiredDocuments = [
  { title: "Nüfus cüzdanı / kimlik fotokopisi", icon: FileText },
  { title: "Öğrenci belgesi (e-Devlet'ten alınabilir)", icon: GraduationCap },
  { title: "Transkript / not döküm belgesi", icon: FileText },
  { title: "Gelir durumu belgesi (anne/baba)", icon: CreditCard },
  { title: "İkametgâh belgesi", icon: FileText },
  { title: "Vesikalık fotoğraf", icon: Users },
];

const timeline = [
  { date: "1–30 Eylül", title: "Online başvuru", desc: "Form ve evrak yükleme" },
  { date: "1–4 Ekim", title: "Belge incelemesi", desc: "Komisyon ön elemesi" },
  { date: "5–10 Ekim", title: "Mülakatlar", desc: "Online veya yüz yüze" },
  { date: "15 Ekim", title: "Sonuçlar", desc: "Üyelik panelinden duyurulur" },
  { date: "20 Ekim", title: "Ödemelerin başlaması", desc: "IBAN üzerinden aylık" },
];

const faq = [
  {
    q: "Başvuru için üye olmak zorunda mıyım?",
    a: "Hayır. Üyelik zorunlu değildir, ancak başvurunuzu sonradan takip edebilmek için kayıt olmanızı öneririz.",
  },
  {
    q: "Hangi dosya formatlarını yükleyebilirim?",
    a: "Belgelerinizi PDF veya JPG formatında yükleyebilirsiniz. Her dosya en fazla 10 MB olabilir.",
  },
  {
    q: "Eksik belge ile başvuru yapabilir miyim?",
    a: "Sistem sadece zorunlu belgeleri yüklediğinizde başvurunuzu kaydetmenize izin verir. Sonradan eksik belge yüklemek için panelinizden başvurunuzu güncelleyebilirsiniz.",
  },
  {
    q: "Sonuçlar ne zaman ve nasıl açıklanır?",
    a: "Sonuçlar Ekim ayının ortasında üyelik paneliniz üzerinden ve kayıtlı e-posta adresinize bildirilir.",
  },
  {
    q: "Bursunuzu birden fazla yıl alabilir miyim?",
    a: "Evet, akademik başarınızı ve ekonomik durumunuzu gösteren belgelerle her yıl yeniden başvurarak bursunuza devam edebilirsiniz.",
  },
];

export default function BursPage() {
  return (
    <>
      <PageHeader
        title="Burs Programlarımız"
        description="Eğitim hayatınıza kesintisiz destek sunan burs programlarımız hakkında detaylı bilgi ve başvuru rehberi."
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Burs" },
        ]}
      />

      <section>
        <Container className="py-14">
          <div className="rounded-2xl bg-gradient-to-br from-brand-800 to-brand-900 text-white p-8 md:p-10 grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <Badge tone="gold">
                <Sparkles className="h-3 w-3" /> 2025-2026 Başvurular Açık
              </Badge>
              <h2 className="text-2xl md:text-3xl font-semibold mt-3">
                Online başvuruyla 5 dakikada başlayın
              </h2>
              <p className="text-white/75 mt-2">
                Başvuru formunu doldurun, gerekli belgeleri yükleyin, tüm süreci
                üyelik panelinizden takip edin.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <ButtonLink href="/burs/basvuru" variant="gold" size="lg">
                Başvuruyu Başlat
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-10">
          <div className="grid md:grid-cols-3 gap-6">
            {programs.map((p) => (
              <div
                key={p.title}
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
                    <div key={r} className="flex items-start gap-2 text-brand-900/85">
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
                  key={d.title}
                  className="rounded-xl bg-white border border-border p-4 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <d.icon className="h-5 w-5" />
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
            {timeline.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-border bg-white p-5 relative"
              >
                <div className="absolute -top-3 left-5 h-7 w-7 rounded-full bg-gold-400 text-brand-900 font-semibold text-xs flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {step.date}
                </div>
                <h3 className="text-base font-semibold text-brand-900 mt-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
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
            {faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-white p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="text-base font-medium text-brand-900">
                    {item.q}
                  </span>
                  <span className="h-8 w-8 rounded-full border border-border text-brand-700 inline-flex items-center justify-center group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
