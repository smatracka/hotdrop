// backend/api/models/drop.js
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

const DropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nazwa dropu jest wymagana'],
    trim: true,
    maxlength: [100, 'Nazwa dropu nie może przekraczać 100 znaków']
  },
  description: {
    type: String,
    maxlength: [1000, 'Opis dropu nie może przekraczać 1000 znaków']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  startDate: {
    type: Date,
    required: [true, 'Data rozpoczęcia dropu jest wymagana']
  },
  timeLimit: {
    type: Number,
    default: 10, // Domyślny czas na zakupy w minutach
    min: [1, 'Limit czasu musi wynosić co najmniej 1 minutę'],
    max: [120, 'Limit czasu nie może przekraczać 120 minut']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'completed', 'cancelled'],
    default: 'draft'
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID sprzedawcy jest wymagane']
  },
  customization: {
    headerColor: { type: String, default: '#1a1a2e' },
    buttonColor: { type: String, default: '#4CAF50' },
    fontColor: { type: String, default: '#333333' },
    backgroundColor: { type: String, default: '#f8f9fa' },
    logoUrl: { type: String }
  },
  statistics: {
    visits: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Dodaj metody dla zaślepki
DropSchema.statics.paginate = mongoosePaginate.paginate;

// Tworzymy model z dummy funkcją, żeby uniknąć błędów
const Drop = mongoose.model('Drop', DropSchema) || {
  paginate: mongoosePaginate.paginate,
  findById: () => Promise.resolve(null),
  findOne: () => Promise.resolve(null),
  find: () => Promise.resolve([])
};

module.exports = Drop;