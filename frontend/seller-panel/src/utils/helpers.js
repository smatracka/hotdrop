/**
 * Formatuje datę do wyświetlenia
 * 
 * @param {Date|string} date - Data do sformatowania
 * @param {string} format - Format (short, long, datetime)
 * @returns {string} - Sformatowana data
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('pl-PL');
    case 'long':
      return dateObj.toLocaleDateString('pl-PL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'datetime':
      return dateObj.toLocaleString('pl-PL');
    case 'time':
      return dateObj.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    default:
      return dateObj.toLocaleDateString('pl-PL');
  }
};

/**
 * Formatuje cenę do waluty
 * 
 * @param {number} price - Cena
 * @param {string} currency - Waluta (domyślnie PLN)
 * @returns {string} - Sformatowana cena
 */
export const formatPrice = (price, currency = 'PLN') => {
  if (typeof price !== 'number') {
    return '';
  }
  
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Skraca tekst do określonej długości
 * 
 * @param {string} text - Tekst do skrócenia
 * @param {number} maxLength - Maksymalna długość
 * @returns {string} - Skrócony tekst
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Generuje kontrast dla koloru tła
 * 
 * @param {string} bgColor - Kolor tła (hex)
 * @returns {string} - Kolor tekstu (black lub white)
 */
export const getContrastColor = (bgColor) => {
  // Usuń # jeśli istnieje
  const color = bgColor.startsWith('#') ? bgColor.substring(1) : bgColor;
  
  // Przekształć do RGB
  let r, g, b;
  
  if (color.length === 3) {
    r = parseInt(color[0] + color[0], 16);
    g = parseInt(color[1] + color[1], 16);
    b = parseInt(color[2] + color[2], 16);
  } else if (color.length === 6) {
    r = parseInt(color.substring(0, 2), 16);
    g = parseInt(color.substring(2, 4), 16);
    b = parseInt(color.substring(4, 6), 16);
  } else {
    return '#000000'; // Domyślnie czarny dla nieprawidłowego formatu
  }
  
  // Oblicz luminancję
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Zwróć biały lub czarny w zależności od luminancji
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Generuje unikalny ID
 * @returns {string} - Unikalny ID
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Filtruje pola obiektu
 * 
 * @param {Object} obj - Obiekt do filtrowania
 * @param {Array} allowedFields - Dozwolone pola
 * @returns {Object} - Przefiltrowany obiekt
 */
export const filterObject = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

/**
 * Pobiera wartość z zagnieżdżonego obiektu
 * 
 * @param {Object} obj - Obiekt
 * @param {string} path - Ścieżka do wartości (np. "user.address.city")
 * @param {*} defaultValue - Wartość domyślna
 * @returns {*} - Pobrana wartość lub wartość domyślna
 */
export const getNestedValue = (obj, path, defaultValue = '') => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined || !Object.prototype.hasOwnProperty.call(value, key)) {
      return defaultValue;
    }
    value = value[key];
  }
  
  return value === null || value === undefined ? defaultValue : value;
};

/**
 * Konwertuje obiekt na parametry URL
 * 
 * @param {Object} params - Obiekt z parametrami
 * @returns {string} - Ciąg parametrów URL
 */
export const objectToQueryString = (params) => {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Pobiera różnicę między dwoma datami w dniach
 * 
 * @param {Date|string} date1 - Pierwsza data
 * @param {Date|string} date2 - Druga data
 * @returns {number} - Różnica w dniach
 */
export const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Konwertuj milisekundy na dni
  return Math.round(Math.abs((d1 - d2) / (1000 * 60 * 60 * 24)));
};

/**
 * Sprawdza, czy dwie daty są tego samego dnia
 * 
 * @param {Date|string} date1 - Pierwsza data
 * @param {Date|string} date2 - Druga data
 * @returns {boolean} - Czy daty są tego samego dnia
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getDate() === d2.getDate() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getFullYear() === d2.getFullYear();
};

export default {
  formatDate,
  formatPrice,
  truncateText,
  getContrastColor,
  generateUniqueId,
  filterObject,
  getNestedValue,
  objectToQueryString,
  getDaysBetween,
  isSameDay
};