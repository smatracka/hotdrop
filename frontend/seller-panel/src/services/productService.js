import api from './api';

/**
 * Pobiera listę produktów z możliwością filtrowania i sortowania
 * 
 * @param {Object} params - Parametry zapytania
 * @param {string} params.sellerId - ID sprzedawcy
 * @param {string} params.status - Status produktów (active, draft, hidden, out_of_stock)
 * @param {string} params.category - Kategoria produktów
 * @param {string} params.search - Fraza wyszukiwania
 * @param {number} params.page - Numer strony (1-indexed)
 * @param {number} params.limit - Liczba elementów na stronę
 * @param {string} params.sort - Pole, po którym sortować
 * @param {string} params.order - Kierunek sortowania (asc, desc)
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getProducts = async (params = {}) => {
  try {
    const { sellerId, ...queryParams } = params;
    const response = await api.get(`/products/seller/${sellerId}`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Pobiera szczegóły pojedynczego produktu
 * 
 * @param {string} productId - ID produktu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

/**
 * Pobiera produkty według tablicy ID
 * 
 * @param {Array} productIds - Tablica ID produktów
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const fetchProductsByIds = async (productIds) => {
  try {
    const response = await api.post('/products/by-ids', { ids: productIds });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    throw error;
  }
};

/**
 * Tworzy nowy produkt
 * 
 * @param {Object} productData - Dane produktu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Aktualizuje istniejący produkt
 * 
 * @param {string} productId - ID produktu
 * @param {Object} productData - Dane do aktualizacji
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    throw error;
  }
};

/**
 * Aktualizuje stan magazynowy produktu
 * 
 * @param {string} productId - ID produktu
 * @param {Object} inventoryData - Dane stanu magazynowego
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const updateInventory = async (productId, inventoryData) => {
  try {
    const response = await api.patch(`/products/${productId}/inventory`, inventoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Usuwa produkt
 * 
 * @param {string} productId - ID produktu
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    throw error;
  }
};

/**
 * Przesyła zdjęcie produktu
 * 
 * @param {string} productId - ID produktu
 * @param {File} imageFile - Plik zdjęcia
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const uploadProductImage = async (productId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading image for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Usuwa zdjęcie produktu
 * 
 * @param {string} productId - ID produktu
 * @param {string} imageUrl - URL zdjęcia
 * @returns {Promise<Object>} - Dane odpowiedzi
 */
export const deleteProductImage = async (productId, imageUrl) => {
  try {
    const response = await api.delete(`/products/${productId}/images`, {
      data: { imageUrl },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting image for product ${productId}:`, error);
    throw error;
  }
};

export default {
  getProducts,
  getProduct,
  fetchProductsByIds,
  createProduct,
  updateProduct,
  updateInventory,
  deleteProduct,
  uploadProductImage,
  deleteProductImage
};