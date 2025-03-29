const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');

// Wczytanie zmiennych środowiskowych
dotenv.config();

// Importowanie tras
const inventoryRoutes = require('./routes/inventory');
const reservationRoutes = require('./routes/reservation');
const errorHandler = require('./middleware/errorHandler');

// Inicjalizacja Express
const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.warn('Could not connect to MongoDB:', err.message);
    // Kontynuuj działanie aplikacji bez połączenia z bazą danych (tryb mock)
  });

// Główne trasy API
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reservations', reservationRoutes);

// Route dla health check (dla Kubernetes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Middleware obsługi błędów
app.use(errorHandler);

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Inventory service running on port ${PORT}`);
});

module.exports = app;
