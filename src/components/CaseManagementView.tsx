import React, { useState } from 'react';
import { Case, User, Suspect, CrimeType } from '../types';
import {
  FolderLock,
  Search,
  Plus,
  Filter,
  UserCheck,
  Trash2,
  Calendar,
  Clock,
  ChevronRight,
  Shield,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  UserPlus,
  Users,
  MapPin,
  ExternalLink,
  ShieldAlert,
  UserX,
  X,
  Building2,
  Landmark,
  Send,
  ChevronDown,
  Edit3,
  Check,
  Activity,
  CheckSquare,
} from 'lucide-react';
import { CaseSuspectModal } from './CaseSuspectModal';
import { InvestigationProgressModal } from './InvestigationProgressModal';
import { NetworkingIcon } from './icons/NetworkingIcon';
import { CaseNetworkGraphModal } from './CaseNetworkGraphModal';
import { initialCrimeHotspots } from '../data/crimeHotspots';
import { isCaseInOfficerTalukas, getDistrictForTaluka, getDistrictOfficerForDistrict } from '../utils/caseUtils';

interface CaseManagementViewProps {
  cases: Case[];
  suspects?: Suspect[];
  currentUser: User;
  hostsList?: User[];
  officersList?: User[];
  subdivisionOfficersList?: User[];
  initialSubdivMode?: 'all' | 'major';
  onSelectCase: (c: Case, isReadOnly?: boolean) => void;
  onCreateCase?: (newCase: Case) => void;
  onUpdateCaseHost?: (caseId: string, hostId: string, hostName: string) => void;
  onDeleteHostFromCase?: (caseId: string) => void;
  onOpenSuspectsModal?: (c: Case) => void;
  onCreateSuspect?: (newSuspect: Suspect) => void;
  onManageCaseSuspects?: (caseId: string, suspectIds: string[]) => void;
  onUpdateSuspect?: (updatedSuspect: Suspect) => void;
  onAssignTeam?: (caseId: string, officerIds: string[]) => void;
  onAssignSubdivision?: (
    caseId: string,
    officerId: string,
    officerName: string,
    taluka?: string,
    policeStation?: string,
    notes?: string
  ) => void;
  onTakeChargeSubdivision?: (caseId: string, directives?: string) => void;
  onUpdateCaseDetails?: (caseId: string, updates: Partial<Case>) => void;
  onEscalateToHigherAuthority?: (
    caseId: string,
    data: { description: string; district: string; districtOfficerId: string; districtOfficerName: string }
  ) => void;
  themeMode?: 'dark' | 'bright';
}

