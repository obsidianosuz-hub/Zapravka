import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { TrendingUp, TrendingDown, DollarSign, Fuel, Battery, Droplets } from 'lucide-react';

export default function MobileFinance() {
  const { fuels } = useSettings();

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  // Hardcoded or mock stats for now, in a real scenario fetch from an endpoint
  const stats = {
    dailyIncome: 14500000,
    dailyExpense: 420000,
    monthlyIncome: 385000000,
    monthlyExpense: 12500000
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'GAZ': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'BENZIN': return <Fuel className="w-5 h-5 text-amber-400" />;
      case 'ELEKTR': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <Fuel className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Kunlik Tushum */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold">Kunlik Tushum</span>
          </div>
          <p className="text-lg font-black text-emerald-300">{formatCurrency(stats.dailyIncome)}</p>
        </div>
        
        {/* Kunlik Xarajat */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-bold">Kunlik Xarajat</span>
          </div>
          <p className="text-lg font-black text-red-300">{formatCurrency(stats.dailyExpense)}</p>
        </div>

        {/* Oylik Tushum */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 col-span-2 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Oylik Tushum</span>
            </div>
            <p className="text-2xl font-black text-slate-100">{formatCurrency(stats.monthlyIncome)} <span className="text-sm font-normal text-slate-500">UZS</span></p>
          </div>
        </div>
      </div>

      {/* ── Fuel Tariffs Quick View ── */}
      <div>
        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1 mb-3">Yoqilg'i Tariflari</h3>
        <div className="space-y-3">
          {fuels.map((fuel) => (
            <div key={fuel.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-xl">
                  {getCategoryIcon(fuel.category)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{fuel.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                    <Battery className="w-3 h-3" />
                    <span>Zaxira: {formatCurrency(fuel.remaining)} {fuel.unit}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-lg font-black text-white">{formatCurrency(fuel.price)}</span>
                <span className="text-[10px] text-slate-500">UZS / {fuel.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
