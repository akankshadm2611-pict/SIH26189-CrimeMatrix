import React from 'react';
import { User, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  LayoutDashboard,
  FolderLock,
  Users,
  Radio,
  FileKey2,
  Calendar,
  Settings,
  UserPlus,
  X,
  Shield,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Inbox,
  PhoneCall,
  Fingerprint,
} from 'lucide-react';

export type PortalViewMode =
  | 'dashboard'
  | 'case-management'
  | 'citizen-complaints'
  | 'suspects'
  | 'alerts-apb'
  | 'contacts'
  | 'request-access'
  | 'fingerprint'
  | 'schedule'
  | 'settings'
  | 'registration'
  | 'registered-officers';

interface PortalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: PortalViewMode;
  onNavigate: (view: PortalViewMode) => void;
  currentUser: User;
  onLogout: () => void;
  themeMode: 'dark' | 'bright';
  onToggleTheme: () => void;
  pendingComplaintsCount?: number;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  themeMode,
  onToggleTheme,
  pendingComplaintsCount = 0,
}) => {
  const { t, isHindi } = useLanguage();

  if (!isOpen) return null;

  // Define nav items based on role according to exact user instructions:
  // DSP: Case Management, Suspect Management, Alerts and APBs, Request and Access, Schedule, Settings
  // Host: Case Management, Suspect Management, Alerts and APBs, Request and Access, Schedule, Settings
  // Police Officer: Case Management, Citizen Complaints (E-FIR ), Alerts and APBs, Registration, Request and Access, Schedule, Settings (Without numbering!)

  interface NavItem {
    id: PortalViewMode;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }

  const getNavItems = (): NavItem[] => {
    const role = currentUser.role;

    if (role === 'State Govt') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), icon: LayoutDashboard },
        { id: 'registered-officers', label: t('Registered Officers'), icon: Users },
        { id: 'schedule', label: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'DSP') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), icon: Radio, badge: t('Inter-State') },
        { id: 'request-access', label: t('Request and Access'), icon: FileKey2 },
        { id: 'registration', label: t('Registration'), icon: UserPlus, badge: t('Direct Login') },
        { id: 'fingerprint', label: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'Host') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), icon: Radio, badge: t('Inter-State') },
        { id: 'request-access', label: t('Request and Access'), icon: FileKey2 },
        { id: 'fingerprint', label: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'Police Officer') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), icon: FolderLock },
        {
          id: 'citizen-complaints',
          label: t('Complaint (E-FIR)'),
          icon: Inbox,
          badge: pendingComplaintsCount > 0 ? `${pendingComplaintsCount} ${t('Action Required')}` : undefined,
        },
        { id: 'alerts-apb', label: t('Alerts and APBs'), icon: Radio, badge: t('Inter-State') },
        { id: 'registration', label: t('Registration'), icon: UserPlus, badge: t('Direct Login') },
        { id: 'request-access', label: t('Request and Access'), icon: FileKey2 },
        { id: 'fingerprint', label: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'Subdivision Level') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), icon: Radio, badge: t('Inter-State') },
        { id: 'contacts', label: t('Contact'), icon: PhoneCall },
        { id: 'fingerprint', label: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), icon: Settings },
      ];
    }

    if (role === 'District Level') {
      return [
        { id: 'dashboard', label: t('Dashboard Overview'), icon: LayoutDashboard },
        { id: 'case-management', label: t('Case Management'), icon: FolderLock },
        { id: 'suspects', label: t('Suspect Management'), icon: Users },
        { id: 'alerts-apb', label: t('Alerts and APBs'), icon: Radio, badge: t('Inter-State') },
        { id: 'request-access', label: t('Request and Access'), icon: FileKey2 },
        { id: 'contacts', label: t('Contacts'), icon: PhoneCall },
        { id: 'fingerprint', label: t('Fingerprint'), icon: Fingerprint },
        { id: 'schedule', label: t('Schedule'), icon: Calendar },
        { id: 'settings', label: t('Settings'), icon: Settings },
      ];
    }

    return [
      { id: 'dashboard', label: t('Dashboard Overview'), icon: LayoutDashboard },
      { id: 'case-management', label: t('Case Management'), icon: FolderLock },
      { id: 'fingerprint', label: t('Fingerprint'), icon: Fingerprint },
      { id: 'schedule', label: t('Schedule'), icon: Calendar },
      { id: 'settings', label: t('Settings'), icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Backdrop */}
      <div
        id="sidebar-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in"
      />

      {/* Slide-out Drawer from Top-Left */}
      <aside
        id="portal-navigation-sidebar"
        className={`fixed top-0 left-0 h-screen max-h-screen w-80 max-w-[85vw] z-50 shadow-2xl flex flex-col justify-between border-r transition-all transform animate-in slide-in-from-left duration-200 overflow-hidden ${
          themeMode === 'bright'
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-slate-950 border-blue-900/60 text-slate-100'
        }`}
      >
        {/* Top Section: Header & User Card */}
        <div className="shrink-0">
          {/* Sidebar Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            themeMode === 'bright' ? 'border-slate-200 bg-slate-50' : 'border-blue-900/40 bg-slate-900/80'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-950 shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-wider uppercase text-yellow-500">
                  {currentUser.role === 'State Govt' ? t('State Govt') : t('Police Department')}
                </h2>
                <p className={`text-[11px] font-semibold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t('Portal Navigation Menu')}
                </p>
              </div>
            </div>

            <button
              id="btn-close-sidebar"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                themeMode === 'bright'
                  ? 'border-slate-300 hover:bg-slate-200 text-slate-700'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={t('Close Menu')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className={`p-4 border-b ${
            themeMode === 'bright' ? 'border-slate-200 bg-slate-50/50' : 'border-blue-900/30 bg-slate-900/40'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black truncate">{currentUser.fullName}</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 font-bold">
                    {currentUser.badgeId}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {currentUser.role === 'DSP' ? t('SHO/Inspector') : currentUser.role === 'Host' ? t('Investigator') : t(currentUser.role)}
                  </span>
                </div>
                {currentUser.role === 'DSP' && (
                  <div className={`text-[10px] mt-1.5 space-y-0.5 font-semibold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <p>State: <span className="text-emerald-500 font-bold">{currentUser.state || 'Maharashtra'}</span></p>
                    <p>District: <span className="text-amber-500 font-bold">{currentUser.district || 'Solapur'}</span></p>
                    <p>Taluka: <span className="text-cyan-500 font-bold">{(currentUser.talukas && currentUser.talukas[0]) || currentUser.taluka || 'Karmala'}</span></p>
                  </div>
                )}
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {t('Active')}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Items List (scrollable) */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black shadow-md'
                    : themeMode === 'bright'
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-yellow-500'}`} />
                  <span className="truncate whitespace-nowrap font-bold">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap leading-none shrink-0 ${
                      isActive
                        ? 'bg-slate-950 text-yellow-400'
                        : themeMode === 'bright'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0 ${
                    isActive ? 'text-slate-950' : 'text-slate-400'
                  }`} />
                </div>
              </button>
            );
          })}

          {/* Direct Logout Option inside navigation list */}
          <button
            id="nav-item-logout"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-between gap-2 transition-all cursor-pointer group border mt-2 ${
              themeMode === 'bright'
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                : 'bg-red-950/40 hover:bg-red-900/60 text-red-400 border-red-900/50'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <LogOut className="w-4 h-4 shrink-0 text-red-500" />
              <span className="truncate whitespace-nowrap">
                {t('Logout')}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-red-400 opacity-60 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </nav>

        {/* Sidebar Footer (Pinned to bottom, always visible) */}
        <div className={`p-3.5 border-t space-y-2.5 shrink-0 ${
          themeMode === 'bright' ? 'border-slate-200 bg-slate-50' : 'border-blue-900/40 bg-slate-900/80'
        }`}>
          {/* Language Switcher in Sidebar */}
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
              {t('Language')}
            </span>
            <LanguageSwitcher themeMode={themeMode} />
          </div>

          {/* Quick Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
              themeMode === 'bright'
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {themeMode === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{t('Theme:')} {themeMode === 'dark' ? t('Dark Mode') : t('Bright Mode')}</span>
            </div>
            <span className="text-[10px] text-yellow-500 uppercase font-black">{t('Switch')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
