import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Activity, Droplets, LayoutDashboard, Flame, Fuel, Gauge, FlaskConical } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';

const cn = (...inputs) => twMerge(clsx(inputs));

// Petrol types (future data - displayed as placeholder for now)
const PETROL_TYPES = [
  { id: 'AI80',  label: 'AI-80',  color: 'bg-amber-400',   textColor: 'text-amber-600 dark:text-amber-400',   bg: 'dark:bg-amber-900/30 bg-amber-50' },
  { id: 'AI92',  label: 'AI-92',  color: 'bg-orange-400',  textColor: 'text-orange-600 dark:text-orange-400', bg: 'dark:bg-orange-900/30 bg-orange-50' },
  { id: 'AI95',  label: 'AI-95',  color: 'bg-red-400',     textColor: 'text-red-600 dark:text-red-400',       bg: 'dark:bg-red-900/30 bg-red-50'     },
  { id: 'AI98',  label: 'AI-98',  color: 'bg-purple-400',  textColor: 'text-purple-600 dark:text-purple-400', bg: 'dark:bg-purple-900/30 bg-purple-50' },
  { id: 'AI100', label: 'AI-100', color: 'bg-emerald-400', textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'dark:bg-emerald-900/30 bg-emerald-50' },
];

export default function Dashboard() {
  const { t, navFilter, setNavFilter, fuelPrices } = useSettings();
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gasTab, setGasTab] = useState('all'); // 'all' | 'methane' | 'propane'
  const [petrolTab, setPetrolTab] = useState('all'); // 'all' | 'ai_80' | 'ai_92' | 'ai_95' | 'ai_98' | 'ai_100'

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://127.0.0.1:3000/api/dashboard/stats?period=${period}`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
            <LayoutDashboard className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard_desc')}</p>
          </div>
        </div>

        {/* Period Filters */}
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          {[
            { id: 'daily',   label: t('daily')  },
            { id: 'weekly',  label: t('weekly') },
            { id: 'monthly', label: t('monthly')   },
            { id: 'yearly',  label: t('yearly')  },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                period === p.id
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* ── Category Tabs (Gaz / Benzin) ── */}
      <div className="flex space-x-3">
        <button
          onClick={() => setNavFilter('gas')}
          className={cn(
            "flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2",
            navFilter === 'gas'
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400"
          )}
        >
          <Flame className="w-4 h-4" />
          <span>{t('gas')}</span>
        </button>
        <button
          onClick={() => setNavFilter('petrol')}
          className={cn(
            "flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2",
            navFilter === 'petrol'
              ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400"
          )}
        >
          <Fuel className="w-4 h-4" />
          <span>{t('petrol')}</span>
        </button>
        <button
          onClick={() => setNavFilter('electric')}
          className={cn(
            "flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2",
            navFilter === 'electric'
              ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-500/30"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-green-400"
          )}
        >
          <Activity className="w-4 h-4" />
          <span>Elektr</span>
        </button>
      </div>

      {/* ══════════════════════════════════════
          GAZ ko'rinishi
      ══════════════════════════════════════ */}
      {navFilter === 'gas' && (
        <>
          {/* Gas Sub-tabs: All / Metan / Propan */}
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
            {[
              { id: 'all',     label: t('all') },
              { id: 'methane', label: `🔵 ${t('methane')}`  },
              { id: 'propane', label: `🟠 ${t('propane')}`  },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGasTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  gasTab === tab.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >{tab.label}</button>
            ))}
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : !stats ? (
            <div className="h-64 flex items-center justify-center text-red-500">
              Ma'lumot topilmadi! Backend ishlayotganiga ishonch hosil qiling.
            </div>
          ) : (
            <>
              {/* Gas Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Umumiy Tushum */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('total_revenue')}</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.totalRevenue)} <span className="text-base font-normal">UZS</span>
                      </h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Metan card */}
                {(gasTab === 'all' || gasTab === 'methane') && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-blue-100 dark:border-blue-900/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('methane_sold')}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(stats.fuelSplit.METHANE.volume_m3)} <span className="text-base font-normal">m³</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">{formatCurrency(stats.fuelSplit.METHANE.total_revenue)} UZS</p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <Droplets className="w-6 h-6" />
                      </div>
                    </div>
                    {/* Mini progress */}
                    <div className="mt-4 h-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (stats.fuelSplit.METHANE.total_revenue / (stats.totalRevenue || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Propan card */}
                {(gasTab === 'all' || gasTab === 'propane') && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-orange-100 dark:border-orange-900/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('propane_sold')}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(stats.fuelSplit.PROPANE.volume_l)} <span className="text-base font-normal">L</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">{formatCurrency(stats.fuelSplit.PROPANE.total_revenue)} UZS</p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                        <Droplets className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (stats.fuelSplit.PROPANE.total_revenue / (stats.totalRevenue || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                )}

                {/* kWh */}
                {(gasTab === 'all' || gasTab === 'methane') && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('electricity_consumption_methane')}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.fuelSplit.METHANE.avg_kwh_per_m3.toFixed(2)} <span className="text-base font-normal">kWh/m³</span>
                        </h3>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl text-yellow-600 dark:text-yellow-400">
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('payment_share')} ({t('gas')})</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('bank_card')}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.gasPaymentSplit?.BANK_CARD?.percentage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.gasPaymentSplit?.BANK_CARD?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.gasPaymentSplit?.BANK_CARD?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('cash')}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.gasPaymentSplit?.CASH?.percentage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.gasPaymentSplit?.CASH?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.gasPaymentSplit?.CASH?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('mixed')}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.gasPaymentSplit?.MIXED?.percentage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${stats.gasPaymentSplit?.MIXED?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.gasPaymentSplit?.MIXED?.amount || 0)} UZS</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <Flame className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('gas_comparison')}</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Metan', revenue: stats.fuelSplit.METHANE.total_revenue, color: 'bg-blue-500' },
                      { label: 'Propan', revenue: stats.fuelSplit.PROPANE.total_revenue, color: 'bg-orange-500' },
                    ].filter(item =>
                      gasTab === 'all' ||
                      (gasTab === 'methane' && item.label === 'Metan') ||
                      (gasTab === 'propane' && item.label === 'Propan')
                    ).map((item) => {
                      const pct = ((item.revenue || 0) / (stats.totalRevenue || 1)) * 100;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="font-bold text-gray-900 dark:text-white">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.revenue)} UZS</p>
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
          {/* Petrol Sub-tabs: All / AI-92 / AI-95 / AI-98 / AI-100 */}
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
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
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  petrolTab === tab.id
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >{tab.label}</button>
            ))}
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : !stats ? (
            <div className="h-64 flex items-center justify-center text-red-500">
              Ma'lumot topilmadi! Backend ishlayotganiga ishonch hosil qiling.
            </div>
          ) : (
            <>
              {/* Petrol Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Umumiy Tushum */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Umumiy Tushum</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.totalRevenue)} <span className="text-base font-normal">UZS</span>
                      </h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Petrol type cards mapped */}
                {PETROL_TYPES.map((pt) => {
                  const statKey = pt.id.replace('AI', 'AI_'); // e.g., 'AI80' -> 'AI_80'
                  
                  // Hide if not selected in sub-filter
                  if (petrolTab !== 'all' && petrolTab !== statKey.toLowerCase()) return null;

                  const volume = stats.fuelSplit[statKey]?.volume_l || 0;
                  const revenue = stats.fuelSplit[statKey]?.total_revenue || 0;
                  const percent = stats.totalRevenue ? Math.min(100, (revenue / stats.totalRevenue) * 100) : 0;
                  
                  return (
                    <div key={pt.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{pt.label} {t('sold')}</p>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(volume)} <span className="text-base font-normal">L</span>
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">{formatCurrency(revenue)} UZS</p>
                        </div>
                        <div className={`p-3 rounded-xl ${pt.bg}`}>
                          <Gauge className={`w-6 h-6 ${pt.textColor}`} />
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${pt.color} rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment split (Petrol) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('payment_share')} ({t('petrol')})</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                         <span className="font-medium text-gray-700 dark:text-gray-300">{t('bank_card')}</span>
                         <span className="font-bold text-gray-900 dark:text-white">{stats.petrolPaymentSplit?.BANK_CARD?.percentage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.petrolPaymentSplit?.BANK_CARD?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.petrolPaymentSplit?.BANK_CARD?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('cash')}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.petrolPaymentSplit?.CASH?.percentage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.petrolPaymentSplit?.CASH?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.petrolPaymentSplit?.CASH?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{t('mixed')}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.petrolPaymentSplit?.MIXED?.percentage?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${stats.petrolPaymentSplit?.MIXED?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.petrolPaymentSplit?.MIXED?.amount || 0)} UZS</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                      <Fuel className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('petrol_comparison')}</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'AI-80', revenue: stats.fuelSplit.AI_80?.total_revenue, color: 'bg-amber-400' },
                      { label: 'AI-92', revenue: stats.fuelSplit.AI_92?.total_revenue, color: 'bg-orange-400' },
                      { label: 'AI-95', revenue: stats.fuelSplit.AI_95?.total_revenue, color: 'bg-red-400' },
                      { label: 'AI-98', revenue: stats.fuelSplit.AI_98?.total_revenue, color: 'bg-purple-400' },
                      { label: 'AI-100', revenue: stats.fuelSplit.AI_100?.total_revenue, color: 'bg-emerald-400' },
                    ].filter(item =>
                      petrolTab === 'all' ||
                      (petrolTab === 'ai_80' && item.label === 'AI-80') ||
                      (petrolTab === 'ai_92' && item.label === 'AI-92') ||
                      (petrolTab === 'ai_95' && item.label === 'AI-95') ||
                      (petrolTab === 'ai_98' && item.label === 'AI-98') ||
                      (petrolTab === 'ai_100' && item.label === 'AI-100')
                    ).map((item) => {
                      const pct = ((item.revenue || 0) / (stats.totalRevenue || 1)) * 100;
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="font-bold text-gray-900 dark:text-white">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.revenue)} UZS</p>
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
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : !stats ? (
            <div className="h-64 flex items-center justify-center text-red-500">
              Ma'lumot topilmadi! Backend ishlayotganiga ishonch hosil qiling.
            </div>
          ) : (
            <>
              {/* Electric Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bugungi Elektr Savdosi */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-green-105 dark:border-green-900/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bugungi Elektr Savdosi (Hajmi)</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.fuelSplit?.ELECTRIC?.volume_l || 0)} <span className="text-base font-normal">kW</span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">{formatCurrency(stats.fuelSplit?.ELECTRIC?.total_revenue || 0)} UZS</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 bg-green-100 dark:bg-green-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.totalRevenue ? Math.min(100, ((stats.fuelSplit?.ELECTRIC?.total_revenue || 0) / stats.totalRevenue) * 100) : 0}%` }}></div>
                  </div>
                </div>

                {/* Elektr Daromadi */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Elektr Jami Tushum</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.fuelSplit?.ELECTRIC?.total_revenue || 0)} <span className="text-base font-normal">UZS</span>
                      </h3>
                      <p className="text-xs text-gray-450 mt-1">Tarif: {formatCurrency(fuelPrices?.ELECTRIC || 1200)} UZS / 1 kW</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Split for Electric */}
              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">To'lovlar Ulushi (Elektr)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex justify-between mb-2">
                         <span className="font-medium text-gray-700 dark:text-gray-300">Bank kartasi</span>
                         <span className="font-bold text-gray-900 dark:text-white">{(stats.electricPaymentSplit?.BANK_CARD?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stats.electricPaymentSplit?.BANK_CARD?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.electricPaymentSplit?.BANK_CARD?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Naqd pul</span>
                        <span className="font-bold text-gray-900 dark:text-white">{(stats.electricPaymentSplit?.CASH?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${stats.electricPaymentSplit?.CASH?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.electricPaymentSplit?.CASH?.amount || 0)} UZS</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Aralash to'lov</span>
                        <span className="font-bold text-gray-900 dark:text-white">{(stats.electricPaymentSplit?.MIXED?.percentage || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${stats.electricPaymentSplit?.MIXED?.percentage || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.electricPaymentSplit?.MIXED?.amount || 0)} UZS</p>
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
