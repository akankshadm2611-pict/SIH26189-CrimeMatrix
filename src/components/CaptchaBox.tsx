import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface CaptchaBoxProps {
  onVerify: (isValid: boolean) => void;
  themeMode?: 'dark' | 'bright';
  isTransparent?: boolean;
}

export const generateCaptchaText = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const CaptchaBox: React.FC<CaptchaBoxProps> = ({ onVerify, themeMode = 'dark', isTransparent = false }) => {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const refreshCaptcha = () => {
    const code = generateCaptchaText();
    setCaptchaCode(code);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);
    const valid = value === captchaCode;
    setIsVerified(valid);
    onVerify(valid);
  };

  return (
    <div className="space-y-3">
      <label className={`block text-xs font-extrabold tracking-wider uppercase ${
        isTransparent ? 'text-slate-200' : themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'
      }`}>
        Two-Step Verification (CAPTCHA)
      </label>

      <div className="flex items-center space-x-3">
        {/* Stylized Security Captcha Box */}
        <div className={`relative flex-1 h-12 rounded-xl border flex items-center justify-center px-4 overflow-hidden select-none transition-all ${
          isTransparent
            ? 'bg-slate-900/60 backdrop-blur-md border-white/20 shadow-inner'
            : themeMode === 'bright'
            ? 'bg-slate-50 border-slate-300 shadow-sm border-2'
            : 'bg-slate-900/90 backdrop-blur-md border-slate-700 border-2'
        }`}>
          {/* Background noise grid lines */}
          <div className={`absolute inset-0 [background-size:8px_8px] opacity-20 pointer-events-none ${
            isTransparent || themeMode === 'dark'
              ? 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)]'
              : 'bg-[radial-gradient(#64748b_1px,transparent_1px)]'
          }`} />
          
          {/* Captcha Text with slight random rotations */}
          <div className={`relative z-10 flex space-x-1.5 sm:space-x-3 font-mono text-lg sm:text-2xl tracking-wider sm:tracking-widest font-black ${
            isTransparent || themeMode === 'dark'
              ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
              : 'text-slate-900 drop-shadow-xs'
          }`}>
            {captchaCode.split('').map((char, index) => (
              <span
                key={index}
                style={{
                  transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (index * 4 + 3)}deg) translateY(${index % 2 === 0 ? -2 : 2}px)`,
                  fontStyle: index % 3 === 0 ? 'italic' : 'normal',
                }}
                className="inline-block"
              >
                {char}
              </span>
            ))}
          </div>

          {/* Noise Strike-through line */}
          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-red-500/40 via-cyan-400/60 to-blue-500/40 transform -rotate-3 pointer-events-none" />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={refreshCaptcha}
          className={`flex items-center justify-center h-12 px-3 sm:px-4 rounded-xl border transition-all focus:outline-none cursor-pointer shadow-sm shrink-0 ${
            isTransparent
              ? 'bg-slate-900/60 hover:bg-slate-800/70 border-white/20 text-slate-200 hover:text-white'
              : themeMode === 'bright'
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 border-2'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white border-2'
          }`}
          title="Generate New CAPTCHA"
        >
          <RefreshCw className="w-4.5 h-4.5 sm:mr-2" />
          <span className="hidden sm:inline text-sm font-extrabold">Refresh</span>
        </button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="ENTER CAPTCHA CODE HERE"
          maxLength={6}
          className={`w-full px-4 py-3 rounded-xl text-base font-mono tracking-wider focus:outline-none uppercase transition-all ${
            isTransparent
              ? 'bg-slate-900/60 focus:bg-slate-900/80 border border-white/20 text-white placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30'
              : themeMode === 'bright'
              ? 'bg-white border-2 border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
              : 'bg-slate-900/90 border-2 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          } ${
            isVerified ? 'border-emerald-400! ring-2 ring-emerald-500/30!' : ''
          }`}
        />
        {isVerified && (
          <div className="absolute right-3 top-3.5 flex items-center text-xs font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4 mr-1" /> Verified
          </div>
        )}
      </div>
    </div>
  );
};
