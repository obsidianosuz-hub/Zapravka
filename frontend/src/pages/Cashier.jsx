import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, Play, CheckCircle2, AlertCircle, Wallet, Power, Banknote, PieChart, Plus, X, Trash2, 
  Clock, ShieldAlert, Award, FileSpreadsheet, MapPin, ClipboardList, Info, HelpCircle
} from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Cashier() {
  const { t, fuelPrices, navFilter, setNavFilter } = useSettings();
  const { user } = useAuth();
  
  // Shift (Smena) States
  const [activeShift, setActiveShift] = useState(null);
  const [isOpeningShift, setIsOpeningShift] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);
  
  // Open Shift Form Inputs
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [startCash, setStartCash] = useState('500000');
  const [startCounter, setStartCounter] = useState('12500');

  // Close Shift Form Inputs
  const [endCash, setEndCash] = useState('');
  const [endCounter, setEndCounter] = useState('');
  const [actualRevenue, setActualRevenue] = useState('');

  const [dispensers, setDispensers] = useState([]);
  const [selectedDispenser, setSelectedDispenser] = useState(null);
  const [corporateClients, setCorporateClients] = useState([]);
  const [selectedCorpClientId, setSelectedCorpClientId] = useState('');
  
  const [successState, setSuccessState] = useState({});
  const activeTimers = useRef({});
  
  // Order Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newType, setNewType] = useState('METHANE');
  const [volume, setVolume] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('BANK_CARD');
  const [mixedCash, setMixedCash] = useState('');
  const [mixedCard, setMixedCard] = useState('');
  
  const [clickModalOpen, setClickModalOpen] = useState(false);
  const [clickOrderDetails, setClickOrderDetails] = useState(null);
  const [pollingStatus, setPollingStatus] = useState('pending');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [modalError, setModalError] = useState('');

  const preventNegativeInput = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // Load branches, corporate clients and check active shift on mount
  useEffect(() => {
    axios.get('http://127.0.0.1:3000/api/branches')
      .then(res => {
        setBranches(res.data.branches || []);
        if (res.data.branches?.length > 0) {
          setSelectedBranchId(res.data.branches[0].id.toString());
        }
      })
      .catch(console.error);

    axios.get('http://127.0.0.1:3000/api/orders')
      .then(() => {
        // Just warm up B2B clients
        axios.get('http://127.0.0.1:3000/api/orders') // we can mock B2B clients list
          .then(() => {
            setCorporateClients([
              { id: 1, name: 'Yandex Taxi Park', balance: 10000000 },
              { id: 2, name: 'Toshkent Avtobus Park №5', balance: 25000000 }
            ]);
          });
      })
      .catch(console.error);
  }, []);

  // Fetch active shift when branch or user changes
  useEffect(() => {
    if (selectedBranchId && user?.username) {
      axios.get(`http://127.0.0.1:3000/api/shifts/active?branchId=${selectedBranchId}&cashierName=${user.username}`)
        .then(res => {
          setActiveShift(res.data.activeShift || null);
        })
        .catch(console.error);
    }
  }, [selectedBranchId, user]);

  // Polling loop for Click status verification
  useEffect(() => {
    let intervalId;
    if (clickModalOpen && clickOrderDetails?.orderId && pollingStatus === 'pending') {
      const checkStatus = async () => {
        try {
          const statusRes = await axios.get(`http://127.0.0.1:3000/api/payment/status/${clickOrderDetails.orderId}`);
          if (statusRes.data.status === 'COMPLETED') {
            setPollingStatus('success');
            await axios.put(`http://127.0.0.1:3000/api/dispensers/${clickOrderDetails.dispenserNumber}/status`, { status: 'BUSY' });
            
            const liveRes = await axios.get('http://127.0.0.1:3000/api/dashboard/live');
            setDispensers(liveRes.data.dispensers || []);
            
            setTimeout(() => {
              setClickModalOpen(false);
              setClickOrderDetails(null);
              setVolume('');
              setAmount('');
              setSelectedDispenser(null);
              setMessage({ type: 'success', text: `Click to'lovi muvaffaqiyatli qabul qilindi. Kalonka #${clickOrderDetails.dispenserNumber} yoqildi!` });
            }, 3000);
          }
        } catch (err) {
          console.error("Error polling Click payment status:", err);
        }
      };
      intervalId = setInterval(checkStatus, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [clickModalOpen, clickOrderDetails, pollingStatus]);

  // Fetch Live Data
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:3000/api/dashboard/live');
        setDispensers(res.data.dispensers || []);
      } catch (err) {
        console.error("Failed to fetch live data", err);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispensers.forEach(d => {
      if (d.status === 'BUSY' && !activeTimers.current[d.dispenserNumber]) {
        activeTimers.current[d.dispenserNumber] = true;
        setTimeout(() => {
          setSuccessState(prev => ({ ...prev, [d.dispenserNumber]: true }));
          setTimeout(() => {
            axios.put(`http://127.0.0.1:3000/api/dispensers/${d.dispenserNumber}/status`, { status: 'IDLE' }).catch(console.error);
            setDispensers(prev => prev.map(disp => disp.dispenserNumber === d.dispenserNumber ? { ...disp, status: 'IDLE' } : disp));
            setSuccessState(prev => {
              const copy = { ...prev };
              delete copy[d.dispenserNumber];
              return copy;
            });
            activeTimers.current[d.dispenserNumber] = false;
          }, 3000);
        }, 10000);
      }
    });
  }, [dispensers]);

  const getPrice = () => {
    return selectedDispenser ? (fuelPrices[selectedDispenser.fuelType?.category] || 3800) : 3800;
  };

  const unit = selectedDispenser?.fuelType?.category === 'METHANE' ? 'm³' : selectedDispenser?.fuelType?.category === 'ELECTRIC' ? 'kW' : 'L';

  const handleVolumeChange = (e) => {
    const val = e.target.value;
    setVolume(val);
    if (val && selectedDispenser) {
      const calcAmount = (parseFloat(val) * getPrice()).toFixed(0);
      setAmount(calcAmount);
      setMixedCash(calcAmount);
      setMixedCard('0');
    } else {
      setAmount('');
      setMixedCash('');
      setMixedCard('');
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    if (val && selectedDispenser) {
      const calcVolume = (parseFloat(val) / getPrice()).toFixed(2);
      setVolume(calcVolume);
      setMixedCash(val);
      setMixedCard('0');
    } else {
      setVolume('');
      setMixedCash('');
      setMixedCard('');
    }
  };

  const handleMixedCashChange = (e) => {
    const val = e.target.value;
    setMixedCash(val);
    const tot = parseFloat(amount) || 0;
    const cashVal = parseFloat(val) || 0;
    setMixedCard(Math.max(0, tot - cashVal).toString());
  };

  const handleMixedCardChange = (e) => {
    const val = e.target.value;
    setMixedCard(val);
    const tot = parseFloat(amount) || 0;
    const cardVal = parseFloat(val) || 0;
    setMixedCash(Math.max(0, tot - cardVal).toString());
  };

  // Open Shift API Call
  const handleOpenShiftSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:3000/api/shifts/open', {
        branchId: parseInt(selectedBranchId),
        cashierName: user.username,
        startCash: parseFloat(startCash),
        startCounter: parseFloat(startCounter)
      });
      setActiveShift(res.data.shift);
      setIsOpeningShift(false);
      setMessage({ type: 'success', text: "Smena muvaffaqiyatli ochildi!" });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Close Shift API Call
  const handleCloseShiftSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:3000/api/shifts/close', {
        shiftId: activeShift.id,
        endCash: parseFloat(endCash),
        endCounter: parseFloat(endCounter),
        actualRevenue: parseFloat(actualRevenue)
      });
      setActiveShift(null);
      setIsClosingShift(false);
      setMessage({ type: 'success', text: `Smena yopildi! Kamomad/Ortiqcha tekshiruvi yakunlandi.` });
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // Checkout order submission
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedDispenser || !amount) return;

    if (paymentType === 'CLICK') {
      setPollingStatus('pending');
      setClickOrderDetails({
        orderId: Date.now(),
        dispenserNumber: selectedDispenser.dispenserNumber,
        amount: parseFloat(amount),
        volume: parseFloat(volume)
      });
      setClickModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await axios.post('http://127.0.0.1:3000/api/orders/create', {
        dispenserId: selectedDispenser.id,
        fuelTypeId: selectedDispenser.fuelTypeId,
        volume: parseFloat(volume),
        totalAmount: parseFloat(amount),
        paymentType: paymentType,
        corporateClientId: paymentType === 'CORPORATE_ACCOUNT' ? parseInt(selectedCorpClientId) : undefined
      });

      await axios.put(`http://127.0.0.1:3000/api/dispensers/${selectedDispenser.dispenserNumber}/status`, { status: 'BUSY' });
      
      const liveRes = await axios.get('http://127.0.0.1:3000/api/dashboard/live');
      setDispensers(liveRes.data.dispensers || []);

      setMessage({ type: 'success', text: `Buyurtma muvaffaqiyatli qabul qilindi. Kalonka #${selectedDispenser.dispenserNumber} yoqildi!` });
      setVolume('');
      setAmount('');
      setSelectedDispenser(null);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.error || "Buyurtma yuborishda xatolik yuz berdi" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDispenser = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newNumber) return;

    try {
      const res = await axios.post('http://127.0.0.1:3000/api/dispensers', {
        dispenserNumber: parseInt(newNumber, 10),
        fuelCategory: newType
      });
      setDispensers(prev => [...prev, res.data.dispenser].sort((a,b) => a.dispenserNumber - b.dispenserNumber));
      setIsModalOpen(false);
      setNewNumber('');
    } catch (err) {
      setModalError(err.response?.data?.error || "Kalonka qo'shishda xatolik yuz berdi");
    }
  };

  const handleDeleteDispenser = async (e, dispenserNumber) => {
    e.stopPropagation();
    if (window.confirm(`${dispenserNumber}-kalonkani o'chirishni xohlaysizmi?`)) {
      try {
        await axios.delete(`http://127.0.0.1:3000/api/dispensers/${dispenserNumber}`);
        setDispensers(dispensers.filter(d => d.dispenserNumber !== dispenserNumber));
        if (selectedDispenser?.dispenserNumber === dispenserNumber) {
          setSelectedDispenser(null);
        }
      } catch (err) {
        alert("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
      }
    }
  };

  // Switch display filter
  const filteredDispensers = dispensers.filter(d => {
    const cat = d.fuelType?.category?.toLowerCase();
    if (navFilter === 'gas') return ['methane', 'propane'].includes(cat);
    if (navFilter === 'petrol') return ['ai_80', 'ai_92', 'ai_95', 'ai_98', 'ai_100', 'diesel'].includes(cat);
    if (navFilter === 'electric') return cat?.includes('electric');
    return true;
  });

  const sortedDispensers = [...filteredDispensers].sort((a, b) => {
    const numA = typeof a.dispenserNumber === 'number' ? a.dispenserNumber : parseInt(String(a.dispenserNumber || a.id).replace(/\D/g, '')) || 0;
    const numB = typeof b.dispenserNumber === 'number' ? b.dispenserNumber : parseInt(String(b.dispenserNumber || b.id).replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 relative">
      
      {/* Main Cashier Panel */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Shift Banner & Info */}
        <div className="bg-slate-800 dark:bg-gray-800 rounded-3xl p-6 border border-slate-700/50 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {activeShift ? 'Faol Smena: Ochiq' : 'Smena: Yopiq (Ixtiyoriy)'}
              </h4>
              <p className="text-xs text-slate-400">
                {activeShift ? `Boshlandi: ${new Date(activeShift.startTime).toLocaleTimeString()}` : 'Sotuv jarayoni faol'}
              </p>
            </div>
          </div>
          {activeShift ? (
            <button
              onClick={() => setIsClosingShift(true)}
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-all"
            >
              Smenani Yopish
            </button>
          ) : (
            <button
              onClick={() => setIsOpeningShift(true)}
              className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-all"
            >
              Smenani Boshlash
            </button>
          )}
        </div>

            {/* Dispensers Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                  <Wallet className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kalonkalar</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Sotuvni amalga oshirish</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNavFilter('gas')}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all",
                    navFilter === 'gas' ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <span>🔵</span><span>Gaz</span>
                </button>
                <button
                  onClick={() => setNavFilter('petrol')}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all",
                    navFilter === 'petrol' ? "bg-amber-500 text-white border-amber-500" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <span>⛽</span><span>Benzin</span>
                </button>
                <button
                  onClick={() => setNavFilter('electric')}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all",
                    navFilter === 'electric' ? "bg-green-600 text-white border-green-600" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                  )}
                >
                  <span>⚡</span><span>Elektr</span>
                </button>
                <button
                  onClick={() => {
                    setNewType(navFilter === 'petrol' ? 'AI_80' : navFilter === 'electric' ? 'ELECTRIC' : 'METHANE');
                    setIsModalOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Kalonka Qo'shish</span>
                </button>
              </div>
            </div>

            {/* Dispensers Grid List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {sortedDispensers.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispenser(d)}
                  className={cn(
                    "relative overflow-hidden cursor-pointer p-6 rounded-3xl border-2 transition-all duration-200 group flex flex-col justify-between min-h-[140px]",
                    selectedDispenser?.id === d.id
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-900/10 shadow-lg shadow-blue-500/5"
                      : "border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white">#{d.dispenserNumber}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-1">
                        {d.fuelType?.name || d.fuelType?.category}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                      d.status === 'IDLE' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      d.status === 'BUSY' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse" :
                      "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                    )}>
                      {d.status === 'IDLE' ? 'BO\'SH' : d.status === 'BUSY' ? 'BAND' : 'OFFLINE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={(e) => handleDeleteDispenser(e, d.dispenserNumber)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Checkout Right Side form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">Buyurtma berish</h3>
              
              {!selectedDispenser ? (
                <div className="py-12 text-center text-slate-400">
                  <Play className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">Buyurtma berish uchun kalonkani tanlang</p>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl space-y-1">
                    <span className="text-xs text-slate-400 block">Tanlangan kalonka</span>
                    <strong className="text-lg text-gray-900 dark:text-white font-black">Kalonka #{selectedDispenser.dispenserNumber} ({selectedDispenser.fuelType?.name})</strong>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-350">Hajm ({unit})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      onKeyDown={preventNegativeInput}
                      required
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono font-bold"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-350">Summa (UZS)</label>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={preventNegativeInput}
                      required
                      value={amount}
                      onChange={handleAmountChange}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono font-bold"
                      placeholder="0"
                    />
                  </div>

                  {/* Payment Type Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-350">To'lov usuli</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentType('CASH')}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-bold transition-all",
                          paymentType === 'CASH' ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        Naqd
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType('BANK_CARD')}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-bold transition-all",
                          paymentType === 'BANK_CARD' ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        Karta
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType('CLICK')}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-bold transition-all",
                          paymentType === 'CLICK' ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        Click
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType('MIXED')}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-bold transition-all",
                          paymentType === 'MIXED' ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        Aralash
                      </button>
                    </div>
                  </div>

                  {paymentType === 'MIXED' && (
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-gray-900 p-3 rounded-xl">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Naqd (UZS)</label>
                        <input
                          type="number"
                          min="0"
                          onKeyDown={preventNegativeInput}
                          value={mixedCash}
                          onChange={handleMixedCashChange}
                          className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono font-bold"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Karta (UZS)</label>
                        <input
                          type="number"
                          min="0"
                          onKeyDown={preventNegativeInput}
                          value={mixedCard}
                          onChange={handleMixedCardChange}
                          className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono font-bold"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className={cn(
                      "p-3 rounded-xl text-xs font-bold",
                      message.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !amount}
                    className="w-full py-4 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Yuborilmoqda..." : "Kalonkani Yoqish"}
                  </button>
                </form>
              )}

            </div>
          </div>

      {/* OPEN SHIFT MODAL */}
      {isOpeningShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-950 dark:text-white">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-3xl border border-gray-200 dark:border-gray-750 shadow-2xl relative">
            <h3 className="text-xl font-black mb-2 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Smenani Boshlash</span>
            </h3>
            <p className="text-xs text-gray-400 mb-6">Ish smenasini ochish uchun ma'lumotlarni kiriting:</p>

            <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Boshlang'ich Kassa Pul (UZS)</label>
                <input
                  type="number"
                  min="0"
                  onKeyDown={preventNegativeInput}
                  required
                  value={startCash}
                  onChange={(e) => setStartCash(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Boshlang'ich Schetchik</label>
                <input
                  type="number"
                  min="0"
                  onKeyDown={preventNegativeInput}
                  required
                  value={startCounter}
                  onChange={(e) => setStartCounter(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-lg font-bold"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsOpeningShift(false)}
                  className="px-5 py-3 bg-gray-105 hover:bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm"
                >
                  Smenani Ochish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE SHIFT MODAL */}
      {isClosingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-950 dark:text-white">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-3xl border border-gray-200 dark:border-gray-750 shadow-2xl relative">
            <h3 className="text-xl font-black mb-2 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Smenani Yakunlash (Yopish)</span>
            </h3>
            <p className="text-xs text-gray-400 mb-6">Yakuniy hisob-kitob ko'rsatkichlarini kiriting:</p>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Yakuniy Schetchik</label>
                <input
                  type="number"
                  min="0"
                  onKeyDown={preventNegativeInput}
                  required
                  value={endCounter}
                  onChange={(e) => setEndCounter(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2">Kassadagi haqiqiy naqd pul (UZS)</label>
                <input
                  type="number"
                  min="0"
                  onKeyDown={preventNegativeInput}
                  required
                  value={actualRevenue}
                  onChange={(e) => setActualRevenue(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-lg font-bold"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsClosingShift(false)}
                  className="px-5 py-3 bg-gray-105 hover:bg-gray-200 dark:bg-gray-700 rounded-xl font-bold text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-red-650 hover:bg-red-600 text-white rounded-xl font-bold text-sm"
                >
                  Smenani Yopish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click Payment Polling Modal */}
      {clickModalOpen && clickOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm p-6 rounded-2xl text-center text-gray-950 dark:text-white">
            <h4 className="text-lg font-bold mb-2">Click To'lovi Kutilmoqda</h4>
            <p className="text-xs text-slate-400 mb-4">Mijoz mobil ilovasida to'lovni amalga oshirishini kuting.</p>
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm font-bold font-mono text-indigo-500">{clickOrderDetails.amount.toLocaleString()} UZS</p>
          </div>
        </div>
      )}

      {/* Add Dispenser modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-gray-950 dark:text-white">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-black mb-4">
              {navFilter === 'gas' && "Yangi Gaz Kalonkasi Qo'shish"}
              {navFilter === 'petrol' && "Yangi Benzin Kalonkasi Qo'shish"}
              {navFilter === 'electric' && "Yangi Elektr Stansiyasi Qo'shish"}
            </h3>

            <form onSubmit={handleAddDispenser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Kalonka Raqami</label>
                <input
                  type="number"
                  min="1"
                  onKeyDown={preventNegativeInput}
                  required
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {navFilter === 'gas' && "Gaz Turi"}
                  {navFilter === 'petrol' && "Yoqilg'i Markasi"}
                  {navFilter === 'electric' && "Ulagich / Quvvat Turi"}
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium"
                >
                  {navFilter === 'gas' && (
                    <>
                      <option value="METHANE">Metan</option>
                      <option value="PROPANE">Propan</option>
                    </>
                  )}
                  {navFilter === 'petrol' && (
                    <>
                      <option value="AI_80">AI-80</option>
                      <option value="AI_92">AI-92</option>
                      <option value="AI_95">AI-95</option>
                      <option value="AI_98">AI-98</option>
                      <option value="AI_100">AI-100</option>
                    </>
                  )}
                  {navFilter === 'electric' && (
                    <>
                      <option value="ELECTRIC">GB/T (DC Fast)</option>
                      <option value="ELECTRIC_CCS2">CCS2 (Fast)</option>
                      <option value="ELECTRIC_TYPE2">Type 2 (AC)</option>
                      <option value="ELECTRIC_120KW">120 kW Fast Charger</option>
                    </>
                  )}
                </select>
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl font-bold mt-2 transition-colors">Saqlash</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}