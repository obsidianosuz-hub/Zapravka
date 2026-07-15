import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Award, AlertTriangle, AlertCircle, Plus, Trash2, Download, Upload, Check, X, Calendar, Edit, Save 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function ComplianceManager() {
  const [permits, setPermits] = useState(() => {
    const saved = localStorage.getItem('legalPermits');
    if (saved) return JSON.parse(saved);
    // Initial Seeds
    const initial = [
      { id: 1, name: "O'zenergoinspeksiya Litsenziyasi", category: 'Litsenziya', issuer: 'O\'zenergoinspeksiya', expiryDate: '2027-12-31' },
      { id: 2, name: "Metrologiya Qiyoslash Sertifikati - 1-kolonka", category: 'Metrologiya/Kalibrlash', issuer: 'O\'zTTA', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }, // Expiring in 10 days
      { id: 3, name: "FVV Yong'in Xavfsizligi Xulosasi", category: 'Xavfsizlik', issuer: 'FVV', expiryDate: '2026-05-01' }, // Expired
      { id: 4, name: "Sanoat Xavfsizligi Ruxsatnomasi", category: 'Xavfsizlik', issuer: 'Sanoatkontexnazorat', expiryDate: '2028-09-15' }
    ];
    localStorage.setItem('legalPermits', JSON.stringify(initial));
    return initial;
  });

  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState('Litsenziya');
  const [issuer, setIssuer] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const getDaysLeft = (expiry) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiry);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (daysLeft) => {
    if (daysLeft <= 0) return { label: "Muddati o'tgan", color: "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30", type: 'expired' };
    if (daysLeft <= 30) return { label: "Muddati tugayapti", color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30", type: 'expiring' };
    return { label: "Amalda", color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30", type: 'active' };
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!docName.trim() || !issuer.trim() || !expiryDate) return;

    const newPermit = {
      id: Date.now(),
      name: docName.trim(),
      category,
      issuer: issuer.trim(),
      expiryDate
    };

    const updated = [newPermit, ...permits];
    setPermits(updated);
    localStorage.setItem('legalPermits', JSON.stringify(updated));

    // Reset Form & Close
    setDocName('');
    setIssuer('');
    setExpiryDate('');
    setIsModalOpen(false);
    triggerToast("Hujjat muvaffaqiyatli saqlandi!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Ushbu hujjatni ro'yxatdan o'chirib tashlamoqchimisiz?")) {
      const updated = permits.filter(p => p.id !== id);
      setPermits(updated);
      localStorage.setItem('legalPermits', JSON.stringify(updated));
      triggerToast("Hujjat o'chirildi.");
    }
  };

  // Compute metrics
  const analyzedPermits = permits.map(p => {
    const daysLeft = getDaysLeft(p.expiryDate);
    const statusObj = getStatus(daysLeft);
    return { ...p, daysLeft, status: statusObj };
  });

  const activeCount = analyzedPermits.filter(p => p.status.type === 'active').length;
  const expiringCount = analyzedPermits.filter(p => p.status.type === 'expiring').length;
  const expiredCount = analyzedPermits.filter(p => p.status.type === 'expired').length;

  const expiredOrExpiring = analyzedPermits.filter(p => p.status.type !== 'active');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 font-semibold text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-5 h-5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Litsenziya va Ruxsatnomalar</h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Muvofiqlik
            </span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] w-fit text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Hujjat Biriktirish</span>
          </button>
        </div>
        <p className="text-gray-650 dark:text-gray-350 mt-2 max-w-3xl text-sm leading-relaxed">
          Yoqilg'i quyish shoxobchasining faoliyati uchun zarur bo'lgan davlat ruxsatnomalari, yong'in xavfsizligi sertifikatlari va metrologik qiyoslash muddatlarini nazorat qilish.
        </p>
      </div>

      {/* Expiration Alerts Banner */}
      {expiredOrExpiring.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 text-red-500 space-y-3">
          <div className="flex items-center space-x-2 font-black text-sm uppercase tracking-wider">
            <AlertCircle className="w-5 h-5 animate-pulse text-red-500" />
            <span>METROLOGIYA VA XAVFSIZLIK OGOHLANTIRISHLARI</span>
          </div>
          <ul className="text-xs space-y-2 list-disc list-inside font-semibold leading-relaxed">
            {expiredOrExpiring.map(p => (
              <li key={p.id}>
                {p.status.type === 'expired' ? (
                  <span>
                    MUTLAQ MUDDATI O'TGAN: <strong className="underline">{p.name}</strong> muddati o'tgan! (Amal qilish sanasi: {p.expiryDate}).
                  </span>
                ) : (
                  <span>
                    Yaqinda tugaydi: <strong className="underline">{p.name}</strong> tugashiga <strong className="text-amber-500">{p.daysLeft} kun</strong> qoldi!
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Active Permits */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Faol Hujjatlar</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{activeCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Muddati tugayotganlar</p>
            <h3 className="text-2xl font-black text-amber-500">{expiringCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Expired */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Muddati o'tganlar</p>
            <h3 className="text-2xl font-black text-red-500">{expiredCount}</h3>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Permits Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
          • RUXSATNOMALAR VA METROLOGIYA RO'YXATI
        </h3>

        <div className="overflow-x-auto">
          {permits.length === 0 ? (
            <div className="text-center py-16 text-gray-600 dark:text-gray-450 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm">Hozircha birorta sertifikat yoki litsenziya kiritilmagan.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold">
                  <th className="pb-4 w-12 text-center">#</th>
                  <th className="pb-4">Hujjat / Sertifikat Nomi</th>
                  <th className="pb-4">Toifasi</th>
                  <th className="pb-4">Berilgan Tashkilot</th>
                  <th className="pb-4">Amal Qilish Muddati</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-center">Fayl</th>
                  <th className="pb-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {analyzedPermits.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 text-sm font-bold text-center text-gray-400">{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-550 dark:text-indigo-400 rounded-lg">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded border",
                        p.category === 'Litsenziya'
                          ? "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30"
                          : p.category === 'Metrologiya/Kalibrlash'
                          ? "bg-cyan-50 text-cyan-605 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30"
                          : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                      )}>
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-semibold">{p.issuer}</td>
                    <td className="py-4 text-sm font-semibold flex items-center space-x-1.5 mt-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{p.expiryDate}</span>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
                        p.status.color
                      )}>
                        {p.status.label}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => triggerToast(`Yuklab olish boshlandi: permit_${p.id}.pdf`)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-250 rounded-lg transition-all"
                        title="Yuklab olish"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
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

      {/* ADD NEW DOCUMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 text-gray-900 dark:text-white">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Yangi Hujjat Biriktirish</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-55/10 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Hujjat Nomi</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-95-0 dark:text-white focus:outline-none text-sm font-semibold"
                  placeholder="Masalan: FVV Yong'in Xavfsizligi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Toifasi</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                  >
                    <option value="Litsenziya">Litsenziya</option>
                    <option value="Metrologiya/Kalibrlash">Metrologiya</option>
                    <option value="Xavfsizlik">Xavfsizlik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bergan Tashkilot</label>
                  <input
                    type="text"
                    required
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-95-0 dark:text-white focus:outline-none text-sm font-semibold"
                    placeholder="Masalan: FVV"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Amal Qilish Muddati</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-95-0 dark:text-white focus:outline-none text-sm font-semibold text-center"
                />
              </div>

              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Hujjat skanerini yuklang (PDF)</p>
                <p className="text-[10px] text-gray-400 mt-1">Maksimal hajm 10MB</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl text-sm font-bold transition-all hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>SAQLASH</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
