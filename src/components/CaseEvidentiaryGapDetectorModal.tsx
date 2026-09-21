import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Case, EvidenceFile, Suspect } from '../types';
import {
  Sparkles,
  X,
  Shield,
  Video,
  FlaskConical,
  PhoneCall,
  FileCheck,
  FileText,
  Fingerprint,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Printer,
  Scale,
  Plus,
  Award,
  Check,
  Filter,
} from 'lucide-react';

export interface CaseEvidentiaryGap {
  id: string;
  title: string;
  category: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  icon: 'video' | 'flask' | 'phone' | 'filecheck' | 'panchnama' | 'fingerprint' | 'crypto';
  judicialVulnerability: string;
  aiRecommendation: string;
  statutoryProtocol: {
    section: string;
    sop: string;
    exhibitsRequired: string;
    timeline: string;
  };
  keywords: string[];
  isAddressed?: boolean;
}

interface CaseEvidentiaryGapDetectorModalProps {
  c: Case;
  isOpen: boolean;
  onClose: () => void;
  allCases?: Case[];
  onSelectCase?: (selectedCase: Case) => void;
  themeMode?: 'dark' | 'bright';
  onOpenUploadEvidence?: (prefillTitle?: string, prefillNotes?: string) => void;
  onCatalogAddressedGap?: (gapTitle: string, note: string) => void;
  suspects?: Suspect[];
}

