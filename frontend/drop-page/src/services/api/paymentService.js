/**
 * Serwis do obsługi płatności
 * Zawiera metody do płatności prepaidu, przetwarzania zamówień, refundacji itp.
 */
import api from './api';

/**
 * Przetwarza wpłatę prepaidu
 * @param {Object} paymentData - Dane płatności
 * @returns {Promise<Object>} Rezultat płatności
 */
export const processPrepaidPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/prepaid', paymentData);
    return response.data.data;
  } catch (error) {
    console.error('Prepaid payment processing error:', error);
    throw new Error(error.response?.data?.message || 'Błąd podczas przetwarzania płatności prepaidu.');
  }
};

/**
 * Sprawdza dostępność wpłaconego prepaidu
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Informacje o dostępnych środkach
 */
export const checkPrepaidAvailability = async (dropId) => {
  try {
    const response = await api.get(`/payments/prepaid/availability?dropId=${dropId}`);
    return response.data.data;
  } catch (error) {
    console.error('Prepaid availability check error:', error);
    throw new Error(error.response?.data?.message || 'Błąd podczas sprawdzania dostępności środków.');
  }
};

/**
 * Przetwarza płatność za zamówienie
 * @param {string} dropId - ID dropu
 * @param {Object} orderData - Dane zamówienia
 * @returns {Promise<Object>} Rezultat płatności
 */
export const processPayment = async (dropId, orderData) => {
  try {
    const response = await api.post(`/payments/process/${dropId}`, orderData);
    return response.data.data;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error(error.response?.data?.message || 'Błąd podczas przetwarzania płatności.');
  }
};

/**
 * Żąda zwrotu niewykorzystanych środków
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Rezultat żądania zwrotu
 */
export const requestRefund = async (dropId) => {
  try {
    const response = await api.post(`/payments/refund/${dropId}`);
    return response.data.data;
  } catch (error) {
    console.error('Refund request error:', error);
    throw new Error(error.response?.data?.message || 'Błąd podczas żądania zwrotu środków.');
  }
};

/**
 * Pobiera historię płatności
 * @param {string} dropId - Opcjonalne ID dropu (jeśli null, pobiera wszystkie płatności)
 * @returns {Promise<Array>} Historia płatności
 */
export const getPaymentHistory = async (dropId = null) => {
  try {
    const url = dropId 
      ? `/payments/history?dropId=${dropId}` 
      : '/payments/history';
    
    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Payment history error:', error);
    throw new Error(error.response?.data?.message || 'Błąd podczas pobierania historii płatności.');
  }
};

/**
 * Waliduje kartę płatniczą
 * @param {Object} cardDetails - Dane karty
 * @returns {Promise<Object>} Rezultat walidacji
 */
export const validateCard = async (cardDetails) => {
  try {
    const response = await api.post('/payments/validate-card', cardDetails);
    return response.data.data;
  } catch (error) {
    console.error('Card validation error:', error);
    throw new Error(error.response?.data?.message || 'Błąd podczas walidacji karty.');
  }
};

/**
 * Pobiera dostępne metody płatności
 * @returns {Promise<Array>} Dostępne metody płatności
 */
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/payments/methods');
    return response.data.data;
  } catch (error) {
    console.error('Payment methods error:', error);
    throw new Error(error.response?.data?.message || 'Błąd podczas pobierania metod płatności.');
  }
};

export default {
  processPrepaidPayment,
  checkPrepaidAvailability,
  processPayment,
  requestRefund,
  getPaymentHistory,
  validateCard,
  getPaymentMethods
};