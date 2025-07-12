import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ViewInvoiceDetailsPage.module.css';
import { getInvoiceById, downloadInvoicePDF } from '../../services/invoiceService';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ViewInvoiceDetailsPage = () => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      setInvoice(null); // Reset invoice state before fetching
      try {
        const data = await getInvoiceById(invoiceId);
        if (isMounted) {
          if (data && data._id) {
            setInvoice(data);
          } else {
            setError(`Invoice with ID ${invoiceId} not found or data is invalid.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching invoice details:", err);
          setError(err.response?.data?.message || err.message || "Failed to load invoice details.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (invoiceId && /^[a-f\d]{24}$/i.test(invoiceId)) {
      fetchInvoice();
    } else {
      setError("Invalid Invoice ID format in URL.");
      setLoading(false);
    }

    return () => { isMounted = false; };
  }, [invoiceId]);

  const handleDownload = async () => {
    setActionError('');
    if (!invoice) return;
    try {
      await downloadInvoicePDF(invoice._id);
    } catch (err) {
      console.error("Error triggering PDF download:", err);
      setActionError("Failed to download PDF.");
    }
  };

  if (loading) {
    return (
      <div className={styles.detailsPage}>
        <h2>Invoice Details</h2>
        <Spinner message="Loading invoice details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.detailsPage}>
        <h2>Invoice Details</h2>
        <Alert type="error" message={error} />
        {/* **** UPDATED NAVIGATION PATH for Back button **** */}
        <Button className={styles.backButton} onClick={() => navigate('/app/view-invoices')} variant="secondary">
          Back to Invoices
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className={styles.detailsPage}>
        <h2>Invoice Details</h2>
        <Alert type="warning" message={`Invoice data not found (ID: ${invoiceId}).`} />
        {/* **** UPDATED NAVIGATION PATH for Back button **** */}
        <Button className={styles.backButton} onClick={() => navigate('/app/view-invoices')} variant="secondary">
          Back to Invoices List
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.detailsPage}>
      <div className={styles.pageHeader}>
        <h2>Invoice #{invoice.invoiceNumber}</h2>
        <Button onClick={handleDownload} variant="outline" size="small">Download PDF</Button>
      </div>
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError('')} />}

      <div className={styles.invoiceHeader}>
        <div className={styles.customerInfo}>
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> {invoice.customerName}</p>
          {invoice.customerPhone && <p><strong>Phone:</strong> {invoice.customerPhone}</p>}
        </div>
        <div className={styles.invoiceMeta}>
          <h3>Invoice Info</h3>
          <p><strong>Status:</strong> <span className={styles[`status${invoice.status}`] || ''}>{invoice.status}</span></p>
          <p><strong>Payment:</strong> {invoice.paymentStatus}</p>
          <p><strong>Date Created:</strong> {formatDate(invoice.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
          <p><strong>Created By:</strong> {invoice.createdBy?.name || 'N/A'}</p>
          <p><strong>Internal ID:</strong> {invoice._id}</p>
        </div>
      </div>

      <div className={styles.itemsSection}>
        <h3>Items</h3>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th className={styles.numberCell}>Qty</th>
              <th className={styles.numberCell}>Unit Price</th>
              <th className={styles.numberCell}>Discount</th>
              <th className={styles.numberCell}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.length > 0 ? (
              invoice.items.map((item, index) => {
                const lineTotal = (item.quantity * item.priceAtSale) * (1 - (item.discountPercentageAtSale || 0) / 100);
                return (
                  <tr key={item.product?._id || index}>
                    <td>{item.productSku || 'N/A'}</td>
                    <td>{item.productName || 'Product details missing'}</td>
                    <td className={styles.numberCell}>{item.quantity}</td>
                    <td className={styles.numberCell}>{formatCurrency(item.priceAtSale)}</td>
                    <td className={styles.numberCell}>{item.discountPercentageAtSale?.toFixed(1) || '0.0'}%</td>
                    <td className={styles.numberCell}>{formatCurrency(lineTotal)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className={styles.noItems}>No items found for this invoice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.totalSection}>
        <p>Subtotal: <span className={styles.amount}>{formatCurrency(invoice.subtotal)}</span></p>
        <p>CGST ({invoice.cgstRate?.toFixed(1)}%): <span className={styles.amount}>{formatCurrency(invoice.cgstAmount)}</span></p>
        <p>SGST ({invoice.sgstRate?.toFixed(1)}%): <span className={styles.amount}>{formatCurrency(invoice.sgstAmount)}</span></p>
        <p className={styles.grandTotal}>Grand Total: <span className={styles.amount}>{formatCurrency(invoice.grandTotal)}</span></p>
      </div>

      {/* **** UPDATED NAVIGATION PATH for Back button **** */}
      <Button className={styles.backButton} onClick={() => navigate('/app/view-invoices')} variant="secondary">
        Back to Invoices List
      </Button>
    </div>
  );
};

export default ViewInvoiceDetailsPage;