import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wallet, Download, AlertTriangle, Gauge, Zap, Fuel, Flame, 
  Check, Edit2, CreditCard, Banknote, HelpCircle, TrendingUp, Database
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useSettings } from '../context/SettingsContext';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Finance() {
  const { t, fuelPrices: prices, setFuelPrices: setPrices } = useSettings();
  const [activeTab, setActiveTab] = useState('gas'); // 'gas' | 'petrol'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Live telemetry state from old hardware page
  const [liveData, setLiveData] = useState({
    compressorPressureBar: 0,
    propaneRemainingPercent: 0,
  });

  const [isEditing, setIsEditing] = useState(null);
  const [tempPrice, setTempPrice] = useState('');
  const [selectedPaymentType, setSelectedPaymentType] = useState('Hammasi');

  // Static mock targets for finance metrics
  const gasFinanceMetrics = {
    methane: { target: 15000000 },
    propane: { target: 5000000 }
  };

  // Petrol tanks configurations (current levels)
  const [petrolTanks, setPetrolTanks] = useState(() => {
    const saved = localStorage.getItem('reservoirLevels');
    if (saved) return JSON.parse(saved);
    const initial = {
      'AI-80': { current: 5200, max: 10000 },
      'AI-92': { current: 15200, max: 20000 },
      'AI-95': { current: 8400, max: 10000 },
      'AI-98': { current: 4520, max: 5000 },
      'AI-100': { current: 2100, max: 5000 }
    };
    localStorage.setItem('reservoirLevels', JSON.stringify(initial));
    return initial;
  });

  useEffect(() => {
    // 1. Fetch live telemetry data
    const fetchLive = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3000/api/dashboard/live');
        setLiveData(res.data);
      } catch (err) {
        console.error("Error fetching live hardware data", err);
      }
    };

    // 2. Fetch transaction logs
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const mockLogs = [
          { id: 1, dateTime: '2026-07-09 15:42', fuelType: 'Metan', volume: '35 m³', amount: 133000, paymentType: 'Karta' },
          { id: 2, dateTime: '2026-07-09 15:30', fuelType: 'AI-92', volume: '40 L', amount: 420000, paymentType: 'Naqd pul' },
          { id: 3, dateTime: '2026-07-09 14:15', fuelType: 'Propan', volume: '25 L', amount: 137500, paymentType: 'Aralash' },
          { id: 4, dateTime: '2026-07-09 12:05', fuelType: 'Metan', volume: '45 m³', amount: 171000, paymentType: 'Karta' },
          { id: 5, dateTime: '2026-07-09 11:20', fuelType: 'AI-80', volume: '20 L', amount: 170000, paymentType: 'Naqd pul' }
        ];
        setTransactions(mockLogs);
      } catch (err) {
        console.error("Error fetching financial data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLive();
    fetchTransactions();

    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  const handleEditPrice = (type) => {
    setIsEditing(type);
    setTempPrice(prices[type].toString());
  };

  const handleSavePrice = (type) => {
    if (tempPrice) {
      setPrices({ ...prices, [type]: parseInt(tempPrice, 10) });
    }
    setIsEditing(null);
  };

  const handleDownloadReport = () => {
    const headers = 'Sana va Vaqt,Yoqilg\'i turi,Hajmi,Umumiy summa (UZS),To\'lov turi\n';
    const rows = transactions.map(t => `${t.dateTime},${t.fuelType},${t.volume},${t.amount},${t.paymentType}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EcoGas_Moliya_Hisoboti_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter transactions based on selected tab
  const filteredTransactions = transactions.filter(tx => {
    if (selectedPaymentType === 'Hammasi') return true;
    return tx.paymentType === selectedPaymentType;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <Wallet className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moliya</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Moliyaviy hisobotlar va tushumlar nazorati</p>
          </div>
        </div>
        
        {/* Toggle & Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('gas')}
              className={cn(
                "flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                activeTab === 'gas'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Flame className="w-4 h-4" />
              <span>{t('gas')}</span>
            </button>
            <button
              onClick={() => setActiveTab('petrol')}
              className={cn(
                "flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                activeTab === 'petrol'
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Fuel className="w-4 h-4" />
              <span>{t('petrol')}</span>
            </button>
            <button
              onClick={() => setActiveTab('electric')}
              className={cn(
                "flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                activeTab === 'electric'
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Activity className="w-4 h-4" />
              <span>Elektr</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDownloadReport}
              className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Hisobotni yuklash</span>
            </button>

            <button className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-red-500 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-all shadow-sm text-sm">
              <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" />
              <span>E-STOP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Telemetry Grid */}
      {activeTab === 'gas' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Methane Telemetry (Compressor Pressure) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('compressor_pressure')}</h3>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="text-gray-200 dark:text-gray-700 stroke-current" strokeWidth="8" fill="none" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className={cn("stroke-current transition-all duration-1000", liveData.compressorPressureBar < 180 ? "text-red-500" : "text-green-500")}
                    strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={251 - (251 * Math.min(liveData.compressorPressureBar, 250)) / 250} 
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">{liveData.compressorPressureBar}</span>
                  <span className="block text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">bar</span>
                </div>
              </div>
              {liveData.compressorPressureBar < 180 && (
                <p className="mt-4 text-red-500 font-medium">{t('pressure_low_warning')}</p>
              )}
            </div>
          </div>

          {/* Metan Gaz Qoldig'i (Methane Storage Remaining) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Metan Zaxirasi Qoldig'i</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center pb-4">
              <span className="text-4xl font-black text-gray-900 dark:text-white mb-6">
                4,800 <span className="text-sm font-normal text-gray-500">m³</span>
              </span>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center">
                Sig'im to'laligi: <span className="font-bold text-gray-900 dark:text-white">80%</span> (Maks: 6,000 m³)
              </p>
            </div>
          </div>

          {/* Propane Telemetry (Tank Level) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('propane_storage')}</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center h-full pb-8">
              <span className="text-5xl font-black text-gray-900 dark:text-white mb-6">
                {liveData.propaneRemainingPercent.toFixed(1)}%
              </span>
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000",
                    liveData.propaneRemainingPercent < 20 ? "bg-red-500" : "bg-orange-500"
                  )}
                  style={{ width: `${liveData.propaneRemainingPercent}%` }}
                ></div>
              </div>
              {liveData.propaneRemainingPercent < 20 && (
                <p className="mt-4 text-red-500 font-medium">{t('stock_low_warning')}</p>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'petrol' ? (
        /* Petrol Tanks Remaning Levels */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Object.entries(petrolTanks).map(([tank, data]) => {
            const percent = (data.current / data.max) * 100;
            return (
              <div key={tank} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                      <Fuel className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tank}</h3>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center h-32">
                  <span className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                    {data.current} <span className="text-sm font-normal text-gray-500">L</span>
                  </span>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", percent < 20 ? "bg-red-500" : "bg-amber-400")} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Electric Station Status / kW sales summary cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Elektr Stansiyasi Holati</h3>
            </div>
            <div className="flex flex-col justify-center pb-4 space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-750">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Quvvatlash Porti #1</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">FAOL</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-gray-55/50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-750">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Quvvatlash Porti #2</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400">FAOL</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bugungi Elektr Sarfi</h3>
            </div>
            <div className="flex flex-col items-center justify-center pb-4">
              <span className="text-4xl font-black text-gray-900 dark:text-white mb-6">
                320.5 <span className="text-sm font-normal text-gray-500">kW</span>
              </span>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center">
                Kundalik yuklama: <span className="font-bold text-gray-900 dark:text-white">45%</span> (Maks: 700 kW)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Price Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('price_mgmt')} ({activeTab === 'gas' ? t('gas') : activeTab === 'petrol' ? t('petrol') : 'Elektr'})
          </h3>
        </div>
        
        <div className="space-y-4">
          {(activeTab === 'gas' ? ['METHANE', 'PROPANE'] : activeTab === 'petrol' ? ['AI_80', 'AI_92', 'AI_95', 'AI_98', 'AI_100'] : ['ELECTRIC']).map((type) => {
            const displayNames = {
              METHANE: `${t('methane')} (1 m³)`,
              PROPANE: `${t('propane')} (1 L)`,
              AI_80: 'AI-80 (1 L)',
              AI_92: 'AI-92 (1 L)',
              AI_95: 'AI-95 (1 L)',
              AI_98: 'AI-98 (1 L)',
              AI_100: 'AI-100 (1 L)',
              ELECTRIC: 'Elektr (1 kW)'
            };
            return (
              <div key={type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{displayNames[type]}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('current_price')}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  {isEditing === type ? (
                    <>
                      <input 
                        type="number" 
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-24 p-2 text-right bg-white dark:bg-gray-800 border border-primary-500 rounded-lg text-gray-900 dark:text-white focus:outline-none"
                      />
                      <button onClick={() => handleSavePrice(type)} className="p-2 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 rounded-lg hover:bg-green-200">
                        <Check className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{prices[type]} <span className="text-sm font-normal text-gray-500">UZS</span></span>
                      <button onClick={() => handleEditPrice(type)} className="p-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Financial Reports & Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Batafsil Hisobotlar va Tranzaksiyalar</h3>
          
          {/* Segmented Control for Payment Type Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit">
            {['Hammasi', 'Karta', 'Naqd pul', 'Aralash'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedPaymentType(type)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  selectedPaymentType === type
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 text-sm font-semibold">
                <th className="pb-4">Sana va Vaqt</th>
                <th className="pb-4">Yoqilg'i turi</th>
                <th className="pb-4">Hajmi</th>
                <th className="pb-4 text-right">Umumiy summa</th>
                <th className="pb-4 pl-8">To'lov turi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="py-4 text-sm font-medium">{tx.dateTime}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-bold",
                      tx.fuelType.includes('Metan') ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      tx.fuelType.includes('Propan') ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {tx.fuelType}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-semibold">{tx.volume}</td>
                  <td className="py-4 text-sm font-black text-right text-gray-900 dark:text-white">{formatCurrency(tx.amount)} UZS</td>
                  <td className="py-4 pl-8">
                    <span className="flex items-center space-x-1.5 text-sm">
                      {tx.paymentType === 'Karta' && <CreditCard className="w-4 h-4 text-blue-500" />}
                      {tx.paymentType === 'Naqd pul' && <Banknote className="w-4 h-4 text-emerald-500" />}
                      {tx.paymentType === 'Aralash' && <HelpCircle className="w-4 h-4 text-purple-500" />}
                      <span>{tx.paymentType}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
