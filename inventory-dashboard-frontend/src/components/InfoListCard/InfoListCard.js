// src/components/InfoListCard/InfoListCard.js
import React from 'react';
// No need to import Link here if DashboardPage provides the full Link component
import styles from './InfoListCard.module.css';

const InfoListCard = ({ title, items = [], emptyMessage = "No items to display." }) => {
  return (
    <div className={styles.listCard}>
      <h3 className={styles.listTitle}>{title}</h3>
      {items.length > 0 ? (
        <ul className={styles.itemList}>
          {items.map((item) => (
            <li key={item.id} className={styles.listItem}>
              {/* Render item.content if it exists (which holds the Link), otherwise item.name */}
              {item.content || item.name}
              {item.details && <span className={styles.itemDetails}> {item.details}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      )}
    </div>
  );
};

export default InfoListCard;