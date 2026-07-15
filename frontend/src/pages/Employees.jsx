import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, ShieldAlert, BadgeCheck, Mail, Phone, Calendar, X, Eye, EyeOff, UserCheck, Edit, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Employees() {
  const { t } = useSettings();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees on mount
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:3000/api/auth/users');
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!name || !username || (!editingId && !password) || !pinCode) {
      setFormError(t('error_empty_fields'));
      return;
    }

    if (pinCode.length !== 4) {
      setFormError("PIN-kod roppa-rosa 4 xonali bo'lishi lozim");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update user
        const res = await axios.put(`http://127.0.0.1:3000/api/auth/users/${editingId}`, {
          name, username, password, pinCode, role, email, phone, telegramHandle
        });
        setEmployees(prev => prev.map(emp => emp.id === editingId ? res.data.user : emp));
      } else {
        // Create user
        const res = await axios.post('http://127.0.0.1:3000/api/auth/users', {
          name, username, password, pinCode, role, email, phone, telegramHandle
        });
        setEmployees(prev => [...prev, res.data.user]);
      }
      
      // Reset form
      setName('');
      setUsername('');
      setPassword('');
      setPinCode('');
      setRole('CASHIER');
      setTelegramHandle('');
      setEmail('');
      setPhone('');
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error || "Xodim qo'shishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (emp) => {
    setEditingId(emp.id);
    setName(emp.name || '');
    setUsername(emp.username || '');
    setPassword(''); // leave empty to not change
    setPinCode(emp.pinCode || '');
    setRole(emp.role || 'CASHIER');
    setTelegramHandle(emp.telegramHandle || '');
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Rostdan ham bu xodimni o'chirmoqchimisiz?")) {
      try {
        await axios.delete(`http://127.0.0.1:3000/api/auth/users/${id}`);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
      } catch (err) {
        console.error("Xodimni o'chirishda xatolik", err);
        alert(err.response?.data?.error || "Xodimni o'chirishda xatolik yuz berdi");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('employees')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5">{t('emp_subtitle')}</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setName('');
            setUsername('');
            setPassword('');
            setPinCode('');
            setRole('CASHIER');
            setTelegramHandle('');
            setEmail('');
            setPhone('');
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>{t('add_emp')}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
          <Users className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-1">Xodimlar topilmadi</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Hozircha hech qanday xodim qo'shilmagan.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/25">
                  <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('employees')}</th>
                  <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('username')}</th>
                  <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('role')}</th>
                  <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('contact')}</th>
                  <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('joined_date')}</th>
                  <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black uppercase">
                          {emp.name ? emp.name.split(' ').map(n => n[0]).join('') : emp.username.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{emp.name || emp.username}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: 000{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono">
                      @{emp.username}
                    </td>
                    <td className="p-5">
                      <span className={cn(
                        "inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border",
                        emp.role === 'ADMIN'
                          ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                      )}>
                        {emp.role === 'ADMIN' ? (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{t('admin_desc')}</span>
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="w-3.5 h-3.5" />
                            <span>{t('cashier_desc')}</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-5 space-y-1">
                      {emp.telegramHandle && (
                        <div className="flex items-center space-x-2 text-sm text-gray-650 dark:text-gray-300">
                          <svg className="w-4 h-4 text-sky-500 fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.05 4.39-1.5 6.32-.2.83-.58 1.11-.87 1.14-.64.06-1.13-.42-1.75-.83-.97-.64-1.52-1.04-2.46-1.66-1.09-.72-.38-1.12.24-1.76.16-.17 3.01-2.76 3.07-3.01.01-.03.02-.13-.04-.18-.06-.05-.15-.03-.21-.02-.09.02-1.53.97-4.32 2.85-.41.28-.78.42-1.11.41-.36 0-1.06-.2-1.58-.37-.64-.21-1.15-.32-1.1-.68.02-.19.29-.38.8-.57 3.12-1.36 5.2-2.26 6.24-2.7 2.97-1.24 3.59-1.46 3.99-1.46.09 0 .28.02.41.13.11.09.14.21.16.3.02.09.03.22.02.32z"/>
                          </svg>
                          <span className="font-semibold text-sky-600 dark:text-sky-400">{emp.telegramHandle}</span>
                        </div>
                      )}
                      {emp.email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{emp.email}</span>
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'Noma\'lum'}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? "Xodim ma'lumotlarini tahrirlash" : t('add_emp')}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold text-center">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">{t('emp_name')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="Masalan: Vali Aliyev"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">{t('username')}</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="Masalan: aliyev_v"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">{t('password')}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!editingId}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">{t('pin_code')}</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm text-center font-mono tracking-widest"
                    placeholder="----"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Telegram Manzili (Username)</label>
                  <input
                    type="text"
                    value={telegramHandle}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val && !val.startsWith('@')) val = '@' + val;
                      setTelegramHandle(val);
                    }}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">{t('phone')}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val) {
                        setPhone('');
                        return;
                      }
                      let digits = val.replace(/\D/g, '');
                      if (digits.length > 0 && !digits.startsWith('998')) {
                        if (digits.length <= 9) {
                          digits = '998' + digits;
                        }
                      }
                      let formatted = '+998';
                      let rest = digits.slice(3);
                      if (rest.length > 0) formatted += ' ' + rest.slice(0, 2);
                      if (rest.length > 2) formatted += ' ' + rest.slice(2, 5);
                      if (rest.length > 5) formatted += ' ' + rest.slice(5, 7);
                      if (rest.length > 7) formatted += ' ' + rest.slice(7, 9);
                      setPhone(formatted);
                    }}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm font-mono"
                    placeholder="+998 90 123 45 67"
                    maxLength={17}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 pl-1">Email Manzili</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  placeholder="masalan: xodim@ecogas.uz"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 pl-1">{t('role')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CASHIER')}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-xl border-2 font-bold transition-all text-sm",
                      role === 'CASHIER'
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300"
                    )}
                  >
                    {t('cashier_desc')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-xl border-2 font-bold transition-all text-sm",
                      role === 'ADMIN'
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-rose-300"
                    )}
                  >
                    {t('admin_desc')}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm font-semibold transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
