const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const config = require('./index');

// Konfiguracja środowiska PayPal
let paypalEnvironment;
if (config.paypal.environment === 'live') {
  paypalEnvironment = new paypal.core.LiveEnvironment(
    config.paypal.clientId,
    config.paypal.clientSecret
  );
} else {
  paypalEnvironment = new paypal.core.SandboxEnvironment(
    config.paypal.clientId,
    config.paypal.clientSecret
  );
}

const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

module.exports = {
  stripe,
  paypalClient
};