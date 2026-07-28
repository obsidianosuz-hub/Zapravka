import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { Droplets, Fuel, Zap, TrendingUp, CreditCard, Wallet, Banknote, Flame, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function MobileDashboard() {
  const { navFilter, setNavFilter } = useSettings();
  const [stats, setStats] = useState(null);
  const [liveDispensers, setLiveDispensers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-filters for mobile
  const [gasTab, setGasTab] = useState('all'); // 'all' | 'methane' | 'propane'
  const [petrolTab, setPetrolTab] = useState('all'); // 'all' | 'ai_80' | 'ai_92' | 'ai_95' | 'ai_98'

  useEffect(() => {
    // If SettingsContext doesn't initialize it properly, fallback to 'gas'
    if (!['gas', 'petrol', 'elektr'].includes(navFilter)) {
      setNavFilter('gas');
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3000/api/dashboard/stats?period=today');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchLive = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3000/api/dashboard/live');
        setLiveDispensers(res.data.dispensers || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    fetchLive();
    
    const statsInterval = setInterval(fetchStats, 10000);
    const liveInterval = setInterval(fetchLive, 5000);
    
    setLoading(false);
    return () => {
      clearInterval(statsInterval);
      clearInterval(liveInterval);
    };
  }, [navFilter, setNavFilter]);

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(Math.round(num || 0));

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span className="animate-spin text-blue-500 w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent"></span></div>;
  }

  const totalRevenue = stats?.revenue || 0;
  const paymentBreakdown = stats?.paymentBreakdown || { cash: 0, card: 0, click: 0 };
  const getPercent = (val) => totalRevenue > 0 ? (val / totalRevenue) * 100 : 0;

  // Filter logic for dispensers
  const filteredDispensers = liveDispensers.filter(d => {
    if (navFilter === 'gas') {
      return d.fuelType?.category === 'GAZ';
    } else if (navFilter === 'petrol') {
      return d.fuelType?.category === 'BENZIN';
    } else if (navFilter === 'elektr') {
      return d.fuelType?.category === 'ELEKTR';
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-4">
      {/* ── Top Category Tabs ── */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-sm">
        <button
          onClick={() => setNavFilter('gas')}
          className={cn(
            "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-sm transition-all",
            navFilter === 'gas'
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Flame className="w-4 h-4" />
          <span>Gaz</span>
        </button>
        <button
          onClick={() => setNavFilter('petrol')}
          className={cn(
            "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-sm transition-all",
            navFilter === 'petrol'
              ? "bg-amber-500 text-white shadow-md shadow-amber-900/50"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Fuel className="w-4 h-4" />
          <span>Benzin</span>
        </button>
        <button
          onClick={() => setNavFilter('elektr')}
          className={cn(
            "flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-sm transition-all",
            navFilter === 'elektr'
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-900/50"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Zap className="w-4 h-4" />
          <span>Elektr</span>
        </button>
      </div>

      {/* ── Secondary Sub-Filter Pills ── */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {navFilter === 'gas' && (
          <>
            <button onClick={() => setGasTab('all')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", gasTab === 'all' ? "bg-slate-700 text-white" : "bg-slate-900 text-slate-400 border border-slate-800")}>Barchasi</button>
            <button onClick={() => setGasTab('methane')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", gasTab === 'methane' ? "bg-blue-500/20 text-blue-400 border border-blue-500/50" : "bg-slate-900 text-slate-400 border border-slate-800")}>Metan</button>
            <button onClick={() => setGasTab('propane')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", gasTab === 'propane' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-slate-900 text-slate-400 border border-slate-800")}>Propan</button>
          </>
        )}
        {navFilter === 'petrol' && (
          <>
            <button onClick={() => setPetrolTab('all')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", petrolTab === 'all' ? "bg-slate-700 text-white" : "bg-slate-900 text-slate-400 border border-slate-800")}>Barchasi</button>
            <button onClick={() => setPetrolTab('ai_80')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", petrolTab === 'ai_80' ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" : "bg-slate-900 text-slate-400 border border-slate-800")}>AI-80</button>
            <button onClick={() => setPetrolTab('ai_92')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", petrolTab === 'ai_92' ? "bg-orange-500/20 text-orange-400 border border-orange-500/50" : "bg-slate-900 text-slate-400 border border-slate-800")}>AI-92</button>
            <button onClick={() => setPetrolTab('ai_95')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", petrolTab === 'ai_95' ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-slate-900 text-slate-400 border border-slate-800")}>AI-95</button>
            <button onClick={() => setPetrolTab('ai_98')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", petrolTab === 'ai_98' ? "bg-purple-500/20 text-purple-400 border border-purple-500/50" : "bg-slate-900 text-slate-400 border border-slate-800")}>AI-98</button>
            <button onClick={() => setPetrolTab('ai_100')} className={cn("px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors", petrolTab === 'ai_100' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-slate-900 text-slate-400 border border-slate-800")}>AI-100</button>
          </>
        )}
        {navFilter === 'elektr' && (
          <>
            <button className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors bg-slate-700 text-white">Elektr (DC/AC)</button>
          </>
        )}
      </div>

      {/* ── Main Dynamic Stat Card ── */}
      <div className={cn(
        "rounded-3xl p-5 shadow-lg relative overflow-hidden",
        navFilter === 'gas' ? "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-900/20" : 
        navFilter === 'petrol' ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-900/20" :
        "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/20"
      )}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/80 font-bold text-[11px] uppercase tracking-wider mb-1">
            <span>Umumiy Tushum (Bugun)</span>
            <div className="bg-white/20 p-1 rounded-full"><ArrowUpRight className="w-3 h-3 text-white" /></div>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(totalRevenue)} <span className="text-lg font-normal opacity-80">UZS</span>
          </h2>
        </div>
      </div>

      {/* ── Filtered Fuel Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        {navFilter === 'gas' && (gasTab === 'all' || gasTab === 'methane') && (
          <div className={cn("bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4", gasTab !== 'all' && 'col-span-2 flex justify-between items-center')}>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="font-bold text-sm">Metan Sotildi</span>
            </div>
            <p className="text-xl font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.METHANE?.volume || 0)} <span className="text-xs font-normal text-slate-500">m³</span></p>
          </div>
        )}
        
        {navFilter === 'gas' && (gasTab === 'all' || gasTab === 'propane') && (
          <div className={cn("bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4", gasTab !== 'all' && 'col-span-2 flex justify-between items-center')}>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="font-bold text-sm">Propan Sotildi</span>
            </div>
            <p className="text-xl font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.PROPANE?.volume || 0)} <span className="text-xs font-normal text-slate-500">L</span></p>
          </div>
        )}

        {navFilter === 'petrol' && (petrolTab === 'all' || petrolTab === 'ai_80') && (
          <div className={cn("bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4", petrolTab !== 'all' && 'col-span-2 flex justify-between items-center')}>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Fuel className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">AI-80</span>
            </div>
            <p className="text-lg font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.AI_80?.volume || 0)} <span className="text-xs font-normal text-slate-500">L</span></p>
          </div>
        )}

        {navFilter === 'petrol' && (petrolTab === 'all' || petrolTab === 'ai_92') && (
          <div className={cn("bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4", petrolTab !== 'all' && 'col-span-2 flex justify-between items-center')}>
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Fuel className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">AI-92</span>
            </div>
            <p className="text-lg font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.AI_92?.volume || 0)} <span className="text-xs font-normal text-slate-500">L</span></p>
          </div>
        )}

        {navFilter === 'petrol' && (petrolTab === 'all' || petrolTab === 'ai_95') && (
          <div className={cn("bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4", petrolTab !== 'all' && 'col-span-2 flex justify-between items-center')}>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <Fuel className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">AI-95</span>
            </div>
            <p className="text-lg font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.AI_95?.volume || 0)} <span className="text-xs font-normal text-slate-500">L</span></p>
          </div>
        )}

        {navFilter === 'petrol' && (petrolTab === 'all' || petrolTab === 'ai_98') && (
          <div className={cn("bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4", petrolTab !== 'all' && 'col-span-2 flex justify-between items-center')}>
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <Fuel className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">AI-98</span>
            </div>
            <p className="text-lg font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.AI_98?.volume || 0)} <span className="text-xs font-normal text-slate-500">L</span></p>
          </div>
        )}

        {navFilter === 'petrol' && (petrolTab === 'all' || petrolTab === 'ai_100') && (
          <div className={cn("bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4", petrolTab !== 'all' && 'col-span-2 flex justify-between items-center')}>
            <div className="flex items-center gap-2 text-emerald-500 mb-2">
              <Fuel className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">AI-100</span>
            </div>
            <p className="text-lg font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.AI_100?.volume || 0)} <span className="text-xs font-normal text-slate-500">L</span></p>
          </div>
        )}
      </div>

      {/* ── Tushum Ulushi (To'lov Turlari) ── */}
      <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider ml-1 mt-6 mb-2">Tushum Ulushi (To'lov Turlari)</h3>
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 space-y-5">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2 text-blue-400">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-bold">Bank Karta</span>
            </div>
            <span className="text-xs font-black text-slate-200">{formatCurrency(paymentBreakdown.card)} UZS</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercent(paymentBreakdown.card)}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-bold">Naqd pul</span>
            </div>
            <span className="text-xs font-black text-slate-200">{formatCurrency(paymentBreakdown.cash)} UZS</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercent(paymentBreakdown.cash)}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2 text-indigo-400">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-bold">Click / Aralash</span>
            </div>
            <span className="text-xs font-black text-slate-200">{formatCurrency(paymentBreakdown.click)} UZS</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${getPercent(paymentBreakdown.click)}%` }}></div>
          </div>
        </div>
      </div>

      {/* ── Kalonkalar Holati Grid ── */}
      <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider ml-1 mt-6 mb-2">Kalonkalar Holati (Aktiv)</h3>
      {filteredDispensers.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-sm">
          Ushbu toifa uchun faol kalonkalar topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredDispensers.map(d => {
            const isOffline = d.status === 'OFFLINE';
            const isBusy = d.status === 'BUSY';
            return (
              <div key={d.id} className={`rounded-2xl p-4 border ${
                isOffline ? 'bg-slate-900/50 border-slate-800 opacity-60' : 
                isBusy ? 'bg-amber-950/20 border-amber-900/50' : 
                'bg-slate-900/80 border-slate-800/80'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-black text-slate-200">#{d.dispenserNumber}</span>
                  {isOffline ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  ) : isBusy ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping mt-2 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  {navFilter === 'gas' ? <Flame className="w-3 h-3" /> : navFilter === 'elektr' ? <Zap className="w-3 h-3" /> : <Fuel className="w-3 h-3" />}
                  <p className="text-[10px] uppercase font-bold truncate">{d.fuelType?.name || 'Noma\'lum'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
