import React, { useState } from 'react';
import { User } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Check,
  Trash2,
  X,
  MapPin,
  Tag,
  CalendarCheck,
  UserPlus,
  Building2,
  Search,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface RegistrationSlot {
  id: string;
  candidateName: string;
  role: 'District Level' | 'Subdivision Level';
  jurisdiction: string;
  stage: string;
  dateStr: string;
  timeStr: string;
  venue: string;
  completed: boolean;
}

const INITIAL_REGISTRATION_SLOTS: RegistrationSlot[] = [
  {
    id: 'reg-slot-1',
    candidateName: 'SP Rajesh Kumar, IPS',
    role: 'District Level',
    jurisdiction: 'Pune District',
    stage: 'Biometric Iris Enrolment & Face Scan',
    dateStr: '18-09-2026',
    timeStr: '11:00 AM',
    venue: 'State Secretariat Biometric Room 3',
    completed: false,
  },
  {
    id: 'reg-slot-2',
    candidateName: 'SDPO Anita Deshmukh, MPS',
    role: 'Subdivision Level',
    jurisdiction: 'Haveli Subdivision (Pune)',
    stage: 'Gazette Appointment & Document Verification',
    dateStr: '18-09-2026',
    timeStr: '02:30 PM',
    venue: 'Home Department Verification Chamber',
    completed: false,
  },
  {
    id: 'reg-slot-3',
    candidateName: 'SP Vikram Patil, IPS',
    role: 'District Level',
    jurisdiction: 'Nagpur District',
    stage: 'Digital Keyring & Portal Credential Handover',
    dateStr: '19-09-2026',
    timeStr: '10:30 AM',
    venue: 'State Cyber Command Center',
    completed: false,
  },
  {
    id: 'reg-slot-4',
    candidateName: 'SDPO Rahul Verma, MPS',
    role: 'Subdivision Level',
    jurisdiction: 'Baramati Subdivision (Pune)',
    stage: 'State Police Portal Credentials Activation',
    dateStr: '19-09-2026',
    timeStr: '04:00 PM',
    venue: 'State Secretariat Room 102',
    completed: true,
  },
];

interface StateGovtRegistrationScheduleProps {
  currentUser: User;
  themeMode?: 'dark' | 'bright';
  onExitFullScreen?: () => void;
}

