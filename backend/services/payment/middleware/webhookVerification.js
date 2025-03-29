const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Middleware do weryfikacji webhooków Stripe
 */
exports.verifyStripeWebhook = (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).json({
        success: false,
        message: 'Brak nagłówka signature'
      });
    }
    
    // Weryfikacja będzie wykonana w kontrolerze
    next();
  } catch (error) {
    logger.error('Error verifying Stripe webhook:', error);
    res.status(400).json({
      success: false,
      message: 'Błąd weryfikacji webhook'
    });
  }
};

/**
 * Middleware do weryfikacji webhooków PayPal
 */
exports.verifyPaypalWebhook = (req, res, next) => {
  try {
    // Implementacja weryfikacji webhooków PayPal
    // W rzeczywistej implementacji powinno to weryfikować autentyczność zdarzenia
    
    next();
  } catch (error) {
    logger.error('Error verifying PayPal webhook:', error);
    res.status(400).json({
      success: false,
      message: 'Błąd weryfikacji webhook'
    });
  }
};

/**
 * Middleware do weryfikacji webhooków BLIK
 */
exports.verifyBlikWebhook = (req, res, next) => {
  try {
    // Implementacja weryfikacji webhooków BLIK
    // W rzeczywistej implementacji powinno to weryfikować autentyczność zdarzenia
    
    next();
  } catch (error) {
    logger.error('Error verifying BLIK webhook:', error);
    res.status(400).json({
      success: false,
      message: 'Błąd weryfikacji webhook'
    });
  }
};