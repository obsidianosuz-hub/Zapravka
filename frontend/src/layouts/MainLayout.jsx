import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MapPin, Bell, BellRing, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function MainLayout() {
  const { selectedBranchId, setSelectedBranchId } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  
  // Notification states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: "alert-1",
      title: "⚠️ Yoqilg'i kam qoldi!",
      message: "EcoGas Bosh Filial: Propan baki xavfli darajada kam! (Hozirgi qoldiq: 850 Litr)",
      time: "Hozirgina",
      route: "/dashboard",
      unread: true,
      severity: "critical"
    },
    {
      id: "alert-2",
      title: "⚠️ Metrologiya muddati tugamoqda",
      message: "Yunusobod filiali: 1-kolonka metrologiya qiyoslash muddati tugashiga 10 kun qoldi!",
      time: "1 soat avval",
      route: "/yuridik/compliance",
      unread: true,
      severity: "warning"
    }
  ]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      axios.get('http://127.0.0.1:3000/api/branches')
        .then(res => {
          setBranches(res.data.branches || []);
        })
        .catch(err => {
          console.error('Error fetching branches:', err);
        });
    }
  }, [user]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotifClick = (e, n) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
    setIsNotifOpen(false);
    setSelectedAlert(n);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        {user?.role === 'ADMIN' && (
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/50 px-8 py-4 flex items-center justify-between transition-colors duration-200 relative z-35">
            <div>
              {/* Left blank or custom logo */}
            </div>
            <div className="flex items-center space-x-4">
              
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2.5 bg-gray-55 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl relative hover:scale-105 active:scale-95 transition-all"
                >
                  {unreadCount > 0 ? (
                    <BellRing className="w-5 h-5 text-amber-500 animate-bounce" />
                  ) : (
                    <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center absolute -top-1 -right-1 font-bold border border-[#0f172a]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isNotifOpen && (
                  <div className="bg-[#1e293b] border border-slate-800 shadow-2xl rounded-2xl p-4 w-80 absolute right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-155 text-white space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-sm">Bildirishnomalar</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] bg-slate-900 hover:bg-slate-850 px-2 py-1 rounded text-indigo-400 font-bold transition-all"
                        >
                          Barchasini o'qildi qilish
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-800/50">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-455 text-center py-4">Yangi bildirishnomalar mavjud emas</p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={(e) => handleNotifClick(e, n)}
                            className={cn(
                              "pt-3 first:pt-0 space-y-1.5 pb-2 border-b border-slate-800/40 last:border-b-0 cursor-pointer hover:bg-slate-800/45 p-2 rounded-xl transition-all", 
                              n.unread ? "opacity-100" : "opacity-60"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold text-white block">{n.title}</span>
                              <span className="text-xs text-slate-400">{n.time}</span>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </header>
        )}

        <div className="flex-1 overflow-auto">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Detailed Modal View */}
      {selectedAlert && (
        <div className="fixed inset-0 w-screen h-screen bg-[#090d16] z-[9999] flex flex-col items-center justify-center p-8 md:p-16 text-white animate-in fade-in duration-150">
          
          {/* Top Right Exit Button */}
          <button
            onClick={() => {
              if (selectedAlert.route) {
                navigate(selectedAlert.route);
              }
              setSelectedAlert(null);
            }}
            className="absolute top-8 right-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/10 active:scale-95 transition-all cursor-pointer text-sm"
          >
            <X className="w-4 h-4" />
            <span>Sahifaga o'tish</span>
          </button>

          {/* Centered warning content */}
          <div className="flex flex-col items-center space-y-6 max-w-3xl w-full">
            
            {/* Category/Severity Badge */}
            <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-md tracking-widest ${
              selectedAlert.severity === 'critical' 
                ? 'bg-red-500/10 text-red-400 border border-red-500/25' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
            }`}>
              {selectedAlert.severity === 'critical' ? 'MUHIM (CRITICAL)' : 'DIQQAT (WARNING)'}
            </span>

            {/* Large Title */}
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight text-center">
              {selectedAlert.title}
            </h2>

            {/* Message Box */}
            <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl text-lg md:text-xl text-slate-200 text-center leading-relaxed shadow-inner">
              {selectedAlert.message}
            </div>

            {/* Timestamp */}
            <span className="text-xs text-slate-450 font-semibold">{selectedAlert.time}</span>

          </div>
        </div>
      )}
    </div>
  );
}
