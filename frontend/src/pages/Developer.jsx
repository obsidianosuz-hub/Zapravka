import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Key, Plus, Trash2, Copy, Check, Terminal, Camera, 
  Send, Save, ShieldAlert, BadgeCheck, X 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Developer() {
  const [activeTab, setActiveTab] = useState('api-keys'); // 'api-keys' | 'telegram'

  // Toast State
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  // 1. API KEY MANAGEMENT STATES
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

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

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
    triggerToast("Yangi API Kalit muvaffaqiyatli yaratildi!");
  };

  const handleDeleteKey = (id) => {
    if (window.confirm("Ushbu uskunani va uning API kalitini o'chirmoqchimisiz?")) {
      const updated = devices.filter(d => d.id !== id);
      setDevices(updated);
      localStorage.setItem('developerApiKeys', JSON.stringify(updated));
      triggerToast("API Kalit o'chirildi.");
    }
  };

  const handleCopyKey = (id, keyString) => {
    navigator.clipboard.writeText(keyString);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // 2. TELEGRAM BOT INTEGRATION STATES
  const [employees, setEmployees] = useState([]);
  const [chatIds, setChatIds] = useState(() => {
    const saved = localStorage.getItem('telegramChatIds');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3000/api/auth/users');
        setEmployees(res.data);
        const initial = {};
        res.data.forEach(emp => {
          initial[emp.username] = emp.telegramChatId || '';
        });
        setChatIds(initial);
      } catch (err) {
        console.error("Error fetching employees for Telegram config:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleChatIdChange = (username, value) => {
    setChatIds(prev => ({
      ...prev,
      [username]: value.replace(/\D/g, '') // numbers only
    }));
  };

  const handleSaveChatId = async (emp) => {
    try {
      const value = chatIds[emp.username] || '';
      await axios.put(`http://127.0.0.1:3000/api/auth/users/${emp.id}`, {
        telegramChatId: value
      });
      triggerToast("Telegram Chat ID muvaffaqiyatli saqlandi!");
    } catch (err) {
      console.error(err);
      triggerToast("Xatolik: Chat ID saqlanmadi");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-55 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 font-semibold text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Title and Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dasturchi rejimi</h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Developer Settings
            </span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={cn(
              "pb-3 text-sm font-bold border-b-2 transition-all px-1",
              activeTab === 'api-keys'
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            API Kalitlar
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={cn(
              "pb-3 text-sm font-bold border-b-2 transition-all px-1",
              activeTab === 'telegram'
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            Telegram Bot Integratsiyasi
          </button>
        </div>
      </div>

      {/* TAB 1: API Keys Management */}
      {activeTab === 'api-keys' && (
        <div className="space-y-8">
          <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-4xl">
            LPR kameralari va boshqa tashqi uskunalar tizim integratsiyasidan foydalanishi uchun maxsus ruxsatnomalar yarating va boshqaring.
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
              • YANGI USKUNA QO'SHISH
            </h3>
            
            <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row items-end gap-4">
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

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
              • FAOL USKUNALAR RO'YXATI
            </h3>

            <div className="overflow-x-auto">
              {devices.length === 0 ? (
                <div className="text-center py-16 text-gray-600 dark:text-gray-450 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold text-sm">Hali birorta uskuna qo'shilmagan.</p>
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
                              onClick={() => handleCopyKey(d.id, d.apiKey)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-950 dark:hover:text-white transition-colors"
                              title="API kalitni nusxalash"
                            >
                              {copiedId === d.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteKey(d.id)}
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
      )}

      {/* TAB 2: Telegram Bot Integration */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700/50 pb-6 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Send className="w-6 h-6 text-sky-500" />
                  <span>Telegram Bot & Xodimlar</span>
                </h3>
                <p className="text-sm text-gray-550 dark:text-gray-400 mt-1 max-w-3xl">
                  Xodimlar Telegram bot orqali bildirishnomalar olishi yoki tasdiqlash funksiyalaridan foydalanishi uchun ularning shaxsiy Chat ID larini bu yerda biriktiring.
                </p>
              </div>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider w-fit">
                Integratsiya
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-4 w-20 text-center">Avatar</th>
                    <th className="pb-4">Xodim (Ism Sharif)</th>
                    <th className="pb-4">Telegram & Rol</th>
                    <th className="pb-4">Telegram Chat ID</th>
                    <th className="pb-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                      <td className="py-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mx-auto">
                          {emp.name ? emp.name.split(' ').map(n => n[0]).join('') : emp.username.substring(0, 2)}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{emp.name || emp.username}</span>
                      </td>
                      <td className="py-4 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs text-sky-600 dark:text-sky-400 font-bold">
                          <Send className="w-3 h-3" />
                          <span>{emp.telegramHandle || '@yozilmagan'}</span>
                        </div>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border",
                          emp.role === 'ADMIN'
                            ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                            : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                        )}>
                          {emp.role === 'ADMIN' ? 'Administrator' : 'Kassir'}
                        </span>
                      </td>
                      <td className="py-4">
                        <input
                          type="text"
                          value={chatIds[emp.username] || ''}
                          onChange={(e) => handleChatIdChange(emp.username, e.target.value)}
                          placeholder="Chat ID (masalan: 1412501744)"
                          className="w-56 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleSaveChatId(emp)}
                          className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 hover:bg-amber-500 hover:text-black dark:hover:text-black transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Saqlash</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
