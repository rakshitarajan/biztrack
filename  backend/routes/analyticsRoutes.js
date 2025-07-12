// routes/analyticsRoutes.js (Backend)
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware'); // Adjust path if needed
const Invoice = require('../models/Invoice'); // Adjust path if needed
const Product = require('../models/Product'); // Adjust path if needed
// Remove 'regression' if not used: const regression = require('regression');

// --- Helper: Get Start of Day ---
const getStartOfDay = (date) => {
    if (!date || isNaN(new Date(date))) return null; // Handle invalid date input
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// --- Helper: Get Start of Month ---
const getStartOfMonth = (date) => {
     if (!date || isNaN(new Date(date))) return null;
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

// --- GET DASHBOARD SUMMARY ---
// @route   GET /api/analytics/dashboard-summary
// @desc    Get summary data for dashboard cards, lists, and mini sales trend
// @access  Private
router.get('/dashboard-summary', protect, async (req, res) => {
    console.log("GET /api/analytics/dashboard-summary: Request received.");
    try {
        const today = new Date();
        const startOfToday = getStartOfDay(today);
        const startOfMonth = getStartOfMonth(today);
        const ninetyDaysAgo = new Date(new Date().setDate(today.getDate() - 90));
        const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7 + 1)); // Start of 7 days ago

        // Use Promise.all for concurrent queries
        const [
            totalProductCount,
            outOfStockCount,
            lowStockProducts,
            revenueTodayData,
            revenueThisMonthData,
            totalRevenueData,
            topSellingProductsData,
            lowestSellingProductsData,
            recentInvoicesData,
            last7DaysSalesData
        ] = await Promise.all([
            Product.countDocuments(),
            Product.countDocuments({ currentStock: { $lte: 0 } }),
            Product.find({
                $expr: { $lte: ["$currentStock", "$lowStockThreshold"] },
                currentStock: { $gt: 0 }
            }).limit(10).select('name currentStock lowStockThreshold sku _id'),
            Invoice.aggregate([
                { $match: { createdAt: { $gte: startOfToday }, status: 'Active' } }, // Match active invoices today
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, status: 'Active' } }, // Match active invoices this month
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([
                { $match: { status: 'Active' } }, // Match all active invoices
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Invoice.aggregate([ // Top Selling Products
                 { $match: { createdAt: { $gte: ninetyDaysAgo }, status: 'Active' } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: -1 } }, { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails', pipeline: [ { $project: { name: 1 } } ] } },
                 { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }, // Handle if product deleted
                 { $project: { _id: 1, name: '$productDetails.name', quantity: '$totalQuantity' } }
            ]),
            Invoice.aggregate([ // Lowest Selling Products
                 { $match: { createdAt: { $gte: ninetyDaysAgo }, status: 'Active' } },
                 { $unwind: '$items' },
                 { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
                 { $sort: { totalQuantity: 1 } }, { $limit: 5 },
                 { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails', pipeline: [ { $project: { name: 1 } } ] } },
                 { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
                 { $project: { _id: 1, name: '$productDetails.name', quantity: '$totalQuantity' } }
            ]),
            Invoice.find({ status: 'Active' })
                    .sort({createdAt: -1})
                    .limit(5)
                    .select('invoiceNumber customerName createdAt grandTotal _id'),
            // Query for Last 7 Days Sales
            Invoice.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo }, status: 'Active' } },
                {
                    $group: {
                         // Group by date part only
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, // Use UTC or server timezone
                        totalSales: { $sum: '$grandTotal' }
                    }
                },
                { $sort: { "_id": 1 } }, // Sort chronologically
                { $project: { _id: 0, label: '$_id', sales: '$totalSales' } }
            ])
        ]);

        // Process fetched data
        const revenueToday = revenueTodayData.length > 0 ? revenueTodayData[0].total : 0;
        const revenueThisMonth = revenueThisMonthData.length > 0 ? revenueThisMonthData[0].total : 0;
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

        // Generate Alerts
        const alerts = [];
        lowStockProducts.forEach(p => {
            alerts.push({ type: 'LowStock', message: `Low stock: ${p.name} (SKU: ${p.sku}) - ${p.currentStock} left (Threshold: ${p.lowStockThreshold})`, productId: p._id });
        });
        if (outOfStockCount > 0) {
            const outOfStockProds = await Product.find({ currentStock: { $lte: 0 } }).limit(3).select('name sku _id');
            outOfStockProds.forEach(p => { alerts.push({ type: 'OutOfStock', message: `${p.name} (SKU: ${p.sku}) is OUT OF STOCK!`, productId: p._id }); });
        }
        // Add other alert types (e.g., overdue invoices) here if needed

        console.log("Dashboard Summary - Prepared Data including last 7 days sales.");

        // Send response
        res.json({
            productCount: totalProductCount,
            outOfStockCount: outOfStockCount,
            lowStockCount: lowStockProducts.length,
            revenueToday: revenueToday.toFixed(2),
            revenueThisMonth: revenueThisMonth.toFixed(2),
            totalRevenue: totalRevenue.toFixed(2),
            topSellingProducts: topSellingProductsData,
            lowestSellingProducts: lowestSellingProductsData,
            recentInvoices: recentInvoicesData,
            alerts: alerts,
            last7DaysSales: last7DaysSalesData // Include sales data for dashboard mini-chart
        });

    } catch (error) {
        console.error('Error fetching dashboard summary data:', error);
        res.status(500).json({ message: 'Server error fetching dashboard summary' });
    }
});


