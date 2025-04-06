const axios = require('axios');
const { SHOPIER_API_URL, AUTH_TOKEN, PRODUCT_PRICE } = require('./config.js');

// 20 haneli rastgele kod üret
function generateRandomCode(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// 1 hafta sonrası için son kullanma tarihi (yyyy-MM-ddZ formatında)
function getExpirationDate() {
  const today = new Date();
  const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 hafta sonrası
  const year = oneWeekLater.getFullYear();
  const month = String(oneWeekLater.getMonth() + 1).padStart(2, '0'); // Ay (01-12)
  const day = String(oneWeekLater.getDate()).padStart(2, '0'); // Gün (01-31)
  return `${year}-${month}-${day}+0300`; // Örnek: 2025-04-13+0300
}

// İndirim kodu oluştur ve Shopier'e gönder
async function createDiscountCode(userId, username) {
  // Rastgele indirim oranı (%30-%80 arasında)
  const percentOff = Math.floor(Math.random() * (80 - 30 + 1)) + 30;
  
  // İndirim miktarını hesapla (ürün fiyatına göre)
  const amountOff = Math.floor((PRODUCT_PRICE * percentOff) / 100); // Örneğin: %65 için 2850 * 0.65 = 1852.5 TL
  
  // amountMinimum: İndirim kodunun kullanılabilmesi için minimum sepet tutarı
  const amountMinimum = amountOff + 100; // Örneğin: amountOff 1852 ise, amountMinimum 1952
  
  // 20 haneli rastgele kod üret
  const randomCode = generateRandomCode(20); // Örneğin: X7P4Q8W3E2R5T9Y6U1I0

  // İndirim kodu detayları
  const discountData = {
    type: 'amount', // Sabit miktar indirim
    currency: 'TRY', // Para birimi
    code: randomCode, // Üretilen 20 haneli kod
    amountOff: amountOff, // İndirim miktarı (örneğin 1852 TL)
    amountMinimum: amountMinimum, // Minimum sepet tutarı (örneğin 1952 TL)
    percentOff: percentOff, // Yüzde oranı (bilgi amaçlı)
    numAvailable: 1, // Tek kullanımlık
    expiresAt: getExpirationDate(), // 1 hafta sonrası (örneğin 2025-04-13+0300)
  };

  console.log(`[${new Date().toLocaleString()}] İndirim kodu oluşturuluyor... Kullanıcı: ${username} (${userId})`);
  console.log(`[${new Date().toLocaleString()}] Kod: ${randomCode}, İndirim Miktarı: ${amountOff} TL (%${percentOff}), Minimum Sepet: ${amountMinimum} TL, Son Kullanma: ${discountData.expiresAt}`);

  try {
    const response = await axios.post(SHOPIER_API_URL, discountData, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': AUTH_TOKEN, // Bearer token
      },
    });

    console.log(`[${new Date().toLocaleString()}] İndirim kodu başarıyla oluşturuldu! Shopier Yanıtı:`, response.data);
    return {
      success: true,
      code: randomCode,
      amountOff: amountOff,
      percentOff: percentOff,
      expiresAt: discountData.expiresAt,
    };
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] Hata:`, error.response ? error.response.data : error.message);
    return { success: false };
  }
}

module.exports = { createDiscountCode };