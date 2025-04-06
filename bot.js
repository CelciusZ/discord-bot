const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const { DC_TOKEN } = require('./config.js');
const { createDiscountCode } = require('./shopier.js');
const express = require('express');
const db = require('./db.js'); // Veritabanı işlemlerini db.js'den al
const app = express();

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
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'cekilis') {
    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${interaction.user.tag} (${interaction.user.id}) çekiliş butonuna bastı.`);

    // Kullanıcının daha önce katılıp katılmadığını kontrol et (veritabanından)
    const userId = interaction.user.id;
    const userExists = await db.checkUser(userId);
    console.log(`[${new Date().toLocaleString()}] userExists kontrol sonucu:`, userExists);

    if (userExists) {
      await interaction.reply({
        content: `Zaten çekilişe katıldın! Her kullanıcı yalnızca bir kez katılabilir.\nİşte daha önce aldığın indirim kodu: **${userExists.code}** 🎉\nİndirim Miktarı: **${userExists.amountOff} TL** (%${Math.round((userExists.amountOff / 2850) * 100)})\nSon Kullanma Tarihi: **${userExists.expiresAt}**`,
        flags: MessageFlags.Ephemeral,
      });
      return; // Kullanıcı zaten katıldıysa işlemi durdur
    }

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

      // Kullanıcıyı ve indirim kodunu veritabanına ekle
      await db.addUser(userId, discountCode);

      await interaction.followUp({
        content: `İndirim kodun: **${discountCode.code}** 🎉\nİndirim Miktarı: **${discountCode.amountOff} TL** (%${Math.round((discountCode.amountOff / 2850) * 100)})\nSon Kullanma Tarihi: **${discountCode.expiresAt}**\nBu kodu Zero Pedal Makro Cihazı satın alırken kullanabilirsin!`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] İndirim kodu oluşturulurken hata oluştu:`, error);
      await interaction.followUp({
        content: 'İndirim kodu oluşturulurken bir hata oluştu. Lütfen tekrar dene.',
        flags: MessageFlags.Ephemeral,
      });
      // Hata durumunda kullanıcıyı veritabanından çıkar (tekrar denemesine izin vermek için)
      await db.removeUser(userId);
    }
  }
});

// Bot kapatıldığında veritabanını kapat
process.on('SIGINT', async () => {
  try {
    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('Veritabanı kapatılırken hata oluştu:', err.message);
    process.exit(1);
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