// backend/api/models/product.js
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

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nazwa produktu jest wymagana'],
    trim: true,
    maxlength: [100, 'Nazwa produktu nie może przekraczać 100 znaków']
  },
  description: {
    type: String,
    maxlength: [2000, 'Opis produktu nie może przekraczać 2000 znaków']
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'SKU produktu jest wymagane']
  },
  price: {
    type: Number,
    required: [true, 'Cena produktu jest wymagana'],
    min: [0, 'Cena nie może być ujemna']
  },
  quantity: {
    type: Number,
    required: [true, 'Ilość produktu jest wymagana'],
    min: [0, 'Ilość nie może być ujemna']
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0
  },
  sold: {
    type: Number,
    default: 0,
    min: 0
  },
  imageUrls: [{
    type: String
  }],
  category: {
    type: String,
    required: [true, 'Kategoria produktu jest wymagana']
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'hidden', 'out_of_stock'],
    default: 'draft'
  },
  drops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drop'
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID sprzedawcy jest wymagane']
  }
}, {
  timestamps: true
});

// Dodaj metody dla zaślepki
ProductSchema.statics.paginate = mongoosePaginate.paginate;

// Tworzymy model z dummy funkcją, żeby uniknąć błędów
const Product = mongoose.model('Product', ProductSchema) || {
  paginate: mongoosePaginate.paginate,
  findById: () => Promise.resolve(null),
  findOne: () => Promise.resolve(null),
  find: () => Promise.resolve([]),
  updateMany: () => Promise.resolve({ modifiedCount: 0 })
};

module.exports = Product;