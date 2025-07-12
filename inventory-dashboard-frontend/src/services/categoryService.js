// src/services/categoryService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches all categories.
 */
export const getAllCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });
    return response.data; // Expects array of category objects [{ _id, name, description? }]
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Creates a new category.
 * Requires Admin privileges on the backend route.
 * @param {object} categoryData - { name, description? }
 */
export const createCategory = async (categoryData) => { // *** ENSURE THIS FUNCTION EXISTS ***
  try {
    // Assumes backend POST /api/categories requires admin
    const response = await axios.post(`${API_BASE_URL}/categories`, categoryData, { headers: getAuthHeaders() });
    return response.data; // Returns the created category object
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Add updateCategory and deleteCategory if needed later