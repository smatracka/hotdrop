/**
 * Serwis do obsługi operacji związanych z dropami
 * Zawiera metody do pobierania danych o dropach, sprawdzania statusu kolejki, itp.
 */
import api from './api';

/**
 * Pobiera szczegóły dropu
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Dane dropu
 */
export const fetchDropDetails = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching drop details:', error);
    throw new Error('Nie udało się pobrać szczegółów dropu.');
  }
};

/**
 * Sprawdza status kolejki dla dropu
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Status kolejki
 */
export const fetchQueueStatus = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/queue/status`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching queue status:', error);
    throw new Error('Nie udało się sprawdzić statusu kolejki.');
  }
};

/**
 * Sprawdza dostępność produktów w dropie
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Dostępność produktów
 */
export const checkProductsAvailability = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/products/availability`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking products availability:', error);
    throw new Error('Nie udało się sprawdzić dostępności produktów.');
  }
};

/**
 * Sprawdza czy drop jest aktywny
 * @param {string} dropId - ID dropu
 * @returns {Promise<boolean>} Czy drop jest aktywny
 */
export const isDropActive = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/status`);
    return response.data.data.isActive;
  } catch (error) {
    console.error('Error checking drop status:', error);
    throw new Error('Nie udało się sprawdzić statusu dropu.');
  }
};

/**
 * Pobiera statystyki dropu
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Statystyki dropu
 */
export const fetchDropStats = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/stats`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching drop stats:', error);
    throw new Error('Nie udało się pobrać statystyk dropu.');
  }
};

/**
 * Pobiera informacje o pozostałym czasie zakupów
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Informacje o czasie
 */
export const fetchShoppingTimeInfo = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/shopping-time`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching shopping time info:', error);
    throw new Error('Nie udało się pobrać informacji o czasie zakupów.');
  }
};

/**
 * Aktualizuje czas zakupów użytkownika
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Zaktualizowane informacje o czasie
 */
export const updateShoppingTime = async (dropId) => {
  try {
    const response = await api.post(`/drops/${dropId}/extend-time`);
    return response.data.data;
  } catch (error) {
    console.error('Error updating shopping time:', error);
    throw new Error('Nie udało się zaktualizować czasu zakupów.');
  }
};

export default {
  fetchDropDetails,
  fetchQueueStatus,
  checkProductsAvailability,
  isDropActive,
  fetchDropStats,
  fetchShoppingTimeInfo,
  updateShoppingTime
};