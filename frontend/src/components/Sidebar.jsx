import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Server, Settings, Droplets,
  Flame, ChevronDown, Fuel, Users, PieChart, Key, Scale, Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Sidebar() {
  const { t, navFilter, setNavFilter } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [openMenus, setOpenMenus] = useState({
    dashboard: location.pathname === '/dashboard',
    cashier: location.pathname === '/cashier',
  });
  const [isFinanceOpen, setIsFinanceOpen] = useState(location.pathname.startsWith('/finance'));
  const [isLegalOpen, setIsLegalOpen] = useState(location.pathname.startsWith('/yuridik'));

  const toggleMenu = (key, path) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    navigate(path);
  };

  const handleSubItem = (path, filter) => {
    navigate(path);
    setNavFilter(filter);
    // Also ensure parent is open
    if (path === '/dashboard') setOpenMenus(prev => ({ ...prev, dashboard: true }));
    if (path === '/cashier') setOpenMenus(prev => ({ ...prev, cashier: true }));
  };

  const isDashboardActive = location.pathname === '/dashboard';
  const isCashierActive = location.pathname === '/cashier';

  return (
    <div className="h-full w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-200">
      <div className="p-6 flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <Droplets className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">EcoGas</span>
        </div>

        <nav className="space-y-1">

          {/* ── Dashboard Link ── */}
          {user?.role !== 'CASHIER' && (
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
              isDashboardActive
                ? "bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-500" />
            <span className="font-medium">{t('dashboard')}</span>
          </button>
          )}

          {/* ── Moliya Dropdown Accordion ── */}
          {user?.role === 'ADMIN' && (
          <div>
            <button
              onClick={() => setIsFinanceOpen(!isFinanceOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                location.pathname.startsWith('/finance')
                  ? "bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <PieChart className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">{t('finance')}</span>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-300",
                isFinanceOpen ? "rotate-180" : ""
              )} />
            </button>

            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isFinanceOpen ? "max-h-80 opacity-100 mt-1" : "max-h-0 opacity-0"
            )}>
              <div className="ml-4 pl-4 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-1">
                <button
                  onClick={() => navigate('/finance/transactions')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/finance/transactions'
                      ? "bg-emerald-105 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Tranzaksiyalar</span>
                </button>
                <button
                  onClick={() => navigate('/finance/reports')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/finance/reports'
                      ? "bg-emerald-105 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Hisobotlar</span>
                </button>
                <button
                  onClick={() => navigate('/finance/actions')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/finance/actions'
                      ? "bg-emerald-105 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Harakatlar</span>
                </button>
                <button
                  onClick={() => navigate('/finance/settings')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/finance/settings'
                      ? "bg-emerald-105 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Sozlamalar</span>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* ── Yuridik Dropdown Accordion ── */}
          {user?.role === 'ADMIN' && (
          <div>
            <button
              onClick={() => setIsLegalOpen(!isLegalOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                location.pathname.startsWith('/yuridik')
                  ? "bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <span className="font-medium">Yuridik</span>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-300",
                isLegalOpen ? "rotate-180" : ""
              )} />
            </button>

            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isLegalOpen ? "max-h-80 opacity-100 mt-1" : "max-h-0 opacity-0"
            )}>
              <div className="ml-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-1">
                <button
                  onClick={() => navigate('/yuridik/shartnomalar')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/yuridik/shartnomalar'
                      ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Shartnomalar</span>
                </button>
                <button
                  onClick={() => navigate('/yuridik/customs')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/yuridik/customs'
                      ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Bojxona (Import)</span>
                </button>
                <button
                  onClick={() => navigate('/yuridik/shablonlar')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/yuridik/shablonlar'
                      ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Shablonlar</span>
                </button>
                <button
                  onClick={() => navigate('/yuridik/compliance')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                    location.pathname === '/yuridik/compliance'
                      ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span>Litsenziyalar</span>
                </button>
              </div>
            </div>
          </div>
          )}

          {/* ── Kassa Dropdown ── */}
          {(user?.role === 'CASHIER' || user?.role === 'ADMIN') && (
          <div>
            <button
              onClick={() => toggleMenu('cashier', '/cashier')}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                isCashierActive
                  ? "bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">{t('cashier')}</span>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-300",
                openMenus.cashier ? "rotate-180" : ""
              )} />
            </button>

            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openMenus.cashier ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"
            )}>
              <div className="ml-4 pl-4 border-l-2 border-emerald-200 dark:border-emerald-800 space-y-1">
                <button
                  onClick={() => handleSubItem('/cashier', 'gas')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isCashierActive && navFilter === 'gas'
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Flame className="w-4 h-4 text-blue-500" />
                  <span>{t('gas')}</span>
                </button>
                <button
                  onClick={() => handleSubItem('/cashier', 'petrol')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isCashierActive && navFilter === 'petrol'
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Fuel className="w-4 h-4 text-amber-500" />
                  <span>{t('petrol')}</span>
                </button>
                <button
                  onClick={() => handleSubItem('/cashier', 'electric')}
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    isCashierActive && navFilter === 'electric'
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>Elektr</span>
                </button>
              </div>
            </div>
          </div>
          )}



          {/* ── Xodimlar ── */}
          {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/employees')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
              location.pathname === '/employees'
                ? "bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{t('employees')}</span>
          </button>
          )}

          {/* ── Sozlamalar ── */}
          {user?.role !== 'CASHIER' && (
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
              location.pathname === '/settings'
                ? "bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Settings className="w-5 h-5 text-rose-500" />
            <span className="font-medium">{t('settings')}</span>
          </button>
          )}

          {/* ── Developer ── */}
          {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/developer')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
              location.pathname === '/developer'
                ? "bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Key className="w-5 h-5 text-yellow-500" />
            <span className="font-medium">Developer</span>
          </button>
          )}

        </nav>
      </div>

      {/* User Info */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
            {user?.username?.substring(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role === 'ADMIN' ? t('admin_desc') : t('cashier_desc')}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Tizimdan chiqish"
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
