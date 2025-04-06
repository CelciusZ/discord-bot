require('dotenv').config();

module.exports = {
  SHOPIER_API_URL: 'https://api.shopier.com/v1/discounts/codes',
  AUTH_TOKEN: process.env.AUTH_TOKEN,
  PRODUCT_PRICE: 2850,
  DC_TOKEN: process.env.DC_TOKEN,
};

console.log('DC_TOKEN:', process.env.DC_TOKEN); // Test için