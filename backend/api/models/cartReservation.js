const mongoose = require('mongoose');

const cartReservationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  dropId: {
    type: String,
    required: true,
    ref: 'Drop'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  products: [{
    productId: {
      type: String,
      required: true,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    variantId: {
      type: String,
      ref: 'ProductVariant'
    }
  }],
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying active reservations
cartReservationSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('CartReservation', cartReservationSchema); 