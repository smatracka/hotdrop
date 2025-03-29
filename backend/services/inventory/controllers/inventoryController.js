const Inventory = require('../models/inventory');
const Product = require('../models/product');
const inventoryService = require('../services/inventoryService');
const logger = require('../utils/logger');

// Pobieranie stanu magazynowego dla produktu
exports.getProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const inventory = await inventoryService.getProductStock(productId);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Stan magazynowy nie został znaleziony dla tego produktu'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error(`Error fetching product stock for product ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania stanu magazynowego',
      error: error.message
    });
  }
};

// Pobieranie stanu magazynowego dla wszystkich produktów sprzedawcy
exports.getSellerInventory = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', status } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sort]: order === 'desc' ? -1 : 1 },
      populate: 'product'
    };
    
    const query = { seller: sellerId };
    
    // Filtruj po statusie jeśli podano
    if (status) {
      if (status === 'low_stock') {
        query.quantity = { $lte: '$lowStockThreshold', $gt: 0 };
      } else if (status === 'out_of_stock') {
        query.quantity = 0;
      } else if (status === 'in_stock') {
        query.quantity = { $gt: '$lowStockThreshold' };
      }
    }
    
    const inventory = await inventoryService.getSellerInventory(sellerId, query, options);
    
    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    logger.error(`Error fetching inventory for seller ${req.params.sellerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania stanów magazynowych',
      error: error.message
    });
  }
};

// Aktualizacja stanu magazynowego produktu
exports.updateProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reserved, lowStockThreshold } = req.body;
    
    if (quantity === undefined && reserved === undefined && lowStockThreshold === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Brak danych do aktualizacji'
      });
    }
    
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (reserved !== undefined) updateData.reserved = reserved;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
    
    const inventory = await inventoryService.updateProductStock(productId, updateData);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Stan magazynowy nie został znaleziony dla tego produktu'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Stan magazynowy został zaktualizowany pomyślnie'
    });
  } catch (error) {
    logger.error(`Error updating stock for product ${req.params.productId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji stanu magazynowego',
      error: error.message
    });
  }
};

// Aktualizacja wielu produktów jednocześnie
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Wymagana jest tablica aktualizacji'
      });
    }
    
    const results = await inventoryService.bulkUpdateStock(updates);
    
    res.status(200).json({
      success: true,
      data: results,
      message: 'Stany magazynowe zostały zaktualizowane pomyślnie'
    });
  } catch (error) {
    logger.error('Error bulk updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas masowej aktualizacji stanów magazynowych',
      error: error.message
    });
  }
};

// Pobieranie produktów z niskim stanem magazynowym
exports.getLowStockProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { quantity: 1 },
      populate: 'product'
    };
    
    const lowStockProducts = await inventoryService.getLowStockProducts(sellerId, options);
    
    res.status(200).json({
      success: true,
      data: lowStockProducts
    });
  } catch (error) {
    logger.error(`Error fetching low stock products for seller ${req.params.sellerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania produktów z niskim stanem magazynowym',
      error: error.message
    });
  }
};