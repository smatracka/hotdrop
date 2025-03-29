// backend/api/utils/helpers.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generuje slug z podanego tekstu
 * 
 * @param {string} text - Tekst do przekształcenia
 * @returns {string} - Wygenerowany slug
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Zamień spacje na myślniki
    .replace(/[^\w\-]+/g, '')    // Usuń znaki specjalne
    .replace(/\-\-+/g, '-')      // Zamień wiele myślników na jeden
    .substring(0, 50);           // Ogranicz długość
};

/**
 * Generuje losowy token
 * 
 * @param {number} length - Długość tokena
 * @returns {string} - Wygenerowany token
 */
const generateToken = (userId, expiresIn = '90d') => {
  // W rzeczywistym projekcie używalibyśmy tutaj jwt.sign z rzeczywistym sekretem
  return "sample-token-" + userId;
};

/**
 * Hashuje hasło
 * 
 * @param {string} password - Hasło do zahashowania
 * @returns {string} - Zahashowane hasło
 */
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  return `${salt}:${hash}`;
};

/**
 * Weryfikuje hasło
 * 
 * @param {string} password - Hasło do weryfikacji
 * @param {string} hashedPassword - Zahashowane hasło
 * @returns {boolean} - Czy hasło jest poprawne
 */
const verifyPassword = (password, hashedPassword) => {
  if (!hashedPassword) return false;
  
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  return hash === verifyHash;
};

module.exports = {
  generateSlug,
  generateToken,
  hashPassword,
  verifyPassword
};