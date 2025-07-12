// // models/StockAdjustment.js
// const mongoose = require('mongoose');

// const StockAdjustmentSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   user: { // User who performed the adjustment
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   quantityChange: { // Positive for adding, negative for removing
//     type: Number,
//     required: true
//   },
//   reason: {
//     type: String,
//     required: true,
//     enum: [
//       'Initial Stock',
//       'Received Shipment',
//       'Customer Return',
//       'Damaged Goods',
//       'Expired Goods',
//       'Stock Correction (Found)',
//       'Stock Correction (Shortage)',
//       'Internal Use',
//       'Manual Removal'
//       // Add other reasons as needed
//     ]
//   },
//   adjustmentDate: { // Defaults to now, but allows backdating if needed
//     type: Date,
//     default: Date.now
//   },
//   notes: {
//     type: String,
//     trim: true
//   }
// }, { timestamps: true });

// // Middleware to automatically update the Product's currentStock after saving an adjustment
// StockAdjustmentSchema.post('save', async function(doc, next) {
//   console.log(`StockAdjustment Hook: Adjusting stock for Product ${doc.product} by ${doc.quantityChange}`);
//   try {
//     // Use the constructor's model reference to avoid circular dependencies
//     await this.constructor.model('Product').findByIdAndUpdate(doc.product, {
//       $inc: { currentStock: doc.quantityChange } // Use $inc to atomically add/subtract
//     });
//     console.log(`StockAdjustment Hook: Product ${doc.product} stock updated.`);
//     next();
//   } catch (error) {
//     console.error(`StockAdjustment Hook Error: Failed to update stock for Product ${doc.product}`, error);
//     // Decide how to handle this - maybe log it prominently?
//     // Depending on your error strategy, you might pass the error to next(error)
//     // For now, we log it but allow the process to continue.
//     next();
//   }
// });


// module.exports = mongoose.model('StockAdjustment', StockAdjustmentSchema);

// backend/models/StockAdjustment.js
const mongoose = require('mongoose');

const StockAdjustmentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required for stock adjustment.'],
    index: true // Good to index if you query adjustments by product
  },
  user: { // User who performed the adjustment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required for stock adjustment.']
  },
  quantityChange: { // Positive for adding, negative for removing
    type: Number,
    required: [true, 'Quantity change is required.']
  },
  reason: {
    type: String,
    required: [true, 'Reason for stock adjustment is required.'],
    enum: [
      'Initial Stock',
      'Received Shipment',
      'Customer Return',
      'Damaged Goods',
      'Expired Goods',
      'Stock Correction (Found)',
      'Stock Correction (Shortage)',
      'Internal Use',
      'Manual Removal',
      'Initial Stock - Bulk Upload' // Added for this feature
      // Add other reasons as needed
    ]
  },
  adjustmentDate: { // Defaults to now, but allows backdating if needed
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Middleware to automatically update the Product's currentStock after saving an adjustment
StockAdjustmentSchema.post('save', async function (doc, next) {
  // 'this' refers to the document that was saved
  // 'doc' is also the document that was saved

  // Check if quantityChange is a valid number to avoid issues
  if (typeof doc.quantityChange !== 'number' || isNaN(doc.quantityChange)) {
    console.error(`StockAdjustment Hook Error: Invalid quantityChange for Product ${doc.product}. Not updating stock.`);
    return next(new Error('Invalid quantityChange value for stock adjustment.')); // Optionally pass error
  }

  console.log(`StockAdjustment Hook: Adjusting stock for Product ${doc.product} by ${doc.quantityChange}`);
  try {
    // It's generally safer to access the model via mongoose.model if 'this.constructor.model' is problematic
    const ProductModel = mongoose.model('Product');
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      doc.product,
      { $inc: { currentStock: doc.quantityChange } },
      { new: true } // Return the updated document (optional, for logging)
    );

    if (!updatedProduct) {
      console.error(`StockAdjustment Hook Error: Product ${doc.product} not found. Stock not updated.`);
      // Potentially throw an error or handle this case
      return next(new Error(`Product with ID ${doc.product} not found during stock adjustment.`));
    }

    console.log(`StockAdjustment Hook: Product ${doc.product} stock updated. New stock: ${updatedProduct.currentStock}`);
    next();
  } catch (error) {
    console.error(`StockAdjustment Hook Error: Failed to update stock for Product ${doc.product}`, error);
    // Depending on your error strategy, you might pass the error to next(error)
    // This would prevent further operations if the stock update fails, which might be desired.
    next(error); // Pass the error to the next middleware/error handler
  }
});


module.exports = mongoose.model('StockAdjustment', StockAdjustmentSchema);