const { Client, IntentsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { createDiscountCode } = require('./shopier.js');
const { DC_TOKEN } = require('./config.js');

// Bot oluştur
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Kullanıcı kontrolü için Set (her kullanıcı sadece 1 kez katılabilir)
const usedUsers = new Set();

// Bot hazır olduğunda
client.once('ready', () => {
  console.log(`[${new Date().toLocaleString()}] Bot hazır!`);
});

// Komut: !cekilis ile buton oluşturma
client.on('messageCreate', async (message) => {
  if (message.content === '!cekilis') {
    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${message.author.username} (${message.author.id}) !cekilis komutunu kullandı.`);

    const button = new ButtonBuilder()
      .setCustomId('cekilis_butonu')
      .setLabel('Şansını Dene!')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.reply({
      content: 'Aşağıdaki butona basarak indirim kodunu çekebilirsin!',
      components: [row],
    });
  }
});

// Butona basıldığında indirim kodu üretme ve Shopier'e ekleme
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'cekilis_butonu') {
    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${interaction.user.username} (${interaction.user.id}) çekiliş butonuna bastı.`);

    // Kullanıcının daha önce çekilişe katılıp katılmadığını kontrol et
    if (usedUsers.has(interaction.user.id)) {
      console.log(`[${new Date().toLocaleString()}] Kullanıcı ${interaction.user.username} (${interaction.user.id}) daha önce çekilişe katılmış, tekrar katılamaz!`);
      await interaction.reply({
        content: 'Üzgünüm, bu çekilişe sadece bir kez katılabilirsin!',
        ephemeral: true, // Geçici olarak eski yöntemi kullanıyoruz
      });
      return;
    }

    // Kullanıcıyı listeye ekle (tekrar katılmasını engelle)
    usedUsers.add(interaction.user.id);
    console.log(`[${new Date().toLocaleString()}] Kullanıcı ${interaction.user.username} (${interaction.user.id}) çekilişe eklendi.`);

    // Shopier'e indirim kodu oluştur
    const discountResult = await createDiscountCode(interaction.user.id, interaction.user.username);

    if (discountResult.success) {
      const { code, amountOff, percentOff, expiresAt } = discountResult;
      await interaction.reply({
        content: `🎉 Tebrikler! İşte indirim kodun: **${code}**  
- İndirim Miktarı: ${amountOff} TL (%${percentOff})  
- Son Kullanma Tarihi: ${expiresAt}  
- Bu kod sana özel ve sadece bir kez kullanılabilir!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Üzgünüm, indirim kodu oluştururken bir hata oluştu. Lütfen tekrar dene!',
        ephemeral: true,
      });
    }
  }
});

// Botu başlat
client.login(DC_TOKEN);