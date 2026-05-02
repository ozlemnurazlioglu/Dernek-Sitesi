# Umut Eğitim ve Dayanışma Derneği — Web Sitesi & Yönetim Paneli

Modern, hızlı ve müşteriye sunulabilir nitelikte bir **dernek web sitesi**, **üye paneli**, **çevrimiçi burs başvuru sistemi** ve **yönetim paneli (admin)** demosu.

> Bu sürüm **demo** olarak hazırlanmıştır: tüm veriler tarayıcı `localStorage`'ında tutulur, evrak yüklemeleri görsel akışı simüle eder. Üretime geçişte `src/lib/store.tsx` veri katmanı Supabase / Postgres / Prisma ile değiştirilebilir.

---

## Özellikler

### Halka açık site
- **Ana sayfa**: Hero, istatistikler, burs CTA, son haberler, yaklaşan etkinlikler, bursiyer yorumları, bağış çağrısı.
- **Hakkımızda**: Vizyon-misyon, yönetim kurulu, tarihçe (zaman çizelgesi), yıllık faaliyet raporları.
- **Haberler**: Kategorili filtre, arama, detay sayfası.
- **Etkinlikler**: Kontenjan/kayıt durumlu kartlar.
- **Bağış**: Tutar seçimi, IBAN bilgileri, kopyala butonu.
- **İletişim**: Form, harita, iletişim bilgileri.
- **Üye Girişi / Kayıt**: Üye paneline yönlendirme.

### Burs başvuru sistemi
- **Çok adımlı (5 adım) form**:
  1. Kişisel Bilgiler (TC, doğum tarihi, adres vb.)
  2. Eğitim Bilgileri (okul, sınıf, GANO)
  3. Aile Bilgileri (gelir, kardeş sayısı, önceki burs)
  4. **Belge yükleme** (6 farklı belge için ayrı drop-zone)
  5. IBAN + motivasyon mektubu
- Adım göstergesi, alan-bazlı doğrulama, ilerleme animasyonları, başvuru onay ekranı.

### Üye paneli (`/hesabim`)
- Profil bilgileri, üyelik geçmişi.
- Burs başvurularının durum takibi (Beklemede / İnceleniyor / Onaylandı / Reddedildi).
- Komisyon notu ve puan görüntüleme.

### Yönetim paneli (`/admin`)
- **Dashboard**: KPI kartları, aylık başvuru grafiği, hızlı özet, son başvurular.
- **Burs Başvuruları**: filtre, arama, detay sayfası, onay/red, komisyon puanı & notu, evrak görüntüleme.
- **Üyeler**: filtre/arama, üye-başına başvuru sayısı.
- **Haberler**: tam CRUD (modal form, kategori, kapak görseli, slug otomasyonu).
- **Etkinlikler**: tam CRUD.
- **Mesajlar**: Gmail-tarzı 2-paneli görünüm, okundu işaretle, sil, yanıtla.
- **Demo verilerini sıfırla** butonu.

---

## Demo hesapları

| Rol      | E-posta                        | Şifre      |
|----------|--------------------------------|------------|
| Yönetici | `admin@umutdernegi.org`        | `admin123` |
| Üye      | `ayse@example.com`             | `uye123`   |
| Üye      | `mehmet@example.com`           | `uye123`   |
| Üye      | `zeynep@example.com`           | `uye123`   |

---

## Teknoloji

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (özel marka teması — lacivert + altın aksan)
- **lucide-react** (icon kütüphanesi)
- **clsx** (sınıf birleştirme)
- Tüm UI komponentleri (Button, Input, Card, Dialog, Badge, Toast vb.) sıfırdan yazıldı (shadcn-tarzı).

---

## Çalıştırma

```bash
npm install
npm run dev
```

`http://localhost:3000` adresinden açın.

```bash
npm run build   # üretim derlemesi
npm run start   # üretim sunucusu
```

---

## Yayına alma — Vercel

1. GitHub'a yükleyin.
2. [vercel.com/new](https://vercel.com/new) → repoyu seçin → **Deploy** deyin.
3. Hiçbir env değişkeni gerekmez. Demo doğrudan çalışır.

---

## Klasör yapısı

```
src/
├── app/
│   ├── (site)/            # Halka açık sayfalar (header + footer'lı)
│   │   ├── page.tsx       # Ana sayfa
│   │   ├── hakkimizda/
│   │   ├── haberler/
│   │   ├── etkinlikler/
│   │   ├── burs/
│   │   │   └── basvuru/   # Çok adımlı başvuru
│   │   ├── bagis/
│   │   ├── iletisim/
│   │   └── hesabim/       # Üye paneli
│   ├── (auth)/            # Giriş / kayıt (özel layout)
│   └── admin/             # Korumalı admin paneli
├── components/
│   ├── ui/                # Düşük seviye komponentler
│   ├── site/              # Header, Footer, PageHeader
│   ├── admin/             # Sidebar, Topbar
│   ├── brand/             # Logo
│   └── burs/              # Çok adımlı başvuru formu
└── lib/
    ├── store.tsx          # State (localStorage) — Supabase/DB ile değiştirilebilir
    ├── seed-data.ts       # Demo verileri
    ├── site.ts            # Dernek bilgileri (ad, IBAN, sosyal medya...)
    ├── types.ts           # TypeScript tipleri
    └── utils.ts           # Yardımcı fonksiyonlar
```

---

## Üretime geçiş için sonraki adımlar

1. **Veritabanı**: `src/lib/store.tsx` içindeki tüm `localStorage` çağrılarını Supabase / Postgres / Prisma ile değiştirin.
2. **Auth**: Supabase Auth, NextAuth veya Clerk önerilir. `login/register/logout` fonksiyonlarını gerçek auth sağlayıcısıyla bağlayın.
3. **Dosya yükleme**: `application-form.tsx` içindeki `handleFile` fonksiyonunu Supabase Storage / S3 / Cloudflare R2 ile değiştirin.
4. **E-posta bildirimleri**: Başvuru onay/red durumunda Resend, SendGrid veya Postmark üzerinden e-posta gönderin.
5. **Online ödeme**: `/bagis` sayfasındaki butona iyzico / PayTR / Stripe entegrasyonu ekleyin.

---

## Notlar

- Site dili **Türkçe**.
- Mobilde tam responsive: tüm sayfalar sm/md/lg breakpoint'lerinde test edilmiştir.
- Erişilebilirlik: semantic HTML, aria-label kullanımı, focus-visible ringleri.
- SEO: her sayfada metadata, Open Graph ile uyumlu yapı.
