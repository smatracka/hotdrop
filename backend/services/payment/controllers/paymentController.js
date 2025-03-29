const Payment = require('../models/payment');
const Transaction = require('../models/transaction');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');
const { generatePaymentId } = require('../utils/helpers');

// Inicjuje proces płatności
exports.initPayment = async (req, res) => {
  try {
    const { orderId, amount, currency = 'PLN', method, sellerId, redirectUrl, customer } = req.body;
    
    if (!orderId || !amount || !method || !sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Brakujące wymagane pola'
      });
    }
    
    const paymentData = {
      orderId,
      amount,
      currency,
      method,
      seller: sellerId,
      customer,
      redirectUrl
    };
    
    const payment = await paymentService.initializePayment(paymentData);
    
    res.status(200).json({
      success: true,
      data: payment,
      message: 'Płatność została zainicjowana pomyślnie'
    });
  } catch (error) {
    logger.error('Error initializing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas inicjowania płatności',
      error: error.message
    });
  }
};

// Weryfikacja płatności BLIK
exports.verifyBlikPayment = async (req, res) => {
  try {
    const { paymentId, blikCode } = req.body;
    
    if (!paymentId || !blikCode) {
      return res.status(400).json({
        success: false,
        message: 'ID płatności i kod BLIK są wymagane'
      });
    }
    
    // Sprawdź czy kod BLIK ma prawidłowy format (6 cyfr)
    if (!/^\d{6}$/.test(blikCode)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowy format kodu BLIK'
      });
    }
    
    const payment = await paymentService.verifyBlikPayment(paymentId, blikCode);
    
    res.status(200).json({
      success: true,
      data: payment,
      message: 'Płatność została zweryfikowana pomyślnie'
    });
  } catch (error) {
    logger.error('Error verifying BLIK payment:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas weryfikacji płatności BLIK',
      error: error.message
    });
  }
};

// Pobiera historię płatności sprzedawcy
exports.getPaymentsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, page = 1, limit = 10, startDate, endDate } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const query = { seller: sellerId };
    
    // Filtruj po statusie
    if (status) {
      query.status = status;
    }
    
    // Filtruj po okresie
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    const payments = await paymentService.getPaymentsBySeller(sellerId, query, options);
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    logger.error(`Error fetching payments for seller ${req.params.sellerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania historii płatności',
      error: error.message
    });
  }
};

// Pobiera statystyki płatności sprzedawcy
exports.getPaymentStats = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await paymentService.getPaymentStats(sellerId, startDate, endDate);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Error fetching payment stats for seller ${req.params.sellerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania statystyk płatności',
      error: error.message
    });
  }
};

// Pobiera szczegóły płatności
exports.getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await paymentService.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Płatność nie została znaleziona'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error(`Error fetching payment details for payment ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania szczegółów płatności',
      error: error.message
    });
  }
};

// Inicjuje zwrot płatności
exports.refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    
    const refund = await paymentService.refundPayment(id, amount, reason);
    
    res.status(200).json({
      success: true,
      data: refund,
      message: 'Zwrot płatności został zainicjowany pomyślnie'
    });
  } catch (error) {
    logger.error(`Error refunding payment ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas inicjowania zwrotu płatności',
      error: error.message
    });
  }
};