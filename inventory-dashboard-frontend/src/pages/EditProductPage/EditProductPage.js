import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditProductPage.module.css';
import EditProductForm from './EditProductForm';
import { getProductById } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';

const EditProductPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!productId) {
        setError("No product ID specified.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [productData, categoriesData] = await Promise.all([
          getProductById(productId),
          getAllCategories()
        ]);

        if (isMounted) {
          if (productData) {
            setProduct(productData);
          } else {
            setError(`Product with ID ${productId} not found.`);
          }
          setCategories(categoriesData || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching data for edit page:', err);
          setError(err.response?.data?.message || 'Failed to load product details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [productId]);

  if (loading) {
    return (
      <div className={styles.editProductPage}>
        <h2>Edit Product</h2>
        <Spinner message="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.editProductPage}>
        <h2>Edit Product</h2>
        <Alert type="error" message={error || `Product with ID ${productId} not found.`} />
        {/* **** UPDATED NAVIGATION PATH for Back to Inventory button **** */}
        <Button onClick={() => navigate('/app/view-inventory')} variant="secondary" style={{ marginTop: '1rem' }}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.editProductPage}>
      <EditProductForm productToEdit={product} categoryList={categories} />
    </div>
  );
};

export default EditProductPage;