import React, { createContext, useState } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Example: const [theme, setTheme] = useState('light');

  return (
    <AppContext.Provider value={{ /* Add global state and functions here */ }}>
      {children}
    </AppContext.Provider>
  );
};