const Inventory = require('../models/inventory');
const Product = require('../models/product');
const logger = require('../utils/logger');
const axios = require('axios');
const config = require('../config');

// Pobieranie stanu magazynowego dla produktu
exports.getProductStock = async (productId) => {
  try {
    // Sprawdź czy stan magazynowy dla produktu istnieje
    let inventory = await Inventory.findOne({ product: productId });
    
    // Jeśli nie istnieje, pobierz dane produktu i utwórz stan magazynowy
    if (!inventory) {
      // Pobierz dane produktu z głównego API
      const productResponse = await axios.get(`${config.apiServiceUrl}/api/products/${productId}`);
      const product = productResponse.data.data;
      
      if (!product) {
        throw new Error('Produkt nie został znaleziony');
      }
      
      // Utwórz nowy stan magazynowy
      inventory = new Inventory({
        product: productId,
        quantity: product.quantity || 0,
        reserved: product.reserved || 0,
        available: (product.quantity || 0) - (product.reserved || 0),
        seller: product.seller,
        lowStockThreshold: 5 // Domyślny próg niskiego stanu
      });
      
      await inventory.save();
    }
    
    // Upewnij się, że pole available jest aktualne
    inventory.available = inventory.quantity - inventory.reserved;
    if (inventory.isModified()) {
      await inventory.save();
    }
    
    return inventory;
  } catch (error) {
    logger.error(`Error getting product stock for product ${productId}:`, error);
    throw error;
  }
};

// Pobieranie stanu magazynowego dla wszystkich produktów sprzedawcy
exports.getSellerInventory = async (sellerId, query = {}, options = {}) => {
  try {
    query.seller = sellerId;
    return await Inventory.paginate(query, options);
  } catch (error) {
    logger.error(`Error getting inventory for seller ${sellerId}:`, error);
    throw error;
  }
};

// Aktualizacja stanu magazynowego produktu
exports.updateProductStock = async (productId, updateData) => {
  try {
    // Pobierz lub utwórz stan magazynowy
    let inventory = await this.getProductStock(productId);
    
    // Aktualizuj pola
    Object.keys(updateData).forEach(key => {
      inventory[key] = updateData[key];
    });
    
    // Aktualizuj pole available
    inventory.available = inventory.quantity - inventory.reserved;
    
    // Aktualizuj pole lastUpdated
    inventory.lastUpdated = Date.now();
    
    // Resetuj flagę alertu, jeśli stan wzrósł powyżej progu
    if (inventory.quantity > inventory.lowStockThreshold && inventory.lowStockAlertSent) {
      inventory.lowStockAlertSent = false;
    }
    
    // Zapisz zmiany
    await inventory.save();
    
    // Synchronizuj z głównym serwisem API
    try {
      await axios.patch(`${config.apiServiceUrl}/api/products/${productId}/inventory`, {
        quantity: inventory.quantity,
        reserved: inventory.reserved,
        sold: inventory.sold
      });
    } catch (syncError) {
      logger.error(`Error syncing inventory with main API for product ${productId}:`, syncError);
      // Kontynuuj nawet jeśli synchronizacja nie powiodła się
    }
    
    return inventory;
  } catch (error) {
    logger.error(`Error updating product stock for product ${productId}:`, error);
    throw error;
  }
};

// Masowa aktualizacja stanów magazynowych
exports.bulkUpdateStock = async (updates) => {
  try {
    const results = [];
    
    // Iteruj przez każdą aktualizację
    for (const update of updates) {
      const { productId, quantity, reserved, lowStockThreshold } = update;
      
      const updateData = {};
      if (quantity !== undefined) updateData.quantity = quantity;
      if (reserved !== undefined) updateData.reserved = reserved;
      if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
      
      try {
        const inventory = await this.updateProductStock(productId, updateData);
        results.push({
          productId,
          success: true,
          data: inventory
        });
      } catch (error) {
        results.push({
          productId,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  } catch (error) {
    logger.error('Error during bulk update of inventory:', error);
    throw error;
  }
};

// Pobieranie produktów z niskim stanem magazynowym
exports.getLowStockProducts = async (sellerId, options = {}) => {
  try {
    const query = {
      seller: sellerId,
      $and: [
        { quantity: { $gt: 0 } },
        { quantity: { $lte: '$lowStockThreshold' } }
      ]
    };
    
    return await Inventory.paginate(query, options);
  } catch (error) {
    logger.error(`Error getting low stock products for seller ${sellerId}:`, error);
    throw error;
  }
};