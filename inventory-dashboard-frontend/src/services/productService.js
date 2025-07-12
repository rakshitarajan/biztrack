// // src/services/productService.js
// import axios from 'axios';
// // Assuming API_BASE_URL is correctly defined (e.g., 'http://localhost:3000')
// import { API_BASE_URL } from '../config/constants';

// // Helper function to get auth headers
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('authToken');
//   // Only add header if token exists
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// /**
//  * Fetches all products, optionally filtered by search term or category.
//  * Requires authentication.
//  * @param {string} [searchTerm] - Optional search term for name/sku.
//  * @param {string} [categoryId] - Optional category ID to filter by ('All' means no filter).
//  */
// export const getAllProducts = async (searchTerm = '', categoryId = 'All') => {
//   try {
//     // Build query parameters
//     const params = new URLSearchParams();
//     if (searchTerm) {
//       params.append('search', searchTerm);
//     }
//     if (categoryId && categoryId !== 'All') {
//       params.append('category', categoryId);
//     }
//     const queryString = params.toString();
//     const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

//     console.log(`productService: Fetching products with URL: ${url}`);
//     const response = await axios.get(url, { headers: getAuthHeaders() });
//     return response.data;
//   } catch (error) {
//     console.error('productService: Error fetching products:', error.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Fetches a single product by its ID.
//  * Requires authentication.
//  * @param {string} productId - The ID of the product.
//  */
// export const getProductById = async (productId) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/products/${productId}`, { headers: getAuthHeaders() });
//     return response.data;
//   } catch (error) {
//     console.error(`productService: Error fetching product ${productId}:`, error.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Creates a new product.
//  * Requires admin authentication.
//  * @param {object} productData - Data for the new product.
//  */
// export const createProduct = async (productData) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/api/products`, productData, { headers: getAuthHeaders() });
//     return response.data;
//   } catch (error) {
//     console.error('productService: Error creating product:', error.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Updates an existing product.
//  * Requires admin authentication.
//  * @param {string} productId - The ID of the product to update.
//  * @param {object} productData - Fields to update.
//  */
// export const updateProduct = async (productId, productData) => {
//   try {
//     const response = await axios.put(`${API_BASE_URL}/api/products/${productId}`, productData, { headers: getAuthHeaders() });
//     return response.data;
//   } catch (error) {
//     console.error(`productService: Error updating product ${productId}:`, error.response?.data || error.message);
//     throw error;
//   }
// };

// /**
//  * Deletes a product. (Use with caution)
//  * Requires admin authentication.
//  * @param {string} productId - The ID of the product to delete.
//  */
// export const deleteProduct = async (productId) => {
//   try {
//     const response = await axios.delete(`${API_BASE_URL}/api/products/${productId}`, { headers: getAuthHeaders() });
//     return response.data;
//   } catch (error) {
//     console.error(`productService: Error deleting product ${productId}:`, error.response?.data || error.message);
//     throw error;
//   }
// };


// /**
//  * Searches for products by name or SKU using the main GET endpoint.
//  * Requires authentication.
//  * @param {string} searchTerm - The term to search for.
//  */
// export const searchProducts = async (searchTerm) => {
//   try {
//     // *** Use the main GET /api/products endpoint with '?search=' query parameter ***
//     const response = await axios.get(`${API_BASE_URL}/api/products?search=${encodeURIComponent(searchTerm)}`, { headers: getAuthHeaders() });
//     return response.data || []; // Ensure array return
//   } catch (error) {
//     console.error(`productService: Error searching products with term "${searchTerm}":`, error.response?.data || error.message);
//     return []; // Return empty on error
//   }
// };


// // NOTE: updateProductStock and getProductsByCategory might be redundant
// // if stock is handled by stockAdjustmentService and category filtering
// // is handled by query params in getAllProducts or frontend filtering.
// // Commenting them out for now unless specifically needed by other components.

// /*
// export const updateProductStock = async (productId, stockChange, operation = 'add') => {
//   try {
//     console.warn("updateProductStock service function called. Ensure backend endpoint exists: PATCH /api/products/:id/stock");
//     const response = await axios.patch(`${API_BASE_URL}/api/products/${productId}/stock`, { stockChange, operation }, { headers: getAuthHeaders() });
//     return response.data;
//   } catch (error) { console.error(`productService: Error updating stock for product ${productId}:`, error.response?.data || error.message); throw error; }
// };

// export const getProductsByCategory = async (categoryId) => {
//   try {
//     console.warn("getProductsByCategory service function called. Ensure backend endpoint exists: GET /api/products/category/:categoryId");
//     const response = await axios.get(`${API_BASE_URL}/api/products/category/${categoryId}`, { headers: getAuthHeaders() });
//     return response.data;
//   } catch (error) { console.error(`productService: Error fetching products for category ${categoryId}:`, error.response?.data || error.message); throw error; }
// };
// */

// frontend/src/services/productService.js
import axios from 'axios';
// Assuming API_BASE_URL is correctly defined (e.g., in src/config/constants.js or an env file)
// If not, define it here or import it. For example:
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001'; // Your backend port
// Using '/api' assuming a proxy is set up in frontend/package.json
const API_BASE_URL = '/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const userInfo = localStorage.getItem('userInfo'); // Or your specific key for auth info
  if (userInfo) {
    try {
      const parsedInfo = JSON.parse(userInfo);
      return parsedInfo.token; // Assuming token is stored under 'token' key
    } catch (e) {
      console.error("Failed to parse userInfo from localStorage for token:", e);
      return null;
    }
  }
  return null;
};

