// import React, { useState, useEffect } from 'react';
// import styles from './AddProductPage.module.css';
// import InputField from '../../components/InputField/InputField';
// import Button from '../../components/Button/Button';
// import Alert from '../../components/Alert/Alert';
// import Spinner from '../../components/Spinner/Spinner';
// import { createProduct } from '../../services/productService';
// import { getAllCategories } from '../../services/categoryService';
// import { createStockAdjustment } from '../../services/stockAdjustmentService';
// import { useAuth } from '../../hooks/useAuth';

// const AddProductForm = ({ key: categoryUpdateKey }) => {
//   const [sku, setSku] = useState('');
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [selectedCategoryId, setSelectedCategoryId] = useState('');
//   const [costPrice, setCostPrice] = useState('');
//   const [sellingPrice, setSellingPrice] = useState('');
//   const [mrp, setMrp] = useState('');
//   const [discountPercentage, setDiscountPercentage] = useState('');
//   const [currentStock, setCurrentStock] = useState('');
//   const [lowStockThreshold, setLowStockThreshold] = useState('');
//   const [manufactureDate, setManufactureDate] = useState('');
//   const [expiryDate, setExpiryDate] = useState('');
//   const [categoryList, setCategoryList] = useState([]);
//   const [isFetchingCategories, setIsFetchingCategories] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const { user } = useAuth();

//   useEffect(() => {
//     let isMounted = true;
//     const fetchCategories = async () => {
//       setIsFetchingCategories(true);
//       try {
//         const fetchedCategories = await getAllCategories();
//         if (isMounted) {
//           setCategoryList(fetchedCategories || []);
//         }
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//         if (isMounted) setError('Could not load product categories. Please try refreshing or add one via Manage Categories.');
//       } finally {
//         if (isMounted) setIsFetchingCategories(false);
//       }
//     };
//     fetchCategories();
//     return () => { isMounted = false };
//   }, [categoryUpdateKey]);

//   const resetForm = () => {
//     setSku('');
//     setName('');
//     setDescription('');
//     setSelectedCategoryId('');
//     setCostPrice('');
//     setSellingPrice('');
//     setMrp('');
//     setDiscountPercentage('');
//     setCurrentStock('');
//     setLowStockThreshold('');
//     setManufactureDate('');
//     setExpiryDate('');
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError('');
//     setSuccess('');

//     if (!sku || !name || !selectedCategoryId || sellingPrice === '' || currentStock === '') {
//       setError('SKU, Product Name, Category, Selling Price, and Current Stock are required.');
//       return;
//     }
//     if (isNaN(parseFloat(sellingPrice)) || isNaN(parseInt(currentStock, 10))) {
//       setError('Please enter valid numbers for prices and stock.');
//       return;
//     }

//     setLoading(true);
//     const productData = {
//       sku: sku.trim(),
//       name: name.trim(),
//       description: description.trim(),
//       categoryId: selectedCategoryId,
//       costPrice: costPrice !== '' ? parseFloat(costPrice) : undefined,
//       sellingPrice: parseFloat(sellingPrice),
//       mrp: mrp !== '' ? parseFloat(mrp) : undefined,
//       discountPercentage: discountPercentage !== '' ? parseFloat(discountPercentage) : undefined,
//       currentStock: parseInt(currentStock, 10),
//       lowStockThreshold: lowStockThreshold !== '' ? parseInt(lowStockThreshold, 10) : undefined,
//       manufactureDate: manufactureDate || undefined,
//       expiryDate: expiryDate || undefined,
//     };

//     try {
//       const createdProduct = await createProduct(productData);
//       setSuccess(`Product '${createdProduct.name}' added successfully!`);

