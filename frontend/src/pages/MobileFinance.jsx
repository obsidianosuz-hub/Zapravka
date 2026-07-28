import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Landmark, Filter, Flame, Fuel, Zap, Plus, ArrowDownRight, ArrowUpRight, CreditCard, Banknote, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function MobileFinance() {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'kirim' | 'chiqim'
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const formatCurrency = (num) => new Intl.NumberFormat('uz-UZ').format(num || 0);

  // Stats mock for mobile cards
  const stats = {
    totalIncome: 145000000,
    totalExpense: 42000000,
    netProfit: 103000000
  };

  // Local logs mimicking Desktop Transactions
  const localLogs = [
    { id: 1, type: 'Kirim', mode: 'financial', category: 'Inkassatsiya', amount: '45,000,000 UZS', notes: 'Kassa tushumi yig\'ib olindi', date: 'Bugun, 14:30', paymentMethod: 'Naqd pul' },
    { id: 2, type: 'Chiqim', mode: 'fuel', category: 'Metan', amount: '12,000 m³', cost: '38,000,000 UZS', notes: 'Zaxira to\'ldirildi', date: 'Kecha, 09:15', paymentMethod: 'Karta' },
    { id: 3, type: 'Kirim', mode: 'financial', category: 'Sotuv', amount: '1,500,000 UZS', notes: 'Kiosk savdosi', date: 'Kecha, 18:00', paymentMethod: 'Click' },
    { id: 4, type: 'Chiqim', mode: 'financial', category: 'Xodim oyligi', amount: '4,500,000 UZS', notes: 'Kassir maoshi', date: '25-Iyun, 10:00', paymentMethod: 'Karta' },
    { id: 5, type: 'Kirim', mode: 'fuel', category: 'AI-92', amount: '5,000 L', cost: '40,000,000 UZS', notes: 'Katta sotuv (Yuridik)', date: '24-Iyun, 11:20', paymentMethod: 'Karta' },
  ];

  const getCategoryIcon = (category) => {
    if (category.includes('Metan') || category.includes('Propan') || category.includes('Gaz')) return <Flame className="w-4 h-4 text-blue-400" />;
    if (category.includes('AI-') || category.includes('Benzin')) return <Fuel className="w-4 h-4 text-amber-400" />;
    if (category.includes('Elektr')) return <Zap className="w-4 h-4 text-emerald-400" />;
    return <Landmark className="w-4 h-4 text-indigo-400" />;
  };

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'Naqd pul': return <Banknote className="w-3 h-3" />;
      case 'Karta': return <CreditCard className="w-3 h-3" />;
      case 'Click': return <Wallet className="w-3 h-3" />;
      default: return <Wallet className="w-3 h-3" />;
    }
  };

  const filteredLogs = localLogs.filter(log => {
    if (filterTab === 'kirim') return log.type === 'Kirim';
    if (filterTab === 'chiqim') return log.type === 'Chiqim';
    return true;
  });

  return (
    <div className="space-y-6 pb-4">
      {/* ── Top Metrics Cards ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Umumiy Kirim */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ArrowUpRight className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Umumiy Kirim</span>
            </div>
            <p className="text-xl font-black text-emerald-300">{formatCurrency(stats.totalIncome)}</p>
          </div>
        </div>
        
        {/* Umumiy Chiqim */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ArrowDownRight className="w-16 h-16 text-red-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Umumiy Chiqim</span>
            </div>
            <p className="text-xl font-black text-red-300">{formatCurrency(stats.totalExpense)}</p>
          </div>
        </div>

        {/* Sof Foyda */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 col-span-2 shadow-lg shadow-indigo-900/20 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 opacity-10">
            <Landmark className="w-20 h-20 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100 mb-1">
              <Landmark className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-wider">Sof Foyda (Net Profit)</span>
            </div>
            <p className="text-3xl font-black text-white">{formatCurrency(stats.netProfit)} <span className="text-sm font-normal text-white/70">UZS</span></p>
          </div>
        </div>
      </div>

      {/* ── Transactions List Section ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider ml-1">Batafsil Hisobotlar va Tranzaksiyalar</h3>
          <button onClick={() => setShowCategoryMenu(!showCategoryMenu)} className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-sm mb-4">
          <button
            onClick={() => setFilterTab('all')}
            className={cn("flex-1 py-2 rounded-xl font-bold text-xs transition-all", filterTab === 'all' ? "bg-slate-700 text-white shadow-md" : "text-slate-400")}
          >Hammasi</button>
          <button
            onClick={() => setFilterTab('kirim')}
            className={cn("flex-1 py-2 rounded-xl font-bold text-xs transition-all", filterTab === 'kirim' ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30" : "text-slate-400")}
          >Kirim</button>
          <button
            onClick={() => setFilterTab('chiqim')}
            className={cn("flex-1 py-2 rounded-xl font-bold text-xs transition-all", filterTab === 'chiqim' ? "bg-red-600 text-white shadow-md shadow-red-900/30" : "text-slate-400")}
          >Chiqim</button>
        </div>

        {/* Transaction Cards List */}
        <div className="space-y-3">
          {filteredLogs.map(log => {
            const isKirim = log.type === 'Kirim';
            return (
              <div key={log.id} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4">
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", isKirim ? "bg-emerald-500/10" : "bg-red-500/10")}>
                      {isKirim ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownRight className="w-5 h-5 text-red-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200 text-sm">{log.category}</span>
                        {log.mode === 'fuel' && getCategoryIcon(log.category)}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{log.date}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                    isKirim ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {log.type}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Miqdor / Summa</p>
                    <p className={cn("text-lg font-black", isKirim ? "text-emerald-400" : "text-slate-200")}>
                      {log.cost ? log.cost : log.amount}
                    </p>
                    {log.cost && <p className="text-xs font-bold text-slate-400 mt-0.5">Hajmi: {log.amount}</p>}
                  </div>
                  
                  {/* Payment Method Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-slate-800 px-2 py-1.5 rounded-lg text-slate-300">
                      {getPaymentIcon(log.paymentMethod)}
                      <span className="text-[10px] font-bold">{log.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                
                {log.notes && (
                  <div className="mt-3 bg-slate-950/50 p-2 rounded-xl border border-slate-800/50">
                    <p className="text-xs text-slate-400 italic">"{log.notes}"</p>
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
