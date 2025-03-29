import api from './api';

/**
 * Pobiera listę zamówień z możliwością filtrowania i sortowania
 * 
 * @param {Object} params - Parametry zapytania
 * @param {string} params.sellerId - ID sprzedawcy
 * @param {string} params.status - Status zamówień (pending, paid, shipped, delivered, cancelled)
 * @param {number} params.page - Numer strony (1-indexed)
 * @param {number} params.limit - Liczba elementów na stronę
 * @param {string} params.sort - Pole, po którym sortować
 * @param {string} params.order - Kierunek sortowania (asc, desc)
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getOrders = async (params = {}) => {
  try {
    const { sellerId, ...queryParams } = params;
    const response = await api.get(`/orders/seller/${sellerId}`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Pobiera szczegóły pojedynczego zamówienia
 * 
 * @param {string} orderId - ID zamówienia
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getOrder = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Aktualizuje status zamówienia
 * 
 * @param {string} orderId - ID zamówienia
 * @param {string} status - Nowy status zamówienia
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Pobiera zamówienia dla dropu
 * 
 * @param {string} dropId - ID dropu
 * @param {Object} params - Parametry zapytania
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getOrdersByDrop = async (dropId, params = {}) => {
  try {
    const response = await api.get(`/orders/drop/${dropId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Pobiera zamówienia dla klienta
 * 
 * @param {string} customerId - ID klienta
 * @param {Object} params - Parametry zapytania
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getOrdersByCustomer = async (customerId, params = {}) => {
  try {
    const response = await api.get(`/orders/customer/${customerId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Generuje fakturę dla zamówienia
 * 
 * @param {string} orderId - ID zamówienia
 * @returns {Promise<Object>} - Dane odpowiedzi zawierające URL faktury
 */
export const generateInvoice = async (orderId) => {
  try {
    const response = await api.post(`/orders/${orderId}/invoice`);
    return response.data;
  } catch (error) {
    console.error(`Error generating invoice for order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Anuluje zamówienie
 * 
 * @param {string} orderId - ID zamówienia
 * @param {string} reason - Powód anulowania
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Dodaje notatkę do zamówienia
 * 
 * @param {string} orderId - ID zamówienia
 * @param {string} note - Treść notatki
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const addOrderNote = async (orderId, note) => {
  try {
    const response = await api.post(`/orders/${orderId}/notes`, { note });
    return response.data;
  } catch (error) {
    console.error(`Error adding note to order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Aktualizuje dane wysyłkowe zamówienia
 * 
 * @param {string} orderId - ID zamówienia
 * @param {Object} shippingData - Dane wysyłkowe
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const updateShippingInfo = async (orderId, shippingData) => {
  try {
    const response = await api.patch(`/orders/${orderId}/shipping`, shippingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating shipping info for order ${orderId}:`, error);
    throw error;
  }
};

export default {
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrdersByDrop,
  getOrdersByCustomer,
  generateInvoice,
  cancelOrder,
  addOrderNote,
  updateShippingInfo
};