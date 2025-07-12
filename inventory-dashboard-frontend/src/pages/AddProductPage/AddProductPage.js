// import React, { useState } from 'react';
// import styles from './AddProductPage.module.css';
// import AddProductForm from './AddProductForm';
// import Button from '../../components/Button/Button';
// import Modal from '../../components/Modal/Modal';
// import CategoryAddForm from '../../components/categories/CategoryAddForm';

// // TODO: Import icons if using an icon library

// const AddProductPage = () => {
//   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
//   const [categoryAddedKey, setCategoryAddedKey] = useState(0);

//   const handleManageCategories = () => {
//     setIsCategoryModalOpen(true);
//   };

//   const handleCloseCategoryModal = () => {
//     setIsCategoryModalOpen(false);
//   };

//   const handleCategoryAdded = (newCategory) => {
//     console.log("New category added:", newCategory);
//     handleCloseCategoryModal();
//     setCategoryAddedKey(prevKey => prevKey + 1);
//   };

//   const handleUploadFile = () => {
//     alert('Bulk Upload Products functionality TBD');
//   };

//   return (
//     <div className={styles.pageContainer}>
//       <div className={styles.header}>
//         <h2 className={styles.pageTitle}>
//           <span className={styles.iconPlaceholder}>🛒</span>
//           Add New Product
//         </h2>
//         <div className={styles.headerActions}>
//           <Button onClick={handleManageCategories} variant="secondary" size="small">
//             ➕ Manage Categories
//           </Button>
//           <Button onClick={handleUploadFile} variant="outline" size="small">
//             ⬆️ Bulk Upload
//           </Button>
//         </div>
//       </div>

//       <div className={styles.formContainer}>
//         <AddProductForm key={categoryAddedKey} />
//       </div>

//       <Modal
//         isOpen={isCategoryModalOpen}
//         onClose={handleCloseCategoryModal}
//         title="Add New Category"
//       >
//         <CategoryAddForm onCategoryAdded={handleCategoryAdded} />
//       </Modal>
//     </div>
//   );
// };

// export default AddProductPage;



// // src/pages/AddProductPage/AddProductPage.js
// import React, { useState, useEffect } from 'react';
// import styles from './AddProductPage.module.css';
// import AddProductForm from './AddProductForm';
// import Button from '../../components/Button/Button'; // Your Button component
// import Modal from '../../components/Modal/Modal'; // Your generic Modal
// import BulkUploadModal from '../../components/BulkUploadModal/BulkUploadModal'; // Import the new modal
// import CategoryAddForm from '../../components/categories/CategoryAddForm';
// import Alert from '../../components/Alert/Alert'; // Import Alert
// import Spinner from '../../components/Spinner/Spinner'; // Import Spinner
// // import { bulkUploadProducts } from '../../services/productService'; // Placeholder for service

// const AddProductPage = () => {
//   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
//   const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false); // State for new modal
//   const [categoryAddedKey, setCategoryAddedKey] = useState(0); // For AddProductForm re-fetch
//   const [categories, setCategories] = useState([]); // To pass to BulkUploadModal for category mapping

//   // State for bulk upload feedback
//   const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
//   const [bulkUploadMessage, setBulkUploadMessage] = useState({ type: '', text: '' });


//   // Fetch categories to pass to modals if needed (e.g., for mapping categoryName to categoryId)
//   useEffect(() => {
//     // Simplified: Assume getAllCategories is defined elsewhere or pass categories to BulkUploadModal
//     // const fetchCategoriesForModals = async () => {
//     //   try {
//     //     const fetchedCategories = await getAllCategories(); // Example
//     //     setCategories(fetchedCategories || []);
//     //   } catch (err) {
//     //     console.error("Failed to fetch categories for modals", err);
//     //   }
//     // };
//     // fetchCategoriesForModals();
//   }, []);


//   const handleManageCategories = () => {
//     setIsCategoryModalOpen(true);
//   };
//   const handleCloseCategoryModal = () => {
//     setIsCategoryModalOpen(false);
//   };
//   const handleCategoryAdded = (newCategory) => {
//     console.log("New category added:", newCategory);
//     handleCloseCategoryModal();
//     setCategoryAddedKey(prevKey => prevKey + 1); // Trigger re-fetch in AddProductForm
//   };

