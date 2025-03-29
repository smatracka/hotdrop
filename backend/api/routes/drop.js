// backend/api/routes/drop.js
const express = require('express');
const router = express.Router();
const dropController = require('../controllers/drop');
const authMiddleware = require('../middlewares/auth');

// Middleware do sprawdzania autoryzacji
//router.use(authMiddleware.protect);

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