// --- GET DETAILED ANALYTICS PAGE DATA (MODIFIED FOR DATE RANGE) ---
// @route   GET /api/analytics/details
// @desc    Get data for the dedicated Analytics page, accepts date range query params for sales trend
// @access  Private
// @query   startDate (Optional ISO Date String, e.g., 2024-01-01)
// @query   endDate (Optional ISO Date String, e.g., 2024-05-31)
router.get('/details', protect, /* admin, */ async (req, res) => {
    console.log("GET /api/analytics/details: Request received. Query:", req.query);
    try {
        const today = new Date();
        const { startDate, endDate } = req.query; // Get date range from query parameters

        // --- Build Date Filter for Sales Trend ---
        let salesTrendDateFilter = { status: 'Active' }; // Always filter by active status

        const start = startDate ? getStartOfDay(startDate) : null; // Use helper to get start of day
        // For end date, get the very END of that day for inclusive filtering
        let end = endDate ? new Date(endDate) : null;
        if (end && !isNaN(end)) {
             end.setHours(23, 59, 59, 999); // Set to end of the provided day
        }

        if (start && !isNaN(start) && end && !isNaN(end)) {
            salesTrendDateFilter.createdAt = { $gte: start, $lte: end };
        } else if (start && !isNaN(start)) {
            salesTrendDateFilter.createdAt = { $gte: start };
        } else if (end && !isNaN(end)) {
             salesTrendDateFilter.createdAt = { $lte: end };
        } else {
            // Default if no valid range: Last 12 Months
            const twelveMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 12));
            salesTrendDateFilter.createdAt = { $gte: twelveMonthsAgo };
            console.log("Using default 12-month range for sales trend.");
        }
        console.log("Sales Trend Date Filter:", JSON.stringify(salesTrendDateFilter));
        // --- End Date Filter Build ---

        // Define date grouping format based on range duration (example)
        let groupByFormat = "%Y-%m"; // Default to month
        let labelFormat = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let labelSeparator = " ";
        let labelYearPart = { $toString: "$_id.year" };
        let labelMainPart = { $arrayElemAt: [ labelFormat, "$_id.month" ] };

        if (start && end && (end.getTime() - start.getTime()) <= 31 * 24 * 60 * 60 * 1000) { // Approx 1 month or less
             groupByFormat = "%Y-%m-%d"; // Group by day
             labelFormat = null; // Use date string directly
             labelSeparator = "";
             labelYearPart = "";
             labelMainPart = "$_id.dateStr"; // Use the date string from group _id
             console.log("Grouping sales trend by DAY for short range.");
        } else {
            console.log("Grouping sales trend by MONTH.");
        }


        // Use Promise.all for concurrent fetching
        const [
            salesTrendData,
            topProductsChartData,
            revenueSummaryData,
            recentInvoicesTableData
        ] = await Promise.all([
            // *** Sales Trend Aggregation (uses dynamic filter and grouping) ***
            Invoice.aggregate([
                { $match: salesTrendDateFilter },
                { $group: {
                    // Grouping depends on calculated format
                    _id: groupByFormat === "%Y-%m-%d" ?
                        { dateStr: { $dateToString: { format: groupByFormat, date: "$createdAt", timezone: "UTC" } } } : // Group by date string for daily
                        { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, // Group by year/month
                    totalSales: { $sum: "$grandTotal" }
                }},
                // Sort by year/month or date string
                { $sort: groupByFormat === "%Y-%m-%d" ? { "_id.dateStr": 1 } : { "_id.year": 1, "_id.month": 1 } },
                { $project: {
                     _id: 0,
                     // Construct label based on grouping
                     label: labelFormat ?
                           { $concat: [ labelMainPart, labelSeparator, labelYearPart ] } :
                           labelMainPart, // Just use date string if daily
                     sales: "$totalSales"
                 }}
            ]),
            // --- Other aggregations remain the same ---
            Invoice.aggregate([ // Top Products (fixed 90 days)
                 { $match: { createdAt: { $gte: new Date(new Date().setDate(today.getDate() - 90)) }, status: 'Active' } },
                 { $unwind: '$items' }, { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } }, { $sort: { totalQuantity: -1 } }, { $limit: 5 }, { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo', pipeline: [ { $project: { name: 1, sku: 1 } } ] } }, { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } }, { $project: { _id: 0, name: '$productInfo.name', quantitySold: '$totalQuantity' } }
            ]),
            Invoice.aggregate([ // Revenue Summary
                { $match: { status: 'Active' } }, { $group: { _id: null, revenueToday: { $sum: { $cond: [ { $gte: ["$createdAt", getStartOfDay(today)] }, "$grandTotal", 0 ] } }, revenueThisMonth: { $sum: { $cond: [ { $gte: ["$createdAt", getStartOfMonth(today)] }, "$grandTotal", 0 ] } }, totalRevenue: { $sum: "$grandTotal" } }}, { $project: { _id: 0 } }
            ]),
            Invoice.find({ status: 'Active' }) // Recent Invoices
                    .sort({createdAt: -1}).limit(20).populate('createdBy', 'name')
                    .select('invoiceNumber customerName createdAt grandTotal createdBy _id')
        ]);

        const summary = revenueSummaryData.length > 0 ? revenueSummaryData[0] : { revenueToday: 0, revenueThisMonth: 0, totalRevenue: 0 };

        res.json({
            salesTrend: salesTrendData,
            topProductsChart: topProductsChartData,
            revenueSummary: {
                today: Number(summary.revenueToday).toFixed(2),
                thisMonth: Number(summary.thisMonth).toFixed(2),
                allTime: Number(summary.totalRevenue).toFixed(2),
            },
            recentInvoices: recentInvoicesTableData
        });

    } catch (error) {
        console.error('Error fetching detailed analytics data:', error);
        res.status(500).json({ message: 'Server error fetching detailed analytics' });
    }
});

