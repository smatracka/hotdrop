import api from './api';

/**
 * Pobiera listę klientów sprzedawcy
 * 
 * @param {Object} params - Parametry zapytania
 * @param {string} params.sellerId - ID sprzedawcy
 * @param {string} params.search - Fraza wyszukiwania
 * @param {number} params.page - Numer strony (1-indexed)
 * @param {number} params.limit - Liczba elementów na stronę
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getCustomers = async (params = {}) => {
  try {
    const { sellerId, ...queryParams } = params;
    const response = await api.get(`/customers/seller/${sellerId}`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Pobiera szczegóły pojedynczego klienta
 * 
 * @param {string} customerId - ID klienta
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getCustomer = async (customerId) => {
  try {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Eksportuje dane klienta (RODO)
 * 
 * @param {string} customerId - ID klienta
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const exportCustomerData = async (customerId) => {
  try {
    const response = await api.get(`/customers/export/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error exporting data for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Usuwa dane klienta (RODO)
 * 
 * @param {string} customerId - ID klienta
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const deleteCustomerData = async (customerId) => {
  try {
    const response = await api.delete(`/customers/data/${customerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting data for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Dodaje klienta do listy mailingowej
 * 
 * @param {string} customerId - ID klienta
 * @param {boolean} subscribed - Status subskrypcji
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const updateCustomerSubscription = async (customerId, subscribed) => {
  try {
    const response = await api.patch(`/customers/${customerId}/subscription`, { subscribed });
    return response.data;
  } catch (error) {
    console.error(`Error updating subscription for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Pobiera historię zakupów klienta
 * 
 * @param {string} customerId - ID klienta
 * @param {Object} params - Parametry zapytania
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getCustomerPurchaseHistory = async (customerId, params = {}) => {
  try {
    const response = await api.get(`/customers/${customerId}/purchases`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase history for customer ${customerId}:`, error);
    throw error;
  }
};

/**
 * Dodaje notatkę do klienta
 * 
 * @param {string} customerId - ID klienta
 * @param {string} note - Treść notatki
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const addCustomerNote = async (customerId, note) => {
  try {
    const response = await api.post(`/customers/${customerId}/notes`, { note });
    return response.data;
  } catch (error) {
    console.error(`Error adding note to customer ${customerId}:`, error);
    throw error;
  }
};

export default {
  getCustomers,
  getCustomer,
  exportCustomerData,
  deleteCustomerData,
  updateCustomerSubscription,
  getCustomerPurchaseHistory,
  addCustomerNote
};