// // src/components/BulkUploadModal/BulkUploadModal.js
// import React, { useState, useRef, useEffect } from 'react';
// import Modal from '../Modal/Modal'; // Your existing Modal component
// import Button from '../Button/Button';
// import Spinner from '../Spinner/Spinner';
// import Alert from '../Alert/Alert';
// import styles from './BulkUploadModal.module.css';
// import Papa from 'papaparse'; // For CSV
// import * as XLSX from 'xlsx'; // For Excel

// // --- Expected Headers (Case Insensitive for robustness) ---
// // These should match the keys you expect in your product objects after parsing,
// // and also what users should ideally have in their CSV/Excel headers.
// const EXPECTED_PRODUCT_FIELDS = [
//     'sku', 'name', 'description', 'categoryName', // categoryName will be used to find categoryId
//     'manufactureDate', 'expiryDate', 'costPrice', 'sellingPrice',
//     'discountPercentage', 'mrp', 'currentStock', 'lowStockThreshold'
// ];

// function BulkUploadModal({ isOpen, onClose, onUploadConfirm, categories = [] }) {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [parsedData, setParsedData] = useState([]); // Full parsed data
//     const [previewData, setPreviewData] = useState([]); // Data for preview table
//     const [showAllPreview, setShowAllPreview] = useState(false);
//     const [isParsing, setIsParsing] = useState(false); // Different from parent's loading
//     const [error, setError] = useState('');
//     const fileInputRef = useRef(null);

//     // Reset state when modal closes or opens
//     useEffect(() => {
//         if (isOpen) {
//             resetModalState();
//         }
//     }, [isOpen]);

//     const resetModalState = () => {
//         setSelectedFile(null);
//         setParsedData([]);
//         setPreviewData([]);
//         setShowAllPreview(false);
//         setError('');
//         setIsParsing(false);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = ''; // Reset file input field
//         }
//     };

//     const mapHeader = (header) => {
//         const lowerHeader = header.toLowerCase().replace(/\s+/g, ''); // Normalize
//         // Match against known variations or exact model fields
//         if (lowerHeader.includes('sku') || lowerHeader.includes('productid')) return 'sku';
//         if (lowerHeader.includes('name') && !lowerHeader.includes('category')) return 'name';
//         if (lowerHeader.includes('description')) return 'description';
//         if (lowerHeader.includes('category')) return 'categoryName'; // Will be category name initially
//         if (lowerHeader.includes('manufacture') || lowerHeader.includes('mfd')) return 'manufactureDate';
//         if (lowerHeader.includes('expiry') || lowerHeader.includes('exp')) return 'expiryDate';
//         if (lowerHeader.includes('cost')) return 'costPrice';
//         if (lowerHeader.includes('selling') || lowerHeader.includes('sellprice')) return 'sellingPrice';
//         if (lowerHeader.includes('discount')) return 'discountPercentage';
//         if (lowerHeader.includes('mrp')) return 'mrp';
//         if (lowerHeader.includes('stock') && !lowerHeader.includes('threshold') && !lowerHeader.includes('low')) return 'currentStock';
//         if (lowerHeader.includes('threshold') || lowerHeader.includes('lowstock')) return 'lowStockThreshold';
//         return header; // Return original if no match (will be ignored or flagged)
//     };


//     const parseCSV = (file) => {
//         return new Promise((resolve, reject) => {
//             Papa.parse(file, {
//                 header: true,
//                 skipEmptyLines: true,
//                 transformHeader: header => mapHeader(header.trim()), // Normalize headers
//                 complete: (results) => {
//                     if (results.errors.length) {
//                         reject(new Error(results.errors.map(err => err.message).join(', ')));
//                     } else {
//                         resolve(results.data);
//                     }
//                 },
//                 error: (err) => reject(err)
//             });
//         });
//     };

//     const parseExcel = (file) => {
//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 try {
//                     const data = e.target.result;
//                     const workbook = XLSX.read(data, { type: 'array', cellDates: true }); // cellDates: true to parse dates
//                     const sheetName = workbook.SheetNames[0];
//                     const worksheet = workbook.Sheets[sheetName];
//                     // Convert to JSON, explicitly map headers
//                     const jsonData = XLSX.utils.sheet_to_json(worksheet, {
//                         header: 1, // Get first row as array
//                         defval: '', // Default value for empty cells
//                         raw: false, // Use formatted strings
//                         dateNF: 'yyyy-mm-dd' // Attempt to format dates this way
//                     });

