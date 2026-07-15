import React, { useState } from 'react';
import { 
  Ship, Globe, Truck, Plus, X, Check, Clock, AlertCircle, TrendingUp, DollarSign, RefreshCw 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function CustomsImport() {
  const [declarations, setDeclarations] = useState(() => {
    const saved = localStorage.getItem('customsDeclarations');
    if (saved) return JSON.parse(saved);
    const initial = [
      { id: 'UZ-10008-2026-0042', productType: 'Benzin AI-92', amount: '20,000 L', dutyFee: 45000000, arrivalTime: '2026-07-14 09:30', status: 'Yo\'lda' },
      { id: 'UZ-10008-2026-0041', productType: 'Benzin AI-95', amount: '15,000 L', dutyFee: 38000000, arrivalTime: '2026-07-14 08:15', status: 'Chegarada' },
      { id: 'UZ-10008-2026-0040', productType: 'Metan', amount: '5,000 m³', dutyFee: 12000000, arrivalTime: '2026-07-13 14:20', status: 'Qabul qilindi' }
    ];
    localStorage.setItem('customsDeclarations', JSON.stringify(initial));
    return initial;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gtdId, setGtdId] = useState('');
  const [productType, setProductType] = useState('Benzin AI-92');
  const [volumeAmount, setVolumeAmount] = useState('');
  const [dutyFeeInput, setDutyFeeInput] = useState('');
  const [statusInput, setStatusInput] = useState('Yo\'lda');

  // Compute metrics
  const shipmentsInTransit = declarations
    .filter(d => d.status === 'Yo\'lda' || d.status === 'Chegarada')
    .length;

  const totalImportedThisMonth = declarations
    .filter(d => d.status === 'Qabul qilindi')
    .reduce((sum, d) => sum + parseInt(d.amount.replace(/[^0-9]/g, ''), 10), 0);

  const totalDutiesPaid = declarations
    .filter(d => d.status === 'Qabul qilindi')
    .reduce((sum, d) => sum + d.dutyFee, 0);

  const handleAddDeclaration = (e) => {
    e.preventDefault();
    if (!gtdId || !volumeAmount || !dutyFeeInput) return;

    const unit = productType === 'Metan' ? 'm³' : 'L';
    const newDec = {
      id: gtdId,
      productType,
      amount: `${parseInt(volumeAmount).toLocaleString()} ${unit}`,
      dutyFee: parseInt(dutyFeeInput, 10),
      arrivalTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: statusInput
    };

    const updated = [newDec, ...declarations];
    setDeclarations(updated);
    localStorage.setItem('customsDeclarations', JSON.stringify(updated));

    if (statusInput === 'Qabul qilindi') {
      triggerIntegration(newDec);
    }

    setGtdId('');
    setVolumeAmount('');
    setDutyFeeInput('');
    setIsModalOpen(false);
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = declarations.map(d => {
      if (d.id === id) {
        const dec = { ...d, status: newStatus };
        if (newStatus === 'Qabul qilindi' && d.status !== 'Qabul qilindi') {
          triggerIntegration(dec);
        }
        return dec;
      }
      return d;
    });
    setDeclarations(updated);
    localStorage.setItem('customsDeclarations', JSON.stringify(updated));
  };

  // Integration handler to trigger inventory, finance, and activity logs updates
  const triggerIntegration = (declaration) => {
    const volumeValue = parseInt(declaration.amount.replace(/[^0-9]/g, ''), 10);
    const fuelTypeKey = declaration.productType.replace('Benzin ', ''); // e.g. AI-92

    // 1. Update Reservoir Inventory levels
    const savedReservoirs = localStorage.getItem('reservoirLevels');
    const reservoirs = savedReservoirs ? JSON.parse(savedReservoirs) : {
      'AI-80': { current: 5200, max: 10000 },
      'AI-92': { current: 15200, max: 20000 },
      'AI-95': { current: 8400, max: 10000 },
      'AI-98': { current: 4520, max: 5000 },
      'AI-100': { current: 2100, max: 5000 }
    };
    if (reservoirs[fuelTypeKey]) {
      reservoirs[fuelTypeKey].current = Math.min(
        reservoirs[fuelTypeKey].max,
        reservoirs[fuelTypeKey].current + volumeValue
      );
      localStorage.setItem('reservoirLevels', JSON.stringify(reservoirs));
    }

    // 2. Log Finance transactions
    const savedLogs = localStorage.getItem('localLogs');
    const logs = savedLogs ? JSON.parse(savedLogs) : [];
    
    const dutyLog = {
      id: Date.now(),
      type: 'Chiqim',
      mode: 'financial',
      category: 'Bojxona to\'lovlari',
      amount: `${declaration.dutyFee.toLocaleString()} UZS`,
      notes: `Deklaratsiya №${declaration.id} uchun bojxona boji to'lovi`
    };

    const purchaseCost = volumeValue * 7000; // Estimated purchase cost of 7,000 UZS per liter
    const fuelPurchaseLog = {
      id: Date.now() + 1,
      type: 'Chiqim',
      mode: 'financial',
      category: 'Yoqilg\'i xaridi',
      amount: `${purchaseCost.toLocaleString()} UZS`,
      notes: `Deklaratsiya №${declaration.id} orqali import qilingan ${declaration.amount} ${declaration.productType} sotib olish qiymati`
    };

    const updatedLogs = [dutyLog, fuelPurchaseLog, ...logs];
    localStorage.setItem('localLogs', JSON.stringify(updatedLogs));

    // 3. Log Activity Trail
    const savedActivities = localStorage.getItem('activityLogs');
    const activities = savedActivities ? JSON.parse(savedActivities) : [];
    const newActivity = {
      id: Date.now() + 2,
      user: 'Tizim (Bojxona API)',
      action: `Bojxona deklaratsiyasi №${declaration.id} orqali ${declaration.amount} ${declaration.productType} omborga muvaffaqiyatli qabul qilindi.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    const updatedActivities = [newActivity, ...activities];
    localStorage.setItem('activityLogs', JSON.stringify(updatedActivities));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Bojxona va Import</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">Yoqilg'i importi yuklari, GTD deklaratsiyalari va bojxona to'lovlari hisoboti</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Deklaratsiya qo'shish</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Yo'ldagi Yuklar</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{shipmentsInTransit} ta</h3>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Joriy Oydagi Import</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{totalImportedThisMonth.toLocaleString()} L/m³</h3>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">To'langan Bojlar</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalDutiesPaid.toLocaleString()} UZS</h3>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bojxona Yuk Deklaratsiyalari (GTD)</h3>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">API Ulanishi: FAOL</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 text-sm font-semibold">
                <th className="pb-4">Deklaratsiya № (GTD)</th>
                <th className="pb-4">Mahsulot Turi</th>
                <th className="pb-4">Miqdori</th>
                <th className="pb-4">Bojxona To'lovi</th>
                <th className="pb-4">Kelgan Vaqt</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {declarations.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <td className="py-4 font-mono text-sm font-bold text-gray-900 dark:text-white">{d.id}</td>
                  <td className="py-4 text-sm font-semibold">{d.productType}</td>
                  <td className="py-4 text-sm font-bold">{d.amount}</td>
                  <td className="py-4 text-sm font-semibold">{d.dutyFee.toLocaleString()} UZS</td>
                  <td className="py-4 text-sm text-gray-550 dark:text-gray-400">{d.arrivalTime}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold",
                      d.status === 'Chegarada' ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      d.status === 'Yo\'lda' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    )}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {d.status !== 'Qabul qilindi' ? (
                      <button
                        onClick={() => handleStatusChange(d.id, 'Qabul qilindi')}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm shadow-emerald-600/10 active:scale-[0.97]"
                      >
                        Qabul qilish
                      </button>
                    ) : (
                      <span className="text-xs text-gray-455 dark:text-gray-500 font-semibold flex items-center justify-end space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Kiritildi</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual GTD Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Deklaratsiya (GTD) qo'shish
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-550 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeclaration} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Deklaratsiya № (GTD ID)</label>
                <input
                  type="text"
                  required
                  value={gtdId}
                  onChange={(e) => setGtdId(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
                  placeholder="Masalan: UZ-10008-2026-0043"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Mahsulot Turi</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
                >
                  <option value="Benzin AI-80">Benzin AI-80</option>
                  <option value="Benzin AI-92">Benzin AI-92</option>
                  <option value="Benzin AI-95">Benzin AI-95</option>
                  <option value="Benzin AI-98">Benzin AI-98</option>
                  <option value="Benzin AI-100">Benzin AI-100</option>
                  <option value="Metan">Metan</option>
                  <option value="Propan">Propan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Miqdori (Hajmi)</label>
                <input
                  type="number"
                  required
                  value={volumeAmount}
                  onChange={(e) => setVolumeAmount(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
                  placeholder="Litr yoki m³ da"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Bojxona to'lovi (UZS)</label>
                <input
                  type="number"
                  required
                  value={dutyFeeInput}
                  onChange={(e) => setDutyFeeInput(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
                  placeholder="Boj to'lovi miqdori"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold"
                >
                  <option value="Yo'lda">Yo'lda</option>
                  <option value="Chegarada">Chegarada</option>
                  <option value="Qabul qilindi">Qabul qilindi</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-semibold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
