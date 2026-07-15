import React, { useState } from 'react';
import { 
  Settings, Sliders, Key, Eye, EyeOff, Copy, Check, Info, ShieldAlert, CreditCard 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function FinanceSettings() {
  // Toast State
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  // Form Credentials States
  const [serviceId, setServiceId] = useState(() => localStorage.getItem('click_service_id') || '32912');
  const [merchantId, setMerchantId] = useState(() => localStorage.getItem('click_merchant_id') || '25983');
  const [secretKey, setSecretKey] = useState(() => localStorage.getItem('click_secret_key') || 'click_secret_123');
  const [apiToken, setApiToken] = useState(() => localStorage.getItem('click_api_token') || 'token_abc123xyz');

  // Toggle Input Visibilities
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Clipboard Copied Status
  const [copied, setCopied] = useState(false);

  const callbackUrl = `${window.location.origin}/api/payment/click`;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('click_service_id', serviceId);
    localStorage.setItem('click_merchant_id', merchantId);
    localStorage.setItem('click_secret_key', secretKey);
    localStorage.setItem('click_api_token', apiToken);
    triggerToast("Click API sozlamalari muvaffaqiyatli saqlandi!");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    triggerToast("Callback URL nusxalandi!");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 font-semibold text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Moliya Sozlamalari</h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Sozlamalar
            </span>
          </div>
        </div>
        <p className="text-gray-650 dark:text-gray-350 mt-2 max-w-3xl text-sm leading-relaxed">
          Tizim to'lov tizimlari va Click Gateway integratsiyalarini boshqarish. API hisob ma'lumotlarini bu yerdan kiritishingiz mumkin.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-xl text-white space-y-6">
        {/* Card Header with Click Brand Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Click Merchant Integratsiyasi</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click to'lov shlyuzining hisob ma'lumotlarini sozlash</p>
            </div>
          </div>
          <span className="bg-blue-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl tracking-widest uppercase">
            CLICK
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service ID */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
                Click Service ID
              </label>
              <input
                type="text"
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold tracking-wider font-mono"
                placeholder="Masalan: 32912"
              />
            </div>

            {/* Merchant ID */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
                Click Merchant ID
              </label>
              <input
                type="text"
                required
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold tracking-wider font-mono"
                placeholder="Masalan: 25983"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secret Key */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
                Click Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full p-3 pr-10 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold tracking-wider font-mono"
                  placeholder="Secret Key"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Merchant API Token */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
                Merchant API Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  required
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full p-3 pr-10 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold tracking-wider font-mono"
                  placeholder="API Token"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Webhook URL Input */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pl-1">
              Click Merchant Kabinetiga kiritiladigan tayyor URL (Callback URL):
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={callbackUrl}
                className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-450 select-all font-mono text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center space-x-2"
                title="URL nusxalash"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1.5 pl-1">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Click tizimi tranzaksiyalar bo'yicha server bilan bog'lanishi uchun ushbu URL ishlatiladi.</span>
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-600/10 flex items-center space-x-2 text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>SAQLASH</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
