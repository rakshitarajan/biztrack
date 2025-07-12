// src/services/stockAdjustmentService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Creates a new stock adjustment record.
 * Backend automatically updates product stock via hook.
 * @param {object} adjustmentData - { productId, quantityChange, reason, notes? }
 */
export const createStockAdjustment = async (adjustmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/stock-adjustments`, adjustmentData, { headers: getAuthHeaders() });
    // Backend responds with { adjustment: savedAdjustment, newStockLevel: number }
    return response.data;
  } catch (error) {
    console.error('Error creating stock adjustment:', error);
    throw error; // Re-throw for component handling
  }
};

/**
 * Fetches the adjustment history for a specific product.
 * @param {string} productId - The ID of the product.
 */
export const getProductAdjustmentHistory = async (productId) => {
   try {
     const response = await axios.get(`${API_BASE_URL}/stock-adjustments/product/${productId}`, { headers: getAuthHeaders() });
     return response.data; // Expects array of adjustment objects, populated with user details
   } catch (error) {
     console.error(`Error fetching adjustment history for product ${productId}:`, error);
     throw error;
   }
};