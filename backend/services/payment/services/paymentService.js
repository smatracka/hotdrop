const Payment = require('../models/payment');
const Transaction = require('../models/transaction');
const stripeService = require('./stripeService');
const paypalService = require('./paypalService');
const blikService = require('./providerService').blikService;
const { generatePaymentId, generateTransactionId } = require('../utils/helpers');
const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../config');

// Inicjalizacja płatności
exports.initializePayment = async (paymentData) => {
  try {
    const { orderId, amount, currency, method, seller, customer, redirectUrl } = paymentData;
    
    // Generuj unikalny identyfikator płatności
    const paymentId = generatePaymentId();
    
    // Ustaw datę wygaśnięcia (np. 2 minuty dla BLIK)
    const expiresAt = method === 'blik' ? new Date(Date.now() + 120000) : null;
    
    // Utwórz nową płatność
    const payment = new Payment({
      paymentId,
      orderId,
      amount,
      currency,
      method,
      seller,
      customer,
      status: 'pending',
      expiresAt
    });
    
    await payment.save();
    
    // Zainicjuj płatność u dostawcy
    let providerData = {};
    
    switch (method) {
      case 'blik':
        // Dla BLIK nie ma inicjacji u dostawcy, klient musi podać kod
        break;
      case 'card':
        providerData = await stripeService.createPaymentIntent(
          amount, 
          currency, 
          paymentId, 
          customer,
          redirectUrl
        );
        break;
      case 'paypal':
        providerData = await paypalService.createOrder(
          amount, 
          currency, 
          paymentId, 
          redirectUrl
        );
        break;
      default:
        throw new Error(`Nieobsługiwana metoda płatności: ${method}`);
    }
    
    // Aktualizuj płatność o dane z dostawcy
    payment.providerData = providerData;
    await payment.save();
    
    return payment;
  } catch (error) {
    logger.error(`Error initializing payment:`, error);
    throw error;
  }
};

// Weryfikacja płatności BLIK
exports.verifyBlikPayment = async (paymentId, blikCode) => {
  try {
    // Pobierz płatność
    const payment = await Payment.findOne({ paymentId });
    
    if (!payment) {
      throw new Error('Płatność nie została znaleziona');
    }
    
    if (payment.status !== 'pending') {
      throw new Error(`Nieprawidłowy status płatności: ${payment.status}`);
    }
    
    if (payment.method !== 'blik') {
      throw new Error('Ta płatność nie jest płatnością BLIK');
    }
    
    if (payment.expiresAt && payment.expiresAt < new Date()) {
      // Płatność wygasła, zaktualizuj status
      payment.status = 'failed';
      await payment.save();
      throw new Error('Płatność wygasła');
    }
    
    // Wykonaj weryfikację kodu BLIK u dostawcy
    const result = await blikService.verifyPayment(payment.paymentId, blikCode, payment.amount);
    
    // Aktualizuj płatność
    payment.status = result.success ? 'completed' : 'failed';
    payment.providerData = { ...payment.providerData, ...result.data };
    
    if (result.success) {
      payment.completedAt = new Date();
      
      // Utwórz transakcję
      await this.createTransaction({
        payment: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        type: 'payment',
        provider: 'blik',
        providerTransactionId: result.data.transactionId,
        status: 'completed'
      });
      
      // Powiadom główny serwis API o zmianie statusu płatności
      try {
        await axios.post(`${config.apiServiceUrl}/api/orders/${payment.orderId}/payment-status`, {
          status: 'paid',
          paymentId: payment.paymentId
        });
      } catch (notifyError) {
        logger.error(`Error notifying API service about payment status:`, notifyError);
        // Kontynuuj nawet jeśli powiadomienie nie powiodło się
      }
    }
    
    await payment.save();
    
    return payment;
  } catch (error) {
    logger.error(`Error verifying BLIK payment:`, error);
    throw error;
  }
};

// Pobieranie płatności według ID
exports.getPaymentById = async (id) => {
  try {
    return await Payment.findById(id);
  } catch (error) {
    logger.error(`Error getting payment by ID ${id}:`, error);
    throw error;
  }
};

