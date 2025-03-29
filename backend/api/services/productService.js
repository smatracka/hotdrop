// backend/api/services/productService.js
const Product = require('../models/product');

/**
 * Pobiera wszystkie produkty dla danego sprzedawcy z filtrowaniem i paginacją
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @param {Object} options - Opcje filtrowania i paginacji
 * @returns {Promise<Object>} - Paginowane produkty
 */
exports.getProducts = async (sellerId, options = {}) => {
  const { status, category, search, page = 1, limit = 10, sort, order } = options;
  
  const query = { seller: sellerId };
  
  // Filtrowanie po statusie
  if (status) {
    query.status = status;
  }
  
  // Filtrowanie po kategorii
  if (category) {
    query.category = category;
  }
  
  // Filtrowanie po frazie wyszukiwania
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
  const paginationOptions = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: sortOptions,
    populate: 'drops'
  };
  
  try {
    // W rzeczywistym projekcie: return await Product.paginate(query, paginationOptions);
    
    // Zaślepka danych
    return {
      docs: [
        {
          _id: '65fdca1234567890abcdef30',
          name: 'T-shirt "Summer Vibes"',
          description: 'Wygodny t-shirt na lato',
          sku: 'TS-001',
          price: 99.99,
          quantity: 250,
          reserved: 0,
          sold: 0,
          imageUrls: ['https://example.com/tshirt.jpg'],
          category: 'Odzież',
          status: 'active',
          drops: [],
          seller: sellerId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '65fdca1234567890abcdef31',
          name: 'Bluza "Spring Collection"',
          description: 'Stylowa bluza na wiosnę',
          sku: 'BL-002',
          price: 199.99,
          quantity: 150,
          reserved: 0,
          sold: 0,
          imageUrls: ['https://example.com/hoodie.jpg'],
          category: 'Odzież',
          status: 'active',
          drops: [],
          seller: sellerId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      totalDocs: 2,
      limit: parseInt(limit),
      totalPages: 1,
      page: parseInt(page),
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null
    };
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

/**
 * Pobiera produkt po ID
 * 
 * @param {string} id - ID produktu
 * @returns {Promise<Object>} - Szczegóły produktu
 */
exports.getProductById = async (id) => {
  try {
    // W rzeczywistym projekcie: return await Product.findById(id).populate('drops');
    
    // Zaślepka
    return {
      _id: id,
      name: 'T-shirt "Summer Vibes"',
      description: 'Wygodny t-shirt na lato',
      sku: 'TS-001',
      price: 99.99,
      quantity: 250,
      reserved: 0,
      sold: 0,
      imageUrls: ['https://example.com/tshirt.jpg'],
      category: 'Odzież',
      status: 'active',
      drops: [],
      seller: '65fdca1234567890abcdef00',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

/**
 * Pobiera produkty po tablicy ID
 * 
 * @param {Array<string>} ids - Tablica ID produktów
 * @returns {Promise<Array<Object>>} - Lista produktów
 */
exports.getProductsByIds = async (ids) => {
  try {
    // W rzeczywistym projekcie: return await Product.find({ _id: { $in: ids } });
    
    // Zaślepka
    return ids.map(id => ({
      _id: id,
      name: `Produkt ${id.substring(id.length - 4)}`,
      description: 'Opis produktu',
      sku: `SKU-${id.substring(id.length - 4)}`,
      price: 99.99,
      quantity: 100,
      reserved: 0,
      sold: 0,
      imageUrls: ['https://example.com/product.jpg'],
      category: 'Odzież',
      status: 'active',
      drops: [],
      seller: '65fdca1234567890abcdef00',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  } catch (error) {
    throw new Error(`Error fetching products by IDs: ${error.message}`);
  }
};

/**
 * Tworzy nowy produkt
 * 
 * @param {Object} productData - Dane produktu
 * @returns {Promise<Object>} - Utworzony produkt
 */
exports.createProduct = async (productData) => {
  try {
    const { sku } = productData;
    
    // Sprawdź, czy SKU jest unikalne
    // W rzeczywistym projekcie: const existingProduct = await Product.findOne({ sku });
    const existingProduct = null;
    
    if (existingProduct) {
      throw new Error('Produkt z tym SKU już istnieje');
    }
    
    // Tworzenie nowego produktu
    // W rzeczywistym projekcie:
    // const product = new Product(productData);
    // await product.save();
    
    // Zaślepka
    const product = {
      _id: '65fdca1234567890abcdef' + Math.floor(Math.random() * 100),
      ...productData,
      reserved: 0,
      sold: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return product;
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

/**
 * Aktualizuje produkt
 * 
 * @param {string} id - ID produktu
 * @param {Object} updateData - Dane do aktualizacji
 * @returns {Promise<Object>} - Zaktualizowany produkt
 */
exports.updateProduct = async (id, updateData) => {
  try {
    // W rzeczywistym projekcie:
    // const product = await Product.findByIdAndUpdate(id, updateData, {
    //   new: true,
    //   runValidators: true
    // });
    
    // Zaślepka
    const product = {
      _id: id,
      ...updateData,
      updatedAt: new Date()
    };
    
    return product;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

/**
 * Aktualizuje stan magazynowy produktu
 * 
 * @param {string} id - ID produktu
 * @param {Object} inventoryData - Dane stanu magazynowego
 * @returns {Promise<Object>} - Zaktualizowany produkt
 */
exports.updateInventory = async (id, inventoryData) => {
  try {
    // W rzeczywistym projekcie:
    // const product = await Product.findById(id);
    // if (!product) throw new Error('Produkt nie został znaleziony');
    
    // Zaślepka
    const product = await exports.getProductById(id);
    
    // Aktualizacja pól
    const { quantity, reserved, sold } = inventoryData;
    
    if (quantity !== undefined) product.quantity = quantity;
    if (reserved !== undefined) product.reserved = reserved;
    if (sold !== undefined) product.sold = sold;
    
    // Automatycznie ustaw status na 'out_of_stock' jeśli ilość = 0
    if (product.quantity === 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock' && product.quantity > 0) {
      product.status = 'active';
    }
    
    // W rzeczywistym projekcie: await product.save();
    
    product.updatedAt = new Date();
    
    return product;
  } catch (error) {
    throw new Error(`Error updating inventory: ${error.message}`);
  }
};

/**
 * Usuwa produkt
 * 
 * @param {string} id - ID produktu
 * @returns {Promise<boolean>} - Czy usunięcie się powiodło
 */
exports.deleteProduct = async (id) => {
  try {
    // W rzeczywistym projekcie:
    // const product = await Product.findByIdAndDelete(id);
    // return !!product;
    
    // Zaślepka
    console.log(`Deleting product with ID: ${id}`);
    return true;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

/**
 * Pobiera kategorie produktów
 * 
 * @param {string} sellerId - ID sprzedawcy
 * @returns {Promise<Array<string>>} - Lista kategorii
 */
exports.getCategories = async (sellerId) => {
  try {
    // W rzeczywistym projekcie:
    // const categories = await Product.distinct('category', { seller: sellerId });
    // return categories;
    
    // Zaślepka
    return ['Odzież', 'Akcesoria', 'Dekoracje', 'Elektronika', 'Książki'];
  } catch (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
  }
};