// backend/api/routes/product.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
//router.use(authMiddleware.protect);

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