# cPanel'e Deploy Rehberi (hosting.com.tr — Application Starter)

Bu doküman projeyi **hosting.com.tr Application Starter** paketinde (cPanel +
Phusion Passenger + LiteSpeed) yayınlamak için adım adım rehberdir. Vercel
deploy'u için `DEPLOY.md` dosyasına bakın.

> **Hedef ortam**
>
> - Birincil domain: `kumrulular.org`
> - cPanel kullanıcı adı: `kumrulul`
> - Home dizini: `/home/kumrulul`
> - Node.js: 22.x (cPanel "Setup Node.js App" üzerinden)
> - Veritabanı: cPanel'in kendi MySQL'i (localhost)
> - Dosya yükleme: yerel disk (`public/uploads/`)

---

## 0) Gereksinimler

- GitHub'da kodun güncel olduğundan emin ol — cPanel repoyu Git ile çekecek.
- `.env.local` cPanel sunucusuna gitmeyecek; env değişkenleri "Setup Node.js
  App" arayüzünden gireceğiz.
- Application Starter paketinin **3 GB RAM** sınırı var. `next build` 1-2 GB
  arası kullanır; başka uygulama çalıştırma.

---

## 1) MySQL veritabanı oluştur

cPanel ana ekranı → **Veri tabanları → Manage My Databases** (veya `MySQL®
Databases`).

1. **Yeni Veritabanı Oluştur:**
   - Adı: `dernek` → cPanel otomatik prefix ekler → tam ad: `kumrulul_dernek`
2. **Yeni Kullanıcı Oluştur:**
   - Kullanıcı: `appuser` → tam ad: `kumrulul_appuser`
   - Şifre: güçlü bir şifre üret (Password Generator) ve **kopyala**
3. **Kullanıcıyı Veritabanına Ekle:**
   - Kullanıcı: `kumrulul_appuser`
   - Veritabanı: `kumrulul_dernek`
   - Yetki: **ALL PRIVILEGES** ✅
4. Bağlantı stringini hazırla:

   ```
   mysql://kumrulul_appuser:ŞİFRE@localhost:3306/kumrulul_dernek
   ```

   > Şifre içinde `@`, `:`, `#` gibi özel karakter varsa URL-encode et
   > (`%40`, `%3A`, `%23`). Bu yüzden Password Generator çıktısının yalın
   > harf-rakam olanını seç.

---

## 2) GitHub reposunu cPanel'e klonla

cPanel ana ekranı → **Dosyalar → Git™ Version Control**.

1. **Create** butonu.
2. Form:
   - **Clone URL:** `https://github.com/ozlemnurazlioglu/Dernek-Sitesi.git`
     - Repo private ise GitHub Personal Access Token (PAT) kullan:
       `https://USERNAME:PAT@github.com/ozlemnurazlioglu/Dernek-Sitesi.git`
   - **Repository Path:** `/home/kumrulul/dernek` (ÖNEMLİ: `public_html`
     altına klonlama, ayrı klasör olsun)
   - **Repository Name:** `dernek`
   - **Branch:** `main`
3. **Create**.

Klonlanma 10-30 saniye sürer. Bittiğinde Git sayfasında repoyu görürsün.

> **Sonraki güncellemelerde:** Aynı sayfada **Manage → Pull or Deploy →
> "Update from Remote"** ile en son commit'leri çekebilirsin.

---

## 3) Setup Node.js App — uygulamayı kur

cPanel ana ekranı → **Yazılım → Setup Node.js App** → **Create application**.

| Alan                       | Değer                                                  |
| -------------------------- | ------------------------------------------------------ |
| Node.js version            | **22.22.0** (en yeni)                                  |
| Application mode           | **Production**                                         |
| Application root           | `dernek` (otomatik `/home/kumrulul/dernek` olur)       |
| Application URL            | `kumrulular.org` — alt path bırakma (yani `/` kalsın)  |
| Application startup file   | `app.js`                                               |

**Environment variables — şu üçünü ekle:**

| Key                  | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`       | `mysql://kumrulul_appuser:ŞİFRE@localhost:3306/kumrulul_dernek`        |
| `DATABASE_SSL`       | `false`                                                                |
| `SESSION_SECRET`     | 48+ karakter rastgele dizi (örn. `openssl rand -base64 48`)            |

> Yerel makinende SESSION_SECRET üretmek için:
>
> ```bash
> openssl rand -base64 48
> ```
>
> ya da Node ile:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
> ```

**Create** → cPanel sanal Node ortamı kurar (~30 saniye).

---

## 4) Bağımlılıkları yükle ve build al

İki yol var; **terminal** (önerilen) veya **cPanel UI**.

### A) Terminal yolu (önerilen)

cPanel ana ekran → **Gelişmiş → Terminal**.

```bash
# 1. Sanal Node ortamına geç (cPanel uygulama oluşturduğunda gösterir;
#    "Enter to the virtual environment" satırını kopyala-yapıştır)
source /home/kumrulul/nodevenv/dernek/22/bin/activate && cd /home/kumrulul/dernek

