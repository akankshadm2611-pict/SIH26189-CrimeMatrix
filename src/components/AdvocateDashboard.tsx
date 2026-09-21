import React, { useState } from 'react';
import { Case, User, Suspect, CrimeDistributionData, MonthlyCrimeData } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { Shield, FolderKanban, Eye, FileText, Upload, Scale, Search, MapPin } from 'lucide-react';
import { NetworkingIcon } from './icons/NetworkingIcon';
import { CaseNetworkGraphModal } from './CaseNetworkGraphModal';

interface AdvocateDashboardProps {
  currentUser: User;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
  suspects?: Suspect[];
}

export const AdvocateDashboard: React.FC<AdvocateDashboardProps> = ({
  currentUser,
  cases,
  onSelectCase,
  distributionData,
  monthlyData,
  themeMode = 'bright',
  suspects,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseForNetwork, setSelectedCaseForNetwork] = useState<Case | null>(null);

  // Advocates see ONLY cases assigned to them by Host or DSP
  const myCases = cases.filter(
    (c) =>
      c.assignedAdvocateIds.includes(currentUser.id) ||
      c.assignedAdvocateNames.some((name) => name && name.toLowerCase().includes(currentUser.fullName.toLowerCase()))
  );

  const filteredCases = myCases.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.crimeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Advocate Header */}
      <div className="border-b border-yellow-500/20 pb-4 sm:pb-6">
        <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
          <Scale className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
          <span>Advocate Legal Briefs & Defense Portal</span>
        </h1>
        <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
          Assigned court cases, legal filings, evidentiary records, and jurisdiction analytics.
        </p>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        distributionData={distributionData}
        monthlyData={monthlyData}
        themeMode={themeMode}
      />

      {/* Assigned Cases Grid */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <h2 className={`text-lg sm:text-xl font-bold flex items-center ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <FolderKanban className="w-5 h-5 mr-2 shrink-0" /> Cases Assigned to Legal Counsel ({filteredCases.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Completion Status Filter Pills */}
            <div className={`flex items-center space-x-1 p-1 rounded-xl text-xs sm:text-sm border overflow-x-auto max-w-full ${
              themeMode === 'bright' ? 'bg-slate-200 border-slate-400' : 'bg-slate-900 border-blue-900/50'
            }`}>
              {['ALL', 'Active', 'Under Investigation', 'Solved', 'Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-yellow-500 text-slate-950 shadow-md font-extrabold'
                      : themeMode === 'bright'
                      ? 'text-slate-800 hover:bg-slate-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Bar beside the Filter */}
            <div className="relative min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-initial">
              <Search className={`w-4 h-4 absolute left-3 top-2.5 ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case name, ID, or crime..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all focus:outline-none ${
                  themeMode === 'bright'
                    ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                    : 'bg-slate-900 border-blue-900/50 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
                }`}
              />
            </div>
          </div>
        </div>

        {myCases.length === 0 ? (
          <div className={`p-8 sm:p-12 rounded-3xl border border-dashed text-center space-y-4 max-w-xl mx-auto my-6 ${
            themeMode === 'bright'
              ? 'bg-slate-50 border-slate-300 text-slate-800'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            <Scale className="w-12 h-12 text-purple-500/70 mx-auto" />
            <h3 className="text-lg font-bold text-purple-400">No Cases Allotted</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You currently have no cases allotted to your Legal Counsel account. Once an Investigator or SHO/Inspector assigns a case to you, legal briefs and evidence files will appear here.
            </p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className={`p-8 rounded-2xl border border-dashed text-center space-y-2 my-4 ${
            themeMode === 'bright' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}>
            <Search className="w-8 h-8 text-yellow-500 mx-auto" />
            <h4 className="text-sm font-bold">No Matching Cases Found</h4>
            <p className="text-xs text-slate-500">Try adjusting your completion status filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                  themeMode === 'bright'
                    ? 'bg-gradient-to-r from-sky-100/80 via-blue-50/50 to-white border-2 border-sky-200 shadow-sm hover:border-blue-300 text-slate-900'
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
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 max-w-[130px] truncate ${
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
                        id={`btn-case-network-advocate-${c.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseForNetwork(c);
                        }}
                        className={`p-1.5 rounded-md border transition-all cursor-pointer active:scale-90 flex items-center justify-center shrink-0 ${
                          themeMode === 'bright'
                            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 shadow-xs'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-yellow-400 hover:text-yellow-300 border-slate-700 hover:border-yellow-500/50 shadow-xs'
                        }`}
                        title="Investigative Link & Entity Network Graph"
                      >
                        <NetworkingIcon className="w-3.5 h-3.5" />
                      </button>

                      <span
                        className={`text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full border shrink-0 ${
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
