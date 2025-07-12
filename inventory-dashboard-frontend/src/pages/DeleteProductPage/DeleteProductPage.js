import React, { useState, useEffect, useCallback } from 'react';
import styles from './DeleteProductPage.module.css';
import { searchProducts, deleteProduct } from '../../services/productService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Modal from '../../components/Modal/Modal';
import Spinner from '../../components/Spinner/Spinner';

const DeleteProductPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const results = await searchProducts(searchTerm.trim());
      setProducts(results || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.response?.data?.message || "Failed to search products.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const handler = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => {
        clearTimeout(handler);
      };
    } else {
      setProducts([]);
    }
  }, [searchTerm, handleSearch]);

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    setError('');
    setSuccess('');
    try {
      const response = await deleteProduct(selectedProduct._id);
      setSuccess(response.message || `Successfully deleted product: ${selectedProduct.name}`);
      setSelectedProduct(null);
      setShowConfirmModal(false);
      handleSearch(); // Re-run search to refresh the list
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || `Failed to delete product: ${err.message || 'Server error'}`);
      setShowConfirmModal(false); // Close modal on error
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    if (isDeleting) return;
    setShowConfirmModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className={styles.deleteProductContainer}>
      <h2>Delete Product</h2>
      <p>Search for the product you want to permanently delete. Note: Products used in invoices cannot be deleted.</p>

      <div className={styles.searchSection}>
        <InputField
          type="text"
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading || isDeleting}
        />
        {isLoading && <Spinner size="small" />}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className={styles.resultsContainer}>
        {!isLoading && products.length > 0 && (
          <ul className={styles.productList}>
            {products.map(product => (
              <li key={product._id} className={styles.productItem}>
                <span>{product.name} (SKU: {product.sku}) - Stock: {product.currentStock ?? 'N/A'}</span>
                <Button
                  onClick={() => handleDeleteClick(product)}
                  variant="danger"
                  size="small"
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
        {!isLoading && searchTerm.trim().length > 1 && products.length === 0 && (
          <p>No products found matching "{searchTerm}".</p>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={closeModal}
        title="Confirm Deletion"
      >
        {selectedProduct && (
          <>
            <p>Are you sure you want to permanently delete the product: <strong>{selectedProduct.name}</strong> (SKU: {selectedProduct.sku})?</p>
            <p>This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button onClick={closeModal} disabled={isDeleting} variant="secondary">
                Cancel
              </Button>
              <Button onClick={confirmDelete} disabled={isDeleting} variant="danger">
                {isDeleting ? <Spinner size="small" /> : 'Confirm Delete'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default DeleteProductPage;