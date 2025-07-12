import React from 'react';
// Import the NEW module CSS for StatCard
import styles from './StatCard.module.css';

const StatCard = ({ title, value, label }) => { // Accept label instead of title if needed based on image
  return (
    // Use class names from StatCard.module.css
    <div className={styles.statCard}>
      {/* Use label from image, maps better than 'title' */}
      <h3 className={styles.cardTitle}>{label || title}</h3>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
};

export default StatCard;