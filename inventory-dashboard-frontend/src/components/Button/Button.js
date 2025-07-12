import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, className, disabled, type = 'button' }) => {
  const buttonClassName = `${styles.button} ${className || ''}`;
  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClassName}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;