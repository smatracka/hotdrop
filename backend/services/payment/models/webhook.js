const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const WebhookSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'blik'],
    required: true
  },
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  eventType: {
    type: String,
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  paymentId: String, // ID płatności wewnątrz systemu dostawcy
  data: {
    type: Object,
    required: true
  },
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  processingError: String,
  processingAttempts: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  receivedAt: {
    type: Date,
    default: Date.now
  },
  headers: Object, // Nagłówki HTTP otrzymane z webhookiem
  ipAddress: String // Adres IP, z którego otrzymano webhook
}, {
  timestamps: true
});

// Dodaj indeksy dla często wyszukiwanych pól
WebhookSchema.index({ provider: 1, eventId: 1 }, { unique: true });
WebhookSchema.index({ payment: 1 });
WebhookSchema.index({ processed: 1 });
WebhookSchema.index({ verified: 1 });
WebhookSchema.index({ createdAt: -1 });

// Dodaj wtyczkę paginacji
WebhookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Webhook', WebhookSchema);