const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'fee'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'PLN'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  provider: {
    type: String,
    required: true
  },
  providerTransactionId: {
    type: String
  },
  providerFee: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

// Dodaj wtyczkę paginacji
TransactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', TransactionSchema);