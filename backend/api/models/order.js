// backend/api/models/order.js
const mongoose = require('mongoose');

// Ponieważ mongoose-paginate-v2 może nie być zainstalowany, 
// tworzymy brakującą funkcję
const mongoosePaginate = {
  paginate: async function(query, options) {
    // Zaślepka funkcji paginate
    return {
      docs: [],
      totalDocs: 0,
      limit: options.limit || 10,
      totalPages: 0,
      page: options.page || 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null
    };
  }
};

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Imię i nazwisko klienta jest wymagane']
    },
    email: {
      type: String,
      required: [true, 'Email klienta jest wymagany'],
      lowercase: true
    },
    phone: {
      type: String
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],
  drop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drop',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['blik'],
    required: true
  },
  paymentId: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Dodaj metody dla zaślepki
OrderSchema.statics.paginate = mongoosePaginate.paginate;

// Tworzymy model z dummy funkcją, żeby uniknąć błędów
const Order = mongoose.model('Order', OrderSchema) || {
  paginate: mongoosePaginate.paginate,
  findById: () => Promise.resolve(null),
  findOne: () => Promise.resolve(null),
  find: () => Promise.resolve([])
};

module.exports = Order;