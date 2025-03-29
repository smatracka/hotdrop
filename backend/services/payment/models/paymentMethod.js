const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['card', 'paypal'],
    required: true
  },
  default: {
    type: Boolean,
    default: false
  },
  details: {
    // Zaszyfrowane dane karty / tokeny
    last4: String,
    brand: String, // dla kart
    expiryMonth: String, // dla kart
    expiryYear: String, // dla kart
    email: String, // dla PayPal
    token: String, // Token dostawcy płatności
    tokenExpiry: Date
  },
  billingAddress: {
    name: String,
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);