// backend/api/routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
//router.use(authMiddleware.protect);

// Pobiera wszystkie zamówienia sprzedawcy
router.get('/seller/:sellerId', orderController.getOrders);

// Pobiera szczegóły zamówienia
router.get('/:id', orderController.getOrder);

// Aktualizuje status zamówienia
router.patch('/:id/status', orderController.updateOrderStatus);

// Pobiera zamówienia dla dropu
router.get('/drop/:dropId', orderController.getOrdersByDrop);

// Pobiera zamówienia dla klienta
router.get('/customer/:customerId', orderController.getOrdersByCustomer);

// Generuje fakturę dla zamówienia
router.post('/:id/invoice', orderController.generateInvoice);

module.exports = router;