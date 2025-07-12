import React from 'react';
import styles from './Card.module.css';

const Card = ({ children, className }) => {
  const cardClassName = `${styles.card} ${className || ''}`;
  return (
    <div className={cardClassName}>
      {children}
    </div>
  );
};

export default Card;