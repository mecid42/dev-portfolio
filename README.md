# 🚀 Dev Portfolio - Full Stack

Kişisel portföy web uygulaması. Node.js + Express + SQLite + EJS.

## Özellikler

- ✅ Dark theme, Three.js 3D efektleri, particle animasyonları
- ✅ Proje yönetimi (In Progress / Delivered / Planned durumları)
- ✅ Gerçek zamanlı ziyaretçi takibi (ülke, tarayıcı, cihaz)
- ✅ Abone sistemi
- ✅ İletişim formu
- ✅ Admin paneli (dashboard, projeler, aboneler, mesajlar, ayarlar, yetenekler)
- ✅ Analytics grafikler (Chart.js)
- ✅ SQLite veritabanı (production'da PostgreSQL'e geçilebilir)

## Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını düzenle
nano .env

# 3. Başlat
npm start

# Geliştirme modunda:
npm install -g nodemon
npm run dev
```

## Giriş Bilgileri

- Admin Panel: http://localhost:3000/admin
- Kullanıcı adı: `admin`
- Şifre: `Admin123!`

## Deployment (Vercel / Railway / Render)

1. Railway.app'e git (ücretsiz)
2. GitHub'a push et
3. Railway'de "Deploy from GitHub" seç
4. Environment variables ekle:
   - SESSION_SECRET=güçlü-bir-şifre
   - NODE_ENV=production

## Domain Bağlama

1. Domain aldıktan sonra hosting platformunda Custom Domain ekle
2. DNS ayarlarında CNAME veya A record'u yönlendir

## Şifre Değiştirme

Admin paneli → Ayarlar bölümünden (yakında eklenecek)
Veya veritabanından:
```js
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('YeniŞifre123', 10);
// DB'de admin tablosunu güncelle
```
