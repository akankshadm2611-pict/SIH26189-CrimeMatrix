import React, { useState } from 'react';
import { Case, CrimeType, CaseStatus, Suspect, User, CrimeDistributionData, MonthlyCrimeData, SuspectStatus } from '../types';
import { initialCrimeHotspots } from '../data/crimeHotspots';
import { DashboardCharts } from './DashboardCharts';
import { CrimeMap } from './CrimeMap';
import { CaseHeatmap } from './CaseHeatmap';
import { CaseSuspectModal } from './CaseSuspectModal';
import { DspCreateFirCaseModal } from './DspCreateFirCaseModal';
import { useLanguage } from '../context/LanguageContext';
import { isCaseInOfficerTalukas } from '../utils/caseUtils';
import { Plus, Shield, Search, Filter, FolderKanban, CheckCircle2, Clock, AlertCircle, Eye, UserPlus, ShieldAlert, UserCheck, UserX, Trash2, MapPin, ChevronRight } from 'lucide-react';

interface DspDashboardProps {
  cases: Case[];
  suspects?: Suspect[];
  onCreateCase: (newCase: Case) => void;
  onUpdateCaseHost?: (caseId: string, hostId: string, hostName: string) => void;
  hostsList: User[];
  onSelectCase: (c: Case) => void;
  onOpenSuspectManagement: () => void;
  onManageCaseSuspects?: (caseId: string, suspectIds: string[]) => void;
  onCreateSuspect?: (newSuspect: Suspect) => void;
  onUpdateSuspect?: (updatedSuspect: Suspect) => void;
  currentUser?: User;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
  onNavigateToCaseManagement?: () => void;
  onOpenCaseManagement?: () => void;
}

