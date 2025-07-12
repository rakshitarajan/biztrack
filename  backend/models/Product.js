// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sku: { // Added: Stock Keeping Unit / Product ID
    type: String,
    required: [true, 'Please add a Product ID/SKU'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    index: true // Often searched by name
  },
  description: { // Added
    type: String,
    trim: true
  },
  category: { // Changed to reference Category model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please assign a category']
  },
  manufactureDate: { // Renamed from mfd
    type: Date
  },
  expiryDate: {
    type: Date
  },
  costPrice: { // Renamed from cost_price (camelCase convention)
    type: Number,
    default: 0
  },
  sellingPrice: { // Renamed from selling_price
    type: Number,
    required: [true, 'Please add a selling price']
  },
  discountPercentage: { // Renamed from discount, clarified units
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  mrp: { // Max Retail Price
    type: Number
  },
  currentStock: { // Renamed from stock
    type: Number,
    required: [true, 'Please enter current stock quantity'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);