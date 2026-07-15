import React, { useState } from 'react';
import { 
  FileText, Plus, Trash2, Edit, Save, ArrowLeft, Upload, FileCheck, Check 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function ContractTemplates() {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('contractTemplates');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: 1, name: "Yoqilg'i yetkazib berish shartnomasi v1", date: '2026-07-15', type: 'Ichki savdo', content: 'Ushbu shartnoma {{MIJOZ_NOMI}} va EcoGas MCHJ o\'rtasida tuzildi. Shartnoma raqami: {{SHARTNOMA_RAQAMI}}, umumiy summa: {{SUMMA}} UZS, imzolangan sana: {{SANA}}.' },
      { id: 2, name: "Import mahsulotlar shartnomasi shabloni", date: '2026-07-14', type: 'Import', content: 'Yuk yetkazib berish shartnomasi {{SHARTNOMA_RAQAMI}}. Import qiluvchi hamkor: {{MIJOZ_NOMI}}. Summa: {{SUMMA}} USD. Imzolangan sana: {{SANA}}.' }
    ];
    localStorage.setItem('contractTemplates', JSON.stringify(initial));
    return initial;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Ichki savdo');
  const [content, setContent] = useState('');

  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    const newTemplate = {
      id: Date.now(),
      name: name.trim(),
      date: new Date().toISOString().split('T')[0],
      type,
      content: content.trim()
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('contractTemplates', JSON.stringify(updated));
    
    // Reset Form
    setName('');
    setContent('');
    setIsCreating(false);
    triggerToast("Yangi shablon muvaffaqiyatli saqlandi!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Ushbu shablonni o'chirib tashlamoqchimisiz?")) {
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem('contractTemplates', JSON.stringify(updated));
      triggerToast("Shablon o'chirildi.");
    }
  };

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
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Shartnoma Shablonlari</h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Yuridik
            </span>
          </div>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] w-fit text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Shablon Yaratish</span>
            </button>
          )}
        </div>
        <p className="text-gray-650 dark:text-gray-350 mt-2 max-w-3xl text-sm leading-relaxed">
          Tizimda shartnomalarni avtomatik tayyorlash uchun foydalaniladigan dinamik andozalar va shablonlar bazasini boshqarish.
        </p>
      </div>

      {isCreating ? (
        /* Create Template Form */
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-6 shadow-xl text-white space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center space-x-2 text-indigo-400">
              <FileText className="w-5 h-5" />
              <span>YANGI SHABLON YARATISH</span>
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shablon Nomi
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-semibold"
                  placeholder="Masalan: Yoqilg'i yetkazib berish shartnomasi v1"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shablon Turi
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-semibold"
                >
                  <option value="Ichki savdo">Ichki savdo</option>
                  <option value="Import">Import</option>
                  <option value="Xizmat ko'rsatish">Xizmat ko'rsatish</option>
                  <option value="Mehnat shartnomasi">Mehnat shartnomasi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Shablon Matni (Dinamik matn andozasi)
              </label>
              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono leading-relaxed"
                placeholder="Placeholders kiriting: {{MIJOZ_NOMI}}, {{SHARTNOMA_RAQAMI}}, {{SUMMA}}, {{SANA}}..."
              />
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="font-bold">Mavjud placeholders:</span>
                <span className="bg-slate-900 px-2 py-1 rounded text-indigo-400 font-mono">{"{{MIJOZ_NOMI}}"}</span>
                <span className="bg-slate-900 px-2 py-1 rounded text-indigo-400 font-mono">{"{{SHARTNOMA_RAQAMI}}"}</span>
                <span className="bg-slate-900 px-2 py-1 rounded text-indigo-400 font-mono">{"{{SUMMA}}"}</span>
                <span className="bg-slate-900 px-2 py-1 rounded text-indigo-400 font-mono">{"{{SANA}}"}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-sm font-bold transition-all"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>SAQLASH</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Templates List Table */
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
            • SHABLONLAR RO'YXATI
          </h3>

          <div className="overflow-x-auto">
            {templates.length === 0 ? (
              <div className="text-center py-16 text-gray-600 dark:text-gray-450 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-sm">Hozircha birorta shablon mavjud emas.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold">
                    <th className="pb-4 w-12 text-center">#</th>
                    <th className="pb-4">Shablon Nomi</th>
                    <th className="pb-4">Yuklangan sana</th>
                    <th className="pb-4">Turi</th>
                    <th className="pb-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {templates.map((t, index) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                      <td className="py-4 text-sm font-bold text-center text-gray-400">{index + 1}</td>
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm">{t.date}</td>
                      <td className="py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                          {t.type}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(t.id)}
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
      )}
    </div>
  );
}
