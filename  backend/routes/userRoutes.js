const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Needed for hashing/updating password
const User = require('../models/User'); // Adjust path if necessary
const { protect, admin } = require('../middleware/authMiddleware'); // Adjust path if necessary

// --- GET ALL USERS (Admin only) ---
// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- GET USER PROFILE (Logged-in User) ---
// @route   GET /api/users/profile
// @desc    Get user profile of the currently logged-in user
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user is attached by the 'protect' middleware
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      // This case should be rare if protect middleware works correctly
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// --- ADD A NEW USER (Admin only) ---
// @route   POST /api/users
// @desc    Add a new user (by Admin) - Corrected for frontend form
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    // Destructure expected fields from req.body (name is combined on frontend)
    const { name, email, password, role /*, phoneNumber */ } = req.body; // Add phoneNumber if used in model/frontend

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    // Optional: Add password length validation
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user - include all relevant fields
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'staff', // Default role if not provided
            // phoneNumber // Include if added to model and req.body
        });

        if (user) {
            console.log(`User created successfully by admin: ${user.email}`);
            // Return created user data (excluding password)
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                // phoneNumber: user.phoneNumber // Include if relevant
            });
        } else {
            console.error('Admin user creation failed without throwing error for email:', email);
            res.status(400).json({ message: 'Failed to create user due to invalid data' });
        }
    } catch (error) {
        console.error('Error creating user by admin:', error);
        // Provide more specific error if possible (e.g., validation errors)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error during user creation' });
    }
});

// --- GET USER BY ID (Admin only) ---
// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin (Consider if non-admins need this)
router.get('/:id', protect, admin, async (req, res) => {
    try {
        // Validate ID format before hitting DB (optional but good practice)
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
             return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        // Catch CastError separately if not validating format above
        // if (error.name === 'CastError') {
        //    return res.status(400).json({ message: 'Invalid user ID format' });
        // }
        res.status(500).json({ message: 'Server error' });
    }
});

// --- UPDATE USER BY ID (Admin only) ---
// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Private/Admin (Consider if non-admins need this)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
             return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields selectively from req.body
        user.name = req.body.name || user.name;
        const originalEmail = user.email; // Store original email for comparison
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        // Add phoneNumber update if applicable
        // user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

        // Handle password update separately only if provided in the request body
        if (req.body.password && req.body.password.length > 0) {
             if (req.body.password.length < 6) {
                 return res.status(400).json({ message: 'New password must be at least 6 characters long' });
             }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
            console.log(`Password updated for user: ${user.email}`);
        }

        // Check for duplicate email ONLY if the email is being changed
        if (user.email !== originalEmail) {
          console.log(`Email change detected for user ${user._id}: ${originalEmail} -> ${user.email}`);
          const emailExists = await User.findOne({ email: user.email });
          // If email exists AND it belongs to a different user
          if (emailExists && emailExists._id.toString() !== user._id.toString()) {
            console.log(`Conflict: Email ${user.email} already in use by user ${emailExists._id}`);
            return res.status(400).json({ message: 'Email already in use by another user' });
          }
        }

        const updatedUser = await user.save();

        // Send back updated user data (without password)
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            // phoneNumber: updatedUser.phoneNumber // Include if relevant
        });

    } catch (error) {
        console.error(`Error updating user ${req.params.id}:`, error);
         // Provide more specific error if possible (e.g., validation errors)
         if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
         }
        // Catch CastError separately if not validating format above
        // if (error.name === 'CastError') {
        //    return res.status(400).json({ message: 'Invalid user ID format' });
        // }
        res.status(500).json({ message: 'Server error during user update' });
    }
});

// --- DELETE USER BY ID (Admin only) ---
// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent admin from deleting themselves? (Optional check)
      // if (user._id.toString() === req.user._id.toString()) {
      //   return res.status(400).json({ message: 'Admin cannot delete themselves.' });
      // }
      await User.deleteOne({ _id: req.params.id }); // Use deleteOne for potentially better performance
      // await user.remove(); // remove() is deprecated on models sometimes
      console.log(`User deleted: ${user.email}`);
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    // Catch CastError separately if not validating format above
    // if (error.name === 'CastError') {
    //    return res.status(400).json({ message: 'Invalid user ID format' });
    // }
    res.status(500).json({ message: 'Server error' });
  }
});


// --- Make sure Mongoose is imported for ID validation ---
// Add this near the top if not already there
const mongoose = require('mongoose');

module.exports = router;