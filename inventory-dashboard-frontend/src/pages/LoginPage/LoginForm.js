import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Link can be removed if not used on this page
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

// Import your reusable components
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // **** THIS IS THE CORRECTED NAVIGATION PATH ****
        navigate('/app/dashboard'); // Navigate to the dashboard within the /app structure
      } else {
        setError(result.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error("LoginForm handleSubmit error:", err);
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      {/* Optional: Add a heading if not provided by LoginPage.js */}
      {/* <h3 className={styles.formTitle}>Login</h3> */}

      {error && <Alert type="error" message={error} />}

      <InputField
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete='email'
        disabled={loading}
      />

      <InputField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete='current-password'
        disabled={loading}
      />

      <Button
        type="submit"
        disabled={loading}
        className={styles.loginButton} // Ensure this class styles the button as needed
      >
        {loading ? <Spinner size="small" /> : 'Login'}
      </Button>

      {/* Example of where a signup link might go if LoginPage.js doesn't handle it */}
      {/* 
      <p className={styles.switchFormText}> 
        Don't have an account? <Link to="/signup" className={styles.switchFormLink}>Sign Up</Link>
      </p>
      */}
    </form>
  );
};

export default LoginForm;