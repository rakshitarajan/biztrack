// // src/components/Navbar/Navbar.js
// import React from 'react';
// import { Link, NavLink } from 'react-router-dom';
// import styles from './Navbar.module.css';
// import { useAuth } from '../../hooks/useAuth';
// import { FaUserCircle } from 'react-icons/fa';
// import PropTypes from 'prop-types';

// const Navbar = ({ isSidebarCollapsed }) => {
//   const { isAuthenticated } = useAuth();

//   return (
//     <nav className={`${styles.navbar} ${isSidebarCollapsed ? styles.navbarCollapsed : ''}`}>
//       {/* Actions Area */}
//       {isAuthenticated ? (
//         // Profile Icon Link
//         <NavLink
//           to="/profile"
//           className={({ isActive }) => `${styles.iconLink} ${isActive ? styles.activeIconLink : ''}`}
//           title="View Profile"
//         >
//           <FaUserCircle className={styles.profileIcon} />
//         </NavLink>
//       ) : (
//         // Login/Signup Links
//         <div className={styles.authLinks}>
//            <Link to="/login" className={styles.navLink}>Login</Link>
//            <Link to="/signup" className={styles.navLink}>Sign Up</Link>
//         </div>
//       )}
//     </nav>
//   );
// };

// // Define PropTypes
// Navbar.propTypes = {
//   isSidebarCollapsed: PropTypes.bool.isRequired,
// };

// export default Navbar;

// frontend/src/components/Navbar/Navbar.js
// SIMPLER VERSION if Navbar is ONLY used within authenticated MainLayout

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
// useAuth might not be strictly needed here if MainLayout already ensures authentication
// import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle } from 'react-icons/fa';
import PropTypes from 'prop-types';

const Navbar = ({ isSidebarCollapsed }) => {
  // const { isAuthenticated } = useAuth(); // Not strictly needed if MainLayout handles auth check

  return (
    <nav className={`${styles.navbar} ${isSidebarCollapsed ? styles.navbarCollapsed : ''}`}>
      {/* Profile Icon Link - will only render if this Navbar is part of authenticated layout */}
      <NavLink
        to="/app/profile" // Corrected path
        className={({ isActive }) => `${styles.iconLink} ${isActive ? styles.activeIconLink : ''}`}
        title="View Profile"
      >
        <FaUserCircle className={styles.profileIcon} />
      </NavLink>
      {/* No need for Login/Signup links if this Navbar is only for authenticated users */}
    </nav>
  );
};

Navbar.propTypes = {
  isSidebarCollapsed: PropTypes.bool,
};

Navbar.defaultProps = {
  isSidebarCollapsed: false,
};

export default Navbar;