//   // Open Bulk Upload Modal
//   const handleOpenBulkUploadModal = () => {
//     setBulkUploadMessage({ type: '', text: '' }); // Clear previous messages
//     setIsBulkUploadModalOpen(true);
//   };
//   const handleCloseBulkUploadModal = () => {
//     setIsBulkUploadModalOpen(false);
//   };

//   // Handle the confirmed upload data from BulkUploadModal
//   const handleBulkUploadConfirm = async (parsedProducts) => {
//     console.log("Products to bulk upload:", parsedProducts);
//     setBulkUploadLoading(true);
//     setBulkUploadMessage({ type: '', text: '' });

//     // --- TODO: Replace with actual API call ---
//     // Example: const response = await bulkUploadProducts(parsedProducts);
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 2000));

//       // Simulate a response from the backend
//       const mockResponse = {
//         success: true, // or false
//         message: `${parsedProducts.length} products processed. 0 errors.`, // Example message
//         // errors: [] // Example: [{ row: 2, sku: 'SKU001', error: 'Duplicate SKU' }]
//       };

//       if (mockResponse.success) {
//         setBulkUploadMessage({ type: 'success', text: mockResponse.message || 'Products uploaded successfully!' });
//       } else {
//         setBulkUploadMessage({ type: 'error', text: mockResponse.message || 'Bulk upload failed.' });
//         // Optionally display detailed errors if backend provides them
//       }
//       setIsBulkUploadModalOpen(false); // Close modal on completion
//     } catch (err) {
//       console.error("Bulk upload error:", err);
//       setBulkUploadMessage({ type: 'error', text: err.message || 'An error occurred during bulk upload.' });
//     } finally {
//       setBulkUploadLoading(false);
//     }
//   };


//   return (
//     <div className={styles.pageContainer}>
//       <div className={styles.header}>
//         <h2 className={styles.pageTitle}>
//           <span className={styles.iconPlaceholder}>🛒</span>
//           Add New Product
//         </h2>
//         <div className={styles.headerActions}>
//           <Button onClick={handleManageCategories} variant="secondary" size="small">
//             ➕ Manage Categories
//           </Button>
//           {/* Update onClick for Bulk Upload button */}
//           <Button onClick={handleOpenBulkUploadModal} variant="outline" size="small">
//             ⬆️ Bulk Upload
//           </Button>
//         </div>
//       </div>

//       {/* Display bulk upload loading/messages above the form */}
//       {bulkUploadLoading && <Spinner message="Uploading products..." />}
//       {bulkUploadMessage.text && !isBulkUploadModalOpen && ( // Show only if modal is closed
//         <Alert type={bulkUploadMessage.type} message={bulkUploadMessage.text} onClose={() => setBulkUploadMessage({ type: '', text: '' })} />
//       )}


//       <div className={styles.formContainer}>
//         <AddProductForm key={categoryAddedKey} /> {/* Key helps re-fetch categories if one is added */}
//       </div>

//       {/* Manage Categories Modal */}
//       <Modal
//         isOpen={isCategoryModalOpen}
//         onClose={handleCloseCategoryModal}
//         title="Add New Category"
//       >
//         <CategoryAddForm onCategoryAdded={handleCategoryAdded} />
//       </Modal>

//       {/* Bulk Upload Modal */}
//       <BulkUploadModal
//         isOpen={isBulkUploadModalOpen}
//         onClose={handleCloseBulkUploadModal}
//         onUploadConfirm={handleBulkUploadConfirm}
//         categories={categories} // Pass categories for mapping categoryName to categoryId
//       />
//     </div>
//   );
// };

// export default AddProductPage;



// // src/pages/AddProductPage/AddProductPage.js
// import React, { useState, useEffect } from 'react';
// import styles from './AddProductPage.module.css';
// import AddProductForm from './AddProductForm';
// import Button from '../../components/Button/Button';
// import Modal from '../../components/Modal/Modal';
// import BulkUploadModal from '../../components/BulkUploadModal/BulkUploadModal';
// import CategoryAddForm from '../../components/categories/CategoryAddForm';
// import Alert from '../../components/Alert/Alert';
// import Spinner from '../../components/Spinner/Spinner';
// // import { bulkUploadProducts } from '../../services/productService'; // Actual service
// // import { getAllCategories } from '../../services/categoryService'; // Actual service

