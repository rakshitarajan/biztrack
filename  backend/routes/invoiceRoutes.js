// routes/invoiceRoutes.js (Backend - Complete, Corrected Code)
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice'); // Adjust path if needed
const Product = require('../models/Product'); // Adjust path if needed
// Ensure Counter model is required for pre-save hook registration
require('../models/Counter');
const { protect, admin } = require('../middleware/authMiddleware'); // Adjust path, add admin if needed
const PDFDocument = require('pdfkit'); // Correct variable name

// --- Optional: Request Logging Middleware ---
router.use((req, res, next) => {
    console.log(`🧾 Request Hit invoiceRoutes.js: ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', req.body);
    }
    next();
});

// --- GET ALL INVOICES ---
// @route   GET /api/invoices
// @desc    Get all invoices
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate('items.product', 'name sku') // Populate basic product info if needed (can rely on denormalized data)
      .populate('createdBy', 'name email') // Get creator info
      .sort({ createdAt: -1 }); // Newest first
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
});

// --- CREATE A NEW INVOICE ---
// @route   POST /api/invoices
// @desc    Create a new invoice and update stock levels
// @access  Private
router.post('/', protect, async (req, res) => {
  const session = await mongoose.startSession();
  console.log("POST /api/invoices: Starting transaction.");
  session.startTransaction();

  try {
    const { customerName, customerPhone, items } = req.body;
    const createdByUserId = req.user._id;

    // --- Validation ---
    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      // No need to abort here, just return error before starting operations
      return res.status(400).json({ message: 'Customer name and at least one valid item are required.' });
    }

    let calculatedSubtotal = 0;
    const processedItems = [];
    const productStockUpdates = [];
    const productIds = items.map(item => {
        if (!item || !item.product) throw new Error('Invalid item structure in request.');
        return item.product;
    });

    // Fetch products within transaction for stock check & details
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    console.log(`POST /api/invoices: Processing ${items.length} items.`);
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product) || !item.quantity || item.quantity <= 0) {
        throw new Error(`Invalid item data: Product ID or quantity invalid - ${JSON.stringify(item)}`);
      }
      const product = productMap.get(item.product.toString());
      if (!product) throw new Error(`Product with ID ${item.product} not found.`);
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}.`);
      }

      const priceAtSale = product.sellingPrice;
      const discountPercentageAtSale = product.discountPercentage;
      const itemTotal = priceAtSale * item.quantity * (1 - discountPercentageAtSale / 100);
      calculatedSubtotal += itemTotal;

      // Store necessary data on the invoice item itself
      processedItems.push({
        product: product._id, // Reference ID
        quantity: item.quantity,
        priceAtSale: priceAtSale,
        discountPercentageAtSale: discountPercentageAtSale,
        productName: product.name, // Denormalized name
        productSku: product.sku    // Denormalized SKU
      });

      // Prepare stock update
      productStockUpdates.push({
         updateOne: { filter: { _id: product._id }, update: { $inc: { currentStock: -item.quantity } } }
      });
    }

    // Calculate Taxes
    const cgstRate = 2.5; const sgstRate = 2.5;
    const cgstAmount = calculatedSubtotal * (cgstRate / 100);
    const sgstAmount = calculatedSubtotal * (sgstRate / 100);
    const calculatedGrandTotal = calculatedSubtotal + cgstAmount + sgstAmount;

    // Create new Invoice instance (pre-save hook will generate invoiceNumber)
    const newInvoice = new Invoice({
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      items: processedItems,
      subtotal: calculatedSubtotal,
      cgstRate, sgstRate, cgstAmount, sgstAmount,
      grandTotal: calculatedGrandTotal,
      paymentStatus: 'Paid', // Default
      status: 'Active',      // Default
      createdBy: createdByUserId
    });
    console.log("POST /api/invoices: New instance created (pre-save).");

    // Save the invoice (triggers pre-save hook) within the session
    const savedInvoice = await newInvoice.save({ session });
    console.log(`POST /api/invoices: Document saved. ID: ${savedInvoice._id}, Number: ${savedInvoice.invoiceNumber}`);

    // Update Product Stock Levels
    if (productStockUpdates.length > 0) {
        console.log("POST /api/invoices: Applying stock updates...");
        await Product.bulkWrite(productStockUpdates, { session });
        // Optional: Add result checking
    }

    // Commit Transaction
    await session.commitTransaction();
    console.log(`POST /api/invoices: Transaction committed for Invoice ${savedInvoice.invoiceNumber}.`);

    // Populate necessary fields for the response
    const invoiceToSend = await Invoice.findById(savedInvoice._id)
                                     // No need to populate items.product if name/sku stored on item
                                     .populate('createdBy', 'name email');
    res.status(201).json(invoiceToSend);

  } catch (error) {
    console.error('Error during invoice creation transaction:', error);
    if (session.inTransaction()) await session.abortTransaction(); // Abort if error occurred
    // Error response logic...
    if (error.message.includes("Insufficient stock") || error.message.includes("not found")) res.status(400).json({ message: error.message });
    else if (error.name === 'ValidationError') { const messages = Object.values(error.errors).map(val => val.message); res.status(400).json({ message: `Validation Failed: ${messages.join('. ')}` }); }
    else res.status(500).json({ message: error.message || 'Server error creating invoice.' });
  } finally {
    await session.endSession(); // Always end the session
    console.log("POST /api/invoices: Session ended.");
  }
});


