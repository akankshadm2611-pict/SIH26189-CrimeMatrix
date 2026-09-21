import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  themeMode?: 'dark' | 'bright';
  compact?: boolean;
  className?: string;
  isLoginPage?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  themeMode = 'dark',
  compact = false,
  className = '',
  isLoginPage = false,
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      id="language-switcher"
      data-no-translate="true"
      className={`flex items-center p-0.5 sm:p-1 rounded-full border transition-all select-none shadow-xs ${
        isLoginPage
          ? 'bg-slate-950/45 backdrop-blur-2xl border-white/20 ring-1 ring-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          : themeMode === 'bright'
          ? 'bg-white/95 border-slate-300 text-slate-800 shadow-sm'
          : 'bg-[#111827]/90 border-slate-700 text-slate-200'
      } ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <div className={`hidden sm:flex items-center pl-1.5 pr-1 ${
        isLoginPage
          ? 'text-slate-300'
          : 'text-slate-400'
      }`}>
        <Languages className={`w-3.5 h-3.5 ${isLoginPage ? 'text-slate-300' : 'text-amber-500'}`} />
      </div>

      <button
        id="btn-lang-en"
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center space-x-1 ${
          language === 'en'
            ? isLoginPage
              ? 'bg-white/20 text-white border border-white/30 shadow-sm'
              : themeMode === 'bright'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-yellow-500 text-slate-950 shadow-sm'
            : isLoginPage
            ? 'text-slate-300 hover:text-white hover:bg-white/10'
            : themeMode === 'bright'
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
        title="Switch to English"
      >
        <span className="sm:hidden">EN</span>
        <span className="hidden sm:inline">English</span>
      </button>

      <button
        id="btn-lang-hi"
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center space-x-1 ${
          language === 'hi'
            ? isLoginPage
              ? 'bg-white/20 text-white border border-white/30 shadow-sm'
              : themeMode === 'bright'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-yellow-500 text-slate-950 shadow-sm'
            : isLoginPage
            ? 'text-slate-300 hover:text-white hover:bg-white/10'
            : themeMode === 'bright'
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
        title="हिन्दी में बदलें (Switch to Hindi)"
      >
        <span className="font-serif sm:hidden">हि</span>
        <span className="font-serif hidden sm:inline">हिन्दी</span>
      </button>
    </div>
  );
};
