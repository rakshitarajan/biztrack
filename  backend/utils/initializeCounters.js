// utils/initializeCounters.js
const mongoose = require('mongoose');
const Counter = require('../models/Counter');

/**
 * Initialize counter documents for all sequences used in the application
 * This ensures counters exist in the database before they're needed
 */
const initializeCounters = async () => {
  console.log('🔄 Initializing counter sequences...');
  
  try {
    // List of counter sequences to initialize with starting values
    const countersToInitialize = [
      { _id: 'invoiceNumber', startValue: 0 },
      // Add any other counters your app needs here
      // Example: { _id: 'productSku', startValue: 1000 }
    ];
    
    // Process each counter
    for (const counter of countersToInitialize) {
      // Check if counter already exists
      const existingCounter = await Counter.findById(counter._id);
      
      if (!existingCounter) {
        // Create new counter if it doesn't exist
        await Counter.create({
          _id: counter._id,
          seq: counter.startValue
        });
        console.log(`✅ Created counter: ${counter._id} with starting value: ${counter.startValue}`);
      } else {
        console.log(`ℹ️ Counter already exists: ${counter._id} with current value: ${existingCounter.seq}`);
      }
    }
    
    console.log('✅ Counter initialization complete');
  } catch (error) {
    console.error('❌ Error initializing counters:', error);
    // Don't throw error - allow app to continue even if counter init fails
  }
};

module.exports = initializeCounters;