import React, { useState, useEffect, useRef } from 'react';
import { Case, TimelineEntry, User, Suspect } from '../types';
import { Clock, PlusCircle, Calendar, UserCheck, Shield, ChevronLeft, CheckCircle2, ArrowRightCircle, Pencil, UserX, ChevronDown, Check, X, Filter } from 'lucide-react';
import { initialSuspects } from '../data/mockData';

interface CaseTimelineModalProps {
  caseItem: Case;
  themeMode: 'bright' | 'dark';
  currentUser: User | null;
  suspects?: Suspect[];
  onClose: () => void;
  onAddEntry: (caseId: string, entry: Omit<TimelineEntry, 'id'>) => void;
  onUpdateEntry?: (caseId: string, entry: TimelineEntry) => void;
}

export const CaseTimelineModal: React.FC<CaseTimelineModalProps> = ({
  caseItem,
  themeMode,
  currentUser,
  suspects,
  onClose,
  onAddEntry,
  onUpdateEntry,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const suspectDropdownRef = useRef<HTMLDivElement>(null);

  // Suspect State & Management
  const [localSuspects, setLocalSuspects] = useState<Suspect[]>(() => {
    if (suspects && suspects.length > 0) return suspects;
    try {
      const saved = localStorage.getItem('portal_suspects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialSuspects;
  });

  useEffect(() => {
    if (suspects && suspects.length > 0) {
      setLocalSuspects(suspects);
    }
  }, [suspects]);

  // Suspects linked to this specific case
  const caseSuspects = localSuspects.filter(
    (s) => s.linkedCaseIds && s.linkedCaseIds.includes(caseItem.id)
  );

  const [isSuspectDropdownOpen, setIsSuspectDropdownOpen] = useState(false);
  const [selectedSuspectForTimeline, setSelectedSuspectForTimeline] = useState<Suspect | null>(null);
  const [suspectFilter, setSuspectFilter] = useState<string>('ALL');

  // Close suspect dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suspectDropdownRef.current &&
        !suspectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSuspectDropdownOpen(false);
      }
    };
    if (isSuspectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSuspectDropdownOpen]);

  // Form State
  const now = new Date();
  const defaultDateStr = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  const getDefaultRoleForUser = (role?: string): string => {
    if (role === 'Officer' || role === 'Police Officer') return 'Police Officer';
    if (role === 'Host' || role === 'Host Inspector' || role === 'Investigator') return 'Investigator';
    if (role === 'DSP' || role === 'SHO/Inspector') return 'SHO/Inspector';
    if (role === 'Advocate') return 'Advocate';
    return 'Police Officer';
  };

  const [title, setTitle] = useState('');
  const [timestamp, setTimestamp] = useState(defaultDateStr);
  const [description, setDescription] = useState('');
  const [performerName, setPerformerName] = useState(currentUser?.fullName || caseItem.assignedHostName || 'Assigned Officer');
  const [performerRole, setPerformerRole] = useState(getDefaultRoleForUser(currentUser?.role));
  const [statusTag, setStatusTag] = useState<'Completed' | 'In Progress' | 'Pending'>('Completed');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) {
        setPerformerName(currentUser.fullName);
      }
      setPerformerRole(getDefaultRoleForUser(currentUser.role));
    }
  }, [currentUser, showAddForm]);

  // Handle selecting a suspect from the dropdown to start adding a timeline entry for them
  const handleSelectSuspectForTimeline = (suspect: Suspect) => {
    setSelectedSuspectForTimeline(suspect);
    setIsSuspectDropdownOpen(false);
    setEditingEntryId(null);
    setTitle(`Suspect Interrogation - ${suspect.fullName}`);
    setDescription(
      `Interrogation & alibi verification conducted with suspect ${suspect.fullName} (${suspect.id}). Investigative progress, movements, and statements recorded in case dossier.`
    );
    setShowAddForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      titleInputRef.current?.focus();
    }, 80);
  };

  // Link an existing suspect from portal directory to this case and open timeline form
  const handleLinkAndSelectSuspect = (suspect: Suspect) => {
    const updatedSuspect: Suspect = {
      ...suspect,
      linkedCaseIds: suspect.linkedCaseIds?.includes(caseItem.id)
        ? suspect.linkedCaseIds
        : [...(suspect.linkedCaseIds || []), caseItem.id],
    };
    const nextSuspects = localSuspects.map((s) =>
      s.id === suspect.id ? updatedSuspect : s
    );
    setLocalSuspects(nextSuspects);
    try {
      localStorage.setItem('portal_suspects', JSON.stringify(nextSuspects));
    } catch {
      // ignore
    }
    handleSelectSuspectForTimeline(updatedSuspect);
  };

  // Parse timeline date strings to timestamp (ms) for chronological sorting
  const parseTimelineDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    const cleaned = dateStr.replace(/,/g, '').trim();
    const directParsed = Date.parse(cleaned);
    if (!isNaN(directParsed)) return directParsed;

    const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*([AP]M))?)?/i);
    if (match) {
      const [, day, monthStr, year, hourStr, minStr, ampm] = match;
      let hour = hourStr ? parseInt(hourStr, 10) : 0;
      const min = minStr ? parseInt(minStr, 10) : 0;
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      }
      const d = new Date(`${monthStr} ${day}, ${year} ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    return 0;
  };

  // Fallback / Initial entries if timeline is empty
  const rawTimelineList: TimelineEntry[] = ((caseItem.timeline && caseItem.timeline.length > 0)
    ? caseItem.timeline
    : [
        {
          id: `initial-${caseItem.id}`,
          timestamp: caseItem.createdAt || `${caseItem.dateAssigned}, 09:30 AM`,
          title: 'Case Registered',
          description: `Complaint received and case officially created. ${caseItem.description}`,
          performerName: caseItem.assignedHostName || 'Inspector Sharma',
          performerRole: 'Investigator',
          statusTag: 'Completed',
        },
      ]
  ).map((item, index) => ({
    ...item,
    id: item.id || `tl-${caseItem.id}-${index}`,
  }));

  // Sort timeline entries chronologically ascending
  const timelineList = [...rawTimelineList].sort((a, b) => {
    const timeA = parseTimelineDate(a.timestamp);
    const timeB = parseTimelineDate(b.timestamp);
    return timeA - timeB;
  });

  // Filtered timeline entries by selected suspect filter
  const filteredTimelineList = timelineList.filter((entry) => {
    if (suspectFilter === 'ALL') return true;
    return (
      entry.suspectId === suspectFilter ||
      entry.suspectName?.toLowerCase() === suspectFilter.toLowerCase()
    );
  });

  const handlePresetClick = (presetTitle: string, presetDesc: string) => {
    setTitle(presetTitle);
    if (!description) {
      setDescription(presetDesc);
    }
  };

  const handleStartEdit = (entry: TimelineEntry) => {
    const targetId = entry.id || `tl-${caseItem.id}`;
    setEditingEntryId(targetId);
    setTitle(entry.title);
    setTimestamp(entry.timestamp);
    setDescription(entry.description);
    setPerformerName(entry.performerName || (currentUser?.fullName || 'Assigned Officer'));
    setPerformerRole(entry.performerRole || getDefaultRoleForUser(currentUser?.role));
    setStatusTag((entry.statusTag as 'Completed' | 'In Progress' | 'Pending') || 'Completed');

    if (entry.suspectId) {
      const found = localSuspects.find((s) => s.id === entry.suspectId);
      setSelectedSuspectForTimeline(
        found || (entry.suspectName ? ({ id: entry.suspectId, fullName: entry.suspectName, status: 'Active', crime: caseItem.crimeType, linkedCaseIds: [caseItem.id] } as any) : null)
      );
    } else if (entry.suspectName) {
      const found = localSuspects.find((s) => s.fullName.toLowerCase() === entry.suspectName?.toLowerCase());
      setSelectedSuspectForTimeline(
        found || ({ id: 'SUS-LINKED', fullName: entry.suspectName, status: 'Active', crime: caseItem.crimeType, linkedCaseIds: [caseItem.id] } as any)
      );
    } else {
      setSelectedSuspectForTimeline(null);
    }

    setShowAddForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      titleInputRef.current?.focus();
    }, 80);
  };

  const handleToggleAddForm = () => {
    if (showAddForm) {
      setShowAddForm(false);
      setEditingEntryId(null);
      setSelectedSuspectForTimeline(null);
      setTitle('');
      setDescription('');
    } else {
      setEditingEntryId(null);
      setTitle('');
      setDescription('');
      setShowAddForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInputRef.current?.focus();
      }, 80);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const entryData: Omit<TimelineEntry, 'id'> = {
      title: title.trim(),
      timestamp: timestamp.trim() || defaultDateStr,
      description: description.trim(),
      performerName: performerName.trim() || (currentUser?.fullName || 'Assigned Officer'),
      performerRole: performerRole || (currentUser?.role || 'Police Officer'),
      statusTag: statusTag,
      suspectId: selectedSuspectForTimeline?.id,
      suspectName: selectedSuspectForTimeline?.fullName,
    };

    if (editingEntryId) {
      if (onUpdateEntry) {
        onUpdateEntry(caseItem.id, {
          id: editingEntryId,
          ...entryData,
        });
      } else {
        onAddEntry(caseItem.id, entryData);
      }
    } else {
      onAddEntry(caseItem.id, entryData);
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setSelectedSuspectForTimeline(null);
    setEditingEntryId(null);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col my-auto max-h-[92vh] ${
          themeMode === 'bright'
            ? 'bg-slate-50 border-slate-200 text-slate-900'
            : 'bg-slate-950 border-yellow-500/40 text-slate-100'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950'
              : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold ${
                themeMode === 'bright'
                  ? 'bg-white hover:bg-slate-200 text-blue-900 border border-slate-300 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 text-white'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  CASE #{caseItem.id}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    caseItem.status === 'Solved'
                      ? themeMode === 'bright'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : caseItem.status === 'Active'
                      ? themeMode === 'bright'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : themeMode === 'bright'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  ● {caseItem.status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                {caseItem.caseName}
                <span className="text-xs font-normal opacity-80 ml-2">({caseItem.crimeType})</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Suspect Option in the heading on the left of the cross icon */}
            <div className="relative" ref={suspectDropdownRef}>
              <button
                type="button"
                id="btn-timeline-suspect-dropdown"
                onClick={() => setIsSuspectDropdownOpen((prev) => !prev)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border shadow-sm ${
                  isSuspectDropdownOpen
                    ? themeMode === 'bright'
                      ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-200'
                      : 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-500/40'
                    : themeMode === 'bright'
                    ? 'bg-white hover:bg-rose-50 text-rose-800 border-rose-300 hover:border-rose-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-rose-500/40 hover:border-rose-400'
                }`}
                title="View case suspects & add suspect timeline entries"
              >
                <UserX className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
                <span className="font-extrabold">Suspect</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSuspectDropdownOpen
                      ? 'bg-white/30 text-white'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {caseSuspects.length}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isSuspectDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu of Suspects */}
              {isSuspectDropdownOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden animate-fadeIn ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300 text-slate-900 shadow-slate-900/25 ring-1 ring-slate-900/5'
                      : 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/80'
                  }`}
                >
                  {/* Dropdown Header */}
                  <div
                    className={`p-3 border-b flex items-center justify-between ${
                      themeMode === 'bright'
                        ? 'bg-rose-50/90 border-rose-200'
                        : 'bg-slate-800/90 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-xs">Case Suspects</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Select a suspect to add their timeline entry
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300">
                      {caseSuspects.length} {caseSuspects.length === 1 ? 'Suspect' : 'Suspects'}
                    </span>
                  </div>

                  {/* Dropdown List */}
                  <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
                    {caseSuspects.length > 0 ? (
                      caseSuspects.map((suspect) => (
                        <div
                          key={suspect.id}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                            themeMode === 'bright'
                              ? 'bg-slate-50 hover:bg-blue-50/60 border-slate-200 hover:border-blue-300'
                              : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-yellow-500/40'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {suspect.photoUrl ? (
                              <img
                                src={suspect.photoUrl}
                                alt={suspect.fullName}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0 text-xs">
                                {suspect.fullName.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-black truncate">{suspect.fullName}</p>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                  {suspect.id}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    suspect.status === 'Wanted'
                                      ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                                      : suspect.status === 'Under Arrest'
                                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {suspect.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={caseItem.status === 'Solved'}
                            onClick={() => handleSelectSuspectForTimeline(suspect)}
                            className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-xs ${
                              caseItem.status === 'Solved'
                                ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500'
                                : themeMode === 'bright'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black'
                            }`}
                            title={`Add timeline entry for ${suspect.fullName}`}
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>+ Add Timeline</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center space-y-2">
                        <UserX className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          No suspects linked to Case #{caseItem.id} yet
                        </p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Select an existing suspect from police records below to link and log their timeline:
                        </p>
                        <div className="space-y-1 pt-1 max-h-40 overflow-y-auto">
                          {localSuspects.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleLinkAndSelectSuspect(s)}
                              className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                                themeMode === 'bright'
                                  ? 'bg-slate-50 hover:bg-blue-50 border-slate-200'
                                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-bold">{s.fullName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({s.id})</span>
                              </div>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-yellow-400">+ Link & Add</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Close cross icon */}
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                themeMode === 'bright'
                  ? 'hover:bg-slate-200 text-slate-700'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Close Timeline Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Top Info Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
              themeMode === 'bright'
                ? 'bg-white border-blue-200 shadow-sm text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Investigation Details</p>
              <p className="font-medium text-xs leading-relaxed max-w-2xl">{caseItem.description}</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-bold ${
                themeMode === 'bright'
                  ? 'bg-blue-100/90 border-blue-300 text-blue-950 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}>
                <Calendar className={`w-3.5 h-3.5 ${themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'}`} />
                <span>Assigned: {caseItem.dateAssigned}</span>
              </div>
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-bold ${
                themeMode === 'bright'
                  ? 'bg-blue-100/90 border-blue-300 text-blue-950 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}>
                <UserCheck className={`w-3.5 h-3.5 ${themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'}`} />
                <span>Investigator: {caseItem.assignedHostName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Solved Status Lock Banner */}
          {caseItem.status === 'Solved' && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>🔒 Case is Solved — Timeline entries are locked and cannot be added or edited.</span>
            </div>
          )}

          {/* Action Bar to Add New Entry */}
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center space-x-2 ${
              themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Case Sequential Timeline</span>
            </h3>

            {caseItem.status !== 'Solved' && (
              <button
                type="button"
                onClick={handleToggleAddForm}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                  showAddForm
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    : themeMode === 'bright'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showAddForm ? 'Cancel Add Entry' : '+ Add Details to Timeline'}</span>
              </button>
            )}
          </div>

          {/* Expandable Add Entry Form */}
          {caseItem.status !== 'Solved' && showAddForm && (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className={`p-4 sm:p-5 rounded-2xl border space-y-4 animate-fadeIn ${
                themeMode === 'bright'
                  ? 'bg-sky-50/80 border-blue-300 shadow-md text-slate-900'
                  : 'bg-slate-900 border-yellow-500/40 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <span>{editingEntryId ? '✏️ Edit Timeline Entry Details' : '➕ Add Investigation Progress Details'}</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">Recorded sequentially into case record</span>
              </div>

              {/* Active Linked Suspect Indicator */}
              {selectedSuspectForTimeline ? (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    themeMode === 'bright'
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {selectedSuspectForTimeline.photoUrl ? (
                      <img
                        src={selectedSuspectForTimeline.photoUrl}
                        alt={selectedSuspectForTimeline.fullName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-rose-300 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold flex items-center justify-center shrink-0 text-xs">
                        <UserX className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded">
                          Suspect Timeline Entry
                        </span>
                        <span className="text-[10px] font-mono font-bold opacity-80">
                          {selectedSuspectForTimeline.id}
                        </span>
                      </div>
                      <p className="text-xs font-black mt-0.5 truncate">{selectedSuspectForTimeline.fullName}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSuspectForTimeline(null);
                      if (title.startsWith('Suspect Interrogation -')) {
                        setTitle('');
                        setDescription('');
                      }
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Clear suspect linking to make general case entry"
                  >
                    ✕ Clear Suspect
                  </button>
                </div>
              ) : null}

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                  {selectedSuspectForTimeline ? `Quick Presets for ${selectedSuspectForTimeline.fullName}:` : 'Quick Event Presets:'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSuspectForTimeline
                    ? [
                        {
                          title: `Suspect Interrogation - ${selectedSuspectForTimeline.fullName}`,
                          desc: `Interrogation conducted with ${selectedSuspectForTimeline.fullName}. Statements and responses documented for case file.`,
                        },
                        {
                          title: `Alibi Verification - ${selectedSuspectForTimeline.fullName}`,
                          desc: `Cross-checked whereabouts, mobile tower records, and witness accounts to verify suspect alibi claims.`,
                        },
                        {
                          title: `Custody & Remand - ${selectedSuspectForTimeline.fullName}`,
                          desc: `Suspect produced before magistrate; police remand order secured for custodial interrogation.`,
                        },
                        {
                          title: `Premises Search - ${selectedSuspectForTimeline.fullName}`,
                          desc: `Search warrant executed at suspect residence / office premises; seized articles logged in panchnama.`,
                        },
                        {
                          title: `Forensic & Call Records - ${selectedSuspectForTimeline.fullName}`,
                          desc: `CDR analysis and forensic biometric samples linked to suspect examined.`,
                        },
                      ].map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => handlePresetClick(preset.title, preset.desc)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white hover:bg-rose-600 hover:text-white border-rose-200 text-rose-900'
                              : 'bg-slate-800 hover:bg-rose-500 hover:text-white border-slate-700 text-rose-300'
                          }`}
                        >
                          + {preset.title.split(' - ')[0]}
                        </button>
                      ))
                    : [
                        { title: 'Crime Scene Visited', desc: 'Scene secured and initial physical observations recorded.' },
                        { title: 'Evidence Collected', desc: 'New physical/digital evidence items retrieved and logged.' },
                        { title: 'Witness Statements', desc: 'Statements officially recorded from key witnesses.' },
                        { title: 'Forensic Report Requested', desc: 'Samples submitted for forensic laboratory analysis.' },
                        { title: 'Interrogation Conducted', desc: 'Suspect interrogated; statement recorded on record.' },
                        { title: 'Bail Objection Filed', desc: 'Legal objection filed against bail in court.' },
                      ].map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => handlePresetClick(preset.title, preset.desc)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white hover:bg-blue-600 hover:text-white border-blue-200 text-blue-900'
                              : 'bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 border-slate-700 text-slate-300'
                          }`}
                        >
                          + {preset.title}
                        </button>
                      ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Associate with Suspect (Optional)</label>
                  <select
                    value={selectedSuspectForTimeline?.id || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setSelectedSuspectForTimeline(null);
                      } else {
                        const found = localSuspects.find((s) => s.id === val);
                        if (found) {
                          setSelectedSuspectForTimeline(found);
                          if (!title || title.startsWith('Suspect Interrogation -')) {
                            setTitle(`Suspect Interrogation - ${found.fullName}`);
                          }
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none font-semibold ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-400'
                    }`}
                  >
                    <option value="">None (General Case Investigation Entry)</option>
                    {caseSuspects.map((s) => (
                      <option key={s.id} value={s.id}>
                        Suspect: {s.fullName} ({s.id}) - {s.status}
                      </option>
                    ))}
                    {caseSuspects.length === 0 && (
                      <optgroup label="Other Portal Suspects">
                        {localSuspects.map((s) => (
                          <option key={s.id} value={s.id}>
                            Suspect: {s.fullName} ({s.id})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Event Title *</label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Crime Scene Visited, Witness Statements..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Date & Time *</label>
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="e.g. 10 Aug 2026, 11:15 AM"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Officer / Investigator Name *</label>
                  <input
                    type="text"
                    value={performerName}
                    readOnly
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-not-allowed opacity-90 font-bold ${
                      themeMode === 'bright'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={performerRole}
                    readOnly
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-not-allowed opacity-90 font-bold ${
                      themeMode === 'bright'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Event Description & Observations *</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed facts, findings, evidence notes, or action taken..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntryId(null);
                    setShowAddForm(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                  }`}
                >
                  {editingEntryId ? 'Save Changes to Entry' : 'Save Entry to Timeline'}
                </button>
              </div>
            </form>
          )}

          {/* Timeline View List */}
          <div className="pl-2 sm:pl-4 pr-1 py-2 relative">
            {/* Filter Tabs if suspects exist */}
            {caseSuspects.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center mr-1">
                  <Filter className="w-3 h-3 mr-1" />
                  Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setSuspectFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    suspectFilter === 'ALL'
                      ? themeMode === 'bright'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-yellow-500 text-slate-950 font-black'
                      : themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  All Entries ({timelineList.length})
                </button>
                {caseSuspects.map((s) => {
                  const count = timelineList.filter(
                    (e) => e.suspectId === s.id || e.suspectName?.toLowerCase() === s.fullName.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSuspectFilter(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        suspectFilter === s.id
                          ? 'bg-rose-600 text-white shadow-xs'
                          : themeMode === 'bright'
                          ? 'bg-white hover:bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-slate-800 hover:bg-rose-950/40 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <UserX className="w-3 h-3" />
                      <span>{s.fullName}</span>
                      <span className="text-[9px] opacity-80 px-1 py-0.2 rounded-full bg-black/15 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Sequential Line */}
            <div
              className={`absolute left-[19px] sm:left-[27px] top-6 bottom-8 w-0.5 ${
                themeMode === 'bright'
                  ? 'bg-blue-300'
                  : 'bg-slate-700'
              }`}
            />

            <div className="space-y-6">
              {filteredTimelineList.map((entry, idx) => {
                const isCaseRegistered = entry.title.toLowerCase().includes('case registered') || entry.title.toLowerCase().includes('fir registered') || (idx === 0 && entry.title.toLowerCase().includes('registered'));
                const isSolved = caseItem.status === 'Solved';

                return (
                  <div key={entry.id || idx} className="relative flex items-start space-x-4 group">
                    {/* Bullet Symbol ● */}
                    <div className="relative z-10 flex-shrink-0 mt-0.5">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${
                          entry.suspectName
                            ? 'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950'
                            : themeMode === 'bright'
                            ? 'bg-blue-600 text-white ring-4 ring-sky-100'
                            : 'bg-yellow-500 text-slate-950 ring-4 ring-slate-900'
                        }`}
                      >
                        ●
                      </div>
                    </div>

                    {/* Card Content */}
                    <div
                      className={`flex-1 p-4 rounded-2xl border transition-all ${
                        entry.suspectName
                          ? themeMode === 'bright'
                            ? 'bg-white border-rose-300/80 shadow-sm hover:border-rose-400'
                            : 'bg-slate-900/90 border-rose-500/40 hover:border-rose-500/60'
                          : themeMode === 'bright'
                          ? 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
                          : 'bg-slate-900/90 border-slate-800 hover:border-yellow-500/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-mono text-[11px] font-extrabold flex items-center space-x-1 ${
                            themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'
                          }`}>
                            <Calendar className="w-3 h-3 mr-1 inline" />
                            {entry.timestamp}
                          </span>

                          {entry.suspectName && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center space-x-1 shadow-2xs">
                              <UserX className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              <span>Suspect: {entry.suspectName}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {isCaseRegistered && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                              🔒 Default Record
                            </span>
                          )}

                          {entry.statusTag && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                entry.statusTag === 'Completed'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              ✓ {entry.statusTag}
                            </span>
                          )}

                          {!isSolved && !isCaseRegistered && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(entry)}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white border border-blue-400/40 shadow-xs flex items-center space-x-1 cursor-pointer transition-all"
                              title="Edit timeline entry"
                            >
                              <Pencil className="w-3 h-3 text-white" />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      </div>

                    <h4 className={`text-sm font-black mb-1 ${
                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {entry.title}
                    </h4>

                    <p className={`text-xs leading-relaxed mb-3 ${
                      themeMode === 'bright' ? 'text-slate-700 font-medium' : 'text-slate-300'
                    }`}>
                      {entry.description}
                    </p>

                    <div className={`pt-2 border-t flex items-center justify-between text-[11px] font-semibold ${
                      themeMode === 'bright'
                        ? 'border-slate-100 text-slate-600'
                        : 'border-slate-800/80 text-slate-400'
                    }`}>
                      <span className="flex items-center space-x-1">
                        <Shield className="w-3.5 h-3.5 text-blue-500 dark:text-yellow-400" />
                        <span>Investigator / Person: <strong className={themeMode === 'bright' ? 'text-slate-900 font-bold' : 'text-slate-200'}>{entry.performerName}</strong> ({entry.performerRole || 'Officer'})</span>
                      </span>

                      <span className="text-[10px] opacity-70 font-mono">Entry #{idx + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}

              {/* Terminal Node: Either NEXT or Case Solved */}
              {caseItem.status === 'Solved' ? (
                <div className="relative flex items-start space-x-4">
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                        themeMode === 'bright'
                          ? 'border-emerald-600 text-white bg-emerald-600 shadow-sm'
                          : 'border-emerald-500 text-slate-950 bg-emerald-500 shadow-sm'
                      }`}
                    >
                      ✓
                    </div>
                  </div>

                  <div
                    className={`flex-1 p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                      themeMode === 'bright'
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
                        : 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-black text-xs sm:text-sm">
                      <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        themeMode === 'bright' ? 'text-emerald-700' : 'text-emerald-400'
                      }`} />
                      <span>Case Solved</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      themeMode === 'bright'
                        ? 'bg-emerald-200/80 text-emerald-950 border border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      Investigation Closed
                    </span>
                  </div>
                </div>
              ) : (
                /* NEXT Node ○ */
                <div className="relative flex items-start space-x-4">
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-dashed ${
                        themeMode === 'bright'
                          ? 'border-blue-500 text-blue-600 bg-sky-50'
                          : 'border-yellow-500/60 text-yellow-400 bg-slate-900'
                      }`}
                    >
                      ○
                    </div>
                  </div>

                  <div
                    className={`flex-1 p-3.5 rounded-2xl border-2 border-dashed flex items-center ${
                      themeMode === 'bright'
                        ? 'bg-sky-50/60 border-blue-200 text-blue-900'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <ArrowRightCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400" />
                      <span>NEXT: Investigation in progress — awaiting next update</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-slate-100 border-slate-300'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className={`text-xs font-semibold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
            Total Timeline Records: <strong>{timelineList.length}</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
              themeMode === 'bright'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
