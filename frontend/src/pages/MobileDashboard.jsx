import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Activity, Droplets, Flame, Fuel, Gauge } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';

const cn = (...inputs) => twMerge(clsx(inputs));

const PETROL_TYPES = [
  { id: 'AI80',  label: 'AI-80',  color: 'bg-amber-400',   textColor: 'text-amber-600 dark:text-amber-400',   bg: 'dark:bg-amber-900/30 bg-amber-50' },
  { id: 'AI92',  label: 'AI-92',  color: 'bg-orange-400',  textColor: 'text-orange-600 dark:text-orange-400', bg: 'dark:bg-orange-900/30 bg-orange-50' },
  { id: 'AI95',  label: 'AI-95',  color: 'bg-red-400',     textColor: 'text-red-600 dark:text-red-400',       bg: 'dark:bg-red-900/30 bg-red-50'     },
  { id: 'AI98',  label: 'AI-98',  color: 'bg-purple-400',  textColor: 'text-purple-600 dark:text-purple-400', bg: 'dark:bg-purple-900/30 bg-purple-50' },
  { id: 'AI100', label: 'AI-100', color: 'bg-emerald-400', textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'dark:bg-emerald-900/30 bg-emerald-50' },
];

export default function MobileDashboard() {
  const { t, navFilter, setNavFilter, fuelPrices } = useSettings();
  // MUST MATCH DESKTOP EXACTLY: Default is 'monthly'
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [gasTab, setGasTab] = useState('all'); 
  const [petrolTab, setPetrolTab] = useState('all'); 

  useEffect(() => {
    // NavFilter fallback for mobile
    if (!['gas', 'petrol', 'electric'].includes(navFilter)) {
      setNavFilter('gas');
    }

    // EXACT SAME DATA SOURCE AS DESKTOP DASHBOARD
    const fetchStats = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:3000/api/dashboard/stats?period=${period}`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    };
    
    fetchStats(true);
    const interval = setInterval(() => fetchStats(false), 5000);
    return () => clearInterval(interval);
  }, [period, navFilter, setNavFilter]);

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(Math.round(num || 0));

  return (
    <div className="space-y-6 pb-6">

      {/* ── Timeframe Filters (Top Right Match) ── */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
        {[
          { id: 'daily',   label: t('daily') },
          { id: 'weekly',  label: t('weekly') },
          { id: 'monthly', label: t('monthly') },
          { id: 'yearly',  label: t('yearly') },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1",
              period === p.id
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >{p.label}</button>
        ))}
      </div>

      {/* ── Category Tabs (Gaz / Benzin / Elektr) ── */}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => setNavFilter('gas')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center p-3 rounded-xl font-bold text-xs transition-all border-2",
            navFilter === 'gas'
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
          )}
        >
          <Flame className="w-5 h-5 mb-1" />
          <span>{t('gas')}</span>
        </button>
        <button
          onClick={() => setNavFilter('petrol')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center p-3 rounded-xl font-bold text-xs transition-all border-2",
            navFilter === 'petrol'
              ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
          )}
        >
          <Fuel className="w-5 h-5 mb-1" />
          <span>{t('petrol')}</span>
        </button>
        <button
          onClick={() => setNavFilter('electric')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center p-3 rounded-xl font-bold text-xs transition-all border-2",
            navFilter === 'electric'
              ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-500/30"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
          )}
        >
          <Activity className="w-5 h-5 mb-1" />
          <span>Elektr</span>
        </button>
      </div>

      {/* ══════════════════════════════════════
          GAZ ko'rinishi
      ══════════════════════════════════════ */}
      {navFilter === 'gas' && (
        <>
          <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
            {[
              { id: 'all',     label: t('all') },
              { id: 'methane', label: `🔵 ${t('methane')}` },
              { id: 'propane', label: `🟠 ${t('propane')}` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGasTab(tab.id)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-1 text-center",
                  gasTab === tab.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm"
                    : "text-gray-500"
                )}
              >{tab.label}</button>
            ))}
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
          ) : !stats ? (
            <div className="h-64 flex items-center justify-center text-red-500 text-sm font-bold">Ma'lumot topilmadi!</div>
          ) : (
            <>
              {/* 4-Card Top Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Umumiy Tushum */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('total_revenue')}</p>
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalRevenue)} <span className="text-xs font-bold">UZS</span>
                  </h3>
                </div>

                {/* 2. Metan */}
                {(gasTab === 'all' || gasTab === 'methane') && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('methane_sold')}</p>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <Droplets className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatCurrency(stats.fuelSplit?.METHANE?.volume_m3 || 0)} <span className="text-xs font-bold">m³</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">{formatCurrency(stats.fuelSplit?.METHANE?.total_revenue || 0)} UZS</p>
                    <div className="mt-3 h-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((stats.fuelSplit?.METHANE?.total_revenue || 0) / (stats.totalRevenue || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                )}

                {/* 3. Propan */}
                {(gasTab === 'all' || gasTab === 'propane') && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-orange-100 dark:border-orange-900/50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('propane_sold')}</p>
                      <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                        <Droplets className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatCurrency(stats.fuelSplit?.PROPANE?.volume_l || 0)} <span className="text-xs font-bold">L</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">{formatCurrency(stats.fuelSplit?.PROPANE?.total_revenue || 0)} UZS</p>
                    <div className="mt-3 h-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, ((stats.fuelSplit?.PROPANE?.total_revenue || 0) / (stats.totalRevenue || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                )}

                {/* 4. Elektr Sarfi (Metan) */}
                {(gasTab === 'all' || gasTab === 'methane') && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('electricity_consumption_methane')}</p>
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {(stats.fuelSplit?.METHANE?.avg_kwh_per_m3 || 0).toFixed(2)} <span className="text-xs font-bold">kWh/m³</span>
                    </h3>
                  </div>
                )}
              </div>

              {/* TWO BOTTOM PROGRESS / STATS SECTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                
                {/* A) LEFT BLOCK: Payment Share */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white mb-5">{t('payment_share')} ({t('gas')})</h3>
                  <div className="space-y-5">
                    {/* Bank Karta */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('bank_card')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.gasPaymentSplit?.BANK_CARD?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.gasPaymentSplit?.BANK_CARD?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.gasPaymentSplit?.BANK_CARD?.amount || 0)} UZS</p>
                    </div>
                    {/* Naqd pul */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('cash')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.gasPaymentSplit?.CASH?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.gasPaymentSplit?.CASH?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.gasPaymentSplit?.CASH?.amount || 0)} UZS</p>
                    </div>
                    {/* Click / Aralash */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('mixed')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.gasPaymentSplit?.MIXED?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${stats.gasPaymentSplit?.MIXED?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.gasPaymentSplit?.MIXED?.amount || 0)} UZS</p>
                    </div>
                  </div>
                </div>

                {/* B) RIGHT BLOCK: Fuel Type Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-5">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <Flame className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">{t('gas_comparison')}</h3>
                  </div>
                  <div className="space-y-5">
                    {[
                      { label: 'Metan', revenue: stats.fuelSplit?.METHANE?.total_revenue || 0, color: 'bg-blue-500' },
                      { label: 'Propan', revenue: stats.fuelSplit?.PROPANE?.total_revenue || 0, color: 'bg-orange-500' },
                    ].filter(item =>
                      gasTab === 'all' ||
                      (gasTab === 'methane' && item.label === 'Metan') ||
                      (gasTab === 'propane' && item.label === 'Propan')
                    ).map((item) => {
                      const pct = stats.totalRevenue ? (item.revenue / stats.totalRevenue) * 100 : 0;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="text-xs font-black text-gray-900 dark:text-white">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(item.revenue)} UZS</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
          BENZIN ko'rinishi
      ══════════════════════════════════════ */}
      {navFilter === 'petrol' && (
        <>
          <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
            {[
              { id: 'all',    label: t('all') },
              { id: 'ai_80',  label: '🟡 AI-80' },
              { id: 'ai_92',  label: '🟠 AI-92' },
              { id: 'ai_95',  label: '🔴 AI-95' },
              { id: 'ai_98',  label: '🟣 AI-98' },
              { id: 'ai_100', label: '🟢 AI-100' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPetrolTab(tab.id)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap text-center",
                  petrolTab === tab.id
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shadow-sm"
                    : "text-gray-500"
                )}
              >{tab.label}</button>
            ))}
          </div>

          {loading ? (
             <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>
          ) : !stats ? (
             <div className="h-64 flex items-center justify-center text-red-500 text-sm font-bold">Ma'lumot topilmadi!</div>
          ) : (
            <>
              {/* Petrol Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Umumiy Tushum */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Umumiy Tushum</p>
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalRevenue)} <span className="text-xs font-bold">UZS</span>
                  </h3>
                </div>

                {/* Petrol type cards mapped */}
                {PETROL_TYPES.map((pt) => {
                  const statKey = pt.id.replace('AI', 'AI_'); // e.g., 'AI80' -> 'AI_80'
                  
                  if (petrolTab !== 'all' && petrolTab !== statKey.toLowerCase()) return null;

                  const volume = stats.fuelSplit?.[statKey]?.volume_l || 0;
                  const revenue = stats.fuelSplit?.[statKey]?.total_revenue || 0;
                  const percent = stats.totalRevenue ? Math.min(100, (revenue / stats.totalRevenue) * 100) : 0;
                  
                  return (
                    <div key={pt.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{pt.label} {t('sold')}</p>
                        <div className={`p-2 rounded-xl ${pt.bg}`}>
                          <Gauge className={`w-5 h-5 ${pt.textColor}`} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        {formatCurrency(volume)} <span className="text-xs font-bold">L</span>
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-1">{formatCurrency(revenue)} UZS</p>
                      <div className="mt-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${pt.color} rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TWO BOTTOM PROGRESS / STATS SECTIONS (PETROL) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                
                {/* A) LEFT BLOCK: Payment Share */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white mb-5">{t('payment_share')} ({t('petrol')})</h3>
                  <div className="space-y-5">
                    {/* Bank Karta */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('bank_card')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.petrolPaymentSplit?.BANK_CARD?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.petrolPaymentSplit?.BANK_CARD?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.petrolPaymentSplit?.BANK_CARD?.amount || 0)} UZS</p>
                    </div>
                    {/* Naqd pul */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('cash')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.petrolPaymentSplit?.CASH?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.petrolPaymentSplit?.CASH?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.petrolPaymentSplit?.CASH?.amount || 0)} UZS</p>
                    </div>
                    {/* Click / Aralash */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('mixed')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.petrolPaymentSplit?.MIXED?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${stats.petrolPaymentSplit?.MIXED?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.petrolPaymentSplit?.MIXED?.amount || 0)} UZS</p>
                    </div>
                  </div>
                </div>

                {/* B) RIGHT BLOCK: Petrol Type Comparison */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-5">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">{t('petrol_comparison')}</h3>
                  </div>
                  <div className="space-y-4">
                    {PETROL_TYPES.filter(pt => 
                      petrolTab === 'all' || petrolTab === pt.id.replace('AI', 'AI_').toLowerCase()
                    ).map((pt) => {
                      const statKey = pt.id.replace('AI', 'AI_');
                      const revenue = stats.fuelSplit?.[statKey]?.total_revenue || 0;
                      const pct = stats.totalRevenue ? (revenue / stats.totalRevenue) * 100 : 0;
                      return (
                        <div key={pt.label}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{pt.label}</span>
                            <span className="text-xs font-black text-gray-900 dark:text-white">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${pt.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(revenue)} UZS</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
          ELEKTR ko'rinishi
      ══════════════════════════════════════ */}
      {navFilter === 'electric' && (
        <>
          {loading ? (
            <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>
          ) : !stats ? (
            <div className="h-64 flex items-center justify-center text-red-500 font-bold text-sm">Ma'lumot topilmadi!</div>
          ) : (
            <>
              {/* Electric Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-green-100 dark:border-green-900/50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Elektr Savdosi</p>
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(stats.fuelSplit?.ELECTRIC?.volume_l || 0)} <span className="text-xs font-bold">kW</span>
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">{formatCurrency(stats.fuelSplit?.ELECTRIC?.total_revenue || 0)} UZS</p>
                  <div className="mt-3 h-1.5 bg-green-100 dark:bg-green-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.totalRevenue ? Math.min(100, ((stats.fuelSplit?.ELECTRIC?.total_revenue || 0) / stats.totalRevenue) * 100) : 0}%` }}></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Elektr Jami Tushum</p>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(stats.fuelSplit?.ELECTRIC?.total_revenue || 0)} <span className="text-xs font-bold">UZS</span>
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Tarif: {formatCurrency(fuelPrices?.ELECTRIC || 1200)} UZS / 1 kW</p>
                </div>
              </div>

              {/* Payment Split for Electric */}
              <div className="grid grid-cols-1 mt-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white mb-5">To'lovlar Ulushi (Elektr)</h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-1.5">
                         <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Bank kartasi</span>
                         <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.electricPaymentSplit?.BANK_CARD?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.electricPaymentSplit?.BANK_CARD?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.electricPaymentSplit?.BANK_CARD?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Naqd pul</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.electricPaymentSplit?.CASH?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.electricPaymentSplit?.CASH?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.electricPaymentSplit?.CASH?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Aralash to'lov</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{(stats.electricPaymentSplit?.MIXED?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${stats.electricPaymentSplit?.MIXED?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(stats.electricPaymentSplit?.MIXED?.amount || 0)} UZS</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
}
