// backend/api/routes/payment.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const authMiddleware = require('../middlewares/auth');

// Inicjacja płatności (może być wykonana przez klienta, dlatego brak middleware)
router.post('/init', paymentController.initPayment);

// Weryfikacja płatności BLIK
router.post('/verify-blik', paymentController.verifyBlikPayment);

// Webhook dla powiadomień z serwisu płatności
router.post('/webhook', paymentController.handlePaymentWebhook);

// Trasy zabezpieczone
//router.use(authMiddleware.protect);

// Pobiera historię płatności sprzedawcy
router.get('/seller/:sellerId', paymentController.getPaymentsBySeller);

// Pobiera statystyki płatności sprzedawcy
router.get('/stats/:sellerId', paymentController.getPaymentStats);

module.exports = router;