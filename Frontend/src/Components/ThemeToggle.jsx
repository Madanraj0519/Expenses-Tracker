import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ compact = false, className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        className={`p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
          isDark
            ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
        } ${className}`}
      >
        {isDark ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <FaMoon className="text-blue-400 text-sm" />
        ) : (
          <FaSun className="text-amber-500 text-sm" />
        )}
        <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
      </div>

      {/* Modern sliding switch pill */}
      <div
        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
          isDark ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
        }`}
      >
        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center">
          {isDark ? (
            <FaMoon className="text-[8px] text-blue-600" />
          ) : (
            <FaSun className="text-[8px] text-amber-500" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
