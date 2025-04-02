const mongoose = require('mongoose');

const dropPageSchema = new mongoose.Schema({
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
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    hero: {
      title: String,
      subtitle: String,
      backgroundImage: String
    },
    description: String,
    features: [{
      title: String,
      description: String,
      icon: String
    }],
    countdown: {
      enabled: Boolean,
      title: String
    }
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

module.exports = mongoose.model('DropPage', dropPageSchema); 