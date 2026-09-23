import React, { useState, useRef } from 'react';
import { ScanLine, Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { FirChecklistState, sampleOcrPresets, initialFirState } from '../data/firChecklistDefaults';

interface DspFirOcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: 'dark' | 'bright';
  onScanSuccess: (extractedData: Partial<FirChecklistState>) => void;
}

export const DspFirOcrScannerModal: React.FC<DspFirOcrScannerModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onScanSuccess,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string>('preset-bank-heist');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const scanSteps = [
    'Initializing OCR Optical Engine & Layout Engine...',
    'Detecting NCRB IIF-I Document Header & Police Station seals...',
    'Extracting Acts & BNS, 2023 Statutory Penal Sections...',
    'Parsing Informant, Complainant, Victim & Accused Entities...',
    'Extracting Incident Chronology, Place of Occurrence & Narrative...',
    'Validating 18 Checklist Sections under BNSS Framework...',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const lower = file.name.toLowerCase();
    let matchedPreset = sampleOcrPresets[0];
    if (lower.includes('cyber') || lower.includes('fraud') || lower.includes('upi') || lower.includes('phish')) {
<<<<<<< HEAD
      matchedPreset = sampleOcrPresets.find((p) => p.id === 'preset-cyber-fraud') || sampleOcrPresets[0];
    } else if (lower.includes('theft') || lower.includes('burglary') || lower.includes('commercial') || lower.includes('shop')) {
      matchedPreset = sampleOcrPresets.find((p) => p.id === 'preset-burglary') || sampleOcrPresets[0];
=======
      matchedPreset = sampleOcrPresets.find((p) => p.id === 'preset-cyber-phishing') || sampleOcrPresets[0];
    } else if (lower.includes('bank') || lower.includes('heist') || lower.includes('vault')) {
      matchedPreset = sampleOcrPresets.find((p) => p.id === 'preset-bank-heist') || sampleOcrPresets[0];
    } else {
      // Default: Official Maharashtra Police FIR (Form No. 1): SBI ATM Robbery - Hinjawadi
      matchedPreset = sampleOcrPresets.find((p) => p.id === 'preset-hinjawadi-atm') || sampleOcrPresets[0];
>>>>>>> aa42170 (CrimeMtrix1)
    }
    setActivePresetId(matchedPreset.id);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      startOcrScan(reader.result as string, file.name, matchedPreset.id);
    };
    reader.readAsDataURL(file);
  };

  const startOcrScan = (_imgUrl: string, _fileName: string, presetIdToUse?: string) => {
    setIsScanning(true);
    setIsDone(false);
    setScanStep(0);

    const targetPresetId = presetIdToUse || activePresetId;

    // Step through scan animation
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep += 1;
      if (currentStep < scanSteps.length) {
        setScanStep(currentStep);
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setIsDone(true);

<<<<<<< HEAD
        // Auto-fill extracted data
        const preset = sampleOcrPresets.find((p) => p.id === targetPresetId) || sampleOcrPresets[0];
        const finalData: Partial<FirChecklistState> = {
          ...preset.extractedData,
          firNumber: `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          policeFirNo: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
=======
        // Auto-fill extracted data accurately matching the document
        const preset = sampleOcrPresets.find((p) => p.id === targetPresetId) || sampleOcrPresets[0];
        const finalData: Partial<FirChecklistState> = {
          ...preset.extractedData,
          firNumber: preset.extractedData.firNumber || `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
>>>>>>> aa42170 (CrimeMtrix1)
        };
        setTimeout(() => {
          onScanSuccess(finalData);
          onClose();
        }, 800);
      }
    }, 380);
  };

  const handleApplyPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const preset = sampleOcrPresets.find((p) => p.id === presetId) || sampleOcrPresets[0];
    setImageFileName(`${preset.name}.png`);
    // Sample placeholder image representation
    setSelectedImage('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600');
<<<<<<< HEAD
    startOcrScan('', preset.name);
=======
    startOcrScan('', preset.name, preset.id);
