import React from 'react';
import styles from './Alert.module.css';

const Alert = ({ type = 'info', message }) => {
  const alertClassName = `${styles.alert} ${styles[type]}`;
  return (
    message && <div className={alertClassName}>{message}</div>
  );
};

export default Alert;