// Helper function to create Axios config with Authorization header
const getConfig = () => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

/**
 * Fetches all products, optionally filtered by search term or category.
 * Requires authentication.
 * @param {string} [searchTerm] - Optional search term for name/sku.
 * @param {string} [categoryId] - Optional category ID to filter by ('All' means no filter).
 */
export const getAllProducts = async (searchTerm = '', categoryId = 'All') => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (categoryId && categoryId !== 'All') {
      params.append('category', categoryId);
    }
    const queryString = params.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

    console.log(`productService: Fetching products with URL: ${url}`);
    const { data } = await axios.get(url, getConfig());
    return data;
  } catch (error) {
    console.error('productService: Error fetching products:', error.response?.data || error.message);
    // Re-throw a more consistent error object for components to handle
    throw error.response?.data || { message: error.message || "Failed to fetch products." };
  }
};

/**
 * Fetches a single product by its ID.
 * Requires authentication.
 * @param {string} productId - The ID of the product.
 */
export const getProductById = async (productId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/products/${productId}`, getConfig());
    return data;
  } catch (error) {
    console.error(`productService: Error fetching product ${productId}:`, error.response?.data || error.message);
    throw error.response?.data || { message: error.message || `Failed to fetch product ${productId}.` };
  }
};

/**
 * Creates a new product.
 * Requires admin authentication.
 * @param {object} productData - Data for the new product.
 */
export const createProduct = async (productData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/products`, productData, getConfig());
    return data;
  } catch (error) {
    console.error('productService: Error creating product:', error.response?.data || error.message);
    throw error.response?.data || { message: error.message || "Failed to create product." };
  }
};

/**
 * Updates an existing product.
 * Requires admin authentication.
 * @param {string} productId - The ID of the product to update.
 * @param {object} productData - Fields to update.
 */
export const updateProduct = async (productId, productData) => {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, getConfig());
    return data;
  } catch (error) {
    console.error(`productService: Error updating product ${productId}:`, error.response?.data || error.message);
    throw error.response?.data || { message: error.message || `Failed to update product ${productId}.` };
  }
};

/**
 * Deletes a product. (Use with caution)
 * Requires admin authentication.
 * @param {string} productId - The ID of the product to delete.
 */
export const deleteProduct = async (productId) => {
  try {
    const { data } = await axios.delete(`${API_BASE_URL}/products/${productId}`, getConfig());
    return data; // Expected backend response: { message: "Product '...' removed successfully." }
  } catch (error) {
    console.error(`productService: Error deleting product ${productId}:`, error.response?.data || error.message);
    throw error.response?.data || { message: error.message || `Failed to delete product ${productId}.` };
  }
};

/**
 * Searches for products by name or SKU using the main GET endpoint.
 * Requires authentication.
 * @param {string} searchTerm - The term to search for.
 */
export const searchProducts = async (searchTerm) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`, getConfig());
    return data || []; // Ensure array return even if backend returns null for no results
  } catch (error) {
    console.error(`productService: Error searching products with term "${searchTerm}":`, error.response?.data || error.message);
    return []; // Return empty array on error for consistency
  }
};

// --- NEW: Bulk Upload Products Service Function ---
/**
 * Uploads an array of products in bulk.
 * Requires admin authentication.
 * @param {Array<object>} productsArray - Array of product objects to upload.
 */
export const bulkUploadProductsService = async (productsArray) => {
  const payload = { products: productsArray }; // Backend expects { products: [...] }
  try {
    const config = getConfig();
    console.log("SERVICE: Sending bulk upload request to /products/bulk-upload with payload:", payload);
    const { data } = await axios.post(`${API_BASE_URL}/products/bulk-upload`, payload, config);
    console.log("SERVICE: Bulk upload response received:", data);
    // Backend is expected to return: { message, successCount, failureCount, errors, successfulItems }
    // And an appropriate status code (201 for all success, 207 for partial, 400 for all fail/bad request)
    return data;
  } catch (error) {
    console.error("Error in bulkUploadProductsService:", error.response?.data || error.message);
    // Re-throw a structured error for the component to handle
    // Ensure the thrown error has a 'message' and optionally an 'errors' array for detailed feedback
    throw error.response?.data || {
      message: error.message || "Network error or unexpected issue during bulk upload.",
      // success: false, // Backend should set this
      errors: [{ reason: error.message || "Network error" }] // Generic error structure if backend doesn't provide details
    };
  }
};

// NOTE: Your commented-out updateProductStock and getProductsByCategory functions are preserved below.
/*
export const updateProductStock = async (productId, stockChange, operation = 'add') => {
  try {
    console.warn("updateProductStock service function called. Ensure backend endpoint exists: PATCH /api/products/:id/stock");
    const response = await axios.patch(`${API_BASE_URL}/products/${productId}/stock`, { stockChange, operation }, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) { console.error(`productService: Error updating stock for product ${productId}:`, error.response?.data || error.message); throw error; }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    console.warn("getProductsByCategory service function called. Ensure backend endpoint exists: GET /api/products/category/:categoryId");
    const response = await axios.get(`${API_BASE_URL}/products/category/${categoryId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) { console.error(`productService: Error fetching products for category ${categoryId}:`, error.response?.data || error.message); throw error; }
};
*/