const cron = require('node-cron');
const Drop = require('../models/drop');
const DropQueue = require('../models/dropQueue');
const cacheService = require('./cache');
const { logger } = require('./monitoring');

class CacheWarmer {
  constructor() {
    this.warmingInProgress = false;
    this.maxConcurrentWarming = 5;
    this.warmingQueue = [];
    this.activeWarming = new Set();
    this.scheduleWarming();
  }

  scheduleWarming() {
    // Warm cache every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.warmCache();
    });
  }

  async warmCache() {
    if (this.warmingInProgress) {
      logger.info('Cache warming already in progress, skipping');
      return;
    }

    this.warmingInProgress = true;
    logger.info('Starting cache warming');

    try {
      // Get all active drops with priority
      const activeDrops = await Drop.find({
        status: 'published',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).sort({ priority: -1, startDate: 1 });

      // Queue drops for warming
      for (const drop of activeDrops) {
        this.warmingQueue.push({
          drop,
          priority: this.calculateDropPriority(drop)
        });
      }

      // Process warming queue
      await this.processWarmingQueue();

      logger.info('Cache warming completed successfully');
    } catch (error) {
      logger.error('Error during cache warming:', error);
    } finally {
      this.warmingInProgress = false;
    }
  }

  calculateDropPriority(drop) {
    const now = new Date();
    const timeToStart = drop.startDate - now;
    const timeToEnd = drop.endDate - now;
    
    // Higher priority for drops starting soon
    if (timeToStart > 0 && timeToStart < 5 * 60 * 1000) { // 5 minutes
      return 100;
    }
    
    // High priority for active drops
    if (timeToStart <= 0 && timeToEnd > 0) {
      return 90;
    }
    
    // Medium priority for upcoming drops
    if (timeToStart > 0 && timeToStart < 24 * 60 * 60 * 1000) { // 24 hours
      return 80;
    }
    
    // Lower priority for other drops
    return 70;
  }

  async processWarmingQueue() {
    while (this.warmingQueue.length > 0) {
      // Wait if we have too many active warming operations
      while (this.activeWarming.size >= this.maxConcurrentWarming) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Get next item from queue
      const { drop, priority } = this.warmingQueue.shift();
      
      // Start warming
      this.activeWarming.add(drop.id);
      this.warmDrop(drop, priority)
        .finally(() => {
          this.activeWarming.delete(drop.id);
        });
    }
  }

  async warmDrop(drop, priority) {
    try {
      // Warm drop data with priority-based TTL
      const ttl = this.getTTLByPriority(priority);
      await cacheService.setDrop(drop.id, drop, ttl);

      // Warm queue data with shorter TTL
      const queue = await DropQueue.findOne({ dropId: drop.id });
      if (queue) {
        await cacheService.setQueue(drop.id, queue, Math.min(ttl, 60)); // Max 1 minute for queue data
      }

      // Warm seller's drops list with medium TTL
      await this.warmSellerDrops(drop.seller, Math.min(ttl, 300)); // Max 5 minutes for seller's drops

      logger.info(`Warmed cache for drop ${drop.id} with priority ${priority}`);
    } catch (error) {
      logger.error(`Error warming cache for drop ${drop.id}:`, error);
    }
  }

  getTTLByPriority(priority) {
    switch (true) {
      case priority >= 100: return 60; // 1 minute for imminent drops
      case priority >= 90: return 300; // 5 minutes for active drops
      case priority >= 80: return 1800; // 30 minutes for upcoming drops
      default: return 3600; // 1 hour for other drops
    }
  }

  async warmSellerDrops(sellerId, ttl) {
    try {
      // Warm first page of seller's drops
      const drops = await Drop.find({ seller: sellerId })
        .sort({ startDate: -1 })
        .limit(10);
      
      await cacheService.setSellerDrops(sellerId, drops, 1, 10, ttl);
      logger.info(`Warmed cache for seller ${sellerId}'s drops with TTL ${ttl}s`);
    } catch (error) {
      logger.error(`Error warming cache for seller ${sellerId}'s drops:`, error);
    }
  }

  // Manually trigger cache warming for a specific drop
  async warmDropManually(dropId) {
    try {
      const drop = await Drop.findById(dropId);
      if (!drop) {
        logger.warn(`Drop ${dropId} not found for manual cache warming`);
        return;
      }

      const priority = this.calculateDropPriority(drop);
      await this.warmDrop(drop, priority);
      logger.info(`Manually warmed cache for drop ${dropId} with priority ${priority}`);
    } catch (error) {
      logger.error(`Error during manual cache warming for drop ${dropId}:`, error);
    }
  }

  // Manually trigger cache warming for a specific seller
  async warmSellerDropsManually(sellerId) {
    try {
      await this.warmSellerDrops(sellerId, 300); // 5 minutes TTL for manual warming
      logger.info(`Manually warmed cache for seller ${sellerId}'s drops`);
    } catch (error) {
      logger.error(`Error during manual cache warming for seller ${sellerId}:`, error);
    }
  }
}

module.exports = new CacheWarmer(); 