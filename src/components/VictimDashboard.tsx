import React, { useState, useEffect } from 'react';
import { Case, User } from '../types';
import { 
  Shield, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  Users, 
  FileText, 
  Upload, 
  ArrowRight, 
  Eye, 
  AlertCircle, 
  Sparkles, 
  Scale, 
  ShieldCheck, 
  Hourglass,
  CalendarCheck,
  Edit3
} from 'lucide-react';
import { getHearingCountdown, formatHearingDateTime, HearingCountdownResult } from '../utils/courtHearingUtils';
import { CourtHearingModal } from './CourtHearingModal';
import { isUserAssignedToCase } from '../utils/caseUtils';
import { useLanguage } from '../context/LanguageContext';

interface VictimDashboardProps {
  currentUser: User;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  themeMode?: 'dark' | 'bright';
  onUpdateCourtHearing?: (
    caseId: string,
    data: {
      courtHearingDate: string;
      courtHearingLocation: string;
      courtHearingNotes: string;
    }
  ) => void;
  onOpenRegisterComplaint?: () => void;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({
  currentUser,
  cases,
  onSelectCase,
  themeMode = 'bright',
  onUpdateCourtHearing,
  onOpenRegisterComplaint,
}) => {
  const { t, isHindi } = useLanguage();

  // Victims have limited access to ONLY their own case(s)
  const myCases = cases.filter((c) => isUserAssignedToCase(currentUser, c));

  // Default to first case if available
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    return myCases.length > 0 ? myCases[0].id : '';
  });

  // Modal for setting/updating court hearing
  const [showHearingModal, setShowHearingModal] = useState(false);

  // Active case object
  const activeCase = myCases.find((c) => c.id === selectedCaseId) || myCases[0] || null;

  // Real-time ticking countdown
  const [countdown, setCountdown] = useState<HearingCountdownResult | null>(() => {
    return activeCase ? getHearingCountdown(activeCase.courtHearingDate) : null;
  });

  useEffect(() => {
    if (!activeCase?.courtHearingDate) {
      setCountdown(null);
      return;
    }

    const updateTimer = () => {
      setCountdown(getHearingCountdown(activeCase.courtHearingDate));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeCase?.courtHearingDate]);

  // Load progress steps for active case from localStorage
  const [progressData, setProgressData] = useState<{ percentage: number; steps: { label: string; completed: boolean }[] }>({
    percentage: 30,
    steps: [
      { label: 'Complaint / FIR Registered', completed: true },
      { label: 'Crime Scene Examination', completed: true },
      { label: 'Evidence Collected & Documented', completed: true },
      { label: 'Witness Statements Recorded', completed: false },
      { label: 'Suspect(s) Interrogation', completed: false },
      { label: 'Forensic Lab Reports Received', completed: false },
      { label: 'Chargesheet & Court Presentation Submission', completed: false },
    ],
  });

  useEffect(() => {
    if (!activeCase) return;

    try {
      const saved = localStorage.getItem(`investigation_progress_${activeCase.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const completedCount = parsed.filter((p) => p.completed).length;
          const pct = Math.round((completedCount / parsed.length) * 100);
          setProgressData({
            percentage: pct,
            steps: parsed,
          });
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default calculation based on status
    const isSolved = activeCase.status === 'Solved';
    const isUnderInv = activeCase.status === 'Under Investigation';
    const defSteps = [
      { label: 'Complaint / FIR Registered', completed: true },
      { label: 'Crime Scene Examination', completed: true },
      { label: 'Evidence Collected & Documented', completed: activeCase.evidence.length > 0 || isSolved },
      { label: 'Witness Statements Recorded', completed: isSolved || isUnderInv },
      { label: 'Suspect(s) Interrogation', completed: isSolved },
      { label: 'Forensic Lab Reports Received', completed: isSolved },
      { label: 'Chargesheet & Court Presentation Submission', completed: isSolved },
    ];
    const completedCount = defSteps.filter((p) => p.completed).length;
    const pct = Math.round((completedCount / defSteps.length) * 100);
    setProgressData({
      percentage: pct,
      steps: defSteps,
    });
  }, [activeCase]);

  const handleSaveHearing = (
    caseId: string,
    data: {
      courtHearingDate: string;
      courtHearingLocation: string;
      courtHearingNotes: string;
    }
  ) => {
    if (onUpdateCourtHearing) {
      onUpdateCourtHearing(caseId, data);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border transition-all ${
          themeMode === 'bright'
            ? 'bg-gradient-to-r from-amber-50 via-white to-sky-50 border-2 border-amber-200/80 shadow-md text-slate-900'
            : 'bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border-yellow-500/20 shadow-xl text-slate-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  themeMode === 'bright'
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                }`}
              >
                ⚖️ {t('Citizen & Victim Transparency Portal')}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  themeMode === 'bright' ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {t('Limited Case Access')}
              </span>
            </div>
            <h1
              className={`text-xl sm:text-2xl md:text-3xl font-black leading-tight flex items-center ${
                themeMode === 'bright' ? 'text-amber-950' : 'text-yellow-400'
              }`}
            >
              <Scale className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-amber-500 shrink-0" />
              <span>{t('Welcome')}, {currentUser.fullName}</span>
            </h1>
            <p
              className={`text-xs sm:text-sm mt-1 max-w-3xl font-semibold leading-relaxed ${
                themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              {t('This portal provides you with direct transparency into the active progress of your case, the assigned police investigation team, and upcoming Court Hearing deadlines.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenRegisterComplaint && (
              <button
                type="button"
                onClick={onOpenRegisterComplaint}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md flex items-center space-x-2 cursor-pointer shrink-0 bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>{t('Register New Complaint')}</span>
              </button>
            )}

            {/* Quick Case Switcher (if victim is linked to more than 1 case) */}
            {myCases.length > 1 && (
              <div className="shrink-0">
                <label
                  className={`block text-[10px] font-extrabold uppercase mb-1 ${
                    themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {t('Select Your Registered Case:')}
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                >
                  {myCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.caseName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {myCases.length === 0 ? (
        <div
          className={`p-10 rounded-2xl border border-dashed text-center space-y-3 max-w-xl mx-auto my-8 ${
            themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}
        >
          <Scale className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold">{t('No Active Case Linked')}</h3>
          <p className="text-xs text-slate-500">
            {t('No registered police case was found matching your account. Once an Investigator or SHO/Inspector logs a case with your name as the complainant/victim, it will appear here with full transparency.')}
          </p>
          {onOpenRegisterComplaint && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenRegisterComplaint}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 inline-flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>{t('Register Complaint / File e-FIR')}</span>
              </button>
            </div>
          )}
        </div>
      ) : activeCase ? (
        <div className="space-y-6">
          {/* TOP SECTION: Court Hearing Countdown & Deadline Banner */}
          <div
            className={`p-5 sm:p-7 rounded-2xl border transition-all ${
              themeMode === 'bright'
                ? 'bg-white border-2 border-amber-300/80 shadow-md text-slate-900'
                : 'bg-slate-900/90 border-yellow-500/30 shadow-xl text-slate-100'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b pb-5 border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                    <CalendarCheck className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      {t('Official Judicial Target Deadline')}
                    </span>
                    <h2
                      className={`text-lg sm:text-2xl font-black ${
                        themeMode === 'bright' ? 'text-amber-950' : 'text-yellow-400'
                      }`}
                    >
                      {t('Next Court Hearing & Case Release Schedule')}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Action Button: Set / Update Court Hearing */}
              <button
                type="button"
                onClick={() => setShowHearingModal(true)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center space-x-2 cursor-pointer shrink-0 ${
                  themeMode === 'bright'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-yellow-500/20'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{activeCase.courtHearingDate ? t('Update Court Hearing Date') : t('Set Court Hearing Date')}</span>
              </button>
            </div>

            {/* Countdown Display Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">
              {/* Box 1: Scheduled Date & Time */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  themeMode === 'bright' ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block mb-1">
                    {t('Scheduled Hearing Date & Time')}
                  </span>
                  <div className="text-base sm:text-lg font-black flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-amber-500 shrink-0" />
                    <span>{formatHearingDateTime(activeCase.courtHearingDate)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-700 text-xs font-semibold flex items-start">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0 mt-0.5" />
                  <span className="truncate">{activeCase.courtHearingLocation || t('Sessions Court, Metro Judicial Complex')}</span>
                </div>
              </div>

              {/* Box 2: Live Countdown Timer */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  countdown?.urgency === 'critical'
                    ? themeMode === 'bright'
                      ? 'bg-red-50 border-red-300 text-red-950'
                      : 'bg-red-950/40 border-red-500/40 text-red-200'
                    : countdown?.urgency === 'warning'
                    ? themeMode === 'bright'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : themeMode === 'bright'
                    ? 'bg-sky-50 border-sky-200 text-sky-950'
                    : 'bg-blue-950/30 border-blue-500/30 text-blue-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                      Countdown to Court Hearing
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        countdown?.isPast
                          ? 'bg-slate-700 text-slate-300'
                          : countdown?.urgency === 'critical'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {countdown?.formattedShort || 'Scheduled'}
                    </span>
                  </div>

                  {/* Visual Digital Countdown Blocks */}
                  {countdown && !countdown.isPast ? (
                    <div className="grid grid-cols-4 gap-1.5 mt-2 text-center">
                      <div className="p-1.5 rounded-lg bg-black/10 dark:bg-black/40">
                        <span className="text-base sm:text-lg font-black block leading-none">{countdown.days}</span>
                        <span className="text-[9px] uppercase font-bold opacity-75">Days</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/10 dark:bg-black/40">
                        <span className="text-base sm:text-lg font-black block leading-none">{countdown.hours}</span>
                        <span className="text-[9px] uppercase font-bold opacity-75">Hours</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/10 dark:bg-black/40">
                        <span className="text-base sm:text-lg font-black block leading-none">{countdown.minutes}</span>
                        <span className="text-[9px] uppercase font-bold opacity-75">Mins</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/10 dark:bg-black/40">
                        <span className="text-base sm:text-lg font-black block leading-none text-amber-500">{countdown.seconds}</span>
                        <span className="text-[9px] uppercase font-bold opacity-75">Secs</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-bold mt-2 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
                      <span>{countdown?.formattedFull || 'No active countdown'}</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] font-semibold mt-2.5 opacity-90">
                  Target completion time for all investigation milestones.
                </p>
              </div>

              {/* Box 3: Work Target & Evidence Presentation Notes */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700'
                }`}
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Police Investigation Action Target
                  </span>
                  <p className="text-xs font-semibold leading-relaxed line-clamp-3">
                    {activeCase.courtHearingNotes ||
                      'Police team must complete forensic reviews, witness testimonies, and submit final chargesheet before this hearing.'}
                  </p>
                </div>

                {activeCase.courtHearingUpdatedBy && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span className="truncate">By: {activeCase.courtHearingUpdatedBy}</span>
                    {activeCase.courtHearingUpdatedAt && <span>{activeCase.courtHearingUpdatedAt}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MAIN GRID: Left (Progress Tracker) & Right (Team & Dossier Quick Info) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Case Progress Tracker */}
            <div
              className={`lg:col-span-2 p-5 sm:p-6 rounded-2xl border space-y-5 ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-slate-300 shadow-sm text-slate-900'
                  : 'bg-slate-900/80 border-blue-900/50 shadow-lg text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-yellow-400">
                    Real-time Investigation Status
                  </span>
                  <h3 className="text-base sm:text-lg font-black flex items-center mt-0.5">
                    <ShieldCheck className="w-5 h-5 mr-2 text-blue-500" />
                    <span>Case Progress: {activeCase.caseName}</span>
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border ${
                      activeCase.status === 'Solved'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : activeCase.status === 'Under Investigation'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    ● {activeCase.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar with Percentage */}
              <div>
                <div className="flex justify-between items-center text-xs font-black mb-1.5">
                  <span className={themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}>
                    Investigation Milestones Completed
                  </span>
                  <span className="text-sm font-black text-amber-600 dark:text-yellow-400">
                    {progressData.percentage}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progressData.percentage === 100
                        ? 'bg-emerald-500'
                        : progressData.percentage > 50
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${progressData.percentage}%` }}
                  />
                </div>
              </div>

              {/* Step Checklist */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sequential Investigation Checkpoints
                </h4>
                <div className="space-y-2">
                  {progressData.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        step.completed
                          ? themeMode === 'bright'
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200 font-bold'
                          : themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-slate-800/30 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm font-semibold truncate">{step.label}</span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded shrink-0 ${
                          step.completed
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {step.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Assigned Police Team & Official Dossier Preview */}
            <div className="space-y-6">
              {/* Assigned Police Team Card */}
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  themeMode === 'bright'
                    ? 'bg-white border-2 border-slate-300 shadow-sm text-slate-900'
                    : 'bg-slate-900/80 border-blue-900/50 shadow-lg text-slate-100'
                }`}
              >
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center text-amber-600 dark:text-yellow-400">
                  <Users className="w-4 h-4 mr-1.5" /> Assigned Police Team
                </h3>

                <div className="space-y-3">
                  {/* Investigator */}
                  <div
                    className={`p-3 rounded-xl border ${
                      themeMode === 'bright' ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block">
                      Investigator
                    </span>
                    <p className="text-xs font-black mt-0.5">{activeCase.assignedHostName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Metro Central Precinct</p>
                  </div>

                  {/* Assigned Officers */}
                  <div
                    className={`p-3 rounded-xl border ${
                      themeMode === 'bright' ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 block">
                      Assigned Field Officers ({(activeCase.assignedOfficerNames || []).length})
                    </span>
                    <p className="text-xs font-bold mt-0.5">
                      {(activeCase.assignedOfficerNames || []).length > 0
                        ? activeCase.assignedOfficerNames.join(', ')
                        : 'Officer assignment in progress'}
                    </p>
                  </div>
                </div>

                {/* Evidence Files Count (Read-Only) */}
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-800'
                  }`}
                >
                  <span className="flex items-center">
                    <Upload className="w-4 h-4 mr-1.5 text-amber-500" /> Secure Evidence Logged:
                  </span>
                  <span className="font-mono font-black">{activeCase.evidence.length} Files</span>
                </div>

                {/* Full Dossier View Button */}
                <button
                  type="button"
                  onClick={() => onSelectCase(activeCase)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm ${
                    themeMode === 'bright'
                      ? 'bg-blue-900 hover:bg-blue-800 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Judicial Case Dossier</span>
                </button>
              </div>

              {/* Location & Quick Summary Card */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  themeMode === 'bright'
                    ? 'bg-slate-50 border border-slate-300 text-slate-800'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                  Case Overview
                </span>
                <p className="text-xs font-medium leading-relaxed">{activeCase.description}</p>
                <div className="flex items-center text-xs font-bold text-red-600 dark:text-red-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                  <span>{activeCase.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Court Hearing Modal */}
      {showHearingModal && activeCase && (
        <CourtHearingModal
          caseItem={activeCase}
          currentUser={currentUser}
          themeMode={themeMode}
          onClose={() => setShowHearingModal(false)}
          onSaveHearing={handleSaveHearing}
        />
      )}
    </div>
  );
};