//       if (createdProduct && createdProduct._id && createdProduct.currentStock > 0 && user?._id) {
//         try {
//           const adjustmentData = {
//             productId: createdProduct._id,
//             quantityChange: createdProduct.currentStock,
//             reason: 'Initial Stock',
//             notes: `Initial stock set during product creation.`
//           };
//           await createStockAdjustment(adjustmentData);
//         } catch (adjError) {
//           console.error(`Non-critical: Failed to create initial stock adjustment for ${createdProduct._id}:`, adjError);
//         }
//       } else if (createdProduct && createdProduct.currentStock > 0 && !user?._id) {
//         console.warn("Could not create initial stock adjustment: User ID not available.");
//       }
//       resetForm();
//     } catch (err) {
//       console.error("Add Product Error:", err);
//       setError(err.response?.data?.message || err.message || 'Failed to add product.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className={styles.addProductForm}>
//       {error && <Alert type="error" message={error} onClose={() => setError('')} />}
//       {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

//       <div className={styles.formGrid}>
//         <InputField label="Product SKU / ID *" id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={loading} />
//         <InputField label="Product Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
//         <div className={`${styles.formGroup} ${styles.gridItem}`}>
//           <label htmlFor="category" className={styles.label}>Category *</label>
//           <select
//             id="category"
//             value={selectedCategoryId}
//             onChange={(e) => setSelectedCategoryId(e.target.value)}
//             required
//             disabled={loading || isFetchingCategories}
//             className={`${styles.inputField} ${styles.selectField}`}
//           >
//             <option value="" disabled>
//               {isFetchingCategories ? 'Loading Categories...' : '-- Select Category --'}
//             </option>
//             {categoryList.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//           {isFetchingCategories && <Spinner size="small" inline={true} />}
//         </div>
//         <InputField label="Description" id="description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} rows={3} />
//         <InputField label="Cost Price (₹)" id="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} disabled={loading} />
//         <InputField label="Selling Price (₹) *" id="sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={loading} />
//         <InputField label="Max Retail Price (MRP ₹)" id="mrp" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={loading} />
//         <InputField label="Discount (%)" id="discountPercentage" type="number" min="0" max="100" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} disabled={loading} placeholder="e.g., 5 or 10.5" />
//         <InputField label="Current Stock (Units) *" id="currentStock" type="number" min="0" step="1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} required disabled={loading} />
//         <InputField label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={loading} placeholder="e.g., 10" />
//         <InputField label="Date of Manufacture" id="manufactureDate" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} disabled={loading} />
//         <InputField label="Expiry Date" id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} disabled={loading} />
//       </div>

//       <div className={styles.submitButtonContainer}>
//         <Button type="submit" disabled={loading || isFetchingCategories} variant="primary" size="large">
//           {loading ? <Spinner size="small" /> : 'Add Product'}
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default AddProductForm;


// // src/pages/AddProductPage/AddProductForm.js
// import React, { useState, useEffect } from 'react';
// import styles from './AddProductPage.module.css'; // Ensure this CSS module exists and is used
// import InputField from '../../components/InputField/InputField'; // Check this path
// import Button from '../../components/Button/Button';         // Check this path
// import Alert from '../../components/Alert/Alert';           // Check this path
// import Spinner from '../../components/Spinner/Spinner';       // Check this path
// // Assuming these services are correctly set up and export functions:
// // import { createProduct } from '../../services/productService';
// // import { getAllCategories } from '../../services/categoryService';
// // import { createStockAdjustment } from '../../services/stockAdjustmentService';
// // import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook is correct

// // Mock services for isolation
// const mockGetAllCategories = async () => {
//   console.log("MOCK: Fetching categories");
//   await new Promise(resolve => setTimeout(resolve, 300));
//   return [{ _id: 'cat1', name: 'Electronics' }, { _id: 'cat2', name: 'Groceries' }];
// };
// const mockCreateProduct = async (productData) => {
//   console.log("MOCK: Creating product", productData);
//   await new Promise(resolve => setTimeout(resolve, 500));
//   return { ...productData, _id: `prod_${Date.now()}` }; // Return a mock product
// };
// const mockCreateStockAdjustment = async (adjData) => {
//     console.log("MOCK: Creating stock adjustment", adjData);
//     await new Promise(resolve => setTimeout(resolve, 200));
//     return { message: "Stock adjustment created (mock)" };
// };


