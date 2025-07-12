// models/Counter.js (Backend)
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  // Use _id as the sequence name (e.g., 'invoiceNumber', 'productSku')
  _id: {
    type: String,
    required: true
  },
  // The current sequence value
  seq: {
    type: Number,
    default: 0
  }
});

// Compile and export the model
const Counter = mongoose.model('Counter', CounterSchema);

// Export the model
module.exports = Counter;