# 2. Bağımlılıkları yükle (production değil dev'de bağımlılıklar build için lazım)
npm ci --include=dev

# 3. Build
npm run build

# 4. (İlk kurulumda) DB şemasını ve seed verisini yükle
DATABASE_URL="mysql://kumrulul_appuser:ŞİFRE@localhost:3306/kumrulul_dernek" \
  npx drizzle-kit push --force

DATABASE_URL="mysql://kumrulul_appuser:ŞİFRE@localhost:3306/kumrulul_dernek" \
  SESSION_SECRET="..." \
  npx tsx scripts/seed.ts
```

### B) cPanel UI yolu

Setup Node.js App → uygulama detay sayfasında:

- **Run NPM Install** butonu
- **Run JS Script** → script: `build` (package.json'daki "build" scriptini
  çalıştırır)

> UI yolu DB migration'larını çalıştıramaz; bu kısım için Terminal şart.

---

## 5) Uygulamayı başlat

Setup Node.js App detayında **Restart** veya **Start App** butonuna bas.

`https://kumrulular.org` adresini aç → site açılmalı.

Hata varsa:

```bash
tail -n 200 ~/dernek/stderr.log
tail -n 200 ~/dernek/stdout.log
```

---

## 6) SSL — Let's Encrypt (ücretsiz)

Self-signed sertifika tarayıcıda "güvensiz" uyarısı verir. Ücretsiz Let's
Encrypt kur:

1. cPanel ana ekran → **Güvenlik → SSL/TLS Certificates**.
2. **Issue a New Certificate** → `kumrulular.org` ve `www.kumrulular.org`'u
   seç.
3. Issue → 30-60 saniye sonra hazır.
4. Otomatik yenilenir; her 90 günde bir cPanel kendisi yeniler.

---

## 7) Sonraki deploy'lar

Kodu güncellediğinde:

1. Yerel'de değişiklikleri commit'le ve `git push origin main`.
2. cPanel → **Git Version Control → Manage → Pull or Deploy → "Update from
   Remote"**.
3. cPanel Terminal'de:

   ```bash
   source /home/kumrulul/nodevenv/dernek/22/bin/activate && cd /home/kumrulul/dernek
   npm ci --include=dev
   npm run build
   ```

4. Setup Node.js App → **Restart**.

> Otomatikleştirmek istersen `.cpanel.yml` ekleyebiliriz; o zaman "Update
> from Remote" sonrası npm install + build + restart kendiliğinden yapılır.

---

## 8) Bilinmesi gerekenler

### Dosya yükleme — kalıcılık

`public/uploads/` cPanel'in disk alanına yazılır. Git ile sürüm kontrol
ALTINDA DEĞİL (`.gitignore`'da). Backup için cPanel'in **Yedekleme**
aracını kullan ya da `cron` ile günlük tar al:

```bash
0 3 * * * tar -czf /home/kumrulul/backups/uploads-$(date +\%F).tar.gz /home/kumrulul/dernek/public/uploads
```

### RAM kullanımı

3 GB RAM yeterli ama `npm run build` esnasında geçici olarak ~1.5 GB
ister. Build sırasında siteyi durdurmak gerekmiyor — Passenger eski
sürümle çalışmaya devam eder.

### Phusion Passenger sınırlamaları

- WebSocket desteği var ama bu projede kullanılmıyor.
- Streaming response (Next.js RSC streaming) çoğunlukla sorunsuz çalışır.
  Sorun olursa proxy buffering kapatmak için `.htaccess`'e:

  ```
  PassengerBufferResponse off
  ```

### Vercel'e ne olacak?

Sen "ikisi de açık kalsın" dedin. Vercel mevcut deploy'u durmadan çalışır.
DNS'i kumrulular.org'a `77.245.159.39` (cPanel shared IP) işaret edecek
şekilde güncellemen gerekir; o ana kadar Vercel preview URL'i veya
Vercel'e bağlı domain çalışmaya devam eder.

---

## Sorun giderme

| Belirti | Olası neden | Çözüm |
| --- | --- | --- |
| 503 / "Application failed to start" | startup file bulunamadı | `app.js` dosyası repo kökünde mi kontrol et |
| `Cannot find module 'next'` | `npm ci` yapılmadı | Terminal'de bağımlılıkları yükle |
| 500 + DB hatası | DATABASE_URL yanlış | env'de şifre URL-encoded mi, kullanıcının yetkisi var mı |
| `next build` "out of memory" | RAM bitti | `NODE_OPTIONS=--max-old-space-size=2048 npm run build` |
| Yüklenen görsel sonra kayboluyor | `npm ci` build'i public/'i temizledi mi | `public/uploads` klasörünün izinleri 755 olmalı, içeriği silinmemeli |
| Sayfa açılıyor ama statik dosyalar 404 | Passenger Next'in build çıktısını göremiyor | Repo kökünde `.next/` klasörü oluştu mu (build başarılı mı) kontrol et, sonra Restart |
