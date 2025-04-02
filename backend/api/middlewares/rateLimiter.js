const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Drop-specific rate limiter (more strict)
const dropLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:drop:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many drop-related requests, please try again later.'
  }
});

// Queue-specific rate limiter (very strict)
const queueLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:queue:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many queue-related requests, please try again later.'
  }
});

// Cart reservation rate limiter
const cartLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:cart:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many cart-related requests, please try again later.'
  }
});

module.exports = {
  apiLimiter,
  dropLimiter,
  queueLimiter,
  cartLimiter
}; 