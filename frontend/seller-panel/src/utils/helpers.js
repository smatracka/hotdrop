// backend/api/utils/helpers.js
const crypto = require('crypto');
const slugify = require('slugify');

/**
 * Generuje losowy token
 * 
 * @param {number} length - Długość tokena
 * @returns {string} - Wygenerowany token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generuje slug z podanego tekstu
 * 
 * @param {string} text - Tekst do przekształcenia
 * @returns {string} - Wygenerowany slug
 */
const generateSlug = (text) => {
  const slug = slugify(text, {
    lower: true,
    strict: true,
    locale: 'pl',
    remove: /[*+~.()'"!:@]/g
  });
  
  // Dodaj losowy sufiks, aby uniknąć kolizji
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 5);
  
  return `${slug}-${timestamp}${randomString}`;
};

/**
 * Paginuje wyniki zapytania
 * 
 * @param {Object} query - Zapytanie Mongoose
 * @param {Object} options - Opcje paginacji
 * @param {number} options.page - Numer strony (1-indexed)
 * @param {number} options.limit - Liczba elementów na stronę
 * @returns {Promise<Object>} - Wyniki z paginacją
 */
const paginate = async (query, { page = 1, limit = 10 }) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {};
  results.page = page;
  results.limit = limit;
  
  if (startIndex > 0) {
    results.previousPage = page - 1;
  }
  
  const totalCount = await query.model.countDocuments(query._conditions);
  results.totalPages = Math.ceil(totalCount / limit);
  
  if (endIndex < totalCount) {
    results.nextPage = page + 1;
  }
  
  results.data = await query.skip(startIndex).limit(limit);
  results.totalCount = totalCount;
  
  return results;
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

/**
 * Generuje kod referencyjny
 * 
 * @param {string} prefix - Prefiks kodu
 * @param {number} length - Długość części numerycznej
 * @returns {string} - Wygenerowany kod
 */
const generateReferenceCode = (prefix, length = 6) => {
  const characters = '0123456789';
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Formatuje cenę do waluty
 * 
 * @param {number} price - Cena
 * @param {string} currency - Waluta (domyślnie PLN)
 * @returns {string} - Sformatowana cena
 */
const formatPrice = (price, currency = 'PLN') => {
  if (typeof price !== 'number') {
    return '';
  }
  
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Weryfikuje czy adres email jest poprawny
 * 
 * @param {string} email - Adres email do weryfikacji
 * @returns {boolean} - Czy adres jest poprawny
 */
const isValidEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Generuje losowe hasło
 * 
 * @param {number} length - Długość hasła
 * @returns {string} - Wygenerowane hasło
 */
const generatePassword = (length = 10) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Upewnij się, że hasło zawiera co najmniej jeden znak z każdej kategorii
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Dodaj pozostałe znaki
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Pomieszaj znaki
  return password.split('').sort(() => Math.random() - 0.5).join('');
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

module.exports = {
  generateToken,
  generateSlug,
  paginate,
  filterObject,
  generateReferenceCode,
  formatPrice,
  isValidEmail,
  generatePassword,
  hashPassword,
  verifyPassword,
  generateTransactionId
};
