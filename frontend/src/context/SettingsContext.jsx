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

  const [fuels, setFuels] = useState(() => {
    const initialFuels = [
      { id: 'methane', name: 'Metan (Methane)', category: 'GAZ', unit: 'm³', price: 3800, remaining: 42500, maxCapacity: 60000 },
      { id: 'propane', name: 'Propan (Propane)', category: 'GAZ', unit: 'L', price: 6200, remaining: 18200, maxCapacity: 30000 },
      { id: 'ai80', name: 'Benzin AI-80', category: 'BENZIN', unit: 'L', price: 8200, remaining: 15000, maxCapacity: 40000 },
      { id: 'ai92', name: 'Benzin AI-92', category: 'BENZIN', unit: 'L', price: 10500, remaining: 24000, maxCapacity: 50000 },
      { id: 'ai95', name: 'Benzin AI-95', category: 'BENZIN', unit: 'L', price: 12800, remaining: 11500, maxCapacity: 30000 },
      { id: 'ai98', name: 'Benzin AI-98', category: 'BENZIN', unit: 'L', price: 14500, remaining: 8000, maxCapacity: 20000 },
      { id: 'ai100', name: 'Benzin AI-100', category: 'BENZIN', unit: 'L', price: 16800, remaining: 5000, maxCapacity: 15000 },
      { id: 'elektr', name: 'Elektr (DC Fast)', category: 'ELEKTR', unit: 'kWh', price: 2200, remaining: 99999, maxCapacity: 100000 },
    ];
    const saved = localStorage.getItem('ecogas_fuels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If parsed is missing the newly added fuels, we can merge them or just trust parsed if it's there.
        // For now, we trust parsed, but the user might not see new ones if they already saved state.
        // To force update, we could merge. A simple way:
        const merged = initialFuels.map(f => {
          const existing = parsed.find(pf => pf.id === f.id);
          return existing ? existing : f;
        });
        return merged;
      } catch (e) {
        return initialFuels;
      }
    }
    return initialFuels;
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

  useEffect(() => {
    localStorage.setItem('ecogas_fuels', JSON.stringify(fuels));
  }, [fuels]);

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
      fuels, setFuels,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
