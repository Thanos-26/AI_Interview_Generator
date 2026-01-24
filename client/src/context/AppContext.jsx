import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [userEmail] = useState("bhanu@dev.com");

  // Sync theme with document class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <AppContext.Provider value={{ 
      darkMode, toggleTheme, 
      isConfigOpen, setIsConfigOpen,
      userEmail 
    }}>
      {children}
    </AppContext.Provider>
  );
};