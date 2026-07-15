import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, Landmark, Download, CreditCard, 
  Banknote, HelpCircle, FileText, Calendar 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useSettings } from '../context/SettingsContext';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Reports() {
  const { t } = useSettings();
  const [transactions, setTransactions] = useState([]);
  const [transactionType, setTransactionType] = useState('Hammasi'); // 'Hammasi' | 'Kirim' | 'Chiqim'
  const [selectedCategory, setSelectedCategory] = useState('Barcha');
  const [loading, setLoading] = useState(true);

  // Financial summary numbers
  const summary = {
    totalInflow: 114500000,
    totalOutflow: 38200000,
    netProfit: 76300000
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const mockLogs = [
          { id: 1, dateTime: '2026-07-10 09:30', fuelType: 'Metan', volume: '35 m³', amount: 133000, paymentType: 'Karta', type: 'Kirim', category: 'Yoqilg\'i sotuvi' },
          { id: 2, dateTime: '2026-07-10 09:12', fuelType: 'AI-92', volume: '40 L', amount: 420000, paymentType: 'Naqd pul', type: 'Kirim', category: 'Yoqilg\'i sotuvi' },
          { id: 3, dateTime: '2026-07-10 08:45', fuelType: 'Propan', volume: '25 L', amount: 137500, paymentType: 'Aralash', type: 'Kirim', category: 'Yoqilg\'i sotuvi' },
          { id: 4, dateTime: '2026-07-10 08:20', fuelType: 'Metan', volume: '45 m³', amount: 171000, paymentType: 'Karta', type: 'Kirim', category: 'Yoqilg\'i sotuvi' },
          { id: 5, dateTime: '2026-07-09 17:15', fuelType: 'AI-80', volume: '20 L', amount: 170000, paymentType: 'Naqd pul', type: 'Kirim', category: 'Yoqilg\'i sotuvi' },
          { id: 8, dateTime: '2026-07-09 16:50', fuelType: 'Elektr', volume: '40 kW', amount: 48000, paymentType: 'Karta', type: 'Kirim', category: 'Yoqilg\'i sotuvi' },
          { id: 6, dateTime: '2026-07-09 16:30', fuelType: '---', volume: '---', amount: 4500000, paymentType: 'Naqd pul', type: 'Chiqim', category: 'Xodim oyligi' },
          { id: 7, dateTime: '2026-07-09 12:00', fuelType: '---', volume: '---', amount: 35000000, paymentType: 'Karta', type: 'Chiqim', category: 'Yoqilg\'i xaridi' }
        ];
        setTransactions(mockLogs);
      } catch (err) {
        console.error("Error fetching logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = transactionType === 'Hammasi' || tx.type === transactionType;
    const matchesCategory = selectedCategory === 'Barcha' || tx.category === selectedCategory;
    return matchesType && matchesCategory;
  });

  const handleDownloadReport = () => {
    // 1. Filter the data exactly like the table view
    const filteredData = transactions.filter(item => {
      const matchesType = transactionType === 'Hammasi' || item.type === transactionType;
      const matchesCategory = selectedCategory === 'Barcha' || selectedCategory === 'Barcha kategoriyalar' || item.category === selectedCategory;
      return matchesType && matchesCategory;
    });

    // 2. Convert filteredData to CSV format
    const headers = ["Sana va Vaqt", "Yoqilg'i turi", "Hajmi", "Umumiy summa", "To'lov turi", "Kategoriya"];
    const csvRows = [
      headers.join(","), // insert headers
      ...filteredData.map(row => [
        row.dateTime,
        row.fuelType,
        row.volume,
        row.amount,
        row.paymentType,
        row.category
      ].join(","))
    ].join("\n");

    // 3. Create a download link and trigger it
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Sanitize category name for filename
    const cleanCategory = selectedCategory.replace(/['\s]/g, '_');
    const filename = `Moliya_Hisobot_${transactionType}_${cleanCategory}_${new Date().toISOString().split('T')[0]}.csv`;
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Moliyaviy Hisobotlar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Tushumlar, chiqimlar va sof foyda hisobotlari tahlili</p>
        </div>
        <button 
          onClick={handleDownloadReport}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] w-fit"
        >
          <Download className="w-5 h-5" />
          <span>Hisobotni yuklash</span>
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inflow Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Umumiy Kirim</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {formatCurrency(summary.totalInflow)} <span className="text-xs font-normal text-gray-500">UZS</span>
            </h3>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Outflow Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Umumiy Chiqim</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {formatCurrency(summary.totalOutflow)} <span className="text-xs font-normal text-gray-500">UZS</span>
            </h3>
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Net Foyda</p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(summary.netProfit)} <span className="text-xs font-normal text-gray-500">UZS</span>
            </h3>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Landmark className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Batafsil Hisobotlar va Tranzaksiyalar Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Batafsil Hisobotlar va Tranzaksiyalar</h3>
          
          {/* Segmented Switch for Transaction Type and Category Dropdown */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Kirim/Chiqim Tabs */}
            <div className="flex bg-gray-105 dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              {['Hammasi', 'Kirim', 'Chiqim'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTransactionType(type)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    transactionType === type
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-550 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Categories Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-105 dark:bg-gray-900 text-gray-800 dark:text-slate-200 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
            >
              <option value="Barcha">Barcha kategoriyalar</option>
              <option value="Yoqilg'i sotuvi">Yoqilg'i sotuvi</option>
              <option value="Yoqilg'i xaridi">Yoqilg'i xaridi</option>
              <option value="Inkassatsiya">Inkassatsiya</option>
              <option value="Xodim oyligi">Xodim oyligi</option>
              <option value="Boshqa">Boshqa</option>
            </select>
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
                  <td className="py-4 text-sm font-black text-right text-gray-900 dark:text-white">
                    <div className="flex items-center justify-end space-x-2">
                      <span>{formatCurrency(tx.amount)} UZS</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        tx.type === 'Kirim'
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}>
                        {tx.type}
                      </span>
                    </div>
                  </td>
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
