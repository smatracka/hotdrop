const Reservation = require('../models/reservation');
const reservationService = require('../services/reservationService');
const inventoryService = require('../services/inventoryService');
const logger = require('../utils/logger');

// Utworzenie rezerwacji
exports.createReservation = async (req, res) => {
  try {
    const { productId, quantity, sessionId } = req.body;
    
    if (!productId || !quantity || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Wymagane są identyfikator produktu, ilość i identyfikator sesji'
      });
    }
    
    // Sprawdzanie dostępności
    const inventory = await inventoryService.getProductStock(productId);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Produkt nie został znaleziony'
      });
    }
    
    if (inventory.available < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Niewystarczająca ilość produktu',
        data: {
          available: inventory.available,
          requested: quantity
        }
      });
    }
    
    // Tworzenie rezerwacji
    const reservation = await reservationService.createReservation(productId, quantity, sessionId);
    
    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Rezerwacja została utworzona pomyślnie'
    });
  } catch (error) {
    logger.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas tworzenia rezerwacji',
      error: error.message
    });
  }
};

// Sprawdzenie statusu rezerwacji
exports.getReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await reservationService.getReservation(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie została znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: reservation._id,
        status: reservation.status,
        expiresAt: reservation.expiresAt,
        product: reservation.product,
        quantity: reservation.quantity
      }
    });
  } catch (error) {
    logger.error(`Error checking reservation status ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas sprawdzania statusu rezerwacji',
      error: error.message
    });
  }
};

// Potwierdzenie rezerwacji
exports.confirmReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Wymagany jest identyfikator zamówienia'
      });
    }
    
    const reservation = await reservationService.confirmReservation(id, orderId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie została znaleziona lub wygasła'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation,
      message: 'Rezerwacja została potwierdzona pomyślnie'
    });
  } catch (error) {
    logger.error(`Error confirming reservation ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas potwierdzania rezerwacji',
      error: error.message
    });
  }
};

// Anulowanie rezerwacji
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await reservationService.cancelReservation(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Rezerwacja nie została znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Rezerwacja została anulowana pomyślnie'
    });
  } catch (error) {
    logger.error(`Error cancelling reservation ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas anulowania rezerwacji',
      error: error.message
    });
  }
};

// Pobieranie aktywnych rezerwacji dla produktu
exports.getProductReservations = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const reservations = await reservationService.getProductReservations(productId, options);
    
    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    logger.error(`Error fetching reservations for product ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania rezerwacji dla produktu',
      error: error.message
    });
  }
};

// Pobieranie wszystkich rezerwacji dla sprzedawcy
exports.getSellerReservations = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: 'product'
    };
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const reservations = await reservationService.getSellerReservations(sellerId, query, options);
    
    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    logger.error(`Error fetching reservations for seller ${req.params.sellerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania rezerwacji dla sprzedawcy',
      error: error.message
    });
  }
};