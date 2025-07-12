import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GenerateInvoicePage.module.css';
import ProductSelector from './ProductSelector';
import { createInvoice } from '../../services/invoiceService';
import { getAllProducts } from '../../services/productService';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';
import InputField from '../../components/InputField/InputField';

const GenerateInvoiceForm = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [taxes, setTaxes] = useState({ cgst: 0, sgst: 0 });
  const [grandTotal, setGrandTotal] = useState(0);
  const [error, setError] = useState('');
  const [productLoadError, setProductLoadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();
  const TAX_RATE = { cgst: 2.5, sgst: 2.5 };

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductLoadError('');
      try {
        const data = await getAllProducts();
        if (isMounted) {
          if (Array.isArray(data)) {
            setAllProducts(data);
          } else {
            console.error("Received non-array product data:", data);
            setProductLoadError('Failed to load product list: Invalid format.');
          }
        }
      } catch (err) {
        console.error('Error fetching products for invoice:', err);
        if (isMounted) setProductLoadError('Failed to load product list.');
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  const calculateTotals = useCallback(() => {
    let currentSubtotal = 0;
    cartItems.forEach(item => {
      const price = item.product.sellingPrice || 0;
      const discount = item.product.discountPercentage || 0;
      const lineTotal = price * item.quantity * (1 - discount / 100);
      currentSubtotal += lineTotal;
    });
    const cgst = currentSubtotal * (TAX_RATE.cgst / 100);
    const sgst = currentSubtotal * (TAX_RATE.sgst / 100);
    const currentGrandTotal = currentSubtotal + cgst + sgst;
    setSubtotal(currentSubtotal);
    setTaxes({ cgst, sgst });
    setGrandTotal(currentGrandTotal);
  }, [cartItems, TAX_RATE.cgst, TAX_RATE.sgst]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const handleProductSelect = (productId) => {
    setError('');
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    const alreadySelected = cartItems.some(item => item.product._id === productId);
    if (!alreadySelected) {
      if (product.currentStock < 1) {
        setError(`Product "${product.name}" is out of stock.`);
        return;
      }
      setCartItems([...cartItems, {
        product: {
          _id: product._id, name: product.name, sku: product.sku,
          sellingPrice: product.sellingPrice, currentStock: product.currentStock,
          discountPercentage: product.discountPercentage
        },
        quantity: 1
      }]);
    } else {
      setError(`Product "${product.name}" is already added. Adjust quantity below.`);
    }
  };

  const handleQuantityChange = (productId, quantityStr) => {
    setError('');
    const quantity = parseInt(quantityStr, 10);
    const currentItem = cartItems.find(item => item.product._id === productId);
    if (!currentItem) return;
    const stockLimit = currentItem.product.currentStock;
    if (isNaN(quantity) || quantity < 1) {
      handleRemoveProduct(productId);
      return;
    }
    if (quantity > stockLimit) {
      setError(`Quantity for "${currentItem.product.name}" cannot exceed stock (${stockLimit}). Setting to max.`);
      setCartItems(prev =>
        prev.map(item => (item.product._id === productId ? { ...item, quantity: stockLimit } : item))
      );
    } else {
      setCartItems(prev =>
        prev.map(item => (item.product._id === productId ? { ...item, quantity: quantity } : item))
      );
    }
  };

  const handleRemoveProduct = (productId) => {
    setError('');
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    if (cartItems.length === 0) {
      setError('Please add at least one product to the invoice.');
      return;
    }
    if (!customerName.trim()) {
      setError('Please enter the customer name.');
      return;
    }
    setLoading(true);
    const invoiceData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      items: cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await createInvoice(invoiceData);
      if (response && response._id && response.invoiceNumber) {
        setSuccessMessage(`Invoice ${response.invoiceNumber} generated successfully!`);
        setCartItems([]);
        setCustomerName('');
        setCustomerPhone('');
        setSubtotal(0); setTaxes({ cgst: 0, sgst: 0 }); setGrandTotal(0);
        // **** UPDATED POTENTIAL NAVIGATION PATH ****
        // If you decide to navigate, it should be to the /app prefixed route:
        // setTimeout(() => navigate(`/app/invoices/${response._id}`), 1500); 
      } else {
        setError(response?.message || 'Failed to generate invoice. Unexpected server response.');
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.generateInvoiceForm}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {productLoadError && <Alert type="error" message={productLoadError} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

      <fieldset className={styles.fieldset}>
        <legend>Customer Information</legend>
        <div className={styles.customerDetails}>
          <InputField label="Customer Name *" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required disabled={loading} />
          <InputField label="Customer Phone" id="customerPhone" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={loading} />
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Add Products</legend>
        {loadingProducts ? (
          <Spinner message="Loading products..." />
        ) : productLoadError ? (
          <Alert type="warning" message={productLoadError} />
        ) : (
          <ProductSelector
            products={allProducts}
            onSelect={handleProductSelect}
            selectedProducts={cartItems.map(item => item.product._id)}
          />
        )}
      </fieldset>

      {cartItems.length > 0 && (
        <fieldset className={`${styles.fieldset} ${styles.selectedProducts}`}>
          <legend>Invoice Items</legend>
          <ul className={styles.itemList}>
            {cartItems.map(({ product, quantity }) => (
              <li key={product._id} className={styles.itemEntry}>
                <div className={styles.itemName}>
                  {product.name} <span className={styles.itemSku}>(SKU: {product.sku})</span>
                  <div className={styles.itemPriceInfo}>
                    @ {formatCurrency(product.sellingPrice)}
                    {product.discountPercentage > 0 && <span className={styles.itemDiscount}> ({product.discountPercentage}% off)</span>}
                  </div>
                </div>
                <div className={styles.itemControls}>
                  <label htmlFor={`quantity-${product._id}`} className={styles.quantityLabel}>Qty:</label>
                  <input
                    id={`quantity-${product._id}`}
                    type="number"
                    min="1"
                    max={product.currentStock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                    className={styles.quantityInput}
                    aria-label={`Quantity for ${product.name}`}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveProduct(product._id)}
                    variant="danger"
                    size="small"
                    title={`Remove ${product.name}`}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.totalsSection}>
            <p>Subtotal: <span className={styles.amount}>{formatCurrency(subtotal)}</span></p>
            <p>CGST ({TAX_RATE.cgst}%): <span className={styles.amount}>{formatCurrency(taxes.cgst)}</span></p>
            <p>SGST ({TAX_RATE.sgst}%): <span className={styles.amount}>{formatCurrency(taxes.sgst)}</span></p>
            <p className={styles.grandTotal}>Grand Total: <span className={styles.amount}>{formatCurrency(grandTotal)}</span></p>
          </div>
        </fieldset>
      )}

      <div className={styles.submitButtonContainer}>
        <Button
          type="submit"
          disabled={loading || loadingProducts || cartItems.length === 0}
          variant="primary"
          size="large"
        >
          {loading ? <Spinner size="small" /> : 'Generate Invoice'}
        </Button>
      </div>
    </form>
  );
};

export default GenerateInvoiceForm;