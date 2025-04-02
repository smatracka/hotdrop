// backend/api/routes/drop.js
const express = require('express');
const router = express.Router();
const dropController = require('../controllers/drop');
const authMiddleware = require('../middlewares/auth');
const { validate, dropValidationRules, queueValidationRules, cartReservationValidationRules } = require('../middlewares/validation');
const { body } = require('express-validator');

// Middleware for authentication
router.use(authMiddleware.protect);

// Drop Management
router.get('/seller/:sellerId', dropController.getDrops);
router.get('/:id', dropController.getDrop);

// Create drop with validation
router.post('/', [
  ...dropValidationRules.map(rule => body(rule.field, ...rule.rules)),
  validate
], dropController.createDrop);

// Update drop with validation
router.put('/:id', [
  ...dropValidationRules.map(rule => body(rule.field, ...rule.rules).optional()),
  validate
], dropController.updateDrop);

router.post('/:id/publish', dropController.publishDrop);
router.delete('/:id', dropController.deleteDrop);

// Drop Page Management
router.post('/:id/pages', dropController.createDropPage);

// Queue Management
router.get('/:dropId/queue', dropController.getQueue);

// Initialize queue with validation
router.post('/:dropId/queue', [
  ...queueValidationRules.map(rule => body(rule.field, ...rule.rules)),
  validate
], dropController.initializeQueue);

// Update queue with validation
router.put('/:dropId/queue', [
  ...queueValidationRules.map(rule => body(rule.field, ...rule.rules).optional()),
  validate
], dropController.updateQueue);

router.post('/:dropId/queue/join', dropController.joinQueue);
router.post('/:dropId/queue/leave', dropController.leaveQueue);

// Cart Reservation
// Create cart reservation with validation
router.post('/:dropId/cart-reservations', [
  ...cartReservationValidationRules.map(rule => body(rule.field, ...rule.rules)),
  validate
], dropController.createCartReservation);

router.get('/cart-reservations/:reservationId', dropController.getCartReservation);
router.put('/cart-reservations/:reservationId', dropController.updateCartReservation);

module.exports = router;