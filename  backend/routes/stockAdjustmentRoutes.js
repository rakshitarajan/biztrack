// routes/stockAdjustmentRoutes.js
const express = require('express');
const router = express.Router();
const StockAdjustment = require('../models/StockAdjustment');
const Product = require('../models/Product'); // Needed for validation
const { protect, admin } = require('../middleware/authMiddleware'); // Admin might be too restrictive, maybe 'staff'?

// @route   POST /api/stock-adjustments
// @desc    Create a new stock adjustment (adding/removing non-sale stock)
// @access  Private (Staff/Admin - decide based on roles)
router.post('/', protect, async (req, res) => { // Using 'protect' - any logged-in user for now
  const { productId, quantityChange, reason, notes } = req.body;
  const userId = req.user._id; // From protect middleware

  // --- Basic Validation ---
  if (!productId || quantityChange === undefined || !reason) {
    return res.status(400).json({ message: 'Product ID, quantity change, and reason are required.' });
  }
  if (typeof quantityChange !== 'number' || quantityChange === 0) {
      return res.status(400).json({ message: 'Quantity change must be a non-zero number.' });
  }
  // Check if reason is valid according to the enum in the model
  const validReasons = StockAdjustment.schema.path('reason').enumValues;
  if (!validReasons.includes(reason)) {
      return res.status(400).json({ message: `Invalid reason: ${reason}. Must be one of: ${validReasons.join(', ')}` });
  }
  // --- End Validation ---

  try {
    // Verify product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: `Product with ID ${productId} not found.` });
    }

    // Prevent stock going negative if removing (optional, depends on business rules)
    if (quantityChange < 0 && productExists.currentStock < Math.abs(quantityChange)) {
       // Allow going negative OR return error:
       // return res.status(400).json({ message: `Cannot remove ${Math.abs(quantityChange)} units. Only ${productExists.currentStock} units available.` });
       console.warn(`StockAdjustment: Product ${productId} stock will become negative.`);
    }

    const newAdjustment = new StockAdjustment({
      product: productId,
      user: userId,
      quantityChange,
      reason,
      notes
      // adjustmentDate defaults to now
    });

    const savedAdjustment = await newAdjustment.save(); // This triggers the post-save hook to update Product stock

    // Fetch the updated product stock to return it (optional)
    const updatedProduct = await Product.findById(productId, 'currentStock');

    res.status(201).json({
        adjustment: savedAdjustment,
        newStockLevel: updatedProduct ? updatedProduct.currentStock : null // Return the result of the update
    });

  } catch (error) {
    console.error('Error creating stock adjustment:', error);
     if (error.name === 'ValidationError') {
       const messages = Object.values(error.errors).map(val => val.message);
       return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error while creating stock adjustment.' });
  }
});

// @route   GET /api/stock-adjustments/product/:productId
// @desc    Get adjustment history for a specific product
// @access  Private
router.get('/product/:productId', protect, async (req, res) => {
    try {
        const adjustments = await StockAdjustment.find({ product: req.params.productId })
            .populate('user', 'name email') // Show who made the adjustment
            .sort({ createdAt: -1 }); // Show most recent first

        if (!adjustments) {
             return res.status(404).json({ message: 'No adjustments found for this product.' });
        }
        res.json(adjustments);
    } catch (error) {
        console.error(`Error fetching adjustments for product ${req.params.productId}:`, error);
        res.status(500).json({ message: 'Server error fetching adjustment history.' });
    }
});


module.exports = router;