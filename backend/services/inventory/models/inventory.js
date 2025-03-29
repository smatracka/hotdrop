const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const InventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0
  },
  available: {
    type: Number,
    default: 0,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  lowStockAlertSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Wirtualne pole do określenia statusu zapasów
InventorySchema.virtual('status').get(function() {
  if (this.quantity === 0) return 'out_of_stock';
  if (this.quantity <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Dodaj wtyczkę paginacji
InventorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Inventory', InventorySchema);