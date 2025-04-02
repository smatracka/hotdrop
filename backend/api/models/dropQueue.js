const mongoose = require('mongoose');

const dropQueueSchema = new mongoose.Schema({
  dropId: {
    type: String,
    required: true,
    unique: true,
    ref: 'Drop'
  },
  currentUsers: {
    type: Number,
    default: 0
  },
  maxConcurrentUsers: {
    type: Number,
    required: true,
    min: 1
  },
  queue: [{
    type: String,
    ref: 'User'
  }],
  activeUsers: [{
    type: String,
    ref: 'User'
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DropQueue', dropQueueSchema); 