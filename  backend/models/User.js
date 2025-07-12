// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['staff', 'admin'],
    default: 'staff',
  },
  // --- Added Fields ---
  phoneNumber: {
    type: String,
    trim: true,
    // Add validation if required, e.g., regex match
  },
  isActive: { // To disable user access without deleting
    type: Boolean,
    default: true
  },
  // employeeId: { // Optional: if you need a separate employee identifier
  //   type: String,
  //   unique: true,
  //   sparse: true // Allows nulls while maintaining uniqueness for set values
  // },
  // --- End Added Fields ---
}, {
  timestamps: true,
});

// Ensure you have password hashing logic BEFORE saving (usually in authRoutes.js)

module.exports = mongoose.model('User', userSchema);