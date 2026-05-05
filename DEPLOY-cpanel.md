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
> - Dosya yükleme: yerel disk; `public/uploads` → `public_html/uploads`
>   simlinki (bkz. §8)

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
4. **DB charset'ini utf8mb4 yap (KRİTİK — drizzle-kit push'tan önce!):**
   cPanel'in MariaDB'si yeni veritabanlarını varsayılan olarak `latin1`
   ile açar. Türkçe karakterler (`ş`, `ğ`, `ı`, `İ`) latin1'de
   gösterilemediği için INSERT sırasında MySQL onları kalıcı olarak
   `?` ile değiştirir. Bu yüzden tablolar oluşturulmadan ÖNCE veritabanı
   default'unu utf8mb4'e çek:

   ```bash
   mysql -u kumrulul_appuser -p'ŞİFRE' -e \
     "ALTER DATABASE kumrulul_dernek CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

   Bundan sonra `drizzle-kit push --force` (§4) otomatik olarak utf8mb4
   tabloları oluşturur. Tabloları yanlış charset'le oluşturduktan sonra
   düzeltmek için "Sorun giderme" bölümündeki tablo dönüştürme komutuna
   bak — ayrıca tüm seed verisinin yeniden çalıştırılması gerekir,
   çünkü `?` olarak yazılan karakterler veri kaybıdır.

5. Bağlantı stringini hazırla:

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

İki yol var; **lokal build → upload** (önerilen, hızlı) veya **sunucuda
build** (CloudLinux LVE limitleri yüzünden çoğunlukla `SIGABRT` ile düşer).

### A) Lokal build → cPanel'e .next yükle (ÖNERİLEN)

CloudLinux Application Starter paketinin EP/NPROC sınırı `next build`
sırasında Turbopack/Webpack worker thread'lerini öldürür. Bu yüzden
**lokal makinende** build alıp sadece çıktı dosyalarını yüklemek hem
hızlı hem güvenilir:

```bash
# 1. Yerel makine — build al
npm run build

# 2. .next'i sıkıştır (cache + dev hariç)
tar --exclude=".next/cache" --exclude=".next/dev" -czf next-build.tar.gz .next

# 3. cPanel File Manager → /home/kumrulul/dernek altına next-build.tar.gz'ı
#    yükle ("üzerine yaz" işaretli olsun)
```

Sonra cPanel Terminal'de:

```bash
source /home/kumrulul/nodevenv/dernek/22/bin/activate && cd /home/kumrulul/dernek

# Bağımlılıklar (sadece runtime için yetiyor, dev gerekmiyor)
npm ci --omit=dev

# Eski build'i temizle, yenisini aç
rm -rf .next
tar -xzf next-build.tar.gz
rm next-build.tar.gz

# (İlk kurulumda) DB şemasını ve seed verisini yükle — bunlar tsx
# gerektirdiğinden dev bağımlılıkları lazım; o zaman geçici olarak
# `npm ci --include=dev` koş, seed'le, sonra istersen `npm prune --omit=dev`.
DATABASE_URL="mysql://kumrulul_appuser:ŞİFRE@localhost:3306/kumrulul_dernek" \
  npx drizzle-kit push --force

DATABASE_URL="mysql://kumrulul_appuser:ŞİFRE@localhost:3306/kumrulul_dernek" \
  SESSION_SECRET="..." \
  npx tsx scripts/seed.ts
```

> **MariaDB ile JSON sütunu uyumu:** Bu host MariaDB kullanıyor (LiteSpeed
> + CloudLinux). MariaDB'de `JSON` tipi `LONGTEXT` alias'ıdır ve mysql2
> driver'ı string olarak döner. Uygulama `bootstrap/route.ts` içinde elle
> `JSON.parse` yapıyor, ek bir migration gerekmez.

### B) Sunucuda build (yedek yöntem)

```bash
source /home/kumrulul/nodevenv/dernek/22/bin/activate && cd /home/kumrulul/dernek
npm ci --include=dev
NODE_OPTIONS="--max-old-space-size=2048" npx next build --webpack
```

> Application Starter'da bu adımın `SIGABRT` ile çakılması yaygındır.
> Daha üst paket (Application Pro/Max) veya yerel build önerilir.

### C) cPanel UI yolu

Setup Node.js App → uygulama detay sayfasında:

- **Run NPM Install** butonu
- **Run JS Script** → script: `build`

> UI yolu DB migration'larını çalıştıramaz; bu kısım için Terminal şart.

---

## 5) Uygulamayı başlat

Setup Node.js App detayında **Restart** veya **Start App** butonuna bas.

`https://kumrulular.org` adresini aç → site açılmalı.

