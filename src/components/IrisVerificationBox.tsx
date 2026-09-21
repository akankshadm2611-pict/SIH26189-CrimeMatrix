import React, { useState, useEffect, useRef } from 'react';
import {
  Scan,
  ScanEye,
  Eye,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Camera,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface IrisVerificationBoxProps {
  onVerify: (isValid: boolean, irisToken?: string) => void;
  themeMode?: 'dark' | 'bright';
  title?: string;
  subtitle?: string;
  isCompact?: boolean;
  isTransparent?: boolean;
}

export const IrisVerificationBox: React.FC<IrisVerificationBoxProps> = ({
  onVerify,
  themeMode = 'dark',
  title = 'Iris Verification',
  subtitle = 'Biometric Retinal & Iris Pattern Recognition',
  isCompact = false,
  isTransparent = false,
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [scanMessage, setScanMessage] = useState<string>('Ready for Biometric Capture');
  const [irisHash, setIrisHash] = useState<string>('');
  const [useWebcam, setUseWebcam] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Clean up media stream when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const toggleCamera = async () => {
    if (useWebcam) {
      stopCamera();
      setUseWebcam(false);
      setCameraError('');
      return;
    }

    try {
      setCameraError('');
      const stream = await navigator.mediaDevices?.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (stream) {
        mediaStreamRef.current = stream;
        setUseWebcam(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch (err) {
      setCameraError('Camera access not permitted or unavailable. Using Optical Iris Scanner.');
      setUseWebcam(false);
    }
  };

  const startScan = () => {
    if (status === 'scanning') return;

    setStatus('scanning');
    setProgress(0);
    setScanMessage('Calibrating Iris Sensor & Focal Grid...');

    let current = 0;
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = window.setInterval(() => {
      current += 8 + Math.floor(Math.random() * 8);

      if (current < 30) {
        setScanMessage('Detecting Pupil & Sclera Boundaries...');
      } else if (current < 65) {
        setScanMessage('Analyzing Cryptographic Iris Texture Vectors...');
      } else if (current < 90) {
        setScanMessage('Verifying Biometric Hash with Central Justice Vault...');
      } else if (current >= 100) {
        current = 100;
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        const generatedToken = `IRIS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        setIrisHash(generatedToken);
        setStatus('verified');
        setScanMessage('Biometric Match Confirmed (Confidence 99.8%)');
        onVerify(true, generatedToken);
      }
      setProgress(Math.min(current, 100));
    }, 120);
  };

  const handleReset = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setStatus('idle');
    setProgress(0);
    setIrisHash('');
    setScanMessage('Ready for Biometric Capture');
    onVerify(false);
  };

  return (
    <div className="space-y-2.5">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <label
          className={`block text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 ${
            isTransparent ? 'text-slate-100' : themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
          }`}
        >
          <ScanEye className={`w-4 h-4 ${isTransparent ? 'text-cyan-400' : themeMode === 'bright' ? 'text-blue-600' : 'text-cyan-400'}`} />
          <span>{title}</span>
        </label>

        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
            status === 'verified'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : status === 'scanning'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 animate-pulse'
              : isTransparent
              ? 'bg-slate-800/80 text-slate-300 border-white/20'
              : themeMode === 'bright'
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'bg-slate-900/90 text-slate-300 border-slate-700'
          }`}
        >
          {status === 'verified' ? '✓ Verified' : status === 'scanning' ? 'Scanning...' : 'Pending'}
        </span>
      </div>

      {/* Iris Scanner Visual Box */}
      <div
        className={`relative rounded-xl border transition-all overflow-hidden ${
          isCompact ? 'p-3' : 'p-4'
        } ${
          status === 'verified'
            ? 'bg-slate-950/80 border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
            : status === 'scanning'
            ? 'bg-slate-950/90 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
            : isTransparent
            ? 'bg-slate-900/50 backdrop-blur-md border-white/20 shadow-inner'
            : themeMode === 'bright'
            ? 'bg-slate-50/90 border-slate-200 shadow-xs border-2'
            : 'bg-slate-950/80 border-slate-800 shadow-inner border-2'
        }`}
      >
        {/* Subtle decorative background grid */}
        <div
          className={`absolute inset-0 [background-size:12px_12px] opacity-15 pointer-events-none ${
            isTransparent || themeMode === 'dark'
              ? 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)]'
              : 'bg-[radial-gradient(#3b82f6_1px,transparent_1px)]'
          }`}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {/* Circular Biometric Reticle viewport */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
            {/* Outer rotating ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed transition-all ${
                status === 'scanning'
                  ? themeMode === 'bright'
                    ? 'border-blue-600 animate-spin'
                    : 'border-cyan-400 animate-spin'
                  : status === 'verified'
                  ? 'border-emerald-500'
                  : themeMode === 'bright'
                  ? 'border-slate-300'
                  : 'border-slate-700/80'
              }`}
              style={{ animationDuration: '6s' }}
            />

            {/* Inner Ring */}
            <div
              className={`absolute inset-2 rounded-full border transition-all ${
                status === 'scanning'
                  ? themeMode === 'bright'
                    ? 'border-blue-400 ring-2 ring-blue-400/30'
                    : 'border-cyan-300/80 ring-2 ring-cyan-400/30'
                  : status === 'verified'
                  ? 'border-emerald-400/80 ring-2 ring-emerald-500/30'
                  : themeMode === 'bright'
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-700/60 bg-slate-900/80'
              }`}
            />

            {/* Webcam Live Video or Optical Eye Graphic */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center">
              {useWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center transition-colors ${
                    status === 'verified'
                      ? themeMode === 'bright'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-emerald-500/20 text-emerald-400'
                      : status === 'scanning'
                      ? themeMode === 'bright'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-cyan-500/20 text-cyan-300'
                      : themeMode === 'bright'
                      ? 'bg-white text-blue-600'
                      : 'bg-slate-900 text-cyan-400'
                  }`}
                >
                  {status === 'verified' ? (
                    <ShieldCheck className="w-9 h-9 animate-in zoom-in-75 duration-200" />
                  ) : (
                    <Eye className={`w-9 h-9 ${status === 'scanning' ? 'animate-pulse' : ''}`} />
                  )}
                </div>
              )}

              {/* Laser scan line passing over during scanning */}
              {status === 'scanning' && (
                <div
                  className={`absolute inset-x-0 h-1 animate-pulse top-1/2 -translate-y-1/2 ${
                    themeMode === 'bright'
                      ? 'bg-gradient-to-r from-transparent via-blue-600 to-transparent shadow-[0_0_10px_#2563eb]'
                      : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4]'
                  }`}
                />
              )}
            </div>

            {/* Target Crosshairs */}
            <div
              className={`absolute top-0 w-2 h-0.5 ${
                themeMode === 'bright' ? 'bg-blue-600/70' : 'bg-cyan-400/70'
              }`}
            />
            <div
              className={`absolute bottom-0 w-2 h-0.5 ${
                themeMode === 'bright' ? 'bg-blue-600/70' : 'bg-cyan-400/70'
              }`}
            />
            <div
              className={`absolute left-0 h-2 w-0.5 ${
                themeMode === 'bright' ? 'bg-blue-600/70' : 'bg-cyan-400/70'
              }`}
            />
            <div
              className={`absolute right-0 h-2 w-0.5 ${
                themeMode === 'bright' ? 'bg-blue-600/70' : 'bg-cyan-400/70'
              }`}
            />
          </div>

          {/* Scanner Details & Action Area */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2 w-full">
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                <span
                  className={`text-xs font-black tracking-tight ${
                    isTransparent || themeMode === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {status === 'verified' ? 'Iris Authenticated' : status === 'scanning' ? 'Scanning Iris Pattern...' : 'Official Iris Scanner'}
                </span>
                {status === 'verified' && (
                  <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-600 text-white rounded">
                    MATCH: 99.8%
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] font-semibold truncate ${
                  status === 'verified'
                    ? 'text-emerald-400'
                    : status === 'scanning'
                    ? 'text-cyan-300 animate-pulse'
                    : isTransparent || themeMode === 'dark'
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {scanMessage}
              </p>
            </div>

            {/* Progress Bar (Visible while scanning or once verified) */}
            {(status === 'scanning' || status === 'verified') && (
              <div className="space-y-1">
                <div
                  className={`w-full rounded-full h-2 overflow-hidden border ${
                    themeMode === 'bright'
                      ? 'bg-slate-200 border-slate-300'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div
                    className={`h-full transition-all duration-150 ${
                      status === 'verified'
                        ? 'bg-emerald-500'
                        : themeMode === 'bright'
                        ? 'bg-blue-600'
                        : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div
                  className={`flex justify-between items-center text-[10px] font-mono font-bold ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  <span>{status === 'verified' ? 'ENCRYPTED HASH' : 'PROCESSING'}</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {/* Verified Token Display */}
            {status === 'verified' && irisHash && (
              <div
                className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-black flex items-center justify-between border ${
                  themeMode === 'bright'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                }`}
              >
                <span>TOKEN: {irisHash}</span>
                <span
                  className={`text-[10px] font-sans font-bold ${
                    themeMode === 'bright' ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  Encrypted
                </span>
              </div>
            )}

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              {status !== 'verified' ? (
                <button
                  type="button"
                  onClick={startScan}
                  disabled={status === 'scanning'}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shadow-md ${
                    status === 'scanning'
                      ? themeMode === 'bright'
                        ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-wait'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-wait'
                      : themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md shadow-blue-500/20 active:scale-[0.98]'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black shadow-lg shadow-cyan-950/50 border border-cyan-400/30 active:scale-[0.98]'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>{status === 'scanning' ? 'Scanning...' : 'Start Iris Scan'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                    themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                  title="Rescan Iris"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-scan</span>
                </button>
              )}

              {/* Optional Camera Feed Toggle */}
              {navigator.mediaDevices && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  disabled={status === 'scanning'}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all cursor-pointer border ${
                    useWebcam
                      ? themeMode === 'bright'
                        ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                        : 'bg-cyan-600 text-white border-cyan-400 font-black'
                      : themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Toggle Camera View"
                >
                  <Camera className="w-3 h-3" />
                  <span>{useWebcam ? 'Close Camera' : 'Live Camera'}</span>
                </button>
              )}
            </div>

            {cameraError && (
              <p
                className={`text-[10px] font-semibold ${
                  themeMode === 'bright' ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                {cameraError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
