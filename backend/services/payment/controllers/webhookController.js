const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../config');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

// Obsługa webhooka od Stripe
exports.handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } catch (err) {
      logger.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Obsługa zdarzenia
    await paymentService.handleStripeWebhookEvent(event);
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obsługa webhooka od PayPal
exports.handlePaypalWebhook = async (req, res) => {
    try {
      const event = req.body;
      
      // Weryfikacja zdarzenia PayPal
      // W rzeczywistej implementacji należy zweryfikować autentyczność zdarzenia
      
      // Obsługa zdarzenia
      await paymentService.handlePaypalWebhookEvent(event);
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Error handling PayPal webhook:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  // Obsługa webhooka od BLIK
  exports.handleBlikWebhook = async (req, res) => {
    try {
      const event = req.body;
      
      // Weryfikacja zdarzenia BLIK
      // W rzeczywistej implementacji należy zweryfikować autentyczność zdarzenia
      
      // Obsługa zdarzenia
      await paymentService.handleBlikWebhookEvent(event);
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Error handling BLIK webhook:', error);
      res.status(500).json({ error: error.message });
    }
  };
  