const Reservation = require('../models/reservation');
const inventoryService = require('./inventoryService');
const logger = require('../utils/logger');

// Utworzenie rezerwacji
exports.createReservation = async (productId, quantity, sessionId) => {
  try {
    // Pobierz stan magazynowy
    const inventory = await inventoryService.getProductStock(productId);
    
    if (inventory.available < quantity) {
      throw new Error('Niewystarczająca ilość produktu');
    }
    
    // Ustaw datę wygaśnięcia rezerwacji (np. 15 minut)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Utwórz rezerwację
    const reservation = new Reservation({
      product: productId,
      quantity,
      sessionId,
      expiresAt,
      status: 'active'
    });
    
    await reservation.save();
    
    // Zaktualizuj stan magazynowy
    await inventoryService.updateProductStock(productId, {
      reserved: inventory.reserved + quantity
    });
    
    return reservation;
  } catch (error) {
    logger.error(`Error creating reservation for product ${productId}:`, error);
    throw error;
  }
};

// Pobranie rezerwacji
exports.getReservation = async (reservationId) => {
  try {
    return await Reservation.findById(reservationId).populate('product');
  } catch (error) {
    logger.error(`Error getting reservation ${reservationId}:`, error);
    throw error;
  }
};

// Potwierdzenie rezerwacji
exports.confirmReservation = async (reservationId, orderId) => {
  try {
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      throw new Error('Rezerwacja nie została znaleziona');
    }
    
    if (reservation.status !== 'active') {
      throw new Error(`Nieprawidłowy status rezerwacji: ${reservation.status}`);
    }
    
    if (reservation.expiresAt < new Date()) {
      // Rezerwacja wygasła, anuluj ją i zwróć ilość do stanu magazynowego
      await this.cancelReservation(reservationId);
      throw new Error('Rezerwacja wygasła');
    }
    
    // Zaktualizuj rezerwację
    reservation.status = 'confirmed';
    reservation.order = orderId;
    await reservation.save();
    
    // Pobierz stan magazynowy
    const inventory = await inventoryService.getProductStock(reservation.product);
    
    // Zaktualizuj stan magazynowy - zmniejsz ilość produktów, aktualizuj ilość sprzedanych
    await inventoryService.updateProductStock(reservation.product, {
      quantity: inventory.quantity - reservation.quantity,
      reserved: inventory.reserved - reservation.quantity,
      sold: (inventory.sold || 0) + reservation.quantity
    });
    
    return reservation;
  } catch (error) {
    logger.error(`Error confirming reservation ${reservationId}:`, error);
    throw error;
  }
};

// Anulowanie rezerwacji
exports.cancelReservation = async (reservationId) => {
  try {
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      throw new Error('Rezerwacja nie została znaleziona');
    }
    
    // Jeśli rezerwacja jest już potwierdzona lub anulowana, zwróć błąd
    if (reservation.status === 'confirmed') {
      throw new Error('Nie można anulować potwierdzonej rezerwacji');
    }
    
    if (reservation.status === 'cancelled' || reservation.status === 'expired') {
      return reservation;
    }
    
    // Zaktualizuj status rezerwacji
    reservation.status = 'cancelled';
    await reservation.save();
    
    // Jeśli rezerwacja była aktywna, zaktualizuj stan magazynowy
    if (reservation.status === 'active') {
      // Pobierz stan magazynowy
      const inventory = await inventoryService.getProductStock(reservation.product);
      
      // Zwróć zarezerwowaną ilość do dostępnego stanu
      await inventoryService.updateProductStock(reservation.product, {
        reserved: Math.max(0, inventory.reserved - reservation.quantity)
      });
    }
    
    return reservation;