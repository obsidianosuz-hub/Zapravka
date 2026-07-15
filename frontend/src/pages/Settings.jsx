import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { Globe, Moon, Sun, Eye, Type, Settings as SettingsIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export default function Settings() {
  const { theme, toggleTheme, eyeProtection, toggleEyeProtection } = useTheme();
  const { language, setLanguage, fontSize, setFontSize, t } = useSettings();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center space-x-3">
        <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl">
          <SettingsIcon className="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('settings_desc')}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        
        {/* Language Settings */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('sys_lang')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('sys_lang_desc')}</p>
            </div>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 cursor-pointer outline-none"
          >
            <option value="UZ">O'zbek (UZ)</option>
            <option value="EN">English (EN)</option>
            <option value="RU">Русский (RU)</option>
          </select>
        </div>

        {/* Theme Settings */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
              <Moon className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('theme')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('theme_desc')}</p>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <button 
              onClick={() => toggleTheme('light')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                theme === 'light' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-white"
              )}
            >
              {t('light')}
            </button>
            <button 
              onClick={() => toggleTheme('dark')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                theme === 'dark' ? "bg-gray-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              {t('dark')}
            </button>
          </div>
        </div>

        {/* Eye Protection */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
              <Eye className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('eye_protection')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('eye_protection_desc')}</p>
            </div>
          </div>
          <button 
            onClick={() => toggleEyeProtection()}
            className={cn(
              "w-14 h-7 rounded-full transition-colors relative",
              eyeProtection ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-200",
              eyeProtection ? "left-8" : "left-1"
            )}></div>
          </button>
        </div>

        {/* Font Size Settings */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <Type className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('font_size')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('font_size_desc')}</p>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <button 
              onClick={() => setFontSize('sm')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                fontSize === 'sm' ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t('small')}
            </button>
            <button 
              onClick={() => setFontSize('base')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                fontSize === 'base' ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t('medium')}
            </button>
            <button 
              onClick={() => setFontSize('lg')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                fontSize === 'lg' ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t('large')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
