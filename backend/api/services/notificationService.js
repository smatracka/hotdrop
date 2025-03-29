// backend/api/services/notificationService.js
const emailService = require('./emailService');

/**
 * Typy powiadomień
 */
const NotificationType = {
  DROP_CREATED: 'drop_created',
  DROP_PUBLISHED: 'drop_published',
  DROP_STARTED: 'drop_started',
  DROP_ENDED: 'drop_ended',
  ORDER_CREATED: 'order_created',
  ORDER_PAID: 'order_paid',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PRODUCT_LOW_STOCK: 'product_low_stock',
  PRODUCT_OUT_OF_STOCK: 'product_out_of_stock'
};

/**
 * Wysyła powiadomienie
 * 
 * @param {string} type - Typ powiadomienia
 * @param {Object} data - Dane powiadomienia
 * @param {Object} options - Dodatkowe opcje
 * @returns {Promise<boolean>} - Czy powiadomienie zostało wysłane pomyślnie
 */
exports.sendNotification = async (type, data, options = {}) => {
  try {
    console.log(`Wysyłanie powiadomienia typu ${type}`);
    
    // Obsługa różnych typów powiadomień
    switch (type) {
      case NotificationType.DROP_PUBLISHED:
        await handleDropPublished(data);
        break;
      case NotificationType.DROP_STARTED:
        await handleDropStarted(data);
        break;
      case NotificationType.ORDER_CREATED:
        await handleOrderCreated(data);
        break;
      case NotificationType.ORDER_PAID:
      case NotificationType.ORDER_SHIPPED:
      case NotificationType.ORDER_DELIVERED:
      case NotificationType.ORDER_CANCELLED:
        await handleOrderStatusChanged(data, type);
        break;
      case NotificationType.PRODUCT_LOW_STOCK:
      case NotificationType.PRODUCT_OUT_OF_STOCK:
        await handleProductStockAlert(data, type);
        break;
      default:
        console.log(`Nieobsługiwany typ powiadomienia: ${type}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error sending notification (${type}):`, error);
    return false;
  }
};

/**
 * Obsługa powiadomienia o opublikowaniu dropu
 * 
 * @param {Object} data - Dane dropu
 * @returns {Promise<void>}
 */
async function handleDropPublished(data) {
  const { drop, seller } = data;
  
  // Powiadomienie dla sprzedawcy
  await emailService.sendEmail({
    to: seller.email,
    subject: `Drop "${drop.name}" został opublikowany`,
    text: `Twój drop "${drop.name}" został pomyślnie opublikowany i będzie dostępny od ${new Date(drop.startDate).toLocaleString()}.`,
    html: `
      <h1>Drop został opublikowany</h1>
      <p>Twój drop <strong>${drop.name}</strong> został pomyślnie opublikowany.</p>
      <p>Data rozpoczęcia: ${new Date(drop.startDate).toLocaleString()}</p>
    `
  });
  
  // W rzeczywistym projekcie moglibyśmy również powiadomić subskrybentów
}

/**
 * Obsługa powiadomienia o rozpoczęciu dropu
 * 
 * @param {Object} data - Dane dropu
 * @returns {Promise<void>}
 */
async function handleDropStarted(data) {
  const { drop, subscribers } = data;
  
  // Powiadomienie dla subskrybentów
  await emailService.sendDropStartNotification(drop, subscribers);
}

/**
 * Obsługa powiadomienia o utworzeniu zamówienia
 * 
 * @param {Object} data - Dane zamówienia
 * @returns {Promise<void>}
 */
async function handleOrderCreated(data) {
  const { order } = data;
  
  // Powiadomienie dla klienta
  await emailService.sendOrderConfirmation(order);
}

/**
 * Obsługa powiadomienia o zmianie statusu zamówienia
 * 
 * @param {Object} data - Dane zamówienia
 * @param {string} type - Typ powiadomienia
 * @returns {Promise<void>}
 */
async function handleOrderStatusChanged(data, type) {
  const { order, oldStatus } = data;
  
  // Powiadomienie dla klienta
  await emailService.sendOrderStatusUpdate(order, oldStatus);
}

/**
 * Obsługa alertu o stanie magazynowym produktu
 * 
 * @param {Object} data - Dane produktu
 * @param {string} type - Typ powiadomienia
 * @returns {Promise<void>}
 */
async function handleProductStockAlert(data, type) {
  const { product, seller } = data;
  
  const isOutOfStock = type === NotificationType.PRODUCT_OUT_OF_STOCK;
  
  // Powiadomienie dla sprzedawcy
  await emailService.sendEmail({
    to: seller.email,
    subject: isOutOfStock 
      ? `Produkt "${product.name}" - brak w magazynie` 
      : `Produkt "${product.name}" - niski stan magazynowy`,
    text: isOutOfStock
      ? `Produkt "${product.name}" (SKU: ${product.sku}) nie jest już dostępny w magazynie.`
      : `Produkt "${product.name}" (SKU: ${product.sku}) ma niski stan magazynowy: ${product.quantity} szt.`,
    html: isOutOfStock
      ? `
        <h1>Produkt niedostępny</h1>
        <p>Produkt <strong>${product.name}</strong> (SKU: ${product.sku}) nie jest już dostępny w magazynie.</p>
      `
      : `
        <h1>Niski stan magazynowy</h1>
        <p>Produkt <strong>${product.name}</strong> (SKU: ${product.sku}) ma niski stan magazynowy: ${product.quantity} szt.</p>
      `
  });
}

// Eksport stałych typów powiadomień
exports.NotificationType = NotificationType;