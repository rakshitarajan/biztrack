import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EditEmployeeForm from './EditEmployeeForm';
import styles from './EditEmployeePage.module.css';
import { getEmployeeById } from '../../services/employeeService';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';

const EditEmployeePage = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchEmployee = async () => {
      if (!employeeId) {
        setError("No employee ID specified in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getEmployeeById(employeeId);
        if (isMounted) {
          if (data) {
            setEmployee(data);
          } else {
            setError(`Employee with ID ${employeeId} not found.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load employee details.');
          console.error('Error fetching employee:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployee();
    return () => { isMounted = false; };
  }, [employeeId]);

  if (loading) {
    return (
      <div className={styles.editEmployeePage}>
        <h2>Edit Employee</h2>
        <Spinner message="Loading employee details..." />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className={styles.editEmployeePage}>
        <h2>Edit Employee</h2>
        <Alert type="error" message={error || `Employee with ID ${employeeId} not found.`} />
        {/* **** UPDATED NAVIGATION PATH for Back to Employees button **** */}
        <Button onClick={() => navigate('/app/view-employees')} variant="secondary" style={{ marginTop: '1rem' }}>
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.editEmployeePage}>
      <h2>Edit Employee</h2>
      <EditEmployeeForm initialEmployee={employee} />
    </div>
  );
};

export default EditEmployeePage;