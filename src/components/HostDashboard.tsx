import React, { useState } from 'react';
import { Case, User, CrimeDistributionData, MonthlyCrimeData, Suspect } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { CrimeMap } from './CrimeMap';
import { CaseHeatmap } from './CaseHeatmap';
import { CaseSuspectModal } from './CaseSuspectModal';
import { useLanguage } from '../context/LanguageContext';
import { isCaseInOfficerTalukas } from '../utils/caseUtils';
import { Shield, UserPlus, ShieldAlert, FolderKanban, Users, Eye, Plus, CheckCircle2, AlertCircle, Trash2, UserX, PlusCircle, UserMinus, Search, MapPin, ChevronRight } from 'lucide-react';

interface HostDashboardProps {
  currentUser: User;
  cases: Case[];
  suspects?: Suspect[];
  officersList: User[];
  advocatesList: User[];
  victimsList?: User[];
  onAddMemberToCase: (
    caseId: string,
    officerIds: string[],
    advocateIds: string[],
    victimId?: string,
    victimName?: string,
    victimUsername?: string
  ) => void;
  onSelectCase: (c: Case) => void;
  onOpenSuspectManagement: () => void;
  onManageCaseSuspects?: (caseId: string, suspectIds: string[]) => void;
  onCreateSuspect?: (newSuspect: Suspect) => void;
  onUpdateSuspect?: (updatedSuspect: Suspect) => void;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
  onOpenCaseManagement?: () => void;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  currentUser,
  cases,
  suspects = [],
  officersList,
  advocatesList,
  victimsList = [],
  onSelectCase,
  onOpenSuspectManagement,
  onAddMemberToCase,
  onManageCaseSuspects,
  onCreateSuspect,
  onUpdateSuspect,
  distributionData,
  monthlyData,
  themeMode = 'bright',
  onOpenCaseManagement,
}) => {
  const { t, isHindi } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [suspectModalCase, setSuspectModalCase] = useState<Case | null>(null);

  // Cases assigned to this Host by DSP
  const myAssignedCases = cases.filter(
    (c) =>
      (c.assignedHostId && c.assignedHostId === currentUser.id) ||
      (c.assignedHostName &&
        c.assignedHostName !== 'Unassigned' &&
        c.assignedHostName.toLowerCase().includes(currentUser.fullName.toLowerCase()))
  );

  // Filter cases and suspects by Host's assigned taluka jurisdiction
  const hostTaluka = currentUser?.taluka || (currentUser?.talukas && currentUser.talukas[0]);
  const hostCases = hostTaluka
    ? cases.filter((c) => isCaseInOfficerTalukas(currentUser, c) || myAssignedCases.some((mc) => mc.id === c.id))
    : cases;

  const hostCaseIds = hostCases.map((c) => c.id);
  const hostTalukaLower = (hostTaluka || '').toLowerCase();

  const hostSuspects = suspects.filter((s) => {
    if (s.linkedCaseIds.some((cid) => hostCaseIds.includes(cid))) return true;
    if (hostTalukaLower && s.taluka && s.taluka.toLowerCase().includes(hostTalukaLower)) return true;
    if (hostTalukaLower && s.address && s.address.toLowerCase().includes(hostTalukaLower)) return true;
    return false;
  });

  const filteredAssignedCases = myAssignedCases.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.crimeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const [assigningCase, setAssigningCase] = useState<Case | null>(null);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [selectedAdvocateIds, setSelectedAdvocateIds] = useState<string[]>([]);
  const [selectedVictimId, setSelectedVictimId] = useState<string>('');
  const [selectedVictimName, setSelectedVictimName] = useState<string>('');
  const [selectedVictimUsername, setSelectedVictimUsername] = useState<string>('');

  const openAssignModal = (c: Case) => {
    setAssigningCase(c);
    setSelectedOfficerIds(c.assignedOfficerIds || []);
    setSelectedAdvocateIds(c.assignedAdvocateIds || []);
    setSelectedVictimId(c.victimId || '');
    setSelectedVictimName(c.victimName || '');
    setSelectedVictimUsername(c.victimUsername || '');
  };

  const handleSaveTeam = () => {
    if (!assigningCase) return;
    onAddMemberToCase(
      assigningCase.id,
      selectedOfficerIds,
      selectedAdvocateIds,
      selectedVictimId,
      selectedVictimName,
      selectedVictimUsername
    );
    setAssigningCase(null);
  };

  const handleRemoveOfficerDirectly = (c: Case, offId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOfficerIds = c.assignedOfficerIds.filter((id) => id !== offId);
    onAddMemberToCase(c.id, newOfficerIds, c.assignedAdvocateIds, c.victimId, c.victimName, c.victimUsername);
  };

  const handleRemoveAdvocateDirectly = (c: Case, advId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAdvocateIds = c.assignedAdvocateIds.filter((id) => id !== advId);
    onAddMemberToCase(c.id, c.assignedOfficerIds, newAdvocateIds, c.victimId, c.victimName, c.victimUsername);
  };

  const removeOfficerFromModal = (id: string) => {
    setSelectedOfficerIds((prev) => prev.filter((oId) => oId !== id));
  };

  const addOfficerInModal = (id: string) => {
    setSelectedOfficerIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeAdvocateFromModal = (id: string) => {
    setSelectedAdvocateIds((prev) => prev.filter((aId) => aId !== id));
  };

  const addAdvocateInModal = (id: string) => {
    setSelectedAdvocateIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeVictimFromModal = () => {
    setSelectedVictimId('');
    setSelectedVictimName('');
    setSelectedVictimUsername('');
  };

  const assignVictimInModal = (victim: User) => {
    setSelectedVictimId(victim.id);
    setSelectedVictimName(victim.fullName);
    setSelectedVictimUsername(victim.username);
  };

  const handleClearAllTeamModal = () => {
    setSelectedOfficerIds([]);
    setSelectedAdvocateIds([]);
    setSelectedVictimId('');
    setSelectedVictimName('');
    setSelectedVictimUsername('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Host Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-yellow-500/20 pb-4 sm:pb-6">
        <div>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
            <span>{t('Investigator Main Police Administration Dashboard')}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            {t('Manage SHO/Inspector assigned cases, dispatch Police Officers & Advocates, verify applicants, and track suspects.')}
          </p>
        </div>
      </div>

      {/* Interactive Crime Hotspot Map & Case Registration Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch my-6">
        <div className="flex flex-col min-w-0 h-full">
          <CrimeMap cases={hostCases} suspects={hostSuspects} onSelectCase={onSelectCase} themeMode={themeMode} />
        </div>
        <div className="flex flex-col min-w-0 h-full">
          <CaseHeatmap cases={hostCases} themeMode={themeMode} />
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        distributionData={distributionData}
        monthlyData={monthlyData}
        themeMode={themeMode}
      />

      {/* Cases Management Quick Access Banner (Cases Ledger moved to dedicated module) */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
        themeMode === 'bright'
          ? 'bg-gradient-to-r from-sky-50 to-white border-2 border-sky-300 shadow-md'
          : 'bg-slate-900/80 border-blue-900/50 shadow-lg'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-base sm:text-lg font-black ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>
                {t('Assigned Cases Management')} ({myAssignedCases.length} {t('Allotted Cases')})
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                themeMode === 'bright' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
              }`}>
                {t('Investigator Section')}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>
              {t('Assigned FIR investigations, officer team dispatch, and suspect profiles are managed separately in the dedicated Case Management module.')}
            </p>
          </div>
        </div>

        {onOpenCaseManagement && (
          <button
            id="btn-open-case-mgmt-host"
            type="button"
            onClick={onOpenCaseManagement}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <span>{t('Open Case Management')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modal to Assign/Delete Police Officers and Advocates */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-xl my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-50 text-slate-900 border-slate-300'
                : 'bg-slate-950 text-slate-100 border-yellow-500/30'
            }`}
          >
            <div className={`p-5 border-b flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950'
                : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
            }`}>
              <div>
                <span className={`text-[10px] font-mono ${
                  themeMode === 'bright' ? 'text-blue-700 font-bold' : 'text-yellow-400'
                }`}>{assigningCase.id}</span>
                <h3 className={`text-base font-bold ${
                  themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
                }`}>Manage Case Investigation Team</h3>
                <p className={`text-[11px] ${
                  themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'
                }`}>Remove existing officers/advocates or assign new ones.</p>
              </div>
              <button
                onClick={() => setAssigningCase(null)}
                className={`p-1.5 rounded-full transition-colors ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200/80 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
              {/* POLICE OFFICERS SECTION */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/70 border-blue-200 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-blue-900/40'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-xs flex items-center justify-between ${
                  themeMode === 'bright' ? 'text-blue-900' : 'text-blue-400'
                }`}>
                  <span>👮 Police Officers</span>
                  <span className={`text-[10px] font-bold ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {selectedOfficerIds.length} Assigned
                  </span>
                </h4>

                {/* Currently Assigned Officers */}
                {selectedOfficerIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Currently Assigned:</span>
                    <div className="space-y-1.5">
                      {selectedOfficerIds.map((offId) => {
                        const off = officersList.find((o) => o.id === offId);
                        return (
                          <div
                            key={`assigned-off-${offId}`}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              themeMode === 'bright'
                                ? 'bg-white border-blue-200 text-slate-900 shadow-xs'
                                : 'bg-blue-950/60 border-blue-800'
                            }`}
                          >
                            <div>
                              <p className={`font-bold ${themeMode === 'bright' ? 'text-blue-950' : 'text-blue-200'}`}>{off?.fullName || offId}</p>
                              <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{off?.department} • Badge: {off?.badgeId}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOfficerFromModal(offId)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-md font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete / Remove</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Police Officers to Add / Replace */}
                <div className="space-y-1.5 pt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Available Officers (Click to Add or Replace):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {officersList
                      .filter((off) => !selectedOfficerIds.includes(off.id))
                      .map((off) => (
                        <div
                          key={`avail-off-${off.id}`}
                          onClick={() => addOfficerInModal(off.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white border-slate-300 hover:border-blue-400 hover:bg-sky-100/40 text-slate-900'
                              : 'bg-slate-950 border-slate-800 hover:border-blue-500/50 text-slate-100'
                          }`}
                        >
                          <div>
                            <p className={`font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{off.fullName}</p>
                            <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{off.department} • Badge: {off.badgeId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addOfficerInModal(off.id);
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center space-x-1 ${
                              themeMode === 'bright'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                : 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Add Officer</span>
                          </button>
                        </div>
                      ))}
                    {officersList.filter((off) => !selectedOfficerIds.includes(off.id)).length === 0 && (
                      <p className={`text-[11px] italic ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-500'}`}>All available police officers are assigned.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ADVOCATES SECTION */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/70 border-blue-200 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-purple-900/40'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-xs flex items-center justify-between ${
                  themeMode === 'bright' ? 'text-purple-900' : 'text-purple-400'
                }`}>
                  <span>⚖️ Advocates</span>
                  <span className={`text-[10px] font-bold ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {selectedAdvocateIds.length} Assigned
                  </span>
                </h4>

                {/* Currently Assigned Advocates */}
                {selectedAdvocateIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Currently Assigned:</span>
                    <div className="space-y-1.5">
                      {selectedAdvocateIds.map((advId) => {
                        const adv = advocatesList.find((a) => a.id === advId);
                        return (
                          <div
                            key={`assigned-adv-${advId}`}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              themeMode === 'bright'
                                ? 'bg-white border-purple-200 text-slate-900 shadow-xs'
                                : 'bg-purple-950/60 border-purple-800'
                            }`}
                          >
                            <div>
                              <p className={`font-bold ${themeMode === 'bright' ? 'text-purple-950' : 'text-purple-200'}`}>{adv?.fullName || advId}</p>
                              <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{adv?.department} • Bar ID: {adv?.badgeId}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAdvocateFromModal(advId)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-md font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete / Remove</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Advocates to Add / Replace */}
                <div className="space-y-1.5 pt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Available Advocates (Click to Add or Replace):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {advocatesList
                      .filter((adv) => !selectedAdvocateIds.includes(adv.id))
                      .map((adv) => (
                        <div
                          key={`avail-adv-${adv.id}`}
                          onClick={() => addAdvocateInModal(adv.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white border-slate-300 hover:border-purple-400 hover:bg-purple-50/40 text-slate-900'
                              : 'bg-slate-950 border-slate-800 hover:border-purple-500/50 text-slate-100'
                          }`}
                        >
                          <div>
                            <p className={`font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{adv.fullName}</p>
                            <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{adv.department} • Bar: {adv.badgeId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addAdvocateInModal(adv.id);
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center space-x-1 ${
                              themeMode === 'bright'
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                : 'bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/40'
                            }`}
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Add Advocate</span>
                          </button>
                        </div>
                      ))}
                    {advocatesList.filter((adv) => !selectedAdvocateIds.includes(adv.id)).length === 0 && (
                      <p className={`text-[11px] italic ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-500'}`}>All available advocates are assigned.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* VICTIM / COMPLAINANT SECTION */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-amber-50/70 border-amber-200 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-amber-900/40'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`font-extrabold uppercase tracking-wider text-xs flex items-center space-x-1.5 ${
                    themeMode === 'bright' ? 'text-amber-950' : 'text-yellow-400'
                  }`}>
                    <span className="text-base">👤</span>
                    <span>Victim / Citizen Complainant</span>
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedVictimId || selectedVictimName
                      ? themeMode === 'bright'
                        ? 'bg-amber-100 text-amber-950 border-amber-300'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                      : themeMode === 'bright'
                      ? 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {selectedVictimId || selectedVictimName ? '1 Connected' : '0 Connected'}
                  </span>
                </div>

                <p className={`text-[11px] leading-relaxed ${
                  themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'
                }`}>
                  Assign a registered victim to provide them with limited, transparent access to monitor real-time case progress and upcoming court hearing deadlines.
                </p>

                {/* Currently Assigned Victim */}
                {(selectedVictimId || selectedVictimName) ? (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      Currently Linked Victim:
                    </span>
                    <div className={`p-3 rounded-lg border flex items-center justify-between ${
                      themeMode === 'bright'
                        ? 'bg-white border-amber-300 text-slate-900 shadow-xs'
                        : 'bg-amber-950/40 border-amber-800 text-slate-100'
                    }`}>
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 font-black flex items-center justify-center text-xs">
                          👤
                        </div>
                        <div>
                          <p className={`font-bold text-xs ${themeMode === 'bright' ? 'text-amber-950' : 'text-yellow-300'}`}>
                            {selectedVictimName || (selectedVictimId && victimsList.find((v) => v.id === selectedVictimId)?.fullName) || 'Citizen Complainant'}
                          </p>
                          <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                            {selectedVictimUsername ? `@${selectedVictimUsername}` : 'Citizen Account'}
                            {selectedVictimId ? ` • ID: ${selectedVictimId}` : ' • Custom Complainant Entry'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeVictimFromModal}
                        className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-md font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove / Unlink</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg border border-dashed text-center text-xs ${
                    themeMode === 'bright' ? 'bg-amber-50/50 border-amber-200 text-slate-600' : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}>
                    No registered victim connected to this case yet. Select an approved citizen account below.
                  </div>
                )}

                {/* Available Approved Victims to Connect */}
                <div className="space-y-1.5 pt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Available Registered Citizen Victims (Click to Connect):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {victimsList
                      .filter((vic) => vic.id !== selectedVictimId)
                      .map((vic) => (
                        <div
                          key={`avail-vic-${vic.id}`}
                          onClick={() => assignVictimInModal(vic)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 text-slate-900'
                              : 'bg-slate-950 border-slate-800 hover:border-amber-500/50 text-slate-100'
                          }`}
                        >
                          <div>
                            <p className={`font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                              {vic.fullName} <span className="text-[10px] font-normal text-slate-500">(@{vic.username})</span>
                            </p>
                            <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                              {vic.phone || vic.email} • Citizen ID: {vic.badgeId || vic.id}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              assignVictimInModal(vic);
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center space-x-1 cursor-pointer ${
                              themeMode === 'bright'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                                : 'bg-amber-500/20 hover:bg-amber-500/40 text-yellow-300 border border-yellow-500/40'
                            }`}
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Assign Victim</span>
                          </button>
                        </div>
                      ))}
                    {victimsList.filter((vic) => vic.id !== selectedVictimId).length === 0 && (
                      <p className={`text-[11px] italic ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-500'}`}>
                        No additional registered victim accounts available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 border-t flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-slate-100 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={handleClearAllTeamModal}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  themeMode === 'bright'
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-300'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Team Members</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAssigningCase(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeam}
                  className={`px-5 py-2 font-bold rounded-lg text-xs shadow-md ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                  }`}
                >
                  Save Team & Publish Case Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Host Case Suspect Modal */}
      {suspectModalCase && (
        <CaseSuspectModal
          c={suspectModalCase}
          isOpen={!!suspectModalCase}
          onClose={() => setSuspectModalCase(null)}
          suspects={suspects}
          currentUser={currentUser}
          onManageCaseSuspects={onManageCaseSuspects || (() => {})}
          onCreateSuspect={onCreateSuspect || (() => {})}
          onUpdateSuspect={onUpdateSuspect || (() => {})}
          themeMode={themeMode}
        />
      )}
    </div>
  );
};
