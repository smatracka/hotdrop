// backend/api/services/orderService.js
const Order = require('../models/order');
const Product = require('../models/product');
const Drop = require('../models/drop');
const { generateTransactionId } = require('../utils/helpers');

/**
 * Pobiera wszystkie zamówienia dla danego sprzedawcy z filtrowaniem i paginacją
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} options - Opcje filtrowania i paginacji
 * @returns {Promise<Object>} - Paginowane zamówienia
 */
exports.getOrders = async (sellerId, options = {}) => {
  const { status, page = 1, limit = 10, sort, order } = options;
  
  const query = { seller: sellerId };
  
  // Filtrowanie po statusie
  if (status) {
    query.status = status;
  }
  
  // Opcje sortowania
  const sortOptions = {};
  if (sort) {
    sortOptions[sort] = order === 'desc' ? -1 : 1;
  } else {
    sortOptions.createdAt = -1; // Domyślnie sortuj po dacie utworzenia (od najnowszych)
  }
  
  // Opcje paginacji
  const paginationOptions = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: sortOptions,
    populate: [
      { path: 'drop' },
      { path: 'items.product' }
    ]
  };
  
  try {
    // W rzeczywistym projekcie: return await Order.paginate(query, paginationOptions);
    
    // Zaślepka danych
    return {
      docs: [
        {
          _id: '65fdca1234567890abcdef40',
          orderNumber: 'ORD-32456',
          customer: {
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
          items: [
            {
              product: {
                _id: '65fdca1234567890abcdef30',
                name: 'T-shirt "Summer Vibes"',
                sku: 'TS-001'
              },
              quantity: 2,
              price: 99.99,
              total: 199.98
            },
            {
              product: {
                _id: '65fdca1234567890abcdef31',
                name: 'Bluza "Spring Collection"',
                sku: 'BL-002'
              },
              quantity: 1,
              price: 199.99,
              total: 199.99
            }
          ],
          drop: {
            _id: '65fdca1234567890abcdef20',
            name: 'Letnia Kolekcja 2025'
          },
          seller: sellerId,
          totalAmount: 399.97,
          status: 'paid',
          paymentMethod: 'blik',
          paymentId: 'PAY-ABCD1234',
          paymentStatus: 'completed',
          createdAt: new Date('2025-03-15T12:30:45Z'),
          updatedAt: new Date('2025-03-15T12:32:10Z')
        }
      ],
      totalDocs: 1,
      limit: parseInt(limit),
      totalPages: 1,
      page: parseInt(page),
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null
    };
  } catch (error) {
    throw new Error(`Error fetching orders: ${error.message}`);
  }
};

/**
 * Pobiera zamówienie po ID
 * 
 * @param {string} id - ID zamówienia
 * @returns {Promise<Object>} - Szczegóły zamówienia
 */
