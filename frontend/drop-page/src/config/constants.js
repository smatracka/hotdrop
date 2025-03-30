/**
 * Stałe aplikacji Drop Commerce
 * Zawiera zdefiniowane stałe używane w całej aplikacji
 */

// Stałe związane z API
export const API = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.dropcommerce.com',
  TIMEOUT: 10000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minut w milisekundach
  REFETCH_INTERVAL: 30 * 1000, // 30 sekund w milisekundach
  RETRY_ATTEMPTS: 3
};

// Stałe związane z autentykacją
export const AUTH = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  TOKEN_EXPIRY_KEY: 'token_expiry',
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 godziny w milisekundach
  REDIRECT_URL_KEY: 'redirect_after_login'
};

// Stałe związane z checkoutem
export const CHECKOUT = {
  SHOPPING_SESSION_DURATION: 10 * 60, // 10 minut w sekundach
  SHIPPING_METHODS: [
    { id: 'courier', name: 'Kurier', price: 15.99, estimatedDeliveryDays: '1-2 dni robocze' },
    { id: 'parcelLocker', name: 'Paczkomat', price: 12.99, estimatedDeliveryDays: '1-2 dni robocze' },
    { id: 'post', name: 'Poczta Polska', price: 9.99, estimatedDeliveryDays: '2-3 dni robocze' }
  ],
  PAYMENT_METHODS: [
    { id: 'prepaid', name: 'Wpłacony prepaid', isDefault: true },
    { id: 'card', name: 'Karta płatnicza', isDefault: false },
    { id: 'blik', name: 'BLIK', isDefault: false },
    { id: 'transfer', name: 'Przelew online', isDefault: false }
  ],
  MIN_PREPAID_AMOUNT: 100,
  MAX_PREPAID_AMOUNT: 10000
};

// Stałe związane z dropami
export const DROPS = {
  QUEUE_REFRESH_INTERVAL: 10000, // 10 sekund w milisekundach
  MAX_CONCURRENT_USERS: 100,
  DEFAULT_SESSION_DURATION: 10 * 60, // 10 minut w sekundach
  MAX_PRODUCTS_PER_USER: 5,
  WARNING_TIME_THRESHOLD: 120, // 2 minuty w sekundach
  CRITICAL_TIME_THRESHOLD: 30 // 30 sekund w sekundach
};

// Stałe związane z walidacją formularzy
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\d{9}$/,
  POSTAL_CODE_REGEX: /^\d{2}-\d{3}$/,
  NIP_REGEX: /^\d{10}$/,
  PASSWORD_MIN_LENGTH: 8,
  MAX_RETRY_ATTEMPTS: 3
};

// Stałe związane z Cloud Storage
export const STORAGE = {
  BASE_URL: 'https://storage.googleapis.com/drop-commerce-static',
  ASSETS_PATH: '/assets',
  IMAGES_PATH: '/assets/images',
  IMAGE_SIZES: {
    sm: { width: 320, suffix: '-sm' },
    md: { width: 640, suffix: '-md' },
    lg: { width: 1280, suffix: '-lg' }
  },
  IMAGE_FORMATS: ['webp', 'jpg', 'png']
};

// Stałe związane z PWA (Progressive Web App)
export const PWA = {
  CACHE_NAME: 'drop-commerce-cache-v1',
  ASSETS_CACHE_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 dni w milisekundach
  API_CACHE_DURATION: 5 * 60 * 1000, // 5 minut w milisekundach
  APP_UPDATE_CHECK_INTERVAL: 60 * 60 * 1000 // 1 godzina w milisekundach
};

// Stałe związane z UI
export const UI = {
  ANIMATION_DURATION: 300, // w milisekundach
  TOAST_DURATION: 5000, // 5 sekund w milisekundach
  MOBILE_BREAKPOINT: 768, // w pikselach
  TABLET_BREAKPOINT: 1024, // w pikselach
  MODAL_CLOSE_TIMEOUT: 300, // w milisekundach
  SKELETON_COUNT: 6, // liczba elementów zastępczych podczas ładowania
  DEBOUNCE_DELAY: 300 // w milisekundach
};

// Stałe związane z analityką
export const ANALYTICS = {
  TRACKING_ID: process.env.REACT_APP_TRACKING_ID,
  EVENT_CATEGORIES: {
    DROP: 'drop',
    PRODUCT: 'product',
    CART: 'cart',
    CHECKOUT: 'checkout',
    USER: 'user',
    NAVIGATION: 'navigation'
  },
  USER_PROPERTIES: ['country', 'device', 'browser', 'os', 'screen_size'],
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minut w milisekundach
};