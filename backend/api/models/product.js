
// models/product.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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

// Dodaj wtyczkę paginacji
ProductSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', ProductSchema);
