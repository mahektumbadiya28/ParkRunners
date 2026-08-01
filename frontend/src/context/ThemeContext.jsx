import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('parkrunners-theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Default to light mode or check OS preference if you prefer
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both to ensure clean state
    root.classList.remove('light', 'dark');
    
    // Add the active theme class
    root.classList.add(theme);
    
    // Save to local storage
    localStorage.setItem('parkrunners-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
