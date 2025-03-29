// backend/api/utils/helpers.js
const crypto = require('crypto');

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
  if (!hashedPassword || !hashedPassword.includes(':')) return false;
  
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  
  return hash === verifyHash;
};

/**
 * Generuje unikalne ID transakcji
 * 
 * @returns {string} - Unikalne ID transakcji
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `TXN-${timestamp}-${randomStr}`.toUpperCase();
};

/**
 * Filtruje pola obiektu
 * 
 * @param {Object} obj - Obiekt do filtrowania
 * @param {Array} allowedFields - Dozwolone pola
 * @returns {Object} - Przefiltrowany obiekt
 */
const filterObject = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

module.exports = {
  generateSlug,
  generateToken,
  hashPassword,
  verifyPassword,
  generateTransactionId,
  filterObject
};