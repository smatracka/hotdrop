const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.defaultTTL = 3600; // 1 hour in seconds
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const stringValue = JSON.stringify(value);
      await this.redis.set(key, stringValue, 'EX', ttl);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  }

  // Drop-specific cache methods
  async getDrop(dropId) {
    return this.get(`drop:${dropId}`);
  }

  async setDrop(dropId, drop, ttl = this.defaultTTL) {
    return this.set(`drop:${dropId}`, drop, ttl);
  }

  async delDrop(dropId) {
    return this.del(`drop:${dropId}`);
  }

  // Queue-specific cache methods
  async getQueue(dropId) {
    return this.get(`queue:${dropId}`);
  }

  async setQueue(dropId, queue, ttl = 60) { // 1 minute TTL for queue data
    return this.set(`queue:${dropId}`, queue, ttl);
  }

  async delQueue(dropId) {
    return this.del(`queue:${dropId}`);
  }

  // Cart reservation cache methods
  async getCartReservation(reservationId) {
    return this.get(`cart:${reservationId}`);
  }

  async setCartReservation(reservationId, reservation, ttl = 900) { // 15 minutes TTL for cart reservations
    return this.set(`cart:${reservationId}`, reservation, ttl);
  }

  async delCartReservation(reservationId) {
    return this.del(`cart:${reservationId}`);
  }

  // Seller's drops cache methods
  async getSellerDrops(sellerId, page = 1, limit = 10) {
    return this.get(`seller:${sellerId}:drops:${page}:${limit}`);
  }

  async setSellerDrops(sellerId, drops, page = 1, limit = 10, ttl = 300) { // 5 minutes TTL for seller's drops list
    return this.set(`seller:${sellerId}:drops:${page}:${limit}`, drops, ttl);
  }

  async delSellerDrops(sellerId) {
    return this.delPattern(`seller:${sellerId}:drops:*`);
  }
}

module.exports = new CacheService(); 