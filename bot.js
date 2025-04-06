const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { DC_TOKEN } = require('./config.js');
const { createDiscountCode } = require('./shopier.js');
const { InteractionResponseFlags } = require('discord.js'); // Ephemeral uyarısı için

// Express ile HTTP sunucusu için gerekli modülü ekle
const express = require('express');
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`[${new Date().toLocaleString()}] Bot hazır!`);
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

    await interaction.reply({
      content: 'Çekilişe katıldın! İndirim kodu oluşturuluyor...',
      flags: InteractionResponseFlags.Ephemeral,
    });

    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${interaction.user.tag} (${interaction.user.id}) çekilişe eklendi.`);

    console.log(`[${new Date().toLocaleString()}] İndirim kodu oluşturuluyor... Kullanıcı: ${interaction.user.tag} (${interaction.user.id})`);

    try {
      const discountCode = await createDiscountCode();
      console.log(`[${new Date().toLocaleString()}] Kod: ${discountCode.code}, İndirim Miktarı: ${discountCode.amountOff} TL (%${Math.round((discountCode.amountOff / 2850) * 100)}), Minimum Sepet: ${discountCode.amountMinimum} TL, Son Kullanma: ${discountCode.expiresAt}`);
      console.log(`[${new Date().toLocaleString()}] İndirim kodu başarıyla oluşturuldu! Shopier Yanıtı:`, discountCode);

      await interaction.followUp({
        content: `İndirim kodun: **${discountCode.code}** 🎉\nİndirim Miktarı: **${discountCode.amountOff} TL** (%${Math.round((discountCode.amountOff / 2850) * 100)})\nMinimum Sepet Tutarı: **${discountCode.amountMinimum} TL**\nSon Kullanma Tarihi: **${discountCode.expiresAt}**\nBu kodu Zero Pedal Makro Cihazı satın alırken kullanabilirsin!`,
        flags: InteractionResponseFlags.Ephemeral,
      });
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] İndirim kodu oluşturulurken hata oluştu:`, error);
      await interaction.followUp({
        content: 'İndirim kodu oluşturulurken bir hata oluştu. Lütfen tekrar dene.',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }
  }
});

client.login(DC_TOKEN);

// HTTP Sunucusunu Başlat
const PORT = process.env.PORT || 3000; // Render PORT ortam değişkenini kullanır, yoksa 3000 portunu kullanır
app.get('/', (req, res) => {
  res.send('Bot çalışıyor!'); // Basit bir yanıt döndür
});

app.listen(PORT, () => {
  console.log(`[${new Date().toLocaleString()}] HTTP sunucusu ${PORT} portunda çalışıyor.`);
});