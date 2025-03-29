const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

// Inicjacja płatności (może być wykonana przez klienta, dlatego brak middleware)
router.post('/init', paymentController.initPayment);

// Weryfikacja płatności BLIK
router.post('/verify-blik', paymentController.verifyBlikPayment);

// Trasy zabezpieczone
router.use(authMiddleware.protect);

// Pobiera historię płatności sprzedawcy
router.get('/seller/:sellerId', paymentController.getPaymentsBySeller);

// Pobiera statystyki płatności sprzedawcy
router.get('/stats/:sellerId', paymentController.getPaymentStats);

// Pobiera szczegóły płatności
router.get('/:id', paymentController.getPaymentDetails);

// Inicjuje zwrot płatności
router.post('/:id/refund', paymentController.refundPayment);

// Trasy dla transakcji
router.get('/transactions/seller/:sellerId', transactionController.getTransactionsBySeller);
router.get('/transactions/:id', transactionController.getTransactionDetails);

module.exports = router;