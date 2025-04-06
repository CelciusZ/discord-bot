const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { DC_TOKEN } = require('./config.js');
const { createDiscountCode } = require('./shopier.js');
const express = require('express');
const app = express();

// Katılan kullanıcıları ve indirim kodlarını takip etmek için bir Map oluştur
const participants = new Map(); // { userId: { code, amountOff, amountMinimum, expiresAt } }

// Tarih formatını gg/aa/yyyy formatına çeviren fonksiyon
const formatDate = (dateString) => {
  // Geçerli bir tarih string'i olup olmadığını kontrol et
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // Geçersiz tarih durumunda varsayılan bir tarih döndür veya hata logla
    console.error(`[${new Date().toLocaleString()}] Geçersiz tarih formatı: ${dateString}`);
    // Varsayılan olarak çekilişin son tarihini (10 Mayıs 2025) kullanabiliriz
    const defaultDate = new Date('2025-05-10T23:59:00+0300');
    const day = String(defaultDate.getDate()).padStart(2, '0');
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
    const year = defaultDate.getFullYear();
    return `${day}/${month}/${year} 23:59`;
  }

  // Geçerli tarih için formatlama
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year} 23:59`;
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`[${new Date().toLocaleString()}] Bot hazır! Bot ID: ${client.user.id}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // !cekilis komutu
  if (message.content === '!cekilis') {
    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${message.author.tag} (${message.author.id}) !cekilis komutunu kullandı.`);

    const button = new ButtonBuilder()
      .setCustomId('cekilis')
      .setLabel('Şansını Dene!')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.reply({
      content: 'Aşağıdaki butona basarak indirim kodunu çekebilirsin!',
      components: [row],
    });
  }

  // !temizle komutu (sadece adminler için)
  if (message.content === '!temizle') {
    // Kullanıcının admin yetkisine sahip olup olmadığını kontrol et
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await message.reply({
        content: 'Bu komutu kullanmak için yönetici yetkisine sahip olmalısın!',
        ephemeral: true,
      });
      return;
    }

    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${message.author.tag} (${message.author.id}) !temizle komutunu kullandı.`);

    try {
      // Kanalın tüm mesajlarını al ve sil
      let fetched;
      do {
        fetched = await message.channel.messages.fetch({ limit: 100 });
        if (fetched.size === 0) break;
        await message.channel.bulkDelete(fetched, true); // true: 14 günden eski mesajları atla
        console.log(`[${new Date().toLocaleString()}] ${fetched.size} mesaj silindi.`);
      } while (fetched.size > 0);

      await message.reply({
        content: 'Kanal temizlendi! Tüm mesajlar silindi.',
        ephemeral: true,
      });
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] Mesajlar silinirken hata oluştu:`, error);
      await message.reply({
        content: 'Mesajlar silinirken bir hata oluştu. Lütfen tekrar dene.',
        ephemeral: true,
      });
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'cekilis') {
    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${interaction.user.tag} (${interaction.user.id}) çekiliş butonuna bastı.`);

    // Kullanıcının daha önce katılıp katılmadığını kontrol et (Map'ten)
    const userId = interaction.user.id;
    const userExists = participants.has(userId);
    console.log(`[${new Date().toLocaleString()}] userExists kontrol sonucu:`, userExists);

    if (userExists) {
      const previousDiscount = participants.get(userId);
      const formattedDate = formatDate(previousDiscount.expiresAt);
      await interaction.reply({
        content: `Zaten çekilişe katıldın! Her kullanıcı yalnızca bir kez katılabilir.\nİşte daha önce aldığın indirim kodu: **${previousDiscount.code}** 🎉\nİndirim Miktarı: **${previousDiscount.amountOff} TL** (%${Math.round((previousDiscount.amountOff / 2850) * 100)})\nSon Kullanma: **${formattedDate}**\nBu kodu Zero Pedal Makro Cihazı satın alırken kullanabilirsin!`,
        flags: MessageFlags.Ephemeral,
      });
      return; // Kullanıcı zaten katıldıysa işlemi durdur
    }

    // Kullanıcı daha önce katılmadıysa, yeni bir indirim kodu oluştur
    await interaction.reply({
      content: 'Çekilişe katıldın! İndirim kodu oluşturuluyor...',
      flags: MessageFlags.Ephemeral,
    });

    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${interaction.user.tag} (${interaction.user.id}) çekilişe eklendi.`);

    console.log(`[${new Date().toLocaleString()}] İndirim kodu oluşturuluyor... Kullanıcı: ${interaction.user.tag} (${interaction.user.id})`);

    try {
      const discountCode = await createDiscountCode();
      console.log(`[${new Date().toLocaleString()}] Kod: ${discountCode.code}, İndirim Miktarı: ${discountCode.amountOff} TL (%${Math.round((discountCode.amountOff / 2850) * 100)}), Minimum Sepet: ${discountCode.amountMinimum} TL, Son Kullanma: ${discountCode.expiresAt}`);
      console.log(`[${new Date().toLocaleString()}] İndirim kodu başarıyla oluşturuldu! Shopier Yanıtı:`, discountCode);

      // Kullanıcıyı ve indirim kodunu Map'e ekle
      participants.set(userId, {
        code: discountCode.code,
        amountOff: discountCode.amountOff,
        amountMinimum: discountCode.amountMinimum,
        expiresAt: discountCode.expiresAt,
      });

      const formattedDate = formatDate(discountCode.expiresAt);
      await interaction.followUp({
        content: `İndirim kodun: **${discountCode.code}** 🎉\nİndirim Miktarı: **${discountCode.amountOff} TL** (%${Math.round((discountCode.amountOff / 2850) * 100)})\nSon Kullanma: **${formattedDate}**\nBu kodu Zero Pedal Makro Cihazı satın alırken kullanabilirsin!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] İndirim kodu oluşturulurken hata oluştu:`, error);
      await interaction.followUp({
        content: 'İndirim kodu oluşturulurken bir hata oluştu. Lütfen tekrar dene.',
        flags: MessageFlags.Ephemeral,
      });
      // Hata durumunda kullanıcıyı Map'ten çıkar (tekrar denemesine izin vermek için)
      participants.delete(userId);
    }
  }
});

client.login(DC_TOKEN);

// HTTP Sunucusunu Başlat
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('Bot çalışıyor!');
});

app.listen(PORT, () => {
  console.log(`[${new Date().toLocaleString()}] HTTP sunucusu ${PORT} portunda çalışıyor.`);
});