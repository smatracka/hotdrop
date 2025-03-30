/**
 * Narzędzie do zarządzania cache dla aplikacji Drop Commerce
 * Dostarcza metody do przechowywania i odbierania danych z różnych warstw cache
 */

// Import stałych
import { API, PWA } from '../config/constants';

/**
 * Klasa do zarządzania cache pamięci (in-memory)
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }
  
  /**
   * Zapisuje wartość w cache
   * @param {string} key - Klucz cache
   * @param {any} value - Wartość do zapisania
   * @param {number} ttlMs - Czas życia w milisekundach
   */
  set(key, value, ttlMs = API.CACHE_DURATION) {
    // Zapisz wartość w cache
    this.cache.set(key, value);
    
    // Zapisz czas wygaśnięcia
    const expiry = Date.now() + ttlMs;
    this.ttls.set(key, expiry);
    
    // Ustaw timer do automatycznego wyczyszczenia wpisu
    setTimeout(() => {
      if (this.ttls.get(key) === expiry) {
        this.delete(key);
      }
    }, ttlMs);
  }
  
  /**
   * Pobiera wartość z cache
   * @param {string} key - Klucz cache
   * @returns {any|null} Wartość z cache lub null jeśli brak lub wygasła
   */
  get(key) {
    // Sprawdź czy wpis istnieje i nie wygasł
    if (this.has(key)) {
      return this.cache.get(key);
    }
    return null;
  }
  
  /**
   * Sprawdza czy klucz istnieje w cache i nie wygasł
   * @param {string} key - Klucz cache
   * @returns {boolean} Czy klucz istnieje i nie wygasł
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }
    
    // Sprawdź czy wpis nie wygasł
    const expiry = this.ttls.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Usuwa wpis z cache
   * @param {string} key - Klucz cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }
  
  /**
   * Czyści cały cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }
}

/**
 * Klasa do zarządzania cache w localStorage
 */
class LocalStorageCache {
  constructor(prefix = 'dropcommerce_') {
    this.prefix = prefix;
    this.memoryCache = new MemoryCache(); // Dodatkowy cache w pamięci dla optymalizacji
  }
  
  /**
   * Generuje klucz z prefiksem
   * @param {string} key - Klucz
   * @returns {string} Klucz z prefiksem
   */
  getKeyWithPrefix(key) {
    return `${this.prefix}${key}`;
  }
  
  /**
   * Zapisuje wartość w localStorage
   * @param {string} key - Klucz cache
   * @param {any} value - Wartość do zapisania
   * @param {number} ttlMs - Czas życia w milisekundach
   */
  set(key, value, ttlMs = API.CACHE_DURATION) {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const item = {
        value,
        expiry: Date.now() + ttlMs
      };
      
      // Zapisz w localStorage
      localStorage.setItem(prefixedKey, JSON.stringify(item));
      
      // Zapisz również w pamięci dla szybszego dostępu
      this.memoryCache.set(key, value, ttlMs);
    } catch (error) {
      console.error('Error storing item in localStorage:', error);
    }
  }
  
  /**
   * Pobiera wartość z localStorage
   * @param {string} key - Klucz cache
   * @returns {any|null} Wartość z cache lub null jeśli brak lub wygasła
   */
  get(key) {
    // Najpierw spróbuj pobrać z pamięci dla optymalnej wydajności
    const memoryValue = this.memoryCache.get(key);
    if (memoryValue !== null) {
      return memoryValue;
    }
    
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const itemStr = localStorage.getItem(prefixedKey);
      
      // Brak wartości
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      
      // Sprawdź czy wartość wygasła
      if (item.expiry && Date.now() > item.expiry) {
        this.delete(key);
        return null;
      }
      
      // Zapisz w pamięci dla przyszłych zapytań
      this.memoryCache.set(key, item.value, item.expiry - Date.now());
      
      return item.value;
    } catch (error) {
      console.error('Error retrieving item from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Sprawdza czy klucz istnieje w localStorage i nie wygasł
   * @param {string} key - Klucz cache
   * @returns {boolean} Czy klucz istnieje i nie wygasł
   */
  has(key) {
    // Najpierw sprawdź w pamięci
    if (this.memoryCache.has(key)) {
      return true;
    }
    
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const itemStr = localStorage.getItem(prefixedKey);
      
      // Brak wartości
      if (!itemStr) {
        return false;
      }
      
      const item = JSON.parse(itemStr);
      
      // Sprawdź czy wartość wygasła
      if (item.expiry && Date.now() > item.expiry) {
        this.delete(key);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking item in localStorage:', error);
      return false;
    }
  }
  
  /**
   * Usuwa wpis z localStorage
   * @param {string} key - Klucz cache
   */
  delete(key) {
    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      localStorage.removeItem(prefixedKey);
      this.memoryCache.delete(key);
    } catch (error) {
      console.error('Error deleting item from localStorage:', error);
    }
  }
  
  /**
   * Czyści cały cache związany z aplikacją
   */
  clear() {
    try {
      // Usuń wszystkie wpisy z prefiksem
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      
      // Wyczyść także cache pamięci
      this.memoryCache.clear();
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
    }
  }
}

