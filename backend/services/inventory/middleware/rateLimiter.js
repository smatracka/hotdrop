const rateLimit = require('express-rate-limit');

// Middleware ograniczające liczbę żądań
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // limit liczby żądań na okno czasowe
  standardHeaders: true, // zwraca informacje o limicie w nagłówkach `RateLimit-*`
  legacyHeaders: false, // wyłącza nagłówki `X-RateLimit-*`
  message: {
    success: false,
    message: 'Zbyt wiele żądań z tego adresu IP, spróbuj ponownie za chwilę'
  }
});

module.exports = rateLimiter;