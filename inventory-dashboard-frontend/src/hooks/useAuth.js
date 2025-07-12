// src/hooks/useAuth.js
// CORRECT version - relies on AuthContext.js having the logic

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Ensure path is correct

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error means you're trying to use useAuth outside of an AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // It simply returns the 'value' provided by AuthContext.Provider
  // which includes { user, token, isAuthenticated, loading, login, logout }
  return context;
};

// Usually no default export needed if AuthContext is default export,
// but if AuthContext is a named export, this is fine:
// export default useAuth;