// // Mock service for bulk upload
// const mockBulkUploadProducts = async (products) => {
//   console.log("MOCK: Bulk uploading products", products);
//   await new Promise(resolve => setTimeout(resolve, 1500));
//   // Simulate some errors for testing
//   // if (products.length > 5) return { success: false, message: "Mock Error: Too many products for demo."};
//   return { success: true, message: `${products.length} products processed (mock). 0 errors.` };
// };
// // Mock service for categories
// const mockGetAllCategoriesForPage = async () => {
//   console.log("MOCK (Page): Fetching categories");
//   await new Promise(resolve => setTimeout(resolve, 300));
//   return [{ _id: 'cat1', name: 'Electronics' }, { _id: 'cat2', name: 'Groceries' }];
// };


// const AddProductPage = () => {
//   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
//   const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
//   const [categoryAddedKey, setCategoryAddedKey] = useState(0);
//   const [categoriesForModal, setCategoriesForModal] = useState([]); // Pass to BulkUploadModal

//   const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
//   const [bulkUploadMessage, setBulkUploadMessage] = useState({ type: '', text: '' });

//   // Fetch categories for the BulkUploadModal (and potentially CategoryAddForm if it needed them)
//   useEffect(() => {
//     const fetchInitialCategories = async () => {
//       try {
//         // const fetched = await getAllCategories(); // Real call
//         const fetched = await mockGetAllCategoriesForPage(); // Mock call
//         setCategoriesForModal(fetched || []);
//       } catch (err) {
//         console.error("AddProductPage: Failed to fetch categories for modal", err);
//         // Optionally set an error message here if critical for modal functionality
//       }
//     };
//     fetchInitialCategories();
//   }, []);


//   const handleManageCategories = () => { setIsCategoryModalOpen(true); };
//   const handleCloseCategoryModal = () => { setIsCategoryModalOpen(false); };
//   const handleCategoryAdded = (newCategory) => { console.log("New category added:", newCategory); handleCloseCategoryModal(); setCategoryAddedKey(prevKey => prevKey + 1); };
//   const handleOpenBulkUploadModal = () => { setBulkUploadMessage({ type: '', text: '' }); setIsBulkUploadModalOpen(true); };
//   const handleCloseBulkUploadModal = () => { setIsBulkUploadModalOpen(false); };

//   const handleBulkUploadConfirm = async (parsedProducts) => {
//     console.log("Products to bulk upload (from AddProductPage):", parsedProducts);
//     setBulkUploadLoading(true);
//     setBulkUploadMessage({ type: '', text: '' });
//     try {
//       // const response = await bulkUploadProducts(parsedProducts); // Real call
//       const response = await mockBulkUploadProducts(parsedProducts); // Mock call
//       if (response.success) {
//         setBulkUploadMessage({ type: 'success', text: response.message || 'Products uploaded!' });
//       } else {
//         setBulkUploadMessage({ type: 'error', text: response.message || 'Bulk upload failed.' });
//       }
//       setIsBulkUploadModalOpen(false); // Close modal
//     } catch (err) {
//       setBulkUploadMessage({ type: 'error', text: err.message || 'Bulk upload error.' });
//     } finally {
//       setBulkUploadLoading(false);
//     }
//   };

//   return (
//     <div className={styles.pageContainer}>
//       <div className={styles.header}>
//         <h2 className={styles.pageTitle}><span className={styles.iconPlaceholder}>🛒</span>Add New Product</h2>
//         <div className={styles.headerActions}>
//           <Button onClick={handleManageCategories} variant="secondary" size="small">➕ Manage Categories</Button>
//           <Button onClick={handleOpenBulkUploadModal} variant="outline" size="small">⬆️ Bulk Upload</Button>
//         </div>
//       </div>
//       {bulkUploadLoading && <Spinner message="Uploading products..." />}
//       {bulkUploadMessage.text && !isBulkUploadModalOpen && (
//         <Alert type={bulkUploadMessage.type} message={bulkUploadMessage.text} onClose={() => setBulkUploadMessage({ type: '', text: '' })} />
//       )}
//       <div className={styles.formContainer}>
//         <AddProductForm key={categoryAddedKey} />
//       </div>
//       <Modal isOpen={isCategoryModalOpen} onClose={handleCloseCategoryModal} title="Add New Category">
//         {/* Pass onClose to CategoryAddForm if it needs to close the modal itself */}
//         <CategoryAddForm onCategoryAdded={handleCategoryAdded} onClose={handleCloseCategoryModal} />
//       </Modal>
//       <BulkUploadModal
//         isOpen={isBulkUploadModalOpen}
//         onClose={handleCloseBulkUploadModal}
//         onUploadConfirm={handleBulkUploadConfirm}
//         categories={categoriesForModal}
//       />
//     </div>
//   );
// };
// export default AddProductPage;

