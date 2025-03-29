const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/auth');

// Middleware do sprawdzania autoryzacji
router.use(authMiddleware.protect);

// Pobieranie stanu magazynowego dla produktu
router.get('/product/:productId', inventoryController.getProductStock);

// Pobieranie stanu magazynowego dla wszystkich produktów sprzedawcy
router.get('/seller/:sellerId', inventoryController.getSellerInventory);

// Aktualizacja stanu magazynowego produktu
router.patch('/update/:productId', inventoryController.updateProductStock);

// Aktualizacja wielu produktów jednocześnie
router.post('/bulk-update', inventoryController.bulkUpdateStock);

// Pobieranie produktów z niskim stanem magazynowym
router.get('/low-stock/:sellerId', inventoryController.getLowStockProducts);

module.exports = router;