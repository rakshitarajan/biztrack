// src/components/Modal/Modal.js
import React from 'react';
import styles from './Modal.module.css'; // Create this CSS file

// Basic Modal Structure
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null; // Don't render anything if modal is closed
  }

  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Overlay covers the whole screen
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* Modal content area */}
      <div className={styles.modalContent} onClick={handleContentClick}>
        <div className={styles.modalHeader}>
          {title && <h3 className={styles.modalTitle}>{title}</h3>}
          {/* Close button */}
          <button className={styles.closeButton} onClick={onClose}>
            × {/* Simple 'X' character */}
          </button>
        </div>
        <div className={styles.modalBody}>
          {children} {/* Render content passed to the modal */}
        </div>
      </div>
    </div>
  );
};

export default Modal;