import React from 'react';
import {
  Shield,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Case, User, Suspect, CrimeDistributionData, MonthlyCrimeData } from '../types';
import { CrimeMap } from './CrimeMap';
import { CaseHeatmap } from './CaseHeatmap';
import { DashboardCharts } from './DashboardCharts';
import { crimeDistributionData as defaultDistributionData, monthlyCrimeData as defaultMonthlyData } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface DistrictDashboardViewProps {
  currentUser: User;
  cases: Case[];
  suspects?: Suspect[];
  distributionData?: CrimeDistributionData[];
  monthlyData?: MonthlyCrimeData[];
  themeMode?: 'bright' | 'dark';
  onSelectCase?: (c: Case, readOnly?: boolean) => void;
  onUpdateCaseDetails?: (caseId: string, updates: Partial<Case>) => void;
  onNavigateToCaseManagement: () => void;
}

export const DistrictDashboardView: React.FC<DistrictDashboardViewProps> = ({
  currentUser,
  cases,
  suspects = [],
  distributionData,
  monthlyData,
  themeMode = 'bright',
  onSelectCase,
  onNavigateToCaseManagement,
}) => {
  const { t } = useLanguage();

  // Metrics calculation identical to DSP Dashboard
  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === 'Active').length;
  const solvedCases = cases.filter((c) => c.status === 'Solved').length;
  const unsolvedCases = cases.filter((c) => c.status === 'Pending').length;
  const underInvestigationCases = cases.filter((c) => c.status === 'Under Investigation').length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* District Command Action Bar matching DSP Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-yellow-500/20 pb-4 sm:pb-6">
        <div>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
            <span>{t('District Level Command Headquarters Dashboard')}</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            {t('Master jurisdiction crime overview, case registration heatmap, hotspot analytics & crime trends.')}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="btn-district-top-case-mgmt"
            type="button"
            onClick={onNavigateToCaseManagement}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
          >
            <FolderKanban className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span>{t('View Case Management')}</span>
          </button>
        </div>
      </div>

      {/* Macro Metrics Cards (Identical layout to DSP) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Total Cases')}</span>
            <FolderKanban className="w-5 h-5 text-yellow-500" />
          </div>
          <p className={`text-2xl sm:text-3xl font-black mt-2 ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>{totalCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Active Cases')}</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-500 mt-2">{activeCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Solved Cases')}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-2">{solvedCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Unsolved (Pending)')}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-2">{unsolvedCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all col-span-2 sm:col-span-1 ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{t('Under Investigation')}</span>
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-500 mt-2">{underInvestigationCases}</p>
        </div>
      </div>

      {/* Interactive Crime Hotspot Map & Case Registration Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch my-6">
        <div className="flex flex-col min-w-0 h-full">
          <CrimeMap
            cases={cases}
            suspects={suspects}
            onSelectCase={(c) => onSelectCase?.(c, false)}
            themeMode={themeMode}
          />
        </div>
        <div className="flex flex-col min-w-0 h-full">
          <CaseHeatmap
            cases={cases}
            themeMode={themeMode}
          />
        </div>
      </div>

      {/* Analytics Charts: Crime Category Distribution & Monthly Crime and Resolution Trend */}
      <DashboardCharts
        distributionData={distributionData || defaultDistributionData}
        monthlyData={monthlyData || defaultMonthlyData}
        themeMode={themeMode}
      />

      {/* Cases Management Quick Access Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
        themeMode === 'bright'
          ? 'bg-gradient-to-r from-amber-50 to-white border-2 border-amber-300 shadow-md'
          : 'bg-slate-900/80 border-blue-900/50 shadow-lg'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-base sm:text-lg font-black ${themeMode === 'bright' ? 'text-amber-900' : 'text-yellow-400'}`}>
                District Cases Ledger ({cases.length} Total Cases)
              </h3>
            </div>
            <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>
              Detailed FIR investigations, host assignments, and suspects are managed in the dedicated Case Management ledger.
            </p>
          </div>
        </div>

        <button
          id="btn-open-case-mgmt-district"
          type="button"
          onClick={onNavigateToCaseManagement}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0 active:scale-95"
        >
          <span>Open Case Management</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
