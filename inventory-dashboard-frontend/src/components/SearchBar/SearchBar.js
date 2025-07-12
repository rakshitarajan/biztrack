import React, { useState } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = ({ onSearch, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
      />
      {searchTerm && (
        <button onClick={() => { setSearchTerm(''); onSearch(''); }} title="Clear search">
        × {/* HTML entity for X */}
        {/* Or use an icon: <FaTimes /> */}
        </button>
        //<button onClick={() => { setSearchTerm(''); onSearch(''); }}>Clear</button>
      )}
    </div>
  );
};

export default SearchBar;