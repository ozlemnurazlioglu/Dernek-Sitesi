"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AboutCardListEditor,
  AboutTransparencyEditor,
  ApplicationFormEditor,
  AuthUiTextEditor,
  BurseHeroEditor,
  CommonUiTextEditor,
  DonateCTAEditor,
  DonateSidebarEditor,
  FooterEditor,
  HeaderEditor,
  HeroEditor,
  HomeProgramsEditor,
  HomeSponsorsEditor,
  PageHeadersEditor,
  ScholarshipCTAEditor,
  SectionHeadingEditor,
} from "@/components/admin/block-editors";

const tabs = [
  { id: "headers", label: "Sayfa Başlıkları" },
  { id: "home", label: "Ana Sayfa" },
  { id: "about", label: "Hakkımızda" },
  { id: "burs", label: "Burs Sayfası" },
  { id: "burs_form", label: "Başvuru Formu" },
  { id: "donate", label: "Bağış Sayfası" },
  { id: "auth", label: "Giriş & Üyelik" },
  { id: "common", label: "Genel UI" },
  { id: "header", label: "Header" },
  { id: "footer", label: "Footer" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function SayfalarPage() {
  const [tab, setTab] = useState<TabId>("home");

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-900">
          Sayfa İçerikleri
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ana sayfa, hakkımızda, burs ve bağış sayfalarındaki başlık, açıklama,
          buton metinleri gibi serbest içerik bloklarını buradan yönetin.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "h-10 px-4 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-brand-700 text-brand-900"
                : "border-transparent text-muted-foreground hover:text-brand-800",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "headers" && <PageHeadersEditor />}

      {tab === "home" && (
        <>
          <HeroEditor />
          <SectionHeadingEditor
            blockKey="home.about_section"
            title="Ana Sayfa — Hakkımızda Bölüm Başlığı"
            description="Hakkımızda kartlarının üst başlık alanı."
          />
          <AboutCardListEditor
            blockKey="home.about_cards"
            title="Ana Sayfa — Hakkımızda Kartları"
            description="Anasayfada 4'lü grid halinde gösterilen küçük kartlar."
          />
          <SectionHeadingEditor
            blockKey="home.programs_section"
            title="Ana Sayfa — Programlar Bölüm Başlığı"
          />
          <HomeProgramsEditor />
          <ScholarshipCTAEditor />
          <SectionHeadingEditor
            blockKey="home.news_section"
            title="Ana Sayfa — Haberler Başlığı"
          />
          <SectionHeadingEditor
            blockKey="home.events_section"
            title="Ana Sayfa — Etkinlikler Başlığı"
          />
          <SectionHeadingEditor
            blockKey="home.testimonials_section"
            title="Ana Sayfa — Yorumlar Başlığı"
          />
          <SectionHeadingEditor
            blockKey="home.agalar_section"
            title="Ana Sayfa — Ağalarımız Başlığı"
            description="Ağalarımız bölümünün üst başlığı. Liste içeriğini soldaki 'Ağalarımız' menüsünden yönetin."
          />
          <SectionHeadingEditor
            blockKey="home.announcements_section"
            title="Ana Sayfa — Hemşehri İlanları Başlığı"
            description="İlan içeriklerini soldaki 'Duyurular' menüsünden yönetin."
          />
          <HomeSponsorsEditor />
          <DonateCTAEditor />
        </>
      )}

      {tab === "about" && (
        <>
          <AboutCardListEditor
            blockKey="about.values"
            title="Vizyon / Misyon / Değerler Kartları"
            description="Hakkımızda sayfasının üstündeki 3 büyük kart."
          />
          <SectionHeadingEditor
            blockKey="about.history_intro"
            title="Tarihçe Giriş Metni"
            description="Tarihçe (zaman çizelgesinin) sol tarafındaki tanıtım metni. Zaman çizelgesi öğelerini 'Tarihçe' menüsünden ekleyin."
          />
          <AboutTransparencyEditor />
        </>
      )}

      {tab === "burs" && (
        <>
          <BurseHeroEditor />
          <div className="rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
            Burs sayfasındaki diğer içerikleri ilgili menülerden yönetebilirsiniz:
            <ul className="list-disc ml-5 mt-2 space-y-0.5">
              <li>Burs Programları</li>
              <li>İstenen Belgeler</li>
              <li>Burs Takvimi</li>
              <li>Sıkça Sorulanlar</li>
            </ul>
          </div>
        </>
      )}

      {tab === "burs_form" && <ApplicationFormEditor />}

      {tab === "donate" && (
        <>
          <DonateSidebarEditor />
          <div className="rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
            Bağış tutarları ve kullanım maddelerini ilgili menülerden yönetin:
            <ul className="list-disc ml-5 mt-2 space-y-0.5">
              <li>Bağış Tutarları</li>
              <li>Bağış Kullanımı</li>
            </ul>
            Banka bilgileri ve IBAN <strong>Site Ayarları</strong> bölümünden
            düzenlenir.
          </div>
        </>
      )}

      {tab === "auth" && <AuthUiTextEditor />}

      {tab === "common" && <CommonUiTextEditor />}

      {tab === "header" && <HeaderEditor />}

      {tab === "footer" && <FooterEditor />}
    </div>
  );
}
