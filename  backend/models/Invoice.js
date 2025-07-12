// models/Invoice.js (Backend)
const mongoose = require('mongoose');
const Counter = require('./Counter'); // Ensure path is correct

// Define the main Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required.'], // Validation will be handled by pre-save
    unique: true, // Ensure uniqueness
    index: true   // Index for faster lookups
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true // Optional phone number
  },
  items: [ // Array of items in the invoice
    {
      _id: false, // No separate _id for items subdocuments needed here
      product: { // Reference to the Product document
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1.'] // Minimum quantity validation
      },
      // Store historical data directly on the item
      priceAtSale: { // Price per unit at the time of sale
        type: Number,
        required: true
      },
      discountPercentageAtSale: { // Discount applied to this item at time of sale
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      productName: { // Denormalized product name for history
        type: String,
        required: true
      },
      productSku: { // Denormalized product SKU for history
        type: String
        // Not strictly required here, but good to have
      }
    }
  ],
  // Calculated financial fields
  subtotal: { type: Number, required: true, default: 0 },
  cgstRate: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, default: 0 },
  // Status fields
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Cancelled', 'Void'],
    default: 'Paid'
  },
  status: { // Overall status of the invoice itself
    type: String,
    enum: ['Active', 'Cancelled', 'Void'],
    default: 'Active'
  },
  // Reference to the user who created the invoice
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// --- Middleware (Hook) to generate invoice number BEFORE saving ---
InvoiceSchema.pre('validate', async function(next) {
  // 'this' refers to the invoice document being saved
  console.log("[HOOK START] Invoice pre-validate | isNew:", this.isNew, "| Has invoiceNumber:", !!this.invoiceNumber);

  // Only run for new documents that don't already have an invoiceNumber set
  if (this.isNew && !this.invoiceNumber) {
    console.log("[HOOK] Condition met. Generating invoice number...");
    try {
      console.log("[HOOK] Attempting Counter.findOneAndUpdate for _id: 'invoiceNumber'");
      
      // CHANGED: Using findOneAndUpdate instead of findByIdAndUpdate for clarity
      const counter = await Counter.findOneAndUpdate(
        { _id: 'invoiceNumber' },      // Find by this ID
        { $inc: { seq: 1 } },          // Atomically increment
        { 
          new: true,                   // Return updated document
          upsert: true                 // Create if not exists
        }
      );
      
      console.log("[HOOK] Counter result:", JSON.stringify(counter));

      // Check if counter document exists after update/upsert
      if (!counter || typeof counter.seq === 'undefined') {
        console.error("[HOOK ERROR] Failed to find or increment counter document");
        return next(new Error('Could not generate invoice number: Counter failed'));
      }

      // Format and assign the invoice number
      this.invoiceNumber = `INV-${String(counter.seq).padStart(5, '0')}`;
      console.log(`[HOOK SUCCESS] Generated invoice number: ${this.invoiceNumber}`);
      next(); // Proceed with validation
    } catch (error) {
      console.error("[HOOK ERROR] Error during counter operation:", error);
      next(error);
    }
  } else {
    console.log("[HOOK] Skipping number generation (not new or already has number)");
    next();
  }
});

// Additional verification before actual save
InvoiceSchema.pre('save', function(next) {
  console.log(`[HOOK] Pre-save called. Invoice number: ${this.invoiceNumber}`);
  if (!this.invoiceNumber) {
    console.error("[HOOK ERROR] Invoice number still missing at save time");
    return next(new Error('Invoice number required but not generated'));
  }
  next();
});

// Compile the schema into a model and export it
module.exports = mongoose.model('Invoice', InvoiceSchema);