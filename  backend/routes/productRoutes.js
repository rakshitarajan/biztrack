// // routes/productRoutes.js
// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Product = require('../models/Product');
// const Category = require('../models/Category'); // Import Category model
// const { protect, admin } = require('../middleware/authMiddleware');

// // --- Optional: Request Logging Middleware for this Router ---
// router.use((req, res, next) => {
//     console.log(`📦 Request Hit productRoutes.js: ${req.method} ${req.url}`);
//     next();
// });

// // --- GET ALL PRODUCTS ---
// // @route   GET /api/products
// // @desc    Get all products (optionally filtered/paginated)
// // @access  Private
// router.get('/', protect, async (req, res) => {
//   try {
//     // Basic find - Consider adding filtering (by category, name) & pagination for large datasets
//     const products = await Product.find({})
//                                   .populate('category', 'name') // Populate category name
//                                   .sort({ name: 1 }); // Sort by name
//     res.json(products);
//   } catch (error) {
//     console.error('Error fetching all products:', error);
//     res.status(500).json({ message: 'Server error fetching products.' });
//   }
// });

// // --- CREATE A NEW PRODUCT ---
// // @route   POST /api/products
// // @desc    Create a new product
// // @access  Private/Admin
// router.post('/', protect, admin, async (req, res) => {
//   try {
//     const {
//       sku, name, description, categoryId, manufactureDate, expiryDate,
//       costPrice, sellingPrice, discountPercentage, mrp, currentStock, lowStockThreshold
//     } = req.body;

//     // --- Validation ---
//     if (!sku || !name || !categoryId || sellingPrice === undefined || currentStock === undefined) {
//       return res.status(400).json({ message: 'SKU, Name, Category, Selling Price, and Current Stock are required fields.' });
//     }
//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//         return res.status(400).json({ message: 'Invalid Category ID format.' });
//     }
//     const categoryExists = await Category.findById(categoryId);
//     if (!categoryExists) {
//         return res.status(400).json({ message: `Category with ID ${categoryId} not found.` });
//     }
//     const skuExists = await Product.findOne({ sku: sku });
//     if (skuExists) {
//       return res.status(400).json({ message: `Product with SKU "${sku}" already exists.` });
//     }
//     // --- End Validation ---

//     console.log(`Creating new product: "${name}" (SKU: ${sku})`);
//     const product = new Product({
//       sku, name, description,
//       category: categoryId,
//       manufactureDate, expiryDate, costPrice, sellingPrice,
//       discountPercentage, mrp, currentStock, lowStockThreshold
//     });

//     const createdProduct = await product.save();

//     // Create an 'Initial Stock' StockAdjustment record if stock > 0
//     if (createdProduct.currentStock > 0) {
//         const StockAdjustment = require('../models/StockAdjustment'); // Local require
//         try {
//              const initialAdjustment = new StockAdjustment({
//                 product: createdProduct._id,
//                 user: req.user._id,
//                 quantityChange: createdProduct.currentStock,
//                 reason: 'Initial Stock',
//                 notes: 'Product creation'
//             });
//             await initialAdjustment.save();
//             console.log(`Initial stock adjustment record created for Product ${createdProduct._id}`);
//         } catch (adjError) {
//             console.error(`Failed to create initial stock adjustment for ${createdProduct._id}:`, adjError);
//             // Decide if this failure should prevent product creation response - maybe not? Log it.
//         }
//     }

//     // Populate category for the response
//     const productToSend = await Product.findById(createdProduct._id).populate('category', 'name');

//     console.log(`Product created successfully: ${productToSend.name} (${productToSend._id})`);
//     res.status(201).json(productToSend);

//   } catch (error) {
//       console.error('Error creating product:', error);
//       if (error.name === 'ValidationError') {
//           const messages = Object.values(error.errors).map(val => val.message);
//           return res.status(400).json({ message: messages.join('. ') });
//       }
//       if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
//            return res.status(400).json({ message: `Product with SKU "${req.body.sku}" already exists (DB constraint).` });
//       }
//       res.status(500).json({ message: 'Server error while creating product.' });
//   }
// });

