const logger = require('../utils/logger');

// Middleware do obsługi błędów
const errorHandler = (err, req, res, next) => {
  // Logujemy błąd
  logger.error(err.stack);

  // Określamy kod statusu HTTP
  const statusCode = err.statusCode || 500;

  // Budujemy odpowiedź
  const response = {
    success: false,
    message: err.message || 'Wystąpił błąd serwera',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Zwracamy odpowiedź
  res.status(statusCode).json(response);
};

module.exports = errorHandler;