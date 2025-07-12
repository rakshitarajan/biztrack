/*import React from 'react';
import LoginForm from './LoginForm';
import styles from './LoginPage.module.css';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout'; // Assuming you have an AuthLayout

const LoginPage = () => {
  return (
    <AuthLayout>
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <h2>Login</h2>
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;*/

/*import React from 'react';
import LoginForm from './LoginForm';
import styles from './LoginPage.module.css';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout'; // Assuming you have an AuthLayout
import { Link } from 'react-router-dom'; // Import the Link component

const LoginPage = () => {
  return (
    <AuthLayout>
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <h2>Login</h2>
          <LoginForm />
          <p className={styles.signupLink}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;*/

/*import React from 'react';
import LoginForm from './LoginForm';
import styles from './LoginPage.module.css';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout'; // Assuming you have an AuthLayout
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <AuthLayout>
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          <h2>Login</h2>
          <LoginForm />
          <p className={styles.signupLink}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;*/

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link if not already
import LoginForm from './LoginForm'; // Your existing login form component
import styles from './LoginPage.module.css'; // CSS for the page layout/card

// TODO: Import your logo if you have one
// import logo from '../../assets/images/logo.png';

const LoginPage = () => {
  return (
    <div className={styles.pageContainer}> {/* Full page container */}
      <div className={styles.formCard}> {/* Centered card */}

        {/* Branding Section */}
        <div className={styles.branding}>
           {/* {logo && <img src={logo} alt="BizTrack Logo" className={styles.logo} />} */}
           <h1 className={styles.appName}>BizTrack</h1>
           <p className={styles.tagline}>Streamline Your Business</p>
        </div>

        {/* Login Form Component */}
        <LoginForm />

        {/* Optional Link to Signup */}
        <p className={styles.switchForm}>
           Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;