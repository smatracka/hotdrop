// controllers/drop.js
const Drop = require('../models/drop');
const Product = require('../models/product');
const { generateSlug } = require('../utils/helpers');

// Pobierz wszystkie dropy sprzedawcy
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
    
    const drops = await Drop.paginate(query, options);
    
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

// Pobierz szczegóły dropu
exports.getDrop = async (req, res) => {
  try {
    const { id } = req.params;
    const drop = await Drop.findById(id).populate('products');
    
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
    
    // Generuj slug z nazwy
    const slug = generateSlug(name);
    
    // Sprawdź czy slug jest unikalny
    const existingDrop = await Drop.findOne({ slug });
    if (existingDrop) {
      return res.status(400).json({
        success: false,
        message: 'Drop o tej nazwie już istnieje'
      });
    }
    
    // Utwórz nowy drop
    const drop = new Drop({
      name,
      description,
      slug,
      startDate,
      timeLimit,
      products,
      seller,
      status: 'draft'
    });
    
    await drop.save();
    
    // Jeśli podano produkty, zaktualizuj je o referencję do dropu
    if (products && products.length > 0) {
      await Product.updateMany(
        { _id: { $in: products } },
        { $addToSet: { drops: drop._id } }
      );
    }
    
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
    
    // Jeśli aktualizujemy nazwę, zaktualizuj również slug
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);
      
      // Sprawdź czy slug jest unikalny (pomijając aktualny drop)
      const existingDrop = await Drop.findOne({ 
        slug: updateData.slug,
        _id: { $ne: id }
      });
      
      if (existingDrop) {
        return res.status(400).json({
          success: false,
          message: 'Drop o tej nazwie już istnieje'
        });
      }
    }
    
    // Aktualizuj drop
    const drop = await Drop.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('products');
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop nie został znaleziony'
      });
    }
    
    // Jeśli zaktualizowano produkty, zaktualizuj referencje w kolekcji produktów
    if (updateData.products) {
      // Usuń referencję do tego dropu ze wszystkich produktów
      await Product.updateMany(
        { drops: id },
        { $pull: { drops: id } }
      );
      
      // Dodaj referencję do dropu dla nowych produktów
      await Product.updateMany(
        { _id: { $in: updateData.products } },
        { $addToSet: { drops: id } }
      );
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
    
    const drop = await Drop.findById(id);
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop nie został znaleziony'
      });
    }
    
    // Sprawdź czy drop może być opublikowany
    if (!drop.products || drop.products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Drop musi zawierać co najmniej jeden produkt'
      });
    }
    
    if (!drop.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Drop musi mieć określoną datę rozpoczęcia'
      });
    }
    
    // Zmień status na 'published'
    drop.status = 'published';
    await drop.save();
    
    // Automatycznie wygeneruj stronę dropu (w rzeczywistej implementacji)
    // generateDropPage(drop);
    
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
    
    // Usuń drop
    const drop = await Drop.findByIdAndDelete(id);
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop nie został znaleziony'
      });
    }
    
    // Usuń referencje do dropu z produktów
    await Product.updateMany(
      { drops: id },
      { $pull: { drops: id } }
    );
    
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