//                     if (jsonData.length === 0) {
//                         resolve([]);
//                         return;
//                     }

//                     const headers = jsonData[0].map(header => mapHeader(String(header).trim()));
//                     const rows = jsonData.slice(1).map(row => {
//                         const rowData = {};
//                         headers.forEach((header, index) => {
//                             if (EXPECTED_PRODUCT_FIELDS.includes(header)) { // Only include expected fields
//                                 let value = row[index];
//                                 // Basic date handling for Excel
//                                 if ((header === 'manufactureDate' || header === 'expiryDate') && value instanceof Date) {
//                                    // Format as YYYY-MM-DD string if needed, or keep as Date object
//                                    // For consistency with AddProductForm, let's keep as Date obj
//                                    // value = value.toISOString().split('T')[0];
//                                 }
//                                 rowData[header] = value;
//                             }
//                         });
//                         return rowData;
//                     });
//                     resolve(rows);
//                 } catch (err) {
//                     reject(err);
//                 }
//             };
//             reader.onerror = (err) => reject(err);
//             reader.readAsArrayBuffer(file);
//         });
//     };


//     const handleFileChange = async (event) => {
//         resetModalState(); // Reset fully on new file
//         const file = event.target.files[0];
//         if (!file) return;

//         setSelectedFile(file);
//         setIsParsing(true);
//         setError('');

//         try {
//             let dataArray = [];
//             if (file.name.endsWith('.csv')) {
//                 dataArray = await parseCSV(file);
//             } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
//                 dataArray = await parseExcel(file);
//             } else {
//                 throw new Error('Unsupported file type. Please upload CSV or Excel files.');
//             }

//             // Filter out rows that are completely empty or only have undefined/empty string values
//             const cleanedData = dataArray.filter(row =>
//                 Object.values(row).some(value => value !== undefined && value !== null && String(value).trim() !== '')
//             );


//             if (cleanedData.length === 0) {
//                 setError('The file is empty or does not contain valid data rows.');
//                 setParsedData([]);
//                 setPreviewData([]);
//             } else {
//                 setParsedData(cleanedData);
//                 setPreviewData(cleanedData.slice(0, 10)); // Show first 10 rows
//             }
//         } catch (err) {
//             console.error("File parsing error:", err);
//             setError(`Error parsing file: ${err.message}`);
//             setParsedData([]);
//             setPreviewData([]);
//         } finally {
//             setIsParsing(false);
//         }
//     };

//     const handleConfirm = () => {
//         if (parsedData.length > 0) {
//             onUploadConfirm(parsedData); // Pass all parsed data to parent
//             // Parent will handle closing the modal after its own API call
//         } else {
//             setError("No valid data to upload. Please select and parse a file first.");
//         }
//     };

//     const handleModalClose = () => {
//         resetModalState();
//         onClose(); // Call parent's close handler
//     };

//     const tableHeaders = parsedData.length > 0 ? Object.keys(parsedData[0]).filter(header => EXPECTED_PRODUCT_FIELDS.includes(header)) : EXPECTED_PRODUCT_FIELDS;

//     return (
//         <Modal isOpen={isOpen} onClose={handleModalClose} title="Bulk Upload Products">
//             <div className={styles.modalContent}>
//                 <div className={styles.fileInputSection}>
//                     <label htmlFor="bulk-file-upload" className={styles.fileInputLabel}>
//                         {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose CSV or Excel File'}
//                     </label>
//                     <input
//                         type="file"
//                         id="bulk-file-upload"
//                         ref={fileInputRef}
//                         onChange={handleFileChange}
//                         accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
//                         className={styles.fileInputHidden}
//                     />
//                      <small className={styles.fileHint}>Expected headers: sku, name, categoryName, sellingPrice, currentStock, etc.</small>
//                 </div>

//                 {isParsing && <Spinner message="Parsing file..." />}
//                 {error && <Alert type="error" message={error} />}

