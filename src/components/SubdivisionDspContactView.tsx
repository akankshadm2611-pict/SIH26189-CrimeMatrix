import React, { useState } from 'react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Phone,
  PhoneCall,
  Mail,
  Building2,
  Shield,
  ShieldCheck,
  MapPin,
  Radio,
  Copy,
  Check,
  ArrowLeft,
  Send,
  UserCheck,
  AlertCircle,
  ExternalLink,
  FolderLock,
  Clock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface SubdivisionDspContactViewProps {
  currentUser: User;
  users: User[];
  themeMode?: 'dark' | 'bright';
  onBackToDashboard: () => void;
  onNavigateToCaseManagement?: () => void;
  onSendNotification?: (notif: { title: string; message: string; type: string }) => void;
}

export const SubdivisionDspContactView: React.FC<SubdivisionDspContactViewProps> = ({
  currentUser,
  users,
  themeMode = 'dark',
  onBackToDashboard,
  onNavigateToCaseManagement,
  onSendNotification,
}) => {
  const { t } = useLanguage();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedDspForMessage, setSelectedDspForMessage] = useState<User | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);
  const [filterView, setFilterView] = useState<'assigned' | 'all'>('assigned');

  // Specific talukas assigned to this Subdivisional Level Officer
  const officerTalukas =
    currentUser.talukas && currentUser.talukas.length > 0
      ? currentUser.talukas
      : ['Downtown Central'];

  const officerPosting = currentUser.posting || 'Subdivisional Police Office';
  const officerDistrict = currentUser.district || 'Metro District';

  // Find all approved DSPs
  const allDsps = users.filter((u) => u.role === 'DSP' && u.status === 'Approved');

  // Filter DSPs matching the specific talukas assigned to the Subdivisional Officer
  const assignedTalukaDsps = allDsps.filter((dsp) => {
    const hasTalukaMatch = dsp.talukas?.some((t) =>
      officerTalukas.some(
        (ot) =>
          ot.toLowerCase().trim() === t.toLowerCase().trim() ||
          ot.toLowerCase().includes(t.toLowerCase().trim()) ||
          t.toLowerCase().includes(ot.toLowerCase().trim())
      )
    );
    const hasPostingMatch = officerTalukas.some(
      (ot) =>
        dsp.posting?.toLowerCase().includes(ot.toLowerCase().trim()) ||
        dsp.department?.toLowerCase().includes(ot.toLowerCase().trim())
    );
    return hasTalukaMatch || hasPostingMatch;
  });

  // Display list: If 'assigned', show strictly matching taluka DSPs (fallback to all if none found)
  const displayedDsps =
    filterView === 'assigned'
      ? assignedTalukaDsps.length > 0
        ? assignedTalukaDsps
        : allDsps
      : allDsps;

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedDspForMessage) return;

    if (onSendNotification) {
      onSendNotification({
        title: `SDPO Priority Dispatch: ${messageSubject || 'Operational Briefing'}`,
        message: `From SDPO ${currentUser.fullName} (${currentUser.badgeId} • ${officerTalukas.join(', ')} Taluka): ${messageText}`,
        type: 'General',
      });
    }

    setMessageSentSuccess(true);
    setTimeout(() => {
      setMessageSentSuccess(false);
      setSelectedDspForMessage(null);
      setMessageSubject('');
      setMessageText('');
    }, 2200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <button
              id="btn-back-dashboard-contacts"
              type="button"
              onClick={onBackToDashboard}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-1.5 font-bold text-xs ${
                themeMode === 'bright'
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('Back to Dashboard')}</span>
            </button>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
              {t('Subdivision Level')}
            </span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight mt-2 ${
              themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
            }`}
          >
            {t('SHO/Inspector Jurisdiction Contacts')}
          </h1>
          <p
            className={`text-xs sm:text-sm font-semibold mt-0.5 ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {t(
              'Official contact details of SHO/Inspectors governing your assigned taluka jurisdiction.'
            )}
          </p>
        </div>

        {/* Quick Nav Action */}
        {onNavigateToCaseManagement && (
          <button
            id="btn-nav-case-management-from-contacts"
            type="button"
            onClick={onNavigateToCaseManagement}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              themeMode === 'bright'
                ? 'bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200'
                : 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>{t('View Case Management')}</span>
          </button>
        )}
      </div>

      {/* Subdivisional Officer Assigned Jurisdiction Banner */}
      <div
        className={`p-5 rounded-2xl border shadow-sm ${
          themeMode === 'bright'
            ? 'bg-gradient-to-r from-amber-50/90 via-sky-50/60 to-white border-2 border-amber-200/90 text-slate-900'
            : 'bg-gradient-to-r from-amber-950/20 via-slate-900/90 to-slate-900 border border-amber-500/30 text-slate-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">{currentUser.fullName}</h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {currentUser.badgeId}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  SDPO Active Duty
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs">
                <span className="flex items-center space-x-1 font-semibold text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>
                    {t('Assigned Taluka')}:{' '}
                    <strong className="text-amber-600 dark:text-amber-400 font-black">
                      {officerTalukas.join(', ')}
                    </strong>
                  </span>
                </span>

                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {t('Posting')}: <strong className="font-bold">{officerPosting}</strong>
                </span>

                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {t('District')}: <strong className="font-bold">{officerDistrict}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Filtering Tabs */}
          <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
            <button
              id="filter-assigned-taluka"
              type="button"
              onClick={() => setFilterView('assigned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterView === 'assigned'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : themeMode === 'bright'
                  ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('My Assigned Taluka')} ({assignedTalukaDsps.length})
            </button>
            <button
              id="filter-all-dsps"
              type="button"
              onClick={() => setFilterView('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterView === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : themeMode === 'bright'
                  ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('All Talukas / District')} ({allDsps.length})
            </button>
          </div>
        </div>
      </div>

      {/* Jurisdiction Status Information Alert */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between text-xs ${
          themeMode === 'bright'
            ? 'bg-blue-50/80 border-blue-200 text-blue-900'
            : 'bg-blue-950/30 border-blue-800/40 text-blue-200'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="font-bold">
            {filterView === 'assigned' ? (
              <span>
                {t('Displaying SHO/Inspector contacts assigned to your specific Taluka jurisdiction:')}{' '}
                <strong className="underline underline-offset-2">
                  {officerTalukas.join(', ')}
                </strong>
                .
              </span>
            ) : (
              <span>
                {t('Displaying all regional SHO/Inspector commanding officers across all talukas.')}
              </span>
            )}
          </p>
        </div>
        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          POLICE SECURE DIRECTORY
        </span>
      </div>

      {/* DSP Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayedDsps.map((dsp) => {
          const isTalukaMatch = dsp.talukas?.some((t) =>
            officerTalukas.some(
              (ot) =>
                ot.toLowerCase().trim() === t.toLowerCase().trim() ||
                ot.toLowerCase().includes(t.toLowerCase().trim()) ||
                t.toLowerCase().includes(ot.toLowerCase().trim())
            )
          );

          const dspTalukaLabel =
            dsp.talukas && dsp.talukas.length > 0 ? dsp.talukas.join(', ') : 'Central Jurisdiction';

          return (
            <div
              key={dsp.id}
              id={`dsp-contact-card-${dsp.id}`}
              className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
                isTalukaMatch
                  ? themeMode === 'bright'
                    ? 'bg-white border-2 border-amber-400 shadow-md ring-1 ring-amber-400/20'
                    : 'bg-slate-900/95 border-2 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                  : themeMode === 'bright'
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                {/* Header: Avatar, Name, Badge, Taluka Match Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    <div className="relative">
                      {dsp.avatarUrl ? (
                        <img
                          src={dsp.avatarUrl}
                          alt={dsp.fullName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
                          {dsp.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md font-mono text-[9px] font-black bg-amber-500 text-slate-950 shadow">
                        SHO/Insp
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3
                          className={`text-lg sm:text-xl font-black ${
                            themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                          }`}
                        >
                          {dsp.fullName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          Active Duty
                        </span>
                      </div>

                      <p
                        className={`text-xs font-bold ${
                          themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                        }`}
                      >
                        {dsp.designation || 'Deputy Superintendent of Police'} •{' '}
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-black">
                          {dsp.badgeId}
                        </span>
                      </p>

                      <p
                        className={`text-xs mt-0.5 ${
                          themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {dsp.department}
                      </p>
                    </div>
                  </div>

                  {isTalukaMatch && (
                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shrink-0 text-center">
                      ★ {t('Assigned Taluka')}
                    </span>
                  )}
                </div>

                {/* Posting & Taluka Jurisdiction Badge */}
                <div
                  className={`mt-4 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-500 dark:text-slate-400">
                        {t('Jurisdiction Taluka')}:
                      </span>{' '}
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        {dspTalukaLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 truncate">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{dsp.posting || 'Sub-Division Police HQ'}</span>
                  </div>
                </div>

                {/* Primary Contact Details List */}
                <div className="mt-4 space-y-2.5">
                  {/* Phone Number */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('Direct Contact Phone')}
                        </div>
                        <div className="font-mono text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                          {dsp.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(dsp.phone, `phone-${dsp.id}`)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          copiedField === `phone-${dsp.id}`
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                            : themeMode === 'bright'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title="Copy Phone Number"
                      >
                        {copiedField === `phone-${dsp.id}` ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <a
                        href={`tel:${dsp.phone.replace(/\s+/g, '')}`}
                        className="px-3 py-2 rounded-lg font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 shadow-sm transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{t('Call')}</span>
                      </a>
                    </div>
                  </div>

                  {/* Official Email */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t('Official Police Email')}
                        </div>
                        <div className="font-mono text-xs sm:text-sm font-bold truncate text-blue-600 dark:text-blue-400">
                          {dsp.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(dsp.email, `email-${dsp.id}`)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          copiedField === `email-${dsp.id}`
                            ? 'bg-blue-500/20 text-blue-500 border-blue-500/40'
                            : themeMode === 'bright'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title="Copy Email Address"
                      >
                        {copiedField === `email-${dsp.id}` ? (
                          <Check className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <a
                        href={`mailto:${dsp.email}`}
                        className="px-3 py-2 rounded-lg font-black text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('Email')}</span>
                      </a>
                    </div>
                  </div>

                  {/* Secondary Line: Radio Intercom & Emergency Control Room */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div
                      className={`p-2 rounded-lg border flex items-center space-x-2 ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">
                        Radio Call Sign: <strong className="text-purple-400 font-mono">CH-04 ALPHA</strong>
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-lg border flex items-center space-x-2 ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        HQ Helpline: <strong className="font-mono">112 / Ext 4410</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span>HQ Escort Available 24x7</span>
                </span>

                <button
                  id={`btn-message-dsp-${dsp.id}`}
                  type="button"
                  onClick={() => setSelectedDspForMessage(dsp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-1.5 ${
                    themeMode === 'bright'
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('Priority Memo')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {displayedDsps.length === 0 && (
        <div
          className={`p-12 text-center rounded-2xl border ${
            themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg font-black">{t('No SHO/Inspector Contacts Found')}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            {t(
              'No active SHO/Inspector profile currently matches this specific taluka. Please switch to "All Talukas / District" or contact District HQ directly.'
            )}
          </p>
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-black bg-amber-500 text-slate-950"
          >
            {t('View All District SHO/Inspectors')}
          </button>
        </div>
      )}

      {/* Priority Memo / Briefing Note Modal */}
      {selectedDspForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Dispatch Memo to SHO/Inspector</h3>
                  <p className="text-xs text-slate-400">
                    To: <strong className="text-amber-400">{selectedDspForMessage.fullName}</strong> ({selectedDspForMessage.badgeId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDspForMessage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {messageSentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-black text-emerald-500">Dispatch Memo Transmitted</h4>
                <p className="text-xs text-slate-400">
                  Your communication has been logged and routed to {selectedDspForMessage.fullName}&apos;s SHO/Inspector Command Desk.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Subject / Case Reference
                  </label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="e.g. Urgent Investigation Update - Taluka Jurisdiction"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 mb-1">
                    Direct Official Note / Operational Memo *
                  </label>
                  <textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Write your operational briefing, enquiry request, or case update for ${selectedDspForMessage.fullName}...`}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Authorized Sender: {currentUser.fullName} ({currentUser.badgeId})</span>
                  <span>Taluka: {officerTalukas.join(', ')}</span>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedDspForMessage(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Memo</span>
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
