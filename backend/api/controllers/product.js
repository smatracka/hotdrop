// backend/api/controllers/product.js
const Product = require('../models/product');
const { generateSlug } = require('../utils/helpers');

// Pobiera wszystkie produkty sprzedawcy
exports.getProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, category, search, page = 1, limit = 10, sort, order } = req.query;
    
    const query = { seller: sellerId };
    
    // Filtruj po statusie
    if (status) {
      query.status = status;
    }
    
    // Filtruj po kategorii
    if (category) {
      query.category = category;
    }
    
    // Filtruj po frazie wyszukiwania
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Opcje sortowania
    const sortOptions = {};
    if (sort) {
      sortOptions[sort] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Domyślnie sortuj po dacie dodania (od najnowszych)
    }
    
    // Opcje paginacji
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOptions,
      populate: 'drops'
    };
    
    const products = await Product.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania produktów',
      error: error.message
    });
  }
};

// Pobiera szczegóły produktu
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('drops');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produkt nie został znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania produktu',
      error: error.message
    });
  }
};

// Pobiera produkty po tablicy ID
exports.getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Wymagana jest tablica ID produktów'
      });
    }
    
    const products = await Product.find({ _id: { $in: ids } });
    
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania produktów',
      error: error.message
    });
  }
};

// Tworzy nowy produkt
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      price,
      quantity,
      imageUrls,
      category,
      seller
    } = req.body;
    
    // Sprawdź czy SKU jest unikalne
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Produkt z tym SKU już istnieje'
      });
    }
    
    // Utwórz nowy produkt
    const product = new Product({
      name,
      description,
      sku,
      price,
      quantity,
      imageUrls: imageUrls || [],
      category,
      seller,
      status: 'draft',
      reserved: 0,
      sold: 0
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Produkt został utworzony pomyślnie'
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas tworzenia produktu',
      error: error.message
    });
  }
};

// Aktualizuje produkt
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Aktualizuj produkt
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produkt nie został znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product,
      message: 'Produkt został zaktualizowany pomyślnie'
    });
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji produktu',
      error: error.message
    });
  }
};

// Aktualizuje stan magazynowy produktu
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reserved, sold } = req.body;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produkt nie został znaleziony'
      });
    }
    
    // Aktualizuj tylko podane pola
    if (quantity !== undefined) product.quantity = quantity;
    if (reserved !== undefined) product.reserved = reserved;
    if (sold !== undefined) product.sold = sold;
    
    // Automatycznie ustaw status na 'out_of_stock' jeśli ilość = 0
    if (product.quantity === 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock' && product.quantity > 0) {
      product.status = 'active';
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product,
      message: 'Stan magazynowy został zaktualizowany pomyślnie'
    });
  } catch (error) {
    console.error(`Error updating inventory for product ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji stanu magazynowego',
      error: error.message
    });
  }
};

// Usuwa produkt
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produkt nie został znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Produkt został usunięty pomyślnie'
    });
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania produktu',
      error: error.message
    });
  }
};