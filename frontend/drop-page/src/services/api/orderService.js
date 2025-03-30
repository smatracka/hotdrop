/**
 * Serwis do obsługi zamówień
 * Zawiera metody do pobierania, tworzenia i zarządzania zamówieniami
 */
import api from './api';

/**
 * Pobiera szczegóły zamówienia
 * @param {string} orderId - ID zamówienia
 * @returns {Promise<Object>} Dane zamówienia
 */
export const fetchOrder = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się pobrać szczegółów zamówienia.');
  }
};

/**
 * Pobiera listę zamówień użytkownika
 * @param {Object} params - Parametry zapytania (strona, limit, sortowanie)
 * @returns {Promise<Object>} Lista zamówień z paginacją
 */
export const fetchOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się pobrać listy zamówień.');
  }
};

/**
 * Tworzy nowe zamówienie
 * @param {Object} orderData - Dane zamówienia
 * @returns {Promise<Object>} Utworzone zamówienie
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się utworzyć zamówienia.');
  }
};

/**
 * Anuluje zamówienie
 * @param {string} orderId - ID zamówienia
 * @param {string} reason - Powód anulowania (opcjonalne)
 * @returns {Promise<Object>} Zaktualizowane zamówienie
 */
export const cancelOrder = async (orderId, reason = '') => {
  try {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data.data;
  } catch (error) {
    console.error('Error canceling order:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się anulować zamówienia.');
  }
};

/**
 * Pobiera status dostawy zamówienia
 * @param {string} orderId - ID zamówienia
 * @returns {Promise<Object>} Status dostawy
 */
export const getShippingStatus = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/shipping-status`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching shipping status:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się pobrać statusu dostawy.');
  }
};

/**
 * Pobiera fakturę dla zamówienia
 * @param {string} orderId - ID zamówienia
 * @returns {Promise<Object>} Dane faktury
 */
export const getInvoice = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/invoice`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się pobrać faktury.');
  }
};

/**
 * Pobiera dostępne metody dostawy
 * @param {Object} params - Parametry (kraj, kod pocztowy)
 * @returns {Promise<Array>} Lista dostępnych metod dostawy
 */
export const getShippingMethods = async (params = {}) => {
  try {
    const response = await api.get('/shipping/methods', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się pobrać metod dostawy.');
  }
};

/**
 * Aktualizuje adres dostawy dla zamówienia
 * @param {string} orderId - ID zamówienia
 * @param {Object} shippingData - Dane adresu dostawy
 * @returns {Promise<Object>} Zaktualizowane zamówienie
 */
export const updateShippingAddress = async (orderId, shippingData) => {
  try {
    const response = await api.patch(`/orders/${orderId}/shipping-address`, shippingData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating shipping address:', error);
    throw new Error(error.response?.data?.message || 'Nie udało się zaktualizować adresu dostawy.');
  }
};

export default {
  fetchOrder,
  fetchOrders,
  createOrder,
  cancelOrder,
  getShippingStatus,
  getInvoice,
  getShippingMethods,
  updateShippingAddress
};