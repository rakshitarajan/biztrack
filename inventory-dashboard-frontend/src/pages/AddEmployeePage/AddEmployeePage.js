import React from 'react';
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import AddEmployeeForm from './AddEmployeeForm';
import styles from './AddEmployeePage.module.css';

const AddEmployeePage = () => {
  return (
    
      <div className={styles.addEmployeePage}>
        <h2>Add New Employee</h2>
        <AddEmployeeForm />
      </div>
    
  );
};

export default AddEmployeePage;