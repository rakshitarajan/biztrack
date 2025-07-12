import React from 'react';
import styles from './ChartWrapper.module.css';

const ChartWrapper = ({ children, className }) => {
  const wrapperClassName = `${styles.chartWrapper} ${className || ''}`;
  return (
    <div className={wrapperClassName}>
      {children}
    </div>
  );
};

export default ChartWrapper;