> **DİKKAT — LiteSpeed/LSNode worker davranışı:** Bu hostta `Restart`
> butonu (ya da `tmp/restart.txt` dokunma) bazen mevcut LSNode worker
> proseslerini düşürmeden config'i yeniler. Bu durumda eski `.next`
> bellekte kalır ve yeni build görünmez.
>
> Çözüm: cPanel Terminal'de eski worker'ları manuel kapat:
>
> ```bash
> pkill -TERM -u $USER -f 'lsnode:/home/'$USER'/dernek/' || true
> # ya da PID'leri tek tek:
> ps -ef | grep lsnode | grep -v grep
> kill -TERM <pid1> <pid2>
> ```
>
> Bir sonraki istek geldiğinde Passenger fresh worker spawn eder; yeni
> derleme aktif olur. Doğrulamak için:
>
> ```bash
> cat ~/dernek/.next/BUILD_ID
> curl -s 'http://kumrulular.org/' -o /dev/null -w '%{http_code}\n'
> ```

`public_html/.htaccess`'e Passenger satırlarını cPanel zaten yazar; ama
hosting sağlayıcısı varsayılan bir `index.html` (parking page) bırakmış
olabilir. Bu dosya Passenger'dan ÖNCE servis edilir ve uygulamanı
gizler. Karşılaştığında:

```bash
mv ~/public_html/index.html ~/public_html/.parking.html.bak
```

Hata logları için:

```bash
tail -n 200 ~/dernek/stderr.log
tail -n 200 ~/dernek/stdout.log
```

---

## 6) SSL — Let's Encrypt (ücretsiz)

Self-signed sertifika tarayıcıda "güvensiz" uyarısı verir. Ücretsiz Let's
Encrypt kur:

1. cPanel ana ekran → **Güvenlik → SSL/TLS Certificates → Wizard**.
2. "Issue a certificate" altında **DNS'i bu sunucuya gerçekten resolve olan**
   alan adlarını seç. `kumrulular.org` için tipik kombinasyon:
   - `kumrulular.org`
   - `mail.kumrulular.org`
   - `webmail.kumrulular.org`
   - `cpanel.kumrulular.org`
   - `autodiscover.kumrulular.org`
3. **Devam Et** → ürün seçiminde **Let's Encrypt Certificate**.
4. İlk denemede `webdisk`, `cpcontacts`, `cpcalendars` gibi DNS kaydı
   olmayan subdomain'ler "Domain Control Validation failed" ile patlarsa,
   "Remove the domains that failed" linkine tıkla; kalan domainler için
   sertifika otomatik düzenlenir.
5. Sertifika 30-60 saniye sonra aktif olur, her 90 günde cPanel otomatik
   yeniler.

### HTTP → HTTPS otomatik yönlendirme

cPanel ana ekran → **Domains** (Alan Adları) → tablonun "Force HTTPS
Redirect" sütunundaki toggle'ı **Açık** konumuna getir. Doğrulama:

```bash
curl -sI http://kumrulular.org/
# HTTP/1.1 301 Moved Permanently
# location: https://kumrulular.org/
```

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

### Dosya yükleme — `public/uploads` ve `public_html/uploads` simlinki (KRİTİK)

Next.js production'da (`next start` / Passenger) `public/` klasörünü
**build sırasında** tarar ve dahili manifest'e sabitler. Build'den sonra
`public/uploads/` altına yazılan yeni dosyalar Next.js tarafından
**404** olarak döner. Aynı zamanda cPanel'in `.htaccess`'inde
`PassengerBaseURI "/"` tanımı her isteği Passenger'a iletir, Next.js bu
isteği yakalayıp 404 prerender döner.

**Çözüm:** `~/dernek/public/uploads`'ı `~/public_html/uploads`'a
sembolik link yap. LiteSpeed `public_html/` altında gerçek dosya
bulduğunda Passenger'a hiç sokmadan dosyayı doğrudan servis eder
(image/png, server: LiteSpeed, max-age=604800).

Kurulum (cPanel Terminal — bir kerelik):

```bash
# Eğer mevcut yüklemeler varsa yeni konuma taşı
mkdir -p ~/public_html/uploads
mv ~/dernek/public/uploads/* ~/public_html/uploads/ 2>/dev/null
rmdir ~/dernek/public/uploads 2>/dev/null

# public/uploads -> public_html/uploads simlinki
ln -s /home/kumrulul/public_html/uploads /home/kumrulul/dernek/public/uploads

# Doğrula
ls -la ~/dernek/public/ | grep uploads
# uploads -> /home/kumrulul/public_html/uploads

# Yeni bir dosya yükle ve curl ile test et:
curl -sI https://kumrulular.org/uploads/<yıl>/<ay>/<dosya>.png | head -5
# HTTP/2 200, content-type: image/png, server: LiteSpeed (Next.js header'ı YOK)
```

