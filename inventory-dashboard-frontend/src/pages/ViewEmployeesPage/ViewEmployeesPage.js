import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { getAllEmployees, deleteEmployee } from '../../services/employeeService';
import styles from './ViewEmployeesPage.module.css';
// import { capitalize } from '../../utils/helpers'; // Not used in provided code

const ViewEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    setActionSuccess('');
    try {
      const data = await getAllEmployees();
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error("Received non-array data from getAllEmployees:", data);
        setError('Failed to load employees: Invalid data format received.');
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load employees.';
      setError(message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredEmployees = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm.trim()) {
      return employees;
    }
    return employees.filter(employee => {
      if (!employee) return false;
      return (
        (employee.name && employee.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee.email && employee.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee.role && employee.role.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee._id && employee._id.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (employee.phoneNumber && employee.phoneNumber.includes(searchTerm))
      );
    });
  }, [employees, searchTerm]);

  const handleEdit = useCallback((employeeId) => {
    // **** UPDATED NAVIGATION PATH ****
    navigate(`/app/edit-employee/${employeeId}`);
  }, [navigate]);

  const handleDelete = useCallback(async (employeeId, employeeName) => {
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`)) {
      setActionError(null);
      setActionSuccess('');
      try {
        const response = await deleteEmployee(employeeId);
        if (response && response.message && response.message.toLowerCase().includes('removed')) {
          setActionSuccess(response.message);
          fetchData();
        } else {
          setActionError(response?.message || 'Failed to delete employee.');
        }
      } catch (err) {
        console.error(`Error deleting employee ${employeeId}:`, err);
        const message = err.response?.data?.message || err.message || 'Could not delete employee.';
        setActionError(message);
      }
    }
  }, [fetchData]);

  const employeeColumns = useMemo(() => [
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Phone Number', key: 'phoneNumber', format: (phone) => phone || 'N/A' },
    { header: 'Role', key: 'role', format: (role) => role ? role.charAt(0).toUpperCase() + role.slice(1) : 'N/A' },
    {
      header: 'Status', key: 'isActive',
      render: (employee) => (
        <span className={employee.isActive === false ? styles.inactiveStatus : styles.activeStatus}>
          {employee.isActive === false ? 'Inactive' : 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (employee) => (
        <div className={styles.actionButtonsContainer}>
          <Button
            size="small"
            onClick={() => handleEdit(employee._id)}
            title={`Edit ${employee.name}`}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => handleDelete(employee._id, employee.name)}
            title={`Delete ${employee.name}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  if (loading) {
    return (
      <div className={styles.viewEmployeesPage}>
        <h2>View Employees</h2>
        <Spinner message="Loading employees..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.viewEmployeesPage}>
        <h2>View Employees</h2>
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className={styles.viewEmployeesPage}>
      <h2>View Employees</h2>
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}

      <div className={styles.searchContainer}>
        <SearchBar onSearch={handleSearch} placeholder="Search by name, email, role, ID..." />
      </div>

      <Table columns={employeeColumns} data={filteredEmployees} />

      {!loading && filteredEmployees.length === 0 && searchTerm.trim() && (
        <p className={styles.noResults}>No employees found matching "{searchTerm}".</p>
      )}
      {!loading && employees.length > 0 && filteredEmployees.length === 0 && !searchTerm.trim() && (
        <p className={styles.noResults}>No employees match the current filter (if any applied).</p>
      )}
      {!loading && employees.length === 0 && !error && (
        <p className={styles.noResults}>
          There are currently no employees registered. {/* **** UPDATED NAVIGATION PATH **** */}
          <Button size="small" onClick={() => navigate('/app/add-employee')}>Add Employee</Button>
        </p>
      )}
    </div>
  );
};

export default ViewEmployeesPage;