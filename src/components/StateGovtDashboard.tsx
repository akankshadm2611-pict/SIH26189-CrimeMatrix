import React, { useState } from 'react';
import { User, Case } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { StateGovtRegistrationView } from './StateGovtRegistrationView';
import {
  Building2,
  ShieldCheck,
  UserPlus,
  Users,
  FileText,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface StateGovtDashboardProps {
  currentUser: User;
  users: User[];
  cases: Case[];
  onRegisterApprovedUser: (newUser: User) => void;
  themeMode?: 'dark' | 'bright';
}

export const StateGovtDashboard: React.FC<StateGovtDashboardProps> = ({
  currentUser,
  users,
  cases,
  onRegisterApprovedUser,
  themeMode = 'bright',
}) => {
  const { t } = useLanguage();

  // Registration Mode: null = dashboard overview, or 'District Level' | 'Subdivision Level'
  const [activeRegistrationRole, setActiveRegistrationRole] = useState<
    'District Level' | 'Subdivision Level' | null
  >(null);

  const districtCount = users.filter((u) => u.role === 'District Level').length;
  const subdivCount = users.filter((u) => u.role === 'Subdivision Level').length;
  const activeCasesCount = cases.filter((c) => c.status === 'Active' || c.status === 'Under Investigation').length;

  // If in registration view, render the dedicated StateGovtRegistrationView!
  if (activeRegistrationRole) {
    return (
      <StateGovtRegistrationView
        initialRole={activeRegistrationRole}
        currentUser={currentUser}
        existingUsers={users}
        onRegisterApprovedUser={(newUser) => {
          onRegisterApprovedUser(newUser);
        }}
        onBackToDashboard={() => setActiveRegistrationRole(null)}
        themeMode={themeMode}
      />
    );
  }

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 transition-colors ${
        themeMode === 'bright' ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0f1d] text-slate-100'
      }`}
    >
      {/* Top Banner / State Command Header */}
      <div
        className={`p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          themeMode === 'bright'
            ? 'bg-white border-slate-300'
            : 'bg-slate-900/90 border-blue-900/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-lg font-black text-xl">
            🏛️
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-wide">
                {t('State Govt Secretariat & Cadre Administration')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/40">
                {currentUser.role}
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm font-semibold mt-0.5 ${
                themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {t('Principal Home Secretary Command')}:{' '}
              <strong className={themeMode === 'bright' ? 'text-blue-950 font-bold' : 'text-yellow-400 font-bold'}>
                {currentUser.fullName}
              </strong>{' '}
              ({currentUser.badgeId || 'SG-GOV-001'}). {t('Apex State Police Law & Order Authority')}.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              themeMode === 'bright'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('Gazette Registered Authority')}</span>
          </div>
        </div>
      </div>

      {/* 'New Registration' Bar & Role Selection Buttons */}
      <div
        id="new-registration-section"
        className={`p-5 sm:p-6 rounded-2xl border-2 shadow-xl transition-all ${
          themeMode === 'bright'
            ? 'bg-white border-amber-400/80 shadow-amber-500/10'
            : 'bg-gradient-to-b from-slate-900/95 to-slate-950 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-md shrink-0">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-black tracking-wide flex items-center space-x-2 ${
                themeMode === 'bright' ? 'text-slate-950' : 'text-white'
              }`}>
                <span>{t('New Registration')}</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${
                  themeMode === 'bright'
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {t('State Cadre Induction')}
                </span>
              </h2>
              <p className={`text-xs mt-0.5 font-medium ${
                themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {t('Directly register and authorize new officers into the State Police Cadre Database')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              id="btn-register-district-level"
              onClick={() => setActiveRegistrationRole('District Level')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all active:scale-95 shadow-sm border ${
                themeMode === 'bright'
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-950 border-blue-300'
                  : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border-blue-500/40'
              }`}
            >
              <UserPlus className={`w-4 h-4 ${themeMode === 'bright' ? 'text-blue-700' : 'text-blue-300'}`} />
              <span>District Level</span>
            </button>

            <button
              type="button"
              id="btn-register-subdivision-level"
              onClick={() => setActiveRegistrationRole('Subdivision Level')}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md border border-amber-400/40 flex items-center space-x-2 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Subdivision Level</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border shadow-md flex items-center space-x-3.5 ${
            themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className={`p-3 rounded-xl ${
            themeMode === 'bright' ? 'bg-blue-100 text-blue-800' : 'bg-blue-500/20 text-blue-400'
          }`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs font-black uppercase tracking-wider block ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {t('District Level Officers')}
            </span>
            <p className={`text-2xl font-black ${
              themeMode === 'bright' ? 'text-slate-950' : 'text-white'
            }`}>{districtCount}</p>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-md flex items-center space-x-3.5 ${
            themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className={`p-3 rounded-xl ${
            themeMode === 'bright' ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs font-black uppercase tracking-wider block ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {t('Subdivision Officers')}
            </span>
            <p className={`text-2xl font-black ${
              themeMode === 'bright' ? 'text-slate-950' : 'text-white'
            }`}>{subdivCount}</p>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-md flex items-center space-x-3.5 ${
            themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className={`p-3 rounded-xl ${
            themeMode === 'bright' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs font-black uppercase tracking-wider block ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {t('Active State Cases')}
            </span>
            <p className={`text-2xl font-black ${
              themeMode === 'bright' ? 'text-slate-950' : 'text-white'
            }`}>{activeCasesCount}</p>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border shadow-md flex items-center space-x-3.5 ${
            themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className={`p-3 rounded-xl ${
            themeMode === 'bright' ? 'bg-purple-100 text-purple-800' : 'bg-purple-500/20 text-purple-400'
          }`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-xs font-black uppercase tracking-wider block ${
              themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {t('Total Portal Cadre')}
            </span>
            <p className={`text-2xl font-black ${
              themeMode === 'bright' ? 'text-slate-950' : 'text-white'
            }`}>{users.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