//                 {previewData.length > 0 && (
//                     <div className={styles.previewSection}>
//                         <h4>Data Preview (First {previewData.length} of {parsedData.length} rows)</h4>
//                         <div className={styles.tableContainer}>
//                             <table className={styles.previewTable}>
//                                 <thead>
//                                     <tr>
//                                         {tableHeaders.map(header => <th key={header}>{header}</th>)}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {(showAllPreview ? parsedData : previewData).map((row, rowIndex) => (
//                                         <tr key={rowIndex}>
//                                             {tableHeaders.map(header => (
//                                                 <td key={`${header}-${rowIndex}`}>
//                                                     {row[header] instanceof Date
//                                                         ? row[header].toLocaleDateString()
//                                                         : (row[header] !== undefined && row[header] !== null) ? String(row[header]) : ''}
//                                                 </td>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         {parsedData.length > 10 && (
//                             <Button
//                                 onClick={() => setShowAllPreview(!showAllPreview)}
//                                 variant="outline"
//                                 size="small"
//                                 className={styles.togglePreviewButton}
//                             >
//                                 {showAllPreview ? 'Show Less' : `Show All ${parsedData.length} Rows`}
//                             </Button>
//                         )}
//                     </div>
//                 )}

//                 <div className={styles.modalActions}>
//                     <Button onClick={handleModalClose} variant="secondary" disabled={isParsing}>
//                         Cancel
//                     </Button>
//                     <Button
//                         onClick={handleConfirm}
//                         variant="primary"
//                         disabled={isParsing || parsedData.length === 0 || !!error}
//                     >
//                         Confirm & Upload to Database
//                     </Button>
//                 </div>
//             </div>
//         </Modal>
//     );
// }

// export default BulkUploadModal;


// // src/components/BulkUploadModal/BulkUploadModal.js
// import React, { useState, useRef, useEffect } from 'react';
// import Modal from '../Modal/Modal';
// import Button from '../Button/Button';
// import Spinner from '../Spinner/Spinner';
// import Alert from '../Alert/Alert';
// import styles from './BulkUploadModal.module.css';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';

// // Expected headers remain the same for parsing logic
// const EXPECTED_PRODUCT_FIELDS = [
//     'sku', 'name', 'description', 'categoryName',
//     'manufactureDate', 'expiryDate', 'costPrice', 'sellingPrice',
//     'discountPercentage', 'mrp', 'currentStock', 'lowStockThreshold'
// ];

// function BulkUploadModal({ isOpen, onClose, onUploadConfirm, categories = [] }) {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [parsedData, setParsedData] = useState([]); // Still need to store parsed data
//     const [isParsing, setIsParsing] = useState(false);
//     const [error, setError] = useState('');
//     const [successMessage, setSuccessMessage] = useState(''); // For "File selected" message
//     const fileInputRef = useRef(null);

//     useEffect(() => {
//         if (isOpen) {
//             resetModalState();
//         }
//     }, [isOpen]);

//     const resetModalState = () => {
//         setSelectedFile(null);
//         setParsedData([]);
//         setError('');
//         setSuccessMessage('');
//         setIsParsing(false);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     const mapHeader = (header) => {
//         const lowerHeader = String(header).toLowerCase().replace(/\s+/g, '').replace(/[^\w]/gi, '');
//         if (lowerHeader.includes('sku') || lowerHeader.includes('productid')) return 'sku';
//         if (lowerHeader.includes('name') && !lowerHeader.includes('category')) return 'name';
//         if (lowerHeader.includes('description')) return 'description';
//         if (lowerHeader.includes('category')) return 'categoryName';
//         if (lowerHeader.includes('manufacture') || lowerHeader.includes('mfd') || lowerHeader.includes('mfg')) return 'manufactureDate';
//         if (lowerHeader.includes('expiry') || lowerHeader.includes('exp')) return 'expiryDate';
//         if (lowerHeader.includes('cost')) return 'costPrice';
//         if (lowerHeader.includes('selling') || lowerHeader.includes('sellprice')) return 'sellingPrice';
//         if (lowerHeader.includes('discount')) return 'discountPercentage';
//         if (lowerHeader.includes('mrp')) return 'mrp';
//         if (lowerHeader.includes('currentstock') || (lowerHeader.includes('stock') && !lowerHeader.includes('threshold') && !lowerHeader.includes('low'))) return 'currentStock';
//         if (lowerHeader.includes('threshold') || lowerHeader.includes('lowstock')) return 'lowStockThreshold';
//         const expectedMatch = EXPECTED_PRODUCT_FIELDS.find(expected => lowerHeader.includes(expected.toLowerCase()));
//         if (expectedMatch) return expectedMatch;
//         return header.trim();
//     };

//     const parseCSV = (file) => new Promise((resolve, reject) => { Papa.parse(file, { header: true, skipEmptyLines: true, transformHeader: h => mapHeader(h), complete: r => r.errors.length ? reject(new Error(r.errors.map(e => `Row ${e.row}: ${e.message} (${e.code})`).join('\n '))) : resolve(r.data), error: e => reject(e) }); });
//     const parseExcel = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => { try { const data = e.target.result; const wb = XLSX.read(data, { type: 'array', cellDates: true }); const wsName = wb.SheetNames[0]; const ws = wb.Sheets[wsName]; const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: undefined, raw: false }); if (jsonData.length < 2) { resolve([]); return; } const rawHeaders = jsonData[0]; const mappedHeaders = rawHeaders.map(h => mapHeader(h)); const rows = jsonData.slice(1).map(rA => { const rD = {}; mappedHeaders.forEach((h, i) => { if (EXPECTED_PRODUCT_FIELDS.includes(h)) { let v = rA[i]; if ((h === 'manufactureDate' || h === 'expiryDate') && v && !(v instanceof Date)) { const pD = new Date(v); if (!isNaN(pD.getTime())) v = pD; } rD[h] = v; } }); return rD; }); resolve(rows); } catch (err) { reject(err); } }; reader.onerror = err => reject(err); reader.readAsArrayBuffer(file); });

//     const handleFileChange = async (event) => {
//         resetModalState(); // Reset on new file
//         const file = event.target.files[0];
//         if (!file) return;

//         setSelectedFile(file);
//         setIsParsing(true);
//         setError('');
//         setSuccessMessage(''); // Clear previous success

//         try {
//             let dataArray = [];
//             if (file.name.endsWith('.csv')) {
//                 dataArray = await parseCSV(file);
//             } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
//                 dataArray = await parseExcel(file);
//             } else {
//                 throw new Error('Unsupported file type. Please upload CSV or Excel files.');
//             }

//             const cleanedData = dataArray.filter(row => typeof row === 'object' && row !== null && EXPECTED_PRODUCT_FIELDS.some(field => row.hasOwnProperty(field) && row[field] !== undefined && row[field] !== null && String(row[field]).trim() !== '')).map(row => { const cR = {}; EXPECTED_PRODUCT_FIELDS.forEach(f => { cR[f] = row[f]; }); return cR; });

//             if (cleanedData.length === 0) {
//                 setError('File is empty or has no valid product data based on expected headers.');
//                 setParsedData([]);
//             } else {
//                 setParsedData(cleanedData);
//                 setSuccessMessage(`File "${file.name}" processed. ${cleanedData.length} valid product(s) found.`);
//                 console.log("Parsed data for upload:", cleanedData);
//             }
//         } catch (err) {
//             console.error("File parsing error:", err);
//             setError(`Error parsing file: ${err.message}`);
//             setParsedData([]);
//         } finally {
//             setIsParsing(false);
//         }
//     };

//     const handleConfirm = () => {
//         if (parsedData.length > 0 && !error) { // Only confirm if data is parsed and no parsing error
//             onUploadConfirm(parsedData);
//         } else if (error) {
//             alert("Cannot upload due to parsing errors. Please fix the file or select a new one.");
//         } else {
//             alert("Please select and process a file first.");
//         }
//     };

//     const handleModalClose = () => {
//         resetModalState();
//         onClose();
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={handleModalClose} title="Bulk Upload Products">
//             <div className={styles.modalContent}>
//                 <div className={styles.fileInputSection}>
//                     <label htmlFor="bulk-file-upload" className={styles.fileInputLabelButton}>
//                         {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose CSV or Excel File'}
//                     </label>
//                     <input
//                         type="file"
//                         id="bulk-file-upload"
//                         ref={fileInputRef}
//                         onChange={handleFileChange}
//                         accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
//                         className={styles.fileInputHidden}
//                     />
//                     <small className={styles.fileHint}>Headers: sku, name, categoryName, sellingPrice, currentStock, etc.</small>
//                 </div>

//                 {isParsing && <Spinner message="Processing file..." />}
//                 {/* Display success message from parsing or errors */}
//                 {successMessage && !error && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
//                 {error && <Alert type="error" message={error} onClose={() => setError('')} />}

//                 {/* Preview section is removed */}

//                 <div className={styles.modalActions}>
//                     <Button onClick={handleModalClose} variant="secondary" disabled={isParsing}>
//                         Cancel
//                     </Button>
//                     <Button
//                         onClick={handleConfirm}
//                         variant="primary"
//                         // Disable confirm if parsing, no data, or there was a parsing error
//                         disabled={isParsing || parsedData.length === 0 || !!error}
//                     >
//                         Confirm & Upload
//                     </Button>
//                 </div>
//             </div>
//         </Modal>
//     );
// }

// export default BulkUploadModal;

// src/components/BulkUploadModal/BulkUploadModal.js
// import React, { useState, useRef, useEffect } from 'react';
// import Modal from '../Modal/Modal';
// import Button from '../Button/Button';
// import Spinner from '../Spinner/Spinner';
// import Alert from '../Alert/Alert';
// import styles from './BulkUploadModal.module.css';
// import Papa from 'papaparse';
// import * as XLSX from 'xlsx';

// const EXPECTED_PRODUCT_FIELDS = [
//     'sku', 'name', 'description', 'categoryName',
//     'manufactureDate', 'expiryDate', 'costPrice', 'sellingPrice',
//     'discountPercentage', 'mrp', 'currentStock', 'lowStockThreshold'
// ];

// function BulkUploadModal({ isOpen, onClose, onUploadConfirm, categories = [] }) {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [parsedData, setParsedData] = useState([]);
//     // PreviewData state is removed as per your request
//     // const [previewData, setPreviewData] = useState([]);
//     // const [showAllPreview, setShowAllPreview] = useState(false);
//     const [isParsing, setIsParsing] = useState(false);
//     const [error, setError] = useState('');
//     const [successMessage, setSuccessMessage] = useState(''); // For "File selected/processed" message
//     const fileInputRef = useRef(null);

//     useEffect(() => {
//         if (isOpen) {
//             resetModalState();
//         }
//     }, [isOpen]);

//     const resetModalState = () => {
//         setSelectedFile(null);
//         setParsedData([]);
//         // setPreviewData([]); // Removed
//         // setShowAllPreview(false); // Removed
//         setError('');
//         setSuccessMessage(''); // Reset success message too
//         setIsParsing(false);
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
//     };

//     const mapHeader = (header) => { /* ... mapHeader logic remains the same ... */
//         const lowerHeader = String(header).toLowerCase().replace(/\s+/g, '').replace(/[^\w]/gi, '');
//         if (lowerHeader.includes('sku') || lowerHeader.includes('productid')) return 'sku';
//         if (lowerHeader.includes('name') && !lowerHeader.includes('category')) return 'name';
//         if (lowerHeader.includes('description')) return 'description';
//         if (lowerHeader.includes('category')) return 'categoryName';
//         if (lowerHeader.includes('manufacture') || lowerHeader.includes('mfd') || lowerHeader.includes('mfg')) return 'manufactureDate';
//         if (lowerHeader.includes('expiry') || lowerHeader.includes('exp')) return 'expiryDate';
//         if (lowerHeader.includes('cost')) return 'costPrice';
//         if (lowerHeader.includes('selling') || lowerHeader.includes('sellprice')) return 'sellingPrice';
//         if (lowerHeader.includes('discount')) return 'discountPercentage';
//         if (lowerHeader.includes('mrp')) return 'mrp';
//         if (lowerHeader.includes('currentstock') || (lowerHeader.includes('stock') && !lowerHeader.includes('threshold') && !lowerHeader.includes('low'))) return 'currentStock';
//         if (lowerHeader.includes('threshold') || lowerHeader.includes('lowstock')) return 'lowStockThreshold';
//         const expectedMatch = EXPECTED_PRODUCT_FIELDS.find(expected => lowerHeader.includes(expected.toLowerCase()));
//         if (expectedMatch) return expectedMatch;
//         return header.trim();
//     };

//     const parseCSV = (file) => new Promise((resolve, reject) => { Papa.parse(file, { header: true, skipEmptyLines: true, transformHeader: h => mapHeader(h), complete: r => r.errors.length ? reject(new Error(r.errors.map(e => `Row ${e.row}: ${e.message} (${e.code})`).join('\n '))) : resolve(r.data), error: e => reject(e) }); });
//     const parseExcel = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = (e) => { try { const data = e.target.result; const wb = XLSX.read(data, { type: 'array', cellDates: true }); const wsName = wb.SheetNames[0]; const ws = wb.Sheets[wsName]; const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: undefined, raw: false }); if (jsonData.length < 2) { resolve([]); return; } const rawHeaders = jsonData[0]; const mappedHeaders = rawHeaders.map(h => mapHeader(h)); const rows = jsonData.slice(1).map(rA => { const rD = {}; mappedHeaders.forEach((h, i) => { if (EXPECTED_PRODUCT_FIELDS.includes(h)) { let v = rA[i]; if ((h === 'manufactureDate' || h === 'expiryDate') && v && !(v instanceof Date)) { const pD = new Date(v); if (!isNaN(pD.getTime())) v = pD; } rD[h] = v; } }); return rD; }); resolve(rows); } catch (err) { reject(err); } }; reader.onerror = err => reject(err); reader.readAsArrayBuffer(file); });

//     const handleFileChange = async (event) => {
//         resetModalState();
//         const file = event.target.files[0];
//         if (!file) return;

//         setSelectedFile(file); // Shows "Selected: filename" in the label
//         setIsParsing(true);
//         setError('');
//         setSuccessMessage(''); // Clear previous success message

//         try {
//             let dataArray = [];
//             if (file.name.endsWith('.csv')) {
//                 dataArray = await parseCSV(file);
//             } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
//                 dataArray = await parseExcel(file);
//             } else {
//                 throw new Error('Unsupported file type. Please upload CSV or Excel files.');
//             }

//             const cleanedData = dataArray.filter(row => typeof row === 'object' && row !== null && EXPECTED_PRODUCT_FIELDS.some(field => row.hasOwnProperty(field) && row[field] !== undefined && row[field] !== null && String(row[field]).trim() !== '')).map(row => { const cR = {}; EXPECTED_PRODUCT_FIELDS.forEach(f => { cR[f] = row[f]; }); return cR; });

//             if (cleanedData.length === 0) {
//                 setError('File processed, but no valid product data found based on expected headers.');
//                 setParsedData([]);
//             } else {
//                 setParsedData(cleanedData);
//                 // Set the success message here
//                 setSuccessMessage(`File "${file.name}" processed. ${cleanedData.length} valid product(s) ready for upload.`);
//                 console.log("Parsed data for upload:", cleanedData);
//             }
//         } catch (err) {
//             console.error("File parsing error:", err);
//             setError(`Error parsing file: ${err.message}`);
//             setParsedData([]);
//         } finally {
//             setIsParsing(false);
//         }
//     };

//     const handleConfirm = () => {
//         if (parsedData.length > 0 && !error) {
//             onUploadConfirm(parsedData);
//             // Parent (AddProductPage) will now close the modal and show its own final success/error message
//         } else if (error) {
//             alert("Cannot upload due to parsing errors. Please fix the file or select a new one.");
//         } else {
//             alert("Please select and process a file first.");
//         }
//     };

//     const handleModalClose = () => {
//         resetModalState();
//         onClose();
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={handleModalClose} title="Bulk Upload Products">
//             <div className={styles.modalContent}>
//                 <div className={styles.fileInputSection}>
//                     <label htmlFor="bulk-file-upload" className={styles.fileInputLabelButton}>
//                         {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose CSV or Excel File'}
//                     </label>
//                     <input
//                         type="file"
//                         id="bulk-file-upload"
//                         ref={fileInputRef}
//                         onChange={handleFileChange}
//                         accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
//                         className={styles.fileInputHidden}
//                     />
//                      <small className={styles.fileHint}>Headers: sku, name, categoryName, sellingPrice, currentStock, etc.</small>
//                 </div>

//                 {isParsing && <Spinner message="Processing file..." />}
//                 {/* Display success message (from parsing) or errors */}
//                 {successMessage && !error && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
//                 {error && <Alert type="error" message={error} onClose={() => setError('')} />}

//                 {/* Preview section has been removed */}

//                 <div className={styles.modalActions}>
//                     <Button onClick={handleModalClose} variant="secondary" disabled={isParsing}>
//                         Cancel
//                     </Button>
//                     <Button
//                         onClick={handleConfirm}
//                         variant="primary"
//                         disabled={isParsing || parsedData.length === 0 || !!error}
//                     >
//                         Confirm & Upload
//                     </Button>
//                 </div>
//             </div>
//         </Modal>
//     );
// }

// export default BulkUploadModal;

// src/components/BulkUploadModal/BulkUploadModal.js
// src/components/BulkUploadModal/BulkUploadModal.js
import React, { useState, useRef, useEffect } from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import Alert from '../Alert/Alert';
import styles from './BulkUploadModal.module.css';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const EXPECTED_PRODUCT_FIELDS = [
    'sku', 'name', 'description', 'categoryName',
    'manufactureDate', 'expiryDate', 'costPrice', 'sellingPrice',
    'discountPercentage', 'mrp', 'currentStock', 'lowStockThreshold'
];

function BulkUploadModal({ isOpen, onClose, onUploadConfirm, categories = [] }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const fileInputRef = useRef(null);

    // Effect to reset state when modal opens or closes
    useEffect(() => {
        console.log("BULK MODAL: isOpen prop changed to:", isOpen);
        if (isOpen) {
            console.log("BULK MODAL: Modal opened, resetting internal state.");
            // Reset everything needed for a fresh modal interaction
            setSelectedFile(null);
            setParsedData([]);
            setError('');
            setSuccessMessage('');
            setIsParsing(false);
            // Ensure file input is cleared for new selection
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [isOpen]);


    // Function to reset states specifically before processing a new file
    const resetForNewFileProcessing = () => {
        setParsedData([]);
        setError('');
        setSuccessMessage('');
        setIsParsing(false);
        // DO NOT reset fileInputRef.current.value here, as the file is already in event.target
    };

    const mapHeader = (header) => {
        if (header === null || header === undefined) return '';
        const lowerHeader = String(header).toLowerCase().replace(/\s+/g, '').replace(/[^\w]/gi, '');
        if (lowerHeader.includes('sku') || lowerHeader.includes('productid')) return 'sku';
        if (lowerHeader.includes('name') && !lowerHeader.includes('category')) return 'name';
        if (lowerHeader.includes('description')) return 'description';
        if (lowerHeader.includes('category')) return 'categoryName';
        if (lowerHeader.includes('manufacture') || lowerHeader.includes('mfd') || lowerHeader.includes('mfg')) return 'manufactureDate';
        if (lowerHeader.includes('expiry') || lowerHeader.includes('exp')) return 'expiryDate';
        if (lowerHeader.includes('cost')) return 'costPrice';
        if (lowerHeader.includes('selling') || lowerHeader.includes('sellprice')) return 'sellingPrice';
        if (lowerHeader.includes('discount')) return 'discountPercentage';
        if (lowerHeader.includes('mrp')) return 'mrp';
        if (lowerHeader.includes('currentstock') || (lowerHeader.includes('stock') && !lowerHeader.includes('threshold') && !lowerHeader.includes('low'))) return 'currentStock';
        if (lowerHeader.includes('threshold') || lowerHeader.includes('lowstock')) return 'lowStockThreshold';
        const expectedMatch = EXPECTED_PRODUCT_FIELDS.find(expected => lowerHeader.includes(expected.toLowerCase()));
        if (expectedMatch) return expectedMatch;
        return String(header).trim();
    };

    const parseCSV = (file) => new Promise((resolve, reject) => { /* ... (same as previous correct version) ... */
        Papa.parse(file, { header: true, skipEmptyLines: true, transformHeader: h => mapHeader(h), complete: r => r.errors.length ? reject(new Error(r.errors.map(e => `Row ${e.row}: ${e.message} (${e.code})`).join('\n '))) : resolve(r.data), error: e => reject(e) });
    });
    const parseExcel = (file) => new Promise((resolve, reject) => { /* ... (same as previous correct version) ... */
        const reader = new FileReader(); reader.onload = (e) => { try { const data = e.target.result; const wb = XLSX.read(data, { type: 'array', cellDates: true }); const wsName = wb.SheetNames[0]; const ws = wb.Sheets[wsName]; const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: undefined, raw: false }); if (jsonData.length < 2) { resolve([]); return; } const rawHeaders = jsonData[0]; const mappedHeaders = rawHeaders.map(h => mapHeader(h)); const rows = jsonData.slice(1).map(rA => { const rD = {}; mappedHeaders.forEach((h, i) => { if (EXPECTED_PRODUCT_FIELDS.includes(h)) { let v = rA[i]; if ((h === 'manufactureDate' || h === 'expiryDate') && v && !(v instanceof Date)) { const pD = new Date(v); if (!isNaN(pD.getTime())) v = pD; } rD[h] = v; } }); return rD; }); resolve(rows); } catch (err) { reject(err); } }; reader.onerror = err => reject(err); reader.readAsArrayBuffer(file);
    });

    const handleFileChange = async (event) => {
        console.log("BULK MODAL: handleFileChange triggered");
        const file = event.target.files[0]; // Get the file FIRST

        // Reset states for new file processing, but keep the selected file info for now
        resetForNewFileProcessing();

        if (!file) {
            console.log("BULK MODAL: No file selected from event.");
            setSelectedFile(null); // Clear selected file if selection was cancelled
            return;
        }

        setSelectedFile(file); // Set the new file
        setIsParsing(true);
        console.log("BULK MODAL: File selected -", file.name, ". Parsing started.");

        try {
            let dataArray = [];
            if (file.name.endsWith('.csv')) {
                dataArray = await parseCSV(file);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                dataArray = await parseExcel(file);
            } else {
                throw new Error('Unsupported file type. Please upload CSV or Excel files.');
            }

            console.log("BULK MODAL: Raw parsed data from parser function:", dataArray);

            const cleanedData = dataArray.filter(row => typeof row === 'object' && row !== null && EXPECTED_PRODUCT_FIELDS.some(field => row.hasOwnProperty(field) && row[field] !== undefined && row[field] !== null && String(row[field]).trim() !== '')).map(row => { const cR = {}; EXPECTED_PRODUCT_FIELDS.forEach(f => { cR[f] = row[f]; }); return cR; });

            console.log("BULK MODAL: Cleaned data count:", cleanedData.length);

            if (cleanedData.length === 0) {
                setError('File processed, but no valid product data found. Check headers and data format.');
                setParsedData([]);
            } else {
                setParsedData(cleanedData);
                setSuccessMessage(`File "${file.name}" processed. ${cleanedData.length} valid product(s) ready for upload.`);
                console.log("BULK MODAL: Parsed data set for upload:", cleanedData.slice(0, 2));
            }
        } catch (err) {
            console.error("BULK MODAL: File parsing error in handleFileChange:", err);
            setError(`Error parsing file: ${err.message}`);
            setParsedData([]); // Clear parsed data on error
        } finally {
            setIsParsing(false);
            console.log("BULK MODAL: Parsing finished.");
            // It's important to reset the input's value here (or on modal close)
            // so that selecting the same file again triggers the onChange event.
            if (event.target) {
                event.target.value = null; // Or use fileInputRef.current.value = '' if event.target is not reliable here
            }
        }
    };

    const handleConfirm = () => {
        if (parsedData.length > 0 && !error) {
            console.log("BULK MODAL: Confirming upload with data:", parsedData);
            onUploadConfirm(parsedData);
        } else if (error) {
            alert("Cannot upload due to parsing errors. Please check the file or select a new one.");
        } else {
            alert("No data to upload. Please select and process a file first.");
        }
    };

    // This function is called by the <Modal> component's onClose prop
    const handleModalCloseTrigger = () => {
        console.log("BULK MODAL: handleModalCloseTrigger called by Modal's onClose.");
        // The useEffect hook listening to `isOpen` will also fire and do similar reset,
        // but explicit reset here ensures file input is cleared if modal is closed via backdrop/esc.
        setSelectedFile(null);
        setParsedData([]);
        setError('');
        setSuccessMessage('');
        setIsParsing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose(); // Call the parent's onClose handler
    };


    return (
        <Modal isOpen={isOpen} onClose={handleModalCloseTrigger} title="Bulk Upload Products">
            <div className={styles.modalContent}>
                <div className={styles.fileInputSection}>
                    <label htmlFor="bulk-file-upload" className={styles.fileInputLabelButton}>
                        {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose CSV or Excel File'}
                    </label>
                    <input
                        type="file"
                        id="bulk-file-upload"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        className={styles.fileInputHidden}
                    // Adding a key that changes can also help force reset, but clearing value is better
                    // key={selectedFile ? selectedFile.name : 'no-file'}
                    />
                    <small className={styles.fileHint}>Headers: sku, name, categoryName, sellingPrice, currentStock, etc.</small>
                </div>

                {isParsing && <Spinner message="Processing file..." />}
                {successMessage && !error && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                {/* Preview table is removed as per request */}

                <div className={styles.modalActions}>
                    <Button onClick={handleModalCloseTrigger} variant="secondary" disabled={isParsing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="primary"
                        disabled={isParsing || parsedData.length === 0 || !!error}
                    >
                        Confirm & Upload
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default BulkUploadModal;