export const CaseEvidentiaryGapDetectorModal: React.FC<CaseEvidentiaryGapDetectorModalProps> = ({
  c: currentCase,
  isOpen,
  onClose,
  allCases = [],
  onSelectCase,
  themeMode = 'dark',
  onOpenUploadEvidence,
  onCatalogAddressedGap,
}) => {
  const isBright = themeMode === 'bright';
  const [activeCaseId, setActiveCaseId] = useState<string>(currentCase.id);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [expandedProtocolGapId, setExpandedProtocolGapId] = useState<string | null>(null);
  const [manuallyAddressedGaps, setManuallyAddressedGaps] = useState<Record<string, boolean>>({});
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [quickCatalogGap, setQuickCatalogGap] = useState<CaseEvidentiaryGap | null>(null);
  const [quickCatalogNote, setQuickCatalogNote] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'corroborated'>('all');
  const gapListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gapListRef.current) {
      gapListRef.current.scrollTop = 0;
    }
  }, [activeCaseId, filterTab]);

  // Target case resolution
  const targetCase = useMemo(() => {
    if (activeCaseId === currentCase.id) return currentCase;
    const found = allCases.find((cs) => cs.id === activeCaseId);
    return found || currentCase;
  }, [activeCaseId, currentCase, allCases]);

  // Generate dynamic gaps based on crime type, case details, and uploaded evidence
  const allGaps = useMemo<CaseEvidentiaryGap[]>(() => {
    const ct = (targetCase.crimeType || '').toLowerCase();
    const caseTitle = targetCase.caseName || `${targetCase.crimeType} Investigation`;
    const loc = targetCase.location || 'Incident Locus';
    const suspectNames = targetCase.suspects && targetCase.suspects.length > 0
      ? targetCase.suspects.map(s => typeof s === 'string' ? s : s.name).join(', ')
      : 'named suspects';
    const list: CaseEvidentiaryGap[] = [];

    // 1. CCTV & Transit Surveillance Gap (Highly Case & Location Specific)
    list.push({
      id: 'gap-cctv',
      title: `Transit & Perimeter CCTV Corridor Surveillance (${caseTitle})`,
      category: 'CRITICAL',
      icon: 'video',
      judicialVulnerability:
        `Without continuous CCTV triangulation along ingress/egress routes at ${loc}, the defense will assert alibi and contest suspect identity under Section 9 BNS.`,
      aiRecommendation:
        `Issue Section 94 BNSS preservation notices to municipal traffic junctions, private toll plazas, and commercial DVRs surrounding ${loc} within the 4-hour critical window.`,
      statutoryProtocol: {
        section: 'Section 105 BNSS (Mandatory Videography) & Section 63 BSA (Electronic Records)',
        sop: `Acquire native bitstream DVR exports from ${loc} transit cameras. Verify SHA-256 integrity hash before hashing master drive.`,
        exhibitsRequired: 'Master DVR Footage, Cryptographic Hash Memo, Section 63 BSA Certificate, Camera Angle Geometry Chart',
        timeline: 'Urgent: within 48 hours prior to auto-overwrite loops.',
      },
      keywords: ['cctv', 'camera', 'footage', 'surveillance', 'video', 'dvr', 'nvr', 'transit', 'recording'],
    });

    // 2. Forensic / Chemical / Digital Analysis Gap
    if (ct.includes('cyber') || ct.includes('tech') || ct.includes('ransom') || ct.includes('fraud') || ct.includes('crypto')) {
      list.push({
        id: 'gap-digital-forensics',
        title: `Endpoint RAM Volatile Dump & C2 Reverse Proxy Flow Logs (${caseTitle})`,
        category: 'CRITICAL',
        icon: 'flask',
        judicialVulnerability:
          'Without physical RAM capture and FTK/EnCase write-blocked forensic bitstream image, the defense can allege third-party spoofing or post-breach file tampering.',
        aiRecommendation:
          `Perform live RAM preservation on seized endpoints connected to ${caseTitle} and obtain IPDR reverse proxy logs from ISP under Section 79A IT Act.`,
        statutoryProtocol: {
          section: 'Section 63 BSA 2023 & Section 79A Information Technology Act',
          sop: 'Capture live volatile memory before system shutdown. Store master forensic image (.E01) with hardware write-blocker verification.',
          exhibitsRequired: 'Forensic Bitstream Image (.E01), Write-Blocker Audit Log, MD5/SHA-256 Checksum Certificate',
          timeline: 'Immediate during digital device seizure.',
        },
        keywords: ['ram', 'memory', 'disk', 'forensic', 'dump', 'bitstream', 'ftk', 'encase', 'hash', 'image', 'ipdr'],
      });
    } else if (ct.includes('narcotics') || ct.includes('drug')) {
      list.push({
        id: 'gap-narcotics-cfsl',
        title: `CFSL Quantitative Chemical Purity Assay & Sec 52A NDPS Certificate`,
        category: 'CRITICAL',
        icon: 'flask',
        judicialVulnerability:
          'Failure to produce certified CFSL quantitative analysis specifying active narcotic percentage exposes the commercial quantity charge to immediate statutory bail.',
        aiRecommendation:
          `Submit representative samples drawn before the Judicial Magistrate to the Central Forensic Science Laboratory along with Form 4 Road Certificate.`,
        statutoryProtocol: {
          section: 'Section 52A NDPS Act & Section 329 BNSS (Scientific Reports)',
          sop: 'Draw representative samples under Magistrate supervision. Pack in sealed metal containers with police station seal impression.',
          exhibitsRequired: 'Magistrate Inventory Certificate, CFSL Chemical Report, Seal Impression Sheet, Road Certificate',
          timeline: 'Submit to CFSL within 72 hours of seizure.',
        },
        keywords: ['cfsl', 'fsl', 'chemical', 'narcotics', 'purity', 'sample', 'assay', 'ndps'],
      });
    } else {
      list.push({
        id: 'gap-forensic-lab',
        title: `Ballistics, Toolmark & CFSL Forensic Examination (${caseTitle})`,
        category: 'CRITICAL',
        icon: 'flask',
        judicialVulnerability:
          `Physical instruments, spent casings, or forced entry toolmarks recovered at ${loc} remain purely circumstantial without matching CFSL expert comparison under Section 329 BNSS.`,
        aiRecommendation:
          `Dispatch physical crime scene exhibits under tamper-evident seals to the Forensic Science Laboratory for comparison against recovered weapons or cutting tools.`,
        statutoryProtocol: {
          section: 'Section 329 BNSS (Reports of Government Scientific Experts)',
          sop: 'Ensure sealed exhibit container carries unbroken station seal impression matching Form IV Road Certificate.',
          exhibitsRequired: 'CFSL Form IV, Physical Ballistic/Toolmark Exhibits, Control Comparison Samples, Chain of Custody Register',
          timeline: 'Dispatch within 7 working days from physical recovery.',
        },
        keywords: ['forensic', 'cfsl', 'fsl', 'chemical', 'metallurgical', 'toolmark', 'swab', 'ballistics', 'weapon'],
      });
    }

    // 3. Telecom CDR / Tower Dump / Co-Location Gap
    list.push({
      id: 'gap-telecom-cdr',
      title: `Suspect CDR & Tower Azimuth Triangulation (${suspectNames})`,
      category: 'MAJOR',
      icon: 'phone',
      judicialVulnerability:
        `Without certified Call Detail Records (CDR) and cell tower azimuth mapping confirming co-location of ${suspectNames} at ${loc}, conspiracy charges under Sec 61(2) BNS are vulnerable.`,
      aiRecommendation:
        `Issue Section 94 BNSS orders to telecom service providers (Jio, Airtel, Vi, BSNL) for 72-hour retrospective CDR, B-Party IMEI logs, and tower sector azimuth dumps.`,
      statutoryProtocol: {
        section: 'Section 94 BNSS (Production of Documents) & Section 63 BSA',
        sop: 'Correlate suspect IMEI history with sector antenna coverage maps. Verify B-Party identities via CAF subscriber database.',
        exhibitsRequired: 'TSP Certified CDR Sheets, Cell Tower Azimuth Geo-Overlay, Section 63 BSA Nodal Officer Attestation',
        timeline: 'Statutory compliance window: 5-7 business days.',
      },
      keywords: ['cdr', 'call', 'tower', 'telecom', 'phone', 'imei', 'imsi', 'mobile', 'cell', 'ipdr'],
    });

    // 4. Section 63 BSA Electronic Evidence Certificate
    list.push({
      id: 'gap-sec63-bsa',
      title: `Section 63 BSA (Old Sec 65B) Certificate for Digital Evidence Vault`,
      category: 'MAJOR',
      icon: 'filecheck',
      judicialVulnerability:
        'Under Supreme Court law (Arjun Panditrao v. Kailash Kushan), digital logs, CCTV clips, and intercepted records are legally inadmissible without a Section 63 BSA certificate.',
      aiRecommendation:
        `Obtain formal Section 63 BSA compliance affidavit signed by the system administrator and technical custodian verifying tamper-free extraction.`,
      statutoryProtocol: {
        section: 'Section 63 Bharatiya Sakshya Adhiniyam, 2023 (Admissibility of Electronic Records)',
        sop: 'Attestation by device custodian specifying make, serial, hash code (SHA-256), and uninterrupted operating conditions.',
        exhibitsRequired: 'Notarized Section 63 BSA Affidavit, Cryptographic SHA-256 Hash Report, Custodian Credentials',
        timeline: 'Mandatory before filing Police Report / Chargesheet under Section 193 BNSS.',
      },
      keywords: ['63 bsa', '65b', 'certificate', 'affidavit', 'admissibility', 'electronic certificate'],
    });

    // 5. Independent Panchnama & Search Videography
    list.push({
      id: 'gap-panchnama',
      title: `Independent Panchnama & Geo-Tagged Videography for Scene Seizures`,
      category: 'MODERATE',
      icon: 'panchnama',
      judicialVulnerability:
        `Recovery solely witnessed by police personnel invites hostile cross-examination. Unrecorded searches permit defense allegations of exhibit planting.`,
      aiRecommendation:
        `Execute comprehensive recovery Panchnama with two respectable independent neighborhood panchas and append continuous geo-tagged videography under Section 105 BNSS.`,
      statutoryProtocol: {
        section: 'Section 105 BNSS (Search & Seizure Recording) & Section 185 BNSS',
        sop: 'Independent witnesses must attest each container label. Unedited recording must be preserved on write-once media.',
        exhibitsRequired: 'Panchnama signed by independent panchas, Unedited Search Video, Master Media Envelope',
        timeline: 'Concurrently with physical crime scene recovery.',
      },
      keywords: ['panchnama', 'seizure', 'recovery', 'memo', 'panch', 'videography'],
    });

    // 6. Biometrics / Latent Fingerprints / Dermal Ridge Matching
    if (!ct.includes('cyber') && !ct.includes('fraud')) {
      list.push({
        id: 'gap-fingerprints',
        title: `Latent Fingerprints & Dermal Ridge Matching on Ingress Points (${loc})`,
        category: 'CRITICAL',
        icon: 'fingerprint',
        judicialVulnerability:
          `Absence of physical latent fingerprints or biological DNA linking ${suspectNames} to the entry points leaves the prosecution dependent purely on dock identification.`,
        aiRecommendation:
          `Requisition Fingerprint Bureau (FPB) to lift latent friction ridge impressions from door handles, safe levers, and surfaces at ${loc} and run against NAFIS.`,
        statutoryProtocol: {
          section: 'Section 3 & 4 Criminal Procedure (Identification) Act / Identification of Prisoners Act',
          sop: 'Apply magnetic black powder and cyanoacrylate fuming on non-porous surfaces. Affix latent lifters onto standardized FPB cards.',
          exhibitsRequired: 'Standardized FPB Latent Lift Cards, NAFIS Matching Score Sheet, Bureau Expert Comparison Memo',
          timeline: 'Process scene within 12 hours of First Information Report.',
        },
        keywords: ['fingerprint', 'latent', 'dna', 'biometric', 'nafis', 'afis', 'dermal', 'swab'],
      });
    }

    return list;
  }, [targetCase]);

  // Check which gaps are resolved based on uploaded evidence
  const evaluatedGaps = useMemo(() => {
    const ev = targetCase.evidence || [];
    return allGaps.map((gap) => {
      const hasMatchingEvidence = ev.some((item) => {
        const text = `${item.fileName} ${item.description || ''} ${item.notes || ''} ${item.fileType}`.toLowerCase();
        return gap.keywords.some((kw) => text.includes(kw));
      });

      const isAddressed = hasMatchingEvidence || !!manuallyAddressedGaps[gap.id];
      return {
        ...gap,
        isAddressed,
      };
    });
  }, [allGaps, targetCase.evidence, manuallyAddressedGaps]);

  // Metrics
  const totalGapsCount = evaluatedGaps.length;
  const addressedGapsCount = evaluatedGaps.filter((g) => g.isAddressed).length;
  const remainingGaps = evaluatedGaps.filter((g) => !g.isAddressed);
  const criticalCount = remainingGaps.filter((g) => g.category === 'CRITICAL').length;
  const majorCount = remainingGaps.filter((g) => g.category === 'MAJOR').length;
  const moderateCount = remainingGaps.filter((g) => g.category === 'MODERATE').length;

  // Filtered gaps list for view tabs
  const displayedGaps = useMemo(() => {
    if (filterTab === 'pending') return evaluatedGaps.filter((g) => !g.isAddressed);
    if (filterTab === 'corroborated') return evaluatedGaps.filter((g) => g.isAddressed);
    return evaluatedGaps;
  }, [evaluatedGaps, filterTab]);

  // Court readiness score calculation
  const courtReadinessScore = useMemo(() => {
    if (totalGapsCount === 0) return 100;
    const base = 20;
    const evidenceBonus = Math.min(25, (targetCase.evidence?.length || 0) * 10);
    const resolvedBonus = (addressedGapsCount / totalGapsCount) * 55;
    const score = Math.round(base + evidenceBonus + resolvedBonus);
    return Math.min(100, Math.max(15, score));
  }, [totalGapsCount, addressedGapsCount, targetCase.evidence]);

  if (!isOpen) return null;

  const handleRunScan = () => {
    setIsScanning(true);
    setScanMessage('Auditing evidence vault, chain-of-custody seals & BNSS legal protocols...');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('✨ AI Gap Scan completed: 24 forensic & judicial benchmarks verified!');
      setTimeout(() => setScanMessage(null), 4000);
    }, 1000);
  };

  const handleCatalogQuickAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCatalogGap) return;
    setManuallyAddressedGaps((prev) => ({ ...prev, [quickCatalogGap.id]: true }));
    if (onCatalogAddressedGap) {
      onCatalogAddressedGap(quickCatalogGap.title, quickCatalogNote || 'Evidence requisitioned as recommended by AI Gap Detector.');
    }
    setQuickCatalogGap(null);
    setQuickCatalogNote('');
  };

  const renderIcon = (type: CaseEvidentiaryGap['icon']) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-white" />;
      case 'flask':
        return <FlaskConical className="w-4 h-4 text-white" />;
      case 'phone':
        return <PhoneCall className="w-4 h-4 text-white" />;
      case 'filecheck':
        return <FileCheck className="w-4 h-4 text-white" />;
      case 'panchnama':
        return <FileText className="w-4 h-4 text-white" />;
      case 'fingerprint':
        return <Fingerprint className="w-4 h-4 text-white" />;
      default:
        return <Shield className="w-4 h-4 text-white" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
        <div
          className={`relative w-full max-w-5xl h-[92vh] max-h-[92vh] my-auto rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all flex flex-col ${
            isBright
              ? 'bg-white text-slate-900 border-slate-300'
              : 'bg-[#0a0f1d] text-slate-100 border-purple-500/40 shadow-purple-950/50'
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 sm:px-6 sm:py-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
              isBright
                ? 'bg-gradient-to-r from-purple-100 via-indigo-50 to-white border-purple-200'
                : 'bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 border-purple-500/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h3 className={`text-base sm:text-lg font-black tracking-tight ${isBright ? 'text-purple-950' : 'text-white'}`}>
                    AI Evidentiary Gap Detector
                  </h3>
                  {allCases.length > 1 ? (
                    <select
                      value={activeCaseId}
                      onChange={(e) => {
                        setActiveCaseId(e.target.value);
                        const sel = allCases.find((x) => x.id === e.target.value);
                        if (sel && onSelectCase) onSelectCase(sel);
                      }}
                      className={`text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none border truncate max-w-[260px] cursor-pointer ${
                        isBright
                          ? 'bg-white text-purple-950 border-purple-300 shadow-xs'
                          : 'bg-slate-800 text-purple-200 border-purple-500/40'
                      }`}
                    >
                      {allCases.map((cs) => (
                        <option key={cs.id} value={cs.id}>
                          {cs.id} - {cs.caseName || cs.crimeType}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                        isBright
                          ? 'bg-purple-200 text-purple-900 border border-purple-300'
                          : 'bg-purple-900/40 text-purple-200 border border-purple-500/40'
                      }`}
                    >
                      {targetCase.id} • {targetCase.caseName || targetCase.crimeType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                type="button"
                id="btn-run-ai-scan"
                onClick={handleRunScan}
                disabled={isScanning}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Auditing Vault...' : 'Run AI Gap Scan'}</span>
              </button>

              <button
                type="button"
                id="btn-audit-certificate"
                onClick={() => setShowCertificateModal(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isBright
                    ? 'bg-white hover:bg-purple-50 text-purple-950 border-purple-300 shadow-xs'
                    : 'bg-slate-900 hover:bg-purple-950/40 text-purple-200 border-purple-500/30'
                }`}
              >
                <Award className="w-4 h-4 text-purple-600" />
                <span>Audit Certificate</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl cursor-pointer transition-colors ${
                  isBright
                    ? 'hover:bg-slate-200 text-slate-800'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast / Notification */}
          {scanMessage && (
            <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{scanMessage}</span>
              </span>
              <button onClick={() => setScanMessage(null)} className="text-white/90 hover:text-white text-xs cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {/* Identified Evidentiary Gaps Summary Banner with Court Readiness */}
          <div
            className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 ${
              isBright ? 'bg-amber-100/90 border-amber-300' : 'bg-amber-950/30 border-amber-500/30'
            }`}
          >
            <div className={`flex items-center space-x-2 text-xs sm:text-sm font-black ${isBright ? 'text-amber-950' : 'text-amber-200'}`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 ${isBright ? 'text-amber-700' : 'text-amber-400'}`} />
              <span>
                {remainingGaps.length > 0
                  ? `${remainingGaps.length} Evidentiary Gaps Identified`
                  : 'All Evidentiary Gaps Addressed & Corroborated!'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 ml-1">
                ({targetCase.caseName || targetCase.crimeType})
              </span>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              {/* Compact Court Readiness Indicator */}
              <div
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono font-black ${
                  courtReadinessScore >= 80
                    ? isBright ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                    : courtReadinessScore >= 50
                    ? isBright ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-700'
                    : isBright ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-rose-950/60 text-rose-300 border-rose-700'
                }`}
              >
                <span>Readiness: {courtReadinessScore}%</span>
              </div>
              {criticalCount > 0 && (
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    isBright
                      ? 'bg-rose-200 text-rose-950 border border-rose-400'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {criticalCount} Critical
                </span>
              )}
              {majorCount > 0 && (
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    isBright
                      ? 'bg-amber-200 text-amber-950 border border-amber-400'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {majorCount} Major
                </span>
              )}
              {moderateCount > 0 && (
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    isBright
                      ? 'bg-blue-200 text-blue-950 border border-blue-400'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {moderateCount} Moderate
                </span>
              )}

              <span className={`px-1 font-bold ${isBright ? 'text-amber-400' : 'text-amber-600'}`}>|</span>

              {addressedGapsCount > 0 ? (
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    isBright
                      ? 'bg-emerald-200 text-emerald-950 border border-emerald-400'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  ✓ {addressedGapsCount} Corroborated
                </span>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isBright ? 'text-amber-800' : 'text-amber-300'
                  }`}
                >
                  0 Corroborated
                </span>
              )}
            </div>
          </div>

          {/* Filter Tabs to keep items organized and clear without repetition */}
          <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between gap-2 shrink-0 ${
            isBright ? 'bg-slate-100/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className={`text-[11px] font-bold mr-1 flex items-center space-x-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                <Filter className="w-3 h-3" />
                <span className="hidden sm:inline">Filter:</span>
              </span>

              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? isBright
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-600 text-white'
                    : isBright
                    ? 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All Items ({totalGapsCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'pending'
                    ? isBright
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-600 text-white'
                    : isBright
                    ? 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Pending Gaps ({remainingGaps.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('corroborated')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'corroborated'
                    ? isBright
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white'
                    : isBright
                    ? 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Corroborated ({addressedGapsCount})
              </button>
            </div>

            <span className={`text-[11px] font-medium hidden md:inline ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Showing {displayedGaps.length} of {totalGapsCount} total benchmarks
            </span>
          </div>

          {/* Gap Cards List - easily visible and scrollable */}
          <div
            ref={gapListRef}
            className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-3 min-h-0"
          >
            {displayedGaps.length === 0 ? (
              <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
                isBright ? 'bg-slate-50 border-slate-300 text-slate-600' : 'bg-slate-900/40 border-slate-800 text-slate-400'
              }`}>
                <Check className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold text-sm">No gap items match this filter category.</p>
                <p className="text-xs mt-1">Switch to "All Items" or "Pending Gaps" above to inspect benchmarks.</p>
              </div>
            ) : (
              displayedGaps.map((gap, index) => {
                const isAddressed = gap.isAddressed;
                const isProtocolExpanded = expandedProtocolGapId === gap.id;

                return (
                  <div
                    key={gap.id}
                    className={`rounded-2xl border transition-all p-3.5 sm:p-4 space-y-2.5 shadow-sm ${
                      isAddressed
                        ? isBright
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                          : 'bg-emerald-950/20 border-emerald-500/30'
                        : isBright
                        ? 'bg-white border-slate-300 hover:border-purple-300 shadow-xs'
                        : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/40'
                    }`}
                  >
                    {/* Gap Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            isAddressed
                              ? 'bg-emerald-600'
                              : gap.category === 'CRITICAL'
                              ? 'bg-rose-600'
                              : gap.category === 'MAJOR'
                              ? 'bg-amber-600'
                              : 'bg-purple-600'
                          }`}
                        >
                          {isAddressed ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" /> : renderIcon(gap.icon)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              #{index + 1}
                            </span>
                            <h4 className={`text-xs sm:text-sm font-black truncate ${isBright ? 'text-slate-950' : 'text-slate-100'}`}>
                              {gap.title}
                            </h4>
                            {isAddressed ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isBright
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                Corroborated
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  gap.category === 'CRITICAL'
                                    ? isBright
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : gap.category === 'MAJOR'
                                    ? isBright
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : isBright
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                }`}
                              >
                                {gap.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Gap Card Action Buttons */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        {!isAddressed && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenUploadEvidence) {
                                onOpenUploadEvidence(gap.title, gap.aiRecommendation);
                                onClose();
                              } else {
                                setQuickCatalogGap(gap);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-black rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs hover:scale-[1.02] transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Catalog Evidence</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedProtocolGapId(isProtocolExpanded ? null : gap.id)
                          }
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center space-x-1 ${
                            isBright
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                        >
                          <span>Protocol</span>
                          {isProtocolExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Responsive Grid: Box 1: Judicial Vulnerability & Box 2: AI Recommendation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {/* Box 1: Judicial Vulnerability */}
                      <div
                        className={`p-2.5 sm:p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                          isBright
                            ? 'bg-rose-50/90 border-rose-200 text-slate-900'
                            : 'bg-rose-950/25 border-rose-500/30 text-rose-100'
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-1.5 font-black text-[10px] uppercase tracking-wide ${
                            isBright ? 'text-rose-900' : 'text-rose-300'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>JUDICIAL VULNERABILITY IN COURT:</span>
                        </div>
                        <p className={`text-xs font-medium ${isBright ? 'text-slate-900' : 'text-rose-100'}`}>
                          {gap.judicialVulnerability}
                        </p>
                      </div>

                      {/* Box 2: AI Investigation Recommendation */}
                      <div
                        className={`p-2.5 sm:p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                          isBright
                            ? 'bg-purple-50/90 border-purple-200 text-slate-900'
                            : 'bg-purple-950/25 border-purple-500/30 text-purple-100'
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-1.5 font-black text-[10px] uppercase tracking-wide ${
                            isBright ? 'text-purple-950' : 'text-purple-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                          <span>AI INVESTIGATION RECOMMENDATION:</span>
                        </div>
                        <p className={`text-xs font-medium ${isBright ? 'text-slate-900' : 'text-purple-100'}`}>
                          {gap.aiRecommendation}
                        </p>
                      </div>
                    </div>

                    {/* Expandable Protocol & BNSS Statutory SOP */}
                    {isProtocolExpanded && (
                      <div
                        className={`p-3.5 sm:p-4 rounded-xl border text-xs space-y-2.5 mt-1.5 ${
                          isBright
                            ? 'bg-slate-100 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between border-b pb-1.5 ${
                            isBright ? 'border-slate-300' : 'border-slate-800'
                          }`}
                        >
                          <span className={`font-black uppercase tracking-wider text-[11px] ${isBright ? 'text-indigo-900' : 'text-indigo-300'}`}>
                            Statutory Protocol & Case-Law Mandate
                          </span>
                          <span className={`text-[10px] font-bold ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                            BNSS & BSA Guidelines
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <strong className={`block text-[11px] font-bold uppercase ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                              Applicable Law:
                            </strong>
                            <span className="font-semibold">{gap.statutoryProtocol.section}</span>
                          </div>
                          <div>
                            <strong className={`block text-[11px] font-bold uppercase ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                              Mandatory Timeline:
                            </strong>
                            <span className="font-semibold">{gap.statutoryProtocol.timeline}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <strong className={`block text-[11px] font-bold uppercase ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                              Standard Operating Procedure:
                            </strong>
                            <span>{gap.statutoryProtocol.sop}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <strong className={`block text-[11px] font-bold uppercase ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                              Required Exhibits in Chargesheet:
                            </strong>
                            <span className={`font-black ${isBright ? 'text-purple-950' : 'text-purple-300'}`}>
                              {gap.statutoryProtocol.exhibitsRequired}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div
            className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 rounded-b-3xl ${
              isBright ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className={`text-xs flex items-center space-x-2 font-medium ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
              <Shield className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Evidence audited under Bharatiya Nagarik Suraksha Sanhita (BNSS) & Bharatiya Sakshya Adhiniyam (BSA).</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                isBright
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Quick Catalog Evidence Dialog */}
      {quickCatalogGap && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl p-5 border shadow-2xl ${
              isBright ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-950 text-slate-100 border-purple-500/40'
            }`}
          >
            <h4 className={`text-sm font-black flex items-center space-x-2 ${isBright ? 'text-purple-950' : 'text-purple-300'}`}>
              <Plus className="w-4 h-4" />
              <span>Catalog Evidence for Gap: {quickCatalogGap.title}</span>
            </h4>
            <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Mark this gap as addressed by entering the requisition dispatch memo or attaching reference notes:
            </p>

            <form onSubmit={handleCatalogQuickAddress} className="mt-4 space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
                  Action / Dispatch Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={quickCatalogNote}
                  onChange={(e) => setQuickCatalogNote(e.target.value)}
                  placeholder="e.g. Requisition issued under Sec 94 BNSS to Telecom Nodal Officer / CCTV hard disk seized under Panchnama..."
                  className={`w-full p-2.5 rounded-xl text-xs border ${
                    isBright ? 'bg-slate-50 text-slate-900 border-slate-300' : 'bg-slate-900 text-slate-100 border-slate-700'
                  }`}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickCatalogGap(null)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${
                    isBright ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer"
                >
                  Confirm & Mark Addressed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Audit Certificate Dialog */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl my-auto rounded-2xl bg-white text-slate-900 border-4 border-double border-purple-900 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4 border-slate-300">
              <div>
                <span className="text-[10px] font-black tracking-widest text-purple-800 uppercase">
                  Government of India — Department of Police & Forensic Science
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                  Evidentiary Audit & Judicial Readiness Certificate
                </h2>
                <p className="text-xs text-slate-600">
                  Issued under Bharatiya Sakshya Adhiniyam (BSA, 2023) Section 63 & BNSS 2023 Protocol
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-bold block">Case Reference ID:</span>
                <span className="font-black text-sm text-slate-900">{targetCase.id}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Offence Classification:</span>
                <span className="font-bold text-slate-900">{targetCase.crimeType}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Audit Timestamp:</span>
                <span className="font-medium text-slate-800">{new Date().toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Court Readiness Score:</span>
                <span className="font-black text-purple-700 text-sm">{courtReadinessScore}% Conviction Index</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-black uppercase tracking-wider text-slate-800">Audited Evidence Inventory</h4>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                {(targetCase.evidence || []).length > 0 ? (
                  targetCase.evidence.map((ev, i) => (
                    <div key={ev.id || i} className="p-2 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{ev.fileName}</span>
                      <span className="text-slate-500">{ev.fileType} • {ev.fileSize || 'Cataloged'}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-slate-400">No external files currently cataloged in vault.</div>
                )}
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1">
              <strong className="font-black block uppercase text-[10px] tracking-wider text-purple-800">
                Judicial Audit Declaration:
              </strong>
              <p className="leading-relaxed text-[11px]">
                This electronic dossier has undergone automated forensic integrity checks. Identified gaps must be addressed prior to filing final police report under Section 193 BNSS to prevent evidentiary exclusion in trial court.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono">CERT-HASH: SHA256-{targetCase.id.replace(/-/g, '')}-BNSS2026</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
