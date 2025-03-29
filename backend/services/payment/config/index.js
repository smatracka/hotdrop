module.exports = {
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/drop-commerce',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    server: {
      port: process.env.PORT || 4002
    },
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    apiServiceUrl: process.env.API_SERVICE_URL || 'http://localhost:4000',
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
    },
    blik: {
      // Konfiguracja dla BLIK
      apiKey: process.env.BLIK_API_KEY,
      merchantId: process.env.BLIK_MERCHANT_ID
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY
    }
  };