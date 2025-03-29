// backend/api/controllers/payment.js
// Kontroler płatności - obsługuje inicjację i weryfikację płatności BLIK

// Inicjuje proces płatności
exports.initPayment = async (req, res) => {
    try {
      const { orderId, amount, redirectUrl } = req.body;
      
      if (!orderId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'ID zamówienia i kwota są wymagane'
        });
      }
      
      // Zaślepka danych
      const payment = {
        paymentId: 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        orderId,
        amount,
        currency: 'PLN',
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 120000), // 2 minuty (czas na płatność BLIK)
        redirectUrl: redirectUrl || null
      };
      
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Płatność została zainicjowana pomyślnie'
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
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
      
      // Zaślepka danych - symulacja udanej płatności
      const payment = {
        paymentId,
        status: 'completed',
        completedAt: new Date()
      };
      
      res.status(200).json({
        success: true,
        data: payment,
        message: 'Płatność została zweryfikowana pomyślnie'
      });
    } catch (error) {
      console.error('Error verifying BLIK payment:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas weryfikacji płatności BLIK',
        error: error.message
      });
    }
  };
  
  // Obsługa webhooka od bramki płatności
  exports.handlePaymentWebhook = async (req, res) => {
    try {
      const payload = req.body;
      
      console.log('Otrzymano webhook płatności:', payload);
      
      // Zwróć 200 OK, aby bramka płatności wiedziała, że webhook został przyjęty
      res.status(200).json({
        success: true,
        message: 'Webhook został przyjęty'
      });
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas obsługi webhooka płatności',
        error: error.message
      });
    }
  };
  
  // Pobiera historię płatności sprzedawcy
  exports.getPaymentsBySeller = async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;
      
      // Zaślepka danych
      const payments = {
        docs: [
          {
            paymentId: 'PAY-ABCD1234',
            orderId: 'ORD-65FDCA12',
            amount: 349.99,
            currency: 'PLN',
            status: 'completed',
            createdAt: '2025-03-15T12:30:45Z',
            completedAt: '2025-03-15T12:32:10Z',
            method: 'blik'
          },
          {
            paymentId: 'PAY-EFGH5678',
            orderId: 'ORD-65FDCA13',
            amount: 199.50,
            currency: 'PLN',
            status: 'completed',
            createdAt: '2025-03-10T15:45:12Z',
            completedAt: '2025-03-10T15:47:05Z',
            method: 'blik'
          }
        ],
        totalDocs: 2,
        limit: parseInt(limit, 10),
        totalPages: 1,
        page: parseInt(page, 10),
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null
      };
      
      res.status(200).json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error(`Error fetching payments for seller ${req.params.sellerId}:`, error);
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
      
      // Zaślepka danych
      const stats = {
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
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error(`Error fetching payment stats for seller ${req.params.sellerId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas pobierania statystyk płatności',
        error: error.message
      });
    }
  };