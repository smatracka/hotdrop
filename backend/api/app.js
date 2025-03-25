// Backend API - app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createClient } = require('redis');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Wczytanie zmiennych środowiskowych
dotenv.config();

// Inicjalizacja aplikacji Express
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Bezpieczeństwo HTTP headers
app.use(compression()); // Kompresja odpowiedzi
app.use(cors()); // Obsługa CORS
app.use(express.json({ limit: '1mb' })); // Parsowanie JSON z limitem rozmiaru
app.use(morgan('combined')); // Logowanie requestów

// Połączenie z Redis (ElastiCache)
const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Współdzielenie klienta Redis w aplikacji
app.set('redisClient', redisClient);

// Importowanie tras API
const dropRoutes = require('./routes/drop');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');
const customerRoutes = require('./routes/customer');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');

// Główne trasy API
app.use('/api/drops', dropRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Middleware obsługi błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Wystąpił błąd serwera',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Route dla health check (dla Kubernetes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