// --- GET LOW STOCK PREDICTION ---
// @route   GET /api/analytics/low-stock-prediction/:productId
// @desc    Predict when a product might reach its low stock threshold
// @access  Private
router.get('/low-stock-prediction/:productId', protect, async (req, res) => {
    // ... (logic for this remains the same as your provided version) ...
    const { productId } = req.params;
    const lookbackDays = 30;
    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid product ID format' });
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const {currentStock, lowStockThreshold} = product;
        if (currentStock <= lowStockThreshold) return res.json({ message: `Product at/below threshold.`, predictionDate: null, daysLeft: 0 });
        const startDate = new Date(new Date().setDate(new Date().getDate() - lookbackDays));
        const salesData = await Invoice.aggregate([
            { $match: { createdAt: { $gte: startDate }, 'items.product': new mongoose.Types.ObjectId(productId), status: 'Active' } }, // Cast to ObjectId
            { $unwind: '$items' }, { $match: { 'items.product': new mongoose.Types.ObjectId(productId) } },
            { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } }
        ]);
        const totalSold = salesData.length > 0 ? salesData[0].totalSold : 0;
        if (totalSold <= 0) return res.json({ message: `No sales in last ${lookbackDays} days.`, predictionDate: null, daysLeft: null });
        const averageDailySales = totalSold / lookbackDays;
        if (averageDailySales <= 0) return res.json({ message: `Avg daily sales zero/negative.`, predictionDate: null, daysLeft: null });
        const stockAvailableAboveThreshold = currentStock - lowStockThreshold;
        const daysLeft = Math.floor(stockAvailableAboveThreshold / averageDailySales);
        if (!isFinite(daysLeft) || daysLeft < 0) return res.json({ message: `Prediction invalid.`, predictionDate: new Date(), daysLeft: 0 });
        const predictionDate = new Date(); predictionDate.setDate(predictionDate.getDate() + daysLeft);
        res.json({ message: `Based on average sales over the last ${lookbackDays} days (${averageDailySales.toFixed(2)}/day), predicted to reach threshold (${lowStockThreshold}) in approx ${daysLeft} days.`, predictionDate: predictionDate.toISOString().split('T')[0], daysLeft, averageDailySales: averageDailySales.toFixed(2) });
    } catch (error) {
        console.error(`Error predicting low stock for product ${productId}:`, error);
        res.status(500).json({ message: 'Server error during low stock prediction' });
    }
});
module.exports = router;