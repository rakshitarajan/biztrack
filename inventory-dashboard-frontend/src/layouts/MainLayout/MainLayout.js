// src/layouts/MainLayout/MainLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar'; // Adjust path if needed
import Navbar from '../../components/Navbar/Navbar';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  // State for sidebar collapsing
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State for manually tracking active path
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    // Update activePath when route changes
    setActivePath(location.pathname);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Function passed to Sidebar links
  const handleLinkClick = (path) => {
    setActivePath(path);
  };

  return (
    <div className={styles.appLayoutContainer}>
      {/* Pass isCollapsed to Navbar for proper positioning */}
      <Navbar isSidebarCollapsed={isCollapsed} />
      
      <div className={`${styles.mainBodyContainer} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          activePath={activePath}
          onLinkClick={handleLinkClick}
        />

        <main className={`${styles.contentArea} ${isCollapsed ? styles.contentAreaCollapsed : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;