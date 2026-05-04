# Umut Eğitim ve Dayanışma Derneği — Web Sitesi & Yönetim Paneli

Modern, hızlı ve müşteriye sunulabilir nitelikte bir **dernek web sitesi**, **üye paneli**, **çevrimiçi burs başvuru sistemi** ve **yönetim paneli (admin)** demosu.

> **Veri katmanı:** Tüm veriler **MySQL**'de saklanır, şifreler **bcrypt** ile hash'lenir, oturum HttpOnly cookie ile yönetilir. Drizzle ORM kullanılır. Kurulum: bkz. [`MYSQL-KURULUM.md`](./MYSQL-KURULUM.md). Evrak yüklemeleri hâlâ görsel akışı simüle eder (yalnızca dosya adı + boyut DB'de tutulur).

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
- **MySQL 8** + **Drizzle ORM** (TypeScript-first, type-safe sorgular)
- **bcryptjs** (şifre hash'leme) + HttpOnly cookie tabanlı oturum
- **lucide-react** (icon kütüphanesi)
- **clsx** (sınıf birleştirme)
- Tüm UI komponentleri (Button, Input, Card, Dialog, Badge, Toast vb.) sıfırdan yazıldı (shadcn-tarzı).

---

## Çalıştırma

**Ön koşul:** MySQL çalışıyor olmalı. Detaylı adımlar için [`MYSQL-KURULUM.md`](./MYSQL-KURULUM.md).

```bash
# 1. Bağımlılıkları kur
npm install

# 2. .env.local oluştur (örnekten kopyala, SESSION_SECRET'i değiştir)
cp .env.local.example .env.local

# 3. Tabloları oluştur + demo verilerini yükle
npm run db:setup

# 4. Geliştirme sunucusu
npm run dev
```

`http://localhost:3000` adresinden açın.

```bash
npm run build   # üretim derlemesi
npm run start   # üretim sunucusu
```

### Veritabanı komutları

| Komut                  | Açıklama                                              |
| ---------------------- | ----------------------------------------------------- |
| `npm run db:push`      | Şemayı MySQL'e uygula                                 |
| `npm run db:seed`      | Demo verilerini yükle (var olanları siler)            |
| `npm run db:reset`     | Tüm tabloları boşalt                                  |
| `npm run db:generate`  | Şema değişikliği için yeni migration dosyası üret    |
| `npm run db:setup`     | `db:push` + `db:seed` (ilk kurulum için kısayol)     |

---

## Yayına alma — Vercel

1. GitHub'a yükleyin.
2. Yönetilen bir MySQL servisi alın (PlanetScale, Aiven, Railway, AWS RDS vs.) ve veritabanı oluşturun.
3. [vercel.com/new](https://vercel.com/new) → repoyu seçin.
4. **Environment Variables** kısmına şunları girin:
   - `DATABASE_URL=mysql://kullanici:sifre@host:port/dernek`
   - `SESSION_SECRET=...` (güçlü, rastgele bir string)
5. **Deploy**.
6. İlk deploy'dan sonra yerel makinenizden veritabanına `npm run db:push && npm run db:seed` ile şemayı kurun. (Veya bir kerelik `vercel env pull` ile env'i çekip aynı komutları çalıştırın.)

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
    ├── store.tsx          # Client state — REST API'ye fetch eder, optimistik günceller
    ├── auth.ts            # bcrypt + cookie tabanlı oturum (sunucu)
    ├── db/
    │   ├── index.ts       # MySQL connection pool + Drizzle instance
    │   ├── schema.ts      # 7 tablonun Drizzle şeması
    │   └── mappers.ts     # DB satırı → TypeScript tipi dönüştürücüler
    ├── seed-data.ts       # Demo verileri (script ve reset endpoint'i kullanır)
    ├── site.ts            # Dernek bilgileri (ad, IBAN, sosyal medya...)
    ├── types.ts           # TypeScript tipleri
    └── utils.ts           # Yardımcı fonksiyonlar

src/app/api/                # REST endpoints
├── bootstrap/route.ts      # GET — tüm veri (sayfa açılışında)
├── auth/{login,register,logout,me}/route.ts
├── applications/route.ts + [id]/route.ts
├── news/route.ts + [id]/route.ts
├── events/route.ts + [id]/route.ts
├── messages/route.ts + [id]/route.ts
└── admin/reset/route.ts

drizzle/                    # Otomatik üretilmiş SQL migration'lar
scripts/
├── seed.ts                 # tsx ile çalışır — demo verisini yükler
└── reset.ts                # tüm tabloları boşaltır
```

---

## Üretime geçiş için sonraki adımlar

1. ~~**Veritabanı**~~ — Tamam ✓ MySQL + Drizzle ORM ile bağlandı.
2. ~~**Auth**~~ — Tamam ✓ bcrypt hash + HttpOnly cookie session. Daha gelişmiş ihtiyaçlar (2FA, sosyal giriş) için NextAuth/Clerk eklenebilir.
3. **Dosya yükleme**: `application-form.tsx` içindeki `handleFile` fonksiyonu hâlâ simülasyon. Üretim için S3 / Cloudflare R2 / Vercel Blob entegre edilmeli; gerçek dosya `application_documents.file_name` yerine bir URL/nesne anahtarı tutulmalı.
4. **E-posta bildirimleri**: Başvuru onay/red durumunda Resend, SendGrid veya Postmark üzerinden e-posta gönderin (`/api/applications/[id]` PATCH'inde tetikleyebilirsiniz).
5. **Online ödeme**: `/bagis` sayfasındaki butona iyzico / PayTR / Stripe entegrasyonu ekleyin.
6. **Rate limiting**: Login ve kayıt endpoint'lerine bruteforce'a karşı rate limit (örn. Upstash Ratelimit) ekleyin.

---

## Notlar

- Site dili **Türkçe**.
- Mobilde tam responsive: tüm sayfalar sm/md/lg breakpoint'lerinde test edilmiştir.
- Erişilebilirlik: semantic HTML, aria-label kullanımı, focus-visible ringleri.
- SEO: her sayfada metadata, Open Graph ile uyumlu yapı.
