import React, { useState } from 'react';
import { 
  Key, Plus, Trash2, Copy, Check, Terminal, Camera, Cpu, Globe 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function ApiKeys() {
  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('developerApiKeys');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: 1, name: 'Asosiy Darvoza Kamerasi (LPR)', lastSeen: '2026-07-14 10:15:30', apiKey: 'sk_7khkJFdoXPYB78c92aKsdjFh10a9Ld2s' },
      { id: 2, name: 'Kassa Rezerv Kamerasi', lastSeen: 'Hali ulanmagan', apiKey: 'sk_89jKasd89aJkd81h29Ksad89aJk10aKd' }
    ];
    localStorage.setItem('developerApiKeys', JSON.stringify(initial));
    return initial;
  });

  const [deviceName, setDeviceName] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    // Generate secure mock API key: sk_ + 32 random characters
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomStr = Array.from(
      { length: 32 }, 
      () => chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    const newKey = `sk_${randomStr}`;

    const newDevice = {
      id: Date.now(),
      name: deviceName.trim(),
      lastSeen: 'Hali ulanmagan',
      apiKey: newKey
    };

    const updated = [...devices, newDevice];
    setDevices(updated);
    localStorage.setItem('developerApiKeys', JSON.stringify(updated));
    setDeviceName('');
  };

  const handleDelete = (id) => {
    if (window.confirm("Ushbu uskunani va uning API kalitini butunlay o'chirib tashlamoqchimisiz?")) {
      const updated = devices.filter(d => d.id !== id);
      setDevices(updated);
      localStorage.setItem('developerApiKeys', JSON.stringify(updated));
    }
  };

  const handleCopy = (id, keyString) => {
    navigator.clipboard.writeText(keyString);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">API Kalitlar</h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Dasturchi rejimi
            </span>
          </div>
        </div>
        <p className="text-gray-750 dark:text-gray-350 mt-2 max-w-3xl text-sm leading-relaxed">
          Ushbu bo'lim orqali LPR va boshqa aqlli kameralar uchun maxsus API ruxsatnomalarini (API Keys) yaratasiz. Ularni faqat ishonchli uskunalar tarmog'iga kiriting.
        </p>
      </div>

      {/* Form Section: Add New Device */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
          • YANGI USKUNA QO'SHISH
        </h3>
        
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-450 uppercase tracking-wider mb-2 pl-1">
              Uskuna / Kamera nomi
            </label>
            <input
              type="text"
              required
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-semibold"
              placeholder="Masalan: Asosiy Darvoza Kamerasi (LPR)"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>YARATISH</span>
          </button>
        </form>
      </div>

      {/* Active Devices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
          • FAOL USKUNALAR RO'YXATI
        </h3>

        <div className="overflow-x-auto">
          {devices.length === 0 ? (
            <div className="text-center py-16 text-gray-600 dark:text-gray-450 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <Terminal className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm">Hali birorta uskuna qo'shilmagan.</p>
              <p className="text-xs text-gray-450 mt-1">Uskuna nomini yozib yangi API kalit yarating.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold">
                  <th className="pb-4 w-12 text-center">#</th>
                  <th className="pb-4">Uskuna / Kamera nomi</th>
                  <th className="pb-4">Oxirgi faollik</th>
                  <th className="pb-4">API Kalit</th>
                  <th className="pb-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {devices.map((d, index) => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 text-sm font-bold text-center text-gray-400">{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{d.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded",
                        d.lastSeen === 'Hali ulanmagan'
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                      )}>
                        {d.lastSeen}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-300 select-all font-semibold tracking-wider">
                          {d.apiKey}
                        </span>
                        <button
                          onClick={() => handleCopy(d.id, d.apiKey)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-950 dark:hover:text-white transition-colors"
                          title="API kalitni nusxalash"
                        >
                          {copiedId === d.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