// const AddProductForm = ({ key: categoryUpdateKey }) => { // `key` prop is special to React
//   const [sku, setSku] = useState('');
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [selectedCategoryId, setSelectedCategoryId] = useState('');
//   const [costPrice, setCostPrice] = useState('');
//   const [sellingPrice, setSellingPrice] = useState('');
//   const [mrp, setMrp] = useState('');
//   const [discountPercentage, setDiscountPercentage] = useState('');
//   const [currentStock, setCurrentStock] = useState('');
//   const [lowStockThreshold, setLowStockThreshold] = useState('');
//   const [manufactureDate, setManufactureDate] = useState('');
//   const [expiryDate, setExpiryDate] = useState('');
//   const [categoryList, setCategoryList] = useState([]);
//   const [isFetchingCategories, setIsFetchingCategories] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   // const { user } = useAuth(); // Temporarily comment out if useAuth could be an issue

//   useEffect(() => {
//     let isMounted = true;
//     const fetchCategories = async () => {
//       setIsFetchingCategories(true);
//       try {
//         // const fetchedCategories = await getAllCategories(); // Real call
//         const fetchedCategories = await mockGetAllCategories(); // Mock call
//         if (isMounted) {
//           setCategoryList(fetchedCategories || []);
//         }
//       } catch (err) {
//         console.error("Error fetching categories:", err);
//         if (isMounted) setError('Could not load product categories.');
//       } finally {
//         if (isMounted) setIsFetchingCategories(false);
//       }
//     };
//     fetchCategories();
//     return () => { isMounted = false; };
//   }, [categoryUpdateKey]); // categoryUpdateKey from props

//   const resetForm = () => { /* ... keep this function as is ... */ };
//   // ... (keep resetForm logic)
//     setSku(''); setName(''); setDescription(''); setSelectedCategoryId('');
//     setCostPrice(''); setSellingPrice(''); setMrp(''); setDiscountPercentage('');
//     setCurrentStock(''); setLowStockThreshold(''); setManufactureDate(''); setExpiryDate('');

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError(''); setSuccess('');
//     if (!sku || !name || !selectedCategoryId || sellingPrice === '' || currentStock === '') {
//       setError('SKU, Name, Category, Selling Price, and Current Stock are required.'); return;
//     }
//     setLoading(true);
//     const productData = { sku, name, description, categoryId: selectedCategoryId, costPrice: costPrice ? parseFloat(costPrice) : undefined, sellingPrice: parseFloat(sellingPrice), mrp: mrp ? parseFloat(mrp) : undefined, discountPercentage: discountPercentage ? parseFloat(discountPercentage) : undefined, currentStock: parseInt(currentStock, 10), lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : undefined, manufactureDate: manufactureDate || undefined, expiryDate: expiryDate || undefined };
//     try {
//       // const createdProduct = await createProduct(productData); // Real call
//       const createdProduct = await mockCreateProduct(productData); // Mock call
//       setSuccess(`Product '${createdProduct.name}' added successfully!`);
//       if (createdProduct && createdProduct._id && createdProduct.currentStock > 0 /*&& user?._id*/) {
//         try {
//           const adjustmentData = { productId: createdProduct._id, quantityChange: createdProduct.currentStock, reason: 'Initial Stock' };
//           // await createStockAdjustment(adjustmentData); // Real call
//           await mockCreateStockAdjustment(adjustmentData); // Mock call
//         } catch (adjError) { console.error(`Mock: Failed stock adj:`, adjError); }
//       }
//       resetForm();
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || 'Failed to add product.');
//     } finally { setLoading(false); }
//   };

