import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import { signup as authServiceSignup } from '../../services/authService';
import Alert from '../../components/Alert/Alert'; // Assuming Alert component exists
import Spinner from '../../components/Spinner/Spinner'; // Assuming Spinner component exists
// Assuming Button and InputField components are used as per your previous examples
// import Button from '../../components/Button/Button';
// import InputField from '../../components/InputField/InputField';


const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(''); // Initialize role as empty string
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword || !role) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const signupData = { name, email, password, role };
      const response = await authServiceSignup(signupData);

      if (response && response._id) { // Check for a successful response (e.g., created user ID)
        console.log("Signup successful!", response);
        // Navigate to login page with a success message in state
        navigate('/login', { state: { message: 'Signup successful! Please log in.' } });
      } else {
        // Handle cases where backend returns an error message but not a typical error status
        setError(response?.message || 'Signup failed. Unexpected response from server.');
      }

    } catch (err) {
      console.error("Signup page error:", err);
      setError(err.response?.data?.message || err.message || 'An error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.signupForm}>
      {/* Use Alert component if available, otherwise keep p tag */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {/* {error && <p className={styles.errorMessage}>{error}</p>} */}


      <div className={`${styles.formGroup}`}> {/* Removed 'form-group' global class if not defined elsewhere */}
        <label htmlFor="name" className={styles.label}>Enter name:</label>
        <input
          type="text"
          id="name"
          className={`${styles.inputField}`} // Removed 'form-input' global class
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className={`${styles.formGroup}`}>
        <label htmlFor="email" className={styles.label}>Enter email:</label>
        <input
          type="email"
          id="email"
          className={`${styles.inputField}`}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete='email'
          disabled={loading}
        />
      </div>

      <div className={`${styles.formGroup}`}>
        <label htmlFor="password" className={styles.label}>Enter Password:</label>
        <input
          type="password"
          id="password"
          className={`${styles.inputField}`}
          placeholder="Create a strong password (min. 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete='new-password'
          disabled={loading}
        />
      </div>

      <div className={`${styles.formGroup}`}>
        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          className={`${styles.inputField}`}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete='new-password'
          disabled={loading}
        />
      </div>

      <div className={`${styles.formGroup}`}>
        <label htmlFor="role" className={styles.label}>Choose role:</label>
        <select
          id="role"
          className={`${styles.inputField} ${styles.selectField}`}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          disabled={loading}
        >
          <option value="" disabled>Select Role</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Assuming you have a Button component, otherwise use styled HTML button */}
      <button
        type="submit"
        className={styles.signupButton} // Use your specific signup button style
        disabled={loading}
      >
        {loading ? <Spinner size="small" /> : 'Sign Up'}
        {/* Changed Submit to Sign Up for clarity */}
      </button>
    </form>
  );
};

export default SignupForm;