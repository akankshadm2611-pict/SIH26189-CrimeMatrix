import React, { useState, useRef, useEffect } from 'react';
import { Suspect, Case, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Fingerprint,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Shield,
  Scan,
  RefreshCw,
  Eye,
  FileCheck,
  Fingerprint as FingerprintIcon,
  FolderLock,
  Layers,
  Sparkles,
  Info,
  Sliders,
  Maximize2,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  getSuspectFingerprint,
  initialEvidenceSamples,
  LatentEvidencePrint,
  SuspectFingerprintRecord,
  FingerprintPatternType,
} from '../utils/fingerprintUtils';
import { FingerprintVisual } from './FingerprintVisual';

interface FingerprintMatchingViewProps {
  suspects: Suspect[];
  cases?: Case[];
  currentUser: User;
  themeMode?: 'bright' | 'dark';
  onBackToDashboard: () => void;
  onSelectCase?: (c: Case) => void;
}

export const FingerprintMatchingView: React.FC<FingerprintMatchingViewProps> = ({
  suspects,
  cases = [],
  currentUser,
  themeMode = 'bright',
  onBackToDashboard,
  onSelectCase,
}) => {
  const { t } = useLanguage();

  // Selected or attached print to scan
  const [attachedPrint, setAttachedPrint] = useState<{
    id: string;
    name: string;
    source: string;
    capturedAt: string;
    targetSuspectId: string | null; // null if unmatchable
    imageUrl?: string;
    patternHint: FingerprintPatternType;
    qualityScore: number;
    notes?: string;
  } | null>(() => {
    // Default to the first crime scene evidence sample for instant usability
    const defaultSample = initialEvidenceSamples[0];
    return {
      id: defaultSample.id,
      name: defaultSample.name,
      source: defaultSample.source,
      capturedAt: defaultSample.capturedAt,
      targetSuspectId: defaultSample.targetSuspectId,
      patternHint: defaultSample.patternHint,
      qualityScore: defaultSample.qualityScore,
      notes: defaultSample.notes,
    };
  });

  // Scanner status
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Match result: null = not scanned yet, 'matched' = found suspect, 'unmatched' = No match
  const [matchResult, setMatchResult] = useState<{
    status: 'matched' | 'unmatched';
    suspect?: Suspect;
    fingerprintRecord?: SuspectFingerprintRecord;
    confidenceScore?: number;
    matchedPointsCount?: number;
    checkedCount?: number;
  } | null>(null);

  // Search filter for suspect repository
  const [suspectSearch, setSuspectSearch] = useState('');
  const [patternFilter, setPatternFilter] = useState<string>('all');

  // Modal inspection of suspect's biometric card
  const [inspectingSuspect, setInspectingSuspect] = useState<{
    suspect: Suspect;
    record: SuspectFingerprintRecord;
  } | null>(null);

  // Optical scanner active touch state
  const [isTouchScannerActive, setIsTouchScannerActive] = useState(false);

  // File input ref for uploading custom image
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset match result when attached print changes
  const handleSelectEvidenceSample = (sample: LatentEvidencePrint) => {
    setAttachedPrint({
      id: sample.id,
      name: sample.name,
      source: sample.source,
      capturedAt: sample.capturedAt,
      targetSuspectId: sample.targetSuspectId,
      imageUrl: sample.imageUrl,
      patternHint: sample.patternHint,
      qualityScore: sample.qualityScore,
      notes: sample.notes,
    });
    setMatchResult(null);
  };

  // Load a suspect's print directly into the scanner as attached evidence
  const handleLoadSuspectPrint = (suspect: Suspect) => {
    const record = getSuspectFingerprint(suspect);
    setAttachedPrint({
      id: `SAMPLE-SUSPECT-${suspect.id}`,
      name: `Direct Biometric Sample: ${suspect.fullName}`,
      source: `Police Archive Card (${record.finger})`,
      capturedAt: 'Live Direct Feed',
      targetSuspectId: suspect.id,
      patternHint: record.patternType,
      qualityScore: 98,
      notes: `Direct biometric sample loaded for test cross-referencing.`,
    });
    setMatchResult(null);
  };

  // Handle custom image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Check if file name has suspect ID or name hint
      const lowerName = file.name.toLowerCase();
      const matchedSus = suspects.find(
        (s) =>
          lowerName.includes(s.id.toLowerCase()) ||
          lowerName.includes(s.fullName.toLowerCase().split(' ')[0])
      );

      setAttachedPrint({
        id: `UPLOADED-${Date.now()}`,
        name: file.name,
        source: 'Forensic Lab File Upload',
        capturedAt: new Date().toLocaleString(),
        targetSuspectId: matchedSus ? matchedSus.id : null,
        imageUrl: dataUrl,
        patternHint: 'Plain Whorl',
        qualityScore: 92,
        notes: `Uploaded file size: ${(file.size / 1024).toFixed(1)} KB.`,
      });
      setMatchResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Live Optical Touch Capture Simulation
  const handleCaptureLiveOptical = () => {
    setIsTouchScannerActive(true);
    setTimeout(() => {
      setIsTouchScannerActive(false);
      // Pick first suspect or unknown randomly or pick suspect 0
      const targetSus = suspects.length > 0 ? suspects[0] : null;
      if (targetSus) {
        handleLoadSuspectPrint(targetSus);
      }
    }, 1200);
  };

  // Trigger Biometric Scan & Match
  const handleRunScanAndMatch = () => {
    if (!attachedPrint) return;

    setIsScanning(true);
    setMatchResult(null);
    setScanProgress(15);
    setScanStep('Binarizing Papillary Ridges & Eliminating Noise...');

    setTimeout(() => {
      setScanProgress(45);
      setScanStep('Extracting Minutiae Coordinates (Bifurcations & Endings)...');
    }, 450);

    setTimeout(() => {
      setScanProgress(75);
      setScanStep(`Cross-referencing AFIS with ${suspects.length} Suspect Biometric Profiles...`);
    }, 900);

    setTimeout(() => {
      setScanProgress(100);
      setScanStep('Computing Ridge Vector Matching Thresholds...');

      // Compute match
      let foundSuspect: Suspect | undefined;
      if (attachedPrint.targetSuspectId) {
        foundSuspect = suspects.find((s) => s.id === attachedPrint.targetSuspectId);
      }

      if (foundSuspect) {
        const record = getSuspectFingerprint(foundSuspect);
        setMatchResult({
          status: 'matched',
          suspect: foundSuspect,
          fingerprintRecord: record,
          confidenceScore: 98.4,
          matchedPointsCount: record.minutiaeCount,
          checkedCount: suspects.length,
        });
      } else {
        // No match found
        setMatchResult({
          status: 'unmatched',
          checkedCount: suspects.length,
        });
      }

      setIsScanning(false);
    }, 1400);
  };

  // Filter available suspects
  const filteredSuspects = suspects.filter((s) => {
    const record = getSuspectFingerprint(s);
    const matchesSearch =
      s.fullName.toLowerCase().includes(suspectSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(suspectSearch.toLowerCase()) ||
      s.crime.toLowerCase().includes(suspectSearch.toLowerCase()) ||
      record.fingerprintId.toLowerCase().includes(suspectSearch.toLowerCase());

    const matchesPattern = patternFilter === 'all' || record.patternType.includes(patternFilter);

    return matchesSearch && matchesPattern;
  });

  return (
    <div className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 transition-colors ${
      themeMode === 'bright' ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0b0d] text-slate-100'
    }`}>
      {/* Top Header & Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              id="btn-back-to-dashboard"
              onClick={onBackToDashboard}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                themeMode === 'bright'
                  ? 'bg-white hover:bg-slate-200 border-slate-300 text-slate-700 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                  <Fingerprint className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {t('Fingerprint')} {t('Identification & AFIS Matcher')}
                </h1>
              </div>
              <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('Automated Fingerprint Identification System • Compare attached crime scene prints against registered suspect records')}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              themeMode === 'bright' ? 'bg-white border-slate-300 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <FileCheck className="w-4 h-4 text-yellow-500" />
              <span>{t('Suspects Indexed:')}</span>
              <span className="font-mono text-yellow-500 font-black">{suspects.length}</span>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              themeMode === 'bright'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AFIS v4.2 Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* SECTION 1: SCANNER & MATCHING WORKBENCH */}
        <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${
          themeMode === 'bright'
            ? 'bg-white border-slate-300 shadow-md'
            : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center space-x-2">
                <Scan className="w-5 h-5 text-yellow-500" />
                <span>{t('Biometric Fingerprint Scanner & Matching Engine')}</span>
              </h2>
              <p className={`text-xs mt-1 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('Attach an evidence print, upload an image file, or choose from crime scene samples to match against suspect fingerprints.')}
              </p>
            </div>

            {/* Quick Actions: Upload File & Optical Sensor */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="fingerprint-file-input"
              />
              <button
                id="btn-upload-fingerprint-image"
                onClick={() => fileInputRef.current?.click()}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4 text-yellow-500" />
                <span>{t('Attach Image File')}</span>
              </button>

              <button
                id="btn-optical-live-scan"
                onClick={handleCaptureLiveOptical}
                disabled={isTouchScannerActive}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
                  isTouchScannerActive
                    ? 'bg-sky-500/20 text-sky-400 border-sky-400 animate-pulse'
                    : themeMode === 'bright'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <FingerprintIcon className="w-4 h-4 text-sky-400" />
                <span>{isTouchScannerActive ? t('Scanning Optical Sensor...') : t('Live Optical Pad')}</span>
              </button>
            </div>
          </div>

          {/* Quick Selectable Crime Scene Latent Evidence Samples */}
          <div className="mt-4">
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {t('Pre-Loaded Crime Scene Evidence Latent Samples (Click to test match/no match):')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
              {initialEvidenceSamples.map((sample) => {
                const isSelected = attachedPrint?.id === sample.id;
                const isUnknown = sample.targetSuspectId === null;

                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectEvidenceSample(sample)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500'
                        : themeMode === 'bright'
                        ? 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded leading-none ${
                        isUnknown
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isUnknown ? t('No Match Test') : t('Known Match')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {sample.qualityScore}% Q
                      </span>
                    </div>
                    <p className={`text-xs font-bold line-clamp-1 ${
                      isSelected ? 'text-yellow-500' : ''
                    }`}>
                      {sample.name}
                    </p>
                    <p className={`text-[10px] truncate mt-0.5 ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {sample.source}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workbench Center: Scanner Visualizer + Action + Result Panel */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 Cols: Attached Fingerprint Card */}
            <div className={`lg:col-span-4 rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all ${
              themeMode === 'bright' ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-slate-900/70 border-slate-800'
            }`}>
              <div className="flex items-center justify-between w-full mb-3 px-1">
                <span className="text-xs font-black uppercase tracking-wider text-yellow-500 flex items-center space-x-1.5">
                  <Fingerprint className="w-4 h-4" />
                  <span>{t('Attached Fingerprint')}</span>
                </span>
                {attachedPrint && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    themeMode === 'bright'
                      ? 'bg-blue-100 text-blue-900 border-blue-200'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {attachedPrint.patternHint}
                  </span>
                )}
              </div>

              {/* Fingerprint Visual Graphic */}
              {attachedPrint ? (
                <div className="my-2">
                  <FingerprintVisual
                    seedStr={attachedPrint.id}
                    patternType={attachedPrint.patternHint}
                    isScanning={isScanning}
                    isMatched={matchResult?.status === 'matched'}
                    isUnmatched={matchResult?.status === 'unmatched'}
                    imageUrl={attachedPrint.imageUrl}
                    size="lg"
                    themeMode={themeMode}
                  />
                </div>
              ) : (
                <div className={`h-64 w-48 rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center ${
                  themeMode === 'bright'
                    ? 'border-slate-300 bg-white/70 text-slate-700'
                    : 'border-slate-700 bg-slate-900/30 text-slate-400'
                }`}>
                  <Upload className={`w-8 h-8 mb-2 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                    No print attached
                  </p>
                  <p className={`text-[10px] mt-1 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-500'}`}>
                    Upload an image or pick a crime scene sample
                  </p>
                </div>
              )}

              {/* Attached Print Details */}
              {attachedPrint && (
                <div
                  id="attached-print-details-box"
                  className={`w-full mt-3 text-left space-y-1.5 p-3 rounded-xl border transition-all ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300/90 text-slate-900 shadow-xs ring-1 ring-slate-900/5'
                      : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-bold">
                    <span
                      className={`truncate pr-1 font-bold ${
                        themeMode === 'bright' ? 'text-slate-900' : 'text-white'
                      }`}
                      title={attachedPrint.name}
                    >
                      {attachedPrint.name}
                    </span>
                    <span
                      className={`text-[10px] shrink-0 font-mono font-bold px-1.5 py-0.5 rounded border ${
                        themeMode === 'bright'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {attachedPrint.qualityScore}% Quality
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate font-medium ${
                      themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    <span className={`font-semibold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                      Source:
                    </span>{' '}
                    {attachedPrint.source}
                  </p>
                  <p
                    className={`text-[11px] truncate font-medium ${
                      themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    <span className={`font-semibold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                      Captured:
                    </span>{' '}
                    {attachedPrint.capturedAt}
                  </p>
                </div>
              )}

              {/* Scan & Match Button */}
              <div className="w-full mt-4 space-y-2">
                <button
                  id="btn-scan-and-match-fingerprint"
                  onClick={handleRunScanAndMatch}
                  disabled={isScanning || !attachedPrint}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md ${
                    isScanning
                      ? 'bg-yellow-500/50 text-slate-950 cursor-wait'
                      : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 hover:shadow-yellow-500/20 active:scale-98'
                  }`}
                >
                  <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? t('Scanning & Comparing...') : t('Scan & Match Fingerprint')}</span>
                </button>

                {attachedPrint && (
                  <button
                    id="btn-clear-attached-print"
                    type="button"
                    onClick={() => {
                      setAttachedPrint(null);
                      setMatchResult(null);
                    }}
                    className={`w-full py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                      themeMode === 'bright'
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t('Clear Attached Print')}
                  </button>
                )}
              </div>
            </div>

            {/* Right 8 Cols: Scan Progress or Results */}
            <div className="lg:col-span-8 flex flex-col justify-center min-h-[360px]">
              {/* STATE 1: SCANNING IN PROGRESS */}
              {isScanning && (
                <div className={`p-8 rounded-xl border text-center space-y-4 ${
                  themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}>
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full border-4 border-t-yellow-500 border-r-transparent border-b-yellow-500 border-l-transparent animate-spin flex items-center justify-center">
                      <Fingerprint className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black tracking-wide">{t('AFIS Fingerprint Analysis in Progress')}</h3>
                    <p className="text-xs text-yellow-500 font-mono mt-1 animate-pulse">{scanStep}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-md mx-auto bg-slate-300 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-amber-400 h-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p>• Extracting Galton minutiae feature vectors</p>
                    <p>• Querying National Fingerprint Database (AFIS-IND)</p>
                    <p>• Calculating ridge angle orientation coherence</p>
                  </div>
                </div>
              )}

              {/* STATE 2: MATCH FOUND */}
              {!isScanning && matchResult?.status === 'matched' && matchResult.suspect && matchResult.fingerprintRecord && (
                <div className={`p-5 sm:p-6 rounded-xl border transition-all ${
                  themeMode === 'bright'
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-md'
                    : 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-500/10 shadow-lg'
                }`}>
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-emerald-500/30">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500 text-slate-950">
                        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          themeMode === 'bright' ? 'text-emerald-900' : 'text-emerald-400'
                        }`}>
                          {t('AFIS Biometric Verification Complete')}
                        </span>
                        <h3 className={`text-lg sm:text-xl font-black ${
                          themeMode === 'bright' ? 'text-emerald-950' : 'text-emerald-300'
                        }`}>
                          {t('MATCH FOUND')} — {t('Positive Suspect Identification')}
                        </h3>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-sm flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>{matchResult.confidenceScore}% {t('Confidence')}</span>
                    </div>
                  </div>

                  {/* Suspect Profile Card */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Suspect Photo & Badges */}
                    <div className="md:col-span-4 flex flex-col items-center sm:items-start space-y-2">
                      <div className="relative">
                        <img
                          src={matchResult.suspect.photoUrl}
                          alt={matchResult.suspect.fullName}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-emerald-500 shadow-md"
                        />
                        <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-600 text-white shadow-xs">
                          {matchResult.suspect.status}
                        </span>
                      </div>

                      <div className="text-center sm:text-left">
                        <h4 className="text-base sm:text-lg font-black tracking-tight text-black">
                          {matchResult.suspect.fullName}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-amber-100 text-amber-950 border-amber-300">
                            {matchResult.suspect.id}
                          </span>
                          <span className="text-[11px] font-bold text-black">
                            {matchResult.suspect.age} Yrs • {matchResult.suspect.gender}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Suspect Crime & Biometric Details */}
                    <div className="md:col-span-8 space-y-2 text-xs">
                      <div className="p-3.5 rounded-xl border-2 border-slate-300 bg-white text-black shadow-sm space-y-1.5 ring-1 ring-slate-900/5">
                        <p className="font-bold text-black">
                          <span className="font-black text-black">
                            Alleged Crime:{' '}
                          </span>
                          <span className="text-red-600 font-black">{matchResult.suspect.crime}</span>
                        </p>
                        <p className="truncate text-black font-semibold">
                          <span className="font-black text-black">
                            Address:{' '}
                          </span>
                          {matchResult.suspect.address}
                        </p>
                        <p className="text-[11px] font-mono truncate font-bold text-emerald-800">
                          <span className="font-black text-black">
                            Hash:{' '}
                          </span>
                          {matchResult.fingerprintRecord.biometricHash}
                        </p>
                      </div>

                      {/* Linked Cases */}
                      {matchResult.suspect.linkedCaseIds && matchResult.suspect.linkedCaseIds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-black text-black">
                            Linked Cases:
                          </span>
                          {matchResult.suspect.linkedCaseIds.map((cId) => {
                            const relatedCase = cases.find((c) => c.id === cId);
                            return (
                              <button
                                key={cId}
                                type="button"
                                onClick={() => relatedCase && onSelectCase && onSelectCase(relatedCase)}
                                className="px-2 py-1 rounded-md text-[10px] font-black border flex items-center space-x-1 cursor-pointer transition-colors bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
                              >
                                <FolderLock className="w-3 h-3" />
                                <span>{cId}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Side-by-side Biometric Comparison Snapshot */}
                      <div className="pt-2 flex items-center space-x-4 text-[11px]">
                        <div className="flex items-center space-x-1 font-black text-emerald-950">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Matched Minutiae: {matchResult.matchedPointsCount}/{matchResult.matchedPointsCount} pts</span>
                        </div>
                        <div className="flex items-center space-x-1 font-black text-emerald-950">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pattern: {matchResult.fingerprintRecord.patternType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 3: NO MATCH */}
              {!isScanning && matchResult?.status === 'unmatched' && (
                <div className={`p-6 rounded-xl border transition-all text-center space-y-4 ${
                  themeMode === 'bright'
                    ? 'bg-red-50/80 border-red-300 shadow-md'
                    : 'bg-red-950/20 border-red-500/40 shadow-red-500/10 shadow-lg'
                }`}>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                    <XCircle className="w-9 h-9 stroke-[2]" />
                  </div>

                  <div>
                    {/* EXACT REQUIRED TEXT DISPLAY: "No match" */}
                    <h3 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">
                      No match
                    </h3>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {t('No matching fingerprint found in active suspect repository')}
                    </p>
                    <p className={`text-xs max-w-lg mx-auto mt-2 leading-relaxed ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {t('The attached fingerprint pattern was checked against all')} {matchResult.checkedCount || suspects.length} {t('registered suspects. None of the biometric minutiae clusters matched the required correlation threshold (Minimum AFIS threshold: 75%).')}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 max-w-md mx-auto text-left text-xs space-y-1">
                    <p className="font-bold text-red-600 dark:text-red-400">• Evidence Action Recommended:</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      1. Log this latent print as an Unidentified Crime Scene Trace in the case evidence dossier.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      2. Re-scan with higher resolution or try alternative crime scene samples above.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => handleSelectEvidenceSample(initialEvidenceSamples[0])}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                    >
                      {t('Test with Known Matching Sample')}
                    </button>
                    <button
                      onClick={handleRunScanAndMatch}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                      {t('Re-Scan Current Print')}
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 4: READY / IDLE (NO SCAN RUN YET) */}
              {!isScanning && !matchResult && (
                <div className={`p-8 rounded-xl border text-center space-y-3 ${
                  themeMode === 'bright' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/30 border-slate-800/80'
                }`}>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500">
                    <Fingerprint className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {t('Ready to Scan & Cross-Reference Fingerprints')}
                    </h3>
                    <p className={`text-xs max-w-md mx-auto mt-1 ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {t('Click "Scan & Match Fingerprint" to run biometric analysis against all')} {suspects.length} {t('suspect fingerprint records.')}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                    <span className={`px-2.5 py-1 rounded-full border font-semibold ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-800 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      Algorithm: AFIS Ridge Flow v4.2
                    </span>
                    <span className={`px-2.5 py-1 rounded-full border font-semibold ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-800 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      Standard: ISO/IEC 19794-2 Minutiae
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: SUSPECT FINGERPRINT REPOSITORY (ALL AVAILABLE SUSPECTS) */}
        <div className={`rounded-2xl border p-5 sm:p-6 transition-all ${
          themeMode === 'bright'
            ? 'bg-white border-slate-300 shadow-md'
            : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-yellow-500" />
                <h2 className="text-base sm:text-lg font-black">
                  {t('Suspect Biometric Fingerprint Repository')}
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
                  {filteredSuspects.length} / {suspects.length} {t('Records')}
                </span>
              </div>
              <p className={`text-xs mt-1 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('Mock fingerprint biometric archives for all registered suspects in the Police Crime Matrix system.')}
              </p>
            </div>

            {/* Search & Pattern Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('Search suspect by name, ID, crime...')}
                  value={suspectSearch}
                  onChange={(e) => setSuspectSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border transition-colors ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-yellow-500'
                      : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-500'
                  }`}
                />
              </div>

              <select
                value={patternFilter}
                onChange={(e) => setPatternFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border transition-colors cursor-pointer ${
                  themeMode === 'bright'
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                <option value="all">{t('All Patterns')}</option>
                <option value="Whorl">Whorl Patterns</option>
                <option value="Loop">Loop Patterns</option>
                <option value="Arch">Arch Patterns</option>
              </select>
            </div>
          </div>

          {/* Grid of Suspects Mock Fingerprints */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredSuspects.map((suspect) => {
              const record = getSuspectFingerprint(suspect);
              const isCurrentlyAttached = attachedPrint?.targetSuspectId === suspect.id;

              return (
                <div
                  key={suspect.id}
                  className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-lg ${
                    isCurrentlyAttached
                      ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500'
                      : themeMode === 'bright'
                      ? 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header: Suspect Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={suspect.photoUrl}
                          alt={suspect.fullName}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-400/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate">{suspect.fullName}</p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-500 font-bold">
                              {suspect.id}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              suspect.status === 'Wanted'
                                ? 'bg-red-500/20 text-red-400'
                                : suspect.status === 'Under Arrest'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {suspect.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">
                        {record.finger.split(' ')[0]}
                      </span>
                    </div>

                    {/* Fingerprint Visual Display */}
                    <div className="flex justify-center my-3 py-2 bg-black/5 dark:bg-black/40 rounded-lg">
                      <FingerprintVisual
                        seedStr={suspect.id}
                        patternType={record.patternType}
                        minutiaePoints={record.minutiaePoints}
                        size="md"
                        themeMode={themeMode}
                      />
                    </div>

                    {/* Biometric Metadata */}
                    <div className="space-y-1 text-[11px] mb-3">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Pattern Type:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{record.patternType}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Ridge Count / Pts:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {record.ridgeCount} ridges • {record.minutiaeCount} pts
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Biometric Card ID:</span>
                        <span className="font-mono text-[10px] text-yellow-500 font-bold truncate max-w-[150px]">
                          {record.fingerprintId}
                        </span>
                      </div>
                      <div className="pt-1 text-slate-500 truncate text-[10px]">
                        Crime: <span className="text-slate-700 dark:text-slate-300 font-semibold">{suspect.crime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Load to Scanner & Inspect Biometric Card */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                    <button
                      onClick={() => handleLoadSuspectPrint(suspect)}
                      className="flex-1 py-2 px-2.5 rounded-lg text-xs font-black bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      title="Attach this suspect's print to the scanner for match testing"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>{t('Test in Scanner')}</span>
                    </button>

                    <button
                      onClick={() => setInspectingSuspect({ suspect, record })}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        themeMode === 'bright'
                          ? 'border-slate-300 hover:bg-slate-200 text-slate-700'
                          : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                      }`}
                      title="Inspect full biometric fingerprint dossier"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSuspects.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              No suspects found matching your search query.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: SUSPECT BIOMETRIC CARD & MINUTIAE DOSSIER */}
      {inspectingSuspect && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
            themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                  {t('Suspect Biometric Fingerprint Card')}
                </h3>
              </div>
              <button
                onClick={() => setInspectingSuspect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* Visual Fingerprint Graphic */}
                <div className="sm:col-span-5 flex justify-center">
                  <FingerprintVisual
                    seedStr={inspectingSuspect.suspect.id}
                    patternType={inspectingSuspect.record.patternType}
                    minutiaePoints={inspectingSuspect.record.minutiaePoints}
                    size="xl"
                    themeMode={themeMode}
                  />
                </div>

                {/* Biometric Analysis Details */}
                <div className="sm:col-span-7 space-y-3 text-xs">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <img
                      src={inspectingSuspect.suspect.photoUrl}
                      alt={inspectingSuspect.suspect.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-yellow-500"
                    />
                    <div>
                      <p className="font-black text-sm">{inspectingSuspect.suspect.fullName}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{inspectingSuspect.suspect.id} • {inspectingSuspect.suspect.status}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-500">Pattern Classification:</span>
                      <span className="font-bold">{inspectingSuspect.record.patternType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-500">Digit Assigned:</span>
                      <span className="font-bold">{inspectingSuspect.record.finger}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-500">Galton Minutiae Points:</span>
                      <span className="font-bold">{inspectingSuspect.record.minutiaeCount} detected points</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-500">Ridge Density:</span>
                      <span className="font-bold">{inspectingSuspect.record.ridgeCount} concentric ridges</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-slate-500">Cores & Deltas:</span>
                      <span className="font-bold">{inspectingSuspect.record.coreCount} Core, {inspectingSuspect.record.deltaCount} Deltas</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Sensor Quality Index:</span>
                      <span className="font-mono text-emerald-500 font-bold">{inspectingSuspect.record.qualityScore}% (ISO High-Grade)</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-black/5 dark:bg-black/40 border border-slate-300 dark:border-slate-800 font-mono text-[10px] break-all">
                    <span className="text-yellow-500 font-bold block mb-0.5">AFIS SHA-256 Biometric Hash:</span>
                    {inspectingSuspect.record.biometricHash}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-end space-x-2 ${
              themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <button
                onClick={() => {
                  handleLoadSuspectPrint(inspectingSuspect.suspect);
                  setInspectingSuspect(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-yellow-500 hover:bg-yellow-400 text-slate-950 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Scan className="w-4 h-4" />
                <span>{t('Load to Scanner & Test Match')}</span>
              </button>
              <button
                onClick={() => setInspectingSuspect(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  themeMode === 'bright' ? 'border-slate-300 hover:bg-slate-200 text-slate-800' : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