// src/pages/AddProductPage/AddProductPage.js
// import React, { useState, useEffect } from 'react';
// import styles from './AddProductPage.module.css';
// import AddProductForm from './AddProductForm';
// import Button from '../../components/Button/Button';
// import Modal from '../../components/Modal/Modal';
// import BulkUploadModal from '../../components/BulkUploadModal/BulkUploadModal';
// import CategoryAddForm from '../../components/categories/CategoryAddForm';
// import Alert from '../../components/Alert/Alert';
// import Spinner from '../../components/Spinner/Spinner';
// // import { bulkUploadProducts } from '../../services/productService'; // Actual service
// // import { getAllCategories } from '../../services/categoryService'; // Actual service

// // Mock service for bulk upload
// const mockBulkUploadProducts = async (products) => {
//   console.log("MOCK: Bulk uploading products", products);
//   await new Promise(resolve => setTimeout(resolve, 1500));
//   return { success: true, message: `${products.length} products processed (mock). 0 errors.` };
// };
// // Mock service for categories for the page
// const mockGetAllCategoriesForPage = async () => {
//   console.log("MOCK (Page): Fetching categories for modal");
//   await new Promise(resolve => setTimeout(resolve, 300));
//   return [{ _id: 'cat1', name: 'Electronics' }, { _id: 'cat2', name: 'Groceries' }];
// };


// const AddProductPage = () => {
//   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
//   const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
//   const [categoryAddedKey, setCategoryAddedKey] = useState(0); // Used as key and version
//   const [categoriesForModal, setCategoriesForModal] = useState([]);

//   const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
//   const [bulkUploadMessage, setBulkUploadMessage] = useState({ type: '', text: '' });

//   useEffect(() => {
//     const fetchInitialCategories = async () => {
//       console.log("AddProductPage: Fetching initial categories for modal");
//       try {
//         const fetched = await mockGetAllCategoriesForPage();
//         setCategoriesForModal(fetched || []);
//       } catch (err) {
//         console.error("AddProductPage: Failed to fetch categories for modal", err);
//       }
//     };
//     fetchInitialCategories();
//   }, []); // Runs once on mount


//   const handleManageCategories = () => { setIsCategoryModalOpen(true); };
//   const handleCloseCategoryModal = () => { setIsCategoryModalOpen(false); };
//   const handleCategoryAdded = (newCategory) => {
//     console.log("AddProductPage: New category added:", newCategory);
//     handleCloseCategoryModal();
//     setCategoryAddedKey(prevKey => prevKey + 1); // Update key to trigger re-fetch in AddProductForm
//   };
//   const handleOpenBulkUploadModal = () => {
//     setBulkUploadMessage({ type: '', text: '' });
//     setIsBulkUploadModalOpen(true);
//   };
//   const handleCloseBulkUploadModal = () => {
//     setIsBulkUploadModalOpen(false);
//   };

//   const handleBulkUploadConfirm = async (parsedProducts) => {
//     console.log("AddProductPage: Products to bulk upload:", parsedProducts);
//     setBulkUploadLoading(true);
//     setBulkUploadMessage({ type: '', text: '' });
//     try {
//       const response = await mockBulkUploadProducts(parsedProducts);
//       if (response.success) {
//         setBulkUploadMessage({ type: 'success', text: response.message || 'Products uploaded!' });
//       } else {
//         setBulkUploadMessage({ type: 'error', text: response.message || 'Bulk upload failed.' });
//       }
//       setIsBulkUploadModalOpen(false);
//     } catch (err) {
//       setBulkUploadMessage({ type: 'error', text: err.message || 'Bulk upload error.' });
//     } finally {
//       setBulkUploadLoading(false);
//     }
//   };

