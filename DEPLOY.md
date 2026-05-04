# Vercel'e Deploy Rehberi

Bu projeyi Vercel'e deploy etmek için **3 servis** gerekiyor:

1. **GitHub** (kod barınma) — zaten var: `ozlemnurazlioglu/Dernek-Sitesi`
2. **Uzak MySQL** — TiDB Cloud Serverless (5 GB ücretsiz)
3. **Dosya depolama** — Vercel Blob (5 GB ücretsiz, Vercel'in içinde)

Aşağıdaki adımları sırayla uygulayın.

---

## 1. TiDB Cloud — Uzak MySQL veritabanı oluşturma

> TiDB Cloud Serverless, MySQL ile uyumlu, ücretsiz tier'ı 5 GB depolama + 50M satır okuma içeriyor. Kart bilgisi istemiyor.

1. <https://tidbcloud.com> sitesine git → Google/GitHub ile kayıt ol.
2. **"Create Cluster"** → **"Serverless"** sekmesini seç.
3. Cluster Name: `dernek` (veya istediğin bir isim).
4. Region: kullanıcılarına en yakın olanı seç (TR için `Frankfurt eu-central-1` iyi).
5. **"Create"** — birkaç saniye sonra cluster hazır.
6. Cluster sayfasında **"Connect"** butonuna bas → **"Public Endpoint"** sekmesinden:
   - **Host**: `gateway01.eu-central-1.prod.aws.tidbcloud.com` (örnek)
   - **Port**: `4000`
   - **User**: `XXXXXXX.root` (otomatik üretilir)
   - **Password**: **"Generate Password"** ile yeni bir şifre oluştur ve **kopyala**
7. **"Try with SQL Editor"** kısmından `dernek` adında bir veritabanı oluştur:
   ```sql
   CREATE DATABASE dernek;
   ```
8. Bu dört bilgiyi birleştirip `DATABASE_URL` oluştur:
   ```
   mysql://USER:PASSWORD@HOST:4000/dernek
   ```
   Örnek:
   ```
   mysql://2x9fGA1qTM.root:o5K2Jp9wEbXh3@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/dernek
   ```

### 1.1. Şemayı ve tohumu (seed) yükle

Yerel makinede `.env.local` dosyana **bu DATABASE_URL'i geçici olarak yaz** ve şu komutları çalıştır:

```bash
# Tabloları oluştur
npm run db:push     # Drizzle ile şemayı uzak DB'ye uygular

# Demo verisini yükle (logo, menü, varsayılan içerikler vb.)
npm run db:seed
```

> ⚠️ Drizzle bazı durumlarda foreign key hataları verebilir. Hata alırsan TiDB SQL editörü üzerinden manuel olarak da yükleyebilirsin (ileride bir migration scripti yazılır).

Her iki komut da `OK` dönerse uzak veritabanın hazır.

---

## 2. Vercel projesini oluştur

1. <https://vercel.com> → mevcut hesabınla giriş yap.
2. **"Add New" → "Project"** → GitHub'tan **`Dernek-Sitesi`** reposunu import et.
3. Build settings olduğu gibi kalsın (Vercel Next.js'i otomatik tanır):
   - Framework Preset: **Next.js**
   - Build Command: `next build`
   - Output Directory: `.next`
4. **Environment Variables** bölümünde aşağıdakileri tek tek ekle:

   | Key                  | Value                                                                  | Environment        |
   | -------------------- | ---------------------------------------------------------------------- | ------------------ |
   | `DATABASE_URL`       | `mysql://...` (1. adımda oluşturduğun)                                 | Production, Preview, Development |
   | `SESSION_SECRET`     | 32+ karakter rastgele dizi (örn. `openssl rand -base64 48` çıktısı)    | Production, Preview, Development |
   | `DB_POOL_SIZE`       | `5` (opsiyonel)                                                        | Production         |

5. **Deploy** butonuna bas. İlk build 1-2 dakika sürer.

---

## 3. Vercel Blob (dosya yükleme) bağla

> Admin panelden yüklenen logolar, sponsor görselleri, üye fotoğrafları gibi
> dosyaların kalıcı kalması için gerekli. Vercel Blob 5 GB'a kadar ücretsiz.

1. Vercel projeni aç → üstte **"Storage"** sekmesine geç.
2. **"Create Database" → "Blob"** seç.
3. Adı: `dernek-uploads` → **"Create"**.
4. Açılan ekranda **"Connect Project"** → projeni seç → **"Connect"**.
   - Bu işlem `BLOB_READ_WRITE_TOKEN` env değişkenini otomatik olarak projene ekler.
5. **Deployments** sekmesinden son deploy'u **"Redeploy"** ile yeniden başlat (env değişikliklerinin yansıması için).

---

## 4. Test

1. Vercel'in verdiği URL'i (örn. `dernek-sitesi.vercel.app`) aç.
2. **`/giris`** sayfasından admin hesabıyla giriş yap.
   > Eğer admin yok ise SQL editöründen elle ekleyebilirsin veya `npm run db:seed` çalıştırdıysan demo admin hazır olabilir (artık varsayılan demo bilgileri kapalı, kendin oluşturmalısın).
3. **Admin → Sponsorlar** veya **Yönetim Kurulu** sayfalarından bir görsel yükle. Yüklenen dosyanın URL'i `https://*.public.blob.vercel-storage.com/...` ile başlamalı.
4. Sayfayı sertçe yenile (`Ctrl+Shift+R`) → görsel hâlâ duruyor olmalı.

---

## Bilinmesi gerekenler

### Dosya boyut limiti
- **Vercel Hobby tier**: HTTP isteklerinin gövdesi en fazla **4.5 MB**.
- Kodda 8 MB limiti var ama Hobby'de 4.5 MB üstü dosyalar 413 dönecek.
- 4.5 MB üstü dosya yükleme gerekiyorsa Vercel Pro'ya geçmek veya client-side Blob upload pattern'ine geçmek gerekir (ileride eklenebilir).

### Custom domain
- Vercel projesinde **Settings → Domains** üzerinden kendi alan adını bağlayabilirsin (`kumrulular.com` vb.). DNS A/CNAME yönlendirmesini Vercel kendi gösteriyor.

### Seed verilerini güncellemek
- Yerel `seed-content.ts` üzerinde değişiklik yaptıktan sonra `npm run db:seed` çalıştırıp uzak DB'ye yansıtabilirsin.
- ⚠️ `db:reset` komutu uzak DB'deki tüm verileri siler. Production'da çalıştırma!

### Sonraki deploy'lar
- `git push origin main` → Vercel otomatik build & deploy yapar.
- Pull request açınca Vercel her PR için "Preview" URL'i üretir.

---

## Sorun giderme

| Belirti | Olası neden | Çözüm |
| --- | --- | --- |
| Sayfa açılıyor ama 500 dönüyor | DATABASE_URL yanlış / DB ulaşılamıyor | Vercel logs'a bak, env'i tekrar kontrol et |
| `connect ETIMEDOUT` | TiDB'e SSL ile bağlanmıyor | `DATABASE_SSL=true` ekle (production'da otomatik açık) |
| Yüklenen görsel deploy sonrası kayboluyor | Blob bağlanmamış, fs'ye yazılmış | Storage → Blob bağlantısını kontrol et, redeploy |
| Cookie kalıcı değil | `SESSION_SECRET` her deploy'da değişiyor | Env'de sabit bir değere ata |
