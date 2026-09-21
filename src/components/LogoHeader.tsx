import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import policeEmblemSticker from '../assets/images/police_emblem_sticker.png';
import policeEmblemStickerBright from '../assets/images/police_emblem_sticker_bright.png';

interface LogoHeaderProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
  showSubtitle?: boolean;
  className?: string;
  themeMode?: 'dark' | 'bright';
  forceDarkText?: boolean;
  isLoginPage?: boolean;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  size = 'md',
  layout = 'vertical',
  showSubtitle = true,
  className = '',
  themeMode = 'dark',
  forceDarkText = false,
  isLoginPage = false,
}) => {
  const { isHindi } = useLanguage();
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  const isHorizontal = layout === 'horizontal';
  const useDarkColors = forceDarkText || themeMode === 'dark';

  return (
    <div
      className={`flex ${
        isHorizontal ? 'items-center space-x-2.5 sm:space-x-3 text-left' : 'flex-col items-center justify-center text-center'
      } ${className}`}
    >
      {/* Official Golden Police State Emblem Sticker */}
      <div
        className={`relative flex-shrink-0 flex items-center justify-center ${
          isHorizontal
            ? isSmall
              ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11'
              : 'w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14'
            : isLarge
            ? 'w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 mb-2 sm:mb-3'
            : isSmall
            ? 'w-10 h-10 mb-1'
            : 'w-16 h-16 sm:w-20 sm:h-20 mb-2'
        }`}
      >
        <img
          src={isLoginPage || useDarkColors ? policeEmblemSticker : policeEmblemStickerBright}
          alt="State Police Emblem - Satyameva Jayate"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain select-none transition-transform duration-300 hover:scale-105 ${
            isLoginPage
              ? 'drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] drop-shadow-[0_0_15px_rgba(245,158,11,0.35)]'
              : useDarkColors
              ? 'drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]'
              : 'drop-shadow-[0_4px_12px_rgba(180,83,9,0.22)]'
          }`}
        />
      </div>

      {/* Title & Subtitle Container */}
      <div className={isHorizontal ? 'flex flex-col justify-center leading-tight shrink-0 min-w-max' : 'flex flex-col items-center shrink-0 min-w-max'}>
        {/* Main Title: Crime Matrix */}
        <h1
          className={`font-serif tracking-wider font-extrabold leading-none whitespace-nowrap shrink-0 transition-colors ${
            isHorizontal
              ? isSmall
                ? 'text-xs sm:text-base md:text-lg'
                : 'text-base sm:text-lg md:text-xl'
              : isLarge
              ? 'text-2xl sm:text-3xl md:text-4xl'
              : isSmall
              ? 'text-sm sm:text-base'
              : 'text-lg sm:text-2xl'
          } ${
            isLoginPage
              ? 'text-yellow-400 drop-shadow-[0_2px_14px_rgba(250,204,21,0.65)] font-black'
              : !useDarkColors
              ? 'text-slate-900 drop-shadow-xs font-black'
              : 'text-amber-400 drop-shadow-[0_1px_6px_rgba(234,179,8,0.35)]'
          }`}
        >
          {isHindi ? 'क्राइम मैट्रिक्स' : 'CRIME MATRIX'}
        </h1>

        {/* Subtitle / Department Tagline */}
        {showSubtitle && (
          <div className={isHorizontal ? 'flex flex-col items-start' : 'flex flex-col items-center'}>
            <p
              className={`tracking-[0.18em] sm:tracking-[0.22em] uppercase font-bold leading-tight whitespace-nowrap shrink-0 transition-colors ${
                isHorizontal
                  ? 'hidden sm:block text-[8px] sm:text-[9px] md:text-[9.5px] mt-0.5'
                  : isLarge
                  ? 'text-xs sm:text-sm mt-1.5'
                  : isSmall
                  ? 'text-[7.5px] sm:text-[8px]'
                  : 'text-[9.5px] sm:text-xs mt-0.5'
              } ${
                isLoginPage
                  ? 'text-amber-400 font-extrabold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]'
                  : !useDarkColors
                  ? 'text-amber-950 font-black'
                  : 'text-amber-300/90'
              }`}
            >
              {isHindi ? 'सत्य • साक्ष्य • न्याय' : 'TRUTH • EVIDENCE • JUSTICE'}
            </p>
            {isLarge && (
              <span
                className={`text-[9.5px] sm:text-[10.5px] tracking-[0.2em] uppercase font-semibold mt-1 transition-colors ${
                  isLoginPage
                    ? 'text-amber-200/90 font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]'
                    : !useDarkColors
                    ? 'text-slate-600'
                    : 'text-slate-400'
                }`}
              >
                {isHindi ? 'केंद्रीय जांच एवं खुफिया नेटवर्क' : 'Central Investigation & Intelligence Network'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

