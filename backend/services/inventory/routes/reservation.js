const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/auth');

// Utworzenie rezerwacji (dostępne bez uwierzytelniania - dla klientów)
router.post('/create', reservationController.createReservation);

// Sprawdzenie statusu rezerwacji (dostępne bez uwierzytelniania - dla klientów)
router.get('/status/:id', reservationController.getReservationStatus);

// Middleware do sprawdzania autoryzacji dla tras zastrzeżonych dla sprzedawców/admina
router.use(authMiddleware.protect);

// Potwierdzenie rezerwacji (po złożeniu zamówienia)
router.post('/confirm/:id', reservationController.confirmReservation);

// Anulowanie rezerwacji
router.post('/cancel/:id', reservationController.cancelReservation);

// Pobieranie aktywnych rezerwacji dla produktu
router.get('/product/:productId', reservationController.getProductReservations);

// Pobieranie wszystkich rezerwacji dla sprzedawcy
router.get('/seller/:sellerId', reservationController.getSellerReservations);

module.exports = router;