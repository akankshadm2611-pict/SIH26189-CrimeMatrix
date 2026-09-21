import React, { useState } from 'react';
import { ComplaintData, User } from '../types';
import { OfficerComplaintReviewModal } from './OfficerComplaintReviewModal';
import {
  Inbox,
  Search,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
} from 'lucide-react';

interface CitizenComplaintsViewProps {
  complaints: ComplaintData[];
  onReviewComplaint?: (
    complaintId: string,
    remark: 'Registered' | 'Fake' | 'Pending',
    remarks: string
  ) => void;
  currentUser: User;
  themeMode?: 'dark' | 'bright';
  onBackToDashboard?: () => void;
}

export const CitizenComplaintsView: React.FC<CitizenComplaintsViewProps> = ({
  complaints,
  onReviewComplaint,
  currentUser,
  themeMode = 'dark',
  onBackToDashboard,
}) => {
  const [complaintFilter, setComplaintFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaintForReview, setSelectedComplaintForReview] = useState<ComplaintData | null>(null);

  const pendingComplaintsCount = complaints.filter((c) => c.status === 'Pending').length;

  const filteredComplaints = complaints.filter((c) => {
    const matchesFilter = complaintFilter === 'ALL' || c.status === complaintFilter;
    const q = searchQuery.toLowerCase().trim();
    const fullName = c.firstName && c.surname
      ? `${c.firstName} ${c.midName ? c.midName + ' ' : ''}${c.surname}`.toLowerCase()
      : (c.fullName || '').toLowerCase();

    const matchesSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.incidentDescription.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      {onBackToDashboard && (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              themeMode === 'bright'
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Main Panel matching Image 2 */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border transition-all ${
          themeMode === 'bright'
            ? 'bg-white border-blue-200 shadow-md'
            : 'bg-[#080e1e] border-blue-600/80 shadow-[0_0_30px_rgba(37,99,235,0.25)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/30">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <Inbox className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className={`text-base sm:text-xl font-black uppercase tracking-tight ${
                    themeMode === 'bright' ? 'text-black' : 'text-[#facc15]'
                  }`}
                >
                  Citizen Complaints (e-FIR Verification)
                </h1>
                {pendingComplaintsCount > 0 && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 animate-pulse">
                    {pendingComplaintsCount} Action Required
                  </span>
                )}
              </div>
              <p
                className={`text-xs sm:text-sm mt-0.5 ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Review citizen complaints submitted online. Verify details, then mark as 'Registered' (notifies SHO/Inspector for Investigator), 'Fake', or 'Pending'.
              </p>
            </div>
          </div>

          {/* Filter Pills matching Image 2 */}
          <div
            className={`flex items-center space-x-1 p-1 rounded-xl text-xs border shrink-0 ${
              themeMode === 'bright' ? 'bg-slate-100 border-slate-300' : 'bg-[#0b1329] border-blue-900/60'
            }`}
          >
            {['ALL', 'Pending', 'Registered', 'Fake'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setComplaintFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                  complaintFilter === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : themeMode === 'bright'
                    ? 'text-slate-700 hover:bg-slate-200'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
                {tab === 'Pending' && pendingComplaintsCount > 0 && ` (${pendingComplaintsCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-3 ${
                themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search complaints by Complainant Name, ID, Crime Category, Location..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all focus:outline-hidden ${
                themeMode === 'bright'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                  : 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-blue-500'
              }`}
            />
          </div>

          <div
            className={`text-xs font-bold px-3 py-2 rounded-xl border shrink-0 ${
              themeMode === 'bright'
                ? 'bg-slate-50 border-slate-300 text-slate-600'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Showing {filteredComplaints.length} of {complaints.length} Complaints
          </div>
        </div>

        {/* Complaints Grid matching Image 2 */}
        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center">
            <Inbox className="w-12 h-12 mx-auto text-slate-500/50 mb-3" />
            <p
              className={`text-sm font-bold ${
                themeMode === 'bright' ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              No complaints found matching "{complaintFilter}" {searchQuery && `with query "${searchQuery}"`}.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              New online complaints registered by citizens will appear here for verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {filteredComplaints.map((comp) => {
              const displayName =
                comp.firstName && comp.surname
                  ? `${comp.firstName} ${comp.midName ? comp.midName + ' ' : ''}${comp.surname}`.trim()
                  : comp.fullName;

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedComplaintForReview(comp)}
                  className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 group ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 hover:bg-blue-50/40 border-slate-300 hover:border-blue-400 shadow-xs'
                      : 'bg-[#0b1329] hover:bg-[#0f1a38] border-blue-900/60 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-blue-400">
                          {comp.id}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {comp.category}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border shrink-0 ${
                          comp.status === 'Registered'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                            : comp.status === 'Fake'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                        }`}
                      >
                        {comp.status === 'Registered'
                          ? '✓ Registered'
                          : comp.status === 'Fake'
                          ? '✕ Fake'
                          : '⏳ Pending'}
                      </span>
                    </div>

                    {/* Complainant Name formatted as 'FirstName MidName Surname' */}
                    <h3
                      className={`text-sm sm:text-base font-black mt-2.5 group-hover:text-blue-400 transition-colors ${
                        themeMode === 'bright' ? 'text-black' : 'text-white'
                      }`}
                    >
                      {displayName}
                    </h3>

                    <p
                      className={`text-xs line-clamp-3 mt-1.5 leading-relaxed ${
                        themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      {comp.incidentDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5 text-red-400 shrink-0" />
                        {comp.city}, {comp.state}
                      </span>
                      <span>•</span>
                      <span>{comp.incidentDate}</span>
                      {comp.evidenceFiles && comp.evidenceFiles.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">
                            📎 {comp.evidenceFiles.length} Evidence Attached
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className={`pt-3 border-t flex items-center justify-between text-xs ${
                      themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      Submitted: {comp.submittedAt}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaintForReview(comp);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center space-x-1.5 cursor-pointer transition-all ${
                        themeMode === 'bright'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                      }`}
                    >
                      <span>Review & Remark</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Complaint Modal */}
      {selectedComplaintForReview && (
        <OfficerComplaintReviewModal
          isOpen={!!selectedComplaintForReview}
          onClose={() => setSelectedComplaintForReview(null)}
          complaint={selectedComplaintForReview}
          onReview={(complaintId, remark, remarks) => {
            if (onReviewComplaint) {
              onReviewComplaint(complaintId, remark, remarks);
            }
          }}
          themeMode={themeMode}
        />
      )}
    </div>
  );
};