//   return (
//     <div className={styles.pageContainer}>
//       <div className={styles.header}>
//         <h2 className={styles.pageTitle}>
//           <span className={styles.iconPlaceholder}>🛒</span>
//           Add New Product
//         </h2>
//         <div className={styles.headerActions}>
//           <Button onClick={handleManageCategories} variant="secondary" size="small">
//             ➕ Manage Categories
//           </Button>
//           <Button onClick={handleOpenBulkUploadModal} variant="outline" size="small">
//             ⬆️ Bulk Upload
//           </Button>
//         </div>
//       </div>

//       {bulkUploadLoading && <Spinner message="Uploading products..." />}
//       {bulkUploadMessage.text && !isBulkUploadModalOpen && (
//           <Alert
//             type={bulkUploadMessage.type}
//             message={bulkUploadMessage.text}
//             onClose={() => setBulkUploadMessage({type:'', text:''})}
//           />
//       )}

//       <div className={styles.formContainer}>
//         {/*
//           React's `key` prop is used for reconciliation. When it changes, React
//           unmounts the old component instance and mounts a new one.
//           We also pass `categoryVersion` as a regular prop to be used in AddProductForm's
//           useEffect dependency array for fetching categories.
//         */}
//         <AddProductForm key={categoryAddedKey} categoryVersion={categoryAddedKey} />
//       </div>

//       <Modal
//         isOpen={isCategoryModalOpen}
//         onClose={handleCloseCategoryModal}
//         title="Add New Category"
//       >
//         <CategoryAddForm
//           onCategoryAdded={handleCategoryAdded}
//           onClose={handleCloseCategoryModal} // Pass onClose to allow CategoryAddForm to close modal
//         />
//       </Modal>

//       <BulkUploadModal
//         isOpen={isBulkUploadModalOpen}
//         onClose={handleCloseBulkUploadModal}
//         onUploadConfirm={handleBulkUploadConfirm}
//         categories={categoriesForModal} // Pass fetched categories
//       />
//     </div>
//   );
// };
// export default AddProductPage;

// frontend/src/pages/AddProductPage/AddProductPage.js
import React, { useState, useEffect } from 'react';
import styles from './AddProductPage.module.css';
import AddProductForm from './AddProductForm';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import BulkUploadModal from '../../components/BulkUploadModal/BulkUploadModal';
import CategoryAddForm from '../../components/categories/CategoryAddForm';
import Alert from '../../components/Alert/Alert';
import Spinner from '../../components/Spinner/Spinner';
// --- IMPORT THE REAL SERVICE FUNCTIONS ---
import { bulkUploadProductsService } from '../../services/productService'; // Ensure this path is correct
import { getAllCategories } from '../../services/categoryService'; // For fetching categories for modals

// --- REMOVE OR COMMENT OUT MOCK FUNCTIONS ---
// const mockBulkUploadProducts = async (products) => { /* ... */ };
// const mockGetAllCategoriesForPage = async () => { /* ... */ };