exports.getOrderById = async (id) => {
  try {
    // W rzeczywistym projekcie: return await Order.findById(id).populate('drop items.product');
    
    // Zaślepka
    return {
      _id: id,
      orderNumber: 'ORD-' + id.substring(id.length - 8),
      customer: {
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
      items: [
        {
          product: {
            _id: '65fdca1234567890abcdef30',
            name: 'T-shirt "Summer Vibes"',
            sku: 'TS-001'
          },
          quantity: 2,
          price: 99.99,
          total: 199.98
        },
        {
          product: {
            _id: '65fdca1234567890abcdef31',
            name: 'Bluza "Spring Collection"',
            sku: 'BL-002'
          },
          quantity: 1,
          price: 199.99,
          total: 199.99
        }
      ],
      drop: {
        _id: '65fdca1234567890abcdef20',
        name: 'Letnia Kolekcja 2025'
      },
      seller: '65fdca1234567890abcdef00',
      totalAmount: 399.97,
      status: 'paid',
      paymentMethod: 'blik',
      paymentId: 'PAY-ABCD1234',
      paymentStatus: 'completed',
      notes: '',
      createdAt: new Date('2025-03-15T12:30:45Z'),
      updatedAt: new Date('2025-03-15T12:32:10Z')
    };
  } catch (error) {
    throw new Error(`Error fetching order: ${error.message}`);
  }
};

/**
 * Tworzy nowe zamówienie
 * 
 * @param {Object} orderData - Dane zamówienia
 * @returns {Promise<Object>} - Utworzone zamówienie
 */
exports.createOrder = async (orderData) => {
  try {
    const { items, drop: dropId, seller } = orderData;
    
    // Generowanie numeru zamówienia
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase().substring(0, 8);
    
    // Weryfikacja dostępności produktów
    // W rzeczywistym projekcie sprawdzalibyśmy stan magazynowy
    
    // Obliczanie łącznej kwoty
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    
    // Tworzenie zamówienia
    // W rzeczywistym projekcie:
    // const order = new Order({
    //   ...orderData,
    //   orderNumber,
    //   totalAmount
    // });
    // await order.save();
    
    // Zaślepka
    const order = {
      _id: '65fdca1234567890abcdef' + Math.floor(Math.random() * 100),
      ...orderData,
      orderNumber,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Aktualizacja stanu magazynowego
    // W rzeczywistym projekcie:
    // await Promise.all(items.map(async (item) => {
    //   await Product.findByIdAndUpdate(item.product, {
    //     $inc: { quantity: -item.quantity, reserved: item.quantity }
    //   });
    // }));
    
    console.log(`Reserving items for order ${orderNumber}`);
    
    // Aktualizacja statystyk dropu
    // W rzeczywistym projekcie:
    // await Drop.findByIdAndUpdate(dropId, {
    //   $inc: { 'statistics.orders': 1 }
    // });
    
    console.log(`Updating drop ${dropId} statistics`);
    
    return order;
  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
};

/**
 * Aktualizuje status zamówienia
 * 
 * @param {string} id - ID zamówienia
 * @param {string} status - Nowy status
 * @returns {Promise<Object>} - Zaktualizowane zamówienie
 */
exports.updateOrderStatus = async (id, status) => {
  try {
    // W rzeczywistym projekcie:
    // const order = await Order.findById(id);
    // if (!order) throw new Error('Zamówienie nie zostało znalezione');
    
    // Zaślepka
    const order = await exports.getOrderById(id);
    
    // Aktualizacja statusu
    order.status = status;
    order.updatedAt = new Date();
    
    // Jeśli status to "delivered", aktualizujemy zarezerwowane produkty na sprzedane
    if (status === 'delivered') {
      // W rzeczywistym projekcie:
      // await Promise.all(order.items.map(async (item) => {
      //   await Product.findByIdAndUpdate(item.product, {
      //     $inc: { reserved: -item.quantity, sold: item.quantity }
      //   });
      // }));
      
      console.log(`Updating products sales statistics for order ${order.orderNumber}`);
    }
    
    // Jeśli status to "cancelled", przywracamy zarezerwowane produkty do stanu magazynowego
    if (status === 'cancelled') {
      // W rzeczywistym projekcie:
      // await Promise.all(order.items.map(async (item) => {
      //   await Product.findByIdAndUpdate(item.product, {
      //     $inc: { quantity: item.quantity, reserved: -item.quantity }
      //   });
      // }));
      
      console.log(`Restoring reserved products for cancelled order ${order.orderNumber}`);
    }
    
    // W rzeczywistym projekcie: await order.save();
    
    return order;
  } catch (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }
};

/**
 * Pobiera zamówienia dla dropu
 * 
 * @param {string} dropId - ID dropu
 * @param {Object} options - Opcje paginacji
 * @returns {Promise<Object>} - Paginowane zamówienia
 */
exports.getOrdersByDrop = async (dropId, options = {}) => {
  try {
    // Sprawdź czy drop istnieje
    // W rzeczywistym projekcie: const drop = await Drop.findById(dropId);
    
    // Zaślepka danych dla listy zamówień dropu
    return {
      docs: [
        {
          _id: '65fdca1234567890abcdef40',
          orderNumber: 'ORD-32456',
          customer: {
            name: 'Jan Kowalski',
            email: 'jan.kowalski@example.com'
          },
          totalAmount: 399.97,
          status: 'paid',
          paymentStatus: 'completed',
          createdAt: new Date('2025-03-15T12:30:45Z')
        },
        {
          _id: '65fdca1234567890abcdef41',
          orderNumber: 'ORD-32457',
          customer: {
            name: 'Anna Nowak',
            email: 'anna.nowak@example.com'
          },
          totalAmount: 299.98,
          status: 'shipped',
          paymentStatus: 'completed',
          createdAt: new Date('2025-03-15T13:45:12Z')
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
    throw new Error(`Error fetching orders for drop: ${error.message}`);
  }
};

/**
 * Generuje fakturę dla zamówienia
 * 
 * @param {string} id - ID zamówienia
 * @returns {Promise<Object>} - Dane faktury
 */
exports.generateInvoice = async (id) => {
  try {
    // W rzeczywistym projekcie:
    // const order = await Order.findById(id).populate('drop items.product');
    
    // Zaślepka
    const order = await exports.getOrderById(id);
    
    // Generowanie numeru faktury
    const invoiceNumber = `FV/${new Date().getFullYear()}/${order.orderNumber}`;
    
    // Przygotowanie danych faktury
    const invoiceData = {
      invoiceNumber,
      orderNumber: order.orderNumber,
      customer: order.customer,
      seller: {
        name: 'Nasza Firma Sp. z o.o.',
        vatId: 'PL1234567890',
        address: {
          street: 'ul. Biznesowa 10',
          city: 'Warszawa',
          postalCode: '00-001',
          country: 'Polska'
        }
      },
      items: order.items,
      totalAmount: order.totalAmount,
      taxRate: 23,
      taxAmount: +(order.totalAmount * 0.23).toFixed(2),
      netAmount: +(order.totalAmount / 1.23).toFixed(2),
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dni
      paymentMethod: order.paymentMethod,
      isPaid: order.paymentStatus === 'completed',
      notes: ''
    };
    
    // W rzeczywistym projekcie generowalibyśmy tutaj plik PDF
    
    return {
      ...invoiceData,
      invoiceUrl: `/invoices/${order.orderNumber}.pdf`
    };
  } catch (error) {
    throw new Error(`Error generating invoice: ${error.message}`);
  }
};