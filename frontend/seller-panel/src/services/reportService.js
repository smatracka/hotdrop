import api from './api';

/**
 * Pobiera podsumowanie sprzedaży
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} params - Parametry zapytania
 * @param {string} params.startDate - Data początkowa
 * @param {string} params.endDate - Data końcowa
 * @param {string} params.period - Okres (day, week, month, year)
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getSalesSummary = async (sellerId, params = {}) => {
  try {
    const response = await api.get(`/reports/sales/summary/${sellerId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw error;
  }
};

/**
 * Pobiera dane sprzedaży w czasie
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} params - Parametry zapytania
 * @param {string} params.startDate - Data początkowa
 * @param {string} params.endDate - Data końcowa
 * @param {string} params.interval - Interwał (day, week, month)
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getSalesOverTime = async (sellerId, params = {}) => {
  try {
    const response = await api.get(`/reports/sales/over-time/${sellerId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales over time:', error);
    throw error;
  }
};

/**
 * Pobiera najlepiej sprzedające się produkty
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} params - Parametry zapytania
 * @param {string} params.startDate - Data początkowa
 * @param {string} params.endDate - Data końcowa
 * @param {number} params.limit - Liczba produktów
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getTopProducts = async (sellerId, params = {}) => {
  try {
    const response = await api.get(`/reports/products/top/${sellerId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

/**
 * Pobiera statystyki dropów
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} params - Parametry zapytania
 * @param {string} params.startDate - Data początkowa
 * @param {string} params.endDate - Data końcowa
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getDropStats = async (sellerId, params = {}) => {
  try {
    const response = await api.get(`/reports/drops/stats/${sellerId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching drop stats:', error);
    throw error;
  }
};

/**
 * Pobiera statystyki klientów
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} params - Parametry zapytania
 * @param {string} params.startDate - Data początkowa
 * @param {string} params.endDate - Data końcowa
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getCustomerStats = async (sellerId, params = {}) => {
  try {
    const response = await api.get(`/reports/customers/stats/${sellerId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    throw error;
  }
};

/**
 * Pobiera raport zapasów
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} params - Parametry zapytania
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getInventoryReport = async (sellerId, params = {}) => {
  try {
    const response = await api.get(`/reports/inventory/${sellerId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    throw error;
  }
};

/**
 * Generuje i pobiera plik raportu
 * 
 * @param {string} reportType - Typ raportu
 * @param {Object} params - Parametry raportu
 * @returns {Promise<Blob>} - Dane odpowiedzi jako blob
 */
export const downloadReport = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reports/download/${reportType}`, {
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error downloading ${reportType} report:`, error);
    throw error;
  }
};

export default {
  getSalesSummary,
  getSalesOverTime,
  getTopProducts,
  getDropStats,
  getCustomerStats,
  getInventoryReport,
  downloadReport
};