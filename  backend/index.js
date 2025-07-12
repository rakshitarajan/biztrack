/*const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());


console.log(require('./routes/productRoutes')); 

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Set up server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/




/*const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Debugging: Ensure environment variables are loaded
console.log('🔄 Loaded ENV Variables:', process.env.MONGO_URI, process.env.JWT_SECRET);

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('⏳ Attempting MongoDB Connection...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error);
    process.exit(1);
  }
};

connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debugging: Log incoming requests to check if requests reach Express
app.use((req, res, next) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.post('/test-register', (req, res) => {
    console.log('🚀 Test Register Route Hit in index.js');
    res.json({ message: '✅ Index.js route executed successfully!' });
  });
  

// Debugging: Verify Routes Registration
console.log('🔄 Importing Routes...');
console.log('Auth Routes:', require('./routes/authRoutes'));
console.log('User Routes:', require('./routes/userRoutes'));
console.log('Product Routes:', require('./routes/productRoutes'));
console.log('Invoice Routes:', require('./routes/invoiceRoutes'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

console.log('✅ Routes Registered');

// Test route directly in index.js to ensure server works
app.get('/test', (req, res) => {
  console.log('🚀 Test Route Hit in index.js');
  res.json({ message: 'Index.js test route is working!' });
});

// Debugging: Check if Server Starts Properly
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});*/

// index.js
/*const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables FROM .env file
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    // Debugging: Check if MONGO_URI is loaded
    console.log('Attempting MongoDB Connection...');
    if (!process.env.MONGO_URI) {
      throw new Error('FATAL ERROR: MONGO_URI environment variable is not defined.');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure
  }
};
connectDB(); // Connect to the database when the app starts

// --- Requires for Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Added
const stockAdjustmentRoutes = require('./routes/stockAdjustmentRoutes'); // Added
const analyticsRoutes = require('./routes/analyticsRoutes'); // Added/Updated

// Initialize Express App
const app = express();

// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for all origins
app.use(express.json()); // Body parser for JSON format
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data (optional but good practice)

// --- Simple Request Logger Middleware (Optional) ---
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---
console.log('⚙️ Registering API Routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/categories', categoryRoutes); // Added
app.use('/api/stock-adjustments', stockAdjustmentRoutes); // Added
app.use('/api/analytics', analyticsRoutes); // Added/Updated
console.log('✅ API Routes Registered');
// --- End API Routes ---

// --- Serve Static Assets in Production ---
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Running in production mode. Serving static files...');
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Serve frontend index.html file on all non-API routes
  app.get('*', (req, res) => {
    // Ensure API requests don't get overwritten by this catch-all
    if (!req.originalUrl.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    } else {
      // Explicitly handle API routes not found if they reach here
      // (Though typically they should be handled by Express routing before this)
      res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
    }
  });
} else {
  // Simple root route for development mode check
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
   console.log('🛠️ Running in development mode.');
}
// --- End Static Assets ---

// --- Global Error Handler (Optional but Recommended) ---
// This catches errors passed via next(error)
app.use((err, req, res, next) => {
  console.error("💥 Global Error Handler:", err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Optionally include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});


// --- Server Setup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);*/

// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const initializeCounters = require('./utils/initializeCounters'); // Import the counter initializer

// Load environment variables FROM .env file
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    // Debugging: Check if MONGO_URI is loaded
    console.log('Attempting MongoDB Connection...');
    if (!process.env.MONGO_URI) {
      throw new Error('FATAL ERROR: MONGO_URI environment variable is not defined.');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize counters after connection
    await initializeCounters();
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure
  }
};
connectDB(); // Connect to the database when the app starts

// --- Requires for Routes ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Added
const stockAdjustmentRoutes = require('./routes/stockAdjustmentRoutes'); // Added
const analyticsRoutes = require('./routes/analyticsRoutes'); // Added/Updated

// Initialize Express App
const app = express();

// --- Core Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for all origins
app.use(express.json()); // Body parser for JSON format
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data (optional but good practice)

// --- Simple Request Logger Middleware (Optional) ---
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---
console.log('⚙️ Registering API Routes...');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/categories', categoryRoutes); // Added
app.use('/api/stock-adjustments', stockAdjustmentRoutes); // Added
app.use('/api/analytics', analyticsRoutes); // Added/Updated
console.log('✅ API Routes Registered');
// --- End API Routes ---

// --- Serve Static Assets in Production ---
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Running in production mode. Serving static files...');
  // Set static folder
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Serve frontend index.html file on all non-API routes
  app.get('*', (req, res) => {
    // Ensure API requests don't get overwritten by this catch-all
    if (!req.originalUrl.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    } else {
      // Explicitly handle API routes not found if they reach here
      // (Though typically they should be handled by Express routing before this)
      res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
    }
  });
} else {
  // Simple root route for development mode check
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
  console.log('🛠️ Running in development mode.');
}
// --- End Static Assets ---

// --- Global Error Handler (Optional but Recommended) ---
// This catches errors passed via next(error)
app.use((err, req, res, next) => {
  console.error("💥 Global Error Handler:", err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    // Optionally include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --- Server Setup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);