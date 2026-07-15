import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Lock, KeyRound, Droplets } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Login() {
  const [activeTab, setActiveTab] = useState('credentials'); // 'credentials' or 'pin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const pinInputRef = useRef(null);

  const performPinLogin = async (currentPin) => {
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:3000/api/auth/login', { pinCode: currentPin });
      if (response.data && response.data.user) {
        login(response.data.user);
        if (response.data.user.role === 'ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/cashier');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Tizimga kirishda xatolik yuz berdi");
      setPinCode('');
      setTimeout(() => {
        if (pinInputRef.current) {
          pinInputRef.current.focus();
        }
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pin' && pinCode.length === 4 && !loading) {
      performPinLogin(pinCode);
    }
  }, [pinCode, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Prepare payload based on active tab
    const payload = {};
    if (activeTab === 'credentials') {
      if (!username || !password) {
        setError("Foydalanuvchi nomi va parolni kiriting");
        return;
      }
      payload.username = username;
      payload.password = password;
      
      setLoading(true);
      try {
        const response = await axios.post('http://127.0.0.1:3000/api/auth/login', payload);
        if (response.data && response.data.user) {
          login(response.data.user);
          if (response.data.user.role === 'ADMIN') {
            navigate('/dashboard');
          } else {
            navigate('/cashier');
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Tizimga kirishda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    } else {
      if (!pinCode || pinCode.length < 4) {
        setError("4 xonali PIN-kodni kiriting");
        return;
      }
      performPinLogin(pinCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      {/* Main Glassmorphism Card */}
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Subtle glowing accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 rounded-b-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>

        <div className="p-8 sm:p-12">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">EcoGas</h2>
            <p className="text-slate-400 text-sm mt-1">Avtomatlashtirilgan boshqaruv tizimi</p>
          </div>

          {/* Tabbed Interface */}
          <div className="flex p-1 bg-slate-900/50 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => { setActiveTab('credentials'); setError(''); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
                activeTab === 'credentials'
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Login va Parol
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('pin'); setError(''); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
                activeTab === 'pin'
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              PIN-kod
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {activeTab === 'credentials' ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">
                    Foydalanuvchi nomi
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-500">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-700 bg-slate-900/50 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                      placeholder="admin"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">
                    Parol
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-500">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-slate-700 bg-slate-900/50 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center">
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  PIN-kodni kiriting
                </label>
                <div className="relative group w-full max-w-[240px]">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-500">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <input
                    type="password"
                    ref={pinInputRef}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="block w-full pl-12 pr-4 py-4 border border-slate-700 bg-slate-900/50 text-white rounded-xl placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner text-center text-3xl tracking-[0.5em] font-mono"
                    placeholder="----"
                    maxLength={4}
                    autoFocus
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group py-4 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-50"></div>
              <span className="relative flex items-center justify-center space-x-2">
                {loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
