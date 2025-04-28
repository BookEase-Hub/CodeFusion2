require('dotenv').config();

module.exports = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
      premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
    }
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
  },
  evently: {
    apiKey: process.env.EVENTLY_API_KEY,
    merchantId: process.env.EVENTLY_MERCHANT_ID,
    webhookSecret: process.env.EVENTLY_WEBHOOK_SECRET
  }
}; 