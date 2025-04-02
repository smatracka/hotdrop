// backend/api/controllers/drop.js
const Drop = require('../models/drop');
const Product = require('../models/product');
const DropPage = require('../models/dropPage');
const DropQueue = require('../models/dropQueue');
const CartReservation = require('../models/cartReservation');
const { generateSlug } = require('../utils/helpers');

// Get all drops for a seller
exports.getDrops = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { seller: sellerId };
    
    if (status) {
      query.status = status;
    }
    
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
      message: 'Error fetching drops',
      error: error.message
    });
  }
};

// Get drop details
exports.getDrop = async (req, res) => {
  try {
    const { id } = req.params;
    
    const drop = await Drop.findById(id).populate('products');
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
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
      message: 'Error fetching drop',
      error: error.message
    });
  }
};

// Create new drop
exports.createDrop = async (req, res) => {
  try {
    const dropData = req.body;
    
    const drop = await Drop.create(dropData);
    
    res.status(201).json({
      success: true,
      data: drop
    });
  } catch (error) {
    console.error('Error creating drop:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating drop',
      error: error.message
    });
  }
};

// Update drop
exports.updateDrop = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const drop = await Drop.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: drop
    });
  } catch (error) {
    console.error('Error updating drop:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating drop',
      error: error.message
    });
  }
};

// Create drop page
exports.createDropPage = async (req, res) => {
  try {
    const dropPageData = req.body;
    
    const dropPage = await DropPage.create(dropPageData);
    
    res.status(201).json({
      success: true,
      data: dropPage
    });
  } catch (error) {
    console.error('Error creating drop page:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating drop page',
      error: error.message
    });
  }
};

// Queue Management
exports.getQueue = async (req, res) => {
  try {
    const { dropId } = req.params;
    
    const queue = await DropQueue.findOne({ dropId });
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: queue
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue',
      error: error.message
    });
  }
};

exports.initializeQueue = async (req, res) => {
  try {
    const queueData = req.body;
    
    const queue = await DropQueue.create(queueData);
    
    res.status(201).json({
      success: true,
      data: queue
    });
  } catch (error) {
    console.error('Error initializing queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing queue',
      error: error.message
    });
  }
};

exports.updateQueue = async (req, res) => {
  try {
    const { dropId } = req.params;
    const updates = req.body;
    
    const queue = await DropQueue.findOneAndUpdate(
      { dropId },
      { ...updates, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: queue
    });
  } catch (error) {
    console.error('Error updating queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating queue',
      error: error.message
    });
  }
};

exports.joinQueue = async (req, res) => {
  try {
    const { dropId } = req.params;
    const { userId } = req.body;
    
    const queue = await DropQueue.findOne({ dropId });
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    if (queue.currentUsers >= queue.maxConcurrentUsers) {
      if (!queue.queue.includes(userId)) {
        queue.queue.push(userId);
        await queue.save();
        return res.status(200).json({
          success: true,
          data: false // User added to waiting queue
        });
      }
      return res.status(200).json({
        success: true,
        data: false // User already in waiting queue
      });
    }
    
    queue.activeUsers.push(userId);
    queue.currentUsers++;
    await queue.save();
    
    res.status(200).json({
      success: true,
      data: true // User can enter immediately
    });
  } catch (error) {
    console.error('Error joining queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining queue',
      error: error.message
    });
  }
};

exports.leaveQueue = async (req, res) => {
  try {
    const { dropId } = req.params;
    const { userId } = req.body;
    
    const queue = await DropQueue.findOne({ dropId });
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }
    
    queue.activeUsers = queue.activeUsers.filter(id => id !== userId);
    queue.queue = queue.queue.filter(id => id !== userId);
    queue.currentUsers--;
    
    await queue.save();
    
    res.status(200).json({
      success: true,
      data: queue
    });
  } catch (error) {
    console.error('Error leaving queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving queue',
      error: error.message
    });
  }
};

// Cart Reservation
exports.createCartReservation = async (req, res) => {
  try {
    const { dropId } = req.params;
    const { userId, products } = req.body;
    
    const reservation = await CartReservation.create({
      dropId,
      userId,
      products,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error creating cart reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating cart reservation',
      error: error.message
    });
  }
};

exports.getCartReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    const reservation = await CartReservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Cart reservation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error fetching cart reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart reservation',
      error: error.message
    });
  }
};

exports.updateCartReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;
    
    const reservation = await CartReservation.findByIdAndUpdate(
      reservationId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Cart reservation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error updating cart reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart reservation',
      error: error.message
    });
  }
};

// Publish drop
exports.publishDrop = async (req, res) => {
  try {
    const { id } = req.params;
    
    const drop = await Drop.findByIdAndUpdate(
      id,
      { 
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: drop
    });
  } catch (error) {
    console.error('Error publishing drop:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing drop',
      error: error.message
    });
  }
};

// Delete drop
exports.deleteDrop = async (req, res) => {
  try {
    const { id } = req.params;
    
    const drop = await Drop.findByIdAndDelete(id);
    
    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }
    
    // Delete associated drop page
    await DropPage.findOneAndDelete({ dropId: id });
    
    // Delete associated queue
    await DropQueue.findOneAndDelete({ dropId: id });
    
    // Delete associated cart reservations
    await CartReservation.deleteMany({ dropId: id });
    
    res.status(200).json({
      success: true,
      message: 'Drop and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting drop:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting drop',
      error: error.message
    });
  }
};