export const StateGovtRegistrationSchedule: React.FC<StateGovtRegistrationScheduleProps> = ({
  currentUser: _currentUser,
  themeMode = 'dark',
  onExitFullScreen,
}) => {
  const { t } = useLanguage();
  const isBright = themeMode === 'bright';

  const [slots, setSlots] = useState<RegistrationSlot[]>(INITIAL_REGISTRATION_SLOTS);
  const [roleFilter, setRoleFilter] = useState<'All' | 'District Level' | 'Subdivision Level'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [cadreRole, setCadreRole] = useState<'District Level' | 'Subdivision Level'>('District Level');
  const [jurisdiction, setJurisdiction] = useState('');
  const [stage, setStage] = useState('Biometric Iris Enrolment & Face Scan');
  const [dateStr, setDateStr] = useState('18-09-2026');
  const [timeStr, setTimeStr] = useState('11:00 AM');
  const [venue, setVenue] = useState('State Secretariat Biometric Room 3');

  const handleToggleCompleted = (id: string) => {
    setSlots((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleDeleteSlot = (id: string) => {
    setSlots((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !jurisdiction.trim()) return;

    const newSlot: RegistrationSlot = {
      id: `reg-slot-${Date.now()}`,
      candidateName: candidateName.trim(),
      role: cadreRole,
      jurisdiction: jurisdiction.trim(),
      stage,
      dateStr,
      timeStr,
      venue: venue.trim() || 'State Secretariat Verification Chamber',
      completed: false,
    };

    setSlots((prev) => [newSlot, ...prev]);
    setCandidateName('');
    setJurisdiction('');
    setShowAddModal(false);
  };

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    if (roleFilter !== 'All' && slot.role !== roleFilter) return false;
    if (statusFilter === 'Upcoming' && slot.completed) return false;
    if (statusFilter === 'Completed' && !slot.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = slot.candidateName.toLowerCase().includes(q);
      const matchJurisdiction = slot.jurisdiction.toLowerCase().includes(q);
      const matchStage = slot.stage.toLowerCase().includes(q);
      if (!matchName && !matchJurisdiction && !matchStage) return false;
    }
    return true;
  });

  const totalCount = slots.length;
  const completedCount = slots.filter((s) => s.completed).length;
  const upcomingCount = totalCount - completedCount;

  return (
    <div
      id="state-govt-registration-schedule"
      className={`min-h-screen transition-colors duration-200 ${
        isBright ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title Bar & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isBright
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                }`}
              >
                {t('State Govt Secretariat')}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isBright ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                • {t('Officer Registration Timetable')}
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${
                isBright ? 'text-slate-900' : 'text-white'
              }`}
            >
              {t('Registration Schedule')}
            </h1>
            <p
              className={`text-xs sm:text-sm font-medium mt-1 ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {t('Official timetable for District Level and Subdivision Level officer induction, biometric iris scans, and credentials verification.')}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onExitFullScreen && (
              <button
                id="btn-schedule-exit-fullscreen"
                onClick={onExitFullScreen}
                className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer ${
                  isBright
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{t('Exit Full Screen')}</span>
              </button>
            )}

            <button
              id="btn-add-registration-slot"
              onClick={() => setShowAddModal(true)}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl flex items-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                isBright
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                  : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('Schedule Registration')}</span>
            </button>
          </div>
        </div>

        {/* Minimal Stats Overview Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-2xs ${
              isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('Total Sessions')}
              </p>
              <p className={`text-2xl font-black mt-1 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                {totalCount}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${isBright ? 'bg-sky-50 text-sky-700' : 'bg-sky-950/60 text-sky-300'}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-2xs ${
              isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('Upcoming Verification')}
              </p>
              <p className={`text-2xl font-black mt-1 ${isBright ? 'text-amber-600' : 'text-amber-400'}`}>
                {upcomingCount}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${isBright ? 'bg-amber-50 text-amber-700' : 'bg-amber-950/60 text-amber-300'}`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-2xs ${
              isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('Completed Registrations')}
              </p>
              <p className={`text-2xl font-black mt-1 ${isBright ? 'text-emerald-600' : 'text-emerald-400'}`}>
                {completedCount}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${isBright ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-950/60 text-emerald-300'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Minimal Filter and Search Controls */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          {/* Cadre Filter Buttons */}
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-2">
            {(['All', 'District Level', 'Subdivision Level'] as const).map((cadre) => (
              <button
                key={cadre}
                onClick={() => setRoleFilter(cadre)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  roleFilter === cadre
                    ? isBright
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-sky-400 text-slate-950'
                    : isBright
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {t(cadre)}
              </button>
            ))}

            <div className={`h-4 w-px mx-1 ${isBright ? 'bg-slate-300' : 'bg-slate-700'}`} />

            {/* Status Filter Buttons */}
            {(['All', 'Upcoming', 'Completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === status
                    ? isBright
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-200 text-slate-900'
                    : isBright
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {t(status)}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search officer or district...')}
              className={`w-full pl-8.5 pr-3 py-1.5 text-xs font-medium rounded-xl border focus:outline-hidden transition-colors ${
                isBright
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                  : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-sky-400'
              }`}
            />
          </div>
        </div>

        {/* Minimal Registration Schedule Cards */}
        <div className="space-y-3">
          {filteredSlots.length === 0 ? (
            <div
              className={`p-12 text-center rounded-2xl border text-sm ${
                isBright ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
              <p className="font-bold">{t('No registration slots match the current filter.')}</p>
              <p className="text-xs mt-1 text-slate-400">{t('Use the "+ Schedule Registration" button above to add an officer verification session.')}</p>
            </div>
          ) : (
            filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
                  slot.completed
                    ? isBright
                      ? 'bg-emerald-50/40 border-emerald-200/90'
                      : 'bg-emerald-950/20 border-emerald-900/40'
                    : isBright
                    ? 'bg-white border-slate-200 hover:border-sky-300'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left Side: Checkbox + Officer & Registration Details */}
                <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleCompleted(slot.id)}
                    className={`mt-0.5 sm:mt-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      slot.completed
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : isBright
                        ? 'border-slate-300 hover:border-sky-500 hover:bg-sky-50'
                        : 'border-slate-700 hover:border-sky-400 hover:bg-slate-800'
                    }`}
                    title={slot.completed ? t('Mark as Pending') : t('Mark as Completed')}
                  >
                    {slot.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${
                          slot.role === 'District Level'
                            ? isBright
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-sky-950/60 text-sky-300 border-sky-800'
                            : isBright
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-amber-950/60 text-amber-300 border-amber-800'
                        }`}
                      >
                        {slot.role === 'District Level' ? t('District Level') : t('Subdivision Level')}
                      </span>

                      <h3
                        className={`text-sm sm:text-base font-bold truncate ${
                          slot.completed
                            ? isBright
                              ? 'text-slate-500 line-through'
                              : 'text-slate-500 line-through'
                            : isBright
                            ? 'text-slate-900'
                            : 'text-white'
                        }`}
                      >
                        {slot.candidateName}
                      </h3>

                      {slot.completed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          ✓ {t('Verified & Enrolled')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs flex-wrap gap-y-1">
                      <span className={`flex items-center space-x-1 font-semibold ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                        <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>{slot.jurisdiction}</span>
                      </span>

                      <span className={`flex items-center space-x-1 font-medium ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Tag className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{t(slot.stage)}</span>
                      </span>

                      <span className={`flex items-center space-x-1 font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{slot.venue}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Date/Time Badge & Actions */}
                <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                  <div
                    className={`px-3 py-1.5 rounded-xl border text-right ${
                      isBright
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold justify-end">
                      <CalendarIcon className="w-3 h-3 text-sky-500" />
                      <span>{slot.dateStr}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {slot.timeStr}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isBright
                        ? 'border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                        : 'border-slate-800 hover:border-rose-900 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400'
                    }`}
                    title={t('Delete Registration Slot')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 ${
              isBright ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-sky-600 text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{t('Schedule Registration Slot')}</h3>
                  <p className="text-xs text-slate-500">{t('Officer induction and biometric verification')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {t('Candidate Officer Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. SP Rajesh Kumar, IPS"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                      : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-sky-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {t('Designated Cadre')} *
                  </label>
                  <select
                    value={cadreRole}
                    onChange={(e) => setCadreRole(e.target.value as 'District Level' | 'Subdivision Level')}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden cursor-pointer ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="District Level">{t('District Level')}</option>
                    <option value="Subdivision Level">{t('Subdivision Level')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {t('Jurisdiction / District')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="e.g. Pune District"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-sky-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {t('Registration Purpose / Stage')} *
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden cursor-pointer ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="Biometric Iris Enrolment & Face Scan">{t('Biometric Iris Enrolment & Face Scan')}</option>
                  <option value="Gazette Appointment & Document Verification">{t('Gazette Appointment & Document Verification')}</option>
                  <option value="Digital Keyring & Portal Credential Handover">{t('Digital Keyring & Portal Credential Handover')}</option>
                  <option value="State Police Portal Credentials Activation">{t('State Police Portal Credentials Activation')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {t('Date')}
                  </label>
                  <input
                    type="text"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {t('Time Slot')}
                  </label>
                  <input
                    type="text"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {t('Verification Chamber / Venue')}
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. State Secretariat Biometric Room 3"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-hidden ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    isBright
                      ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                      : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {t('Cancel')}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-xs bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {t('Schedule Registration')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
