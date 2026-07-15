import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'UZ');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'base');
  const [navFilter, setNavFilter] = useState('gas'); // 'gas' | 'petrol'
  
  // Permissions state
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : {
      salaryVisibility: false,
      hardwareVisibility: false
    };
  });

  const [fuelPrices, setFuelPrices] = useState(() => {
    const defaultPrices = {
      METHANE: 3800,
      PROPANE: 5500,
      AI_80: 8500,
      AI_92: 10500,
      AI_95: 12500,
      AI_98: 14000,
      AI_100: 16000,
      ELECTRIC: 1200
    };
    const saved = localStorage.getItem('fuelPrices');
    if (saved) {
      try {
        return { ...defaultPrices, ...JSON.parse(saved) };
      } catch (e) {
        return defaultPrices;
      }
    }
    return defaultPrices;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    const root = document.documentElement;
    // Remove previous font classes
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    // Add current font class
    root.classList.add(`text-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('fuelPrices', JSON.stringify(fuelPrices));
  }, [fuelPrices]);

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['UZ'][key] || key;
  };

  const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || 'ALL');

  useEffect(() => {
    localStorage.setItem('selectedBranchId', selectedBranchId);
  }, [selectedBranchId]);

  return (
    <SettingsContext.Provider value={{ 
      language, setLanguage, 
      fontSize, setFontSize,
      permissions, togglePermission,
      fuelPrices, setFuelPrices,
      navFilter, setNavFilter,
      selectedBranchId, setSelectedBranchId,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
