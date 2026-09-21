import React, { useState } from 'react';
import { User, RegistrationRequest, PortalNotification, Case } from '../types';
import { LogoHeader } from './LogoHeader';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  ShieldAlert,
  CheckCircle,
  UserCheck,
  FolderGit2,
  X,
  Menu,
  LayoutDashboard,
  FolderLock,
  Users,
  Radio,
  FileKey2,
  Calendar,
  Settings,
  UserPlus,
  Inbox,
  PhoneCall,
  Fingerprint,
} from 'lucide-react';
import { isUserAssignedToCase } from '../utils/caseUtils';
import { PortalViewMode } from './PortalSidebar';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  themeMode: 'dark' | 'bright';
  onToggleTheme: () => void;
  notifications: PortalNotification[];
  pendingRequests: RegistrationRequest[];
  cases?: Case[];
  onSelectCase?: (c: Case) => void;
  onOpenPendingModal: (request: RegistrationRequest) => void;
  onOpenSuspectManagement?: () => void;
  currentView?: string;
  onNavigateHome?: () => void;
  onToggleSidebar?: () => void;
  onNavigate?: (view: PortalViewMode) => void;
  pendingComplaintsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  themeMode,
  onToggleTheme,
  notifications,
  pendingRequests,
  cases = [],
  onSelectCase,
  onOpenPendingModal,
  onOpenSuspectManagement,
  currentView = 'dashboard',
  onNavigateHome,
  onToggleSidebar,
  onNavigate,
  pendingComplaintsCount = 0,
}) => {
  const { t, isHindi } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter requests appropriate for the current role
  // Police Officer & Advocate requests go to Host; Host & DSP requests go to DSP
  const roleFilteredRequests = pendingRequests.filter((req) => {
    if (req.status !== 'Pending') return false;
    if (currentUser.role === 'Host') {
      return req.role === 'Police Officer' || req.role === 'Victim' || req.role === 'Advocate';
    }
    if (currentUser.role === 'DSP') {
      return req.role === 'Host' || req.role === 'DSP';
    }
    return false;
  });

  const roleFilteredNotifications = notifications.filter((n) => {
    // Evidence Upload / Removal Notifications filtering:
    // Only users assigned/connected to that specific case get evidence notifications regarding that case.
    if (n.type === 'Evidence' || (n.relatedCaseId && n.title.toLowerCase().includes('evidence'))) {
      if (!n.relatedCaseId) return false;
      const targetCase = cases.find((c) => c.id === n.relatedCaseId);
      if (!targetCase) return false;
      return isUserAssignedToCase(currentUser, targetCase);
    }

    if (n.targetRole) {
      if (currentUser.role === 'Host' && n.targetRole === 'Host') return true;
      if (currentUser.role === 'DSP' && n.targetRole === 'DSP') return true;
      if (currentUser.role === n.targetRole) return true;
      return false;
    }

    return true;
  });

  const totalBadges = roleFilteredRequests.length + roleFilteredNotifications.filter((n) => !n.read).length;

  // Header Nav Items based on user role with related recognizable icons
  interface HeaderNavItem {
    id: PortalViewMode;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    badge?: string;
  }

  const getHeaderNavItems = (): HeaderNavItem[] => {
    const role = currentUser.role;

    if (role === 'State Govt') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
        { id: 'registered-officers', label: t('Registered Officers'), shortLabel: t('Officers'), icon: Users },
        { id: 'schedule', label: t('Schedule'), shortLabel: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), shortLabel: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'DSP') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), shortLabel: t('Cases'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), shortLabel: t('Suspects'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), shortLabel: t('Alerts'), icon: Radio, badge: t('APB') },
        { id: 'request-access', label: t('Request and Access'), shortLabel: t('Requests'), icon: FileKey2 },
        { id: 'registration', label: t('Registration'), shortLabel: t('Registration'), icon: UserPlus },
        { id: 'fingerprint', label: t('Fingerprint'), shortLabel: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), shortLabel: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), shortLabel: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'Host') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), shortLabel: t('Cases'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), shortLabel: t('Suspects'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), shortLabel: t('Alerts'), icon: Radio, badge: t('APB') },
        { id: 'request-access', label: t('Request and Access'), shortLabel: t('Requests'), icon: FileKey2 },
        { id: 'fingerprint', label: t('Fingerprint'), shortLabel: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), shortLabel: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), shortLabel: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'Police Officer') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), shortLabel: t('Cases'), icon: FolderLock },
        {
          id: 'citizen-complaints',
          label: t('Complaint (E-FIR)'),
          shortLabel: t('Complaints'),
          icon: Inbox,
          badge: pendingComplaintsCount > 0 ? `${pendingComplaintsCount}` : undefined,
        },
        { id: 'alerts-apb', label: t('Alerts and APBs'), shortLabel: t('Alerts'), icon: Radio, badge: t('APB') },
        { id: 'registration', label: t('Registration'), shortLabel: t('Registration'), icon: UserPlus },
        { id: 'request-access', label: t('Request and Access'), shortLabel: t('Requests'), icon: FileKey2 },
        { id: 'fingerprint', label: t('Fingerprint'), shortLabel: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), shortLabel: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), shortLabel: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'Subdivision Level') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), shortLabel: t('Cases'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), shortLabel: t('Suspects'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), shortLabel: t('Alerts'), icon: Radio, badge: t('APB') },
        { id: 'contacts', label: t('Contact'), shortLabel: t('Contact'), icon: PhoneCall },
        { id: 'fingerprint', label: t('Fingerprint'), shortLabel: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), shortLabel: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), shortLabel: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'District Level') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), shortLabel: t('Cases'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), shortLabel: t('Suspects'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), shortLabel: t('Alerts'), icon: Radio, badge: t('APB') },
        { id: 'request-access', label: t('Request and Access'), shortLabel: t('Requests'), icon: FileKey2 },
        { id: 'contacts', label: t('Contacts'), shortLabel: t('Contacts'), icon: PhoneCall },
        { id: 'fingerprint', label: t('Fingerprint'), shortLabel: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), shortLabel: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), shortLabel: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'Victim') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
        { id: 'citizen-complaints', label: t('Complaint (E-FIR)'), shortLabel: t('My e-FIRs'), icon: Inbox },
        { id: 'schedule', label: t('Schedule'), shortLabel: t('Hearings'), icon: Calendar },
      ];
    }

    return [
      { id: 'dashboard', label: t('Dashboard Overview'), shortLabel: t('Dashboard'), icon: LayoutDashboard },
      { id: 'case-management', label: t('Case Management'), shortLabel: t('Cases'), icon: FolderLock },
      { id: 'fingerprint', label: t('Fingerprint'), shortLabel: t('Fingerprint'), icon: Fingerprint },
      { id: 'schedule', label: t('Schedule'), shortLabel: t('Schedule'), icon: Calendar },
      { id: 'settings', label: t('Settings'), shortLabel: t('Settings'), icon: Settings },
    ];
  };

  const navItems = getHeaderNavItems();

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        themeMode === 'bright'
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-[#0a0b0d]/95 border-[#1f2937] text-slate-100 shadow-md shadow-black/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left Branding with Sidebar Triple-Dash Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Triple Dash Hamburger Sidebar Button */}
          {onToggleSidebar && (
            <button
              id="btn-sidebar-toggle"
              type="button"
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                themeMode === 'bright'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-yellow-500/30 text-yellow-400 hover:border-yellow-400'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <div className="flex items-center space-x-1.5 sm:space-x-2.5 cursor-pointer py-1 min-w-max" onClick={onNavigateHome}>
            <LogoHeader size="sm" layout="horizontal" themeMode={themeMode} />
            <span className={`hidden lg:inline-block text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-1 rounded-lg border uppercase tracking-wider transition-colors shrink-0 ${
              themeMode === 'bright'
                ? 'bg-amber-100 text-amber-950 border-2 border-amber-400 shadow-sm'
                : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
            }`}>
              {t(`${currentUser.role === 'DSP' ? 'SHO/Inspector' : currentUser.role === 'Host' ? 'Investigator' : currentUser.role} PORTAL`)}
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3 shrink-0 min-w-0">
          {/* Right Corner: Notification Bell Option */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-full border transition-all ${
                themeMode === 'bright'
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 border-slate-700 text-yellow-400 hover:bg-slate-800'
              }`}
              title="Notifications & Applicant Approvals"
            >
              <Bell className="w-5 h-5" />
              {totalBadges > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-red-600 text-white font-bold text-[10px] rounded-full border-2 border-slate-950 animate-pulse">
                  {totalBadges}
                </span>
              )}
            </button>

            {/* Backdrop for mobile */}
            {showNotifications && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
                onClick={() => setShowNotifications(false)}
              />
            )}

            {/* Notification Dropdown Menu */}
            {showNotifications && (
              <div
                className={`fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 rounded-xl border shadow-2xl z-50 overflow-hidden max-h-[calc(100vh-5rem)] flex flex-col ${
                  themeMode === 'bright'
                    ? 'bg-white border-slate-300 text-slate-900 shadow-sky-900/10'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              >
                <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
                  themeMode === 'bright'
                    ? 'bg-sky-100 border-sky-200'
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  <h4 className={`text-xs font-black flex items-center min-w-0 pr-2 truncate ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}>
                    <Bell className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${
                      themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'
                    }`} />
                    <span className="truncate">Notifications & Verification Requests</span>
                  </h4>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      themeMode === 'bright'
                        ? 'bg-blue-200 text-blue-900 border border-blue-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {totalBadges} New
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className={`p-1 rounded-lg transition-colors ${
                        themeMode === 'bright'
                          ? 'text-slate-600 hover:text-slate-950 hover:bg-sky-200/60'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className={`max-h-80 sm:max-h-96 overflow-y-auto divide-y ${
                  themeMode === 'bright' ? 'bg-[#FCF8F8] divide-slate-200' : 'divide-slate-800/60'
                }`}>
                  {/* Pending User Registrations Dropdown Items */}
                  {roleFilteredRequests.length > 0 && (
                    <div className={`p-2 ${
                      themeMode === 'bright' ? 'bg-[#FCF8F8] border-b border-slate-200' : 'bg-yellow-500/5'
                    }`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 ${
                        themeMode === 'bright' ? 'text-amber-900' : 'text-yellow-400'
                      }`}>
                        Pending Personnel Registrations ({roleFilteredRequests.length})
                      </p>
                      {roleFilteredRequests.map((req) => (
                        <button
                          key={req.id}
                          onClick={() => {
                            onOpenPendingModal(req);
                            setShowNotifications(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center justify-between gap-2 group ${
                            themeMode === 'bright' ? 'bg-[#FCF8F8] hover:bg-slate-200/60' : 'hover:bg-yellow-500/10'
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <div className={`p-1.5 rounded-full shrink-0 ${
                              themeMode === 'bright' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold transition-colors truncate ${
                                themeMode === 'bright' ? 'text-slate-900 group-hover:text-blue-700' : 'group-hover:text-yellow-400'
                              }`}>
                                {req.fullName}
                              </p>
                              <p className={`text-[10px] truncate ${
                                themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                              }`}>
                                Role: <span className={themeMode === 'bright' ? 'text-blue-800 font-bold' : 'text-amber-300'}>{req.role === 'DSP' ? 'SHO/Inspector' : req.role === 'Host' ? 'Investigator' : req.role}</span> • Badge: {req.badgeId}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                            themeMode === 'bright'
                              ? 'text-amber-950 bg-amber-200 border border-amber-400 shadow-2xs'
                              : 'text-yellow-400 border border-yellow-500/30'
                          }`}>
                            Review Info
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Evidence & Case Alerts */}
                  {roleFilteredNotifications.length > 0 ? (
                    roleFilteredNotifications.map((n) => {
                      const relatedReq = n.relatedRequestId
                        ? pendingRequests.find((r) => r.id === n.relatedRequestId)
                        : null;

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (relatedReq) {
                              onOpenPendingModal(relatedReq);
                              setShowNotifications(false);
                            } else if (n.relatedCaseId && onSelectCase) {
                              const targetCase = cases.find((c) => c.id === n.relatedCaseId);
                              if (targetCase) {
                                onSelectCase(targetCase);
                                setShowNotifications(false);
                              }
                            }
                          }}
                          className={`p-3 transition-colors text-xs space-y-1 cursor-pointer ${
                            relatedReq || n.relatedCaseId
                              ? themeMode === 'bright'
                                ? 'bg-[#FCF8F8] hover:bg-slate-200/60 border-l-4 border-amber-500'
                                : 'hover:bg-yellow-500/10 border-l-2 border-yellow-500'
                              : themeMode === 'bright'
                              ? 'bg-[#FCF8F8] hover:bg-slate-200/60'
                              : 'hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-bold flex items-center min-w-0 truncate ${
                              themeMode === 'bright' ? 'text-slate-900 font-black' : 'text-slate-200'
                            }`}>
                              <FolderGit2 className={`w-3.5 h-3.5 mr-1 shrink-0 ${
                                themeMode === 'bright' ? 'text-blue-600' : 'text-blue-400'
                              }`} />
                              <span className="truncate">{n.title}</span>
                            </span>
                            <span className={`text-[10px] shrink-0 ${
                              themeMode === 'bright' ? 'text-slate-500 font-semibold' : 'text-slate-500'
                            }`}>{n.timestamp}</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${
                            themeMode === 'bright' ? 'text-slate-700 font-medium' : 'text-slate-400'
                          }`}>{n.message}</p>
                          {relatedReq && (
                            <div className="pt-1 flex items-center justify-end">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                themeMode === 'bright'
                                  ? 'text-amber-950 bg-amber-200 border border-amber-400 shadow-2xs hover:bg-amber-300'
                                  : 'text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20'
                              }`}>
                                Review Info
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    roleFilteredRequests.length === 0 && (
                      <div className={`p-6 text-center text-xs ${
                        themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-500'
                      }`}>No pending notifications.</div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher (Hindi <-> English) */}
          <LanguageSwitcher themeMode={themeMode} />

          {/* Dark / Bright Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-full border transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-900 border-slate-700 text-yellow-400'
            }`}
            title={t('Toggle Bright / Dark Mode')}
          >
            {themeMode === 'bright' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Current User Info & Logout */}
          <div className="flex items-center space-x-1 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-700/50 shrink-0">
            <div className="hidden xl:block text-right min-w-0 max-w-[140px]">
              <p className="text-xs font-bold leading-tight truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-yellow-400 font-mono truncate">{currentUser.badgeId}</p>
            </div>
            <button
              id="btn-header-logout"
              onClick={onLogout}
              className="p-1.5 sm:p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center space-x-1 shrink-0 cursor-pointer"
              title={t('Logout')}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline text-xs font-bold">{t('Logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fitted Header Navigation Bar with Related Icons for All Devices */}
      {navItems.length > 0 && (
        <nav
          id="header-nav-bar"
          aria-label="Portal Navigation"
          className={`w-full border-t transition-colors select-none ${
            themeMode === 'bright'
              ? 'bg-slate-50/95 border-slate-200/90'
              : 'bg-[#0b0e14]/95 border-[#1f2937]/90'
          }`}
        >
          <div className="max-w-7xl mx-auto px-1.5 sm:px-4 lg:px-8 py-1 sm:py-1.5">
            <div className="flex items-center justify-start md:justify-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`header-nav-${item.id}`}
                    type="button"
                    onClick={() => onNavigate?.(item.id)}
                    title={item.label}
                    aria-label={item.label}
                    className={`group relative flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? themeMode === 'bright'
                          ? 'bg-blue-600 text-white shadow-sm font-black'
                          : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black shadow-md shadow-yellow-500/20'
                        : themeMode === 'bright'
                        ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? themeMode === 'bright'
                            ? 'text-white'
                            : 'text-slate-950'
                          : themeMode === 'bright'
                          ? 'text-blue-600'
                          : 'text-yellow-400'
                      }`}
                    />
                    <span className="text-[11px] sm:text-xs tracking-tight whitespace-nowrap">
                      {item.shortLabel}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight shrink-0 ${
                          isActive
                            ? themeMode === 'bright'
                              ? 'bg-white text-blue-700'
                              : 'bg-slate-950 text-yellow-400'
                            : 'bg-red-500 text-white animate-pulse'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
