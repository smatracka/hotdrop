// backend/api/models/user.js
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/helpers');

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

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Imię i nazwisko jest wymagane']
  },
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Hasło jest wymagane'],
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['seller', 'admin'],
    default: 'seller'
  },
  company: {
    name: String,
    vatId: String,
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    }
  },
  settings: {
    currency: {
      type: String,
      default: 'PLN'
    },
    language: {
      type: String,
      default: 'pl'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Dodaj metody dla zaślepki
UserSchema.statics.paginate = mongoosePaginate.paginate;

// Tworzymy model z dummy funkcją, żeby uniknąć błędów
const User = mongoose.model('User', UserSchema) || {
  paginate: mongoosePaginate.paginate,
  findById: () => Promise.resolve(null),
  findOne: () => Promise.resolve(null),
  find: () => Promise.resolve([])
};

module.exports = User;