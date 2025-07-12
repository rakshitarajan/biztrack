import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './StockPredictionPage.module.css';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getLowStockPrediction } from '../../services/analyticsService';
import { formatDate } from '../../utils/helpers'; // formatCurrency is not used here

const StockPredictionPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [predictingProductId, setPredictingProductId] = useState(null);
  const [predictionResult, setPredictionResult] = useState({ message: 'Select a product using the "Predict" button to see its low stock forecast.', data: null, error: false });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    setPredictionResult({ message: 'Select a product...', data: null, error: false });
    try {
      const [productsData, categoriesData] = await Promise.all([getAllProducts(), getAllCategories()]);
      if (Array.isArray(productsData)) setProducts(productsData); else throw new Error('Invalid product data');
      if (Array.isArray(categoriesData)) setCategories([{ _id: 'All', name: 'All Categories' }, ...categoriesData]); else setCategories([{ _id: 'All', name: 'All Categories' }]);
    } catch (err) {
      console.error('Error fetching data for prediction page:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load initial data.');
      setProducts([]);
      setCategories([{ _id: 'All', name: 'All Categories' }]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return products.filter(product => {
      if (!product) return false;
      const categoryFilterMatch = selectedCategoryId === 'All' || product.category?._id === selectedCategoryId;
      const searchFilterMatch = !searchTerm.trim() || ( // Added .trim() to searchTerm check
        (product.name && product.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.sku && product.sku.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.category?.name && product.category.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.currentStock != null && product.currentStock.toString().includes(lowerCaseSearchTerm)) ||
        (product._id && product._id.toLowerCase().includes(lowerCaseSearchTerm))
      );
      return categoryFilterMatch && searchFilterMatch;
    });
  }, [products, searchTerm, selectedCategoryId]);

  const handleGetPrediction = useCallback(async (productId, productName) => {
    setPredictingProductId(productId);
    setPredictionResult({ message: `Predicting for ${productName}...`, data: null, error: false });
    try {
      const result = await getLowStockPrediction(productId);
      setPredictionResult({ message: result.message, data: result, error: false });
    } catch (err) {
      console.error(`Error getting prediction for ${productId}:`, err);
      const errorMsg = err.response?.data?.message || err.message || 'Prediction failed.';
      setPredictionResult({ message: `Could not get prediction for ${productName}: ${errorMsg}`, data: null, error: true });
    } finally {
      setPredictingProductId(null);
    }
  }, []);

  const productColumns = useMemo(() => [
    { header: 'SKU', key: 'sku' },
    { header: 'Name', key: 'name' },
    { header: 'Category', key: 'category', render: (p) => p.category?.name || 'N/A' },
    { header: 'Stock', key: 'currentStock', render: (p) => (<span className={p.currentStock <= 0 ? styles.outOfStock : p.currentStock <= p.lowStockThreshold ? styles.lowStock : ''}> {p.currentStock ?? 'N/A'} </span>) },
    { header: 'Threshold', key: 'lowStockThreshold' },
    {
      header: 'Prediction',
      key: 'prediction',
      render: (p) => {
        const isLoadingThis = predictingProductId === p._id;
        const canPredict = p.currentStock > p.lowStockThreshold && p.currentStock > 0;
        return (
          <div className={styles.actionButtonsContainer}>
            <Button size="small" variant="secondary" onClick={() => handleGetPrediction(p._id, p.name)} disabled={isLoadingThis || !canPredict} title={!canPredict ? (p.currentStock <= 0 ? "Out of stock" : "At or below threshold") : "Predict Low Stock Date"} >
              {isLoadingThis ? <Spinner size="tiny" inline={true} /> : 'Predict'}
            </Button>
          </div>
        );
      },
    },
  ], [predictingProductId, handleGetPrediction]);

  if (loadingData && products.length === 0) return <div className={styles.stockPredictionPage}><h2>Stock Prediction</h2><Spinner message="Loading products..." /></div>;
  if (error && products.length === 0) return <div className={styles.stockPredictionPage}><h2>Stock Prediction</h2><Alert type="error" message={error} /></div>;

  return (
    <div className={styles.stockPredictionPage}>
      <h2>Stock Prediction</h2>
      <p>Select a product from the list to predict when its stock might reach the low threshold based on recent sales data (typically last 30 days).</p>

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} disabled={loadingData} className={styles.categorySelect}>
            {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
          </select>
        </div>
        <div className={styles.searchFilterGroup}>
          <SearchBar onSearch={setSearchTerm} placeholder="Search by SKU, name, category..." />
        </div>
      </div>

      <div className={`${styles.predictionResultArea} ${predictionResult.error ? styles.predictionError : ''}`}>
        {predictionResult.message ? (
          <span className={predictionResult.data && !predictionResult.error ? styles.predictionMessage : ''}> {/* Added !predictionResult.error for correct styling */}
            {predictionResult.message}
            {predictionResult.data?.predictionDate && !predictionResult.error &&
              <span> (approx. <strong>{formatDate(predictionResult.data.predictionDate)}</strong>)</span>}
          </span>
        ) : "Select a product to predict."}
      </div>

      <section className={styles.resultsSection}>
        <h3>Products</h3>
        {loadingData && products.length > 0 && <Spinner message="Refreshing products..." />}
        <Table columns={productColumns} data={filteredProducts} />
        {!loadingData && filteredProducts.length === 0 && (searchTerm.trim() || selectedCategoryId !== 'All') && (<p className={styles.noResults}>No products found matching filters.</p>)} {/* Added .trim() */}
        {!loadingData && products.length === 0 && !error && (<p className={styles.noResults}>No products found in inventory.</p>)}
      </section>
    </div>
  );
};

export default StockPredictionPage;