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
import { siteConfig } from "@/lib/site";

export const metadata = { title: "Hakkımızda" };

const board = [
  {
    name: "Prof. Dr. Selma Erdoğan",
    role: "Yönetim Kurulu Başkanı",
    avatar: "https://i.pravatar.cc/240?img=33",
    bio: "Boğaziçi Üniversitesi Eğitim Bilimleri Fakültesi öğretim üyesi.",
  },
  {
    name: "Av. Cem Bayraktar",
    role: "Başkan Yardımcısı",
    avatar: "https://i.pravatar.cc/240?img=12",
    bio: "20 yıllık avukatlık deneyimi, sosyal sorumluluk projeleri yöneticisi.",
  },
  {
    name: "Mali Müşavir Lale Türkmen",
    role: "Sayman",
    avatar: "https://i.pravatar.cc/240?img=47",
    bio: "Şeffaflık ve hesap verebilirlik komitesi başkanı.",
  },
  {
    name: "Dr. Ahmet Korkmaz",
    role: "Genel Sekreter",
    avatar: "https://i.pravatar.cc/240?img=15",
    bio: "Burs ve mentörlük programları koordinatörü.",
  },
  {
    name: "Yelda Şener",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=20",
    bio: "Kurumsal iletişim ve kaynak geliştirme.",
  },
  {
    name: "Tunç Aslan",
    role: "Üye",
    avatar: "https://i.pravatar.cc/240?img=68",
    bio: "Saha çalışmaları ve gönüllü koordinasyonu.",
  },
];

const milestones = [
  { year: "2008", text: "Dernek kuruldu, ilk 50 burs verildi." },
  { year: "2012", text: "İlk eğitim merkezi açıldı (Kadıköy)." },
  { year: "2016", text: "Kitap Kardeşliği projesi başladı." },
  { year: "2019", text: "1.000+ burslu öğrenciye ulaşıldı." },
  { year: "2023", text: "Deprem bölgesinde acil eğitim destek programı." },
  { year: "2025", text: "Yıllık 500 öğrenciye burs kapasitesi." },
];

export default function HakkimizdaPage() {
  return (
    <>
      <PageHeader
        title="Hakkımızda"
        description={siteConfig.description}
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Hakkımızda" },
        ]}
      />

      <section>
        <Container className="py-20 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Eye,
              title: "Vizyonumuz",
              text: "Eğitim fırsatlarına erişimi engelleyen tüm bariyerlerin kalktığı bir Türkiye.",
            },
            {
              icon: Target,
              title: "Misyonumuz",
              text: "Burs, eğitim projeleri ve sosyal dayanışma ile gençlerin yanında olmak.",
            },
            {
              icon: HandHeart,
              title: "Değerlerimiz",
              text: "Şeffaflık, hesap verebilirlik, eşitlik ve gönüllülük.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-border bg-white p-7 hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-brand-900 mt-5">
                {card.title}
              </h3>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                {card.text}
              </p>
            </div>
          ))}
        </Container>
      </section>

      <section className="bg-muted/40 border-y border-border" id="yonetim">
        <Container className="py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge tone="gold" className="mb-3">
              <Award className="h-3 w-3" /> Yönetim Kurulu
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold text-brand-900">
              Bu yolda birlikte yürüdüğümüz isimler
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {board.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl bg-white border border-border p-6"
              >
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
              <Building2 className="h-3 w-3" /> Tarihçemiz
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold text-brand-900">
              17 yıllık bir yolculuk
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Küçük bir gönüllü grubunun başlattığı yardımlaşma hareketi, bugün
              binlerce öğrenciye dokunan bir sivil toplum kuruluşuna dönüştü.
            </p>
          </div>
          <div className="md:col-span-7">
            <ol className="relative border-l-2 border-brand-100 ml-3 space-y-8">
              {milestones.map((m) => (
                <li key={m.year} className="pl-6 relative">
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

      <section className="bg-brand-950 text-white" id="raporlar">
        <Container className="py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge tone="gold" className="mb-3">
              Şeffaflık
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold">
              Hesap verebilir, denetlenebilir
            </h2>
            <p className="text-white/75 mt-4 leading-relaxed">
              Bağışlarınız ve burs fonu hareketleri her yıl bağımsız denetim
              raporlarımızda kamuoyuyla paylaşılır.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Yıllık denetim raporları",
                "Yönetim kurulu toplantı tutanakları",
                "Detaylı bağış ve harcama kalemleri",
                "Bağımsız mali müşavir onayı",
              ].map((line) => (
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
            {["2024", "2023", "2022", "2021"].map((year) => (
              <div
                key={year}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors"
              >
                <div className="text-xs uppercase tracking-widest text-white/50">
                  Faaliyet Raporu
                </div>
                <div className="text-3xl font-semibold mt-2">{year}</div>
                <a
                  href="#"
                  className="mt-4 text-sm font-medium text-gold-300 hover:text-gold-200 inline-flex items-center"
                >
                  PDF olarak indir →
                </a>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
