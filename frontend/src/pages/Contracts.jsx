import React, { useState } from 'react';
import { 
  FileCheck, Plus, Trash2, Download, Eye, Check, X, FileText, Upload, Save, HelpCircle 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Contracts() {
  const [contracts, setContracts] = useState(() => {
    const saved = localStorage.getItem('legalContracts');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: 1, number: 'SH-2026/04', name: "A-92 Yetkazib Berish Shartnomasi", date: '2026-07-15', status: 'Faol', fileType: 'pdf', client: 'Lukoil Uzbekistan', amount: '84,000,000 UZS' },
      { id: 2, number: 'SH-2026/05', name: "Import Xom-ashyo Kelishuvi", date: '2026-07-10', status: 'Kutilmoqda', fileType: 'doc', client: 'Gazprom Neft', amount: '120,000,000 UZS' }
    ];
    localStorage.setItem('legalContracts', JSON.stringify(initial));
    return initial;
  });

  const [templates] = useState(() => {
    const saved = localStorage.getItem('contractTemplates');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Yoqilg'i yetkazib berish shartnomasi v1", date: '2026-07-15', type: 'Ichki savdo', content: 'Ushbu shartnoma {{MIJOZ_NOMI}} va EcoGas MCHJ o\'rtasida tuzildi. Shartnoma raqami: {{SHARTNOMA_RAQAMI}}, umumiy summa: {{SUMMA}} UZS, imzolangan sana: {{SANA}}.' }
    ];
  });

  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState('upload'); // 'upload' | 'template'

  // Wizard state for template generation
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [placeholders, setPlaceholders] = useState({
    MIJOZ_NOMI: '',
    SHARTNOMA_RAQAMI: '',
    SUMMA: '',
    SANA: new Date().toISOString().split('T')[0]
  });

  // Upload state
  const [contractNumber, setContractNumber] = useState('');
  const [contractName, setContractName] = useState('');
  const [clientName, setClientName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCreationMode('upload');
    setSelectedTemplateId(templates[0]?.id || '');
  };

  const handlePlaceholderChange = (key, value) => {
    setPlaceholders(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateContract = (e) => {
    e.preventDefault();

    let newContract = {};

    if (creationMode === 'upload') {
      if (!contractNumber.trim() || !contractName.trim()) return;
      newContract = {
        id: Date.now(),
        number: contractNumber.trim(),
        name: contractName.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'Faol',
        fileType: 'pdf',
        client: clientName.trim() || 'Noma\'lum',
        amount: totalAmount ? `${parseFloat(totalAmount).toLocaleString()} UZS` : '0 UZS'
      };
    } else {
      const tpl = templates.find(t => t.id === parseInt(selectedTemplateId));
      if (!tpl) return;
      
      newContract = {
        id: Date.now(),
        number: placeholders.SHARTNOMA_RAQAMI || `SH-${Date.now().toString().slice(-4)}`,
        name: tpl.name,
        date: placeholders.SANA || new Date().toISOString().split('T')[0],
        status: 'Faol',
        fileType: 'doc',
        client: placeholders.MIJOZ_NOMI || 'Noma\'lum',
        amount: placeholders.SUMMA ? `${parseFloat(placeholders.SUMMA).toLocaleString()} UZS` : '0 UZS'
      };
    }

    const updated = [newContract, ...contracts];
    setContracts(updated);
    localStorage.setItem('legalContracts', JSON.stringify(updated));

    // Reset Form states
    setContractNumber('');
    setContractName('');
    setClientName('');
    setTotalAmount('');
    setIsModalOpen(false);
    triggerToast("Yangi shartnoma muvaffaqiyatli qo'shildi!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Rostdan ham ushbu shartnomani o'chirib tashlamoqchimisiz?")) {
      const updated = contracts.filter(c => c.id !== id);
      setContracts(updated);
      localStorage.setItem('legalContracts', JSON.stringify(updated));
      triggerToast("Shartnoma o'chirildi.");
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
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Shartnomalar</h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Yuridik
            </span>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] w-fit text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Shartnoma Tuzish</span>
          </button>
        </div>
        <p className="text-gray-650 dark:text-gray-350 mt-2 max-w-3xl text-sm leading-relaxed">
          Mijozlar, import hamkorlari va xizmat ko'rsatish bo'yicha imzolangan shartnoma nusxalarini yoki shablondan tayyorlangan shartnomalarni boshqarish.
        </p>
      </div>

      {/* Contracts Table List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
          • FAOL SHARTNOMALAR RO'YXATI
        </h3>

        <div className="overflow-x-auto">
          {contracts.length === 0 ? (
            <div className="text-center py-16 text-gray-600 dark:text-gray-450 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-sm">Hozircha birorta shartnoma imzolanmagan.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold">
                  <th className="pb-4 w-12 text-center">#</th>
                  <th className="pb-4">SHARTNOMA № / NOMI</th>
                  <th className="pb-4">Mijoz / Hamkor</th>
                  <th className="pb-4">Sana</th>
                  <th className="pb-4">Summa</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-center">Fayl</th>
                  <th className="pb-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {contracts.map((c, index) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 text-sm font-bold text-center text-gray-400">{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white block">{c.number}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{c.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-semibold">{c.client}</td>
                    <td className="py-4 text-sm">{c.date}</td>
                    <td className="py-4 text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">{c.amount}</td>
                    <td className="py-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-full border",
                        c.status === 'Faol'
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          : c.status === 'Kutilmoqda'
                          ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                          : "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                      )}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <button 
                        onClick={() => triggerToast(`Yuklab olish boshlandi: contract_${c.number}.${c.fileType}`)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-600 dark:text-gray-200 rounded-lg transition-all"
                        title="Yuklab olish"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
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

      {/* DUAL MODE CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-gray-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-indigo-500" />
                <span>Yangi Shartnoma Qo'shish</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-55/10 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/25">
              <button
                type="button"
                onClick={() => setCreationMode('upload')}
                className={cn(
                  "p-4 font-bold text-sm border-b-2 transition-all flex items-center justify-center space-x-2",
                  creationMode === 'upload'
                    ? "border-indigo-500 text-indigo-650 dark:text-indigo-400 bg-white dark:bg-gray-850"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                <Upload className="w-4 h-4" />
                <span>Haqiqiy shartnoma yuklash</span>
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('template')}
                className={cn(
                  "p-4 font-bold text-sm border-b-2 transition-all flex items-center justify-center space-x-2",
                  creationMode === 'template'
                    ? "border-indigo-500 text-indigo-650 dark:text-indigo-400 bg-white dark:bg-gray-850"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                )}
              >
                <FileText className="w-4 h-4" />
                <span>Shablondan yaratish</span>
              </button>
            </div>

            {/* Modal Body / Forms */}
            <form onSubmit={handleCreateContract} className="p-6 overflow-y-auto space-y-4">
              {creationMode === 'upload' ? (
                /* Mode A: Upload Physical Contract Form */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shartnoma Raqami</label>
                      <input
                        type="text"
                        required
                        value={contractNumber}
                        onChange={(e) => setContractNumber(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                        placeholder="Masalan: SH-2026/06"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Shartnoma Nomi</label>
                      <input
                        type="text"
                        required
                        value={contractName}
                        onChange={(e) => setContractName(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                        placeholder="Masalan: Methane Gaz Yetkazib Berish"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Mijoz / Hamkor</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                        placeholder="Masalan: Petromaruz"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Umumiy Summa (UZS)</label>
                      <input
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                        placeholder="Masalan: 15000000"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">PDF, JPG yoki PNG formatdagi skanerlangan faylni yuklang</p>
                    <p className="text-[10px] text-gray-400 mt-1">Hajmi 15MB gacha</p>
                  </div>
                </>
              ) : (
                /* Mode B: Generate from Template Form */
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Qolip (Shablon) tanlash</label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{"{{SHARTNOMA_RAQAMI}}"}</label>
                      <input
                        type="text"
                        value={placeholders.SHARTNOMA_RAQAMI}
                        onChange={(e) => handlePlaceholderChange('SHARTNOMA_RAQAMI', e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                        placeholder="Masalan: SH-2026/99"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{"{{MIJOZ_NOMI}}"}</label>
                      <input
                        type="text"
                        value={placeholders.MIJOZ_NOMI}
                        onChange={(e) => handlePlaceholderChange('MIJOZ_NOMI', e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                        placeholder="Masalan: Toshkent Yoqilg'i MCHJ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{"{{SUMMA}}"}</label>
                      <input
                        type="number"
                        value={placeholders.SUMMA}
                        onChange={(e) => handlePlaceholderChange('SUMMA', e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold"
                        placeholder="Masalan: 45000000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{"{{SANA}}"}</label>
                      <input
                        type="date"
                        value={placeholders.SANA}
                        onChange={(e) => handlePlaceholderChange('SANA', e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-950 dark:text-white focus:outline-none text-sm font-semibold text-center"
                      />
                    </div>
                  </div>

                  {/* Document Live Preview */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-750 p-4 rounded-2xl text-xs font-mono text-gray-650 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                    <span className="block font-bold text-indigo-500 dark:text-indigo-400 mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">Hujjatning jonli ko'rinishi (Live Preview):</span>
                    {selectedTemplateId && (() => {
                      const tpl = templates.find(t => t.id === parseInt(selectedTemplateId));
                      if (!tpl) return '';
                      let rendered = tpl.content;
                      rendered = rendered.replace('{{MIJOZ_NOMI}}', placeholders.MIJOZ_NOMI || '[Mijoz Nomi]');
                      rendered = rendered.replace('{{SHARTNOMA_RAQAMI}}', placeholders.SHARTNOMA_RAQAMI || '[Shartnoma Raqami]');
                      rendered = rendered.replace('{{SUMMA}}', placeholders.SUMMA ? parseFloat(placeholders.SUMMA).toLocaleString() : '[Summa]');
                      rendered = rendered.replace('{{SANA}}', placeholders.SANA || '[Sana]');
                      return rendered;
                    })()}
                  </div>
                </>
              )}

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