// // --- GET UNIQUE CATEGORIES (DEPRECATED - Use GET /api/categories instead) ---
// // Kept for reference or if frontend still calls this specific path
// router.get('/utils/categories', protect, async (req, res) => {
//   console.warn('Request received for DEPRECATED GET /api/products/utils/categories. Use GET /api/categories.');
//   try {
//     const categories = await Category.find({}, 'name').sort({ name: 1 });
//     res.json(categories.map(cat => cat.name));
//   } catch (error) {
//     console.error('Error fetching categories via /utils/categories:', error);
//     res.status(500).json({ message: 'Server error fetching categories.' });
//   }
// });

// // --- GET LOW STOCK PRODUCTS ---
// // @route   GET /api/products/lowstock
// // @desc    Get products at or below low stock threshold
// // @access  Private
// router.get('/lowstock', protect, async (req, res) => {
//   try {
//     const products = await Product.find({
//       $expr: { $lte: ["$currentStock", "$lowStockThreshold"] }
//     }).populate('category', 'name').sort({ name: 1 });
//     res.json(products);
//   } catch (error) {
//     console.error('Error fetching low stock products:', error);
//     res.status(500).json({ message: 'Server error fetching low stock products.' });
//   }
// });

// // --- GET SINGLE PRODUCT BY ID ---
// // @route   GET /api/products/:id
// // @desc    Get a product by its MongoDB ObjectId
// // @access  Private
// router.get('/:id', protect, async (req, res) => {
//   const productId = req.params.id;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: 'Invalid product ID format' });
//     }
//     const product = await Product.findById(productId).populate('category', 'name');
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     res.json(product);
//   } catch (error) {
//     console.error(`Error fetching product ${productId}:`, error);
//     res.status(500).json({ message: 'Server error fetching product.' });
//   }
// });

