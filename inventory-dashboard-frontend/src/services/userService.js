// src/services/userService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn("No auth token found for user service request.");
    // Depending on your error handling, you might throw an error here
    // or let the backend handle the missing token.
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches profile of the currently authenticated user.
 * Used by AuthContext to validate token and get user details on load.
 */
export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profile`, { headers: getAuthHeaders() });
    return response.data; // Expects user object { _id, name, email, role, phoneNumber?, isActive? }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // If backend returns 401/403 specifically, AuthContext will handle logout
    throw error; // Re-throw to be caught by AuthContext or calling component
  }
};

/**
 * Fetches all users (Admin only).
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
    return response.data; // Expects array of user objects
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

/**
 * Updates a specific user's details (Admin or self-update).
 * @param {string} userId - The ID of the user to update.
 * @param {object} userData - The fields to update (e.g., { name?, email?, role?, phoneNumber?, isActive?, password? }).
 */
export const updateUser = async (userId, userData) => {
   try {
     const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, { headers: getAuthHeaders() });
     return response.data; // Expects updated user object
   } catch (error) {
     console.error(`Error updating user ${userId}:`, error);
     throw error;
   }
};

/**
 * Adds a new user/employee (Admin only).
 * @param {object} userData - { name, email, password, role, phoneNumber? }
 */
export const addUser = async (userData) => {
   try {
     // Backend route POST /api/users is used for admin adding users
     const response = await axios.post(`${API_BASE_URL}/users`, userData, { headers: getAuthHeaders() });
     return response.data; // Expects newly created user object
   } catch (error) {
     console.error('Error adding user:', error);
     throw error;
   }
};


/**
 * Deletes a user (Admin only).
 * @param {string} userId - The ID of the user to delete.
 */
export const deleteUser = async (userId) => {
   try {
     const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, { headers: getAuthHeaders() });
     return response.data; // Expects success message { message: 'User removed' }
   } catch (error) {
     console.error(`Error deleting user ${userId}:`, error);
     throw error;
   }
};

// Add specific function for updating own profile if needed,
// using a different backend endpoint like PUT /api/users/profile
export const updateMyProfile = async (profileData) => {
     try {
         // Example: Assuming a dedicated route exists
         const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData, { headers: getAuthHeaders() });
         return response.data; // Expects updated user object (self)
     } catch (error) {
         console.error('Error updating own profile:', error);
         throw error;
     }
 };