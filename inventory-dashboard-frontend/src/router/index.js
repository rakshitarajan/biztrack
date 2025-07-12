// src/router/index.js
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import App from '../App';
import SignupPage from '../pages/SignupPage/SignupPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import AddProductPage from '../pages/AddProductPage/AddProductPage';
import ViewInventoryPage from '../pages/ViewInventoryPage/ViewInventoryPage';
import EditProductPage from '../pages/EditProductPage/EditProductPage';
import GenerateInvoicePage from '../pages/GenerateInvoicePage/GenerateInvoicePage';
import ViewInvoicesPage from '../pages/ViewInvoicesPage/ViewInvoicesPage';
import AddEmployeePage from '../pages/AddEmployeePage/AddEmployeePage';
import ViewEmployeesPage from '../pages/ViewEmployeesPage/ViewEmployeesPage';
import EditEmployeePage from '../pages/EditEmployeePage/EditEmployeePage';
import AnalyticsPage from '../pages/AnalyticsPage/AnalyticsPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import DeleteProductPage from '../pages/DeleteProductPage/DeleteProductPage'; // Or AdjustStockPage
// TODO: Import NotFoundPage
// import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';
import PrivateRoute from './PrivateRoute'; // Ensure correct path

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* Public Routes */}
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route index element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* Inventory Routes */}
      <Route path="view-inventory" element={<PrivateRoute><ViewInventoryPage /></PrivateRoute>} />
      {/* --- ADMIN ONLY --- */}
      <Route path="add-product" element={<PrivateRoute requiredRole="admin"><AddProductPage /></PrivateRoute>} />
      {/* --- FIX: Use consistent naming :productId --- */}
      <Route path="edit-product/:productId" element={<PrivateRoute requiredRole="admin"><EditProductPage /></PrivateRoute>} />
      {/* --- ADMIN ONLY --- */}
      {/* Consider renaming route/page for clarity e.g., /adjust-stock */}
      <Route path="delete-product" element={<PrivateRoute requiredRole="admin"><DeleteProductPage /></PrivateRoute>} />

      {/* Invoice Routes */}
      <Route path="generate-invoice" element={<PrivateRoute><GenerateInvoicePage /></PrivateRoute>} />
      <Route path="view-invoices" element={<PrivateRoute><ViewInvoicesPage /></PrivateRoute>} />
      {/* Add /view-invoice/:invoiceId route if needed */}

      {/* Employee Routes (Admin Only) */}
      {/* --- FIX: Use consistent naming :employeeId --- */}
      <Route path="add-employee" element={<PrivateRoute requiredRole="admin"><AddEmployeePage /></PrivateRoute>} />
      <Route path="view-employees" element={<PrivateRoute requiredRole="admin"><ViewEmployeesPage /></PrivateRoute>} />
      <Route path="edit-employee/:employeeId" element={<PrivateRoute requiredRole="admin"><EditEmployeePage /></PrivateRoute>} />

      {/* Analytics Route (Admin Only) */}
      <Route path="analytics" element={<PrivateRoute requiredRole="admin"><AnalyticsPage /></PrivateRoute>} />

      {/* TODO: Add a 404 Not Found Route at the end */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}

    </Route>
  )
);

export default router;