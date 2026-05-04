# MySQL Kurulum Kılavuzu

Site artık tüm verilerini MySQL'de tutuyor. localStorage tamamen devre dışı; veriler sunucu tarafında, şifreler ise **bcrypt** ile hash'lenmiş şekilde saklanıyor.

## Gereksinimler

- Node.js 18.18+ (zaten gerekiyordu)
- MySQL 8.x veya MariaDB 10.5+
- En basit yol: **XAMPP** ([https://www.apachefriends.org/](https://www.apachefriends.org/))

---

## Adım 1 — XAMPP'i kurun ve MySQL'i başlatın

1. XAMPP'i indirip kurun.
2. **XAMPP Control Panel**'i açın → **MySQL** satırındaki **Start** butonuna basın.
3. Yeşil "Running" yazısı görünmeli. Port: **3306**, kullanıcı: **root**, şifre: **(boş)**.

> Apache'i başlatmaya gerek yok; biz sadece MySQL'i kullanıyoruz.

---

## Adım 2 — Veritabanını oluşturun

XAMPP Control Panel'de MySQL satırının yanındaki **Admin** butonuna basın → tarayıcıda **phpMyAdmin** açılır.

Sol üstteki **Yeni** (New) bağlantısına tıklayın → veritabanı adı olarak `dernek` yazın → **Karşılaştırma** olarak `utf8mb4_unicode_ci` seçin → **Oluştur**.

Alternatif: Komut satırından

```bash
mysql -u root -e "CREATE DATABASE dernek CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## Adım 3 — `.env.local` dosyasını oluşturun

Proje kök dizininde `.env.local.example`'ı kopyalayıp `.env.local` olarak kaydedin.

XAMPP varsayılanları zaten doldurulu:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=dernek

SESSION_SECRET=lutfen-en-az-32-karakterlik-rastgele-bir-string-uretin
```

> **Önemli:** `SESSION_SECRET` değerini değiştirin. PowerShell'de hızlı üretim:
>
> ```powershell
> [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
> ```

---

## Adım 4 — Tabloları oluşturun ve demo verilerini yükleyin

```bash
npm install
npm run db:setup
```

Bu komut iki şeyi sırayla yapar:

1. `npm run db:push` — Drizzle ORM ile şemayı MySQL'e gönderir (7 tablo oluşur).
2. `npm run db:seed` — Demo kullanıcılar, haberler, etkinlikler, başvurular ve mesajları ekler. Şifreler bcrypt ile hash'lenir.

Çıktıda şunu görmelisiniz:

```
✓ 4 kullanıcı eklendi
✓ 4 haber eklendi
✓ 3 etkinlik eklendi
✓ 3 başvuru eklendi
✓ 2 mesaj eklendi
✓ Seed tamamlandı.
```

---

## Adım 5 — Geliştirme sunucusunu çalıştırın

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresine gidin.

### Demo girişi

| Rol      | E-posta                  | Şifre      |
| -------- | ------------------------ | ---------- |
| Yönetici | `admin@umutdernegi.org`  | `admin123` |
| Üye      | `ayse@example.com`       | `uye123`   |
| Üye      | `mehmet@example.com`     | `uye123`   |
| Üye      | `zeynep@example.com`     | `uye123`   |

---

## Faydalı komutlar

| Komut                | Açıklama                                                |
| -------------------- | ------------------------------------------------------- |
| `npm run db:push`    | Şema değişikliklerini MySQL'e gönder                    |
| `npm run db:seed`    | Demo verilerini sıfırla & yeniden ekle                  |
| `npm run db:reset`   | Tüm tabloları boşalt (seed çalıştırmaz)                 |
| `npm run db:generate`| Şema değişikliği için SQL migration dosyası üret        |

Admin panelindeki **"Demo verilerini sıfırla"** butonu çalışmaya devam ediyor — `/api/admin/reset` endpoint'ine istek atıp DB'yi yeniden seed eder.

---

## Sorun giderme

### `ECONNREFUSED 127.0.0.1:3306`
MySQL çalışmıyor. XAMPP Control Panel'den **Start** butonuna basın.

### `ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'`
XAMPP'de root şifresi varsayılan olarak boştur. MySQL'e şifre koyduysanız `.env.local` içindeki `DB_PASSWORD` değerini güncelleyin.

### `Unknown database 'dernek'`
Adım 2'yi atlamışsınız. phpMyAdmin'den `dernek` adında bir veritabanı oluşturun.

### Şema değişikliği yaptınız (yeni tablo, kolon vs.)
1. `src/lib/db/schema.ts` dosyasını düzenleyin.
2. `npm run db:generate` ile yeni migration dosyası üretin.
3. `npm run db:push` ile MySQL'e uygulayın.

### Tabloları sıfırdan kurmak istiyorum
```bash
npm run db:reset    # tüm verileri siler, tablolar kalır
npm run db:seed     # demo verilerini geri yükler
```

Tabloları silmek isterseniz: phpMyAdmin'de `dernek` veritabanı → tüm tabloları seçip **Drop**, sonra `npm run db:setup`.

---

## Üretime alma

- Hosting'inizde MySQL veritabanı oluşturun, `.env`'e bağlantı bilgilerini girin.
- `SESSION_SECRET` mutlaka güçlü ve gizli bir değer olmalı (asla repo'ya commit'lenmeyin).
- Cookie'ler HTTPS üzerinde otomatik olarak `Secure` flag'iyle gönderilir (`NODE_ENV=production` iken).
- Vercel kullanıyorsanız: PlanetScale, Aiven, Railway veya AWS RDS gibi yönetilen MySQL servisleri önerilir.
