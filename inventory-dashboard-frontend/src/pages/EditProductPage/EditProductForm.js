import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditProductPage.module.css';
import { updateProduct } from '../../services/productService';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';

const EditProductForm = ({ productToEdit, categoryList = [] }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [currentStockDisplay, setCurrentStockDisplay] = useState('N/A');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const productId = productToEdit?._id;

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setSku(productToEdit.sku || '');
      setDescription(productToEdit.description || '');
      setSelectedCategoryId(productToEdit.category?._id || '');
      setCostPrice(productToEdit.costPrice != null ? String(productToEdit.costPrice) : '');
      setSellingPrice(productToEdit.sellingPrice != null ? String(productToEdit.sellingPrice) : '');
      setMrp(productToEdit.mrp != null ? String(productToEdit.mrp) : '');
      setCurrentStockDisplay(productToEdit.currentStock != null ? String(productToEdit.currentStock) : 'N/A');
      setLowStockThreshold(productToEdit.lowStockThreshold != null ? String(productToEdit.lowStockThreshold) : '');
      setDiscountPercentage(productToEdit.discountPercentage != null ? String(productToEdit.discountPercentage) : '');
    }
  }, [productToEdit]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!productId) {
      setError("Cannot update product without a valid ID.");
      return;
    }
    if (!name || !sku || !selectedCategoryId || sellingPrice === '') {
      setError('SKU, Product Name, Category, and Selling Price are required.');
      return;
    }
    if (isNaN(parseFloat(sellingPrice))) {
      setError('Please enter a valid number for Selling Price.');
      return;
    }

    setSubmitting(true);
    const productData = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim(),
      categoryId: selectedCategoryId,
      costPrice: costPrice !== '' ? parseFloat(costPrice) : undefined,
      sellingPrice: parseFloat(sellingPrice),
      mrp: mrp !== '' ? parseFloat(mrp) : undefined,
      discountPercentage: discountPercentage !== '' ? parseFloat(discountPercentage) : undefined,
      lowStockThreshold: lowStockThreshold !== '' ? parseInt(lowStockThreshold, 10) : undefined,
    };

    try {
      const response = await updateProduct(productId, productData);
      setSuccessMessage(`Product '${response.name}' updated successfully!`);
      setError('');
      // Optionally navigate after success
      // setTimeout(() => {
      //     // **** POTENTIAL NAVIGATION PATH TO UPDATE ****
      //     navigate('/app/view-inventory'); 
      // }, 1500);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
      setSuccessMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  if (!productToEdit) {
    return <Alert type="error" message="Product data not available." />;
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.editProductForm}>
        <h2>Edit Product: {productToEdit?.name}</h2>
        {error && !submitting && <Alert type="error" message={error} onClose={() => setError('')} />}
        {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

        <InputField label="Current Stock (Read-Only)" id="currentStockDisplay" type="text" value={currentStockDisplay} readOnly disabled helpText="Use Stock Adjustment features to change stock levels." />
        <InputField label="SKU *" id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={submitting} />
        <InputField label="Product Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={submitting} />
        <InputField label="Description" id="description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={submitting} rows={3} />

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>Category *</label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
            disabled={submitting || categoryList.length === 0}
            className={styles.selectField}
          >
            <option value="" disabled>
              {categoryList.length === 0 ? "Loading Categories..." : "Select a Category"}
            </option>
            {categoryList.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categoryList.length === 0 && !productToEdit && <small>No categories found.</small>}
        </div>

        <InputField label="Cost Price (₹)" id="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} disabled={submitting} />
        <InputField label="Selling Price (₹) *" id="sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={submitting} />
        <InputField label="MRP (₹)" id="mrp" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={submitting} />
        <InputField label="Discount (%)" id="discountPercentage" type="number" min="0" max="100" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} disabled={submitting} placeholder="e.g., 5 or 10.5" />
        <InputField label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={submitting} placeholder="e.g., 10" />

        <div className={styles.buttonGroup}>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner size="small" /> : 'Update Product'}
          </Button>
          {/* **** UPDATED NAVIGATION PATH for Cancel button **** */}
          <Button type="button" onClick={() => navigate('/app/view-inventory')} variant="secondary" disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProductForm;