// src/services/analyticsService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches summary data for the main dashboard.
 */
export const getDashboardSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/dashboard-summary`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary data:', error);
    throw error;
  }
};

// Removed getSalesTrend - data is now part of getAnalyticsDetails

/**
 * Fetches data for the detailed analytics page.
 * Accepts optional date range for sales trend filtering.
 * @param {string|null} [startDate] - Optional start date in 'YYYY-MM-DD' format or null/undefined.
 * @param {string|null} [endDate] - Optional end date in 'YYYY-MM-DD' format or null/undefined.
 */
export const getAnalyticsDetails = async (startDate, endDate) => { // <-- Accept date params
  try {
    // Construct query parameters only if dates are provided and valid
    const params = {};
    if (startDate && typeof startDate === 'string') params.startDate = startDate;
    if (endDate && typeof endDate === 'string') params.endDate = endDate;

    console.log("Fetching analytics details with params:", params);

    // Call backend with query parameters
    const response = await axios.get(`${API_BASE_URL}/analytics/details`, {
         headers: getAuthHeaders(),
         // Axios will correctly format the params object into a query string
         // e.g., /api/analytics/details?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
         params: params
    });
    return response.data; // Returns object with { salesTrend, topProductsChart, etc. }
  } catch (error) {
    console.error('Error fetching detailed analytics data:', error);
    throw error;
  }
};

/**
 * Fetches low stock prediction for a specific product.
 * @param {string} productId - The ID of the product.
 */
export const getLowStockPrediction = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/low-stock-prediction/${productId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error(`Error fetching low stock prediction for ${productId}:`, error);
    throw error;
  }
};

// Add other analytics functions if new endpoints are created