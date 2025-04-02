const winston = require('winston');
const promClient = require('prom-client');
const express = require('express');

// Initialize Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'drop_commerce_' });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'drop_commerce_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const websocketConnections = new promClient.Gauge({
  name: 'drop_commerce_websocket_connections',
  help: 'Number of active WebSocket connections'
});

const queueSize = new promClient.Gauge({
  name: 'drop_commerce_queue_size',
  help: 'Size of drop queues',
  labelNames: ['drop_id']
});

const cacheHitRate = new promClient.Counter({
  name: 'drop_commerce_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type']
});

const cacheMissRate = new promClient.Counter({
  name: 'drop_commerce_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type']
});

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Monitoring middleware
const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status_code: res.statusCode },
      duration
    );
    
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};

// WebSocket monitoring
const updateWebSocketMetrics = (count) => {
  websocketConnections.set(count);
};

// Queue monitoring
const updateQueueMetrics = (dropId, size) => {
  queueSize.set({ drop_id: dropId }, size);
};

// Cache monitoring
const recordCacheHit = (cacheType) => {
  cacheHitRate.inc({ cache_type: cacheType });
};

const recordCacheMiss = (cacheType) => {
  cacheMissRate.inc({ cache_type: cacheType });
};

// Prometheus metrics endpoint
const metricsEndpoint = express.Router();
metricsEndpoint.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

module.exports = {
  logger,
  monitoringMiddleware,
  updateWebSocketMetrics,
  updateQueueMetrics,
  recordCacheHit,
  recordCacheMiss,
  metricsEndpoint
}; 