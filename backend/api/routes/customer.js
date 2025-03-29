// backend/api/routes/customer.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
//router.use(authMiddleware.protect);

// Pobiera wszystkich klientów sprzedawcy
router.get('/seller/:sellerId', customerController.getCustomers);

// Pobiera szczegóły klienta
router.get('/:id', customerController.getCustomer);

// Eksportuje dane klientów (RODO)
router.get('/export/:id', customerController.exportCustomerData);

// Usuwa dane klienta (RODO)
router.delete('/data/:id', customerController.deleteCustomerData);

module.exports = router;