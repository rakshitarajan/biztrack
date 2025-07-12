/*import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'; // Replace with your backend URL

export const login = async (identifier, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier, // Assuming your backend uses 'identifier' for username/email
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    if (error.response && error.response.data) {
      return error.response.data; // Return backend error message
    }
    throw error; // Re-throw for the component to handle unexpected errors
  }
};

// You might have other auth-related functions here (e.g., logout)

export const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData); // Adjust endpoint
      return response.data;
    } catch (error) {
      console.error('Signup failed:', error);
      return error.response ? error.response.data : { success: false, message: 'Signup failed due to a network error.' };
    }
  };*/

 // src/services/authService.js
import axios from 'axios';

// Use environment variable for base URL, fallback for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Logs in a user.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - Promise resolving to backend response (e.g., { token, _id, name, email, role }) or error object.
 */
export const login = async (credentials) => {
  try {
    // Posting to the correct backend endpoint: /api/auth/login
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data; // Backend should return user info and token on success
  } catch (error) {
    console.error('Login Service Error:', error);
    // Return backend error response if available, otherwise a generic error structure
    if (error.response && error.response.data) {
       // If backend sends { message: '...' }, return it
       return error.response.data;
    } else {
       // Network or other unexpected error
       return { success: false, message: error.message || 'Login failed due to a network error.' };
    }
    // Or re-throw for component to handle: throw error;
  }
};

/**
 * Registers a new user.
 * @param {object} userData - { name, email, password, role? }
 * @returns {Promise<object>} - Promise resolving to backend response or error object.
 */
export const signup = async (userData) => {
  try {
    // Posting to the correct backend endpoint: /api/auth/register
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    // Backend might return the created user object and potentially a token for auto-login
    return response.data;
  } catch (error) {
    console.error('Signup Service Error:', error);
    if (error.response && error.response.data) {
       return error.response.data;
    } else {
       return { success: false, message: error.message || 'Signup failed due to a network error.' };
    }
    // Or re-throw: throw error;
  }
};

// Add other auth-related functions if needed (e.g., forgot password, reset password)