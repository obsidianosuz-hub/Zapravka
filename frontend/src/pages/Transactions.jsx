import React, { useState } from 'react';
import { Wallet, Plus, Minus, ArrowUpRight, ArrowDownRight, FileText, Landmark, UserCheck, RefreshCw, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('kirim'); // 'kirim' | 'chiqim'
  const [category, setCategory] = useState('Yoqilg\'i xaridi');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  const [localLogs, setLocalLogs] = useState(() => {
    const saved = localStorage.getItem('localLogs');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: 1, type: 'Kirim', mode: 'financial', category: 'Inkassatsiya', amount: '45,000,000 UZS', notes: 'Kassa tushumi yig\'ib olindi' },
      { id: 2, type: 'Chiqim', mode: 'fuel', category: 'Yoqilg\'i xaridi', amount: '12,000 L', notes: 'Propane zaxirasi uchun xarid' },
      { id: 3, type: 'Chiqim', mode: 'financial', category: 'Xodim oyligi', amount: '4,500,000 UZS', notes: 'Kassir KPI va oylik maoshi' },
    ];
    localStorage.setItem('localLogs', JSON.stringify(initial));
    return initial;
  });

  const isFuel = category === "Yoqilg'i xaridi";

  const handleOpenModal = (mode) => {
    setModalType(mode);
    setCategory(mode === 'kirim' ? 'Inkassatsiya' : 'Yoqilg\'i xaridi');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    const newLog = {
      id: Date.now(),
      type: modalType === 'kirim' ? 'Kirim' : 'Chiqim',
      mode: isFuel ? 'fuel' : 'financial',
      category,
      amount: !isFuel 
        ? `${new Intl.NumberFormat('uz-UZ').format(amount)} UZS` 
        : `${amount} ${category.includes('Metan') ? 'm³' : 'L'}`,
      notes
    };

    const updated = [newLog, ...localLogs];
    setLocalLogs(updated);
    localStorage.setItem('localLogs', JSON.stringify(updated));
    setAmount('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Moliya Tranzaksiyalari</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Kirim va chiqimlar oqimini kiritish hamda yoqilg'i loglari nazorati</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleOpenModal('kirim')}
            className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>Kirim qilish</span>
          </button>
          <button
            onClick={() => handleOpenModal('chiqim')}
            className="flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
          >
            <Minus className="w-5 h-5" />
            <span>Chiqim qilish</span>
          </button>
        </div>
      </div>

      {/* Local Transaction Logs Grid/List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Oxirgi Kirim va Chiqim Operatsiyalari</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/25 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-5">Turi</th>
                <th className="p-5">Kategoriya</th>
                <th className="p-5">Miqdori (Hajmi)</th>
                <th className="p-5">Yo'nalishi</th>
                <th className="p-5">Izoh / Eslatma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-gray-700 dark:text-gray-300">
              {localLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                  <td className="p-5">
                    <span className={cn(
                      "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold",
                      log.mode === 'financial' 
                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" 
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                    )}>
                      {log.mode === 'financial' ? 'Moliyaviy' : 'Yoqilg\'i'}
                    </span>
                  </td>
                  <td className="p-5 font-bold text-gray-900 dark:text-white">{log.category}</td>
                  <td className="p-5 text-sm font-black">{log.amount}</td>
                  <td className="p-5">
                    <span className={cn(
                      "inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold",
                      log.type === 'Kirim' 
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                    )}>
                      {log.type === 'Kirim' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{log.type}</span>
                    </span>
                  </td>
                  <td className="p-5 text-sm text-gray-500 dark:text-gray-400">{log.notes || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kirim / Chiqim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalType === 'kirim' ? 'Kirim tranzaksiyasi kiritish' : 'Chiqim tranzaksiyasi kiritish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kategoriya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
                >
                  {modalType === 'kirim' ? (
                    <>
                      <option value="Inkassatsiya">Inkassatsiya</option>
                      <option value="Boshqa kirim">Boshqa kirim</option>
                    </>
                  ) : (
                    <>
                      <option value="Yoqilg'i xaridi">Yoqilg'i xaridi</option>
                      <option value="Xodim oyligi">Xodim oyligi</option>
                      <option value="Ijara va soliqlar">Ijara va soliqlar</option>
                      <option value="Boshqa chiqim">Boshqa chiqim</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                  {!isFuel ? 'Miqdori (UZS)' : 'Hajmi (Litr yoki m³)'}
                </label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-bold"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Izoh / Eslatma</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  placeholder="Batafsil ma'lumot kiritish..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-semibold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-md",
                    modalType === 'kirim' 
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" 
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  )}
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
