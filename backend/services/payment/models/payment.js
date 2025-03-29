const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'PLN'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['blik', 'card', 'paypal'],
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    name: String,
    email: String
  },
  providerData: {
    type: Object // Dane specyficzne dla danego dostawcy płatności
  },
  expiresAt: {
    type: Date // Czas ważności płatności (np. dla BLIK)
  },
  completedAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  webhookEvents: [{
    eventId: String,
    eventType: String,
    timestamp: Date,
    data: Object
  }]
}, {
  timestamps: true
});

// Dodaj wtyczkę paginacji
PaymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Payment', PaymentSchema);