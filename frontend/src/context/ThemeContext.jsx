import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [eyeProtection, setEyeProtection] = useState(
    localStorage.getItem('eyeProtection') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('eyeProtection', eyeProtection);
    const root = document.documentElement;
    if (eyeProtection) {
      root.classList.add('eye-protection-active');
    } else {
      root.classList.remove('eye-protection-active');
    }
  }, [eyeProtection]);

  const toggleTheme = (newTheme) => setTheme(newTheme);
  const toggleEyeProtection = () => setEyeProtection(!eyeProtection);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, eyeProtection, toggleEyeProtection }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
