import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Fuel, Zap, Edit2, Check, X, Battery, Droplets } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Tariffs() {
  const { fuels, setFuels, t } = useSettings();
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  const handleEditClick = (fuel) => {
    setEditingId(fuel.id);
    setEditPrice(fuel.price.toString());
  };

  const handleSavePrice = (id) => {
    const newPrice = parseFloat(editPrice);
    if (!isNaN(newPrice)) {
      setFuels((prev) =>
        prev.map((f) => (f.id === id ? { ...f, price: newPrice } : f))
      );
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'GAZ': return <Droplets className="w-6 h-6 text-blue-500" />;
      case 'BENZIN': return <Fuel className="w-6 h-6 text-orange-500" />;
      case 'ELEKTR': return <Zap className="w-6 h-6 text-yellow-500" />;
      default: return <Fuel className="w-6 h-6 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'GAZ': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border-blue-200 dark:border-blue-800';
      case 'BENZIN': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 border-orange-200 dark:border-orange-800';
      case 'ELEKTR': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const filteredFuels = fuels.filter(fuel => activeTab === 'all' || fuel.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <Fuel className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yoqilg'i va Tariflar</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Barcha yoqilg'i turlari bo'yicha narxlar va joriy zaxira hajmlarini boshqarish
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
            activeTab === 'all'
              ? "bg-indigo-500 text-white border-indigo-600 shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
        >
          Barchasi
        </button>
        <button
          onClick={() => setActiveTab('GAZ')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-2",
            activeTab === 'GAZ'
              ? "bg-blue-500 text-white border-blue-600 shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
          )}
        >
          <Droplets className="w-4 h-4" />
          Gaz
        </button>
        <button
          onClick={() => setActiveTab('BENZIN')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-2",
            activeTab === 'BENZIN'
              ? "bg-orange-500 text-white border-orange-600 shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400"
          )}
        >
          <Fuel className="w-4 h-4" />
          Benzin
        </button>
        <button
          onClick={() => setActiveTab('ELEKTR')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-2",
            activeTab === 'ELEKTR'
              ? "bg-yellow-500 text-white border-yellow-600 shadow-sm"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-gray-700 hover:text-yellow-600 dark:hover:text-yellow-400"
          )}
        >
          <Zap className="w-4 h-4" />
          Elektr
        </button>
      </div>

      {/* ── Fuel Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFuels.map((fuel) => {
          const percentage = Math.min(100, Math.max(0, (fuel.remaining / fuel.maxCapacity) * 100));
          return (
            <div key={fuel.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn("p-2.5 rounded-lg border", getCategoryColor(fuel.category))}>
                      {getCategoryIcon(fuel.category)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{fuel.name}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {fuel.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 my-6">
                  {/* Price Section */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Joriy Narx:</span>
                      {editingId === fuel.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button onClick={() => handleSavePrice(fuel.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {formatCurrency(fuel.price)} <span className="text-sm font-normal text-gray-500">UZS / {fuel.unit}</span>
                          </span>
                          <button
                            onClick={() => handleEditClick(fuel)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Storage / Remaining Section */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1"><Battery className="w-4 h-4"/> Zaxira:</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(fuel.remaining)} <span className="font-normal text-gray-500">/ {formatCurrency(fuel.maxCapacity)} {fuel.unit}</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          percentage < 15 ? "bg-red-500" : percentage < 40 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% qolgan</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
