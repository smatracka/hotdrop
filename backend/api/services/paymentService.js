// backend/api/services/paymentService.js
const Order = require('../models/order');
const { generateTransactionId } = require('../utils/helpers');

/**
 * Inicjalizuje płatność
 * 
 * @param {Object} paymentData - Dane płatności
 * @returns {Promise<Object>} - Dane zainicjowanej płatności
 */
exports.initPayment = async (paymentData) => {
  const { orderId, amount, redirectUrl } = paymentData;
  
  try {
    // Sprawdź, czy zamówienie istnieje
    // W rzeczywistym projekcie: const order = await Order.findById(orderId);
    
    // Wygeneruj ID płatności
    const paymentId = 'PAY-' + generateTransactionId();
    
    // W rzeczywistym projekcie integrowalibyśmy się z bramką płatności
    
    // Zaślepka danych
    const payment = {
      paymentId,
      orderId,
      amount,
      currency: 'PLN',
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 120000), // 2 minuty (czas na płatność BLIK)
      redirectUrl: redirectUrl || null
    };
    
    // Aktualizacja zamówienia o ID płatności
    // W rzeczywistym projekcie:
    // await Order.findByIdAndUpdate(orderId, {
    //   paymentId,
    //   paymentStatus: 'pending'
    // });
    
    console.log(`Updated order ${orderId} with payment ID ${paymentId}`);
    
    return payment;
  } catch (error) {
    throw new Error(`Error initializing payment: ${error.message}`);
  }
};

/**
 * Weryfikuje płatność BLIK
 * 
 * @param {string} paymentId - ID płatności
 * @param {string} blikCode - Kod BLIK
 * @returns {Promise<Object>} - Dane płatności po weryfikacji
 */
exports.verifyBlikPayment = async (paymentId, blikCode) => {
  try {
    // Sprawdź czy kod BLIK ma prawidłowy format (6 cyfr)
    if (!/^\d{6}$/.test(blikCode)) {
      throw new Error('Nieprawidłowy format kodu BLIK');
    }
    
    // W rzeczywistym projekcie sprawdzalibyśmy płatność w bramce płatności
    
    // Zaślepka danych - symulacja udanej płatności
    const payment = {
      paymentId,
      status: 'completed',
      completedAt: new Date()
    };
    
    // Aktualizacja zamówienia po udanej płatności
    // W rzeczywistym projekcie:
    // const order = await Order.findOne({ paymentId });
    // if (order) {
    //   order.paymentStatus = 'completed';
    //   order.status = 'paid';
    //   await order.save();
    // }
    
    console.log(`Updated order status for payment ${paymentId} to 'paid'`);
    
    return payment;
  } catch (error) {
    throw new Error(`Error verifying BLIK payment: ${error.message}`);
  }
};

/**
 * Obsługuje webhook płatności
 * 
 * @param {Object} payload - Dane webhooka
 * @returns {Promise<boolean>} - Czy webhook został poprawnie obsłużony
 */
exports.handlePaymentWebhook = async (payload) => {
  try {
    const { paymentId, status, transactionId } = payload;
    
    // W rzeczywistym projekcie weryfikowalibyśmy podpis webhooka
    
    // Aktualizacja statusu płatności w zamówieniu
    if (status === 'completed' || status === 'failed') {
      // W rzeczywistym projekcie:
      // const order = await Order.findOne({ paymentId });
      // if (order) {
      //   order.paymentStatus = status;
      //   if (status === 'completed') {
      //     order.status = 'paid';
      //   }
      //   await order.save();
      // }
      
      console.log(`Updated order status for payment ${paymentId} to '${status}'`);
    }
    
    return true;
  } catch (error) {
    throw new Error(`Error handling payment webhook: ${error.message}`);
  }
};

/**
 * Pobiera historię płatności dla sprzedawcy
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} options - Opcje filtrowania i paginacji
 * @returns {Promise<Object>} - Paginowane płatności
 */
exports.getPaymentsBySeller = async (sellerId, options = {}) => {
  try {
    // W rzeczywistym projekcie pobieralibyśmy płatności z bazy danych
    
    // Zaślepka danych
    return {
      docs: [
        {
          paymentId: 'PAY-ABCD1234',
          orderId: 'ORD-32456',
          amount: 349.99,
          currency: 'PLN',
          status: 'completed',
          createdAt: '2025-03-15T12:30:45Z',
          completedAt: '2025-03-15T12:32:10Z',
          method: 'blik'
        },
        {
          paymentId: 'PAY-EFGH5678',
          orderId: 'ORD-32457',
          amount: 199.50,
          currency: 'PLN',
          status: 'completed',
          createdAt: '2025-03-10T15:45:12Z',
          completedAt: '2025-03-10T15:47:05Z',
          method: 'blik'
        }
      ],
      totalDocs: 2,
      limit: options.limit || 10,
      totalPages: 1,
      page: options.page || 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null
    };
  } catch (error) {
    throw new Error(`Error fetching payments: ${error.message}`);
  }
};

/**
 * Pobiera statystyki płatności
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} options - Opcje zakresu dat
 * @returns {Promise<Object>} - Statystyki płatności
 */
exports.getPaymentStats = async (sellerId, options = {}) => {
  try {
    // W rzeczywistym projekcie obliczalibyśmy statystyki na podstawie danych z bazy
    
    // Zaślepka danych
    return {
      totalRevenue: 12345.67,
      successfulPayments: 123,
      failedPayments: 5,
      averageOrderValue: 100.37,
      paymentMethods: {
        blik: 95.2, // procent
        card: 4.8    // procent
      },
      dailyRevenue: [
        { date: '2025-03-01', revenue: 1234.56 },
        { date: '2025-03-02', revenue: 2345.67 },
        { date: '2025-03-03', revenue: 3456.78 }
      ]
    };
  } catch (error) {
    throw new Error(`Error fetching payment statistics: ${error.message}`);
  }
};