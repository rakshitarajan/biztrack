// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Import Page Components ---
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AddProductPage from './pages/AddProductPage/AddProductPage';
import ViewInventoryPage from './pages/ViewInventoryPage/ViewInventoryPage';
import EditProductPage from './pages/EditProductPage/EditProductPage';
import ProductInfoPage from './pages/ProductInfoPage/ProductInfoPage';
import DeleteProductPage from './pages/DeleteProductPage/DeleteProductPage';
import GenerateInvoicePage from './pages/GenerateInvoicePage/GenerateInvoicePage';
import ViewInvoicesPage from './pages/ViewInvoicesPage/ViewInvoicesPage';
import ViewInvoiceDetailsPage from './pages/ViewInvoiceDetailsPage/ViewInvoiceDetailsPage';
import AddEmployeePage from './pages/AddEmployeePage/AddEmployeePage';
import ViewEmployeesPage from './pages/ViewEmployeesPage/ViewEmployeesPage';
import EditEmployeePage from './pages/EditEmployeePage/EditEmployeePage';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import StockPredictionPage from './pages/StockPredictionPage/StockPredictionPage';

// *** IMPORT THE NEW FeaturesPage ***
import FeaturesPage from './pages/FeaturesPage/FeaturesPage';
// import NotFoundPage from './pages/NotFoundPage/NotFoundPage'; // You can create this later

// --- Import Layout and Routing/Context ---
import MainLayout from './layouts/MainLayout/MainLayout';
import PrivateRoute from './router/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    // BrowserRouter remains the outermost component
    <BrowserRouter>
      {/* AuthProvider wraps everything to provide context */}
      <AuthProvider>
        {/* Routes define the different paths */}
        <Routes>
          {/* --- Public Routes --- */}
          {/* FeaturesPage is now the root path */}
          <Route path="/" element={<FeaturesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* --- Protected Application Routes --- */}
          {/* Define a parent route for the /app structure */}
          <Route
            path="/app" // Base path for the authenticated application part
            element={
              <PrivateRoute> {/* Protect the layout */}
                <MainLayout /> {/* The layout contains the Outlet for nested routes */}
              </PrivateRoute>
            }
          >
            {/* Index route for /app redirects to dashboard */}
            <Route index element={<Navigate replace to="/app/dashboard" />} />

            {/* Nested Application Pages */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Product Routes */}
            <Route path="view-inventory" element={<ViewInventoryPage />} />
            <Route path="products/:productId" element={<ProductInfoPage />} />
            {/* Admin Product Routes */}
            <Route path="add-product" element={<PrivateRoute requiredRole="admin"><AddProductPage /></PrivateRoute>} />
            <Route path="edit-product/:productId" element={<PrivateRoute requiredRole="admin"><EditProductPage /></PrivateRoute>} />
            <Route path="delete-product" element={<PrivateRoute requiredRole="admin"><DeleteProductPage /></PrivateRoute>} />

            {/* Invoice Routes */}
            <Route path="generate-invoice" element={<GenerateInvoicePage />} />
            <Route path="view-invoices" element={<ViewInvoicesPage />} />
            <Route path="invoices/:invoiceId" element={<ViewInvoiceDetailsPage />} />

            {/* Employee Routes (Admin Only) */}
            <Route path="add-employee" element={<PrivateRoute requiredRole="admin"><AddEmployeePage /></PrivateRoute>} />
            <Route path="view-employees" element={<PrivateRoute requiredRole="admin"><ViewEmployeesPage /></PrivateRoute>} />
            <Route path="edit-employee/:employeeId" element={<PrivateRoute requiredRole="admin"><EditEmployeePage /></PrivateRoute>} />

            {/* Analytics Route (Admin Only) */}
            <Route path="analytics" element={<PrivateRoute requiredRole="admin"><AnalyticsPage /></PrivateRoute>} />

            {/* Stock Prediction Route (Admin Only) */}
            <Route path="stock-prediction" element={<PrivateRoute requiredRole="admin"><StockPredictionPage /></PrivateRoute>} />

            {/* Add other nested /app routes here */}

          </Route> {/* End /app protected routes */}

          {/* --- Catch-all Route --- */}
          {/* Redirects any unmatched URL to the landing page */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
          <Route path="*" element={<Navigate replace to="/" />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;