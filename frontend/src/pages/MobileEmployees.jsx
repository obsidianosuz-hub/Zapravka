import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Clock, UserCheck, UserX, UserSquare2 } from 'lucide-react';

export default function MobileEmployees() {
  const [employees, setEmployees] = useState([]);
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const cashiers = employees.filter(e => e.role === 'CASHIER');
  const admins = employees.filter(e => e.role === 'ADMIN');

  return (
    <div className="space-y-6 pb-4">
      {/* ── Active Shift Status ── */}
      <div className={`rounded-3xl p-5 border ${activeShift ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${activeShift ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
              <UserSquare2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-0.5">Joriy Smena</h3>
              <p className="text-lg font-black text-white">{activeShift ? 'Smena Ochiq' : 'Smena Yopiq'}</p>
            </div>
          </div>
          {activeShift && (
            <div className="flex items-center gap-1.5 bg-indigo-500/20 px-2 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-indigo-300">FAOL</span>
            </div>
          )}
        </div>
        
        {activeShift && (
          <div className="mt-4 pt-4 border-t border-indigo-500/10 flex items-center gap-2 text-sm text-indigo-200">
            <Clock className="w-4 h-4" />
            <span>Boshlandi: {new Date(activeShift.startTime).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* ── Kassirlar ── */}
      <div>
        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1 mb-3">Kassirlar</h3>
        <div className="space-y-2">
          {cashiers.map(c => {
            const isOnline = activeCashierId === c.id;
            return (
              <div key={c.id} className={`p-4 rounded-2xl border flex items-center justify-between ${isOnline ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isOnline ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {c.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">{c.username}</h4>
                    <p className="text-xs text-slate-500">{c.role}</p>
                  </div>
                </div>
                <div>
                  {isOnline ? (
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <UserX className="w-5 h-5 text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Ma'murlar (Admins) ── */}
      <div>
        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider ml-1 mb-3">Ma'murlar (Admin)</h3>
        <div className="space-y-2">
          {admins.map(a => (
            <div key={a.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-blue-500/20 text-blue-400">
                  {a.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">{a.username}</h4>
                  <p className="text-xs text-slate-500">{a.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
