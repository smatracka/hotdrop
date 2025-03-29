const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Obsługa webhooków od dostawców płatności
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);
router.post('/paypal', webhookController.handlePaypalWebhook);
router.post('/blik', webhookController.handleBlikWebhook);

module.exports = router;