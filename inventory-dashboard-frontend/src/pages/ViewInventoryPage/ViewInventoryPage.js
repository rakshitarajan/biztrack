import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import Table from '../../components/Table/Table';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { getAllProducts, deleteProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import styles from './ViewInventoryPage.module.css';
import { formatCurrency } from '../../utils/helpers';

const ViewInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadingCategories(true);
    setError(null);
    setActionError(null);
    setActionSuccess(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      if (Array.isArray(productsData)) setProducts(productsData);
      else throw new Error('Invalid product data');
      if (Array.isArray(categoriesData))
        setCategories([{ _id: 'All', name: 'All Categories' }, ...categoriesData]);
      else setCategories([{ _id: 'All', name: 'All Categories' }]);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load data.';
      setError(message);
      setProducts([]);
      setCategories([{ _id: 'All', name: 'All Categories' }]);
    } finally {
      setLoading(false);
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    if (!searchTerm.trim() && selectedCategoryId === 'All') return products;
    return products.filter((p) => {
      if (!p) return false;
      const catMatch = selectedCategoryId === 'All' || p.category?._id === selectedCategoryId;
      const searchMatch =
        !searchTerm.trim() ||
        (p.name?.toLowerCase().includes(lowerTerm)) ||
        (p.sku?.toLowerCase().includes(lowerTerm)) ||
        (p.category?.name?.toLowerCase().includes(lowerTerm));
      return catMatch && searchMatch;
    });
  }, [products, searchTerm, selectedCategoryId]);

  const handleEdit = useCallback((productId) => {
    // **** UPDATED NAVIGATION PATH ****
    navigate(`/app/edit-product/${productId}`);
  }, [navigate]);

  const handleDelete = useCallback(async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete product "${productName}"?`)) {
      setActionError(null);
      setActionSuccess('');
      try {
        const response = await deleteProduct(productId);
        setActionSuccess(response.message || `Product "${productName}" deleted successfully.`);
        fetchData(); // Refresh data
      } catch (err) {
        setActionError(err.response?.data?.message || 'Could not delete product.');
      }
    }
  }, [fetchData]);

  const productColumns = useMemo(() => [
    { header: 'SKU', key: 'sku' },
    { header: 'Name', key: 'name' },
    { header: 'Category', key: 'category', render: (p) => p.category?.name || 'N/A' },
    { header: 'Selling Price', key: 'sellingPrice', format: (v) => formatCurrency(v) },
    {
      header: 'Stock',
      key: 'currentStock',
      render: (p) => (
        <span className={p.currentStock <= 0 ? styles.outOfStock : p.currentStock <= p.lowStockThreshold ? styles.lowStock : ''}>
          {p.currentStock ?? 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (product) => (
        <div className={styles.actionButtonsContainer}>
          {/* **** UPDATED LINK PATH **** */}
          <Link to={`/app/products/${product._id}`} className={`${styles.actionButton} ${styles.infoButton}`} title="View Details">
            Info
          </Link>
          <Button size="small" onClick={() => handleEdit(product._id)} title="Edit Product">
            Edit
          </Button>
          <Button size="small" variant="danger" onClick={() => handleDelete(product._id, product.name)} title="Delete Product">
            Delete
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]); // Dependencies for useMemo

  if (loading) return <div className={styles.viewInventoryPage}><h2>View Inventory</h2><Spinner message="Loading inventory..." /></div>;
  if (error) return <div className={styles.viewInventoryPage}><h2>View Inventory</h2><Alert type="error" message={error} /></div>;

  return (
    <div className={styles.viewInventoryPage}>
      <h2>View Inventory</h2>
      {actionError && <Alert type="error" message={actionError} onClose={() => setActionError(null)} />}
      {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="categoryFilter">Filter by Category:</label>
          <select id="categoryFilter" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} disabled={loadingCategories} className={styles.categorySelect}>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {loadingCategories && <Spinner size="small" inline={true} />}
        </div>
        <div className={styles.searchFilterGroup}>
          <SearchBar onSearch={setSearchTerm} placeholder="Search by SKU, name, category..." />
        </div>
      </div>

      <Table columns={productColumns} data={filteredProducts} />

      {!loading && filteredProducts.length === 0 && (searchTerm.trim() || selectedCategoryId !== 'All') && (
        <p className={styles.noResults}>No products found matching filters.</p>
      )}
      {!loading && products.length === 0 && !error && (
        <p className={styles.noResults}>Your inventory is currently empty.</p>
      )}
    </div>
  );
};

export default ViewInventoryPage;