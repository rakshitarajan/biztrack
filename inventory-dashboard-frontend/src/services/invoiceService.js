// src/services/invoiceService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  // Log a warning if token is missing, helps debugging auth issues
  if (!token) {
      console.warn("Auth token not found in localStorage for invoice service request.");
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Creates a new invoice.
 * @param {object} invoiceData - { customerName, customerPhone?, items: [{ product: productId, quantity }] }
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error.response?.data || error.message);
    throw error; // Re-throw for component handling
  }
};

/**
 * Fetches all invoices.
 */
export const getAllInvoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/invoices`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error fetching all invoices:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches a single invoice by its ID.
 * @param {string} invoiceId - The MongoDB ObjectId of the invoice.
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${invoiceId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Downloads the PDF for a specific invoice.
 * @param {string} invoiceId - The ID of the invoice.
 */
export const downloadInvoicePDF = async (invoiceId) => { // *** ENSURE THIS IS EXPORTED ***
   try {
     const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}/pdf`, {
       headers: getAuthHeaders(),
       responseType: 'blob', // Important for file download
     });

     const file = new Blob(
       [response.data],
       { type: 'application/pdf' }
     );
     const fileURL = URL.createObjectURL(file);
     const link = document.createElement('a');
     link.href = fileURL;

     const contentDisposition = response.headers['content-disposition'];
     let fileName = `invoice_${invoiceId}.pdf`; // Default filename
     if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch.length === 2) {
            fileName = filenameMatch[1];
        }
     }
     link.setAttribute('download', fileName);
     document.body.appendChild(link);
     link.click();
     link.parentNode.removeChild(link);
     URL.revokeObjectURL(fileURL); // Clean up URL object

   } catch (error) {
     console.error(`Error downloading PDF for invoice ${invoiceId}:`, error.response?.data || error.message);
     // Provide user feedback (alert is simple, better UI is possible)
     if (error.response?.status === 404) {
         alert('Invoice not found. Could not download PDF.');
     } else {
         alert('Failed to download invoice PDF. See console for details.');
     }
     // Do not re-throw usually, as the alert gives feedback
   }
};

// Make sure only functions intended for export are exported
// Example: If generateNewInvoice was old name, remove its export if not used
// export { createInvoice, getAllInvoices, getInvoiceById, downloadInvoicePDF }; // Alternative export style