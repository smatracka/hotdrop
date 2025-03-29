// backend/services/inventory/services/reservationService.js
const Reservation = require('../models/reservation');
const inventoryService = require('./inventoryService');
const logger = require('../utils/logger');

/**
 * Tworzy nową rezerwację produktu
 * @param {string} productId - ID produktu
 * @param {number} quantity - Ilość rezerwowana
 * @param {string} sessionId - ID sesji klienta
 * @returns {Promise<Object>} - Obiekt rezerwacji
 */
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

/**
 * Pobiera informacje o rezerwacji
 * @param {string} reservationId - ID rezerwacji
 * @returns {Promise<Object>} - Obiekt rezerwacji
 */
exports.getReservation = async (reservationId) => {
  try {
    return await Reservation.findById(reservationId).populate('product');
  } catch (error) {
    logger.error(`Error getting reservation ${reservationId}:`, error);
    throw error;
  }
};

/**
 * Potwierdza rezerwację po złożeniu zamówienia
 * @param {string} reservationId - ID rezerwacji
 * @param {string} orderId - ID zamówienia
 * @returns {Promise<Object>} - Zaktualizowany obiekt rezerwacji
 */
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

/**
 * Anuluje rezerwację
 * @param {string} reservationId - ID rezerwacji
 * @returns {Promise<Object>} - Anulowany obiekt rezerwacji
 */
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
  } catch (error) {
    logger.error(`Error cancelling reservation ${reservationId}:`, error);
    throw error;
  }
};

/**
 * Pobiera aktywne rezerwacje dla produktu
 * @param {string} productId - ID produktu
 * @param {Object} options - Opcje paginacji
 * @returns {Promise<Object>} - Obiekt z listą rezerwacji i metadanymi paginacji
 */
exports.getProductReservations = async (productId, options = {}) => {
  try {
    const query = { 
      product: productId,
      status: 'active'
    };
    
    return await Reservation.paginate(query, options);
  } catch (error) {
    logger.error(`Error getting reservations for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Pobiera rezerwacje dla sprzedawcy
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} query - Dodatkowe kryteria zapytania
 * @param {Object} options - Opcje paginacji
 * @returns {Promise<Object>} - Obiekt z listą rezerwacji i metadanymi paginacji
 */
exports.getSellerReservations = async (sellerId, query = {}, options = {}) => {
  try {
    // Znajdź wszystkie produkty sprzedawcy
    const inventory = await inventoryService.getSellerInventory(sellerId, {}, { pagination: false });
    const productIds = inventory.docs.map(item => item.product);
    
    // Utwórz zapytanie o rezerwacje dla produktów sprzedawcy
    const reservationQuery = {
      product: { $in: productIds },
      ...query
    };
    
    return await Reservation.paginate(reservationQuery, options);
  } catch (error) {
    logger.error(`Error getting reservations for seller ${sellerId}:`, error);
    throw error;
  }
};

/**
 * Aktualizuje status wygasłych rezerwacji
 * Funkcja używana przez cron job
 * @returns {Promise<number>} - Liczba zaktualizowanych rezerwacji
 */
exports.expireReservations = async () => {
  try {
    const now = new Date();
    
    // Znajdź wszystkie aktywne rezerwacje, które wygasły
    const expiredReservations = await Reservation.find({
      status: 'active',
      expiresAt: { $lt: now }
    });
    
    let processed = 0;
    
    // Anuluj każdą wygasłą rezerwację
    for (const reservation of expiredReservations) {
      try {
        // Zaktualizuj status rezerwacji
        reservation.status = 'expired';
        await reservation.save();
        
        // Zwróć zarezerwowaną ilość do stanu magazynowego
        const inventory = await inventoryService.getProductStock(reservation.product);
        
        await inventoryService.updateProductStock(reservation.product, {
          reserved: Math.max(0, inventory.reserved - reservation.quantity)
        });
        
        processed++;
      } catch (error) {
        logger.error(`Error processing expired reservation ${reservation._id}:`, error);
      }
    }
    
    logger.info(`Processed ${processed} expired reservations`);
    return processed;
  } catch (error) {
    logger.error('Error expiring reservations:', error);
    throw error;
  }
};