//   return (
//     <form onSubmit={handleSubmit} className={styles.addProductForm}>
//       {error && <Alert type="error" message={error} onClose={() => setError('')} />}
//       {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
//       <div className={styles.formGrid}>
//         <InputField label="Product SKU / ID *" id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={loading} />
//         <InputField label="Product Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
//         <div className={styles.formGroup}> {/* Using page's formGroup for select */}
//           <label htmlFor="category" className={styles.label}>Category *</label>
//           <select id="category" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} required disabled={loading || isFetchingCategories} className={styles.selectField}>
//             <option value="" disabled>{isFetchingCategories ? 'Loading...' : '-- Select --'}</option>
//             {categoryList.map((cat) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
//           </select>
//           {isFetchingCategories && <Spinner size="small" inline={true} />}
//         </div>
//         <InputField label="Description" id="description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} rows={3} />
//         <InputField label="Cost Price (₹)" id="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} disabled={loading} />
//         <InputField label="Selling Price (₹) *" id="sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={loading} />
//         <InputField label="MRP (₹)" id="mrp" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={loading} />
//         <InputField label="Discount (%)" id="discountPercentage" type="number" min="0" max="100" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} disabled={loading} />
//         <InputField label="Current Stock *" id="currentStock" type="number" min="0" step="1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} required disabled={loading} />
//         <InputField label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={loading} />
//         <InputField label="Manufacture Date" id="manufactureDate" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} disabled={loading} />
//         <InputField label="Expiry Date" id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} disabled={loading} />
//       </div>
//       <div className={styles.submitButtonContainer}>
//         <Button type="submit" disabled={loading || isFetchingCategories} variant="primary" size="large">
//           {loading ? <Spinner size="small" /> : 'Add Product'}
//         </Button>
//       </div>
//     </form>
//   );
// };

// export default AddProductForm;


// src/pages/AddProductPage/AddProductForm.js
import React, { useState, useEffect } from 'react';
import styles from './AddProductPage.module.css';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
// import { createProduct } from '../../services/productService';
// import { getAllCategories } from '../../services/categoryService';
// import { createStockAdjustment } from '../../services/stockAdjustmentService';
// import { useAuth } from '../../hooks/useAuth';

// Mock services for isolation
const mockGetAllCategories = async () => {
  console.log("MOCK (AddProductForm): Fetching categories");
  await new Promise(resolve => setTimeout(resolve, 300));
  return [{ _id: 'cat1', name: 'Electronics' }, { _id: 'cat2', name: 'Groceries' }, { _id: 'cat3', name: 'Books' }];
};
const mockCreateProduct = async (productData) => {
  console.log("MOCK (AddProductForm): Creating product", productData);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...productData, _id: `prod_${Date.now()}`, name: productData.name }; // Ensure name is returned
};
const mockCreateStockAdjustment = async (adjData) => {
  console.log("MOCK (AddProductForm): Creating stock adjustment", adjData);
  await new Promise(resolve => setTimeout(resolve, 200));
  return { message: "Stock adjustment created (mock)" };
};


