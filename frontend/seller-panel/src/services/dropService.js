// frontend/seller-panel/src/services/dropService.js
import api from './api';

/**
 * Pobiera listę dropów z możliwością filtrowania i sortowania
 * 
 * @param {Object} params - Parametry zapytania
 * @param {string} params.sellerId - ID sprzedawcy
 * @param {string} params.status - Status dropu (draft, published, completed, cancelled)
 * @param {number} params.page - Numer strony (1-indexed)
 * @param {number} params.limit - Liczba elementów na stronę
 * @param {string} params.sort - Pole, po którym sortować
 * @param {string} params.order - Kierunek sortowania (asc, desc)
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getDrops = async (params = {}) => {
  try {
    const { sellerId, ...queryParams } = params;
    const response = await api.get(`/drops/seller/${sellerId}`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching drops:', error);
    throw error;
  }
};

/**
 * Pobiera szczegóły pojedynczego dropu
 * 
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getDrop = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Tworzy nowy drop
 * 
 * @param {Object} dropData - Dane dropu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const createDrop = async (dropData) => {
  try {
    const response = await api.post('/drops', dropData);
    return response.data;
  } catch (error) {
    console.error('Error creating drop:', error);
    throw error;
  }
};

/**
 * Aktualizuje istniejący drop
 * 
 * @param {string} dropId - ID dropu
 * @param {Object} dropData - Dane do aktualizacji
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const updateDrop = async (dropId, dropData) => {
  try {
    const response = await api.put(`/drops/${dropId}`, dropData);
    return response.data;
  } catch (error) {
    console.error(`Error updating drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Publikuje drop
 * 
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const publishDrop = async (dropId) => {
  try {
    const response = await api.post(`/drops/${dropId}/publish`);
    return response.data;
  } catch (error) {
    console.error(`Error publishing drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Anuluje drop
 * 
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const cancelDrop = async (dropId) => {
  try {
    const response = await api.post(`/drops/${dropId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error canceling drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Usuwa drop
 * 
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const deleteDrop = async (dropId) => {
  try {
    const response = await api.delete(`/drops/${dropId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Pobiera statystyki dropu
 * 
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getDropStats = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Pobiera zamówienia powiązane z dropem
 * 
 * @param {string} dropId - ID dropu
 * @param {Object} params - Parametry zapytania
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getDropOrders = async (dropId, params = {}) => {
  try {
    const response = await api.get(`/drops/${dropId}/orders`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Generuje URL podglądu dropu
 * 
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} - Dane odpowiedzi zawierające URL
 */
export const getDropPreviewUrl = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/preview-url`);
    return response.data;
  } catch (error) {
    console.error(`Error generating preview URL for drop ${dropId}:`, error);
    throw error;
  }
};

/**
 * Pobiera dostępne szablony stron dropu
 * 
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getDropTemplates = async () => {
  try {
    const response = await api.get('/drops/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching drop templates:', error);
    throw error;
  }
};

/**
 * Duplikuje istniejący drop
 * 
 * @param {string} dropId - ID dropu do zduplikowania
 * @param {Object} options - Opcje duplikowania
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const duplicateDrop = async (dropId, options = {}) => {
  try {
    const response = await api.post(`/drops/${dropId}/duplicate`, options);
    return response.data;
  } catch (error) {
    console.error(`Error duplicating drop ${dropId}:`, error);
    throw error;
  }
};

export default {
  getDrops,
  getDrop,
  createDrop,
  updateDrop,
  publishDrop,
  cancelDrop,
  deleteDrop,
  getDropStats,
  getDropOrders,
  getDropPreviewUrl,
  getDropTemplates,
  duplicateDrop
};
