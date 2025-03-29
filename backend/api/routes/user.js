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
//router.use(authMiddleware.protect);

// Pobiera dane zalogowanego użytkownika
router.get('/me', userController.getMe);

// Aktualizuje dane profilu
router.put('/profile', userController.updateProfile);

// Zmienia hasło
router.put('/change-password', userController.changePassword);

// Wylogowanie (opcjonalne, dla śledzenia sesji)
router.post('/logout', userController.logout);

module.exports = router;