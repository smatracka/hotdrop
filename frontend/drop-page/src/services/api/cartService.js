/**
 * Serwis do obsługi operacji związanych z koszykiem
 * Zawiera metody do dodawania, usuwania produktów, pobierania koszyka, itp.
 */
import api from './api';

/**
 * Pobiera zawartość koszyka
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Zawartość koszyka
 */
export const getCart = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/cart`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw new Error('Nie udało się pobrać zawartości koszyka.');
  }
};

/**
 * Dodaje produkt do koszyka
 * @param {string} dropId - ID dropu
 * @param {string} productId - ID produktu
 * @param {number} quantity - Ilość produktu
 * @returns {Promise<Object>} Zaktualizowana zawartość koszyka
 */
export const addToCart = async (dropId, productId, quantity) => {
  try {
    const response = await api.post(`/drops/${dropId}/cart/add`, {
      productId,
      quantity
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error('Nie udało się dodać produktu do koszyka.');
  }
};

/**
 * Usuwa produkt z koszyka
 * @param {string} dropId - ID dropu
 * @param {string} productId - ID produktu
 * @returns {Promise<Object>} Zaktualizowana zawartość koszyka
 */
export const removeFromCart = async (dropId, productId) => {
  try {
    const response = await api.post(`/drops/${dropId}/cart/remove`, {
      productId
    });
    return response.data.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Nie udało się usunąć produktu z koszyka.');
  }
};

/**
 * Aktualizuje ilość produktu w koszyku
 * @param {string} dropId - ID dropu
 * @param {string} productId - ID produktu
 * @param {number} quantity - Nowa ilość produktu
 * @returns {Promise<Object>} Zaktualizowana zawartość koszyka
 */
export const updateCartItemQuantity = async (dropId, productId, quantity) => {
  try {
    const response = await api.post(`/drops/${dropId}/cart/update`, {
      productId,
      quantity
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw new Error('Nie udało się zaktualizować ilości produktu w koszyku.');
  }
};

/**
 * Czyści zawartość koszyka
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Pusty koszyk
 */
export const clearCart = async (dropId) => {
  try {
    const response = await api.post(`/drops/${dropId}/cart/clear`);
    return response.data.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Nie udało się wyczyścić koszyka.');
  }
};

/**
 * Sprawdza dostępność produktów w koszyku
 * @param {string} dropId - ID dropu
 * @returns {Promise<Object>} Informacje o dostępności produktów
 */
export const checkCartAvailability = async (dropId) => {
  try {
    const response = await api.get(`/drops/${dropId}/cart/availability`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking cart availability:', error);
    throw new Error('Nie udało się sprawdzić dostępności produktów w koszyku.');
  }
};

export default {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  checkCartAvailability
};