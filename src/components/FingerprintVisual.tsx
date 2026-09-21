import React from 'react';
import { FingerprintPatternType, MinutiaePoint } from '../utils/fingerprintUtils';

interface FingerprintVisualProps {
  seedStr?: string;
  patternType?: FingerprintPatternType;
  minutiaePoints?: MinutiaePoint[];
  isScanning?: boolean;
  showMinutiae?: boolean;
  isMatched?: boolean;
  isUnmatched?: boolean;
  imageUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  themeMode?: 'bright' | 'dark';
}

export const FingerprintVisual: React.FC<FingerprintVisualProps> = ({
  seedStr = 'DEFAULT',
  patternType = 'Plain Whorl',
  minutiaePoints = [],
  isScanning = false,
  showMinutiae = true,
  isMatched = false,
  isUnmatched = false,
  imageUrl,
  className = '',
  size = 'md',
  themeMode = 'dark',
}) => {
  // Dimensions
  const sizeMap = {
    sm: { w: 90, h: 120 },
    md: { w: 140, h: 180 },
    lg: { w: 200, h: 260 },
    xl: { w: 260, h: 340 },
  };

  const { w, h } = sizeMap[size];

  // Hash seed for consistent distinct ridges
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // Generate concentric ellipses or spiral arcs based on pattern
  const isWhorl = patternType.includes('Whorl');
  const isLoop = patternType.includes('Loop');
  const isArch = patternType.includes('Arch');

  const ridgeCount = 13;
  const cx = 50 + ((posHash % 9) - 4);
  const cy = 48 + (((posHash >> 2) % 9) - 4);

  // Determine colors based on theme & matching state
  const ridgeColor = isMatched
    ? '#10b981' // emerald
    : isUnmatched
    ? '#ef4444' // red
    : isScanning
    ? '#38bdf8' // sky blue
    : themeMode === 'bright'
    ? '#1e293b' // dark slate in bright mode
    : '#94a3b8'; // light slate in dark mode

  return (
    <div
      className={`relative select-none overflow-hidden rounded-xl transition-all duration-300 flex items-center justify-center ${
        themeMode === 'bright'
          ? 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-300'
          : 'bg-gradient-to-b from-slate-900 via-slate-950 to-black border-slate-800'
      } border shadow-inner ${
        isMatched
          ? 'ring-2 ring-emerald-500 shadow-emerald-500/20 shadow-lg'
          : isUnmatched
          ? 'ring-2 ring-red-500 shadow-red-500/20 shadow-lg'
          : isScanning
          ? 'ring-2 ring-sky-400 shadow-sky-500/30 shadow-lg'
          : ''
      } ${className}`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      {/* Background Holographic Grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${
            themeMode === 'bright' ? '#64748b' : '#38bdf8'
          } 1px, transparent 1px)`,
          backgroundSize: '12px 12px',
        }}
      />

      {/* Target Reticle Crosshairs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 ${
            isMatched
              ? 'border-emerald-500'
              : isUnmatched
              ? 'border-red-500'
              : isScanning
              ? 'border-sky-400'
              : themeMode === 'bright'
              ? 'border-slate-400'
              : 'border-slate-600'
          }`}
        />
        <div
          className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 ${
            isMatched
              ? 'border-emerald-500'
              : isUnmatched
              ? 'border-red-500'
              : isScanning
              ? 'border-sky-400'
              : themeMode === 'bright'
              ? 'border-slate-400'
              : 'border-slate-600'
          }`}
        />
        <div
          className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 ${
            isMatched
              ? 'border-emerald-500'
              : isUnmatched
              ? 'border-red-500'
              : isScanning
              ? 'border-sky-400'
              : themeMode === 'bright'
              ? 'border-slate-400'
              : 'border-slate-600'
          }`}
        />
        <div
          className={`absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 ${
            isMatched
              ? 'border-emerald-500'
              : isUnmatched
              ? 'border-red-500'
              : isScanning
              ? 'border-sky-400'
              : themeMode === 'bright'
              ? 'border-slate-400'
              : 'border-slate-600'
          }`}
        />
      </div>

      {/* Render Custom Image if provided, else procedural forensic SVG */}
      {imageUrl ? (
        <div className="relative w-full h-full p-2 flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Fingerprint"
            className="w-full h-full object-contain filter contrast-125"
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 100 130"
          className="w-full h-full p-3 pointer-events-none transition-transform duration-300"
        >
          <defs>
            <filter id={`glow-${posHash}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Core papillary ridges */}
          <g
            stroke={ridgeColor}
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isScanning ? 0.95 : 0.85}
          >
            {isWhorl && (
              <>
                {Array.from({ length: ridgeCount }).map((_, i) => {
                  const rx = 3.5 + i * 3.2;
                  const ry = 4.8 + i * 4.1;
                  const rotate = (posHash % 30) - 15;
                  return (
                    <ellipse
                      key={`whorl-${i}`}
                      cx={cx}
                      cy={cy}
                      rx={rx}
                      ry={ry}
                      transform={`rotate(${rotate} ${cx} ${cy})`}
                      strokeDasharray={i % 3 === 1 ? '14, 2, 8, 3' : i % 2 === 0 ? '22, 3' : 'none'}
                    />
                  );
                })}
              </>
            )}

            {isLoop && (
              <>
                {Array.from({ length: ridgeCount }).map((_, i) => {
                  const step = 3.4 * (i + 1);
                  const isRight = patternType.includes('Right') || posHash % 2 === 0;
                  const d = isRight
                    ? `M ${cx - step * 0.9} 115 C ${cx - step * 0.9} ${cy - step * 0.8}, ${cx + step * 0.4} ${cy - step * 1.3}, ${cx + step * 0.8} ${cy + 10} C ${cx + step * 0.9} ${cy + 30}, ${cx + 10} 115, ${cx + 15} 125`
                    : `M ${cx + step * 0.9} 115 C ${cx + step * 0.9} ${cy - step * 0.8}, ${cx - step * 0.4} ${cy - step * 1.3}, ${cx - step * 0.8} ${cy + 10} C ${cx - step * 0.9} ${cy + 30}, ${cx - 10} 115, ${cx - 15} 125`;

                  return (
                    <path
                      key={`loop-${i}`}
                      d={d}
                      strokeDasharray={i % 4 === 1 ? '16, 2, 7, 3' : 'none'}
                    />
                  );
                })}
              </>
            )}

            {isArch && (
              <>
                {Array.from({ length: ridgeCount }).map((_, i) => {
                  const step = 3.6 * (i + 1);
                  const peak = patternType.includes('Tented') ? 1.6 : 1.1;
                  const d = `M ${cx - 36 - step * 0.2} ${cy + 35 + i * 2.5} Q ${cx} ${cy - step * peak}, ${cx + 36 + step * 0.2} ${cy + 35 + i * 2.5}`;
                  return (
                    <path
                      key={`arch-${i}`}
                      d={d}
                      strokeDasharray={i % 3 === 0 ? '20, 3, 10, 2' : 'none'}
                    />
                  );
                })}
              </>
            )}

            {/* Base lower delta lines */}
            <path d="M 18 118 Q 50 102 82 118" strokeWidth="1.4" opacity="0.6" />
            <path d="M 22 124 Q 50 110 78 124" strokeWidth="1.2" opacity="0.4" />
          </g>

          {/* Minutiae Points Markers */}
          {showMinutiae &&
            minutiaePoints.map((pt) => {
              const markerColor = isMatched
                ? '#10b981'
                : isUnmatched
                ? '#ef4444'
                : pt.type === 'core'
                ? '#06b6d4' // cyan
                : pt.type === 'delta'
                ? '#f59e0b' // amber
                : pt.type === 'bifurcation'
                ? '#10b981' // green
                : '#3b82f6'; // blue

              return (
                <g key={pt.id} transform={`translate(${pt.x}, ${pt.y * 1.25})`}>
                  {/* Outer halo */}
                  <circle
                    r="1.8"
                    fill={markerColor}
                    opacity="0.8"
                    className={isMatched ? 'animate-ping' : ''}
                  />
                  {/* Core dot */}
                  <circle r="1" fill="#ffffff" />
                  {/* Directional tick for bifurcations */}
                  {pt.type === 'bifurcation' && (
                    <line
                      x1="0"
                      y1="0"
                      x2="2.5"
                      y2="2.5"
                      stroke={markerColor}
                      strokeWidth="0.8"
                      transform={`rotate(${pt.angle})`}
                    />
                  )}
                </g>
              );
            })}
        </svg>
      )}

      {/* Dynamic Laser Scanning Beam */}
      {isScanning && (
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden">
          <div
            className="w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_1.4s_ease-in-out_infinite]"
            style={{
              animationDuration: '1.2s',
              animationIterationCount: 'infinite',
            }}
          />
          <div className="absolute inset-0 bg-sky-500/10 animate-pulse pointer-events-none" />
        </div>
      )}

      {/* Match / No Match Overlay Stamp */}
      {isMatched && (
        <div className="absolute top-2 left-2 right-2 flex items-center justify-center">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-slate-950 shadow-md">
            MATCH
          </span>
        </div>
      )}

      {isUnmatched && (
        <div className="absolute top-2 left-2 right-2 flex items-center justify-center">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-600 text-white shadow-md">
            NO MATCH
          </span>
        </div>
      )}
    </div>
  );
};
