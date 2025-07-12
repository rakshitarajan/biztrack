const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if necessary

// Middleware for logging requests to this specific router
router.use((req, res, next) => {
  console.log(`✅ Request Hit authRoutes.js: ${req.method} ${req.url}`);
  next();
});

// --- Helper Function to Generate JWT ---
const generateToken = (id) => {
  // Check if JWT_SECRET is loaded
  if (!process.env.JWT_SECRET) {
      console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
      // Optionally, throw an error or exit in a real application,
      // but for now, log clearly and return null or throw locally.
      // process.exit(1); // Uncomment this line for stricter behavior
      throw new Error('JWT secret key is missing.'); // Throw error to be caught
  }
  console.log(`🔑 Generating JWT for User ID: ${id}`);
  try {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: '30d', // Token expires in 30 days
      });
  } catch (error) {
      console.error("Error generating JWT:", error);
      throw error; // Re-throw to be caught by route handler
  }
};


// --- User Registration ---
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  console.log('📩 Received POST /register request');
  console.log('🔍 Request Body:', req.body);

  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    console.log('❌ Missing Fields:', req.body);
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }
   // Optional: Password strength validation
   if (password.length < 6) {
       return res.status(400).json({ message: 'Password must be at least 6 characters long' });
   }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    console.log(`👤 User Exists Check for ${email}:`, userExists ? 'Yes' : 'No');

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password Hashed.');

    // Create user
    console.log('➕ Creating new user...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'staff', // Default role to 'staff' if not provided or invalid
    });

    if (user) {
      console.log(`✅ User Registered Successfully: ${user.email}`);
      // Generate token upon successful registration
      const token = generateToken(user._id);

      // Send back user info (excluding password) and token
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token // Include token for immediate login after registration
      });
    } else {
        // Should not happen if User.create doesn't throw, but good practice
        console.error('User creation failed without throwing an error for email:', email);
        res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('❌ Error in /register:', error);
     // Provide more specific error if possible (e.g., validation errors)
     if (error.name === 'ValidationError') {
         const messages = Object.values(error.errors).map(val => val.message);
         return res.status(400).json({ message: messages.join('. ') });
     }
     // Handle JWT generation error specifically
     if (error.message === 'JWT secret key is missing.') {
         return res.status(500).json({ message: 'Server configuration error [JWT].'});
     }
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// --- User Login ---
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('📩 Received POST /login request');
    console.log('🔍 Request Body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user email AND explicitly select the password field
    // ****** THE FIX IS HERE: .select('+password') ******
    const user = await User.findOne({ email }).select('+password');

    // Log if user was found, but avoid logging the password itself
    console.log('🔎 User Found:', user ? `User with email ${email} found.` : `User with email ${email} NOT found.`);

    // Check if user exists AND password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      // Passwords match - User is authenticated
      console.log(`✅ Login Successful for: ${user.email}`);

      // Generate token
      const token = generateToken(user._id);

      // Send back user info (excluding password implicitly unless selected) and token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token // Send token back to client
      });

    } else {
      // User not found or password doesn't match
      console.log(`❌ Invalid Login Attempt for: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    // Log the actual error for debugging
    console.error(`❌ Error in /login:`, error);
     // Handle JWT generation error specifically
     if (error.message === 'JWT secret key is missing.') {
         return res.status(500).json({ message: 'Server configuration error [JWT].'});
     }
    res.status(500).json({ message: 'Server error during login' });
  }
});


// --- Test Route ---
// @route   GET /api/auth/test
// @desc    Test if auth routes are working
// @access  Public
router.get('/test', (req, res) => {
  console.log('🧪 Test Route Hit in authRoutes.js');
  res.json({ message: 'Auth Route is working!' });
});

console.log('🚦 Auth Routes Registered'); // Log when the router module is loaded

module.exports = router;