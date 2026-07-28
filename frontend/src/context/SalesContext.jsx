import React, { createContext, useContext, useState, useEffect } from 'react';

const SalesContext = createContext();

export const useSales = () => {
  return useContext(SalesContext);
};

export const SalesProvider = ({ children }) => {
  // Try to load initial sales from localStorage
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('globalSalesTransactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('globalSalesTransactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (tx) => {
    // tx structure: { id, timestamp, fuelId, category, volume, pricePerUnit, totalSum, paymentMethod }
    setTransactions(prev => [
      { ...tx, timestamp: new Date().toISOString() }, 
      ...prev
    ]);
  };

  const getDashboardStats = () => {
    // Filter transactions for "today"
    const today = new Date().toDateString();
    const todaysTx = transactions.filter(tx => new Date(tx.timestamp).toDateString() === today);

    let totalRevenue = 0;
    const paymentBreakdown = { cash: 0, card: 0, click: 0, mixed: 0 };
    
    // Structure strictly based on expected dashboard consumption
    const fuelSplit = {
      METHANE: { volume: 0, revenue: 0 },
      PROPANE: { volume: 0, revenue: 0 },
      AI_80: { volume: 0, revenue: 0 },
      AI_92: { volume: 0, revenue: 0 },
      AI_95: { volume: 0, revenue: 0 },
      AI_98: { volume: 0, revenue: 0 },
      AI_100: { volume: 0, revenue: 0 },
      ELECTRIC: { volume: 0, revenue: 0 },
    };

    todaysTx.forEach(tx => {
      totalRevenue += tx.totalSum || 0;
      
      const method = tx.paymentMethod?.toLowerCase() || 'cash';
      if (method.includes('naqd') || method === 'cash') paymentBreakdown.cash += tx.totalSum;
      else if (method.includes('karta') || method === 'card') paymentBreakdown.card += tx.totalSum;
      else if (method.includes('click')) paymentBreakdown.click += tx.totalSum;
      else if (method.includes('aralash') || method === 'mixed') paymentBreakdown.mixed += tx.totalSum;
      else paymentBreakdown.cash += tx.totalSum;

      // Map fuelId to our fuelSplit structure
      const fId = tx.fuelId?.toUpperCase().replace('-', '_'); // e.g. "ai-92" -> "AI_92"
      if (fuelSplit[fId]) {
        fuelSplit[fId].volume += tx.volume || 0;
        fuelSplit[fId].revenue += tx.totalSum || 0;
      } else if (fId === 'METAN') {
        fuelSplit.METHANE.volume += tx.volume;
        fuelSplit.METHANE.revenue += tx.totalSum;
      } else if (fId === 'PROPAN') {
        fuelSplit.PROPANE.volume += tx.volume;
        fuelSplit.PROPANE.revenue += tx.totalSum;
      }
    });

    return {
      totalRevenue,
      paymentBreakdown,
      fuelSplit
    };
  };

  return (
    <SalesContext.Provider value={{ transactions, addTransaction, getDashboardStats, setTransactions }}>
      {children}
    </SalesContext.Provider>
  );
};
