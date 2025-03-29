// backend/api/controllers/drop.js
const Drop = require('../models/drop');
const Product = require('../models/product');
const { generateSlug } = require('../utils/helpers');

// Pobiera wszystkie dropy sprzedawcy
exports.getDrops = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { seller: sellerId };
    
    // Filtruj po statusie jeśli podano
    if (status) {
      query.status = status;
    }
    
    // Paginacja
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { startDate: -1 },
      populate: 'products'
    };
    
    // Zaślepka dla testów
    const drops = {
      docs: [
        {
          _id: '65fdca1234567890abcdef20',
          name: 'Letnia Kolekcja 2025',
          description: 'Najnowsze produkty na sezon letni',
          slug: 'letnia-kolekcja-2025',
          startDate: new Date('2025-04-02T12:00:00Z'),
          timeLimit: 10,
          status: 'draft',
          products: [],
          seller: sellerId,
          customization: {
            headerColor: '#1a1a2e',
            buttonColor: '#4CAF50',
            fontColor: '#333333',
            backgroundColor: '#f8f9fa'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      totalDocs: 1,
      limit: parseInt(limit),
      totalPages: 1,
      page: parseInt(page),
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null
    };
    
    res.status(200).json({
      success: true,
      data: drops
    });
  } catch (error) {
    console.error('Error fetching drops:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania dropów',
      error: error.message
    });
  }
};

// Pobiera szczegóły dropu
exports.getDrop = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Zaślepka dla testów
    const drop = {
      _id: id,
      name: 'Letnia Kolekcja 2025',
      description: 'Najnowsze produkty na sezon letni',
      slug: 'letnia-kolekcja-2025',
      startDate: new Date('2025-04-02T12:00:00Z'),
      timeLimit: 10,
      status: 'draft',
      products: [],
      seller: '65fdca1234567890abcdef00',
      customization: {
        headerColor: '#1a1a2e',
        buttonColor: '#4CAF50',
        fontColor: '#333333',
        backgroundColor: '#f8f9fa'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop nie został znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: drop
    });
  } catch (error) {
    console.error('Error fetching drop:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania szczegółów dropu',
      error: error.message
    });
  }
};

// Utwórz nowy drop
exports.createDrop = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      timeLimit,
      products,
      seller
    } = req.body;
    
    // Generuj slug z nazwy - zaślepka
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Zaślepka dla testów
    const drop = {
      _id: '65fdca1234567890abcdef' + Math.floor(Math.random() * 100),
      name,
      description,
      slug,
      startDate,
      timeLimit,
      products: products || [],
      seller,
      status: 'draft',
      customization: {
        headerColor: '#1a1a2e',
        buttonColor: '#4CAF50',
        fontColor: '#333333',
        backgroundColor: '#f8f9fa'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      data: drop,
      message: 'Drop został utworzony pomyślnie'
    });
  } catch (error) {
    console.error('Error creating drop:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas tworzenia dropu',
      error: error.message
    });
  }
};

// Aktualizuj drop
exports.updateDrop = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Zaślepka dla testów
    const drop = {
      _id: id,
      ...updateData,
      updatedAt: new Date()
    };
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop nie został znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: drop,
      message: 'Drop został zaktualizowany pomyślnie'
    });
  } catch (error) {
    console.error('Error updating drop:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji dropu',
      error: error.message
    });
  }
};

// Opublikuj drop
exports.publishDrop = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Zaślepka dla testów
    const drop = {
      _id: id,
      status: 'published',
      updatedAt: new Date()
    };
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop nie został znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      data: drop,
      message: 'Drop został opublikowany pomyślnie'
    });
  } catch (error) {
    console.error('Error publishing drop:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas publikowania dropu',
      error: error.message
    });
  }
};

// Usuń drop
exports.deleteDrop = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Zaślepka dla testów
    const drop = { _id: id };
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop nie został znaleziony'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Drop został usunięty pomyślnie'
    });
  } catch (error) {
    console.error('Error deleting drop:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania dropu',
      error: error.message
    });
  }
};