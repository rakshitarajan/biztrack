import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { getAllInvoices, downloadInvoicePDF } from '../../services/invoiceService';
import styles from './ViewInvoicesPage.module.css';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ViewInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null); // Not used in this version but kept for consistency
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    setActionSuccess(null); // Reset success message
    try {
      const data = await getAllInvoices();
      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.error("Received non-array data from getAllInvoices:", data);
        throw new Error('Invalid invoice data format received.');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load invoices.';
      setError(message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInvoices = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm.trim()) return invoices; // Use trim() for search term check
    return invoices.filter(invoice => {
      if (!invoice) return false;
      const formattedDate = invoice.createdAt ? formatDate(invoice.createdAt) : '';
      const customerMatch = invoice.customerName?.toLowerCase().includes(lowerCaseSearchTerm);
      const invoiceNumberMatch = invoice.invoiceNumber?.toLowerCase().includes(lowerCaseSearchTerm);
      const dateMatch = formattedDate.toLowerCase().includes(lowerCaseSearchTerm); // ensure date match is case-insensitive
      const totalMatch = invoice.grandTotal?.toString().includes(lowerCaseSearchTerm); // grandTotal likely number
      const cashierMatch = invoice.createdBy?.name?.toLowerCase().includes(lowerCaseSearchTerm);
      return customerMatch || invoiceNumberMatch || dateMatch || totalMatch || cashierMatch;
    });
  }, [invoices, searchTerm]);

  const handleViewDetails = useCallback((invoiceId) => {
    // **** UPDATED NAVIGATION PATH ****
    const targetPath = `/app/invoices/${invoiceId}`;
    // console.log(`Navigating to view details: ${targetPath}`); // For debugging
    navigate(targetPath);
  }, [navigate]);

  const handleDownload = useCallback(async (invoiceId, invoiceNumber) => {
    setActionError(null); // Clear previous action errors
    try {
      await downloadInvoicePDF(invoiceId);
      // Optionally set actionSuccess here if download service doesn't provide user feedback
      // setActionSuccess(`Invoice ${invoiceNumber} PDF download initiated.`);
    }
    catch (err) {
      setActionError(`Could not download PDF for ${invoiceNumber || 'invoice'}.`);
    }
  }, []);

  const invoiceColumns = useMemo(() => [
    { header: 'Invoice #', key: 'invoiceNumber' },
    { header: 'Customer Name', key: 'customerName' },
    { header: 'Invoice Date', key: 'createdAt', format: (d) => formatDate(d) },
    { header: 'Total Amount', key: 'grandTotal', format: (v) => formatCurrency(v) },
    { header: 'Cashier', key: 'createdBy', render: (inv) => inv.createdBy?.name || 'N/A' },
    {
      header: 'Actions',
      key: 'actions',
      render: (invoice) => (
        <div className={styles.actionButtonsContainer}>
          <Button size="small" onClick={() => handleViewDetails(invoice._id)} title="View Invoice Details">View</Button>
          <Button size="small" variant="secondary" onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)} title="Download PDF">Download</Button>
        </div>
      ),
    },
  ], [handleViewDetails, handleDownload]);


  if (loading) return <div className={styles.viewInvoicesPage}><h2>View Invoices</h2><Spinner message="Loading invoices..." /></div>;
  if (error) return <div className={styles.viewInvoicesPage}><h2>View Invoices</h2><Alert type="error" message={error} /></div>;

  return (
    <div className={styles.viewInvoicesPage}>
      <h2>View Invoices</h2>
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />}
      
      <div className={styles.searchContainer}> {/* Added a wrapper for search bar if needed for styling */}
        <SearchBar onSearch={setSearchTerm} placeholder="Search by Invoice #, Customer, Date, Amount, Cashier..." />
      </div>
      
      <Table columns={invoiceColumns} data={filteredInvoices} />
      
      {!loading && filteredInvoices.length === 0 && searchTerm.trim() && (
        <p className={styles.noResults}>No invoices found matching "{searchTerm}".</p>
      )}
      {!loading && invoices.length > 0 && filteredInvoices.length === 0 && !searchTerm.trim() && (
        <p className={styles.noResults}>No invoices match the current filter.</p>
      )}
      {!loading && invoices.length === 0 && !error && (
        <p className={styles.noResults}>No invoices generated yet.</p>
      )}
    </div>
  );
};

export default ViewInvoicesPage;