// // --- UPDATE PRODUCT BY ID ---
// // @route   PUT /api/products/:id
// // @desc    Update a product's details (excluding direct stock update)
// // @access  Private/Admin
// router.put('/:id', protect, admin, async (req, res) => {
//   const productId = req.params.id;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: 'Invalid product ID format' });
//     }
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     const {
//       sku, name, description, categoryId, manufactureDate, expiryDate,
//       costPrice, sellingPrice, discountPercentage, mrp,
//       currentStock, // We will ignore this field if present
//       lowStockThreshold
//     } = req.body;

//     // --- Selective Update ---
//     let updated = false; // Track if any changes were made

//     if (sku && sku !== product.sku) {
//        const skuExists = await Product.findOne({ sku: sku, _id: { $ne: productId } });
//        if (skuExists) return res.status(400).json({ message: `SKU "${sku}" already exists.` });
//        product.sku = sku; updated = true;
//     }
//     if (name && name !== product.name) { product.name = name; updated = true; }
//     if (description !== undefined && description !== product.description) { product.description = description; updated = true; }
//     if (categoryId && categoryId !== product.category.toString()) {
//         if (!mongoose.Types.ObjectId.isValid(categoryId)) return res.status(400).json({ message: 'Invalid Category ID format.' });
//         const categoryExists = await Category.findById(categoryId);
//         if (!categoryExists) return res.status(400).json({ message: `Category ${categoryId} not found.` });
//         product.category = categoryId; updated = true;
//     }
//     // Comparing dates needs care
//     if (manufactureDate && new Date(manufactureDate).toISOString() !== product.manufactureDate?.toISOString()) { product.manufactureDate = manufactureDate; updated = true;}
//     if (expiryDate && new Date(expiryDate).toISOString() !== product.expiryDate?.toISOString()) { product.expiryDate = expiryDate; updated = true;}

//     if (costPrice !== undefined && costPrice !== product.costPrice) { product.costPrice = costPrice; updated = true; }
//     if (sellingPrice !== undefined && sellingPrice !== product.sellingPrice) { product.sellingPrice = sellingPrice; updated = true; }
//     if (discountPercentage !== undefined && discountPercentage !== product.discountPercentage) { product.discountPercentage = discountPercentage; updated = true; }
//     if (mrp !== undefined && mrp !== product.mrp) { product.mrp = mrp; updated = true; }
//     if (lowStockThreshold !== undefined && lowStockThreshold !== product.lowStockThreshold) { product.lowStockThreshold = lowStockThreshold; updated = true; }

//     // Warn if currentStock is present in request body but ignore it
//     if (currentStock !== undefined && currentStock !== product.currentStock) {
//         console.warn(`Attempted to update currentStock via PUT /api/products/${productId}. Ignored. Use Stock Adjustments.`);
//     }

//     if (!updated) {
//         // If no fields were actually changed, just return the existing product
//          const productToSend = await Product.findById(productId).populate('category', 'name');
//         return res.json(productToSend); // Or res.status(304).send(); // Not Modified
//     }

//     const updatedProductResult = await product.save(); // Run validators
//     const productToSend = await Product.findById(updatedProductResult._id).populate('category', 'name');

//     res.json(productToSend);

//   } catch (error) {
//       console.error(`Error updating product ${productId}:`, error);
//       if (error.name === 'ValidationError') {
//           const messages = Object.values(error.errors).map(val => val.message);
//           return res.status(400).json({ message: messages.join('. ') });
//       }
//       if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) {
//            return res.status(400).json({ message: `SKU "${req.body.sku}" already exists (DB constraint).` });
//       }
//       res.status(500).json({ message: 'Server error while updating product.' });
//   }
// });

// // --- DELETE PRODUCT BY ID ---
// // @route   DELETE /api/products/:id
// // @desc    Delete a product (Use with caution - consider soft delete/inactive status)
// // @access  Private/Admin
// router.delete('/:id', protect, admin, async (req, res) => {
//   const productId = req.params.id;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: 'Invalid product ID format' });
//     }
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // --- Optional Check: Prevent deletion if used in invoices ---
//     const Invoice = require('../models/Invoice'); // Local require
//     const invoiceCount = await Invoice.countDocuments({ 'items.product': productId });
//     if (invoiceCount > 0) {
//       // Instead of deleting, you might add an 'isActive: false' field to the Product model
//       // and update it here.
//       // await Product.findByIdAndUpdate(productId, { isActive: false });
//       // return res.status(400).json({ message: `Cannot delete product. It exists on ${invoiceCount} invoice(s). Consider marking it inactive.` });
//        return res.status(400).json({ message: `Cannot delete product. It exists on ${invoiceCount} invoice(s). Please remove associated invoice items first or implement an 'inactive' status.` });
//     }
//     // --- End Optional Check ---

//     // Proceed with deletion
//     await Product.deleteOne({ _id: productId });

//     // Optional: Clean up related StockAdjustments? Depends on audit trail requirements.
//     // const StockAdjustment = require('../models/StockAdjustment');
//     // await StockAdjustment.deleteMany({ product: productId });

//     res.json({ message: `Product '${product.name}' removed successfully.` });
//   } catch (error) {
//     console.error(`Error deleting product ${productId}:`, error);
//     res.status(500).json({ message: 'Server error while deleting product.' });
//   }
// });

// module.exports = router;

// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const StockAdjustment = require('../models/StockAdjustment'); // Import StockAdjustment model
const { protect, admin } = require('../middleware/authMiddleware');

// --- Optional: Request Logging Middleware for this Router ---
router.use((req, res, next) => {
  // console.log(`📦 Request Hit productRoutes.js: ${req.method} ${req.originalUrl}`); // Using originalUrl for full path
  next();
});

// --- GET ALL PRODUCTS ---
// @route   GET /api/products
// @desc    Get all products (optionally filtered/paginated)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('category', 'name')
      .sort({ name: 1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
});

// --- CREATE A NEW PRODUCT (Single Product) ---
// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      sku, name, description, categoryId, // Expecting categoryId here
      manufactureDate, expiryDate, costPrice, sellingPrice,
      discountPercentage, mrp, currentStock, lowStockThreshold
    } = req.body;

    // --- Validation ---
    if (!sku || !name || !categoryId || sellingPrice === undefined || currentStock === undefined) {
      return res.status(400).json({ message: 'SKU, Name, Category ID, Selling Price, and Current Stock are required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid Category ID format.' });
    }
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: `Category with ID ${categoryId} not found.` });
    }
    const skuExists = await Product.findOne({ sku: sku.trim() });
    if (skuExists) {
      return res.status(400).json({ message: `Product with SKU "${sku}" already exists.` });
    }
    // --- End Validation ---

    const product = new Product({
      sku: sku.trim(), name: name.trim(), description: description ? description.trim() : undefined,
      category: categoryId,
      manufactureDate: manufactureDate ? new Date(manufactureDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      costPrice: costPrice !== undefined && costPrice !== '' ? parseFloat(costPrice) : 0,
      sellingPrice: parseFloat(sellingPrice),
      discountPercentage: discountPercentage !== undefined && discountPercentage !== '' ? parseFloat(discountPercentage) : 0,
      mrp: mrp !== undefined && mrp !== '' ? parseFloat(mrp) : undefined,
      currentStock: 0, // Initialize stock to 0, will be set by StockAdjustment
      lowStockThreshold: lowStockThreshold !== undefined && lowStockThreshold !== '' ? parseInt(lowStockThreshold, 10) : 10
    });

    const createdProduct = await product.save();

    // Create an 'Initial Stock' StockAdjustment record if initial stock > 0
    // The hook on StockAdjustment model will update Product.currentStock
    if (parseInt(currentStock, 10) > 0 && req.user && req.user._id) {
      const initialAdjustment = new StockAdjustment({
        product: createdProduct._id,
        user: req.user._id, // User performing the action
        quantityChange: parseInt(currentStock, 10),
        reason: 'Initial Stock',
        notes: 'Product creation (single)'
      });
      await initialAdjustment.save(); // This will trigger the post-save hook
    }

    // Fetch the product again to get populated category and updated stock for the response
    const productToSend = await Product.findById(createdProduct._id).populate('category', 'name');

    res.status(201).json(productToSend);

  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(error.errors).map(val => val.message).join('. ') });
    }
    if (error.code === 11000 && error.keyPattern && error.keyPattern.sku) { // Duplicate SKU
      return res.status(400).json({ message: `Product with SKU "${req.body.sku}" already exists.` });
    }
    res.status(500).json({ message: 'Server error while creating product.' });
  }
});


