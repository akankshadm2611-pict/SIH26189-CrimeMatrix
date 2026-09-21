import React, { useState } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { StateGovtRegistrationView } from './StateGovtRegistrationView';
import {
  MOCK_DISTRICT_LEVEL_OFFICERS,
  MAHARASHTRA_36_DISTRICTS,
  SOLAPUR_SUBDIVISION_OFFICERS,
  JALNA_SUBDIVISION_OFFICERS,
  KOLHAPUR_SUBDIVISION_OFFICERS,
  DistrictLevelOfficerCard,
  SubdivisionLevelOfficerCard,
} from '../data/stateCadreOfficersData';
import { getTalukasForDistrict } from '../data/indiaLocations';
import {
  Users,
  Search,
  Phone,
  Mail,
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  Building2,
  MapPin,
  ChevronRight,
  BadgeCheck,
  Compass,
} from 'lucide-react';

interface StateGovtRegisteredOfficersViewProps {
  currentUser: User;
  users: User[];
  onRegisterApprovedUser: (newUser: User) => void;
  themeMode?: 'dark' | 'bright';
  onBackToDashboard?: () => void;
}

export const StateGovtRegisteredOfficersView: React.FC<StateGovtRegisteredOfficersViewProps> = ({
  currentUser,
  users,
  onRegisterApprovedUser,
  themeMode = 'dark',
  onBackToDashboard,
}) => {
  const { t } = useLanguage();

  // Two main options: 'District Level Officers' and 'Subdivision Level Officer'
  const [selectedCategory, setSelectedCategory] = useState<
    'District Level Officers' | 'Subdivision Level Officer'
  >('District Level Officers');

  // When 'Subdivision Level Officer' is chosen, tracking the currently opened District
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Search filter
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [officerSearchQuery, setOfficerSearchQuery] = useState('');

  // Internal registration mode if officer clicked "Register New Officer"
  const [activeRegistrationRole, setActiveRegistrationRole] = useState<
    'District Level' | 'Subdivision Level' | null
  >(null);

  // If in registration mode, render the registration view
  if (activeRegistrationRole) {
    return (
      <StateGovtRegistrationView
        initialRole={activeRegistrationRole}
        currentUser={currentUser}
        existingUsers={users}
        onRegisterApprovedUser={(newUser) => {
          onRegisterApprovedUser(newUser);
          setActiveRegistrationRole(null);
        }}
        onBackToDashboard={() => setActiveRegistrationRole(null)}
        themeMode={themeMode}
      />
    );
  }

  // Helper to compare district names robustly
  const isSameDistrict = (d1?: string, d2?: string) => {
    if (!d1 || !d2) return false;
    const clean1 = d1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const clean2 = d2.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1);
  };

  // Aggregate District Level Officers (Newly registered at top + Mock officers)
  const registeredDistrictUsers = users.filter(
    (u) =>
      u.role === 'District Level' &&
      u.id !== 'u-district-1' &&
      u.id !== 'u-district-2' &&
      u.id !== 'u-district-3' &&
      u.badgeId !== 'SP-2091'
  );
  const allDistrictOfficers: DistrictLevelOfficerCard[] = [
    ...registeredDistrictUsers
      .filter((u) => !MOCK_DISTRICT_LEVEL_OFFICERS.some((m) => m.id === u.id || m.badgeId === u.badgeId))
      .map((u) => ({
        id: u.id,
        name: u.fullName,
        district: u.district || 'Maharashtra',
        badgeId: u.badgeId || 'DLO-GEN',
        designation: u.designation || 'District Level Officer',
        photoUrl:
          u.avatarUrl ||
          (u.gender === 'Female'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80'),
        phone: u.phone || '+91 98220 00000',
        email: u.email || 'officer@police.gov.in',
      })),
    ...MOCK_DISTRICT_LEVEL_OFFICERS,
  ];

  // Filtered District Level Officers
  const filteredDistrictOfficers = allDistrictOfficers.filter((off) => {
    if (!officerSearchQuery) return true;
    const q = officerSearchQuery.toLowerCase();
    return (
      off.name.toLowerCase().includes(q) ||
      off.district.toLowerCase().includes(q) ||
      off.badgeId.toLowerCase().includes(q)
    );
  });

  // Get Subdivision Level Officers for a given District
  const getSubdivisionOfficersForDistrict = (districtName: string): SubdivisionLevelOfficerCard[] => {
    const normalized = districtName.trim().toLowerCase();
    const talukas = getTalukasForDistrict('Maharashtra', districtName);

    // Find dynamic/newly registered users for this district
    const dynamicUsers = users.filter(
      (u) => u.role === 'Subdivision Level' && isSameDistrict(u.district, districtName)
    );

    const dynamicCards: SubdivisionLevelOfficerCard[] = dynamicUsers.map((u, i) => ({
      id: u.id,
      name: u.fullName,
      district: districtName,
      talukas:
        u.talukas && u.talukas.length > 0
          ? u.talukas
          : talukas.length > 0
          ? talukas.slice(0, 2)
          : [`${districtName} Region`],
      badgeId: u.badgeId || `SDPO-${districtName.substring(0, 3).toUpperCase()}-EXT-${i + 1}`,
      designation: u.designation || 'Subdivision Level Officer',
      photoUrl:
        u.avatarUrl ||
        (u.gender === 'Female'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80'),
      phone: u.phone || '+91 98230 00000',
      email: u.email || `sdpo@${districtName.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`,
    }));

    // Base officers for Solapur, Jalna, Kolhapur, or generated from talukas
    let baseOfficers: SubdivisionLevelOfficerCard[] = [];

    if (normalized === 'solapur') {
      baseOfficers = SOLAPUR_SUBDIVISION_OFFICERS;
    } else if (normalized === 'jalna') {
      baseOfficers = JALNA_SUBDIVISION_OFFICERS;
    } else if (normalized === 'kolhapur') {
      baseOfficers = KOLHAPUR_SUBDIVISION_OFFICERS;
    } else {
      const avatarPhotos = [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
      ];

      const chunkSize = 2;
      for (let i = 0; i < talukas.length; i += chunkSize) {
        const chunk = talukas.slice(i, i + chunkSize);
        const officerIndex = Math.floor(i / chunkSize) + 1;
        baseOfficers.push({
          id: `sdpo-${districtName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${officerIndex}`,
          name: `Officer ${chunk[0]} Sub-Division`,
          district: districtName,
          talukas: chunk,
          badgeId: `SDPO-${districtName.substring(0, 3).toUpperCase()}-0${officerIndex}`,
          designation: 'Sub-Divisional Police Officer (SDPO)',
          photoUrl: avatarPhotos[(officerIndex - 1) % avatarPhotos.length],
          phone: `+91 98230 ${10000 + officerIndex * 111}`,
          email: `sdpo.${chunk[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@${districtName.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`,
        });
      }

      if (baseOfficers.length === 0) {
        baseOfficers = [
          {
            id: `sdpo-${districtName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-default`,
            name: `SDPO ${districtName} Central`,
            district: districtName,
            talukas: [`${districtName} Sadar`, `${districtName} Rural`],
            badgeId: `SDPO-${districtName.substring(0, 3).toUpperCase()}-01`,
            designation: 'Sub-Divisional Police Officer',
            photoUrl: avatarPhotos[0],
            phone: '+91 98230 11111',
            email: `sdpo@${districtName.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov.in`,
          },
        ];
      }
    }

    // Dynamic (newly registered) cards appear FIRST in the list
    return [
      ...dynamicCards,
      ...baseOfficers.filter((b) => !dynamicCards.some((d) => d.id === b.id)),
    ];
  };

  // Filtered districts list
  const filteredDistricts = MAHARASHTRA_36_DISTRICTS.filter((dist) =>
    dist.toLowerCase().includes(districtSearchQuery.trim().toLowerCase())
  );

  return (
    <div
      id="view-state-govt-registered-officers"
      className={`min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 transition-colors ${
        themeMode === 'bright' ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0f1d] text-slate-100'
      }`}
    >
      {/* Top Main Card */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border shadow-xl space-y-6 ${
          themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        {/* Header Bar */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${
          themeMode === 'bright' ? 'border-slate-200' : 'border-slate-700/50'
        }`}>
          <div>
            <div className="flex items-center space-x-3">
              {onBackToDashboard && (
                <button
                  type="button"
                  id="btn-back-to-dashboard"
                  onClick={onBackToDashboard}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer mr-1 active:scale-95 ${
                    themeMode === 'bright'
                      ? 'border-slate-300 hover:bg-slate-100 text-slate-800'
                      : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  }`}
                  title={t('Back to Dashboard')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-amber-500" />
                <h1 className={`text-xl sm:text-2xl font-black tracking-wide ${
                  themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                }`}>
                  {t('Registered Officers')}
                </h1>
              </div>
            </div>
            <p className={`text-xs sm:text-sm mt-1 font-medium ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              State Government Cadre Roster • Maharashtra Police Administration
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              id="btn-register-district-officer"
              onClick={() => setActiveRegistrationRole('District Level')}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 shadow-sm border ${
                themeMode === 'bright'
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-950 border-blue-300'
                  : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border-blue-500/40'
              }`}
            >
              <UserPlus className={`w-3.5 h-3.5 ${themeMode === 'bright' ? 'text-blue-700' : 'text-blue-300'}`} />
              <span>+ Register District Level</span>
            </button>

            <button
              type="button"
              id="btn-register-subdivision-officer"
              onClick={() => setActiveRegistrationRole('Subdivision Level')}
              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md border border-amber-400/40 flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Register Subdivision Level</span>
            </button>
          </div>
        </div>

        {/* The Two Main Options: 'District Level Officers' and 'Subdivision Level Officer' */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            id="tab-district-level-officers"
            onClick={() => {
              setSelectedCategory('District Level Officers');
              setSelectedDistrict(null);
            }}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedCategory === 'District Level Officers'
                ? themeMode === 'bright'
                  ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-gradient-to-r from-blue-950/60 to-slate-900 border-blue-500/80 text-white shadow-xl ring-2 ring-blue-500/30'
                : themeMode === 'bright'
                ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400'
                : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
                  selectedCategory === 'District Level Officers'
                    ? 'bg-blue-600 text-white border-blue-400/60 shadow-blue-500/30'
                    : themeMode === 'bright'
                    ? 'bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-black text-sm sm:text-base ${
                  themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                }`}>
                  District Level Officers
                </h3>
                <p className={`text-xs mt-0.5 font-medium ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  View authorized District Magistrates, Collectors & SPs
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
                selectedCategory === 'District Level Officers'
                  ? themeMode === 'bright'
                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : themeMode === 'bright'
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {allDistrictOfficers.length} Officers
            </span>
          </button>

          <button
            type="button"
            id="tab-subdivision-level-officer"
            onClick={() => {
              setSelectedCategory('Subdivision Level Officer');
            }}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedCategory === 'Subdivision Level Officer'
                ? themeMode === 'bright'
                  ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-500/20'
                  : 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/80 text-white shadow-xl ring-2 ring-amber-500/30'
                : themeMode === 'bright'
                ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400'
                : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${
                  selectedCategory === 'Subdivision Level Officer'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/30'
                    : themeMode === 'bright'
                    ? 'bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-black text-sm sm:text-base ${
                  themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                }`}>
                  Subdivision Level Officer
                </h3>
                <p className={`text-xs mt-0.5 font-medium ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Explore 36 Maharashtra Districts & Sub-Divisional Talukas
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border ${
                selectedCategory === 'Subdivision Level Officer'
                  ? themeMode === 'bright'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : themeMode === 'bright'
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              36 Districts
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* OPTION 1: DISTRICT LEVEL OFFICERS VIEW */}
        {/* ========================================================= */}
        {selectedCategory === 'District Level Officers' && (
          <div className="space-y-5 pt-2">
            {/* Header / Filter row */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
              themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800/60'
            }`}>
              <div>
                <h2 className={`text-base sm:text-lg font-black flex items-center space-x-2 ${
                  themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                }`}>
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <span>District Level Officers ({filteredDistrictOfficers.length})</span>
                </h2>
                <p className={`text-xs mt-0.5 font-medium ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Authorized Officers assigned to Districts: Solapur, Jalna, Kolhapur
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className={`w-4 h-4 absolute left-3 top-2.5 ${
                  themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={officerSearchQuery}
                  onChange={(e) => setOfficerSearchQuery(e.target.value)}
                  placeholder="Search officer name or district..."
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold border focus:outline-hidden transition-all ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-blue-500'
                      : 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Cards List as requested:
                Photo on the right side of the card,
                Name in front of the photo (left side),
                District name assigned to that officer at registration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {filteredDistrictOfficers.map((officer) => (
                <div
                  key={officer.id}
                  id={`card-district-officer-${officer.id}`}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-xl flex flex-col justify-between space-y-4 ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300 hover:border-blue-500 shadow-md'
                      : 'bg-slate-950/80 border-slate-800 hover:border-blue-500/50 shadow-lg'
                  }`}
                >
                  {/* Top row with content on left and Photo on the right */}
                  <div className="flex items-start justify-between gap-4">
                    {/* In front of the photo: Name and details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          themeMode === 'bright'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        }`}>
                          District Level
                        </span>
                        <span className={`text-[11px] font-mono font-bold ${
                          themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {officer.badgeId}
                        </span>
                      </div>

                      {/* Name of District Level Officer infront of the photo */}
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${
                          themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          Officer Name
                        </span>
                        <h4 className={`text-base sm:text-lg font-black tracking-tight leading-snug ${
                          themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                        }`}>
                          {officer.name}
                        </h4>
                        <span className={`text-xs font-semibold ${
                          themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {officer.designation}
                        </span>
                      </div>

                      {/* District Name assigned at Registration */}
                      <div className="pt-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${
                          themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          Assigned District
                        </span>
                        <div className={`inline-flex items-center space-x-1.5 px-3 py-1 mt-0.5 rounded-lg border text-xs font-black ${
                          themeMode === 'bright'
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          <Building2 className={`w-3.5 h-3.5 ${
                            themeMode === 'bright' ? 'text-amber-800' : 'text-amber-400'
                          }`} />
                          <span>{officer.district}</span>
                        </div>
                      </div>
                    </div>

                    {/* Photo Image on the right side of the card */}
                    <div className="shrink-0">
                      <img
                        src={officer.photoUrl}
                        alt={officer.name}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 shadow-md ${
                          themeMode === 'bright'
                            ? 'border-amber-500/80 ring-2 ring-slate-200'
                            : 'border-amber-500/60 ring-2 ring-white/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Footer with Contact info */}
                  <div className={`pt-3 border-t text-xs space-y-1.5 ${
                    themeMode === 'bright'
                      ? 'border-slate-200 text-slate-700'
                      : 'border-slate-800/60 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Phone className={`w-3.5 h-3.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`} />
                        <span className={`font-mono font-medium ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                          {officer.phone}
                        </span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                        themeMode === 'bright'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        APPROVED
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate text-[11px]">
                      <Mail className={`w-3.5 h-3.5 shrink-0 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`} />
                      <span className={`truncate font-medium ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                        {officer.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* OPTION 2: SUBDIVISION LEVEL OFFICER VIEW */}
        {/* ========================================================= */}
        {selectedCategory === 'Subdivision Level Officer' && (
          <div className="space-y-6 pt-2">
            {/* If NO District is selected yet: Show all 36 District buttons */}
            {!selectedDistrict ? (
              <div className="space-y-6">
                {/* Information Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                  themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800/60'
                }`}>
                  <div>
                    <h2 className={`text-base sm:text-lg font-black flex items-center space-x-2 ${
                      themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                    }`}>
                      <MapPin className="w-5 h-5 text-amber-500" />
                      <span>Select a Maharashtra District (36 Total)</span>
                    </h2>
                    <p className={`text-xs mt-0.5 font-medium ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      Click any district below to view its assigned Sub-Divisional Police Officers and Talukas
                    </p>
                  </div>

                  {/* Search District */}
                  <div className="relative w-full sm:w-72">
                    <Search className={`w-4 h-4 absolute left-3 top-2.5 ${
                      themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <input
                      type="text"
                      value={districtSearchQuery}
                      onChange={(e) => setDistrictSearchQuery(e.target.value)}
                      placeholder="Search district name..."
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold border focus:outline-hidden transition-all ${
                        themeMode === 'bright'
                          ? 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-400 focus:border-amber-500'
                          : 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Complete List of All 36 Districts as buttons (Priority cards removed per user request) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs uppercase tracking-wider font-black ${
                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'
                    }`}>
                      All 36 Maharashtra Districts (Click to View Subdivision Officers)
                    </span>
                    <span className={`text-xs font-bold font-mono ${
                      themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      Showing {filteredDistricts.length} of 36
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {filteredDistricts.map((dist, idx) => {
                      const isMainThree = ['Solapur', 'Jalna', 'Kolhapur'].includes(dist);
                      const hasRegistered = users.some(
                        (u) => u.role === 'Subdivision Level' && isSameDistrict(u.district, dist)
                      );
                      return (
                        <button
                          key={dist}
                          type="button"
                          id={`btn-district-grid-${dist.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          onClick={() => setSelectedDistrict(dist)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group active:scale-95 shadow-xs ${
                            hasRegistered
                              ? themeMode === 'bright'
                                ? 'bg-blue-50/80 border-2 border-blue-500 hover:bg-blue-100 shadow-sm'
                                : 'bg-blue-950/40 border-2 border-blue-400 hover:bg-blue-900/50 shadow-md ring-1 ring-blue-400/40'
                              : isMainThree
                              ? themeMode === 'bright'
                                ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                                : 'bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20 hover:border-amber-400'
                              : themeMode === 'bright'
                              ? 'bg-white border-slate-300 hover:bg-blue-50 hover:border-blue-400'
                              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-600'
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className={`text-[10px] font-mono block ${
                              themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'
                            }`}>
                              #{idx + 1}
                            </span>
                            <span
                              className={`text-xs truncate block ${
                                hasRegistered
                                  ? themeMode === 'bright'
                                    ? 'text-blue-950 font-black'
                                    : 'text-blue-200 font-black'
                                  : isMainThree
                                  ? themeMode === 'bright'
                                    ? 'text-amber-950 font-black'
                                    : 'text-amber-300 font-black'
                                  : themeMode === 'bright'
                                  ? 'text-slate-950 font-black'
                                  : 'text-slate-100 font-bold'
                              }`}
                            >
                              {dist}
                            </span>
                            {hasRegistered && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-xs">
                                Registered
                              </span>
                            )}
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform ${
                            themeMode === 'bright'
                              ? 'text-slate-600 group-hover:text-slate-950'
                              : 'text-slate-400 group-hover:text-white'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ========================================================= */
              /* SUBDIVISION LEVEL OFFICERS FOR SELECTED DISTRICT */
              /* ========================================================= */
              <div className="space-y-6">
                {/* Back button and district title */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
                  themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800/60'
                }`}>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      id="btn-back-to-districts-list"
                      onClick={() => setSelectedDistrict(null)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95 shadow-sm ${
                        themeMode === 'bright'
                          ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-900'
                          : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Districts</span>
                    </button>

                    <div>
                      <h2 className={`text-lg sm:text-xl font-black flex items-center space-x-2 ${
                        themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                      }`}>
                        <span>{selectedDistrict} District</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-black border ${
                          themeMode === 'bright'
                            ? 'bg-cyan-100 text-cyan-950 border-cyan-300'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          Subdivision Level Officers
                        </span>
                      </h2>
                      <p className={`text-xs mt-0.5 font-medium ${
                        themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        Authorized officers and assigned talukas in {selectedDistrict}
                      </p>
                    </div>
                  </div>

                  {/* Summary badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {getSubdivisionOfficersForDistrict(selectedDistrict).length} Subdivision Officers
                    </span>
                  </div>
                </div>

                {/* Cards for the selected District:
                    Photo on the right side of the card,
                    Name in front of the photo (left side),
                    Talukas names assigned to that Subdivision officer at registration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {getSubdivisionOfficersForDistrict(selectedDistrict).map((officer, index) => (
                    <div
                      key={officer.id}
                      id={`card-subdivision-officer-${officer.id}`}
                      className={`p-5 rounded-2xl border transition-all hover:shadow-xl flex flex-col justify-between space-y-4 ${
                        themeMode === 'bright'
                          ? 'bg-white border-slate-300 hover:border-cyan-500 shadow-md'
                          : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/50 shadow-lg'
                      }`}
                    >
                      {/* Top row with details on left and Photo on the right */}
                      <div className="flex items-start justify-between gap-4">
                        {/* In front of the photo: Name, Designation, and Talukas */}
                        <div className="flex-1 min-w-0 space-y-2.5">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              themeMode === 'bright'
                                ? 'bg-cyan-100 text-cyan-950 border-cyan-300'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}>
                              Subdivision Officer #{index + 1}
                            </span>
                            <span className={`text-[11px] font-mono font-bold ${
                              themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                            }`}>
                              {officer.badgeId}
                            </span>
                          </div>

                          {/* Name of Subdivision Level officer infront of the photo */}
                          <div>
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${
                              themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                            }`}>
                              Officer Name
                            </span>
                            <h4 className={`text-base sm:text-lg font-black tracking-tight leading-snug ${
                              themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                            }`}>
                              {officer.name}
                            </h4>
                            <span className={`text-xs font-semibold ${
                              themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                            }`}>
                              {officer.designation}
                            </span>
                          </div>

                          {/* Talukas names assigned to that officer at Registration */}
                          <div className="pt-1 space-y-1">
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${
                              themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                            }`}>
                              Assigned Talukas ({officer.talukas.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {officer.talukas.map((tk) => (
                                <span
                                  key={tk}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black border flex items-center space-x-1 ${
                                    themeMode === 'bright'
                                      ? 'bg-cyan-50 text-cyan-950 border-cyan-300'
                                      : 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                                  }`}
                                >
                                  <MapPin className={`w-3 h-3 ${
                                    themeMode === 'bright' ? 'text-cyan-800' : 'text-cyan-400'
                                  }`} />
                                  <span>{tk}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Photo Image on the right side of the card */}
                        <div className="shrink-0">
                          <img
                            src={officer.photoUrl}
                            alt={officer.name}
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 shadow-md ${
                              themeMode === 'bright'
                                ? 'border-cyan-500/80 ring-2 ring-slate-200'
                                : 'border-cyan-400/60 ring-2 ring-white/10'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Footer with Contact info */}
                      <div className={`pt-3 border-t text-xs space-y-1.5 ${
                        themeMode === 'bright'
                          ? 'border-slate-200 text-slate-700'
                          : 'border-slate-800/60 text-slate-400'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Phone className={`w-3.5 h-3.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`} />
                            <span className={`font-mono font-medium ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                              {officer.phone}
                            </span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                            themeMode === 'bright'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            APPROVED
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 truncate text-[11px]">
                          <Mail className={`w-3.5 h-3.5 shrink-0 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`} />
                          <span className={`truncate font-medium ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
                            {officer.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