// Pobieranie płatności sprzedawcy
exports.getPaymentsBySeller = async (sellerId, query = {}, options = {}) => {
  try {
    query.seller = sellerId;
    return await Payment.paginate(query, options);
  } catch (error) {
    logger.error(`Error getting payments for seller ${sellerId}:`, error);
    throw error;
  }
};

// Pobieranie statystyk płatności sprzedawcy
exports.getPaymentStats = async (sellerId, startDate, endDate) => {
  try {
    // Ustal zakres dat
    const dateRange = {};
    if (startDate) {
      dateRange.$gte = new Date(startDate);
    }
    if (endDate) {
      dateRange.$lte = new Date(endDate);
    }
    
    const query = { seller: sellerId };
    if (Object.keys(dateRange).length > 0) {
      query.createdAt = dateRange;
    }
    
    // Pobierz wszystkie płatności w zakresie dat
    const payments = await Payment.find(query);
    
    // Oblicz statystyki
    const stats = {
      totalRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refundedPayments: 0,
      averageOrderValue: 0,
      paymentMethods: {},
      dailyRevenue: []
    };
    
    // Mapa do śledzenia dziennych przychodów
    const dailyRevenueMap = {};
    
    payments.forEach(payment => {
      // Policz statusy płatności
      if (payment.status === 'completed') {
        stats.successfulPayments++;
        stats.totalRevenue += payment.amount;
        
        // Policz metody płatności
        if (!stats.paymentMethods[payment.method]) {
          stats.paymentMethods[payment.method] = 0;
        }
        stats.paymentMethods[payment.method]++;
        
        // Śledź dzienne przychody
        const dateStr = payment.completedAt.toISOString().split('T')[0];
        if (!dailyRevenueMap[dateStr]) {
          dailyRevenueMap[dateStr] = 0;
        }
        dailyRevenueMap[dateStr] += payment.amount;
      } else if (payment.status === 'failed') {
        stats.failedPayments++;
      } else if (payment.status === 'pending') {
        stats.pendingPayments++;
      } else if (payment.status === 'refunded') {
        stats.refundedPayments++;
      }
    });
    
    // Oblicz średnią wartość zamówienia
    if (stats.successfulPayments > 0) {
      stats.averageOrderValue = stats.totalRevenue / stats.successfulPayments;
    }
    
    // Konwertuj metody płatności na procenty
    const totalMethods = Object.values(stats.paymentMethods).reduce((a, b) => a + b, 0);
    if (totalMethods > 0) {
      Object.keys(stats.paymentMethods).forEach(method => {
        stats.paymentMethods[method] = (stats.paymentMethods[method] / totalMethods) * 100;
      });
    }
    
    // Konwertuj mapę dziennych przychodów na tablicę
    stats.dailyRevenue = Object.entries(dailyRevenueMap).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return stats;
  } catch (error) {
    logger.error(`Error getting payment stats for seller ${sellerId}:`, error);
    throw error;
  }
};

// Zwrot płatności
exports.refundPayment = async (paymentId, amount, reason) => {
  try {
    // Pobierz płatność
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new Error('Płatność nie została znaleziona');
    }
    
    if (payment.status !== 'completed') {
      throw new Error(`Nie można zwrócić płatności o statusie: ${payment.status}`);
    }
    
    // Jeśli nie podano kwoty, zwróć całą płatność
    amount = amount || payment.amount;
    
    if (amount > payment.amount) {
      throw new Error('Kwota zwrotu nie może przekraczać kwoty płatności');
    }
    
    // Wykonaj zwrot u dostawcy
    let refundResult;
    
    switch (payment.method) {
      case 'blik':
        refundResult = await blikService.refundPayment(payment, amount, reason);
        break;
      case 'card':
        refundResult = await stripeService.refundPayment(payment, amount, reason);
        break;
      case 'paypal':
        refundResult = await paypalService.refundPayment(payment, amount, reason);
        break;
      default:
        throw new Error(`Nieobsługiwana metoda płatności: ${payment.method}`);
    }
    
    // Aktualizuj płatność
    payment.status = amount === payment.amount ? 'refunded' : 'completed';
    payment.refundedAt = new Date();
    payment.providerData = { ...payment.providerData, refund: refundResult.data };
    await payment.save();
    
    // Utwórz transakcję zwrotu
    const refundTransaction = await this.createTransaction({
      payment: payment._id,
      amount: -amount, // Ujemna kwota dla zwrotu
      currency: payment.currency,
      type: 'refund',
      provider: payment.method,
      providerTransactionId: refundResult.data.refundId,
      status: 'completed',
      metadata: { reason }
    });
    
    return {
      payment,
      refund: refundTransaction
    };
  } catch (error) {
    logger.error(`Error refunding payment ${paymentId}:`, error);
    throw error;
  }
};