export const DspDashboard: React.FC<DspDashboardProps> = ({
  cases,
  suspects = [],
  onCreateCase,
  onUpdateCaseHost,
  hostsList,
  onSelectCase,
  onOpenSuspectManagement,
  onManageCaseSuspects,
  onCreateSuspect,
  onUpdateSuspect,
  currentUser,
  distributionData,
  monthlyData,
  themeMode = 'bright',
  onNavigateToCaseManagement,
  onOpenCaseManagement,
}) => {
  const { t, isHindi } = useLanguage();
  const handleOpenCaseManagement = onOpenCaseManagement || onNavigateToCaseManagement;
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [managingHostCase, setManagingHostCase] = useState<Case | null>(null);
  const [suspectModalCase, setSuspectModalCase] = useState<Case | null>(null);
  const [selectedHostForReassign, setSelectedHostForReassign] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cases and suspects by the DSP's assigned taluka jurisdiction
  const dspTaluka = currentUser?.taluka || (currentUser?.talukas && currentUser.talukas[0]) || 'Karmala';
  const dspState = currentUser?.state || 'Maharashtra';
  const dspDistrict = currentUser?.district || 'Solapur';

  const dspCases = currentUser
    ? cases.filter((c) => isCaseInOfficerTalukas(currentUser, c))
    : cases;

  const dspCaseIds = dspCases.map((c) => c.id);
  const dspTalukaLower = dspTaluka.toLowerCase();

  const dspSuspects = suspects.filter((s) => {
    if (s.linkedCaseIds.some((cid) => dspCaseIds.includes(cid))) return true;
    if (dspTalukaLower && s.taluka && s.taluka.toLowerCase().includes(dspTalukaLower)) return true;
    if (dspTalukaLower && s.address && s.address.toLowerCase().includes(dspTalukaLower)) return true;
    return false;
  });

  // Stats calculation based on DSP's assigned taluka
  const totalCases = dspCases.length;
  const activeCases = dspCases.filter((c) => c.status === 'Active').length;
  const solvedCases = dspCases.filter((c) => c.status === 'Solved').length;
  const unsolvedCases = dspCases.filter((c) => c.status === 'Pending').length;
  const underInvestigationCases = dspCases.filter((c) => c.status === 'Under Investigation').length;

  const handleOpenManageHostModal = (c: Case) => {
    setManagingHostCase(c);
    setSelectedHostForReassign(c.assignedHostId || (hostsList[0]?.id || ''));
  };

  const handleDeleteHostFromCase = (cId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateCaseHost?.(cId, '', 'Unassigned');
    if (managingHostCase && managingHostCase.id === cId) {
      setManagingHostCase(null);
    }
  };

  const handleSaveHostReassign = () => {
    if (!managingHostCase) return;
    const foundHost = hostsList.find((h) => h.id === selectedHostForReassign);
    if (foundHost) {
      onUpdateCaseHost?.(managingHostCase.id, foundHost.id, foundHost.fullName);
    } else {
      onUpdateCaseHost?.(managingHostCase.id, '', 'Unassigned');
    }
    setManagingHostCase(null);
  };

  const awaitingHostCount = dspCases.filter(
    (c) => !c.assignedHostId || c.assignedHostName === 'Unassigned'
  ).length;

  const filteredCases = dspCases.filter((c) => {
    let matchesStatus = true;
    if (statusFilter === 'Awaiting Host') {
      matchesStatus = !c.assignedHostId || c.assignedHostName === 'Unassigned';
    } else if (statusFilter !== 'ALL') {
      matchesStatus = c.status === statusFilter;
    }
    const matchesSearch =
      c.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.crimeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* DSP Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-yellow-500/20 pb-4 sm:pb-6">
        <div>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
            <span>{t('SHO/Inspector Command Headquarters Dashboard')}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            {t('Master jurisdiction crime overview, case creation, investigator assignment & suspect intelligence.')}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
              themeMode === 'bright'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
            }`}>
              <MapPin className="w-3.5 h-3.5 mr-1 text-yellow-500 shrink-0" />
              State: <span className="ml-1 font-extrabold">{dspState}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
              themeMode === 'bright'
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              District: <span className="ml-1 font-extrabold">{dspDistrict}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
              themeMode === 'bright'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              Taluka: <span className="ml-1 font-extrabold">{dspTaluka}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowCreateCaseModal(true)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3]" />
            <span>{t('Create New Case')}</span>
          </button>
        </div>
      </div>

      {/* DSP Macro Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] sm:text-sm font-bold uppercase truncate mr-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Total Cases')}</span>
            <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
          </div>
          <p className={`text-xl sm:text-2xl md:text-3xl font-black mt-1.5 sm:mt-2 ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>{totalCases}</p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] sm:text-sm font-bold uppercase truncate mr-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Active Cases')}</span>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-red-500 mt-1.5 sm:mt-2">{activeCases}</p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] sm:text-sm font-bold uppercase truncate mr-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Solved Cases')}</span>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-500 mt-1.5 sm:mt-2">{solvedCases}</p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] sm:text-sm font-bold uppercase truncate mr-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Unsolved (Pending)')}</span>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-amber-500 mt-1.5 sm:mt-2">{unsolvedCases}</p>
        </div>

        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all col-span-2 sm:col-span-1 ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] sm:text-sm font-bold uppercase truncate mr-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Under Investigation')}</span>
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-black text-blue-500 mt-1.5 sm:mt-2">{underInvestigationCases}</p>
        </div>
      </div>

      {/* Interactive Crime Hotspot Map & Case Registration Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch my-6">
        <div className="flex flex-col min-w-0 h-full">
          <CrimeMap cases={dspCases} suspects={dspSuspects} onSelectCase={onSelectCase} themeMode={themeMode} />
        </div>
        <div className="flex flex-col min-w-0 h-full">
          <CaseHeatmap cases={dspCases} themeMode={themeMode} />
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        distributionData={distributionData}
        monthlyData={monthlyData}
        themeMode={themeMode}
      />

      {/* Cases Management Quick Access Banner (Cases Ledger moved to dedicated module) */}
      <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        themeMode === 'bright'
          ? 'bg-gradient-to-r from-amber-50 to-white border-2 border-amber-300 shadow-md'
          : 'bg-slate-900/80 border-blue-900/50 shadow-lg'
      }`}>
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-3.5">
          <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shrink-0">
            <FolderKanban className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h3 className={`text-base sm:text-lg font-black ${themeMode === 'bright' ? 'text-amber-900' : 'text-yellow-400'}`}>
                Master Cases Ledger ({cases.length} Total Cases)
              </h3>
              {awaitingHostCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                  {awaitingHostCount} Investigator Needed
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>
              Detailed FIR investigations, investigator assignments, and suspects are managed in the dedicated Case Management ledger.
            </p>
          </div>
        </div>

        {handleOpenCaseManagement && (
          <button
            id="btn-open-case-mgmt-dsp"
            type="button"
            onClick={handleOpenCaseManagement}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <span>Open Case Management</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* DSP Reassign / Delete Host Modal */}
      {managingHostCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-md my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-50 text-slate-900 border-slate-300'
                : 'bg-slate-950 text-slate-100 border-blue-900/60'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950'
                : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
            }`}>
              <div>
                <span className={`text-[10px] font-mono ${
                  themeMode === 'bright' ? 'text-blue-700 font-bold' : 'text-yellow-400'
                }`}>{managingHostCase.id}</span>
                <h3 className={`text-base font-bold flex items-center ${
                  themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
                }`}>
                  <UserCheck className={`w-4 h-4 mr-1.5 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> Reassign or Delete Investigator
                </h3>
              </div>
              <button
                onClick={() => setManagingHostCase(null)}
                className={`p-1 rounded-full ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200/80 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Current Host Banner */}
              <div className={`p-3.5 rounded-xl border space-y-2 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/70 border-blue-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}>Current Assigned Investigator</span>
                <div className="flex items-center justify-between">
                  <p className={`font-extrabold text-sm ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}>
                    {managingHostCase.assignedHostName || 'Unassigned'}
                  </p>
                  {managingHostCase.assignedHostName && managingHostCase.assignedHostName !== 'Unassigned' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteHostFromCase(managingHostCase.id)}
                      className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-lg font-bold flex items-center space-x-1 transition-all text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Investigator</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Select Host list */}
              <div>
                <label className={`block text-xs font-bold mb-2 ${
                  themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  Select Investigator to Assign or Replace:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {hostsList.map((h) => {
                    const isSelected = selectedHostForReassign === h.id;
                    return (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHostForReassign(h.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? themeMode === 'bright'
                              ? 'bg-blue-100/80 border-blue-500 text-blue-950 font-bold shadow-xs'
                              : 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : themeMode === 'bright'
                            ? 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-900' : ''}`}>{h.fullName}</p>
                          <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{h.department} • {h.email}</p>
                        </div>
                        <input
                          type="radio"
                          name="hostSelect"
                          checked={isSelected}
                          onChange={() => setSelectedHostForReassign(h.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${
                themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setManagingHostCase(null)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHostReassign}
                  className={`px-5 py-2 font-bold rounded-lg shadow-md ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  Save Investigator Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* DSP Create FIR Case Modal */}
      {showCreateCaseModal && (
        <DspCreateFirCaseModal
          isOpen={showCreateCaseModal}
          onClose={() => setShowCreateCaseModal(false)}
          themeMode={themeMode}
          hostsList={hostsList}
          onCreateCase={onCreateCase}
          onManageCaseSuspects={onManageCaseSuspects}
          onCreateSuspect={onCreateSuspect}
          initialCrimeHotspots={initialCrimeHotspots}
        />
      )}

      {/* DSP Case Suspect Modal */}
      {suspectModalCase && (
        <CaseSuspectModal
          c={suspectModalCase}
          isOpen={!!suspectModalCase}
          onClose={() => setSuspectModalCase(null)}
          suspects={suspects}
          currentUser={currentUser || ({ id: 'dsp-1', username: 'dsp_admin', fullName: 'DSP Officer', email: 'dsp@police.gov.in', phone: '9999999999', department: 'HQ', badgeId: 'DSP-001', status: 'Approved', role: 'DSP' })}
          onManageCaseSuspects={onManageCaseSuspects || (() => {})}
          onCreateSuspect={onCreateSuspect || (() => {})}
          onUpdateSuspect={onUpdateSuspect || (() => {})}
          themeMode={themeMode}
        />
      )}
    </div>
  );
};
