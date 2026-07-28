import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { Droplets, Fuel, Zap, TrendingUp, CreditCard, Wallet, Banknote } from 'lucide-react';

export default function MobileDashboard() {
  const [stats, setStats] = useState(null);
  const [liveDispensers, setLiveDispensers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(Math.round(num || 0));

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span className="animate-spin text-blue-500 w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent"></span></div>;
  }

  // Calculate percentages for payment types
  const totalRevenue = stats?.revenue || 0;
  const paymentBreakdown = stats?.paymentBreakdown || { cash: 0, card: 0, click: 0 };
  const getPercent = (val) => totalRevenue > 0 ? (val / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-4 pb-4">
      {/* ── Main Revenue Card ── */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-5 shadow-lg shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-blue-100 font-medium text-sm mb-1">Umumiy Tushum (Bugun)</p>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(totalRevenue)} <span className="text-lg font-normal opacity-80">UZS</span>
          </h2>
        </div>
      </div>

      {/* ── Fuel Sales Grid ── */}
      <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1 mt-6">Sotilgan Yoqilg'i</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Metan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Droplets className="w-5 h-5" />
            <span className="font-bold text-sm">Metan</span>
          </div>
          <p className="text-xl font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.METHANE?.volume || 0)} <span className="text-xs font-normal text-slate-500">m³</span></p>
        </div>

        {/* Propan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Droplets className="w-5 h-5" />
            <span className="font-bold text-sm">Propan</span>
          </div>
          <p className="text-xl font-black text-slate-100">{formatCurrency(stats?.fuelSplit?.PROPANE?.volume || 0)} <span className="text-xs font-normal text-slate-500">L</span></p>
        </div>

        {/* Benzin (Combines all petrols roughly if backend supports it, otherwise generic fallback) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between col-span-2">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Fuel className="w-5 h-5" />
            <span className="font-bold text-sm">Benzin (Barcha turlari)</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-xl font-black text-slate-100">
              {formatCurrency(
                (stats?.fuelSplit?.AI_80?.volume || 0) + 
                (stats?.fuelSplit?.AI_92?.volume || 0) + 
                (stats?.fuelSplit?.AI_95?.volume || 0) + 
                (stats?.fuelSplit?.AI_98?.volume || 0)
              )} <span className="text-xs font-normal text-slate-500">L</span>
            </p>
            <p className="text-xs font-medium text-amber-500/80">Faol Sotuv</p>
          </div>
        </div>
      </div>

      {/* ── Live Dispensers Status ── */}
      <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1 mt-6">Kalonkalar Holati</h3>
      <div className="grid grid-cols-2 gap-3">
        {liveDispensers.map(d => {
          const isOffline = d.status === 'OFFLINE';
          const isBusy = d.status === 'BUSY';
          return (
            <div key={d.id} className={`rounded-2xl p-3 border ${
              isOffline ? 'bg-slate-900/50 border-slate-800 opacity-60' : 
              isBusy ? 'bg-amber-950/20 border-amber-900/50' : 
              'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-black text-slate-200">#{d.dispenserNumber}</span>
                {isOffline ? (
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                ) : isBusy ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mt-1.5" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{d.fuelType?.name || 'Noma\'lum'}</p>
            </div>
          );
        })}
      </div>

      {/* ── Payment Types ── */}
      <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1 mt-6 mb-2">To'lov Turlari</h3>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
        
        {/* Naqd */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Banknote className="w-4 h-4" />
              <span className="text-sm font-semibold">Naqd pul</span>
            </div>
            <span className="text-sm font-bold text-slate-200">{formatCurrency(paymentBreakdown.cash)} UZS</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${getPercent(paymentBreakdown.cash)}%` }}></div>
          </div>
        </div>

        {/* Karta */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-blue-400">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-semibold">Plastik Karta</span>
            </div>
            <span className="text-sm font-bold text-slate-200">{formatCurrency(paymentBreakdown.card)} UZS</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${getPercent(paymentBreakdown.card)}%` }}></div>
          </div>
        </div>

        {/* Click */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-semibold">Click / Payme</span>
            </div>
            <span className="text-sm font-bold text-slate-200">{formatCurrency(paymentBreakdown.click)} UZS</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${getPercent(paymentBreakdown.click)}%` }}></div>
          </div>
        </div>

      </div>
    </div>
  );
}
