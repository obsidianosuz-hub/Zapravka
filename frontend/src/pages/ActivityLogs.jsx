import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, Clock, Search, Edit2, Trash2, X, Check, Eye 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '../context/AuthContext';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function ActivityLogs() {
  const { user: currentUser } = useAuth();
  
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('activityLogs');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: 1, user: 'Admin User', action: 'Metan narxini 3800 dan 4000 ga o\'zgartirdi', timestamp: '2026-07-10 09:44:12' },
      { id: 2, user: 'Kassa Operator', action: 'Yangi kalonka qo\'shdi #6', timestamp: '2026-07-10 09:20:05' },
      { id: 3, user: 'Admin User', action: '3,000,000 UZS chiqim kiritdi (Xodim oyligi)', timestamp: '2026-07-10 08:35:40' },
      { id: 4, user: 'Admin User', action: 'Yangi xodim qo\'shdi: Sodiqov Usmonjon', timestamp: '2026-07-09 15:12:30' },
      { id: 5, user: 'Kassa Operator', action: 'Buyurtmani yakunladi #12 (Methane, 20 m³)', timestamp: '2026-07-09 14:05:11' }
    ];
    localStorage.setItem('activityLogs', JSON.stringify(initial));
    return initial;
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editUser, setEditUser] = useState('');
  const [editAction, setEditAction] = useState('');
  const [editTimestamp, setEditTimestamp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toDatetimeLocal = (str) => {
    if (!str) return '';
    return str.replace(' ', 'T').substring(0, 16);
  };

  const fromDatetimeLocal = (str) => {
    if (!str) return '';
    return str.replace('T', ' ') + ':00';
  };

  const handleEditClick = (log) => {
    setEditingId(log.id);
    setEditUser(log.user);
    setEditAction(log.action);
    setEditTimestamp(toDatetimeLocal(log.timestamp));
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const updatedLog = {
      id: editingId,
      user: editUser,
      action: editAction,
      timestamp: fromDatetimeLocal(editTimestamp)
    };

    try {
      // Send PUT API request to backend log management system
      await axios.put(`http://127.0.0.1:3000/api/logs/${editingId}`, updatedLog);
    } catch (err) {
      console.warn("Backend API /api/logs not active, updating local state directly.");
    } finally {
      const updated = logs.map(log => log.id === editingId ? updatedLog : log);
      setLogs(updated);
      localStorage.setItem('activityLogs', JSON.stringify(updated));
      setIsModalOpen(false);
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Ushbu harakat logini tizim xronologiyasidan butunlay o'chirmoqchimisiz?")) {
      try {
        // Send DELETE API request to backend log management system
        await axios.delete(`http://127.0.0.1:3000/api/logs/${id}`);
      } catch (err) {
        console.warn("Backend API /api/logs not active, updating local state directly.");
      } finally {
        const updated = logs.filter(log => log.id !== id);
        setLogs(updated);
        localStorage.setItem('activityLogs', JSON.stringify(updated));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Tizim Harakatlari</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Audit loglari va tizim bo'ylab foydalanuvchilar harakatlar xronologiyasi</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Qidiruv (Foydalanuvchi yoki harakat bo'yicha)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
          />
        </div>
      </div>

      {/* Timelines and Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Audit xronologiyasi (System Activity Log)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/25 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-5 w-1/4">Kim qildi? (Foydalanuvchi)</th>
                <th className="p-5 w-5/12">Nima qildi? (Harakat tavsifi)</th>
                <th className="p-5 w-1/4">Qachon qildi? (Sana va vaqt)</th>
                {currentUser?.role === 'ADMIN' && <th className="p-5 w-1/12 text-right">AMALLAR</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-gray-700 dark:text-gray-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center space-x-3.5">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm",
                        log.user.includes('Admin') 
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" 
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{log.user}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {log.action}
                  </td>
                  <td className="p-5 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>
                  {currentUser?.role === 'ADMIN' && (
                    <td className="p-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(log)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(log.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Harakat logini tahrirlash
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Kim qildi? (Foydalanuvchi)</label>
                <input
                  type="text"
                  required
                  value={editUser}
                  onChange={(e) => setEditUser(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
                  placeholder="Foydalanuvchi nomi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Nima qildi? (Harakat tavsifi)</label>
                <textarea
                  required
                  value={editAction}
                  onChange={(e) => setEditAction(e.target.value)}
                  rows="3"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  placeholder="Harakat tafsilotlari..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Qachon qildi? (Sana va Vaqt)</label>
                <input
                  type="datetime-local"
                  required
                  value={editTimestamp}
                  onChange={(e) => setEditTimestamp(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