export const CaseManagementView: React.FC<CaseManagementViewProps> = ({
  cases,
  suspects = [],
  currentUser,
  hostsList = [],
  officersList = [],
  subdivisionOfficersList = [],
  initialSubdivMode = 'all',
  onSelectCase,
  onCreateCase,
  onUpdateCaseHost,
  onDeleteHostFromCase,
  onOpenSuspectsModal,
  onCreateSuspect,
  onManageCaseSuspects,
  onUpdateSuspect,
  onAssignTeam,
  onAssignSubdivision,
  onTakeChargeSubdivision,
  onUpdateCaseDetails,
  onEscalateToHigherAuthority,
  themeMode = 'bright',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Subdivision Officer View Mode: 'all' (All Cases in assigned talukas) vs 'major' (Major Cases assigned by DSP)
  const [subdivisionViewMode, setSubdivisionViewMode] = useState<'all' | 'major'>(initialSubdivMode || 'all');

  React.useEffect(() => {
    if (initialSubdivMode) {
      setSubdivisionViewMode(initialSubdivMode);
    }
  }, [initialSubdivMode]);

  // Modals for Case Management
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [selectedCaseForHostAssign, setSelectedCaseForHostAssign] = useState<Case | null>(null);
  const [selectedHostId, setSelectedHostId] = useState<string>('');
  const [selectedCaseForSuspects, setSelectedCaseForSuspects] = useState<Case | null>(null);
  const [selectedCaseForNetwork, setSelectedCaseForNetwork] = useState<Case | null>(null);

  // Modal for Assigning Team (Police Officers)
  const [selectedCaseForTeamAssign, setSelectedCaseForTeamAssign] = useState<Case | null>(null);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [officerSearchQuery, setOfficerSearchQuery] = useState('');

  // Modal for High Authority (Subdivision Level Officer Assignment)
  const [selectedCaseForSubdivision, setSelectedCaseForSubdivision] = useState<Case | null>(null);
  const [selectedSubdivOfficerId, setSelectedSubdivOfficerId] = useState<string>('');
  const [subdivNotes, setSubdivNotes] = useState<string>('');
  const [subdivSuccessMsg, setSubdivSuccessMsg] = useState<string>('');

  // Modals for Subdivision Officer: Take Charge and Modify Case
  const [takeChargeCase, setTakeChargeCase] = useState<Case | null>(null);
  const [takeChargeDirectives, setTakeChargeDirectives] = useState<string>('');
  const [modifyCase, setModifyCase] = useState<Case | null>(null);
  const [modifyStatus, setModifyStatus] = useState<Case['status']>('Active');
  const [modifyPriority, setModifyPriority] = useState<Case['priority']>('High');
  const [modifyDirectives, setModifyDirectives] = useState<string>('');
  const [modifyDescription, setModifyDescription] = useState<string>('');
  const [selectedTaluka, setSelectedTaluka] = useState<string | null>(null);
  const [selectedCaseForProgress, setSelectedCaseForProgress] = useState<Case | null>(null);
  const [modifyProgressPercentage, setModifyProgressPercentage] = useState<number>(40);
  const [progressRefreshKey, setProgressRefreshKey] = useState<number>(0);

  // Helper to check if case belongs to specific taluka
  const isCaseInSpecificTaluka = (c: Case | null | undefined, taluka: string): boolean => {
    if (!c || !taluka) return false;
    const tl = taluka.toLowerCase().trim();
    const caseTaluka = (c.taluka || '').toLowerCase().trim();
    const subdivTaluka = (c.subdivisionTaluka || '').toLowerCase().trim();
    const caseLoc = (c.location || '').toLowerCase();
    const caseName = (c.caseName || '').toLowerCase();

    if (caseTaluka && (caseTaluka === tl || caseTaluka.includes(tl) || tl.includes(caseTaluka))) return true;
    if (subdivTaluka && (subdivTaluka === tl || subdivTaluka.includes(tl) || tl.includes(subdivTaluka))) return true;
    if (caseLoc.includes(tl)) return true;
    if (caseName.includes(tl)) return true;
    return false;
  };

  // Helper to get case progress percentage
  const getCaseProgressPercentage = (caseId: string): number => {
    try {
      const saved = localStorage.getItem(`investigation_progress_${caseId}`);
      if (saved) {
        const items = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0) {
          const completed = items.filter((i: any) => i.completed).length;
          return Math.round((completed / items.length) * 100);
        }
      }
    } catch {
      // Ignore
    }
    if (caseId === 'CR-2026-5521') return 40;
    if (caseId === 'CR-2026-5522') return 60;
    return 35;
  };

  // Helper to save case progress percentage to investigation steps
  const saveCaseProgressPercentage = (caseId: string, percentage: number) => {
    try {
      const localStorageKey = `investigation_progress_${caseId}`;
      let items: any[] = [];
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        try {
          items = JSON.parse(saved);
        } catch {
          items = [];
        }
      }
      if (!Array.isArray(items) || items.length === 0) {
        items = [
          { id: 'step-1', label: 'Complaint / FIR Registered', completed: true },
          { id: 'step-2', label: 'Crime Scene Examination', completed: false },
          { id: 'step-3', label: 'Evidence Collected & Documented', completed: false },
          { id: 'step-4', label: 'Witness Statements Recorded', completed: false },
          { id: 'step-5', label: 'Suspect(s) Identified', completed: false },
          { id: 'step-6', label: 'Suspect Investigation Completed', completed: false },
          { id: 'step-7', label: 'Forensic / Lab Reports Received', completed: false },
          { id: 'step-8', label: 'Evidence Correlation Completed', completed: false },
          { id: 'step-9', label: 'Investigation Report Prepared', completed: false },
          { id: 'step-10', label: 'Final Review Completed', completed: false, isFixedEnd: true },
        ];
      }
      const numCompleted = Math.round((percentage / 100) * items.length);
      const updated = items.map((item, idx) => ({
        ...item,
        completed: idx < numCompleted,
      }));
      localStorage.setItem(localStorageKey, JSON.stringify(updated));
      setProgressRefreshKey((prev) => prev + 1);
    } catch (e) {
      console.error('Failed to save progress percentage', e);
    }
  };

  // Create Case Form State (matching DSP create case)
  const [caseName, setCaseName] = useState('');
  const [crimeType, setCrimeType] = useState<CrimeType>('Bank Robbery');
  const [customCrimeType, setCustomCrimeType] = useState('');
  const [victimName, setVictimName] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const defaultDspTaluka = currentUser.taluka || (currentUser.talukas && currentUser.talukas[0]) || 'Karmala';
  const [location, setLocation] = useState(`${defaultDspTaluka} Main Market Area, ${defaultDspTaluka} Taluka, Solapur`);
  const [description, setDescription] = useState('');
  const [assignedHostId, setAssignedHostId] = useState(hostsList[0]?.id || 'u-host-1');
  const [priority, setPriority] = useState<'Routine' | 'High' | 'Critical'>('Critical');
  const [selectedSuspectIds, setSelectedSuspectIds] = useState<string[]>([]);

  const isSubdiv = currentUser.role === 'Subdivision Level';

  // Calculate Subdivision Officer's jurisdiction
  const officerTalukas =
    isSubdiv
      ? Array.isArray(currentUser.talukas) && currentUser.talukas.length > 0
        ? currentUser.talukas
        : ['Karmala', 'Barshi', 'Madha']
      : [];

  const allTalukaCases = cases.filter((c) => isCaseInOfficerTalukas(currentUser, c));
  const majorCases = cases.filter((c) => {
    const isDirectlyAssigned =
      c.assignedSubdivisionOfficerId === currentUser.id ||
      (c.assignedSubdivisionOfficerName &&
        c.assignedSubdivisionOfficerName.toLowerCase().includes(currentUser.fullName.toLowerCase()));
    if (isDirectlyAssigned) return true;
    if (c.isMajorCase && isCaseInOfficerTalukas(currentUser, c)) return true;
    return false;
  });

  // Filter cases based on role
  let roleCases = cases;
  if (currentUser.role === 'Host') {
    roleCases = cases.filter(
      (c) => c.assignedHostId === currentUser.id || c.assignedHostName?.toLowerCase().includes(currentUser.fullName.toLowerCase())
    );
  } else if (currentUser.role === 'Police Officer') {
    roleCases = cases.filter(
      (c) =>
        c.assignedOfficerIds?.includes(currentUser.id) ||
        c.assignedOfficerNames?.some((name) => name.toLowerCase().includes(currentUser.fullName.toLowerCase()))
    );
  } else if (currentUser.role === 'Subdivision Level') {
    const baseCases = subdivisionViewMode === 'all' ? allTalukaCases : majorCases;
    roleCases = selectedTaluka ? baseCases.filter((c) => isCaseInSpecificTaluka(c, selectedTaluka)) : baseCases;
  } else if (currentUser.role === 'District Level') {
    const userDistrict = (currentUser.district || 'solapur').toLowerCase().replace(' district', '').trim();
    roleCases = cases.filter((c) => {
      // User requirement: After clicking on the Assign Case button only that particular case should be displayed in the Case management of the District Level
      if (!c.isEscalatedToDistrict) return false;
      const caseDistrict = (c.district || getDistrictForTaluka(c.taluka || c.subdivisionTaluka)).toLowerCase().replace(' district', '').trim();
      return (
        c.assignedDistrictOfficerId === currentUser.id ||
        caseDistrict === userDistrict ||
        !c.assignedDistrictOfficerId
      );
    });
  } else if (currentUser.role === 'DSP') {
    roleCases = cases.filter((c) => isCaseInOfficerTalukas(currentUser, c));
  }

  // Higher Authority Modal State & Handlers
  const [higherAuthorityCase, setHigherAuthorityCase] = useState<Case | null>(null);
  const [higherAuthorityDescription, setHigherAuthorityDescription] = useState('');
  const [higherAuthorityError, setHigherAuthorityError] = useState('');
  const [higherAuthoritySuccess, setHigherAuthoritySuccess] = useState('');

  const getTalukaDistrict = (caseItem: Case) => {
    const taluka = caseItem.taluka || caseItem.subdivisionTaluka || (currentUser.talukas && currentUser.talukas[0]) || 'Karmala';
    return getDistrictForTaluka(taluka);
  };

  const getDistrictOfficer = (districtName: string) => {
    return getDistrictOfficerForDistrict(districtName, officersList);
  };

  const handleOpenHigherAuthorityModal = (c: Case) => {
    setHigherAuthorityCase(c);
    setHigherAuthorityDescription(c.districtNotes || '');
    setHigherAuthorityError('');
    setHigherAuthoritySuccess('');
  };

  const handleSubmitHigherAuthority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!higherAuthorityCase) return;
    if (!higherAuthorityDescription.trim()) {
      setHigherAuthorityError('Please enter District Level Enquiry Directives.');
      return;
    }
    const districtName = getTalukaDistrict(higherAuthorityCase);
    const districtOfficer = getDistrictOfficer(districtName);

    if (onEscalateToHigherAuthority) {
      onEscalateToHigherAuthority(higherAuthorityCase.id, {
        description: higherAuthorityDescription.trim(),
        district: districtName,
        districtOfficerId: districtOfficer.id,
        districtOfficerName: districtOfficer.fullName,
      });
    }

    setHigherAuthoritySuccess(
      `Case ${higherAuthorityCase.id} successfully assigned to District Level Officer (${districtOfficer.fullName} - ${districtName} District).`
    );
    setTimeout(() => {
      setHigherAuthorityCase(null);
      setHigherAuthorityDescription('');
      setHigherAuthoritySuccess('');
    }, 1200);
  };

  // Count metrics for filter tabs (matching Image 2)
  const awaitingHostCount = roleCases.filter((c) => !c.assignedHostId || c.assignedHostName === 'Unassigned').length;
  const activeCount = roleCases.filter((c) => c.status === 'Active').length;
  const underInvestigationCount = roleCases.filter((c) => c.status === 'Under Investigation').length;
  const solvedCount = roleCases.filter((c) => c.status === 'Solved').length;
  const pendingCount = roleCases.filter((c) => c.status === 'Pending').length;

  const filteredCases = roleCases.filter((c) => {
    const title = c.caseName || c.title || '';
    const id = c.id || '';
    const crime = c.crimeType || '';
    const loc = c.location || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.victimName && c.victimName.toLowerCase().includes(searchQuery.toLowerCase()));

    const isAwaitingHost = !c.assignedHostId || c.assignedHostName === 'Unassigned';
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : (statusFilter === 'Awaiting Host' || statusFilter === 'Awaiting Investigator')
        ? isAwaitingHost
        : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter available Police Officers for team assignment
  const filteredAvailableOfficers = officersList.filter((off) => {
    if (!officerSearchQuery.trim()) return true;
    const q = officerSearchQuery.toLowerCase();
    return (
      off.fullName?.toLowerCase().includes(q) ||
      off.badgeId?.toLowerCase().includes(q) ||
      off.department?.toLowerCase().includes(q) ||
      off.designation?.toLowerCase().includes(q)
    );
  });

  // Handle Host Assignment
  const handleAssignHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForHostAssign || !selectedHostId) return;

    const chosenHost = hostsList.find((h) => h.id === selectedHostId);
    if (chosenHost && onUpdateCaseHost) {
      onUpdateCaseHost(selectedCaseForHostAssign.id, chosenHost.id, chosenHost.fullName);
    }
    setSelectedCaseForHostAssign(null);
  };

  // Handle Case Creation
  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !victimName.trim() || !description.trim()) return;

    const selectedHostObj = hostsList.find((h) => h.id === assignedHostId) || hostsList[0];
    const finalCrimeType = crimeType === 'Other' ? (customCrimeType.trim() || 'Other') : crimeType;
    const finalLocation = location.trim() || 'Downtown Central Financial Sector, Sector 12, Metro City';

    const matchedHs = initialCrimeHotspots.find((hs) =>
      finalLocation.toLowerCase().includes(hs.areaName.toLowerCase())
    );
    const caseCoords: [number, number] = matchedHs
      ? [matchedHs.center[0] + (Math.random() - 0.5) * 0.004, matchedHs.center[1] + (Math.random() - 0.5) * 0.004]
      : [18.940 + (Math.random() - 0.5) * 0.01, 72.835 + (Math.random() - 0.5) * 0.01];

    const newCaseId = `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const caseTaluka = currentUser.taluka || (currentUser.talukas && currentUser.talukas[0]) || 'Karmala';
    const caseDistrict = currentUser.district || 'Solapur';
    const caseState = currentUser.state || 'Maharashtra';

    const newCase: Case = {
      id: newCaseId,
      crimeType: finalCrimeType,
      dateAssigned: new Date().toISOString().split('T')[0],
      caseName: caseName.trim(),
      victimName: victimName.trim(),
      witnessName: witnessName.trim() || undefined,
      location: finalLocation,
      taluka: caseTaluka,
      subdivisionTaluka: caseTaluka,
      district: caseDistrict,
      state: caseState,
      coordinates: caseCoords,
      description: description.trim(),
      status: 'Pending',
      assignedHostId: selectedHostObj ? selectedHostObj.id : 'u-host-1',
      assignedHostName: selectedHostObj ? selectedHostObj.fullName : 'Host Inspector Amit Verma',
      assignedOfficerIds: [],
      assignedOfficerNames: [],
      assignedAdvocateIds: [],
      assignedAdvocateNames: [],
      evidence: [],
      createdAt: new Date().toLocaleString(),
      priority: priority === 'Routine' ? 'Medium' : priority,
      timeline: [
        {
          id: `tl-${newCaseId}-1`,
          timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          title: 'Case Registered',
          description: `Complaint / FIR officially registered in the portal. Victim: ${victimName.trim()}. Investigation initialized in Pending state.`,
          performerName: currentUser.fullName,
          performerRole: currentUser.role,
          statusTag: 'Pending',
        },
      ],
    };

    if (onCreateCase) {
      onCreateCase(newCase);
    }

    // Reset Form
    setCaseName('');
    setVictimName('');
    setWitnessName('');
    setDescription('');
    setShowCreateCaseModal(false);
  };

  // Taluka jurisdiction automatically assigned to DSP
  const dspTalukas =
    currentUser.talukas && currentUser.talukas.length > 0
      ? currentUser.talukas
      : ['Karmala', 'Barshi', 'Madha'];
  const dspTaluka = dspTalukas[0];

  const targetTalukas = [
    ...dspTalukas,
    ...(selectedCaseForSubdivision?.taluka ? [selectedCaseForSubdivision.taluka] : []),
    ...(selectedCaseForSubdivision?.subdivisionTaluka ? [selectedCaseForSubdivision.subdivisionTaluka] : []),
  ];

  // Matching Subdivision Level Officers for that particular taluka in which the DSP is operating
  const matchingOfficers = (subdivisionOfficersList || []).filter((o) => {
    return (
      o.talukas?.some((t) =>
        targetTalukas.some(
          (target) =>
            target.toLowerCase().trim() === t.toLowerCase().trim() ||
            target.toLowerCase().includes(t.toLowerCase().trim()) ||
            t.toLowerCase().includes(target.toLowerCase().trim())
        )
      ) ||
      targetTalukas.some(
        (target) =>
          o.posting?.toLowerCase().includes(target.toLowerCase().trim()) ||
          o.department?.toLowerCase().includes(target.toLowerCase().trim())
      )
    );
  });
  const availableSubdivOfficers = matchingOfficers.length > 0 ? matchingOfficers : (subdivisionOfficersList || []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Page Header (Matching Image 2) */}
      <div className="border-b border-yellow-500/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/40">
            <FolderLock className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-yellow-400'}`}>
              Master Cases Ledger ({roleCases.length} Cases)
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
              {currentUser.role === 'DSP'
                ? `Assigned Jurisdiction: ${currentUser.state || 'Maharashtra'} • ${currentUser.district || 'Metro District'} • Taluka: ${(currentUser.talukas && currentUser.talukas[0]) || currentUser.taluka || 'Downtown Central'}`
                : 'Supervisory oversight of all departmental FIRs, active investigations, and judicial proceedings.'}
            </p>
          </div>
        </div>

        {/* DSP Action Button: Create New Case */}
        {currentUser.role === 'DSP' && (
          <button
            id="btn-create-new-case-cm"
            onClick={() => setShowCreateCaseModal(true)}
            className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-md transition-all flex items-center space-x-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Case</span>
          </button>
        )}
      </div>

      {/* Subdivision Level Two Options: 'All Cases' vs 'Major Cases' */}
      {currentUser.role === 'Subdivision Level' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: All Cases */}
            <div
              id="subdiv-tab-all-cases"
              role="button"
              tabIndex={0}
              onClick={() => setSubdivisionViewMode('all')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 select-none ${
                subdivisionViewMode === 'all'
                  ? themeMode === 'bright'
                    ? 'bg-gradient-to-r from-blue-50 to-white border-blue-600 shadow-md ring-2 ring-blue-400/30'
                    : 'bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border-blue-500 shadow-lg ring-2 ring-blue-500/20'
                  : themeMode === 'bright'
                  ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  subdivisionViewMode === 'all'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`text-base font-black ${
                        subdivisionViewMode === 'all'
                          ? themeMode === 'bright'
                            ? 'text-blue-950'
                            : 'text-blue-300'
                          : themeMode === 'bright'
                          ? 'text-slate-800'
                          : 'text-slate-200'
                      }`}
                    >
                      All Cases
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        subdivisionViewMode === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {allTalukaCases.length} Cases
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                    View Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  View all cases occurred or registered in your assigned talukas ({officerTalukas.join(', ')}). Monitor proceedings with view-only jurisdiction oversight.
                </p>
                <div className="mt-2 text-[11px] font-bold text-blue-400 flex items-center space-x-1.5">
                  <span className="text-slate-400">Assigned Talukas:</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    {officerTalukas.join(' • ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Option 2: Major Cases */}
            <div
              id="subdiv-tab-major-cases"
              role="button"
              tabIndex={0}
              onClick={() => setSubdivisionViewMode('major')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 select-none ${
                subdivisionViewMode === 'major'
                  ? themeMode === 'bright'
                    ? 'bg-gradient-to-r from-amber-50 to-white border-amber-600 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-yellow-500 shadow-lg ring-2 ring-yellow-500/20'
                  : themeMode === 'bright'
                  ? 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  subdivisionViewMode === 'major'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`text-base font-black ${
                        subdivisionViewMode === 'major'
                          ? themeMode === 'bright'
                            ? 'text-amber-950'
                            : 'text-yellow-300'
                          : themeMode === 'bright'
                          ? 'text-slate-800'
                          : 'text-slate-200'
                      }`}
                    >
                      Major Cases
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        subdivisionViewMode === 'major'
                          ? 'bg-yellow-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {majorCases.length} Escalated
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    High Authority Charge
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Special high-authority cases assigned by the SHO/Inspector Command. View, update, modify case details, and assume active charge of the investigation.
                </p>
                <div className="mt-2 text-[11px] font-bold text-amber-400 flex items-center space-x-1.5">
                  <span className="text-slate-400">Privileges:</span>
                  <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
                    Full Investigation Oversight, Take Charge & Modify
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Context Banner */}
          {subdivisionViewMode === 'all' ? (
            <div
              className={`p-3.5 px-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                themeMode === 'bright'
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : 'bg-blue-950/20 border-blue-900/50 text-blue-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-extrabold">
                  All Cases in Your Talukas ({officerTalukas.join(', ')})
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-slate-400">
                  Showing all {filteredCases.length} case cards registered in your assigned talukas. View-only access.
                </span>
              </div>
              <span className="font-bold text-[11px] text-blue-400 shrink-0">
                🔒 View Only Mode
              </span>
            </div>
          ) : (
            <div
              className={`p-3.5 px-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                themeMode === 'bright'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-extrabold">
                  Major Cases (Assigned by SHO/Inspector High Authority)
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-slate-400">
                  Showing {filteredCases.length} major cases assigned to you. You can take charge, update, and modify these cases.
                </span>
              </div>
              <span className="font-bold text-[11px] text-amber-400 shrink-0">
                ⚡ Full Authority & Modification
              </span>
            </div>
          )}
        </div>
      )}

      {/* Assigned Talukas Selection (Small Cards with just the name of taluka) for Subdivision Level Officer */}
      {isSubdiv && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-black uppercase tracking-wider ${
                themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
              }`}>
                Assigned Talukas:
              </span>
              <span className={`text-[11px] font-medium ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                ({subdivisionViewMode === 'all' ? 'Click a taluka card to view its cases' : 'Click a taluka card to view major cases assigned by SHO/Inspector'})
              </span>
            </div>
            {selectedTaluka && (
              <button
                type="button"
                id="btn-clear-taluka-filter"
                onClick={() => setSelectedTaluka(null)}
                className="text-xs font-bold text-blue-500 hover:text-blue-400 cursor-pointer underline"
              >
                Clear Filter (Show All Talukas)
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Show All Talukas card */}
            <button
              type="button"
              id="taluka-card-all"
              onClick={() => setSelectedTaluka(null)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-xs flex items-center justify-center min-w-[80px] ${
                selectedTaluka === null
                  ? themeMode === 'bright'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                    : 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-md ring-2 ring-yellow-400'
                  : themeMode === 'bright'
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <span>All Talukas</span>
            </button>

            {/* Specific Taluka Cards: Karmala, Barshi, Madha */}
            {officerTalukas.map((taluka) => {
              const isSelected = selectedTaluka?.toLowerCase() === taluka.toLowerCase();
              return (
                <button
                  key={taluka}
                  type="button"
                  id={`taluka-card-${taluka.toLowerCase()}`}
                  onClick={() => setSelectedTaluka(isSelected ? null : taluka)}
                  className={`px-5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shadow-xs flex items-center justify-center min-w-[100px] ${
                    isSelected
                      ? themeMode === 'bright'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                        : 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-md ring-2 ring-yellow-400'
                      : themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-blue-400'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-yellow-500/50'
                  }`}
                >
                  <span>{taluka}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Awaiting Host Notification Banner */}
      {currentUser.role === 'DSP' && awaitingHostCount > 0 && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          themeMode === 'bright'
            ? 'bg-amber-100/90 border-amber-300 text-amber-950'
            : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
        }`}>
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-black text-sm">
                {awaitingHostCount} Registered Case{awaitingHostCount > 1 ? 's' : ''} Awaiting Station Investigator Assignment
              </h4>
              <p className="text-xs opacity-85">
                Verified & registered by Police Officers. Please analyse case particulars and assign Station Investigator.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('Awaiting Investigator')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer shadow-md self-start sm:self-auto"
          >
            Filter Awaiting Investigator ({awaitingHostCount})
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar (Exact Matching Image 2) */}
      <div className={`p-4 rounded-2xl border space-y-4 ${
        themeMode === 'bright' ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900/80 border-blue-900/50'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className={`flex items-center space-x-1 p-1 rounded-xl text-xs sm:text-sm border overflow-x-auto max-w-full ${
            themeMode === 'bright' ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-blue-900/50'
          }`}>
            {[
              { label: 'ALL', count: roleCases.length },
              ...(currentUser.role === 'DSP' ? [{ label: 'Awaiting Investigator', count: awaitingHostCount }] : []),
              { label: 'Active', count: activeCount },
              { label: 'Under Investigation', count: underInvestigationCount },
              { label: 'Solved', count: solvedCount },
              { label: 'Pending', count: pendingCount },
            ].map(({ label, count }) => {
              const isSelected = statusFilter === label;
              return (
                <button
                  key={label}
                  onClick={() => setStatusFilter(label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-yellow-500 text-slate-950 font-black shadow-md'
                      : themeMode === 'bright'
                      ? 'text-slate-800 hover:bg-slate-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-slate-950 text-yellow-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 lg:flex-initial">
            <Search className={`w-4 h-4 absolute left-3 top-2.5 ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases by title, ID, crime type, or suspect..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all focus:outline-hidden ${
                themeMode === 'bright'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                  : 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Case Cards Grid (Image 2 & 3-Cards Per Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCases.length === 0 ? (
          <div className={`col-span-full p-12 rounded-2xl border border-dashed text-center space-y-3 ${
            themeMode === 'bright' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}>
            <Search className="w-8 h-8 text-yellow-500 mx-auto" />
            <h4 className="text-sm font-bold">No Matching Cases Found</h4>
            <p className="text-xs text-slate-500">
              {currentUser.role === 'DSP'
                ? `No cases found in your assigned taluka (${(currentUser.talukas && currentUser.talukas[0]) || currentUser.taluka || 'Downtown Central'}). Cases registered from this taluka will appear here.`
                : currentUser.role === 'Subdivision Level'
                ? 'No cases currently escalated to your Subdivisional Police Office by the SHO/Inspector. When cases are transferred, they will appear here.'
                : currentUser.role === 'District Level'
                ? 'No cases assigned to District Level yet. Cases assigned by Subdivision Level officers through Higher Authority Case Assignment will appear here.'
                : 'Try adjusting your completion status filter or search query.'}
            </p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const isDsp = currentUser.role === 'DSP';
            const isHost = currentUser.role === 'Host';
            const isSubdiv = currentUser.role === 'Subdivision Level';

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c, isSubdiv && subdivisionViewMode === 'all')}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] flex flex-col justify-between ${
                  themeMode === 'bright'
                    ? 'bg-gradient-to-r from-sky-100/80 via-blue-50/50 to-white border-2 border-sky-200 shadow-sm hover:border-blue-300 hover:shadow-md text-slate-900'
                    : 'bg-slate-900/80 border-blue-900/50 hover:bg-slate-900 hover:border-blue-700/60 text-slate-100 shadow-sm'
                }`}
              >
                <div>
                  {/* Top Row: Case ID, Type of Case, and Status */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex flex-wrap items-center gap-1 min-w-0">
                      <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        themeMode === 'bright'
                          ? 'bg-blue-100 text-blue-950 border-blue-300'
                          : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                      }`}>
                        {c.id}
                      </span>
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 max-w-[125px] truncate ${
                        themeMode === 'bright'
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : 'text-slate-300 bg-slate-800 border border-slate-700'
                      }`}>
                        {c.crimeType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {/* Networking Graph Icon on the left of case status */}
                      <button
                        type="button"
                        id={`btn-case-network-${c.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseForNetwork(c);
                        }}
                        className={`p-1 rounded-md border transition-all cursor-pointer active:scale-90 flex items-center justify-center ${
                          themeMode === 'bright'
                            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 shadow-xs'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-yellow-400 hover:text-yellow-300 border-slate-700 hover:border-yellow-500/50 shadow-xs'
                        }`}
                        title="Investigative Link & Entity Network Graph"
                      >
                        <NetworkingIcon className="w-3.5 h-3.5" />
                      </button>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                          c.status === 'Solved'
                            ? themeMode === 'bright'
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-extrabold'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : c.status === 'Under Investigation'
                            ? themeMode === 'bright'
                              ? 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold'
                              : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                            : c.status === 'Active'
                            ? themeMode === 'bright'
                              ? 'bg-red-100 text-red-950 border-red-400 font-extrabold'
                              : 'bg-red-500/20 text-red-400 border-red-500/50'
                            : themeMode === 'bright'
                            ? 'bg-yellow-100 text-amber-950 border-yellow-400 font-extrabold'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Case Name */}
                  <h3 className={`text-sm sm:text-base font-extrabold leading-snug mt-1 line-clamp-1 ${
                    themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {c.caseName || c.title}
                  </h3>

                  {/* Location */}
                  <div className={`flex items-center text-xs font-semibold mt-1 ${
                    themeMode === 'bright' ? 'text-red-700' : 'text-red-400'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </div>

                  {/* Subdivision Level: View Only (All Cases) Jurisdiction Tag */}
                  {isSubdiv && subdivisionViewMode === 'all' && (
                    <div className={`mt-1.5 flex items-center text-[10px] font-bold px-2 py-0.5 rounded border max-w-fit truncate ${
                      themeMode === 'bright'
                        ? 'bg-blue-50 text-blue-950 border-blue-200'
                        : 'bg-blue-950/40 text-blue-300 border-blue-800/50'
                    }`}>
                      <Shield className="w-3 h-3 mr-1 text-blue-500 shrink-0" />
                      <span className="truncate">
                        Taluka: {c.taluka || c.subdivisionTaluka || 'Jurisdictional Taluka'} • View Only
                      </span>
                    </div>
                  )}

                  {/* Horizontal line for Subdivision Level Major Cases directly below Location */}
                  {isSubdiv && subdivisionViewMode === 'major' && (
                    <hr className={`my-2.5 border-t ${
                      themeMode === 'bright' ? 'border-slate-300/80' : 'border-slate-800/80'
                    }`} />
                  )}

                  {/* Assigned High Authority (SDPO) Tag - displayed on outer card when appropriate for other roles */}
                  {c.assignedSubdivisionOfficerName && !['DSP', 'Host', 'Police Officer', 'Subdivision Level'].includes(currentUser.role) && (
                    <div className={`mt-1.5 flex items-center text-[10px] font-bold px-2 py-0.5 rounded border max-w-fit truncate ${
                      themeMode === 'bright'
                        ? 'bg-purple-50 text-purple-950 border-purple-200'
                        : 'bg-purple-950/40 text-purple-300 border-purple-800/50'
                    }`}>
                      <Landmark className="w-3 h-3 mr-1 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="truncate">
                        SDPO: {c.assignedSubdivisionOfficerName} {c.subdivisionTaluka ? `(${c.subdivisionTaluka})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Role Specific Action Buttons */}
                {isDsp && (
                  <div className={`flex flex-wrap items-center gap-1.5 pt-2.5 mt-2.5 border-t ${
                    themeMode === 'bright' ? 'border-slate-300/80' : 'border-slate-800/80'
                  }`}>
                    <button
                      type="button"
                      id={`btn-assign-host-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForHostAssign(c);
                        setSelectedHostId(c.assignedHostId || hostsList[0]?.id || '');
                      }}
                      className={`px-2 sm:px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400'
                          : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/40'
                      }`}
                      title="Assign Investigator from available Investigators"
                    >
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden xs:inline">Assign</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-suspect-dsp-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForSuspects(c);
                      }}
                      className={`px-2 sm:px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300'
                          : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                      }`}
                      title="Add suspect from existing or create new suspect"
                    >
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden xs:inline">Suspect</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-high-authority-dsp-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForSubdivision(c);
                        const initialOfficerId =
                          c.assignedSubdivisionOfficerId ||
                          (availableSubdivOfficers.length > 0 ? availableSubdivOfficers[0].id : '');
                        setSelectedSubdivOfficerId(initialOfficerId);
                        setSubdivNotes(c.subdivisionNotes || '');
                        setSubdivSuccessMsg('');
                      }}
                      className={`px-2 sm:px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        c.assignedSubdivisionOfficerId
                          ? themeMode === 'bright'
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-300'
                            : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/40'
                          : themeMode === 'bright'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                      }`}
                      title="Assign case to Subdivision Level Officer from available subdivision officers of that taluka's police station"
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="whitespace-nowrap hidden xs:inline">High Authority</span>
                    </button>
                  </div>
                )}

                {/* Subdivision Level: All Cases Footer (View Only) */}
                {isSubdiv && subdivisionViewMode === 'all' && (
                  <div className={`flex items-center justify-between pt-2.5 mt-2.5 border-t text-xs font-bold ${
                    themeMode === 'bright' ? 'border-slate-300/80 text-blue-900' : 'border-slate-800/80 text-blue-400'
                  }`}>
                    <span className="flex items-center text-[11px] text-blue-400">
                      <Shield className="w-3.5 h-3.5 mr-1" />
                      <span>Taluka Jurisdiction (View Only)</span>
                    </span>
                    <span className="flex items-center text-[11px] hover:underline cursor-pointer">
                      <span>View Case Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                )}

                {/* Subdivision Level: Major Cases Action Buttons ('Modify', 'Assign', 'Suspect', 'Higher Authority' ONLY) */}
                {isSubdiv && subdivisionViewMode === 'major' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      id={`btn-modify-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModifyCase(c);
                        setModifyStatus(c.status);
                        setModifyPriority(c.priority);
                        setModifyDirectives(c.subdivisionNotes || '');
                        setModifyDescription(c.description || '');
                        setModifyProgressPercentage(getCaseProgressPercentage(c.id));
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-950 border-blue-300'
                          : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/40'
                      }`}
                      title="Modify Case"
                    >
                      <Edit3 className="w-3.5 h-3.5 shrink-0" />
                      <span>Modify</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-assign-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForHostAssign(c);
                        setSelectedHostId(c.assignedHostId || hostsList[0]?.id || '');
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                          : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/40'
                      }`}
                      title="Assign Investigator / Officer"
                    >
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Assign</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-suspect-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForSuspects(c);
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300'
                          : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                      }`}
                      title="Manage Suspects"
                    >
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span>Suspect</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-higher-authority-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenHigherAuthorityModal(c);
                      }}
                      className={`px-2.5 sm:px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        c.isEscalatedToDistrict
                          ? themeMode === 'bright'
                            ? 'bg-amber-200 text-amber-950 border-amber-400'
                            : 'bg-amber-500/30 text-amber-200 border-amber-500/50'
                          : themeMode === 'bright'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                      }`}
                      title="Escalate to Higher Authority (District Level Officer)"
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden sm:inline">{c.isEscalatedToDistrict ? 'Higher Authority (Assigned)' : 'Higher Authority'}</span>
                      <span className="sm:hidden">{c.isEscalatedToDistrict ? 'Assigned' : 'Authority'}</span>
                    </button>
                  </div>
                )}

                {/* District Level Officer Actions ('Assign', 'Suspect' ONLY) */}
                {currentUser.role === 'District Level' && (
                  <div className={`flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t ${
                    themeMode === 'bright' ? 'border-slate-300/80' : 'border-slate-800/80'
                  }`}>
                    <button
                      type="button"
                      id={`btn-district-assign-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForHostAssign(c);
                        setSelectedHostId(c.assignedHostId || hostsList[0]?.id || '');
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                          : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/40'
                      }`}
                      title="Assign Investigator / Officer to Case"
                    >
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Assign</span>
                    </button>
                    <button
                      type="button"
                      id={`btn-district-suspect-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForSuspects(c);
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300'
                          : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                      }`}
                      title="Manage and Add Suspects"
                    >
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span>Suspect</span>
                    </button>
                  </div>
                )}

                {isHost && (
                  <div className={`flex flex-wrap items-center gap-1.5 pt-2.5 mt-2.5 border-t ${
                    themeMode === 'bright' ? 'border-slate-300/80' : 'border-slate-800/80'
                  }`}>
                    <button
                      type="button"
                      id={`btn-assign-team-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForTeamAssign(c);
                        setSelectedOfficerIds(c.assignedOfficerIds || []);
                        setOfficerSearchQuery('');
                      }}
                      className={`px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-950 border-blue-300'
                          : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/40'
                      }`}
                      title="Assign other police officers from available police officers"
                    >
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Team</span>
                    </button>

                    <button
                      type="button"
                      id={`btn-suspect-host-${c.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseForSuspects(c);
                      }}
                      className={`px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        themeMode === 'bright'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-950 border-rose-300'
                          : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                      }`}
                      title="Add suspect from existing or create new suspect"
                    >
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span>Suspect</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* DSP Create Case Modal */}
      {showCreateCaseModal && (
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
              <h3 className={`text-lg font-bold flex items-center ${
                themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
              }`}>
                <Shield className={`w-5 h-5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> Create & Assign New Case FIR
              </h3>
              <button
                onClick={() => setShowCreateCaseModal(false)}
                className={`p-1.5 rounded-full ${
                  themeMode === 'bright' ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Crime Type *</label>
                  <select
                    value={crimeType}
                    onChange={(e) => setCrimeType(e.target.value as CrimeType)}
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                    }`}
                  >
                    <option value="Bank Robbery">Bank Robbery</option>
                    <option value="Homicide">Homicide</option>
                    <option value="Cyber Attack">Cyber Attack</option>
                    <option value="Narcotics Distribution">Narcotics Distribution</option>
                    <option value="Kidnapping">Kidnapping</option>
                    <option value="Vehicle Theft">Vehicle Theft</option>
                    <option value="Extortion">Extortion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-bold ${
                      themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                    }`}
                  >
                    <option value="Routine">Routine</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Case Title / FIR Name *</label>
                <input
                  type="text"
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  placeholder="e.g. City Central Bank Vault Heist"
                  className={`w-full px-3 py-2 rounded-lg text-xs ${
                    themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Victim / Complainant Name *</label>
                  <input
                    type="text"
                    value={victimName}
                    onChange={(e) => setVictimName(e.target.value)}
                    placeholder="e.g. Rajesh Khurana"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Key Witness (Optional)</label>
                  <input
                    type="text"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    placeholder="e.g. Ramesh Kadam (Security Guard)"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Incident Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs ${
                    themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Assign Station Investigator *</label>
                <select
                  value={assignedHostId}
                  onChange={(e) => setAssignedHostId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-bold ${
                    themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                  }`}
                >
                  {hostsList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.fullName} ({h.badgeId}) - {h.department || 'Station Investigator'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Case Description & FIR Summary *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of crime, time of occurrence, recovered evidence notes..."
                  className={`w-full px-3 py-2 rounded-lg text-xs ${
                    themeMode === 'bright' ? 'bg-white border border-slate-300 text-slate-900' : 'bg-slate-900 border border-blue-900/60 text-slate-100'
                  }`}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCaseModal(false)}
                  className="px-4 py-2 rounded-lg border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  Create & Dispatch FIR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DSP Host Reassign Modal */}
      {selectedCaseForHostAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
            themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-yellow-500/30 text-slate-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30 mb-4">
              <h3 className="text-base font-black flex items-center text-yellow-500">
                <UserCheck className="w-5 h-5 mr-2" />
                <span>Assign / Reassign Station Investigator</span>
              </h3>
              <button
                onClick={() => setSelectedCaseForHostAssign(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignHostSubmit} className="space-y-4">
              <p className="text-xs text-slate-400">
                Assigning investigator for Case <strong className="text-yellow-500">{selectedCaseForHostAssign.id}</strong> ({selectedCaseForHostAssign.caseName || selectedCaseForHostAssign.title})
              </p>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Select Station Investigator</label>
                <select
                  value={selectedHostId}
                  onChange={(e) => setSelectedHostId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                  required
                >
                  {hostsList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.fullName} ({h.badgeId}) - {h.department || 'Station Investigator'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedCaseForHostAssign(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Host Assign Investigation Team from Police Officers Modal */}
      {selectedCaseForTeamAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-2xl my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-50 text-slate-900 border-slate-300'
                : 'bg-slate-950 text-slate-100 border-yellow-500/30'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                themeMode === 'bright'
                  ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950'
                  : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-xl ${
                    themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    Assign Police Officers Team
                  </h3>
                  <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Case <span className="font-mono font-bold text-yellow-500">{selectedCaseForTeamAssign.id}</span> • {selectedCaseForTeamAssign.caseName || selectedCaseForTeamAssign.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseForTeamAssign(null)}
                className={`p-1.5 rounded-full ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Instructions and summary */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                  themeMode === 'bright'
                    ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                    : 'bg-slate-900/90 border-blue-900/50 text-slate-300'
                }`}
              >
                <div>
                  <p className="font-bold">
                    Select Police Officers to form the investigation team:
                  </p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Assigned officers will receive case assignment, forensic logs access, and field investigation duties.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-black border ${
                      selectedOfficerIds.length > 0
                        ? themeMode === 'bright'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-yellow-500 text-slate-950 border-yellow-400'
                        : themeMode === 'bright'
                        ? 'bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {selectedOfficerIds.length} Selected
                  </span>
                </div>
              </div>

              {/* Search & Bulk Selection Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className={`w-4 h-4 absolute left-3 top-2.5 ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={officerSearchQuery}
                    onChange={(e) => setOfficerSearchQuery(e.target.value)}
                    placeholder="Search available officers by name, badge, department, rank..."
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-hidden ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                        : 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-yellow-500'
                    }`}
                  />
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = filteredAvailableOfficers.map((o) => o.id);
                      setSelectedOfficerIds(allIds);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      themeMode === 'bright'
                        ? 'bg-white hover:bg-slate-100 text-blue-900 border-slate-300'
                        : 'bg-slate-900 hover:bg-slate-800 text-yellow-400 border-slate-700'
                    }`}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOfficerIds([])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      themeMode === 'bright'
                        ? 'bg-white hover:bg-slate-100 text-red-700 border-slate-300'
                        : 'bg-slate-900 hover:bg-slate-800 text-red-400 border-slate-700'
                    }`}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Display all available Police Officers */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredAvailableOfficers.length === 0 ? (
                  <div
                    className={`p-8 rounded-xl border border-dashed text-center text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-500'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <UserX className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="font-bold">No Police Officers Found</p>
                    <p className="text-[11px] mt-1">
                      {officerSearchQuery
                        ? 'No officers match your search query.'
                        : 'No approved Police Officers are currently available in the directory.'}
                    </p>
                  </div>
                ) : (
                  filteredAvailableOfficers.map((officer) => {
                    const isSelected = selectedOfficerIds.includes(officer.id);
                    return (
                      <div
                        key={officer.id}
                        onClick={() => {
                          setSelectedOfficerIds((prev) =>
                            prev.includes(officer.id)
                              ? prev.filter((id) => id !== officer.id)
                              : [...prev, officer.id]
                          );
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? themeMode === 'bright'
                              ? 'bg-blue-50/90 border-2 border-blue-600 shadow-xs'
                              : 'bg-yellow-500/15 border-2 border-yellow-400 shadow-xs'
                            : themeMode === 'bright'
                            ? 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Checkbox indicator */}
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? themeMode === 'bright'
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'bg-yellow-500 border-yellow-400 text-slate-950 font-black'
                                : 'border-slate-400 bg-transparent'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>

                          {/* Officer Avatar */}
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                              isSelected
                                ? themeMode === 'bright'
                                  ? 'bg-blue-200 text-blue-950'
                                  : 'bg-yellow-500/30 text-yellow-300'
                                : themeMode === 'bright'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            👮
                          </div>

                          {/* Officer Details */}
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4
                                className={`text-xs sm:text-sm font-extrabold truncate ${
                                  isSelected
                                    ? themeMode === 'bright'
                                      ? 'text-blue-950'
                                      : 'text-yellow-300 font-black'
                                    : themeMode === 'bright'
                                    ? 'text-slate-900'
                                    : 'text-slate-100'
                                }`}
                              >
                                {officer.fullName}
                              </h4>
                              <span
                                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  isSelected
                                    ? themeMode === 'bright'
                                      ? 'bg-blue-100 border-blue-300 text-blue-900'
                                      : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                                    : themeMode === 'bright'
                                    ? 'bg-slate-100 border-slate-300 text-slate-600'
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                              >
                                {officer.badgeId || officer.id}
                              </span>
                            </div>

                            <p className={`text-[11px] truncate mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                              <span className="font-semibold">{officer.designation || 'Police Officer'}</span>
                              {officer.department && <span> • {officer.department}</span>}
                              {officer.experience && <span> • Exp: {officer.experience}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Selected status tag */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center space-x-1 ${
                                themeMode === 'bright'
                                  ? 'bg-blue-100 text-blue-950 border-blue-400'
                                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                              }`}
                            >
                              <span>✓ In Team</span>
                            </span>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                themeMode === 'bright'
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              + Add to Team
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`p-4 border-t flex items-center justify-between ${
                themeMode === 'bright' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedCaseForTeamAssign(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  themeMode === 'bright'
                    ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onAssignTeam && selectedCaseForTeamAssign) {
                    onAssignTeam(selectedCaseForTeamAssign.id, selectedOfficerIds);
                  }
                  setSelectedCaseForTeamAssign(null);
                }}
                className={`px-5 py-2 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1.5 ${
                  themeMode === 'bright'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Team ({selectedOfficerIds.length} Officers Assigned)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High Authority (Subdivision Level Officer Assignment) Modal */}
      {selectedCaseForSubdivision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-2xl my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-50 text-slate-900 border-slate-300'
                : 'bg-slate-950 text-slate-100 border-yellow-500/30'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                themeMode === 'bright'
                  ? 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border-slate-200 text-slate-950'
                  : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    themeMode === 'bright'
                      ? 'bg-amber-100 border-amber-300 text-amber-950'
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-black flex items-center ${
                      themeMode === 'bright' ? 'text-amber-950' : 'text-yellow-400'
                    }`}
                  >
                    High Authority Case Assignment
                  </h3>
                  <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {selectedCaseForSubdivision.id} • {selectedCaseForSubdivision.caseName || selectedCaseForSubdivision.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCaseForSubdivision(null);
                  setSubdivSuccessMsg('');
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'hover:bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Small description text required by prompt */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  themeMode === 'bright'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <Landmark className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-yellow-400" />
                  <p>
                    <strong>Subdivision Level Enquiry Transfer:</strong> Assign this case to a Subdivision Level Officer (SDPO) from the available officers of that particular taluka&apos;s police station. Once sent, this case card will be exclusively dispatched to that Subdivision Level Officer&apos;s Case Management for further enquiry with full administrative and supervisory access.
                  </p>
                </div>
              </div>

              {/* Currently Assigned Status */}
              {selectedCaseForSubdivision.assignedSubdivisionOfficerName && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    themeMode === 'bright'
                      ? 'bg-purple-50 border-purple-200 text-purple-950'
                      : 'bg-purple-950/30 border-purple-800/40 text-purple-200'
                  }`}
                >
                  <span className="font-bold">Currently Assigned High Authority:</span>
                  <span className="font-extrabold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900/60">
                    {selectedCaseForSubdivision.assignedSubdivisionOfficerName} (
                    {selectedCaseForSubdivision.subdivisionTaluka || 'Subdivision'})
                  </span>
                </div>
              )}

              {/* Taluka Jurisdiction (Auto-displayed as per DSP assigned taluka) */}
              <div>
                <label className={`block text-xs font-black uppercase mb-1.5 ${
                  themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  Taluka / Police Station Jurisdiction
                </label>
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    themeMode === 'bright'
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-4 h-4 text-amber-600 dark:text-yellow-400 shrink-0" />
                    <div>
                      <span className="text-xs font-black">{dspTaluka} Taluka</span>
                      <span className={`text-[11px] block ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {dspTaluka} Police Station Sub-Division Jurisdiction
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      themeMode === 'bright'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                    }`}
                  >
                    Assigned to SHO/Inspector
                  </span>
                </div>
              </div>

              {/* Dropdown Options for Selecting Subdivision Level Officer */}
              <div>
                <label
                  htmlFor="subdivision-officer-dropdown"
                  className={`block text-xs font-black uppercase mb-1.5 ${
                    themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                  }`}
                >
                  Select Subdivision Level Officer ({availableSubdivOfficers.length} Available in {dspTaluka})
                </label>

                <div className="relative">
                  <select
                    id="subdivision-officer-dropdown"
                    value={selectedSubdivOfficerId}
                    onChange={(e) => setSelectedSubdivOfficerId(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold transition-all focus:outline-hidden appearance-none cursor-pointer pr-10 ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 shadow-xs'
                    }`}
                  >
                    <option value="" disabled>
                      -- Select Subdivision Level Officer (SDPO) for {dspTaluka} --
                    </option>
                    {availableSubdivOfficers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.fullName} ({officer.badgeId || officer.badgeNumber || officer.id}) — {officer.posting || `${dspTaluka} Police Station & SDPO`}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Selected Officer Details Preview Card */}
                {(() => {
                  const selectedOfficer = availableSubdivOfficers.find((o) => o.id === selectedSubdivOfficerId) ||
                    (subdivisionOfficersList || []).find((o) => o.id === selectedSubdivOfficerId);
                  if (!selectedOfficer) return null;
                  return (
                    <div
                      className={`mt-2.5 p-3 rounded-xl border flex items-center justify-between transition-all ${
                        themeMode === 'bright'
                          ? 'bg-gradient-to-r from-amber-50/90 to-white border-amber-300 text-slate-900 shadow-xs'
                          : 'bg-yellow-500/10 border-yellow-500/30 text-slate-100 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                            themeMode === 'bright'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-yellow-500 text-slate-950 shadow-2xs'
                          }`}
                        >
                          SDPO
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black">{selectedOfficer.fullName}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                themeMode === 'bright'
                                  ? 'bg-white border-slate-300 text-slate-700'
                                  : 'bg-slate-800 border-slate-700 text-slate-300'
                              }`}
                            >
                              {selectedOfficer.badgeId || selectedOfficer.badgeNumber || selectedOfficer.id}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                            }`}
                          >
                            {selectedOfficer.posting || `${dspTaluka} Police Station & SDPO`} • Taluka: {dspTaluka}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                            themeMode === 'bright'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Selected</span>
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Enquiry Directives / Notes */}
              <div>
                <label className={`block text-xs font-black uppercase mb-1.5 ${
                  themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  Subdivision Enquiry Directives / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={subdivNotes}
                  onChange={(e) => setSubdivNotes(e.target.value)}
                  placeholder="Provide enquiry scope, focal points, or special instructions for the Subdivision Level Officer..."
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium transition-all focus:outline-hidden ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                      : 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
                  }`}
                />
              </div>

              {/* Success Notification */}
              {subdivSuccessMsg && (
                <div className={`p-3 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                  themeMode === 'bright'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{subdivSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={`p-4 border-t flex items-center justify-between ${
                themeMode === 'bright' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedCaseForSubdivision(null);
                  setSubdivSuccessMsg('');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  themeMode === 'bright'
                    ? 'bg-white hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedSubdivOfficerId}
                id="btn-send-case-subdivision"
                onClick={() => {
                  if (!selectedSubdivOfficerId || !selectedCaseForSubdivision) return;
                  const officer = subdivisionOfficersList.find((o) => o.id === selectedSubdivOfficerId);
                  if (!officer) return;

                  if (onAssignSubdivision) {
                    const assignedTaluka =
                      selectedCaseForSubdivision.taluka ||
                      (officer.talukas && officer.talukas[0]) ||
                      dspTaluka;
                    onAssignSubdivision(
                      selectedCaseForSubdivision.id,
                      officer.id,
                      officer.fullName,
                      assignedTaluka,
                      officer.posting || `${assignedTaluka} Police Station & SDPO`,
                      subdivNotes
                    );
                  }

                  setSubdivSuccessMsg(`Case ${selectedCaseForSubdivision.id} successfully escalated to SDPO ${officer.fullName} as a Major Case.`);
                  setTimeout(() => {
                    setSelectedCaseForSubdivision(null);
                    setSubdivSuccessMsg('');
                  }, 900);
                }}
                className={`px-5 py-2 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1.5 ${
                  !selectedSubdivOfficerId
                    ? 'opacity-50 cursor-not-allowed bg-slate-500 text-slate-200'
                    : themeMode === 'bright'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Escalate & Assign Major Case</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Charge of Investigation Modal for Subdivision Level Officer */}
      {takeChargeCase && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl transition-all ${
              themeMode === 'bright'
                ? 'bg-white border-amber-300 text-slate-900'
                : 'bg-slate-900 border-yellow-500/40 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Take Charge of Investigation</h3>
                  <span className="text-xs text-slate-400">
                    Case {takeChargeCase.id} • {takeChargeCase.crimeType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTakeChargeCase(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                themeMode === 'bright'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
              }`}
            >
              <p className="font-bold text-sm">
                {takeChargeCase.caseName || takeChargeCase.title}
              </p>
              <p className="text-slate-400">
                Location: {takeChargeCase.location} • Taluka: {takeChargeCase.taluka || takeChargeCase.subdivisionTaluka || 'Subdivision'}
              </p>
              <p className="text-[11px] text-amber-400 mt-1 font-semibold">
                As the Subdivision Level Officer (SDPO), taking charge officially records your high-authority leadership over this major case investigation, as assigned by the SHO/Inspector Command.
              </p>
            </div>

            <div>
              <label
                className={`block text-xs font-black uppercase mb-1.5 ${
                  themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                }`}
              >
                SDPO Directives / Initial Action Orders
              </label>
              <textarea
                rows={3}
                value={takeChargeDirectives}
                onChange={(e) => setTakeChargeDirectives(e.target.value)}
                placeholder="Enter investigation orders, forensic review directives, team summons..."
                className={`w-full p-3 rounded-xl border text-xs font-bold transition-all focus:outline-hidden ${
                  themeMode === 'bright'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-600'
                    : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-500'
                }`}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => setTakeChargeCase(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-take-charge"
                onClick={() => {
                  if (onTakeChargeSubdivision && takeChargeCase) {
                    onTakeChargeSubdivision(takeChargeCase.id, takeChargeDirectives);
                  }
                  setTakeChargeCase(null);
                }}
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Confirm & Take Charge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify & Update Case Modal for Subdivision Level Officer */}
      {modifyCase && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl transition-all ${
              themeMode === 'bright'
                ? 'bg-white border-blue-300 text-slate-900'
                : 'bg-slate-900 border-blue-500/40 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Update & Modify Major Case</h3>
                  <span className="text-xs text-slate-400">
                    Case {modifyCase.id} • {modifyCase.crimeType}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModifyCase(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-black uppercase mb-1 ${
                      themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                    }`}
                  >
                    Investigation Status
                  </label>
                  <select
                    value={modifyStatus}
                    onChange={(e) => setModifyStatus(e.target.value as Case['status'])}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Pending">Pending</option>
                    <option value="Solved">Solved</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-black uppercase mb-1 ${
                      themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                    }`}
                  >
                    Priority Level
                  </label>
                  <select
                    value={modifyPriority}
                    onChange={(e) => setModifyPriority(e.target.value as Case['priority'])}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Routine">Routine</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                  }`}
                >
                  High Authority Directives & Notes
                </label>
                <textarea
                  rows={3}
                  value={modifyDirectives}
                  onChange={(e) => setModifyDirectives(e.target.value)}
                  placeholder="Directives for forensic examination, witness summons..."
                  className={`w-full p-3 rounded-xl border text-xs font-bold ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-black uppercase mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                  }`}
                >
                  Case Description & Particulars
                </label>
                <textarea
                  rows={2}
                  value={modifyDescription}
                  onChange={(e) => setModifyDescription(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              {/* Investigation Progress Bar & Step Manager */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black uppercase flex items-center space-x-1.5 ${
                    themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                  }`}>
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Investigation Progress Bar</span>
                  </span>
                  <span className="font-mono text-sm font-extrabold text-blue-500">
                    {modifyProgressPercentage}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={modifyProgressPercentage}
                  onChange={(e) => setModifyProgressPercentage(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                <div className="flex items-center justify-between gap-1 pt-1">
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setModifyProgressPercentage(pct)}
                      className={`px-2 py-1 rounded-md text-[10px] font-extrabold border cursor-pointer transition-all ${
                        modifyProgressPercentage === pct
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : themeMode === 'bright'
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const c = modifyCase;
                      setModifyCase(null);
                      setSelectedCaseForProgress(c);
                    }}
                    className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer ml-auto flex items-center space-x-1 shadow-xs"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>Checklist</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => setModifyCase(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-save-modify-case"
                onClick={() => {
                  if (modifyCase) {
                    saveCaseProgressPercentage(modifyCase.id, modifyProgressPercentage);
                    if (onUpdateCaseDetails) {
                      onUpdateCaseDetails(modifyCase.id, {
                        status: modifyStatus,
                        priority: modifyPriority,
                        subdivisionNotes: modifyDirectives,
                        description: modifyDescription,
                      });
                    }
                  }
                  setModifyCase(null);
                }}
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save & Update Case</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Suspect Modal for DSP and Host */}
      {selectedCaseForSuspects && (
        <CaseSuspectModal
          c={selectedCaseForSuspects}
          isOpen={!!selectedCaseForSuspects}
          onClose={() => setSelectedCaseForSuspects(null)}
          suspects={suspects}
          currentUser={currentUser}
          onManageCaseSuspects={onManageCaseSuspects || (() => {})}
          onCreateSuspect={onCreateSuspect || (() => {})}
          onUpdateSuspect={onUpdateSuspect || (() => {})}
          themeMode={themeMode}
        />
      )}

      {/* Investigation Progress Modal for Subdivision Level Officer */}
      {selectedCaseForProgress && (
        <InvestigationProgressModal
          c={selectedCaseForProgress}
          isOpen={!!selectedCaseForProgress}
          onClose={() => {
            setSelectedCaseForProgress(null);
            setProgressRefreshKey((prev) => prev + 1);
          }}
          currentUser={currentUser}
          themeMode={themeMode}
        />
      )}

      {/* Higher Authority Escalation Modal for Subdivision Level Officer */}
      {higherAuthorityCase && (
        <div
          id="modal-higher-authority-escalation"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setHigherAuthorityCase(null)}
        >
          <div
            className="w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] rounded-2xl border-2 border-amber-300 bg-white text-slate-900 shadow-2xl relative flex flex-col overflow-hidden transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Template Header (Light shade of yellow + white) */}
            <div className="shrink-0 px-5 py-4 border-b border-amber-200/90 bg-gradient-to-r from-amber-100/95 via-yellow-50 to-amber-100/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-850 border border-amber-400/40 shadow-xs">
                  <Building2 className="w-6 h-6 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 border border-amber-300">
                      Official Requisition
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-800">
                      REF: ESC-DIST-{higherAuthorityCase.id}
                    </span>
                  </div>
                  <h3 id="heading-higher-authority-case-assignment" className="text-base sm:text-lg font-black text-amber-950 tracking-tight mt-0.5">
                    Higher Authority Case Assignment
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Official Transfer of Case Enquiry & Directives to District Level
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-higher-authority-modal"
                onClick={() => setHigherAuthorityCase(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-amber-200/60 transition-all cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHigherAuthority} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Scrollable Template Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white via-amber-50/20 to-white">
                {/* 1. Case Particulars Summary Card */}
                <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 text-xs space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-amber-900 px-2.5 py-0.5 rounded-md bg-amber-200/60 border border-amber-300">
                      {higherAuthorityCase.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-bold text-[10px] tracking-wide uppercase shadow-2xs">
                      {higherAuthorityCase.crimeType}
                    </span>
                  </div>
                  <div className="font-black text-sm text-slate-900">
                    {higherAuthorityCase.caseName || higherAuthorityCase.title}
                  </div>
                  <div className="flex items-center text-slate-600 text-[11px] gap-2 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="truncate">{higherAuthorityCase.location}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-slate-800">
                      Taluka: {higherAuthorityCase.taluka || higherAuthorityCase.subdivisionTaluka || 'Karmala'}
                    </span>
                  </div>
                </div>

                {/* 2. District level Enquiry Transfer and details */}
                <div className="p-3.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/90 to-yellow-50/80 text-slate-800 space-y-1.5 shadow-2xs">
                  <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider text-amber-900">
                    <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-black">District Level Enquiry Transfer</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    Official transfer of case enquiry jurisdiction, statutory oversight, and supervisory directives to the District Administration and District Police Headquarters. This delegates higher inquiry authority and activates updating permissions for the District Level Officer.
                  </p>
                </div>

                {/* 3. Talukas assigned to that subdivision level officer */}
                {(() => {
                  const officerTalukas = Array.isArray(currentUser.talukas) && currentUser.talukas.length > 0
                    ? currentUser.talukas
                    : ['Karmala', 'Barshi', 'Madha'];
                  return (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Talukas Assigned to Subdivision Level Officer
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {officerTalukas.map((talukaName) => (
                          <span
                            key={talukaName}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200 bg-white text-amber-950 flex items-center gap-1.5 shadow-2xs"
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{talukaName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Name of the District Level officer of that Particular District of that Talukas */}
                {(() => {
                  const targetDistrict = getTalukaDistrict(higherAuthorityCase);
                  const targetOfficer = getDistrictOfficer(targetDistrict);
                  return (
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-white shadow-2xs flex items-start space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-300 text-amber-700 shrink-0 mt-0.5">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="text-xs space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Particular District: <span className="text-amber-900 font-black">{targetDistrict} District</span>
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                            District Authority
                          </span>
                        </div>
                        <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Name of District Level Officer: <span className="text-amber-900 font-black">{targetOfficer.fullName}</span></span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {targetOfficer.designation} • {targetOfficer.department}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 5. District Level Enquiry Directives for writing the text */}
                <div className="space-y-1.5">
                  <label htmlFor="input-district-enquiry-directives" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                    District Level Enquiry Directives <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="input-district-enquiry-directives"
                    rows={4}
                    value={higherAuthorityDescription}
                    onChange={(e) => {
                      setHigherAuthorityDescription(e.target.value);
                      if (higherAuthorityError) setHigherAuthorityError('');
                    }}
                    placeholder="Enter district level enquiry directives, priority instructions, or administrative transfer notes..."
                    className="w-full p-3 rounded-xl text-xs border border-amber-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-300/30 text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-2xs"
                    required
                  />
                  {higherAuthorityError && (
                    <p className="text-xs font-bold text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{higherAuthorityError}</span>
                    </p>
                  )}
                </div>

                {higherAuthoritySuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{higherAuthoritySuccess}</span>
                  </div>
                )}
              </div>

              {/* Sticky Footer: Action Buttons (Cancel and Assign Case button) */}
              <div className="shrink-0 p-4 border-t border-amber-200/90 bg-gradient-to-r from-amber-50 via-yellow-50/60 to-amber-50 flex items-center justify-between gap-3">
                <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-bold text-amber-900">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>SDPO Requisition Protocol</span>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    id="btn-cancel-higher-authority"
                    onClick={() => setHigherAuthorityCase(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-all cursor-pointer shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-assign-case"
                    className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md shadow-yellow-500/20 flex items-center space-x-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Assign Case</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Investigative Entity & Communication Network Graph Modal */}
      {selectedCaseForNetwork && (
        <CaseNetworkGraphModal
          c={selectedCaseForNetwork}
          isOpen={!!selectedCaseForNetwork}
          onClose={() => setSelectedCaseForNetwork(null)}
          themeMode={themeMode}
          suspects={suspects}
        />
      )}
    </div>
  );
};
