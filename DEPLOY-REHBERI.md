  # 🚀 Portfolyonu İnternete Yayınlama — Adım Adım

## ÖZET: Ne Yapacaksın?
```
1. GitHub'a yükle         (~5 dk)
2. Railway'e deploy et    (~5 dk)  ← ücretsiz, otomatik
3. Domain al + bağla      (~10 dk) ← namecheap, porkbun, natro
```

---

## ADIM 1 — GitHub Hesabı Aç (varsa geç)
→ github.com → Sign up → email/şifre ile kayıt

---

## ADIM 2 — Projeyi GitHub'a Yükle

Bilgisayarında bir klasöre zip'i çıkar, sonra terminal aç:

```bash
# Git yoksa kur: git-scm.com/downloads

cd portfolio          # klasöre gir

git init
git add .
git commit -m "portfolio v1"
```

GitHub'da yeni repo oluştur:
→ github.com → sağ üst + → New repository  
→ Repository name: `portfolio`  
→ Private seç ✅ (kimse görmesin)  
→ Create repository

```bash
# GitHub'ın verdiği komutları yapıştır, genelde şuna benzer:
git remote add origin https://github.com/KULLANICI_ADIN/portfolio.git
git branch -M main
git push -u origin main
```

---

## ADIM 3 — Railway'e Deploy

1. **railway.app** → "Start a New Project" → GitHub ile giriş yap
2. "Deploy from GitHub repo" → `portfolio` reposunu seç
3. Otomatik algılar ve başlar

**Environment Variables ekle** (Railway → Variables sekmesi):
```
SESSION_SECRET    →  herhangi_uzun_bir_sifre_yaz_123!abc
NODE_ENV          →  production
```

4-5 dakika sonra sana şöyle bir URL verir:
```
https://portfolio-production-xxxx.up.railway.app
```

**Bu URL ile site çalışıyor!** Domain almadan da paylaşabilirsin.

---

## ADIM 4 — Domain Al ve Bağla

### Nereden al?
| Site | Fiyat | Tavsiye |
|------|-------|---------|
| **namecheap.com** | ~10$/yıl | En popüler |
| **porkbun.com** | ~8$/yıl | En ucuz |
| **natro.com** | ~₺500/yıl | Türkçe destek |
| **isimtescil.net** | ~₺450/yıl | Türkçe destek |

### Hangi uzantıyı al?
- `.dev` → developer portföyü için en şık (örn: `adisoyadi.dev`)
- `.me` → kişisel için güzel (örn: `adisoyadi.me`)  
- `.com` → klasik
- `.com.tr` → Türkiye odaklı

### Domain'i Railway'e bağla

Railway → Proje → Settings → Domains → "Add Custom Domain"  
`adisoyadi.dev` yaz → Railway sana bir değer verir (CNAME)

Domain kayıt sitene gir → DNS Yönetimi:
```
Tür:   CNAME
Host:  @  (veya www)
Değer: railway.app'in verdiği adres
TTL:   Automatic
```

30 dakika - 24 saat içinde domain çalışır. Railway otomatik HTTPS kurar (kilit simgesi ✅).

---

## ADIM 5 — SQLite Verilerinin Kaybolmaması

Railway'de her deploy'da veritabanı **sıfırlanır**. Bunu çözmek için:

Railway → Proje → New → Volume  
→ Mount Path: `/app/data`  
→ Oluştur

Sonra `db.js` dosyasında şu satırı değiştir:
```js
// ESKİ:
const db = new sqlite3.Database('./portfolio.db', ...

// YENİ:
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/app/data/portfolio.db' 
  : './portfolio.db';
const db = new sqlite3.Database(dbPath, ...
```

Bu değişikliği yap, git push'la, veriler kalıcı olur.

---

## ÖZET KONTROL LİSTESİ

- [ ] GitHub'a yüklendi
- [ ] Railway'de deploy edildi  
- [ ] SESSION_SECRET eklendi
- [ ] Site açılıyor (railway URL)
- [ ] Domain alındı
- [ ] DNS kaydı yapıldı
- [ ] Domain çalışıyor
- [ ] Volume eklendi (veriler kaybolmuyor)
- [ ] Admin panel açılıyor (/admin)
- [ ] Şifreyi değiştirdin (Admin123! yerine)

---

## ⚠️ Güvenlik Hatırlatmaları

1. Admin şifreni değiştir → `/admin/danger` → Şifre Değiştir
2. SESSION_SECRET güçlü bir şey yaz (rastgele 32+ karakter)
3. GitHub repon Private olsun (Public yapma)
