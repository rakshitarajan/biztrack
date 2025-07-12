import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './AddEmployeePage.module.css';
import { addEmployee } from '../../services/employeeService';

// Assuming you have these components, or replace with your actual ones
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button'; // Assuming a Button component
import InputField from '../../components/InputField/InputField'; // Assuming an InputField component

const AddEmployeeForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const newEmployeeData = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        role: role || 'staff',
        phoneNumber: phoneNumber || undefined, // Send undefined if empty
      };

      const response = await addEmployee(newEmployeeData);
      
      if (response && response._id) {
        setSuccessMessage(`Employee '${response.name}' added successfully!`);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setRole('staff');
        // Optionally navigate to the view employees page after a delay
        setTimeout(() => {
          // **** UPDATED NAVIGATION PATH ****
          navigate('/app/view-employees');
        }, 2000); // Navigate after 2 seconds
      } else if (response && response.message) {
        setError(response.message);
      } else {
        setError('Failed to add employee. Please check the details and try again.');
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Error: ${err.response.data.message}`);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unexpected network or server error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Assuming styles.addEmployeeForm provides the main form styling
    <form onSubmit={handleSubmit} className={styles.addEmployeeForm}>
      {/* Use Alert component for feedback */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

      {/* Use InputField component for consistency */}
      <InputField
        label="First Name"
        id="firstName"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
        disabled={loading}
      />
      <InputField
        label="Last Name"
        id="lastName"
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
        disabled={loading}
      />
      <InputField
        label="Email"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="new-email" /* To avoid browser autofill from admin's email */
        disabled={loading}
      />
      <InputField
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength="6"
        autoComplete="new-password"
        disabled={loading}
      />
      <InputField
        label="Phone Number (Optional)"
        id="phoneNumber"
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        disabled={loading}
      />
      
      {/* Role selection */}
      <div className={styles.formGroup}> {/* Assuming formGroup class exists for label + select */}
        <label htmlFor="role">Role</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          disabled={loading}
          className={styles.selectField} // Assuming a general select field style
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Submit button using Button component */}
      <Button type="submit" disabled={loading} variant="primary">
        {loading ? <Spinner size="small" /> : 'Add Employee'}
      </Button>
    </form>
  );
};

export default AddEmployeeForm;