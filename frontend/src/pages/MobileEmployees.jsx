import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Clock, UserCheck, UserX, UserSquare2, Plus, Pencil, Trash2, Mail, Phone, Send, ShieldAlert, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function MobileEmployees() {
  const [employees, setEmployees] = useState([]);
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, shiftRes] = await Promise.all([
          axios.get('http://127.0.0.1:3000/api/users'),
          axios.get('http://127.0.0.1:3000/api/shifts/active').catch(() => ({ data: null }))
        ]);
        setEmployees(usersRes.data || []);
        setActiveShift(shiftRes.data);
      } catch (err) {
        console.error("Xodimlar ma'lumotini yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span className="animate-spin text-blue-500 w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent"></span></div>;
  }

  const activeCashierId = activeShift?.userId;
  
  // Custom mock details for visual perfection to match the image requirements
  const getMockDetails = (username) => {
    if (username === 'admin') return { name: 'Sodiqov Usmonjon', id: '00012', tg: '@usmonjon', phone: '+998 90 123 45 67', email: 'admin@ecogas.uz' };
    if (username === 'kassa') return { name: 'Qodirov Alisher', id: '00084', tg: '@alisher_kassa', phone: '+998 90 987 65 43', email: 'kassa@ecogas.uz' };
    return { name: username, id: '00000', tg: `@${username}`, phone: '+998 00 000 00 00', email: `${username}@ecogas.uz` };
  };

  return (
    <div className="space-y-6 pb-4">
      
      {/* ── Header & Action Button ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Xodimlar</h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Tizim foydalanuvchilari va xodimlarni boshqarish</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Xodim qo'shish</span>
        </button>
      </div>

      {/* ── Active Shift Status (Desktop style minimal) ── */}
      <div className={`rounded-3xl p-4 border flex items-center justify-between ${activeShift ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${activeShift ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
            <UserSquare2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">Joriy Smena</h3>
            <p className="text-sm font-black text-white">{activeShift ? 'Smena Ochiq (Faol)' : 'Smena Yopiq'}</p>
          </div>
        </div>
        {activeShift && (
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-indigo-300">FAOL</span>
            </div>
            <p className="text-[10px] text-indigo-200/70">{new Date(activeShift.startTime).toLocaleTimeString()}</p>
          </div>
        )}
      </div>

      {/* ── Employee Cards List ── */}
      <div className="space-y-4">
        {employees.map(user => {
          const details = getMockDetails(user.username);
          const isAdmin = user.role === 'ADMIN';
          const isOnline = activeCashierId === user.id;

          return (
            <div key={user.id} className={cn(
              "bg-slate-900/80 border rounded-3xl p-4 relative overflow-hidden transition-all",
              isOnline ? "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "border-slate-800/80"
            )}>
              {/* Online Indicator */}
              {isOnline && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg",
                    isAdmin ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-900/20" : 
                    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-900/20"
                  )}>
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  
                  {/* Name & Role */}
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      {details.name}
                      {isOnline && <UserCheck className="w-4 h-4 text-emerald-400" />}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">ID: <span className="font-mono text-slate-400">{details.id}</span></span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span className="text-[10px] text-slate-400">@{user.username}</span>
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className={cn(
                  "px-2.5 py-1 rounded-lg flex items-center gap-1",
                  isAdmin ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                )}>
                  {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{isAdmin ? 'Administrator' : 'Kassir'}</span>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 gap-2 bg-slate-950/50 rounded-2xl p-3 border border-slate-800/50 mb-4">
                <div className="flex items-center gap-3 text-xs">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 font-medium">{details.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-300 font-medium">{details.tg}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 font-medium">{details.email}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
                <button className="flex items-center justify-center p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center p-2 rounded-xl bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
      
      {/* ── Add Employee Modal (Placeholder Overlay) ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
          <div className="bg-slate-900 w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl border border-slate-800 p-5 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black text-white">Yangi Xodim Qo'shish</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:text-white">
                <UserX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Ism va Familiya</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="Masalan: Aliyev Vali" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Login</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="@login" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">PIN Kod</label>
                  <input type="password" maxLength={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="****" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Rolni Tanlang</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none appearance-none">
                  <option value="CASHIER">Kassir</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              
              <button onClick={() => setIsAddModalOpen(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/30 transition-all mt-2">
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
