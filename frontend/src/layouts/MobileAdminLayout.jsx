import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, Users, LogOut, Monitor, Droplets, Clock } from 'lucide-react';
import axios from 'axios';

export default function MobileAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeShift, setActiveShift] = useState(null);

  useEffect(() => {
    // Prevent zoom and horizontal scroll on mobile
    document.body.style.overflowX = 'hidden';
    
    // Fetch active shift status just to show on header
    const checkShift = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3000/api/shifts/active');
        setActiveShift(res.data);
      } catch (err) {
        setActiveShift(null);
      }
    };
    checkShift();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/mobile/dashboard', icon: LayoutDashboard },
    { name: 'Moliya', path: '/mobile/finance', icon: Wallet },
    { name: 'Xodimlar', path: '/mobile/employees', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">EcoGas</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Faol
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Desktop versiyaga o'tish"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Active Shift Info */}
        <div className="mt-4 flex items-center justify-between bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-300">
              Smena: {activeShift ? 'Ochiq' : 'Yopiq'}
            </span>
          </div>
          <span className="text-xs font-bold text-white bg-slate-700 px-2 py-1 rounded-md">
            {user?.username}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-14 rounded-2xl transition-all ${
                  isActive 
                    ? 'text-blue-400 bg-blue-500/10 scale-105' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] font-bold ${isActive ? 'text-blue-400' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