// Accept categoryVersion as a prop
const AddProductForm = ({ categoryVersion }) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [categoryList, setCategoryList] = useState([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [loading, setLoading] = useState(false); // For form submission
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const { user } = useAuth(); // Keep commented for now if it was causing issues

  useEffect(() => {
    let isMounted = true;
    console.log("AddProductForm: Fetching categories effect - categoryVersion:", categoryVersion);
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      setError(''); // Clear previous errors
      try {
        const fetchedCategories = await mockGetAllCategories();
        if (isMounted) {
          setCategoryList(fetchedCategories || []);
        }
      } catch (err) {
        console.error("Error fetching categories in AddProductForm:", err);
        if (isMounted) setError('Could not load product categories. Please try adding one via "Manage Categories".');
      } finally {
        if (isMounted) setIsFetchingCategories(false);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, [categoryVersion]); // Use the new prop here

  const resetForm = () => {
    setSku(''); setName(''); setDescription(''); setSelectedCategoryId('');
    setCostPrice(''); setSellingPrice(''); setMrp(''); setDiscountPercentage('');
    setCurrentStock(''); setLowStockThreshold(''); setManufactureDate(''); setExpiryDate('');
    // Error and success messages are cleared before new submission or on their own onClose
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); setSuccess('');

    if (!sku || !name || !selectedCategoryId || sellingPrice === '' || currentStock === '') {
      setError('SKU, Product Name, Category, Selling Price, and Current Stock are required.');
      return;
    }
    if (isNaN(parseFloat(sellingPrice)) || isNaN(parseInt(currentStock, 10))) {
      setError('Please enter valid numbers for prices and stock.');
      return;
    }

    setLoading(true);
    const productData = {
      sku: sku.trim(), name: name.trim(), description: description.trim(),
      categoryId: selectedCategoryId,
      costPrice: costPrice !== '' ? parseFloat(costPrice) : undefined,
      sellingPrice: parseFloat(sellingPrice),
      mrp: mrp !== '' ? parseFloat(mrp) : undefined,
      discountPercentage: discountPercentage !== '' ? parseFloat(discountPercentage) : undefined,
      currentStock: parseInt(currentStock, 10),
      lowStockThreshold: lowStockThreshold !== '' ? parseInt(lowStockThreshold, 10) : undefined,
      manufactureDate: manufactureDate || undefined,
      expiryDate: expiryDate || undefined,
    };

    try {
      const createdProduct = await mockCreateProduct(productData);
      setSuccess(`Product '${createdProduct.name}' added successfully!`);

      if (createdProduct && createdProduct._id && createdProduct.currentStock > 0 /*&& user?._id*/) {
        try {
          const adjustmentData = {
            productId: createdProduct._id,
            quantityChange: createdProduct.currentStock,
            reason: 'Initial Stock',
            notes: `Initial stock set during product creation.`
          };
          await mockCreateStockAdjustment(adjustmentData);
        } catch (adjError) {
          console.error(`Mock: Failed to create initial stock adjustment for ${createdProduct._id}:`, adjError);
        }
      }
      resetForm();
    } catch (err) {
      console.error("Add Product Error:", err);
      setError(err.response?.data?.message || err.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addProductForm}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className={styles.formGrid}>
        <InputField label="Product SKU / ID *" id="sku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} required disabled={loading} />
        <InputField label="Product Name *" id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>Category *</label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            required
            disabled={loading || isFetchingCategories}
            className={styles.selectField} // Use specific class from AddProductPage.module.css
          >
            <option value="" disabled>
              {isFetchingCategories ? 'Loading Categories...' : '-- Select Category --'}
            </option>
            {categoryList.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {isFetchingCategories && <Spinner size="small" inline={true} />}
        </div>
        <InputField label="Description" id="description" type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} rows={3} />
        <InputField label="Cost Price (₹)" id="costPrice" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} disabled={loading} />
        <InputField label="Selling Price (₹) *" id="sellingPrice" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required disabled={loading} />
        <InputField label="Max Retail Price (MRP ₹)" id="mrp" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} disabled={loading} />
        <InputField label="Discount (%)" id="discountPercentage" type="number" min="0" max="100" step="0.01" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} disabled={loading} placeholder="e.g., 5 or 10.5" />
        <InputField label="Current Stock (Units) *" id="currentStock" type="number" min="0" step="1" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} required disabled={loading} />
        <InputField label="Low Stock Threshold" id="lowStockThreshold" type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} disabled={loading} placeholder="e.g., 10" />
        <InputField label="Date of Manufacture" id="manufactureDate" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} disabled={loading} />
        <InputField label="Expiry Date" id="expiryDate" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} disabled={loading} />
      </div>

      <div className={styles.submitButtonContainer}>
        <Button type="submit" disabled={loading || isFetchingCategories} variant="primary" size="large">
          {loading ? <Spinner size="small" /> : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default AddProductForm;