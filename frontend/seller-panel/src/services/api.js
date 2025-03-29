// frontend/seller-panel/src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Utwórz instancję axios z bazowym URL API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funkcja do symulowania opóźnień i mockowania odpowiedzi API
const mockResponse = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        data: {
          success: true,
          data,
          message: "OK"
        } 
      });
    }, delay);
  });
};

// Zastąp rzeczywiste wywołania API funkcjami symulującymi odpowiedzi
const originalGet = api.get;
api.get = function(url, config) {
  console.log(`Mock API GET: ${url}`);
  
  // Symulacja odpowiedzi dla różnych endpointów
  if (url.includes('/products')) {
    return mockResponse({
      docs: [
        {
          _id: '1',
          name: 'Produkt testowy 1',
          sku: 'TEST-001',
          category: 'Odzież',
          description: 'Opis produktu testowego 1',
          price: 99.99,
          quantity: 10,
          status: 'active',
          imageUrls: ['/images/placeholder-image.svg']
        },
        {
          _id: '2',
          name: 'Produkt testowy 2',
          sku: 'TEST-002',
          category: 'Elektronika',
          description: 'Opis produktu testowego 2',
          price: 199.99,
          quantity: 5,
          status: 'active',
          imageUrls: ['/images/placeholder-image.svg']
        },
        {
          _id: '3',
          name: 'Produkt testowy 3',
          sku: 'TEST-003',
          category: 'Akcesoria',
          description: 'Opis produktu testowego 3',
          price: 49.99,
          quantity: 20,
          status: 'active',
          imageUrls: ['/images/placeholder-image.svg']
        }
      ],
      totalDocs: 3,
      page: 1,
      totalPages: 1,
      limit: 10
    });
  } 
  else if (url.includes('/orders')) {
    return mockResponse({
      docs: [
        {
          _id: '1',
          orderNumber: 'ORDER-001',
          createdAt: new Date().toISOString(),
          customer: {
            name: 'Jan Kowalski',
            email: 'jan@example.com',
            phone: '123456789',
            address: {
              street: 'ul. Przykładowa 1',
              city: 'Warszawa',
              postalCode: '00-001',
              country: 'Polska'
            }
          },
          items: [
            {
              product: {
                _id: '1',
                name: 'Produkt testowy 1',
                sku: 'TEST-001',
                imageUrls: ['/images/placeholder-image.svg']
              },
              quantity: 2,
              price: 99.99,
              total: 199.98
            }
          ],
          totalAmount: 199.98,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'blik'
        },
        {
          _id: '2',
          orderNumber: 'ORDER-002',
          createdAt: new Date().toISOString(),
          customer: {
            name: 'Anna Nowak',
            email: 'anna@example.com',
            phone: '987654321',
            address: {
              street: 'ul. Testowa 2',
              city: 'Kraków',
              postalCode: '31-001',
              country: 'Polska'
            }
          },
          items: [
            {
              product: {
                _id: '2',
                name: 'Produkt testowy 2',
                sku: 'TEST-002',
                imageUrls: ['/images/placeholder-image.svg']
              },
              quantity: 1,
              price: 199.99,
              total: 199.99
            }
          ],
          totalAmount: 199.99,
          status: 'paid',
          paymentStatus: 'paid',
          paymentMethod: 'blik'
        }
      ],
      totalDocs: 2,
      page: 1,
      totalPages: 1,
      limit: 10,
      summary: {
        total: 2,
        pending: 1,
        paid: 1,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }
    });
  }
  else if (url.includes('/drops')) {
    return mockResponse({
      docs: [
        {
          _id: '1',
          name: 'Drop testowy 1',
          description: 'Opis dropu testowego 1',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          timeLimit: 10,
          status: 'published',
          products: ['1', '2'],
          customization: {
            headerColor: '#1a1a2e',
            buttonColor: '#4CAF50',
            fontColor: '#333333',
            backgroundColor: '#f8f9fa'
          }
        },
        {
          _id: '2',
          name: 'Drop testowy 2',
          description: 'Opis dropu testowego 2',
          startDate: new Date(Date.now() + 172800000).toISOString(),
          timeLimit: 15,
          status: 'draft',
          products: ['3'],
          customization: {
            headerColor: '#1a1a2e',
            buttonColor: '#4CAF50',
            fontColor: '#333333',
            backgroundColor: '#f8f9fa'
          }
        }
      ],
      totalDocs: 2,
      page: 1,
      totalPages: 1,
      limit: 10
    });
  }
  else if (url.includes('/customers')) {
    return mockResponse({
      docs: [
        {
          _id: '1',
          name: 'Jan Kowalski',
          email: 'jan@example.com',
          phone: '123456789',
          createdAt: new Date().toISOString(),
          ordersCount: 2,
          totalSpent: 399.98,
          lastOrder: new Date().toISOString(),
          consents: {
            newsletter: true,
            marketing: false
          },
          address: {
            street: 'ul. Przykładowa 1',
            city: 'Warszawa',
            postalCode: '00-001',
            country: 'Polska'
          }
        },
        {
          _id: '2',
          name: 'Anna Nowak',
          email: 'anna@example.com',
          phone: '987654321',
          createdAt: new Date().toISOString(),
          ordersCount: 1,
          totalSpent: 199.99,
          lastOrder: new Date().toISOString(),
          consents: {
            newsletter: true,
            marketing: true
          },
          address: {
            street: 'ul. Testowa 2',
            city: 'Kraków',
            postalCode: '31-001',
            country: 'Polska'
          }
        }
      ],
      totalDocs: 2,
      page: 1,
      totalPages: 1,
      limit: 10
    });
  }
  else if (url.includes('/reports')) {
    if (url.includes('/summary')) {
      return mockResponse({
        totalRevenue: 599.97,
        totalOrders: 3,
        averageOrderValue: 199.99,
        totalCustomers: 2,
        newCustomers: 1,
        revenueChange: 15.4,
        ordersChange: 10.2,
        aovChange: 5.3,
        customersChange: 8.7
      });
    } 
    else if (url.includes('/over-time')) {
      const dates = [];
      const revenues = [];
      const orders = [];
      const averages = [];
      
      // Generuj dane dla ostatnich 30 dni
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.unshift(date.toISOString());
        
        // Losowe przychody od 0 do 5000
        const revenue = Math.floor(Math.random() * 5000);
        revenues.unshift(revenue);
        
        // Losowa liczba zamówień od 0 do 10
        const orderCount = Math.floor(Math.random() * 10);
        orders.unshift(orderCount);
        
        // Średnia wartość zamówienia
        averages.unshift(orderCount > 0 ? revenue / orderCount : 0);
      }
      
      return mockResponse({
        dates,
        revenues,
        orders,
        averages
      });
    }
  }
  
  // Domyślna odpowiedź dla niezdefiniowanych endpointów
  return mockResponse({});
};

const originalPost = api.post;
api.post = function(url, data, config) {
  console.log(`Mock API POST: ${url}`, data);
  
  if (url.includes('/auth/login')) {
    return mockResponse({
      token: 'test-token-123456',
      user: {
        id: '123456',
        name: 'Testowy Użytkownik',
        email: data.email,
        company: {
          name: 'Testowa Firma',
          vatId: '1234567890',
          address: {
            street: 'ul. Testowa 1',
            city: 'Warszawa',
            postalCode: '00-001',
            country: 'Polska'
          }
        }
      }
    });
  }
  
  // Domyślna odpowiedź dla niezdefiniowanych endpointów
  return mockResponse({ id: Math.floor(Math.random() * 1000).toString() });
};

const originalPut = api.put;
api.put = function(url, data, config) {
  console.log(`Mock API PUT: ${url}`, data);
  return mockResponse({ ...data, updatedAt: new Date().toISOString() });
};

const originalPatch = api.patch;
api.patch = function(url, data, config) {
  console.log(`Mock API PATCH: ${url}`, data);
  return mockResponse({ success: true });
};

const originalDelete = api.delete;
api.delete = function(url, config) {
  console.log(`Mock API DELETE: ${url}`);
  return mockResponse({ success: true });
};

export default api;