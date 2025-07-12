
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ProductInfoPage.module.css';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { getProductById } from '../../services/productService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ProductInfoPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }
      setLoading(true); // Set loading true before fetch attempt
      setError(null);   // Clear previous errors
      try {
        const data = await getProductById(productId);
        // console.log('Fetched product data:', data); // For debugging
        if (data) { // Check if data is not null/undefined
          setProduct(data);
        } else {
          setError(`Product with ID ${productId} not found.`); // Handle case where API returns null/undefined
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product information');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const handleBackToInventory = () => {
    // **** UPDATED NAVIGATION PATH ****
    navigate('/app/view-inventory');
  };

  if (loading) return <div className={styles.productInfoPage}><Spinner message="Loading product information..." /></div>;
  if (error) return <div className={styles.productInfoPage}><Alert type="error" message={error} /></div>;
  if (!product) return <div className={styles.productInfoPage}><Alert type="warning" message={`Product with ID ${productId} not found or data is invalid.`} /></div>;

  return (
    <div className={styles.productInfoPage}>
      <div className={styles.header}>
        <h1>{product.name}</h1>
        <div className={styles.headerActions}>
          <Button onClick={handleBackToInventory} variant="secondary">Back to Inventory</Button>
          {user?.role === 'admin' && (
            // **** UPDATED NAVIGATION PATH ****
            <Button onClick={() => navigate(`/app/edit-product/${product._id}`)}>
              Edit Product
            </Button>
          )}
        </div>
      </div>

      <div className={styles.productContent}>
        <div className={styles.mainInfo}>
          <div className={styles.infoCard}>
            <h2>Product Details</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>SKU:</span>
                <span className={styles.value}>{product.sku}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Category:</span>
                <span className={styles.value}>{product.category?.name || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Selling Price:</span>
                <span className={styles.value}>{formatCurrency(product.sellingPrice)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Cost Price:</span>
                <span className={styles.value}>{user?.role === 'admin' ? formatCurrency(product.costPrice) : 'Admin Only'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Current Stock:</span>
                <span className={`${styles.value} ${
                  product.currentStock <= 0 ? styles.outOfStock :
                  product.currentStock <= product.lowStockThreshold ? styles.lowStock : ''
                }`}>
                  {product.currentStock}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Low Stock Threshold:</span>
                <span className={styles.value}>{product.lowStockThreshold}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Created At:</span>
                <span className={styles.value}>{formatDate(product.createdAt)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Last Updated:</span>
                <span className={styles.value}>{formatDate(product.updatedAt)}</span>
              </div>
            </div>
          </div>

          {product.description && (
            <div className={styles.infoCard}>
              <h2>Description</h2>
              <p className={styles.description}>{product.description}</p>
            </div>
          )}
        </div>

        <div className={styles.sideInfo}>
          <div className={styles.infoCard}>
            <h2>Inventory Status</h2>
            <div className={`${styles.statusIndicator} ${
              product.currentStock <= 0 ? styles.outOfStockIndicator :
              product.currentStock <= product.lowStockThreshold ? styles.lowStockIndicator :
              styles.inStockIndicator
            }`}>
              {product.currentStock <= 0 ? 'Out of Stock' :
               product.currentStock <= product.lowStockThreshold ? 'Low Stock' :
               'In Stock'}
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className={styles.infoCard}>
              <h2>Admin Actions</h2>
              <div className={styles.adminActions}>
                {/* **** UPDATED NAVIGATION PATH **** */}
                <Button
                  onClick={() => navigate(`/app/edit-product/${product._id}`)}
                  // fullWidth // Assuming fullWidth is a prop for your Button component
                >
                  Edit Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductInfoPage;