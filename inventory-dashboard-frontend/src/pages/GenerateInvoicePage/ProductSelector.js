import React from 'react';
import styles from './GenerateInvoicePage.module.css'; // Assuming shared styles

const ProductSelector = ({ products, onSelect, selectedProducts }) => {
  return (
    <div className={styles.productSelector}>
      {/* Ensure products is an array before mapping */}
      {Array.isArray(products) && products.length > 0 && ( // Also check length > 0 before showing select
        <select
          onChange={(e) => {
              // Pass the selected product's _id
              if (e.target.value) { // Ensure a valid option was selected
                  onSelect(e.target.value);
              }
          }}
          value="" // Always reset select to placeholder after selection
          className={styles.productSelectDropdown} // Add styling if needed
        >
          <option value="" disabled>-- Select a product to add --</option>
          {products.map(product => (
            // Use product._id as the value and key
            // Use product.selling_price for display
            <option
              key={product._id}
              value={product._id}
              // Disable option if already selected OR if out of stock
              disabled={selectedProducts.includes(product._id) || product.stock <= 0}
            >
              {/* Display name, price, and maybe stock */}
              {product.name} - ₹{product.selling_price?.toFixed(2)} ({product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'})
            </option>
          ))}
        </select>
      )}
       {/* Message if no products are loaded or available */}
       {/* Corrected ESLint Warning: Added parentheses around the OR condition */}
       {(!Array.isArray(products) || products.length === 0) && (
           <p>No products available to select.</p>
       )}
    </div>
  );
};

export default ProductSelector;