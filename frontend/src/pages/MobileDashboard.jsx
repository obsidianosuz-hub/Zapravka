import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Activity, Droplets, Flame, Fuel, Gauge } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';
import { useSales } from '../context/SalesContext';

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
  const { getDashboardStats } = useSales();
  const [period, setPeriod] = useState('daily');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gasTab, setGasTab] = useState('all'); 
  const [petrolTab, setPetrolTab] = useState('all'); 

  useEffect(() => {
    // NavFilter fallback for mobile
    if (!['gas', 'petrol', 'electric'].includes(navFilter)) {
      setNavFilter('gas');
    }

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

  // Integrate live local sales context (only if period is daily)
  const isToday = period === 'daily';
  const localStats = isToday ? getDashboardStats() : { totalRevenue: 0, paymentBreakdown: {cash:0, card:0, click:0, mixed:0}, fuelSplit: {} };

  // Data helpers to merge backend polling with zero-latency SalesContext
  const safeStats = stats || {};
  const totalRev = (safeStats.totalRevenue || 0) + localStats.totalRevenue;

  // Generic function to calculate payment split with real-time addition
  const getPaymentMerged = (typeKey, target) => {
    const backendAmount = safeStats[`${target}PaymentSplit`]?.[typeKey]?.amount || 0;
    let localAmount = 0;
    if (isToday) {
      if (typeKey === 'CASH') localAmount = localStats.paymentBreakdown.cash;
      if (typeKey === 'BANK_CARD') localAmount = localStats.paymentBreakdown.card;
      if (typeKey === 'MIXED') localAmount = localStats.paymentBreakdown.click + localStats.paymentBreakdown.mixed;
    }
    return backendAmount + localAmount;
  };

  const calculateTotalPaymentFor = (target) => {
    return getPaymentMerged('CASH', target) + getPaymentMerged('BANK_CARD', target) + getPaymentMerged('MIXED', target);
  };

  const getPaymentPercent = (typeKey, target) => {
    const total = calculateTotalPaymentFor(target) || totalRev || 1;
    return (getPaymentMerged(typeKey, target) / total) * 100;
  };

  const getFuelVolumeMerged = (fuelKey, isGas) => {
    const backendVol = safeStats.fuelSplit?.[fuelKey] ? (isGas ? safeStats.fuelSplit[fuelKey].volume_m3 || safeStats.fuelSplit[fuelKey].volume_l : safeStats.fuelSplit[fuelKey].volume_l) : 0;
    const localVol = localStats.fuelSplit[fuelKey]?.volume || 0;
    return (backendVol || 0) + localVol;
  };

  const getFuelRevenueMerged = (fuelKey) => {
    const backendRev = safeStats.fuelSplit?.[fuelKey]?.total_revenue || 0;
    const localRev = localStats.fuelSplit[fuelKey]?.revenue || 0;
    return backendRev + localRev;
  };

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
                    {formatCurrency(totalRev)} <span className="text-xs font-bold">UZS</span>
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
                      {formatCurrency(getFuelVolumeMerged('METHANE', true))} <span className="text-xs font-bold">m³</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">{formatCurrency(getFuelRevenueMerged('METHANE'))} UZS</p>
                    <div className="mt-3 h-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (getFuelRevenueMerged('METHANE') / (totalRev || 1)) * 100)}%` }}></div>
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
                      {formatCurrency(getFuelVolumeMerged('PROPANE', true))} <span className="text-xs font-bold">L</span>
                    </h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">{formatCurrency(getFuelRevenueMerged('PROPANE'))} UZS</p>
                    <div className="mt-3 h-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (getFuelRevenueMerged('PROPANE') / (totalRev || 1)) * 100)}%` }}></div>
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
                      {(safeStats.fuelSplit?.METHANE?.avg_kwh_per_m3 || 0).toFixed(2)} <span className="text-xs font-bold">kWh/m³</span>
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
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('BANK_CARD', 'gas').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('BANK_CARD', 'gas')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('BANK_CARD', 'gas'))} UZS</p>
                    </div>
                    {/* Naqd pul */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('cash')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('CASH', 'gas').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('CASH', 'gas')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('CASH', 'gas'))} UZS</p>
                    </div>
                    {/* Click / Aralash */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('mixed')} (Click)</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('MIXED', 'gas').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('MIXED', 'gas')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('MIXED', 'gas'))} UZS</p>
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
                      { label: 'Metan', revenue: getFuelRevenueMerged('METHANE'), color: 'bg-blue-500' },
                      { label: 'Propan', revenue: getFuelRevenueMerged('PROPANE'), color: 'bg-orange-500' },
                    ].filter(item =>
                      gasTab === 'all' ||
                      (gasTab === 'methane' && item.label === 'Metan') ||
                      (gasTab === 'propane' && item.label === 'Propan')
                    ).map((item) => {
                      const pct = totalRev ? ((item.revenue || 0) / totalRev) * 100 : 0;
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
                    {formatCurrency(totalRev)} <span className="text-xs font-bold">UZS</span>
                  </h3>
                </div>

                {/* Petrol type cards mapped */}
                {PETROL_TYPES.map((pt) => {
                  const statKey = pt.id.replace('AI', 'AI_'); // e.g., 'AI80' -> 'AI_80'
                  
                  if (petrolTab !== 'all' && petrolTab !== statKey.toLowerCase()) return null;

                  const volume = getFuelVolumeMerged(statKey, false);
                  const revenue = getFuelRevenueMerged(statKey);
                  const percent = totalRev ? Math.min(100, (revenue / totalRev) * 100) : 0;
                  
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
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('BANK_CARD', 'petrol').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('BANK_CARD', 'petrol')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('BANK_CARD', 'petrol'))} UZS</p>
                    </div>
                    {/* Naqd pul */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('cash')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('CASH', 'petrol').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('CASH', 'petrol')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('CASH', 'petrol'))} UZS</p>
                    </div>
                    {/* Click / Aralash */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('mixed')}</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('MIXED', 'petrol').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('MIXED', 'petrol')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('MIXED', 'petrol'))} UZS</p>
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
                      const revenue = getFuelRevenueMerged(statKey);
                      const pct = totalRev ? (revenue / totalRev) * 100 : 0;
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
                    {formatCurrency(getFuelVolumeMerged('ELECTRIC', false))} <span className="text-xs font-bold">kW</span>
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">{formatCurrency(getFuelRevenueMerged('ELECTRIC'))} UZS</p>
                  <div className="mt-3 h-1.5 bg-green-100 dark:bg-green-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalRev ? Math.min(100, (getFuelRevenueMerged('ELECTRIC') / totalRev) * 100) : 0}%` }}></div>
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
                    {formatCurrency(getFuelRevenueMerged('ELECTRIC'))} <span className="text-xs font-bold">UZS</span>
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
                         <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('BANK_CARD', 'electric').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('BANK_CARD', 'electric')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('BANK_CARD', 'electric'))} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Naqd pul</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('CASH', 'electric').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('CASH', 'electric')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('CASH', 'electric'))} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Aralash to'lov</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{getPaymentPercent('MIXED', 'electric').toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${getPaymentPercent('MIXED', 'electric')}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">{formatCurrency(getPaymentMerged('MIXED', 'electric'))} UZS</p>
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
