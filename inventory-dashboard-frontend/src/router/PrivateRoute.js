// src/router/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ensure path is correct
// Optional: Import a loading spinner component
// import LoadingSpinner from '../components/common/Spinner';

const PrivateRoute = ({ children, requiredRole }) => { // Added optional requiredRole prop
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation(); // Get current location for redirect state

  console.log("PrivateRoute Check: loading =", loading, "isAuthenticated =", isAuthenticated, "requiredRole =", requiredRole, "userRole =", user?.role); // Debug log

  // 1. Handle Loading State
  if (loading) {
    // Display a loading indicator while AuthContext initializes
    // return <LoadingSpinner message="Checking authentication..." />;
    return <div>Loading authentication...</div>; // Or return null
  }

  // 2. Handle Not Authenticated
  if (!isAuthenticated) {
    console.log("PrivateRoute: Not authenticated, redirecting to login.");
    // Redirect them to the /login page, but save the current location they were
    // trying to go to in the state. This allows us to send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Handle Role-Based Authorization (if requiredRole is provided)
  if (requiredRole && user?.role !== requiredRole) {
      console.log(`PrivateRoute: Authorization failed. User role "${user?.role}" !== Required role "${requiredRole}". Redirecting.`);
      // User is logged in, but does not have the required role.
      // Redirect to a general page like dashboard or an 'unauthorized' page.
      // Avoid redirecting back to login page as they are already logged in.
      return <Navigate to="/dashboard" replace />; // Or to an '/unauthorized' route
  }

  // 4. Authenticated and Authorized (or no role required)
  // Render the requested component
  return children;
};

export default PrivateRoute;