>>>>>>> aa42170 (CrimeMtrix1)
  };

  const handleConfirmAutoFill = () => {
    const preset = sampleOcrPresets.find((p) => p.id === activePresetId) || sampleOcrPresets[0];
    const finalData: Partial<FirChecklistState> = {
      ...preset.extractedData,
<<<<<<< HEAD
      firNumber: `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      policeFirNo: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
=======
      firNumber: preset.extractedData.firNumber || `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
>>>>>>> aa42170 (CrimeMtrix1)
    };
    onScanSuccess(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          themeMode === 'bright'
            ? 'bg-slate-50 text-slate-900 border-slate-300'
            : 'bg-slate-950 text-slate-100 border-yellow-500/40'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            themeMode === 'bright'
              ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-white border-amber-200 text-amber-950'
              : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-md">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">OCR SCANNER</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-yellow-300 border border-amber-500/30">
                  Document Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Upload scanned FIR / Complaint image to auto-fill all 18 checklist sections
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full cursor-pointer transition-colors ${
              themeMode === 'bright' ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all hover:scale-[1.005] ${
              themeMode === 'bright'
                ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50 text-slate-800'
                : 'border-yellow-500/40 bg-slate-900/50 hover:bg-slate-900 text-slate-200'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-yellow-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Click to Upload or Drag & Drop FIR Document
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Supports PNG, JPG, JPEG, WEBP, Scanned photocopies, Hand-written complaints
                </p>
              </div>
              {imageFileName && (
                <div className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 mt-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Selected: {imageFileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Demo Pre-scanned Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Or Select Sample Pre-Scanned Document
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sampleOcrPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activePresetId === preset.id
                      ? themeMode === 'bright'
                        ? 'border-amber-500 bg-amber-50 shadow-sm'
                        : 'border-yellow-500 bg-yellow-500/10 shadow-sm'
                      : themeMode === 'bright'
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 block w-fit mb-1.5">
                    {preset.crimeType}
                  </span>
                  <p className="text-xs font-bold leading-tight line-clamp-1">{preset.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Scanning Animation / Preview */}
          {selectedImage && (
            <div
              className={`relative rounded-xl border overflow-hidden p-3 ${
                themeMode === 'bright' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="relative h-44 w-full rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Scanned Document Preview"
                  className="w-full h-full object-cover opacity-60 filter contrast-125"
                />

                {/* Laser scan line */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce top-1/2" />
                )}

                {/* Status Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4 text-center">
                  {isScanning ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
                        <ScanLine className="w-4 h-4 animate-spin" />
                        <span>OCR Scanning in Progress...</span>
                      </div>
                      <p className="text-xs font-medium text-amber-200">
                        {scanSteps[scanStep]}
                      </p>
                    </div>
                  ) : isDone ? (
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>OCR Extraction Completed</span>
                      </div>
                      <p className="text-xs text-emerald-200">
                        All 18 NCRB/BNSS Information Checklist sections ready for auto-fill!
                      </p>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 text-xs text-slate-300">
                      <ImageIcon className="w-4 h-4" />
                      <span>Ready to scan document</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feature highlights */}
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              themeMode === 'bright'
                ? 'bg-blue-50/60 border-blue-200 text-blue-950'
                : 'bg-blue-950/30 border-blue-900/50 text-blue-200'
            }`}
          >
            <p className="font-bold flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>BNSS 2023 & NCRB IIF-I Intelligent Mapping</span>
            </p>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              The scanner reads text from printed official forms, FIR copies, or hand-written complaints and maps the data to 18 sections: Police Station Details, Applicable Acts & BNS Sections, Place of Occurrence, Complainant, Victim, Accused particulars, Witnesses, Chronological Narrative, Stolen Articles, Digital & Forensic Exhibits.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-end space-x-3 ${
            themeMode === 'bright' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/80'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              themeMode === 'bright' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmAutoFill}
            className="px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-fill 18 Sections into Form</span>
          </button>
        </div>
      </div>
    </div>
  );
};
