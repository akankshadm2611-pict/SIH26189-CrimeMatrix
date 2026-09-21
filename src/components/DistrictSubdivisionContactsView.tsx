import React, { useState, useMemo } from 'react';
import { User, Case, PortalNotification } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  SOLAPUR_SUBDIVISION_OFFICERS,
  JALNA_SUBDIVISION_OFFICERS,
  KOLHAPUR_SUBDIVISION_OFFICERS,
  SubdivisionLevelOfficerCard,
} from '../data/stateCadreOfficersData';
import {
  Phone,
  Mail,
  Building2,
  Shield,
  MapPin,
  Copy,
  Check,
  ArrowLeft,
  Send,
  UserCheck,
  FolderLock,
  Search,
  CheckCircle,
  ExternalLink,
  PhoneCall,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';

interface DistrictSubdivisionContactsViewProps {
  currentUser: User;
  users: User[];
  cases?: Case[];
  themeMode?: 'dark' | 'bright';
  onBackToDashboard: () => void;
  onNavigateToCaseManagement?: () => void;
  onSendNotification?: (notif: { title: string; message: string; type: string }) => void;
}

export const DistrictSubdivisionContactsView: React.FC<DistrictSubdivisionContactsViewProps> = ({
  currentUser,
  users,
  cases = [],
  themeMode = 'dark',
  onBackToDashboard,
  onNavigateToCaseManagement,
  onSendNotification,
}) => {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTalukaFilter, setSelectedTalukaFilter] = useState<string>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Memo / Directive dispatch modal state
  const [selectedOfficerForDirective, setSelectedOfficerForDirective] = useState<SubdivisionLevelOfficerCard | null>(null);
  const [directiveSubject, setDirectiveSubject] = useState('');
  const [directivePriority, setDirectivePriority] = useState<'Standard' | 'Urgent' | 'Immediate Action'>('Urgent');
  const [directiveContent, setDirectiveContent] = useState('');
  const [directiveSentSuccess, setDirectiveSentSuccess] = useState(false);

  // Determine active district of the District Level officer
  const districtName = useMemo(() => {
    const raw = currentUser.district || 'Solapur';
    if (raw.toLowerCase().includes('solapur')) return 'Solapur';
    if (raw.toLowerCase().includes('jalna')) return 'Jalna';
    if (raw.toLowerCase().includes('kolhapur')) return 'Kolhapur';
    return raw;
  }, [currentUser.district]);

  // Aggregate Subdivision Level Officers for this district covering all talukas
  const districtOfficers: SubdivisionLevelOfficerCard[] = useMemo(() => {
    let baseList: SubdivisionLevelOfficerCard[] = [];

    if (districtName.toLowerCase().includes('solapur')) {
      baseList = [...SOLAPUR_SUBDIVISION_OFFICERS];

      // Also incorporate any custom registered or mock users in the system with Solapur district
      const systemSolapurSubdivs = users.filter(
        (u) =>
          u.role === 'Subdivision Level' &&
          (u.district?.toLowerCase().includes('solapur') || u.department?.toLowerCase().includes('solapur'))
      );

      systemSolapurSubdivs.forEach((u) => {
        if (!baseList.some((b) => b.id === u.id || b.name.toLowerCase() === u.fullName.toLowerCase())) {
          baseList.push({
            id: u.id,
            name: u.fullName,
            district: 'Solapur',
            talukas: u.talukas && u.talukas.length > 0 ? u.talukas : ['Karmala', 'Barshi', 'Madha'],
            badgeId: u.badgeId || 'SDPO-SOL-00',
            designation: u.designation || 'Sub-Divisional Police Officer (SDPO)',
            photoUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
            phone: u.phone || '+91 98220 55112',
            email: u.email || 'sdpo.solapur@police.gov.in',
          });
        }
      });
    } else if (districtName.toLowerCase().includes('jalna')) {
      baseList = [...JALNA_SUBDIVISION_OFFICERS];
    } else if (districtName.toLowerCase().includes('kolhapur')) {
      baseList = [...KOLHAPUR_SUBDIVISION_OFFICERS];
    } else {
      // General fallback: gather all subdivision officers in the system
      const systemSubdivs = users.filter((u) => u.role === 'Subdivision Level');
      if (systemSubdivs.length > 0) {
        baseList = systemSubdivs.map((u) => ({
          id: u.id,
          name: u.fullName,
          district: u.district || districtName,
          talukas: u.talukas && u.talukas.length > 0 ? u.talukas : ['Central Taluka'],
          badgeId: u.badgeId || 'SDPO-GEN-01',
          designation: u.designation || 'Subdivisional Police Officer (SDPO)',
          photoUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
          phone: u.phone || '+91 98220 00000',
          email: u.email || 'sdpo.office@police.gov.in',
        }));
      } else {
        baseList = [...SOLAPUR_SUBDIVISION_OFFICERS];
      }
    }

    return baseList;
  }, [districtName, users]);

  // Extract list of all unique talukas in this district
  const allTalukas = useMemo(() => {
    const set = new Set<string>();
    districtOfficers.forEach((o) => {
      o.talukas.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [districtOfficers]);

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return districtOfficers.filter((officer) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        officer.name.toLowerCase().includes(q) ||
        officer.badgeId.toLowerCase().includes(q) ||
        officer.designation.toLowerCase().includes(q) ||
        officer.phone.toLowerCase().includes(q) ||
        officer.email.toLowerCase().includes(q) ||
        officer.talukas.some((t) => t.toLowerCase().includes(q));

      const matchesTaluka =
        selectedTalukaFilter === 'all' ||
        officer.talukas.some((t) => t.toLowerCase() === selectedTalukaFilter.toLowerCase());

      return matchesQuery && matchesTaluka;
    });
  }, [districtOfficers, searchQuery, selectedTalukaFilter]);

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleSendDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveContent.trim() || !selectedOfficerForDirective) return;

    if (onSendNotification) {
      onSendNotification({
        title: `[${directivePriority.toUpperCase()}] Directive from District Officer`,
        message: `${currentUser.fullName} issued directive to ${selectedOfficerForDirective.name} (${selectedOfficerForDirective.designation}) for Talukas [${selectedOfficerForDirective.talukas.join(', ')}]: "${directiveSubject || 'Urgent Case Directives'}".`,
        type: 'Directive',
      });
    }

    setDirectiveSentSuccess(true);
    setTimeout(() => {
      setDirectiveSentSuccess(false);
      setSelectedOfficerForDirective(null);
      setDirectiveSubject('');
      setDirectiveContent('');
    }, 1800);
  };

  // Helper to count cases in an officer's talukas
  const getTalukaCasesCount = (talukas: string[]) => {
    return cases.filter((c) => {
      const caseTaluka = c.taluka || '';
      const caseLocation = c.location || '';
      return talukas.some(
        (t) =>
          caseTaluka.toLowerCase().includes(t.toLowerCase()) ||
          caseLocation.toLowerCase().includes(t.toLowerCase()) ||
          c.subdivisionTaluka?.toLowerCase().includes(t.toLowerCase())
      );
    }).length;
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            id="btn-back-from-contacts"
            onClick={onBackToDashboard}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
              themeMode === 'bright'
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Return to Dashboard Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${
                themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
              }`}>
                Subdivision Officers Directory (Contacts)
              </h1>
              <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                themeMode === 'bright'
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
              }`}>
                {districtName} District
              </span>
            </div>
            <p className={`text-xs font-semibold mt-0.5 ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Direct contact details of the Subdivision Level Officers (SDPO / SDM) across all {allTalukas.length} talukas in {districtName} District
            </p>
          </div>
        </div>

        {/* Quick Summary Pill */}
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-bold ${
            themeMode === 'bright'
              ? 'bg-blue-50 border-blue-200 text-blue-950'
              : 'bg-blue-950/30 border-blue-800/60 text-blue-300'
          }`}>
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{allTalukas.length} Talukas • {districtOfficers.length} Officers On-Duty</span>
          </div>
        </div>
      </div>

      {/* District Coverage Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        themeMode === 'bright'
          ? 'bg-gradient-to-r from-amber-50/90 via-sky-50/60 to-white border-amber-200 text-slate-900'
          : 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border-yellow-500/30 text-slate-100'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-950 shadow-md shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-yellow-400">
                District Level Administrative Roster
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                100% Taluka Coverage
              </span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
              As the <strong>District Level Officer ({currentUser.designation || 'District Magistrate & Collector'})</strong>, you have direct administrative and supervisory communication channels with the Subdivisional Police Officers (SDPO) and Magistrates (SDM) responsible for every subdivision within {districtName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-contacts-case-mgmt"
            onClick={onNavigateToCaseManagement}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
              themeMode === 'bright'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>Review District Cases</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className={`p-4 rounded-2xl border space-y-3.5 shadow-sm ${
        themeMode === 'bright'
          ? 'bg-white border-slate-200'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              themeMode === 'bright' ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              id="input-contacts-search"
              placeholder="Search by Taluka, Officer name, Badge ID, phone or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border transition-all focus:outline-hidden focus:ring-2 ${
                themeMode === 'bright'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500/30'
                  : 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-yellow-500/30'
              }`}
            />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                themeMode === 'bright'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Taluka Quick Filter Pills */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-black uppercase tracking-wider ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Filter by Taluka Jurisdiction ({allTalukas.length}):
            </span>
            {selectedTalukaFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedTalukaFilter('all')}
                className="text-[11px] font-bold text-amber-600 dark:text-yellow-400 hover:underline cursor-pointer"
              >
                Reset Filter (Show All)
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              id="filter-taluka-all"
              onClick={() => setSelectedTalukaFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTalukaFilter === 'all'
                  ? themeMode === 'bright'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-yellow-500 text-slate-950 font-black shadow-xs'
                  : themeMode === 'bright'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              All Talukas ({allTalukas.length})
            </button>

            {allTalukas.map((taluka) => {
              const isSelected = selectedTalukaFilter.toLowerCase() === taluka.toLowerCase();
              return (
                <button
                  key={taluka}
                  type="button"
                  id={`filter-taluka-${taluka.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedTalukaFilter(taluka)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    isSelected
                      ? themeMode === 'bright'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-yellow-500 text-slate-950 font-black shadow-xs'
                      : themeMode === 'bright'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{taluka}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Officer Contact Short Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOfficers.map((officer) => {
          const talukaCasesCount = getTalukaCasesCount(officer.talukas);

          return (
            <div
              key={officer.id}
              id={`contact-card-${officer.id}`}
              className={`flex flex-col justify-between p-4 rounded-2xl border-2 transition-all shadow-xs hover:shadow-md ${
                themeMode === 'bright'
                  ? 'bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-white border-sky-200 hover:border-blue-300 text-slate-900'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-100'
              }`}
            >
              <div>
                {/* Top Row: Badge ID, Designation Tag, Status Badge */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      themeMode === 'bright'
                        ? 'bg-blue-100 text-blue-950 border-blue-300'
                        : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                      {officer.badgeId}
                    </span>
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                      themeMode === 'bright'
                        ? 'bg-purple-100 text-purple-950 border-purple-300'
                        : 'text-purple-300 bg-purple-900/30 border-purple-700/50'
                    }`}>
                      Subdivision Level
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center space-x-1.5 ${
                    themeMode === 'bright'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-extrabold'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-extrabold'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Active On-Duty</span>
                  </span>
                </div>

                {/* Officer Profile Header */}
                <div className="flex items-start space-x-3 mt-1.5">
                  <img
                    src={officer.photoUrl}
                    alt={officer.name}
                    className={`w-12 h-12 rounded-xl object-cover border-2 shrink-0 ${
                      themeMode === 'bright' ? 'border-sky-300' : 'border-slate-700'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-base font-extrabold leading-snug truncate ${
                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {officer.name}
                    </h3>
                    <p className={`text-xs font-bold mt-0.5 truncate ${
                      themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'
                    }`}>
                      {officer.designation}
                    </p>
                    <p className={`text-[11px] font-semibold mt-0.5 ${
                      themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {officer.district} District • Sub-Divisional Command
                    </p>
                  </div>
                </div>

                {/* Talukas Under Charge (Case Location Style) */}
                <div className={`mt-3 p-2.5 rounded-xl border ${
                  themeMode === 'bright'
                    ? 'bg-white/80 border-slate-200'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-extrabold flex items-center ${
                      themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0" />
                      <span>Jurisdiction Talukas ({officer.talukas.length}):</span>
                    </span>
                    {talukaCasesCount > 0 && (
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        themeMode === 'bright'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-amber-900/40 text-amber-300'
                      }`}>
                        {talukaCasesCount} Active Cases
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {officer.talukas.map((t) => (
                      <span
                        key={t}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          themeMode === 'bright'
                            ? 'bg-slate-100 text-slate-800 border-slate-200'
                            : 'bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Contact Particulars */}
                <div className="mt-3 space-y-1.5">
                  {/* Phone */}
                  <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-200'
                  }`}>
                    <a
                      href={`tel:${officer.phone}`}
                      className="flex items-center space-x-2 text-blue-600 dark:text-sky-400 hover:underline truncate"
                      title="Click to dial"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      <span className="font-mono font-bold truncate">{officer.phone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(officer.phone, `phone-${officer.id}`)}
                      className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-1.5 ${
                        copiedField === `phone-${officer.id}` ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                      title="Copy phone number"
                    >
                      {copiedField === `phone-${officer.id}` ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Email */}
                  <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-200'
                  }`}>
                    <a
                      href={`mailto:${officer.email}`}
                      className="flex items-center space-x-2 text-blue-600 dark:text-sky-400 hover:underline truncate"
                      title="Click to email"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                      <span className="font-mono truncate text-[11px]">{officer.email}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(officer.email, `email-${officer.id}`)}
                      className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-1.5 ${
                        copiedField === `email-${officer.id}` ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                      title="Copy email address"
                    >
                      {copiedField === `email-${officer.id}` ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Short Case Card Action Buttons (Bottom Bar) */}
              <div className={`flex flex-wrap items-center gap-2 pt-3 mt-3 border-t ${
                themeMode === 'bright' ? 'border-slate-300/80' : 'border-slate-800/80'
              }`}>
                <a
                  href={`tel:${officer.phone}`}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                    themeMode === 'bright'
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-300'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                  }`}
                  title="Direct phone line to SDPO"
                >
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  <span>Call Line</span>
                </a>

                <button
                  type="button"
                  id={`btn-directive-${officer.id}`}
                  onClick={() => {
                    setSelectedOfficerForDirective(officer);
                    setDirectiveSubject(`Administrative Directives: Talukas [${officer.talukas.join(', ')}]`);
                  }}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                    themeMode === 'bright'
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                      : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/40'
                  }`}
                  title="Dispatch official memo or enquiry directive to this SDPO"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>Send Directives</span>
                </button>

                <button
                  type="button"
                  id={`btn-cases-${officer.id}`}
                  onClick={onNavigateToCaseManagement}
                  className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-xs active:scale-95 ${
                    themeMode === 'bright'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Navigate to Case Management"
                >
                  <FolderLock className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                  <span>Taluka Cases</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOfficers.length === 0 && (
        <div className={`p-8 text-center rounded-2xl border border-dashed ${
          themeMode === 'bright' ? 'border-slate-300 text-slate-600' : 'border-slate-800 text-slate-400'
        }`}>
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500 opacity-80" />
          <p className="text-sm font-bold">No Subdivision Officers matching your search criteria.</p>
          <p className="text-xs mt-1">Try clearing your search query or selecting "All Talukas".</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTalukaFilter('all');
            }}
            className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Official Directive / Memo Dispatch Modal */}
      {selectedOfficerForDirective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-900 border-yellow-500/40 text-slate-100'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              themeMode === 'bright'
                ? 'border-slate-200 bg-amber-50/60'
                : 'border-slate-800 bg-slate-950/80'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-950">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-600 dark:text-yellow-400">
                    Dispatch Official Directive / Memo
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    To: {selectedOfficerForDirective.name} ({selectedOfficerForDirective.badgeId})
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-directive-modal"
                onClick={() => setSelectedOfficerForDirective(null)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  themeMode === 'bright'
                    ? 'border-slate-300 hover:bg-slate-100 text-slate-600'
                    : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content / Form */}
            {directiveSentSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  Directive Dispatched Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Official directive transmitted to {selectedOfficerForDirective.name} for Talukas [{selectedOfficerForDirective.talukas.join(', ')}] with high-priority audit acknowledgment.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendDirective} className="p-4 space-y-3.5">
                <div className={`p-2.5 rounded-xl border text-xs ${
                  themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    <strong>Designation:</strong> {selectedOfficerForDirective.designation}
                  </p>
                  <p className="font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                    <strong>Jurisdiction:</strong> Talukas {selectedOfficerForDirective.talukas.join(', ')} ({selectedOfficerForDirective.district} District)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Standard', 'Urgent', 'Immediate Action'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDirectivePriority(level)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          directivePriority === level
                            ? level === 'Immediate Action'
                              ? 'bg-rose-600 text-white border-rose-500'
                              : level === 'Urgent'
                              ? 'bg-amber-500 text-white border-amber-400'
                              : 'bg-blue-600 text-white border-blue-500'
                            : themeMode === 'bright'
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Subject / Reference
                  </label>
                  <input
                    type="text"
                    value={directiveSubject}
                    onChange={(e) => setDirectiveSubject(e.target.value)}
                    required
                    placeholder="e.g. Bandobast & High-Priority Case Enquiry Directive"
                    className={`w-full px-3 py-2 text-xs rounded-xl border transition-all focus:outline-hidden focus:ring-2 ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/30'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:ring-yellow-500/30'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Directives / Operational Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={directiveContent}
                    onChange={(e) => setDirectiveContent(e.target.value)}
                    required
                    placeholder="Enter instructions, progress checkpoints, or administrative requirements for this SDPO..."
                    className={`w-full px-3 py-2 text-xs rounded-xl border transition-all focus:outline-hidden focus:ring-2 ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-blue-500/30'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:ring-yellow-500/30'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedOfficerForDirective(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      themeMode === 'bright'
                        ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                        : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-confirm-send-directive"
                    className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    Transmit Directive
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
