import React, { useState, useRef, useEffect } from 'react';
import { Suspect, SuspectStatus, UserRole, Case, User as UserType, CrimeType } from '../types';
import { ShieldAlert, Plus, X, Search, UserCheck, AlertOctagon, MapPin, Tag, Upload, Image as ImageIcon, GitBranch, Trash2, FolderKanban, Share2, ArrowLeft, FolderLock, CheckCircle2, User as UserIcon } from 'lucide-react';
import { SuspectBinaryTreeModal } from './SuspectBinaryTreeModal';
import { SuspectBinaryTreeNetworkModal } from './SuspectBinaryTreeNetworkModal';

interface SuspectManagementProps {
  suspects: Suspect[];
  cases?: Case[];
  onCreateSuspect: (newSuspect: Suspect) => void;
  onUpdateSuspects?: (updatedSuspects: Suspect[]) => void;
  userRole: UserRole;
  currentUser?: UserType;
  hostsList?: UserType[];
  onCreateCase?: (newCase: Case) => void;
  isExternalCreateCaseOpen?: boolean;
  onResetExternalCreateCase?: () => void;
  themeMode?: 'dark' | 'bright';
  onBackToDashboard: () => void;
}

export const SuspectManagement: React.FC<SuspectManagementProps> = ({
  suspects,
  cases = [],
  onCreateSuspect,
  onUpdateSuspects,
  userRole,
  currentUser,
  hostsList = [],
  onCreateCase,
  isExternalCreateCaseOpen = false,
  onResetExternalCreateCase,
  themeMode = 'dark',
  onBackToDashboard,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [activeBinaryTreeSuspect, setActiveBinaryTreeSuspect] = useState<Suspect | null>(null);
  const [activeNetworkSuspect, setActiveNetworkSuspect] = useState<Suspect | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Quick Add Node in Detail Modal
  const [showDetailAddNode, setShowDetailAddNode] = useState(false);
  const [detailTargetId, setDetailTargetId] = useState('');
  const [detailRelationship, setDetailRelationship] = useState('Co-conspirator');
  const [detailCaseId, setDetailCaseId] = useState('CR-2026-8942');

  // Dedicated Add Binary Node Modal state
  const [showAddBinaryNodeModal, setShowAddBinaryNodeModal] = useState(false);
  const [binaryNodeSourceSuspect, setBinaryNodeSourceSuspect] = useState<Suspect | null>(null);
  const [binaryNodeTargetId, setBinaryNodeTargetId] = useState('');
  const [binaryNodeRelationship, setBinaryNodeRelationship] = useState('Co-conspirator');
  const [binaryNodeCustomRel, setBinaryNodeCustomRel] = useState('');
  const [binaryNodeCaseId, setBinaryNodeCaseId] = useState('CR-2026-8942');
  const [binaryNodeSuccess, setBinaryNodeSuccess] = useState<string | null>(null);

  // New Suspect Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [crime, setCrime] = useState('');
  const [address, setAddress] = useState('');
  const [suspectTaluka, setSuspectTaluka] = useState('Downtown Central');
  const [suspectDistrict, setSuspectDistrict] = useState('Metro District');
  const [status, setStatus] = useState<SuspectStatus>('Wanted');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [notes, setNotes] = useState('');

  // Status Filter State ('All' | 'Wanted' | 'Under Arrest' | 'Missing' | 'On Bail')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Wanted' | 'Under Arrest' | 'Missing' | 'On Bail'>('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canCreate = userRole === 'DSP' || userRole === 'Host' || userRole === 'Subdivision Level' || userRole === 'District Level';
  const canManageBinaryNode = userRole === 'DSP' || userRole === 'Host' || userRole === 'Subdivision Level' || userRole === 'District Level';

  // Ensure only Solapur district suspects are included and explicitly remove the last 4 suspects (SUS-9012, SUS-9013, SUS-9014, SUS-9015)
  const REMOVED_SUSPECT_IDS = new Set(['SUS-9012', 'SUS-9013', 'SUS-9014', 'SUS-9015']);
  const solapurSuspects = suspects.filter(
    (s) => !REMOVED_SUSPECT_IDS.has(s.id) && (!s.district || s.district.toLowerCase() === 'solapur')
  );

  const wantedCount = solapurSuspects.filter((s) => s.status === 'Wanted').length;
  const underArrestCount = solapurSuspects.filter((s) => s.status === 'Under Arrest').length;
  const missingCount = solapurSuspects.filter((s) => s.status === 'Missing').length;
  const onBailCount = solapurSuspects.filter((s) => s.status === 'On Bail').length;
  const allCount = solapurSuspects.length;

  const filteredSuspects = solapurSuspects.filter((s) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      s.fullName.toLowerCase().includes(query) ||
      s.crime.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) ||
      (s.address && s.address.toLowerCase().includes(query)) ||
      (s.taluka && s.taluka.toLowerCase().includes(query)) ||
      (s.district && s.district.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !crime) return;

    const newSuspect: Suspect = {
      id: `SUS-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      age,
      gender,
      crime,
      address: address || 'Under Verification',
      taluka: suspectTaluka || 'Karmala',
      district: 'Solapur',
      state: 'Maharashtra',
      status,
      photoUrl: photoUrl.trim(), // Image will NOT upload by default; remains empty if not provided by user
      linkedCaseIds: ['CR-2026-8942'],
      connectedSuspects: [],
      notes,
    };

    onCreateSuspect(newSuspect);
    setShowCreateModal(false);

    // Reset form
    setFullName('');
    setCrime('');
    setAddress('');
    setSuspectTaluka('Karmala');
    setSuspectDistrict('Solapur');
    setNotes('');
    setPhotoUrl('');
    setPhotoPreview(null);
  };

  // Add Node Connection in Detail View
  const handleAddDetailNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspect || !detailTargetId) return;

    const targetSuspect = suspects.find((s) => s.id === detailTargetId);
    if (!targetSuspect) return;

    const newConn = {
      targetSuspectId: targetSuspect.id,
      targetSuspectName: targetSuspect.fullName,
      relationship: detailRelationship,
      caseId: detailCaseId || 'CR-2026-8942',
    };

    const targetConn = {
      targetSuspectId: selectedSuspect.id,
      targetSuspectName: selectedSuspect.fullName,
      relationship: `Linked Associate (${detailRelationship})`,
      caseId: detailCaseId || 'CR-2026-8942',
    };

    const updated = suspects.map((s) => {
      if (s.id === selectedSuspect.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, newConn],
        };
      }
      if (s.id === targetSuspect.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, targetConn],
        };
      }
      return s;
    });

    if (onUpdateSuspects) {
      onUpdateSuspects(updated);
    }

    // Refresh selected suspect in modal state
    const refreshed = updated.find((s) => s.id === selectedSuspect.id);
    if (refreshed) setSelectedSuspect(refreshed);

    setDetailTargetId('');
    setShowDetailAddNode(false);
  };

  // Remove Node Connection in Detail View
  const handleRemoveDetailNode = (targetId: string) => {
    if (!selectedSuspect) return;

    const updated = suspects.map((s) => {
      if (s.id === selectedSuspect.id) {
        return {
          ...s,
          connectedSuspects: s.connectedSuspects.filter((c) => c.targetSuspectId !== targetId),
        };
      }
      if (s.id === targetId) {
        return {
          ...s,
          connectedSuspects: s.connectedSuspects.filter((c) => c.targetSuspectId !== selectedSuspect.id),
        };
      }
      return s;
    });

    if (onUpdateSuspects) {
      onUpdateSuspects(updated);
    }

    const refreshed = updated.find((s) => s.id === selectedSuspect.id);
    if (refreshed) setSelectedSuspect(refreshed);
  };

  // Dedicated Handler to Add Binary Node to Suspect
  const handleAddBinaryNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const source = binaryNodeSourceSuspect || selectedSuspect;
    if (!source || !binaryNodeTargetId) return;

    const targetSuspect = suspects.find((s) => s.id === binaryNodeTargetId);
    if (!targetSuspect) return;

    const finalRel =
      binaryNodeRelationship === 'Other'
        ? binaryNodeCustomRel.trim() || 'Accomplice'
        : binaryNodeRelationship;
    const finalCaseId = binaryNodeCaseId.trim() || 'CR-2026-8942';

    const newConn = {
      targetSuspectId: targetSuspect.id,
      targetSuspectName: targetSuspect.fullName,
      relationship: finalRel,
      caseId: finalCaseId,
    };

    const targetConn = {
      targetSuspectId: source.id,
      targetSuspectName: source.fullName,
      relationship: `Linked Associate (${finalRel})`,
      caseId: finalCaseId,
    };

    const updated = suspects.map((s) => {
      if (s.id === source.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, newConn],
        };
      }
      if (s.id === targetSuspect.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, targetConn],
        };
      }
      return s;
    });

    if (onUpdateSuspects) {
      onUpdateSuspects(updated);
    }

    if (selectedSuspect && selectedSuspect.id === source.id) {
      const refreshed = updated.find((s) => s.id === source.id);
      if (refreshed) setSelectedSuspect(refreshed);
    }

    setBinaryNodeSuccess(`Successfully connected binary node: ${targetSuspect.fullName} to ${source.fullName}!`);
    setTimeout(() => {
      setBinaryNodeSuccess(null);
      setShowAddBinaryNodeModal(false);
      setBinaryNodeTargetId('');
      setBinaryNodeCustomRel('');
      setBinaryNodeSourceSuspect(null);
    }, 1200);
  };

  const getStatusBadge = (st: SuspectStatus) => {
    switch (st) {
      case 'Wanted':
        return themeMode === 'bright'
          ? 'bg-red-100 text-red-950 border-red-300 font-extrabold'
          : 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Under Arrest':
        return themeMode === 'bright'
          ? 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold'
          : 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Under Investigation':
        return themeMode === 'bright'
          ? 'bg-yellow-100 text-amber-950 border-yellow-400 font-extrabold shadow-xs'
          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Missing':
        return themeMode === 'bright'
          ? 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold'
          : 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'On Bail':
        return themeMode === 'bright'
          ? 'bg-blue-100 text-blue-950 border-blue-300 font-extrabold'
          : 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return themeMode === 'bright'
          ? 'bg-yellow-100 text-amber-950 border-yellow-400 font-extrabold shadow-xs'
          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const getStatusIconStyle = (st: SuspectStatus) => {
    switch (st) {
      case 'Wanted':
        return {
          border: 'border-red-600 ring-4 ring-red-500/20 shadow-lg shadow-red-500/25',
          pill: 'bg-red-600 text-white shadow-md shadow-red-600/30',
        };
      case 'Under Arrest':
        return {
          border: 'border-amber-500 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/25',
          pill: 'bg-amber-600 text-white shadow-md shadow-amber-600/30',
        };
      case 'Missing':
        return {
          border: 'border-purple-600 ring-4 ring-purple-500/20 shadow-lg shadow-purple-500/25',
          pill: 'bg-purple-600 text-white shadow-md shadow-purple-600/30',
        };
      case 'On Bail':
        return {
          border: 'border-blue-600 ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/25',
          pill: 'bg-blue-600 text-white shadow-md shadow-blue-600/30',
        };
      case 'Under Investigation':
      default:
        return {
          border: 'border-yellow-500 ring-4 ring-yellow-500/20 shadow-lg shadow-yellow-500/25',
          pill: 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/30',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Page Navigation & Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-yellow-500/20 pb-4 sm:pb-6">
        <div>
          <button
            onClick={onBackToDashboard}
            className={`text-xs sm:text-sm font-bold hover:underline mb-1 inline-flex items-center ${
              themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'
            }`}
          >
            ← Back to Dashboard
          </button>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-2.5 text-red-500 shrink-0" />
            <span>Suspect Management Intelligence</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            Cross-case suspect tracking, binary tree node link analysis, and mugshot registry.
          </p>
        </div>

        {/* Right Corner Button to Create New Suspect History */}
        {canCreate && (
          <button
            id="btn-create-suspect-profile"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3] shrink-0" />
            <span className="hidden sm:inline">Create New Suspect Profile</span>
            <span className="sm:hidden text-xs font-black">New Suspect Profile</span>
          </button>
        )}
      </div>

      {/* Search Bar & Status Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="suspect-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Suspect ID, Name, Taluka, or Crime..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              themeMode === 'bright'
                ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none shadow-xs'
                : 'bg-slate-900 border border-blue-900/60 text-slate-100 placeholder:text-slate-500 focus:border-yellow-500 focus:outline-none'
            }`}
          />
        </div>

        {/* Status Filter Buttons: 'All', 'Wanted', 'Under Arrest', 'Missing', 'On Bail' */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* All Button */}
          <button
            type="button"
            id="filter-suspect-all"
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer select-none ${
              statusFilter === 'All'
                ? themeMode === 'bright'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-700'
                  : 'bg-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/20'
                : themeMode === 'bright'
                  ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                  : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                statusFilter === 'All'
                  ? themeMode === 'bright'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-950 text-yellow-400'
                  : 'bg-slate-800/40 text-slate-400'
              }`}
            >
              {allCount}
            </span>
          </button>

          {/* Wanted Button */}
          <button
            type="button"
            id="filter-suspect-wanted"
            onClick={() => setStatusFilter(statusFilter === 'Wanted' ? 'All' : 'Wanted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer select-none ${
              statusFilter === 'Wanted'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400 font-black'
                : themeMode === 'bright'
                  ? 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                  : 'bg-slate-900/90 text-red-400 border border-red-900/50 hover:bg-red-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block animate-pulse" />
            <span>Wanted</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                statusFilter === 'Wanted' ? 'bg-red-800 text-white' : 'bg-red-500/15 text-red-400'
              }`}
            >
              {wantedCount}
            </span>
          </button>

          {/* Under Arrest Button */}
          <button
            type="button"
            id="filter-suspect-under-arrest"
            onClick={() => setStatusFilter(statusFilter === 'Under Arrest' ? 'All' : 'Under Arrest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer select-none ${
              statusFilter === 'Under Arrest'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400 font-black'
                : themeMode === 'bright'
                  ? 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                  : 'bg-slate-900/90 text-amber-400 border border-amber-900/50 hover:bg-amber-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block" />
            <span>Under Arrest</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                statusFilter === 'Under Arrest' ? 'bg-amber-800 text-white' : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {underArrestCount}
            </span>
          </button>

          {/* Missing Button */}
          <button
            type="button"
            id="filter-suspect-missing"
            onClick={() => setStatusFilter(statusFilter === 'Missing' ? 'All' : 'Missing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer select-none ${
              statusFilter === 'Missing'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400 font-black'
                : themeMode === 'bright'
                  ? 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                  : 'bg-slate-900/90 text-purple-400 border border-purple-900/50 hover:bg-purple-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 inline-block" />
            <span>Missing</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                statusFilter === 'Missing' ? 'bg-purple-800 text-white' : 'bg-purple-500/15 text-purple-400'
              }`}
            >
              {missingCount}
            </span>
          </button>

          {/* On Bail Button */}
          <button
            type="button"
            id="filter-suspect-on-bail"
            onClick={() => setStatusFilter(statusFilter === 'On Bail' ? 'All' : 'On Bail')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer select-none ${
              statusFilter === 'On Bail'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400 font-black'
                : themeMode === 'bright'
                  ? 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                  : 'bg-slate-900/90 text-blue-400 border border-blue-900/50 hover:bg-blue-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 inline-block" />
            <span>On Bail</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                statusFilter === 'On Bail' ? 'bg-blue-800 text-white' : 'bg-blue-500/15 text-blue-400'
              }`}
            >
              {onBailCount}
            </span>
          </button>
        </div>
      </div>

      {/* Icon-Like Suspects Grid (No Card Container: Avatar with overlapping status pill, Suspect Name, Blue ID, and Taluka Location below) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 justify-items-center pt-2">
        {filteredSuspects.map((suspect) => {
          const iconStyle = getStatusIconStyle(suspect.status);
          return (
            <div
              key={suspect.id}
              id={`suspect-icon-${suspect.id}`}
              onClick={() => setSelectedSuspect(suspect)}
              className="group flex flex-col items-center justify-start cursor-pointer p-2 rounded-2xl transition-all duration-300 hover:scale-105 select-none w-full max-w-[170px]"
              title={`Click to open full profile for ${suspect.fullName} (${suspect.taluka || 'Assigned Jurisdiction'})`}
            >
              {/* Circle Avatar with Status Pill overlapping bottom */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-[3.5px] transition-transform duration-300 group-hover:scale-105 ${iconStyle.border} bg-slate-950 flex items-center justify-center`}
                >
                  {suspect.photoUrl ? (
                    <img
                      src={suspect.photoUrl}
                      alt={suspect.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
                      <UserIcon className="w-12 h-12 stroke-[1.5]" />
                    </div>
                  )}
                </div>

                {/* Overlapping Status Pill Badge at bottom of circle */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${iconStyle.pill}`}>
                    {suspect.status}
                  </span>
                </div>
              </div>

              {/* Suspect Name, ID, and Taluka Location below the icon */}
              <div className="mt-4 sm:mt-5 text-center w-full px-1 space-y-0.5">
                <h3
                  className={`text-sm sm:text-base font-extrabold tracking-tight line-clamp-2 transition-colors ${
                    themeMode === 'bright'
                      ? 'text-slate-900 group-hover:text-blue-700'
                      : 'text-slate-100 group-hover:text-yellow-400'
                  }`}
                >
                  {suspect.fullName}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400 tracking-wider font-mono">
                  {suspect.id}
                </p>
                {/* Related Taluka Location Badge */}
                {suspect.taluka && (
                  <p
                    className={`text-[11px] font-semibold flex items-center justify-center pt-0.5 ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    <MapPin className="w-3 h-3 mr-0.5 text-amber-500 shrink-0 inline" />
                    <span>{suspect.taluka}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSuspects.length === 0 && (
        <div className="text-center py-12 text-slate-400 font-medium space-y-2">
          <p>No suspects found matching your criteria{searchQuery ? ` ("${searchQuery}")` : ''}{statusFilter !== 'All' ? ` with status "${statusFilter}"` : ''}.</p>
          {(statusFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
            >
              Reset filters & search
            </button>
          )}
        </div>
      )}

      {/* Full-Page Suspect Criminal Dossier / Profile */}
      {selectedSuspect && (
        <div className={`fixed inset-0 z-[2000] w-full h-full min-h-screen overflow-y-auto flex flex-col ${
          themeMode === 'bright'
            ? 'bg-slate-100 text-slate-900'
            : 'bg-slate-950 text-slate-100'
        }`}>
          {/* Top Full-Page Navigation Bar */}
          <div className={`sticky top-0 z-30 px-4 sm:px-8 py-3.5 sm:py-4 border-b backdrop-blur-md flex items-center justify-between transition-colors ${
            themeMode === 'bright'
              ? 'bg-white/95 border-slate-300 text-slate-900 shadow-sm'
              : 'bg-slate-900/95 border-yellow-500/20 text-yellow-400 shadow-md'
          }`}>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                type="button"
                id="btn-back-to-suspects-list"
                onClick={() => setSelectedSuspect(null)}
                className={`px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm inline-flex items-center space-x-2 transition-all cursor-pointer shadow-sm ${
                  themeMode === 'bright'
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                    : 'bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-slate-950 border border-yellow-500/40'
                }`}
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back to Suspects</span>
              </button>

              <div className="h-4 w-px bg-slate-400/40 hidden sm:block" />

              <div className="flex items-center space-x-2">
                <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded shadow-sm ${
                  themeMode === 'bright' ? 'bg-slate-900 text-white' : 'bg-yellow-500 text-slate-950'
                }`}>
                  {selectedSuspect.id}
                </span>
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md border ${getStatusBadge(selectedSuspect.status)}`}>
                  {selectedSuspect.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-close-suspect-profile"
              onClick={() => setSelectedSuspect(null)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                themeMode === 'bright'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
              title="Close Full Page"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Full Page Content Container */}
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
            {/* Primary Profile Card */}
            <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl ${
              themeMode === 'bright'
                ? 'bg-white border-2 border-slate-300 text-slate-900'
                : 'bg-slate-900/90 border border-yellow-500/30 text-slate-100'
            }`}>
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                {/* Photo Mugshot */}
                <div className={`w-full sm:w-56 h-64 rounded-2xl overflow-hidden border-2 flex-shrink-0 flex items-center justify-center shadow-lg relative ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 border-amber-500/50'
                    : 'bg-slate-950 border-yellow-500/40'
                }`}>
                  {selectedSuspect.photoUrl ? (
                    <img
                      src={selectedSuspect.photoUrl}
                      alt={selectedSuspect.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                      <UserIcon className="w-20 h-20 mb-2 stroke-[1.5]" />
                      <span className="text-[11px] font-mono uppercase font-bold">No Photograph</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-md border shadow-md ${getStatusBadge(selectedSuspect.status)}`}>
                      {selectedSuspect.status}
                    </span>
                  </div>
                </div>

                {/* Details & Action Controls */}
                <div className="space-y-4 flex-1 w-full">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded shadow-sm ${
                        themeMode === 'bright' ? 'bg-slate-900 text-white' : 'bg-yellow-500 text-slate-950'
                      }`}>
                        {selectedSuspect.id}
                      </span>
                      <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md border ${getStatusBadge(selectedSuspect.status)}`}>
                        {selectedSuspect.status}
                      </span>
                    </div>

                    <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${
                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {selectedSuspect.fullName}
                    </h2>
                  </div>

                  {/* Primary Info Grid */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl border ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                  }`}>
                    <div>
                      <span className={`text-xs font-bold block ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>Primary Crime / Allegation:</span>
                      <p className={`font-black text-sm sm:text-base mt-0.5 ${themeMode === 'bright' ? 'text-amber-800' : 'text-amber-300'}`}>
                        {selectedSuspect.crime}
                      </p>
                    </div>

                    <div>
                      <span className={`text-xs font-bold block ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>Age & Gender:</span>
                      <p className="font-bold text-sm mt-0.5">
                        {selectedSuspect.age} Years • {selectedSuspect.gender}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <span className={`text-xs font-bold flex items-center ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                        <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" /> Known Address / Location:
                      </span>
                      <p className="font-semibold text-sm mt-0.5">
                        {selectedSuspect.address}
                      </p>
                    </div>

                    {selectedSuspect.taluka && (
                      <div>
                        <span className={`text-xs font-bold block ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>Taluka Jurisdiction:</span>
                        <p className="font-bold text-sm mt-0.5 text-amber-600 dark:text-amber-400 flex items-center">
                          <MapPin className="w-3 h-3 mr-1 inline shrink-0" />
                          {selectedSuspect.taluka}
                        </p>
                      </div>
                    )}

                    {(selectedSuspect.district || selectedSuspect.state) && (
                      <div>
                        <span className={`text-xs font-bold block ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>District & State:</span>
                        <p className="font-bold text-sm mt-0.5">
                          {[selectedSuspect.district, selectedSuspect.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* All Buttons from earlier outer card: Binary Tree & Tree Network */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      id="btn-fullpage-binary-tree"
                      onClick={() => setActiveBinaryTreeSuspect(selectedSuspect)}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300'
                          : 'bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-slate-950 border border-yellow-500/40'
                      }`}
                      title="View node list & connections"
                    >
                      <GitBranch className="w-4 h-4 stroke-[2.5]" />
                      <span>Binary Tree</span>
                    </button>

                    <button
                      type="button"
                      id="btn-fullpage-tree-network"
                      onClick={() => setActiveNetworkSuspect(selectedSuspect)}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-orange-100 hover:bg-orange-200 text-amber-950 border-2 border-orange-300'
                          : 'bg-gradient-to-r from-red-500/25 to-amber-500/25 hover:from-red-500 hover:to-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/50'
                      }`}
                      title="Open Binary Tree Network visualizer"
                    >
                      <Share2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Tree Network</span>
                    </button>

                    {/* Add Binary Node to Suspect button */}
                    {canManageBinaryNode && (
                      <button
                        type="button"
                        id="btn-fullpage-add-binary-node"
                        onClick={() => {
                          setBinaryNodeSourceSuspect(selectedSuspect);
                          setShowAddBinaryNodeModal(true);
                        }}
                        className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all shadow-md cursor-pointer ${
                          themeMode === 'bright'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/20'
                        }`}
                        title="Add binary node connection to this suspect"
                      >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add Binary Node to Suspect</span>
                        <span className="sm:hidden">Add Node</span>
                      </button>
                    )}

                    <button
                      type="button"
                      id="btn-fullpage-node-visualizer"
                      onClick={() => setActiveBinaryTreeSuspect(selectedSuspect)}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                      }`}
                    >
                      <GitBranch className="w-4 h-4 stroke-[2.5]" />
                      <span>Open Binary Tree Node Visualizer</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Investigative Notes */}
              {selectedSuspect.notes && (
                <div className={`mt-6 p-4 rounded-xl border text-xs sm:text-sm space-y-1 ${
                  themeMode === 'bright'
                    ? 'bg-amber-50/70 border-2 border-amber-200 text-slate-900 shadow-sm'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                }`}>
                  <span className={`font-black ${themeMode === 'bright' ? 'text-amber-900' : 'text-amber-400'}`}>Investigative Intelligence Notes:</span>
                  <p className="mt-1 leading-relaxed">{selectedSuspect.notes}</p>
                </div>
              )}
            </div>

            {/* Linked Cases & Incident Locations */}
            {(() => {
              const linkedCases = cases.filter((c) => selectedSuspect.linkedCaseIds.includes(c.id));
              if (linkedCases.length === 0) return null;
              return (
                <div className={`p-6 rounded-2xl border space-y-4 shadow-md ${
                  themeMode === 'bright'
                    ? 'bg-white border-2 border-slate-300 text-slate-900'
                    : 'bg-slate-900/90 border border-blue-900/50 text-slate-100'
                }`}>
                  <h4 className={`text-base font-black flex items-center ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}>
                    <FolderKanban className="w-5 h-5 mr-2 text-blue-500" /> Linked Cases & Crime Incident Locations ({linkedCases.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {linkedCases.map((c) => (
                      <div
                        key={c.id}
                        className={`p-4 rounded-xl border space-y-1.5 ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-200 text-slate-900'
                            : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-sm truncate">{c.caseName}</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 shrink-0">{c.id}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{c.crimeType} • Status: <span className="font-bold text-amber-400">{c.status}</span></p>
                        <p className="text-xs font-bold text-red-500 dark:text-red-400 flex items-start pt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 mt-0.5 text-red-500" />
                          <span>{c.location}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Connecting Links (Node Graph) for Suspect Investigation */}
            <div className={`p-6 rounded-2xl border space-y-4 shadow-md ${
              themeMode === 'bright'
                ? 'bg-white border-2 border-slate-300 text-slate-900'
                : 'bg-slate-900/90 border border-yellow-500/30 text-slate-100'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className={`text-base font-black flex items-center ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}>
                    <GitBranch className={`w-5 h-5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-500'}`} /> Connected Links & Syndicate Network Nodes
                  </h4>
                  <p className={`text-xs mt-0.5 ${
                    themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'
                  }`}>
                    Inter-case intelligence linking this suspect to co-conspirators and accomplices.
                  </p>
                </div>

                {canManageBinaryNode && (
                  <button
                    type="button"
                    onClick={() => setShowDetailAddNode(!showDetailAddNode)}
                    className={`px-3 py-1.5 font-bold text-xs rounded-xl border flex items-center space-x-1 self-start sm:self-auto cursor-pointer ${
                      themeMode === 'bright'
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-950 border-blue-300'
                        : 'bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-slate-950 border border-yellow-500/40'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showDetailAddNode ? 'Cancel' : 'Add Binary Node'}</span>
                  </button>
                )}
              </div>

              {/* Inline Add Node Form */}
              {showDetailAddNode && canManageBinaryNode && (
                <form onSubmit={handleAddDetailNode} className={`p-4 rounded-xl border space-y-3 text-xs ${
                  themeMode === 'bright'
                    ? 'bg-sky-50/80 border-2 border-sky-200 text-slate-900'
                    : 'bg-slate-950 border border-slate-800 text-slate-100'
                }`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Target Suspect</label>
                      <select
                        value={detailTargetId}
                        onChange={(e) => setDetailTargetId(e.target.value)}
                        required
                        className={`w-full p-2 border rounded-lg ${
                          themeMode === 'bright'
                            ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                            : 'bg-slate-900 border border-slate-700 text-slate-100'
                        }`}
                      >
                        <option value="">-- Choose Suspect --</option>
                        {suspects
                          .filter((s) => s.id !== selectedSuspect.id && !selectedSuspect.connectedSuspects.some((c) => c.targetSuspectId === s.id))
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.fullName} ({s.id})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Relationship</label>
                      <input
                        type="text"
                        value={detailRelationship}
                        onChange={(e) => setDetailRelationship(e.target.value)}
                        placeholder="e.g. Co-conspirator, Hawala Partner"
                        className={`w-full p-2 border rounded-lg ${
                          themeMode === 'bright'
                            ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                            : 'bg-slate-900 border border-slate-700 text-slate-100'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className={`px-4 py-2 font-bold rounded-lg shadow-sm cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                      }`}
                    >
                      Link Node Connection
                    </button>
                  </div>
                </form>
              )}

              {selectedSuspect.connectedSuspects.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {selectedSuspect.connectedSuspects.map((link, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        themeMode === 'bright'
                          ? 'bg-sky-50/80 border-2 border-sky-200 text-slate-900 shadow-sm'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${
                          themeMode === 'bright'
                            ? 'bg-blue-100 text-blue-950 border-blue-300'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                        }`}>
                          Node
                        </div>
                        <div>
                          <p className={`text-xs sm:text-sm font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{link.targetSuspectName}</p>
                          <p className={`text-[11px] ${themeMode === 'bright' ? 'text-blue-900 font-bold' : 'text-amber-300'}`}>Relationship: {link.relationship}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          themeMode === 'bright'
                            ? 'bg-blue-100 text-blue-950 font-bold border-blue-300'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}>
                          Case: {link.caseId}
                        </span>

                        {canManageBinaryNode && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDetailNode(link.targetSuspectId)}
                            title="Disconnect Node Link"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/20 hover:text-red-700 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-xs py-2 ${themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>No cross-case node links registered for this suspect yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal to Create New Suspect History Profile (DSP & Host) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-5 pt-16 sm:pt-20 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-xl my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-white text-slate-900 border-sky-300 shadow-sky-500/10'
                : 'bg-slate-950 text-slate-100 border-yellow-500/30'
            }`}
          >
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-sky-200 text-blue-950 shadow-sm'
                : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
            }`}>
              <h3 className={`text-lg font-bold flex items-center ${
                themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
              }`}>
                <AlertOctagon className="w-5 h-5 mr-2 text-red-600" /> Create New Suspect Profile
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-1 rounded-full transition-colors ${
                  themeMode === 'bright' ? 'bg-white hover:bg-slate-200 text-blue-950 border border-slate-300' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* PHOTO UPLOAD OPTION FOR NEW SUSPECT */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/80 border-2 border-sky-200 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black flex items-center ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}>
                    <ImageIcon className={`w-4 h-4 mr-1.5 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-500'}`} /> Upload Suspect Photograph (Optional)
                  </label>
                  <div className="flex text-[10px] bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        uploadMethod === 'file' ? (themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950') : 'text-slate-400'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        uploadMethod === 'url' ? (themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950') : 'text-slate-400'
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                <p className={`text-[11px] ${themeMode === 'bright' ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  Note: Photograph will <strong>NOT</strong> be uploaded by default. You can choose to upload a photo file below or leave it empty for a placeholder profile.
                </p>

                {uploadMethod === 'file' ? (
                  <div>
                    {photoPreview ? (
                      <div className={`relative w-32 h-36 mx-auto rounded-xl overflow-hidden border-2 shadow-md ${
                        themeMode === 'bright' ? 'border-blue-400' : 'border-yellow-400'
                      }`}>
                        <img src={photoPreview} alt="Suspect preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleClearPhoto}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                          themeMode === 'bright'
                            ? 'border-sky-300 bg-white hover:bg-sky-50 text-slate-900'
                            : 'border-slate-700 hover:border-yellow-500 bg-slate-950/50 hover:bg-slate-950 text-slate-200'
                        }`}
                      >
                        <Upload className={`w-8 h-8 mx-auto mb-1.5 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-500'}`} />
                        <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Click to Browse Suspect Image File</p>
                        <p className={`text-[10px] mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-500'}`}>Supports PNG, JPG, JPEG, WEBP</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => {
                        setPhotoUrl(e.target.value);
                        setPhotoPreview(e.target.value);
                      }}
                      placeholder="Paste suspect image URL (https://...)"
                      className={`w-full px-3 py-2 rounded-lg text-xs ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-950 border border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Suspect Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh 'Shankar' Pawar"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-lg text-xs ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-900 border border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className={`w-full px-2 py-2 rounded-lg text-xs ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-900 border border-slate-700 text-slate-100'
                      }`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Crime Committed *</label>
                  <input
                    type="text"
                    value={crime}
                    onChange={(e) => setCrime(e.target.value)}
                    placeholder="e.g. Armed Robbery, Extortion, Fraud"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Address (if known)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Sector 14, Metro Docks area"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Taluka Jurisdiction</label>
                  <input
                    type="text"
                    value={suspectTaluka}
                    onChange={(e) => setSuspectTaluka(e.target.value)}
                    placeholder="e.g. Karmala, Barshi, Madha"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>District</label>
                  <input
                    type="text"
                    value={suspectDistrict}
                    onChange={(e) => setSuspectDistrict(e.target.value)}
                    placeholder="e.g. Solapur"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SuspectStatus)}
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Wanted">Wanted</option>
                    <option value="Under Arrest">Under Arrest</option>
                    <option value="Missing">Missing</option>
                    <option value="On Bail">On Bail</option>
                    <option value="Sentenced">Sentenced</option>
                    <option value="Under Investigation">Under Investigation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Investigative Background / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Known aliases, associates, key danger level..."
                  className={`w-full px-3 py-2 rounded-lg text-xs ${
                    themeMode === 'bright'
                      ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                      : 'bg-slate-900 border border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div className={`flex justify-end space-x-2 pt-3 border-t ${themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold ${
                    themeMode === 'bright'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-bold rounded-lg text-xs shadow-md ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                  }`}
                >
                  Create Suspect History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Add Binary Node to Suspect Modal */}
      {showAddBinaryNodeModal && (
        <div className="fixed inset-0 z-[2100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl border p-4 sm:p-6 shadow-2xl my-auto transition-colors ${
            themeMode === 'bright'
              ? 'bg-white border-slate-300 text-slate-900'
              : 'bg-slate-950 border-emerald-500/40 text-slate-100'
          }`}>
            <div className={`flex items-center justify-between pb-3 sm:pb-4 border-b ${
              themeMode === 'bright' ? 'border-slate-200' : 'border-emerald-500/20'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl ${
                  themeMode === 'bright' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-black ${
                    themeMode === 'bright' ? 'text-slate-900' : 'text-emerald-400'
                  }`}>
                    Add Binary Node to Suspect
                  </h3>
                  <p className={`text-xs ${themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    Link a criminal associate or co-conspirator node in the syndicate tree
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-add-binary-node-modal"
                onClick={() => {
                  setShowAddBinaryNodeModal(false);
                  setBinaryNodeSourceSuspect(null);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Suspect Profile Header */}
            {(() => {
              const currentSource = binaryNodeSourceSuspect || selectedSuspect || suspects[0];
              if (!currentSource) return null;
              return (
                <div className={`mt-3 p-3 rounded-xl border flex items-center space-x-3 ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 border-slate-200 text-slate-900'
                    : 'bg-slate-900/80 border-slate-800 text-slate-100'
                }`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 shrink-0 bg-slate-950 flex items-center justify-center">
                    {currentSource.photoUrl ? (
                      <img src={currentSource.photoUrl} alt={currentSource.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate">{currentSource.fullName}</p>
                    <p className="text-[11px] font-mono text-sky-600 dark:text-sky-400">{currentSource.id} • {currentSource.crime}</p>
                  </div>
                </div>
              );
            })()}

            {/* Notification Banner */}
            {binaryNodeSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-black flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{binaryNodeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddBinaryNodeSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Target Suspect to Connect *
                </label>
                <select
                  required
                  id="select-binary-node-target"
                  value={binaryNodeTargetId}
                  onChange={(e) => setBinaryNodeTargetId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                    themeMode === 'bright'
                      ? 'bg-white border-2 border-slate-300 text-slate-900'
                      : 'bg-slate-900 border border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="">-- Choose Associate Suspect --</option>
                  {suspects
                    .filter((s) => {
                      const currentSource = binaryNodeSourceSuspect || selectedSuspect;
                      if (!currentSource) return true;
                      if (s.id === currentSource.id) return false;
                      const isConnected = currentSource.connectedSuspects?.some((c) => c.targetSuspectId === s.id);
                      return !isConnected;
                    })
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.id} - {s.crime})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Relationship / Syndicate Role *
                </label>
                <select
                  value={binaryNodeRelationship}
                  onChange={(e) => setBinaryNodeRelationship(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                    themeMode === 'bright'
                      ? 'bg-white border-2 border-slate-300 text-slate-900'
                      : 'bg-slate-900 border border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="Co-conspirator">Co-conspirator</option>
                  <option value="Gang Leader / Boss">Gang Leader / Boss</option>
                  <option value="Accomplice / Getaway">Accomplice / Getaway</option>
                  <option value="Arms / Weapon Supplier">Arms / Weapon Supplier</option>
                  <option value="Hawala Financier">Hawala Financier</option>
                  <option value="Technical Handler / Hacker">Technical Handler / Hacker</option>
                  <option value="Informant / Spotter">Informant / Spotter</option>
                  <option value="Other">Custom Relationship...</option>
                </select>
              </div>

              {binaryNodeRelationship === 'Other' && (
                <div>
                  <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                    Custom Relationship Specification *
                  </label>
                  <input
                    type="text"
                    required
                    value={binaryNodeCustomRel}
                    onChange={(e) => setBinaryNodeCustomRel(e.target.value)}
                    placeholder="e.g. Courier / Drug Carrier"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                  Investigation Case Reference ID
                </label>
                <input
                  type="text"
                  value={binaryNodeCaseId}
                  onChange={(e) => setBinaryNodeCaseId(e.target.value)}
                  placeholder="e.g. CR-2026-8942"
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                    themeMode === 'bright'
                      ? 'bg-white border-2 border-slate-300 text-slate-900'
                      : 'bg-slate-900 border border-slate-700 text-slate-100 font-mono'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end space-x-2.5 pt-3 border-t ${
                themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  id="btn-cancel-add-binary-node"
                  onClick={() => {
                    setShowAddBinaryNodeModal(false);
                    setBinaryNodeSourceSuspect(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    themeMode === 'bright'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-add-binary-node"
                  disabled={!binaryNodeTargetId}
                  className={`px-5 py-2 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer ${
                    !binaryNodeTargetId
                      ? 'opacity-50 cursor-not-allowed bg-slate-700 text-slate-400'
                      : themeMode === 'bright'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Connect Binary Node</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Binary Tree Visualizer Modal */}
      {activeBinaryTreeSuspect && (
        <SuspectBinaryTreeModal
          rootSuspect={activeBinaryTreeSuspect}
          suspects={suspects}
          userRole={userRole}
          themeMode={themeMode}
          onClose={() => setActiveBinaryTreeSuspect(null)}
          onUpdateSuspects={onUpdateSuspects}
          onSelectSuspectProfile={(s) => {
            setSelectedSuspect(s);
            setActiveBinaryTreeSuspect(null);
          }}
        />
      )}

      {/* Binary Tree Network Diagram Modal */}
      {activeNetworkSuspect && (
        <SuspectBinaryTreeNetworkModal
          rootSuspect={activeNetworkSuspect}
          suspects={suspects}
          cases={cases}
          themeMode={themeMode}
          onClose={() => setActiveNetworkSuspect(null)}
          onSelectSuspectProfile={(s) => {
            setSelectedSuspect(s);
            setActiveNetworkSuspect(null);
          }}
        />
      )}
    </div>
  );
};
