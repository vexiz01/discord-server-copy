# Discord Sunucu Kopyalama Aracı


## 📝 Açıklama
Discord sunucularını birebir kopyalamak için geliştirilmiş bir self-bot aracı. **Kullanıcı token'i** ile çalışır, tüm sunucu öğelerini (kanallar, roller, emojiler, stickerlar, izinler) kopyalar.

## ⚠️ UYARI
**Bu araç Discord'un Kullanım Şartlarına aykırıdır!** Kendi sorumluluğunuzda kullanın. Hesabınızın yasaklanma riski vardır. Sadece test hesaplarında deneyin.

## ✨ Özellikler

- ✅ Kullanıcı token'i ile giriş
- ✅ Modern CMD arayüzü
- ✅ Renkli ve detaylı log sistemi
- ✅ **Önce hedef sunucuyu komple temizleme** (emojiler, kanallar, roller)
- ✅ Tüm sunucu öğelerini kopyalama:
  - Sunucu ayarları (isim, icon, banner, açıklama)
  - Tüm roller ve izinler
  - Kategoriler ve kanallar (text, voice, announcement, stage, forum)
  - Kanal izinleri ve özel ayarlar
  - Tüm emojiler ve stickerlar
- ✅ Adım adım işlem takibi
- ✅ Hata yönetimi

## 🚀 Kurulum

1. **Depoyu klonlayın:**
```bash
git clone https://https://github.com/vexiz01/discord-server-copy.git
cd dc-server-copy
```

2. **Gerekli modülleri yükleyin:**
```bash
npm install discord.js-selfbot-v13@latest chalk@4.1.2
```

3. **Script'i çalıştırın:**
```bash
node main.js
```

## 📋 Kullanım

1. Discord token'inizi girin
2. Kopyalanacak sunucunun ID'sini girin (kaynak)
3. Kopyanın oluşturulacağı sunucunun ID'sini girin (hedef)
4. Onay verin
5. İşlemin tamamlanmasını bekleyin

## 📸 Ekran Görüntüsü

```
██╗   ██╗███████╗██╗  ██╗    ██████╗ ███████╗██╗   ██╗
██║   ██║██╔════╝╚██╗██╔╝    ██╔══██╗██╔════╝╚██╗ ██╔╝
██║   ██║█████╗   ╚███╔╝     ██████╔╝█████╗   ╚████╔╝ 
╚██╗ ██╔╝██╔══╝   ██╔██╗     ██╔══██╗██╔══╝    ╚██╔╝  
 ╚████╔╝ ███████╗██╔╝ ██╗    ██████╔╝███████╗   ██║   
  ╚═══╝  ╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚══════╝   ╚═╝   

┌────────────────────────────────────┐
│ Discord Sunucu Kopyalama Aracı     │
│ Discord: vexiz0                    │
└────────────────────────────────────┘
```

## 🔧 Gereksinimler

- Node.js v16 veya üzeri
- Discord kullanıcı token'i
- Kaynak sunucuda "SUNUCULARI_YÖNET" yetkisi
- Hedef sunucuda "YÖNETİCİ" yetkisi

## 📁 Dosya Yapısı

- `main.js` - Ana script
- `README.md` - Bu dosya
- `package.json` - Bağımlılıklar

## ⚙️ İşlem Adımları

1. **Token Doğrulama**
2. **Sunucu Listeleme**
3. **Kaynak ve Hedef Seçimi**
4. **Hedef Sunucuyu Temizleme:**
   - Emojiler silinir
   - Kanallar silinir
   - Roller (@everyone hariç) silinir
   - Sunucu ayarları sıfırlanır
5. **Kopyalama İşlemi:**
   - Sunucu ayarları kopyalanır
   - Roller oluşturulur
   - Kategoriler oluşturulur
   - Kanallar oluşturulur
   - Emojiler kopyalanır
   - Stickerlar kopyalanır
6. **Tamamlanma**

## ❗ Sık Karşılaşılan Hatalar

| Hata | Çözüm |
|------|-------|
| "Geçersiz token" | Token'ı kontrol edin, başında "Bot" olmamalı |
| "Yetki yok" | Sunucuda gerekli yetkilere sahip olduğunuzdan emin olun |
| "Rate limit" | Çok hızlı işlem yapıyorsunuz, bekleyin ve tekrar deneyin |

## 📞 İletişim

- Discord: **vexiz0**
- GitHub: [@vexiz0](https://github.com/vexiz0)

## 📜 Lisans

Bu proje eğitim amaçlıdır. Ticari kullanımı yasaktır.

---
**⭐ Star atmayı unutmayın!**