# Discord Bot - Çekiliş Botu 🎉

Bu proje, indirim kodu çekilişi yapan bir Discord botudur. Kullanıcılar, Discord sunucusunda `!cekilis` komutunu kullanarak bir çekilişe katılabilir ve indirim kodu kazanabilir. Bot, her kullanıcının yalnızca bir kez çekilişe katılmasına izin verir ve daha önce katılan kullanıcılara önceki indirim kodlarını gösterir. Ayrıca, adminler `!temizle` komutuyla kanaldaki tüm mesajları silebilir.

Bot, **Render** üzerinde barındırılmaktadır ve `Map` tabanlı bir veri yapısı kullanarak katılımcıları takip eder.

## 🚀 Özellikler
- **Çekiliş Sistemi:** Kullanıcılar `!cekilis` komutuyla bir indirim kodu çekilişine katılabilir.
- **Tek Katılım Kuralı:** Her kullanıcı yalnızca bir kez çekilişe katılabilir. Daha önce katılan kullanıcılara önceki indirim kodları gösterilir.
- **Kanal Temizleme:** Adminler, `!temizle` komutuyla kanaldaki tüm mesajları silebilir.
- **Shopier Entegrasyonu:** İndirim kodları, Shopier API üzerinden oluşturulur.
- **Formatlı Tarih:** İndirim kodlarının son kullanma tarihi `gg/aa/yyyy 23:59` formatında gösterilir.

## 📋 Gereksinimler
- **Node.js:** v16 veya üstü
- **Discord Bot Token:** Discord Developer Portal'dan alınacak bir bot token'ı.
- **Shopier API Erişimi:** İndirim kodu oluşturmak için Shopier API anahtarları.

## 🛠️ Kurulum

### 1. Depoyu Klonla
```bash
git clone https://github.com/CelciusZ/discord-bot.git
cd discord-bot