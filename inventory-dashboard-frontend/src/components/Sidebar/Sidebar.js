// src/components/Sidebar/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../../hooks/useAuth'; // Adjust path if needed

const Sidebar = ({ isCollapsed, toggleSidebar, activePath, onLinkClick }) => {
  const { user, logout } = useAuth(); // Get logout from useAuth
  const isAdmin = user?.role === 'admin';

  // Helper function to determine the className (using passed prop)
  // Active path will now include /app, so we compare directly
  const getLinkClassName = (path) => {
    return activePath === path ? styles.active : undefined;
  };

  const handleLogout = () => {
    // If onLinkClick is just for setting active styles,
    // you might not need it for logout. Or, if it does more, keep it.
    // For now, just call logout.
    logout();
    // onLinkClick('/login'); // NavLink will handle navigation to /login
  };

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        {!isCollapsed && <span className={styles.logoText}>BizTrack</span>}
        <button onClick={toggleSidebar} className={styles.toggleButton}>
          ☰
        </button>
      </div>

      <div className={styles.navContainer}>
        <nav className={styles.nav}>
          <ul>
            <li>
              {/* **** UPDATED PATHS **** */}
              <NavLink to="/app/dashboard" className={getLinkClassName('/app/dashboard')} onClick={() => onLinkClick('/app/dashboard')}>
                <span className={styles.iconPlaceholder}>📊</span>
                {!isCollapsed && <span className={styles.linkText}>Dashboard</span>}
              </NavLink>
            </li>

            {!isCollapsed && <li className={styles.menuHeader}>MANAGE INVENTORY</li>}
            {isAdmin && (
              <>
                <li>
                  <NavLink to="/app/add-product" className={getLinkClassName('/app/add-product')} onClick={() => onLinkClick('/app/add-product')}>
                    <span className={styles.iconPlaceholder}>➕</span>
                    {!isCollapsed && <span className={styles.linkText}>Add Product</span>}
                  </NavLink>
                </li>
                {/* This link to View Inventory for editing is fine as View Inventory is accessible to all,
                    but if "Edit Product Info" implies a different admin-only view, adjust as needed.
                    For now, assuming it's one of the "View Inventory" links.
                */}
              </>
            )}
            <li>
              <NavLink to="/app/view-inventory" className={getLinkClassName('/app/view-inventory')} onClick={() => onLinkClick('/app/view-inventory')}>
                <span className={styles.iconPlaceholder}>👁️</span>
                {!isCollapsed && <span className={styles.linkText}>View Inventory</span>}
              </NavLink>
            </li>
            {isAdmin && (
              <>
                {/* This link to "Edit Product Info" seems redundant if it just goes to view-inventory where edit buttons are.
                        If it's a different page, create a new route. For now, I'll assume it means general product management.
                        Consider removing one of the "View Inventory" or "Edit Product Info" links if they point to the same place
                        or clarifying if "Edit Product Info" should be a separate admin page.
                        Let's assume the existing "View Inventory" link above serves this.
                    */}
                <li>
                  <NavLink to="/app/delete-product" className={getLinkClassName('/app/delete-product')} onClick={() => onLinkClick('/app/delete-product')}>
                    <span className={styles.iconPlaceholder}>🗑️</span>
                    {!isCollapsed && <span className={styles.linkText}>Adjust/Remove Stock</span>}
                  </NavLink>
                </li>
              </>
            )}


            {isAdmin && (
              <li>
                <NavLink to="/app/stock-prediction" className={getLinkClassName('/app/stock-prediction')} onClick={() => onLinkClick('/app/stock-prediction')}>
                  <span className={styles.iconPlaceholder}>📈</span>
                  {!isCollapsed && <span className={styles.linkText}>Stock Prediction</span>}
                </NavLink>
              </li>
            )}

            {!isCollapsed && <li className={styles.menuHeader}>MANAGE INVOICE</li>}
            <li>
              <NavLink to="/app/generate-invoice" className={getLinkClassName('/app/generate-invoice')} onClick={() => onLinkClick('/app/generate-invoice')}>
                <span className={styles.iconPlaceholder}>🧾</span>
                {!isCollapsed && <span className={styles.linkText}>Generate Invoices</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/app/view-invoices" className={getLinkClassName('/app/view-invoices')} onClick={() => onLinkClick('/app/view-invoices')}>
                <span className={styles.iconPlaceholder}>📄</span>
                {!isCollapsed && <span className={styles.linkText}>View Invoices</span>}
              </NavLink>
            </li>

            {isAdmin && (
              <>
                {!isCollapsed && <li className={styles.menuHeader}>MANAGE EMPLOYEES</li>}
                <li>
                  <NavLink to="/app/add-employee" className={getLinkClassName('/app/add-employee')} onClick={() => onLinkClick('/app/add-employee')}>
                    <span className={styles.iconPlaceholder}>👤</span>
                    {!isCollapsed && <span className={styles.linkText}>Add Employees</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/app/view-employees" className={getLinkClassName('/app/view-employees')} onClick={() => onLinkClick('/app/view-employees')}>
                    <span className={styles.iconPlaceholder}>👥</span>
                    {!isCollapsed && <span className={styles.linkText}>View Employees</span>}
                  </NavLink>
                </li>
                {/* The "Edit employees info" link also goes to /app/view-employees.
                     Users typically edit from the list view itself. This link is likely redundant.
                     I'll keep it but update the path.
                 */}
                <li>
                  <NavLink to="/app/view-employees" className={getLinkClassName('/app/view-employees')} onClick={() => onLinkClick('/app/view-employees')}>
                    <span className={styles.iconPlaceholder}>✏️</span>
                    {!isCollapsed && <span className={styles.linkText}>Edit Employees Info</span>}
                  </NavLink>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                {!isCollapsed && <li className={styles.menuHeader}>REPORTS</li>}
                <li>
                  <NavLink to="/app/analytics" className={getLinkClassName('/app/analytics')} onClick={() => onLinkClick('/app/analytics')}>
                    <span className={styles.iconPlaceholder}>📈</span>
                    {!isCollapsed && <span className={styles.linkText}>View Analytics</span>}
                  </NavLink>
                </li>
              </>
            )}

            <li className={styles.logoutSection}>
              {/* Logout navigates to a public route, so no /app prefix.
                  The onLinkClick for logout should primarily handle the logout logic.
              */}
              <NavLink to="/login" onClick={handleLogout}>
                <span className={styles.iconPlaceholder}>🚪</span>
                {!isCollapsed && <span className={styles.linkText}>Logout</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;