// Tworzenie transakcji
exports.createTransaction = async (transactionData) => {
  try {
    const { payment, amount, currency, type, provider, providerTransactionId, status, metadata } = transactionData;
    
    const transaction = new Transaction({
      transactionId: generateTransactionId(),
      payment,
      amount,
      currency,
      type,
      provider,
      providerTransactionId,
      status,
      metadata
    });
    
    await transaction.save();
    return transaction;
  } catch (error) {
    logger.error('Error creating transaction:', error);
    throw error;
  }
};

// Obsługa zdarzenia webhook od Stripe
exports.handleStripeWebhookEvent = async (event) => {
  try {
    logger.info(`Processing Stripe webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handleStripePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handleStripePaymentFailure(event.data.object);
        break;
      case 'charge.refunded':
        await this.handleStripeRefund(event.data.object);
        break;
      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    logger.error(`Error handling Stripe webhook event:`, error);
    throw error;
  }
};

// Obsługa zdarzenia webhook od PayPal
exports.handlePaypalWebhookEvent = async (event) => {
  try {
    logger.info(`Processing PayPal webhook event: ${event.event_type}`);
    
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await this.handlePaypalPaymentSuccess(event.resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await this.handlePaypalPaymentFailure(event.resource);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await this.handlePaypalRefund(event.resource);
        break;
      default:
        logger.info(`Unhandled PayPal event type: ${event.event_type}`);
    }
  } catch (error) {
    logger.error(`Error handling PayPal webhook event:`, error);
    throw error;
  }
};

// Obsługa zdarzenia webhook od BLIK
exports.handleBlikWebhookEvent = async (event) => {
  try {
    logger.info(`Processing BLIK webhook event: ${event.type}`);
    
    switch (event.type) {
      case 'payment.success':
        await this.handleBlikPaymentSuccess(event.data);
        break;
      case 'payment.failed':
        await this.handleBlikPaymentFailure(event.data);
        break;
      default:
        logger.info(`Unhandled BLIK event type: ${event.type}`);
    }
  } catch (error) {
    logger.error(`Error handling BLIK webhook event:`, error);
    throw error;
  }
};

// Obsługa sukcesu płatności Stripe
exports.handleStripePaymentSuccess = async (paymentIntent) => {
  try {
    // Pobierz identyfikator płatności z metadanych
    const paymentId = paymentIntent.metadata.paymentId;
    
    // Pobierz płatność
    const payment = await Payment.findOne({ paymentId });
    
    if (!payment) {
      throw new Error(`Nie znaleziono płatności o ID: ${paymentId}`);
    }
    
    // Aktualizuj płatność
    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.providerData = { ...payment.providerData, paymentIntent };
    await payment.save();
    
    // Utwórz transakcję
    await this.createTransaction({
      payment: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      type: 'payment',
      provider: 'stripe',
      providerTransactionId: paymentIntent.id,
      status: 'completed'
    });
    
    // Powiadom główny serwis API o zmianie statusu płatności
    try {
      await axios.post(`${config.apiServiceUrl}/api/orders/${payment.orderId}/payment-status`, {
        status: 'paid',
        paymentId: payment.paymentId
      });
    } catch (notifyError) {
      logger.error(`Error notifying API service about payment status:`, notifyError);
      // Kontynuuj nawet jeśli powiadomienie nie powiodło się
    }
  } catch (error) {
    logger.error(`Error handling Stripe payment success:`, error);
    throw error;
  }
};