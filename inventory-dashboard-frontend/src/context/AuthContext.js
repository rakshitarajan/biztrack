// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as authServiceLogin } from '../services/authService';
import { getProfile } from '../services/userService'; // *** ENSURE THIS IMPORT IS CORRECT ***
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user object { _id, name, email, role } or null
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define logout first
  const logout = useCallback(() => {
    // Add stack trace to see what called logout unexpectedly
    console.log('AuthContext: Logout triggered from:', new Error().stack);
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]);

  // Effect for initial load: Check token, validate via profile fetch
  useEffect(() => {
    let isMounted = true;
    const validateTokenAndFetchUser = async () => {
      console.log("AuthContext Effect: Running initial token/user check...");
      const storedToken = localStorage.getItem('authToken');

      if (storedToken) {
        console.log("AuthContext Effect: Token found in storage. Validating...");
        // Temporarily set token state immediately for potential early use? Maybe not needed.
        // setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          console.log("AuthContext Effect: Attempting to fetch user profile...");
          const userData = await getProfile(); // Call API to get user data
          console.log("AuthContext Effect: Profile fetch API call returned.");

          if (isMounted) { // Check if component is still mounted after await
                if (userData && userData._id) {
                  setUser(userData); // Set user state if profile fetch is successful
                  setToken(storedToken); // Confirm token state matches storage
                  console.log("AuthContext Effect: Token validated. User state set:", userData);
                } else {
                  console.warn("AuthContext Effect: Profile fetch returned invalid data. Logging out.");
                  logout(); // Treat as invalid token/session
                }
            } else {
                console.log("AuthContext Effect: Component unmounted during profile fetch.");
            }
        } catch (error) {
          console.error("AuthContext Effect: Profile fetch/token validation failed.", error);
          if (isMounted) {
            logout(); // Treat as invalid token if fetch fails
          }
        }
      } else {
        console.log("AuthContext Effect: No token found in storage.");
        setUser(null); // Ensure user is null
        setToken(null); // Ensure token state is null
        delete axios.defaults.headers.common['Authorization'];
      }

      // Initial check is complete
      if (isMounted) {
        console.log("AuthContext Effect: Initial loading complete.");
        setLoading(false);
      }
    };

    validateTokenAndFetchUser();

    return () => {
        console.log("AuthContext Effect: Cleanup running.");
        isMounted = false;
    }; // Cleanup function

  }, [logout]); // Rerun only if logout function reference changes

  // Login function
  const login = useCallback(async (email, password) => {
    // No need for internal loading state here, component can manage it
    console.log("AuthContext: login function called.");
    try {
      const response = await authServiceLogin({ email, password });
      if (response?.token && response?._id && response?.role) {
        console.log("AuthContext: Login API successful.");
        localStorage.setItem('authToken', response.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        // Set user FIRST, then token to potentially trigger useEffect correctly if needed
        setUser({ _id: response._id, name: response.name, email: response.email, role: response.role });
        setToken(response.token); // Update token state AFTER setting user
        console.log("AuthContext: User and Token state updated after login.");
        return { success: true, user: response };
      } else {
        console.warn("AuthContext: Login failed (API response invalid).", response);
        localStorage.removeItem('authToken'); // Ensure cleanup
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        return { success: false, message: response?.message || 'Login failed: Invalid server response.' };
      }
    } catch (error) {
      console.error('AuthContext: Login API call error:', error);
      const message = error.response?.data?.message || 'Login failed due to a network or server error.';
      localStorage.removeItem('authToken'); // Ensure cleanup
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      return { success: false, message: message };
    }
  }, []); // login doesn't depend on other state


  // Memoize the context value
  const value = useMemo(() => {
    const authenticated = !!user; // Base isAuthenticated on user object
    console.log('[AuthContext Value] Recalculating:', { user, token, loading, isAuthenticated: authenticated });
    return {
        user,
        token,
        isAuthenticated: authenticated, // Use calculated value
        loading,
        login,
        logout,
    };
  }, [user, token, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only after initial loading check */}
      {!loading ? children : <div>Loading Application...</div>}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};