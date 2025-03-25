// backend/api/routes/drop.js
const express = require('express');
const router = express.Router();
const dropController = require('../controllers/drop');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
router.use(authMiddleware.protect);

// Pobiera wszystkie dropy sprzedawcy
router.get('/seller/:sellerId', dropController.getDrops);

// Pobiera szczegóły dropu
router.get('/:id', dropController.getDrop);

// Tworzy nowy drop
router.post('/', dropController.createDrop);

// Aktualizuje drop
router.put('/:id', dropController.updateDrop);

// Publikuje drop
router.post('/:id/publish', dropController.publishDrop);

// Usuwa drop
router.delete('/:id', dropController.deleteDrop);

module.exports = router;

// backend/api/routes/product.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
router.use(authMiddleware.protect);

// Pobiera wszystkie produkty sprzedawcy
router.get('/seller/:sellerId', productController.getProducts);

// Pobiera szczegóły produktu
router.get('/:id', productController.getProduct);

// Pobiera produkty po tablicy ID
router.post('/by-ids', productController.getProductsByIds);

// Tworzy nowy produkt
router.post('/', productController.createProduct);

// Aktualizuje produkt
router.put('/:id', productController.updateProduct);

// Usuwa produkt
router.delete('/:id', productController.deleteProduct);

// Aktualizuje stan magazynowy produktu
router.patch('/:id/inventory', productController.updateInventory);

module.exports = router;

// backend/api/routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
router.use(authMiddleware.protect);

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

// backend/api/routes/customer.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
router.use(authMiddleware.protect);

// Pobiera wszystkich klientów sprzedawcy
router.get('/seller/:sellerId', customerController.getCustomers);

// Pobiera szczegóły klienta
router.get('/:id', customerController.getCustomer);

// Eksportuje dane klientów (RODO)
router.get('/export/:id', customerController.exportCustomerData);

// Usuwa dane klienta (RODO)
router.delete('/data/:id', customerController.deleteCustomerData);

module.exports = router;

// backend/api/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middlewares/auth');

// Trasy publiczne
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

// Trasy zabezpieczone
router.use(authMiddleware.protect);

// Pobiera dane zalogowanego użytkownika
router.get('/me', userController.getMe);

// Aktualizuje dane profilu
router.put('/profile', userController.updateProfile);

// Zmienia hasło
router.put('/change-password', userController.changePassword);

// Wylogowanie (opcjonalne, dla śledzenia sesji)
router.post('/logout', userController.logout);

module.exports = router;

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
router.use(authMiddleware.protect);

// Pobiera historię płatności sprzedawcy
router.get('/seller/:sellerId', paymentController.getPaymentsBySeller);

// Pobiera statystyki płatności sprzedawcy
router.get('/stats/:sellerId', paymentController.getPaymentStats);

module.exports = router;
