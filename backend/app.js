const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const errorHandler = require('./api/middlewares/errorHandler');
const { apiLimiter, dropLimiter, queueLimiter, cartLimiter } = require('./api/middlewares/rateLimiter');
const { monitoringMiddleware, metricsEndpoint } = require('./api/services/monitoring');
const dropRoutes = require('./api/routes/drop');
const dropController = require('./api/controllers/drop');
const cacheWarmer = require('./api/services/cacheWarmer');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket service
dropController.initializeWebSocket(server);

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(monitoringMiddleware);

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/drops', dropLimiter);
app.use('/api/drops/:dropId/queue', queueLimiter);
app.use('/api/drops/:dropId/cart-reservations', cartLimiter);

// Prometheus metrics endpoint
app.use(metricsEndpoint);

// Routes
app.use('/api/drops', dropRoutes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drop-commerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Start cache warming after successful database connection
  cacheWarmer.warmCache();
})
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 