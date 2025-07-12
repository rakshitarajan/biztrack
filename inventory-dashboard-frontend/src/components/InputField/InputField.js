import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ label, type = 'text', id, value, onChange, required, placeholder }) => {
  return (
    <div className={styles.inputField}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputField;