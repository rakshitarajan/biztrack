import React from 'react';
//import MainLayout from '../../layouts/MainLayout/MainLayout';
import GenerateInvoiceForm from './GenerateInvoiceForm';
import styles from './GenerateInvoicePage.module.css';

const GenerateInvoicePage = () => {
  return (
    //<MainLayout>
      <div className={styles.generateInvoicePage}>
        <h2>Generate New Invoice</h2>
        <GenerateInvoiceForm />
      </div>
    //</MainLayout>
  );
};

export default GenerateInvoicePage;