// --- BULK UPLOAD PRODUCTS ---
// @route   POST /api/products/bulk-upload
// @desc    Upload and create multiple products at once
// @access  Private/Admin
router.post('/bulk-upload', protect, admin, async (req, res) => {
  const { products: productsToUpload } = req.body;
  const userId = req.user._id;

  if (!productsToUpload || !Array.isArray(productsToUpload) || productsToUpload.length === 0) {
    return res.status(400).json({ message: 'No products data provided or data is not an array.' });
  }

  const results = {
    successCount: 0,
    failureCount: 0,
    errors: [], // [{ sku, name, row (optional), reason }]
    successfulItems: [] // To send back successfully created product data
  };
  const categoryNameMap = {}; // To store 'categoryName' -> 'categoryId'

  // --- Step 1: Pre-process and map categories ---
  const uniqueCategoryNamesFromFile = [...new Set(
    productsToUpload
      .map(p => String(p.categoryName || '').trim())
      .filter(name => name) // Filter out empty or null category names
  )];

  try {
    for (const name of uniqueCategoryNamesFromFile) {
      // Case-insensitive find or create for categories
      let category = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (!category) {
        console.log(`Bulk Upload: Category "${name}" not found, creating new one.`);
        try {
          category = new Category({ name: name, description: 'Auto-created during bulk upload' });
          await category.save();
          console.log(`Bulk Upload: Category "${name}" created with ID ${category._id}`);
        } catch (catCreateError) {
          // Handle potential error if category creation fails (e.g., unique constraint if another process creates it)
          if (catCreateError.code === 11000) { // Duplicate key error
            category = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (!category) throw catCreateError; // Re-throw if still not found
          } else {
            throw catCreateError; // Re-throw other errors
          }
        }
      }
      categoryNameMap[name.toLowerCase()] = category._id;
    }
  } catch (catError) {
    console.error("Bulk Upload: Error processing categories -", catError);
    return res.status(500).json({ message: 'Error processing categories during bulk upload.', error: catError.message });
  }

  // --- Step 2: Process each product (Consider using transactions if MongoDB setup allows) ---
  // For simplicity in this example, we process one by one.
  // For true atomicity with many products, transactions are better.
  for (let i = 0; i < productsToUpload.length; i++) {
    const productData = productsToUpload[i];
    const rowIndex = i + 2; // For user-friendly error reporting from spreadsheet

    // --- Basic Validation & Data Preparation ---
    if (!productData.sku || !productData.name || !productData.categoryName || productData.sellingPrice === undefined || productData.currentStock === undefined) {
      results.failureCount++;
      results.errors.push({ sku: productData.sku || `ROW-${rowIndex}`, name: productData.name || 'N/A', row: rowIndex, reason: 'Missing required fields (SKU, Name, CategoryName, Selling Price, Current Stock).' });
      continue;
    }

    const trimmedSku = String(productData.sku).trim();
    const trimmedName = String(productData.name).trim();
    const trimmedCategoryName = String(productData.categoryName).trim().toLowerCase();

    const categoryId = categoryNameMap[trimmedCategoryName];
    if (!categoryId) {
      results.failureCount++;
      results.errors.push({ sku: trimmedSku, name: trimmedName, row: rowIndex, reason: `Category "${productData.categoryName}" not found or could not be processed.` });
      continue;
    }

    try {
      const skuExists = await Product.findOne({ sku: trimmedSku });
      if (skuExists) {
        results.failureCount++;
        results.errors.push({ sku: trimmedSku, name: trimmedName, row: rowIndex, reason: `SKU "${trimmedSku}" already exists.` });
        continue;
      }

      const newProduct = new Product({
        sku: trimmedSku,
        name: trimmedName,
        description: productData.description ? String(productData.description).trim() : undefined,
        category: categoryId,
        manufactureDate: productData.manufactureDate ? new Date(productData.manufactureDate) : undefined,
        expiryDate: productData.expiryDate ? new Date(productData.expiryDate) : undefined,
        costPrice: (productData.costPrice !== undefined && productData.costPrice !== '') ? parseFloat(productData.costPrice) : 0,
        sellingPrice: parseFloat(productData.sellingPrice),
        discountPercentage: (productData.discountPercentage !== undefined && productData.discountPercentage !== '') ? parseFloat(productData.discountPercentage) : 0,
        mrp: (productData.mrp !== undefined && productData.mrp !== '') ? parseFloat(productData.mrp) : undefined,
        currentStock: 0, // Initialize to 0, stock adjustment will set it
        lowStockThreshold: (productData.lowStockThreshold !== undefined && productData.lowStockThreshold !== '') ? parseInt(productData.lowStockThreshold, 10) : 10,
      });

      const savedProduct = await newProduct.save();

      const initialStockQuantity = parseInt(productData.currentStock, 10);
      if (initialStockQuantity > 0 && userId) {
        const initialAdjustment = new StockAdjustment({
          product: savedProduct._id,
          user: userId,
          quantityChange: initialStockQuantity,
          reason: 'Initial Stock - Bulk Upload',
          notes: `Bulk upload for SKU: ${savedProduct.sku}`
        });
        await initialAdjustment.save(); // This will trigger the post-save hook to update Product.currentStock
      }

      // Fetch again to populate for the response (optional but good for consistency)
      const populatedProduct = await Product.findById(savedProduct._id).populate('category', 'name');
      results.successCount++;
      results.successfulItems.push(populatedProduct);

    } catch (validationError) {
      results.failureCount++;
      const errorMessages = validationError.errors ? Object.values(validationError.errors).map(e => e.message).join(', ') : validationError.message;
      results.errors.push({ sku: trimmedSku, name: trimmedName, row: rowIndex, reason: `Validation Error: ${errorMessages}` });
      console.error(`Bulk Upload: Error saving product ${trimmedSku} -`, validationError.message);
    }
  }

  const finalMessage = `Bulk upload processing complete. ${results.successCount} products added successfully. ${results.failureCount} products failed.`;
  console.log(finalMessage, "Errors:", results.errors);
  // Send 207 Multi-Status if there are any failures, otherwise 201 for full success.
  res.status(results.failureCount > 0 && results.successCount > 0 ? 207 : (results.successCount > 0 ? 201 : 400)).json({
    message: finalMessage,
    ...results
  });
});


// --- GET SINGLE PRODUCT BY ID ---
router.get('/:id', protect, async (req, res) => { /* ... your existing code ... */ });

// --- UPDATE PRODUCT BY ID ---
router.put('/:id', protect, admin, async (req, res) => { /* ... your existing code ... */ });

// --- DELETE PRODUCT BY ID ---
router.delete('/:id', protect, admin, async (req, res) => { /* ... your existing code ... */ });


// --- GET UNIQUE CATEGORIES (DEPRECATED - Use GET /api/categories instead) ---
// Kept for reference or if frontend still calls this specific path
router.get('/utils/categories', protect, async (req, res) => { /* ... your existing code ... */ });

// --- GET LOW STOCK PRODUCTS ---
router.get('/lowstock', protect, async (req, res) => { /* ... your existing code ... */ });


module.exports = router;