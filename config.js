// dotenv paketini yükle
require('dotenv').config();

module.exports = {
  SHOPIER_API_URL: 'https://api.shopier.com/v1/discounts/codes',
  AUTH_TOKEN: process.env.AUTH_TOKEN, // .env veya Render'dan çek
  PRODUCT_PRICE: 2850,
  DC_TOKEN: process.env.DC_TOKEN, // .env veya Render'dan çek
};