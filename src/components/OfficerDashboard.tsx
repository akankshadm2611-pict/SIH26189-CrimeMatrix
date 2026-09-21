import React, { useState } from 'react';
import { Case, User, CrimeDistributionData, MonthlyCrimeData, ComplaintData } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { OfficerComplaintReviewModal } from './OfficerComplaintReviewModal';
import { useLanguage } from '../context/LanguageContext';
import {
  Shield,
  FolderKanban,
  Eye,
  FileText,
  Upload,
  Search,
  MapPin,
  CalendarCheck,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { getHearingCountdown, formatHearingDateTime } from '../utils/courtHearingUtils';

interface OfficerDashboardProps {
  currentUser: User;
  cases: Case[];
  complaints?: ComplaintData[];
  onReviewComplaint?: (
    complaintId: string,
    remark: 'Registered' | 'Fake' | 'Pending',
    remarks: string
  ) => void;
  onSelectCase: (c: Case) => void;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
  onOpenCaseManagement?: () => void;
  onOpenCitizenComplaints?: () => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  currentUser,
  cases,
  complaints = [],
  onSelectCase,
  distributionData,
  monthlyData,
  themeMode = 'bright',
  onOpenCaseManagement,
  onOpenCitizenComplaints,
}) => {
  const { t, isHindi } = useLanguage();

  // Police Officers see ONLY cases assigned to them by Host or DSP
  const myCases = cases.filter(
    (c) =>
      c.assignedOfficerIds.includes(currentUser.id) ||
      c.assignedOfficerNames.some((name) => name && name.toLowerCase().includes(currentUser.fullName.toLowerCase()))
  );

  const pendingComplaintsCount = complaints.filter((c) => c.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Officer Header */}
      <div className="border-b border-yellow-500/20 pb-4 sm:pb-6">
        <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
          <span>{t('Police Officer Field Investigation Portal')}</span>
        </h1>
        <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
          {t('Assigned case repository, citizen e-FIR verification, field logs, and crime analytics.')}
        </p>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        distributionData={distributionData}
        monthlyData={monthlyData}
        themeMode={themeMode}
      />

      {/* Cases Management Quick Access Banner (Cases Ledger moved to dedicated module) */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
        themeMode === 'bright'
          ? 'bg-gradient-to-r from-sky-50 to-white border-2 border-sky-300 shadow-md'
          : 'bg-slate-900/80 border-blue-900/50 shadow-lg'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <FolderKanban className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`text-base sm:text-lg font-black ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>
                {t('Assigned Cases Management')} ({myCases.length} {t('Allotted Cases')})
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                themeMode === 'bright' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
              }`}>
                {t('Officer Section')}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>
              {t('Assigned case dossiers, evidence records, and court hearing dates are managed separately in the dedicated Case Management module.')}
            </p>
          </div>
        </div>

        {onOpenCaseManagement && (
          <button
            id="btn-open-case-mgmt-officer"
            type="button"
            onClick={onOpenCaseManagement}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <span>{t('Open Case Management')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
