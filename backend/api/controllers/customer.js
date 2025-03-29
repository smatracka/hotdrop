// backend/api/controllers/customer.js
// Zaślepka kontrolera klienta, ponieważ nie mamy jeszcze modelu Customer
// W prawdziwym projekcie model Customer byłby używany lub customer byłby częścią modelu Order

// Pobiera wszystkich klientów sprzedawcy
exports.getCustomers = async (req, res) => {
    try {
      const { sellerId } = req.params;
      const { search, page = 1, limit = 10 } = req.query;
      
      // Zaślepka danych
      const customers = {
        docs: [
          {
            _id: '65fdca1234567890abcdef01',
            name: 'Jan Kowalski',
            email: 'jan.kowalski@example.com',
            phone: '+48123456789',
            ordersCount: 5,
            totalSpent: 1245.50
          },
          {
            _id: '65fdca1234567890abcdef02',
            name: 'Anna Nowak',
            email: 'anna.nowak@example.com',
            phone: '+48987654321',
            ordersCount: 3,
            totalSpent: 873.20
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
        data: customers
      });
    } catch (error) {
      console.error(`Error fetching customers for seller ${req.params.sellerId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas pobierania klientów',
        error: error.message
      });
    }
  };
  
  // Pobiera szczegóły klienta
  exports.getCustomer = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Zaślepka danych
      const customer = {
        _id: id,
        name: 'Jan Kowalski',
        email: 'jan.kowalski@example.com',
        phone: '+48123456789',
        address: {
          street: 'ul. Przykładowa 123',
          city: 'Warszawa',
          postalCode: '00-001',
          country: 'Polska'
        },
        orders: [
          {
            _id: '65fdca1234567890abcdef10',
            orderNumber: 'ORD-65FDCA12',
            date: '2025-03-15T12:30:45Z',
            status: 'delivered',
            total: 349.99
          },
          {
            _id: '65fdca1234567890abcdef11',
            orderNumber: 'ORD-65FDCA13',
            date: '2025-03-10T15:45:12Z',
            status: 'shipped',
            total: 199.50
          }
        ],
        createdAt: '2025-01-15T10:22:33Z'
      };
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Klient nie został znaleziony'
        });
      }
      
      res.status(200).json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error(`Error fetching customer ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas pobierania danych klienta',
        error: error.message
      });
    }
  };
  
  // Eksportuje dane klientów (RODO)
  exports.exportCustomerData = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Zaślepka danych
      const customerData = {
        personalInfo: {
          name: 'Jan Kowalski',
          email: 'jan.kowalski@example.com',
          phone: '+48123456789',
          address: {
            street: 'ul. Przykładowa 123',
            city: 'Warszawa',
            postalCode: '00-001',
            country: 'Polska'
          }
        },
        orders: [
          {
            orderNumber: 'ORD-65FDCA12',
            date: '2025-03-15T12:30:45Z',
            items: [
              {
                productName: 'T-shirt "Summer Vibes"',
                quantity: 1,
                price: 99.99
              }
            ],
            total: 349.99,
            shippingAddress: {
              street: 'ul. Przykładowa 123',
              city: 'Warszawa',
              postalCode: '00-001',
              country: 'Polska'
            }
          }
        ],
        consents: {
          marketing: true,
          newsletter: false,
          dataProcessing: true
        },
        loginHistory: [
          {
            date: '2025-03-20T08:12:33Z',
            ipAddress: '192.168.1.1'
          }
        ]
      };
      
      res.status(200).json({
        success: true,
        data: customerData,
        message: 'Dane klienta zostały wyeksportowane pomyślnie'
      });
    } catch (error) {
      console.error(`Error exporting data for customer ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas eksportowania danych klienta',
        error: error.message
      });
    }
  };
  
  // Usuwa dane klienta (RODO)
  exports.deleteCustomerData = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Zaślepka procesu usuwania danych
      // W prawdziwym projekcie usunęlibyśmy lub zanonimizowali dane klienta
      
      res.status(200).json({
        success: true,
        message: 'Dane klienta zostały usunięte lub zanonimizowane pomyślnie'
      });
    } catch (error) {
      console.error(`Error deleting data for customer ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Błąd podczas usuwania danych klienta',
        error: error.message
      });
    }
  };