> Bu simlink **deploy'dan deploy'a kalır** — `git pull` `public/uploads`
> içeriğine dokunmaz (`.gitignore`'da). `npm ci` ve `next build` lokal
> tarafta yapılırsa server'daki simlink hiç bozulmaz. Yeni bir cPanel
> hesabına taşırken yukarıdaki komutları tekrar çalıştır.

### Dosya yükleme — yedekleme

Tüm yüklemeler artık `~/public_html/uploads/` altında. cPanel'in
**Yedekleme** aracını kullan ya da cron ile:

```bash
0 3 * * * tar -czf /home/kumrulul/backups/uploads-$(date +\%F).tar.gz /home/kumrulul/public_html/uploads
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
| `next build` "SIGABRT" / "EAGAIN" | CloudLinux EP/NPROC limiti | Lokal build → upload yöntemini kullan (§4A) |
| Yüklenen görsel sonra kayboluyor | `npm ci` build'i public/'i temizledi mi | `public/uploads` klasörünün izinleri 755 olmalı, içeriği silinmemeli |
| Yeni yüklenen görsel 404 dönüyor (`x-nextjs-cache: HIT`, `x-powered-by: Next.js`) | Next.js `public/`'i build sırasında manifest'e sabitler; runtime'da eklenen dosyaları görmez | `~/dernek/public/uploads` → `~/public_html/uploads` simlinki kur (bkz. §8) |
| Sayfa açılıyor ama statik dosyalar 404 | Passenger Next'in build çıktısını göremiyor | Repo kökünde `.next/` klasörü oluştu mu (build başarılı mı) kontrol et, sonra Restart |
| Site varsayılan parking page gösteriyor | `public_html/index.html` Passenger'dan önce servis ediliyor | `mv ~/public_html/index.html ~/public_html/.parking.html.bak` |
| Restart sonrası yine eski sürüm görünüyor | LSNode worker'lar Stop/Start butonuyla düşmemiş | Manuel `kill -TERM <pid>` (bkz. §5 not'u) |
| `cfg.ctaButton.visible` benzeri "undefined" hatası | MariaDB'nin JSON tipi LONGTEXT alias'ı, mysql2 string döner | `bootstrap/route.ts` zaten elle parse ediyor; build'i güncelle |
| Türkçe karakterler `?` görünüyor (Şenliği → ?enli?i, düğün → dü?ün, ama ç/ü/ö doğru) | Tablolar latin1 charset ile oluşturulmuş; ş/ğ/ı/İ gibi latin1'de olmayan karakterler INSERT sırasında `?` ile değişti — veri kaybı | Tabloları utf8mb4'e çevir + seed'i yeniden çalıştır (bkz. aşağıdaki "Charset onarımı" başlığı) |

### Charset onarımı (Türkçe karakterler `?` olduğunda)

Bu, §1 adım 4'ü atlanmış kurulumda olur. Düzeltme **veri kaybı yaratır** — `?` olan tüm Türkçe metinleri seed yeniden yazar; kullanıcı tarafından eklenmiş Türkçe içerik (örn. galeri başlıkları) kaybolur. Önce kullanıcı verisini yedekle:

```bash
DBP='ŞİFRE'

# 1) Korunması gereken kullanıcı verilerini yedekle (örn. photos)
mkdir -p ~/charset-fix && cd ~/charset-fix
mysqldump -u kumrulul_appuser -p"$DBP" --single-transaction --no-create-info kumrulul_dernek photos > photos-data.sql

# 2) Tüm tabloları utf8mb4'e dönüştür
mysql -u kumrulul_appuser -p"$DBP" -Nse "SELECT CONCAT('ALTER TABLE \`', table_name, '\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;') FROM information_schema.tables WHERE table_schema='kumrulul_dernek' AND table_type='BASE TABLE'" > convert.sql
{ echo 'SET FOREIGN_KEY_CHECKS=0;'; cat convert.sql; echo 'SET FOREIGN_KEY_CHECKS=1;'; } | mysql -u kumrulul_appuser -p"$DBP" kumrulul_dernek

# 3) DB default'unu da kalıcı olarak utf8mb4 yap (yeni tablolar için)
mysql -u kumrulul_appuser -p"$DBP" -e "ALTER DATABASE kumrulul_dernek CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4) Seed'i yeniden çalıştır (tsx alt-süreç açtığı için lsnode worker'larını
#    önce öldürmen gerekebilir; bkz. §5'teki kill -TERM notu)
source /home/kumrulul/nodevenv/dernek/22/bin/activate && cd ~/dernek
DATABASE_URL="mysql://kumrulul_appuser:$DBP@localhost:3306/kumrulul_dernek" \
  SESSION_SECRET="..." \
  node_modules/.bin/tsx scripts/seed.ts

# 5) Yedeklenen kullanıcı verisini geri yükle
mysql -u kumrulul_appuser -p"$DBP" kumrulul_dernek -e "DELETE FROM photos;"
mysql -u kumrulul_appuser -p"$DBP" kumrulul_dernek < ~/charset-fix/photos-data.sql

# 6) Doğrula — HEX değerleri C49F (ğ), C59E (Ş), C5B1 (ı) gibi olmalı
mysql -u kumrulul_appuser -p"$DBP" --default-character-set=utf8mb4 kumrulul_dernek \
  -e "SELECT title, HEX(title) FROM announcements LIMIT 2\G"
```

> **Not:** mysql client'ında `--default-character-set=utf8mb4` bayrağını
> kullanmazsan, doğru depolanmış utf8mb4 verisi terminal output'unda
> "kareler" olarak görünebilir — bu sadece görüntü, veri sağlamdır.
> Doğrulamak için tarayıcıda siteyi aç veya `HEX()` ile byte'lara bak.