const AddProductPage = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [categoryAddedKey, setCategoryAddedKey] = useState(0);
  const [categoriesForModal, setCategoriesForModal] = useState([]);

  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadMessage, setBulkUploadMessage] = useState({ type: '', text: '' });
  const [detailedBulkErrors, setDetailedBulkErrors] = useState([]);

  // Fetch categories for the BulkUploadModal
  useEffect(() => {
    const fetchInitialCategories = async () => {
      console.log("AddProductPage: Fetching initial categories for modal using real service");
      try {
        const fetched = await getAllCategories(); // Using real service call
        setCategoriesForModal(fetched || []);
      } catch (err) {
        console.error("AddProductPage: Failed to fetch categories for modal:", err);
        setBulkUploadMessage({ type: 'error', text: 'Could not load categories for upload. Please try again.' });
      }
    };
    fetchInitialCategories();
  }, [categoryAddedKey]); // Re-fetch if a category is added


  const handleManageCategories = () => { setIsCategoryModalOpen(true); };
  const handleCloseCategoryModal = () => { setIsCategoryModalOpen(false); };
  const handleCategoryAdded = (newCategory) => {
    console.log("AddProductPage: New category added:", newCategory);
    handleCloseCategoryModal();
    setCategoryAddedKey(prevKey => prevKey + 1);
  };
  const handleOpenBulkUploadModal = () => {
    setBulkUploadMessage({ type: '', text: '' });
    setDetailedBulkErrors([]);
    setIsBulkUploadModalOpen(true);
  };
  const handleCloseBulkUploadModal = () => {
    setIsBulkUploadModalOpen(false);
  };

  // Handle the confirmed upload data from BulkUploadModal
  const handleBulkUploadConfirm = async (parsedProducts) => {
    console.log("AddProductPage: Products to bulk upload:", parsedProducts);
    setBulkUploadLoading(true);
    setBulkUploadMessage({ type: '', text: '' });
    setDetailedBulkErrors([]);

    try {
      // --- CALL THE ACTUAL SERVICE FUNCTION ---
      const response = await bulkUploadProductsService(parsedProducts);
      console.log("AddProductPage: Bulk upload response from service:", response);

      let messageText = response.message || '';
      let messageType = 'info'; // Default

      // Check for specific success/failure counts if backend provides them
      if (response.hasOwnProperty('successCount') && response.hasOwnProperty('failureCount')) {
        if (response.successCount > 0 && response.failureCount === 0) {
          messageType = 'success';
          messageText = response.message || `${response.successCount} product(s) uploaded successfully!`;
        } else if (response.successCount > 0 && response.failureCount > 0) {
          messageType = 'warning';
          messageText = response.message || `Partial success: ${response.successCount} uploaded, ${response.failureCount} failed.`;
        } else if (response.failureCount > 0) {
          messageType = 'error';
          messageText = response.message || `Bulk upload failed. ${response.failureCount} product(s) had errors.`;
        }
      } else if (response.success === false) { // Fallback if only general success/failure
        messageType = 'error';
        messageText = response.message || 'Bulk upload failed.';
      } else if (response.success === true) {
        messageType = 'success';
        messageText = response.message || 'Products uploaded successfully!';
      }


      setBulkUploadMessage({ type: messageType, text: messageText });

      if (response.errors && response.errors.length > 0) {
        setDetailedBulkErrors(response.errors);
      }

    } catch (err) {
      console.error("AddProductPage: Bulk upload error caught in component:", err);
      // err object from service should have .message and optionally .errors
      setBulkUploadMessage({ type: 'error', text: err.message || 'An critical error occurred during bulk upload.' });
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setDetailedBulkErrors(err.errors);
      } else if (err.message && !err.errors) {
        setDetailedBulkErrors([{ reason: err.message }]);
      }
    } finally {
      setBulkUploadLoading(false);
      setIsBulkUploadModalOpen(false); // Close modal after attempting upload
    }
  };


  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>
          <span className={styles.iconPlaceholder}>🛒</span>
          Add New Product
        </h2>
        <div className={styles.headerActions}>
          <Button onClick={handleManageCategories} variant="secondary" size="small">
            ➕ Manage Categories
          </Button>
          <Button onClick={handleOpenBulkUploadModal} variant="outline" size="small">
            ⬆️ Bulk Upload
          </Button>
        </div>
      </div>

      {bulkUploadLoading && <Spinner message="Uploading products... Please wait." />}
      {bulkUploadMessage.text && (
        <Alert
          type={bulkUploadMessage.type}
          message={bulkUploadMessage.text}
          onClose={() => { setBulkUploadMessage({ type: '', text: '' }); setDetailedBulkErrors([]); }}
        />
      )}
      {detailedBulkErrors.length > 0 && (
        <div className={styles.detailedErrorsContainer}>
          <h4>Upload Error Details:</h4>
          <ul className={styles.errorList}>
            {detailedBulkErrors.map((errItem, index) => (
              <li key={index}>
                Row {errItem.row || 'N/A'} (SKU: {errItem.sku || 'N/A'}, Name: {errItem.name || 'N/A'}): {errItem.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.formContainer}>
        <AddProductForm key={categoryAddedKey} categoryVersion={categoryAddedKey} />
      </div>

      <Modal isOpen={isCategoryModalOpen} onClose={handleCloseCategoryModal} title="Add New Category">
        <CategoryAddForm onCategoryAdded={handleCategoryAdded} onClose={handleCloseCategoryModal} />
      </Modal>
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={handleCloseBulkUploadModal}
        onUploadConfirm={handleBulkUploadConfirm}
        categories={categoriesForModal} // Pass fetched categories
      />
    </div>
  );
};
export default AddProductPage;