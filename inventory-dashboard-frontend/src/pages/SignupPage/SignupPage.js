import React from 'react';
import { Link } from 'react-router-dom';
import SignupForm from './SignupForm';
import styles from './SignupPage.module.css';

// import logo from '../../assets/images/logo.png'; // Uncomment if you have a logo

const SignupPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.formCard}>
        <div className={styles.branding}>
          {/* {logo && <img src={logo} alt="BizTrack Logo" className={styles.logo} />} */}
          <h1 className={styles.appName}>BizTrack</h1>
          <p className={styles.tagline}>Create Your Account</p>
        </div>
        <SignupForm />
        <p className={styles.switchForm}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;