// --- GET SINGLE INVOICE BY ID ---
router.get('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid invoice ID format' });
        const invoice = await Invoice.findById(req.params.id)
            // No need to populate items.product if using denormalized fields
            .populate('createdBy', 'name email');
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        console.error(`Error fetching invoice ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error fetching invoice.' });
    }
});

// --- DOWNLOAD INVOICE AS PDF ---
router.get('/:id/pdf', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid invoice ID format' });
        }
        const invoice = await Invoice.findById(req.params.id)
            .populate('createdBy', 'name'); // Only need creator name

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // --- Create PDF ---
        const doc = new PDFDocument({ size: 'A4', margin: 50 }); // Use consistent margin
        const fileName = `Invoice_${invoice.invoiceNumber || invoice._id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        doc.pipe(res);

        // --- PDF Content Generation with Layout Fixes ---
        const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;
        const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

        // --- Header Section ---
        const pageMargin = 50;
        const contentWidth = doc.page.width - pageMargin * 2;
        const leftColX = pageMargin;
        const rightColX = pageMargin + contentWidth / 2 + 20;
        const colWidth = contentWidth / 2 - 20;

        doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' }).moveDown(1.5);

        const headerStartY = doc.y;
        doc.fontSize(9).font('Helvetica');
        doc.text('BizTrack Inc.\n123 Biz St, Biz City\nsupport@biztrack.co', leftColX, headerStartY, { width: colWidth, lineGap: 2 });
        const leftHeaderEndY = doc.y;

        doc.fontSize(9).font('Helvetica');
        doc.text(`Invoice #: ${invoice.invoiceNumber}\nDate: ${formatDate(invoice.createdAt)}\nTime: ${new Date(invoice.createdAt).toLocaleTimeString()}`, rightColX, headerStartY, { width: colWidth, align: 'left' });
        const rightHeaderEndY = doc.y;

        doc.y = Math.max(leftHeaderEndY, rightHeaderEndY) + 20; // Space below header

        // --- Customer Info ---
        doc.fontSize(11).font('Helvetica-Bold').text('Bill To:', leftColX, doc.y, { underline: true }).moveDown(0.3);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Customer: ${invoice.customerName}`, leftColX);
        if (invoice.customerPhone) doc.text(`Phone: ${invoice.customerPhone}`);
        doc.moveDown(1.5);

        // --- Items Table ---
        const tableTop = doc.y;
        const tableHeaders = ['Item (SKU)', 'Qty', 'Unit Price', 'Disc(%)', 'Line Total'];
        const colStartX = [pageMargin, 300, 360, 430, 490]; // X positions
        const colWidths = [colStartX[1]-colStartX[0]-10, 30, 60, 50, 60]; // Approx widths
        const align = ['left', 'right', 'right', 'right', 'right'];

        // Draw Header
        doc.font('Helvetica-Bold').fontSize(9);
        tableHeaders.forEach((header, i) => { doc.text(header, colStartX[i], tableTop, { width: colWidths[i], align: align[i] }); });
        doc.font('Helvetica').fontSize(10);
        doc.moveTo(pageMargin, tableTop + 15).lineTo(doc.page.width - pageMargin, tableTop + 15).lineWidth(0.5).stroke();
        doc.y = tableTop + 20;

        // Draw Rows
        invoice.items.forEach(item => {
            const itemY = doc.y;
            const lineTotal = item.priceAtSale * item.quantity * (1 - item.discountPercentageAtSale / 100);
            const itemData = [
                `${item.productName || 'N/A'} (${item.productSku || 'N/A'})`, // Use stored name/sku
                item.quantity.toString(),
                formatCurrency(item.priceAtSale),
                item.discountPercentageAtSale.toFixed(1) + '%',
                formatCurrency(lineTotal)
            ];
            itemData.forEach((text, i) => { doc.text(text, colStartX[i], itemY, { width: colWidths[i], align: align[i] }); });
            doc.moveDown(0.8);
        });

        // --- Totals Section ---
        const totalsStartY = doc.y + 10;
        const totalsLabelX = colStartX[3]; // Align label start
        const totalsValueX = colStartX[4]; // Align value start
        const valueWidth = colWidths[4];   // Width for value column
        const labelWidth = colWidths[3];   // Width for label column

        doc.moveTo(totalsLabelX - 10, totalsStartY).lineTo(doc.page.width - pageMargin, totalsStartY).lineWidth(0.5).stroke();
        doc.y = totalsStartY + 5;
        doc.fontSize(10);

        const addTotalLine = (label, valueStr) => {
            const currentY = doc.y;
            // Print label aligned right within its column space
            doc.font('Helvetica').text(label, totalsLabelX - 10, currentY, { width: labelWidth + 10, align: 'right'});
            // Print value aligned right within its column space (bold)
            doc.font('Helvetica-Bold').text(valueStr, totalsValueX, currentY, { width: valueWidth, align: 'right'});
            doc.font('Helvetica').moveDown(0.6);
        };

        addTotalLine('Subtotal:', formatCurrency(invoice.subtotal));
        addTotalLine(`CGST (${invoice.cgstRate?.toFixed(1) || 0}%):`, formatCurrency(invoice.cgstAmount));
        addTotalLine(`SGST (${invoice.sgstRate?.toFixed(1) || 0}%):`, formatCurrency(invoice.sgstAmount));
        doc.moveDown(0.2);
        addTotalLine('Grand Total:', formatCurrency(invoice.grandTotal));

        // --- Footer ---
        const bottomY = doc.page.height - pageMargin - 20;
        doc.fontSize(8).fillColor('grey');
        doc.text(`Generated By: ${invoice.createdBy?.name || 'System'}`, pageMargin, bottomY, { align: 'left'});
        doc.text('Thank you for your business!', 0, bottomY + 10, { align: 'center', width: doc.page.width });
        doc.fillColor('black'); // Reset color

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error(`Error generating PDF for invoice ${req.params.id}:`, error);
        if (!res.headersSent) { res.status(500).json({ message: 'Server error generating PDF.' }); }
        else { res.end(); }
    }
});

// --- DELETE INVOICE BY ID --- (Simple Version)
router.delete('/:id', protect, /* admin, */ async (req, res) => {
    // ... (DELETE /:id logic remains the same) ...
     try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid invoice ID format' });
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        const deleteResult = await Invoice.deleteOne({ _id: req.params.id });
        if (deleteResult.deletedCount === 0) return res.status(404).json({ message: 'Invoice could not be deleted.' });
        res.json({ message: `Invoice ${invoice.invoiceNumber || invoice._id} deleted successfully.` });
    } catch (error) {
        console.error(`Error deleting invoice ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error while deleting invoice.' });
    }
});


module.exports = router; // Ensure router is exported