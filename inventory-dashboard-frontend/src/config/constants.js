// src/config/constants.js

// API Base URL - Set based on environment
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

// File upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

// Auth related
export const TOKEN_KEY = 'authToken';
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user'
};

// App routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  INVOICES: '/invoices'
};

// Date formats
export const DATE_FORMAT = 'MMMM DD, YYYY';
export const DATE_TIME_FORMAT = 'MMMM DD, YYYY h:mm A';

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language'
};