/**
 * Klasa do zarządzania cache w Service Worker
 * Wymaga wsparcia dla Cache API (dostępne w nowoczesnych przeglądarkach)
 */
class ServiceWorkerCache {
  constructor(cacheName = PWA.CACHE_NAME) {
    this.cacheName = cacheName;
  }
  
  /**
   * Sprawdza czy API Cache jest dostępne
   * @returns {boolean} Czy Cache API jest dostępne
   */
  isAvailable() {
    return 'caches' in window;
  }
  
  /**
   * Zapisuje odpowiedź w cache Service Worker
   * @param {string} url - URL zasobu
   * @param {Response} response - Obiekt odpowiedzi
   * @returns {Promise<boolean>} Czy operacja się powiodła
   */
  async set(url, response) {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      const cache = await caches.open(this.cacheName);
      await cache.put(url, response.clone());
      return true;
    } catch (error) {
      console.error('Error storing response in ServiceWorker cache:', error);
      return false;
    }
  }
  
  /**
   * Pobiera odpowiedź z cache Service Worker
   * @param {string} url - URL zasobu
   * @returns {Promise<Response|null>} Odpowiedź z cache lub null
   */
  async get(url) {
    if (!this.isAvailable()) {
      return null;
    }
    
    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      
      if (!response) {
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('Error retrieving response from ServiceWorker cache:', error);
      return null;
    }
  }
  
  /**
   * Sprawdza czy zasób istnieje w cache Service Worker
   * @param {string} url - URL zasobu
   * @returns {Promise<boolean>} Czy zasób istnieje w cache
   */
  async has(url) {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(url);
      return !!response;
    } catch (error) {
      console.error('Error checking response in ServiceWorker cache:', error);
      return false;
    }
  }
  
  /**
   * Usuwa zasób z cache Service Worker
   * @param {string} url - URL zasobu
   * @returns {Promise<boolean>} Czy operacja się powiodła
   */
  async delete(url) {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      const cache = await caches.open(this.cacheName);
      const result = await cache.delete(url);
      return result;
    } catch (error) {
      console.error('Error deleting response from ServiceWorker cache:', error);
      return false;
    }
  }
  
  /**
   * Czyści cały cache Service Worker
   * @returns {Promise<boolean>} Czy operacja się powiodła
   */
  async clear() {
    if (!this.isAvailable()) {
      return false;
    }
    
    try {
      const result = await caches.delete(this.cacheName);
      return result;
    } catch (error) {
      console.error('Error clearing ServiceWorker cache:', error);
      return false;
    }
  }
}

// Eksportuj instancje cache
export const memoryCache = new MemoryCache();
export const localStorageCache = new LocalStorageCache();
export const serviceWorkerCache = new ServiceWorkerCache();

// Eksportuj klasy
export { MemoryCache, LocalStorageCache, ServiceWorkerCache };

// Eksportuj domyślnie obiekt zawierający wszystkie typy cache
export default {
  memory: memoryCache,
  localStorage: localStorageCache,
  serviceWorker: serviceWorkerCache
};