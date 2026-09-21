import React, { useState } from 'react';
import { ComplaintData } from '../types';
import {
  X,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  FileCheck,
  AlertCircle,
  ExternalLink,
  Lock,
  Eye,
} from 'lucide-react';

interface OfficerComplaintReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: ComplaintData | null;
  onReview: (
    complaintId: string,
    remark: 'Registered' | 'Fake' | 'Pending',
    officerRemarks: string
  ) => void;
  themeMode?: 'dark' | 'bright';
}

export const OfficerComplaintReviewModal: React.FC<OfficerComplaintReviewModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onReview,
  themeMode = 'dark',
}) => {
  const [officerNotes, setOfficerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [previewEvidence, setPreviewEvidence] = useState<{ url?: string; name: string; type?: string; size?: string } | null>(null);

  if (!isOpen || !complaint) return null;

  const handleAction = (remark: 'Registered' | 'Fake' | 'Pending') => {
    setValidationError('');

    if (remark === 'Fake' && (!officerNotes || officerNotes.trim().length < 5)) {
      setValidationError('Please provide a brief justification/remark explaining why this complaint is flagged as Fake.');
      return;
    }

    setIsSubmitting(true);
    const finalRemarks = officerNotes.trim() ||
      (remark === 'Registered'
        ? 'Verified complainant identity and digital evidence. Cognizable incident registered into judicial FIR roster.'
        : remark === 'Fake'
        ? 'Spurious or invalid complaint flagged by officer.'
        : 'Under active preliminary verification.');

    onReview(complaint.id, remark, finalRemarks);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div
        className={`relative w-full max-w-3xl rounded-2xl shadow-2xl border flex flex-col my-auto transition-colors duration-200 overflow-hidden ${
          themeMode === 'bright'
            ? 'bg-white border-slate-300 text-slate-900 shadow-2xl'
            : 'bg-[#0a1226] border-blue-600/80 text-white shadow-[0_0_45px_rgba(37,99,235,0.35)]'
        }`}
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
            themeMode === 'bright'
              ? 'bg-slate-100 border-slate-300'
              : 'bg-[#070d1e] border-blue-800/80'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[11px] font-black uppercase tracking-wider font-mono ${
                  themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'
                }`}>
                  POLICE FIELD INVESTIGATION & VERIFICATION
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    complaint.status === 'Registered'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : complaint.status === 'Fake'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  }`}
                >
                  Status: {complaint.status}
                </span>
              </div>
              <h2 className={`text-base sm:text-lg font-black tracking-tight ${
                themeMode === 'bright' ? 'text-black' : 'text-white'
              }`}>
                Citizen e-FIR Report #{complaint.id}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 hover:bg-slate-200 text-slate-700'
                : 'bg-[#0b1329] border-blue-700 hover:bg-blue-900/50 text-slate-300'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Status Alert if already acted upon */}
          {complaint.status === 'Registered' && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                This complaint has been verified and REGISTERED into the active judicial case records. Case notified to SHO/Inspector for Station Investigator assignment.
              </span>
            </div>
          )}

          {complaint.status === 'Fake' && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-400 text-xs font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                This complaint was investigated and flagged as FAKE / SPURIOUS by the investigating officer.
              </span>
            </div>
          )}

          {/* Section 1: Complainant / Victim Personal Information */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              themeMode === 'bright'
                ? 'bg-slate-50 border-slate-300 shadow-sm text-slate-900'
                : 'bg-[#070e22] border-blue-700/70 shadow-[0_0_16px_rgba(37,99,235,0.25)] text-white'
            }`}
          >
            <div className="flex items-center space-x-2 border-b pb-2 border-slate-700/30">
              <User className="w-4 h-4 text-amber-500" />
              <h3 className={`text-xs font-black uppercase tracking-wider ${
                themeMode === 'bright' ? 'text-black' : 'text-yellow-400'
              }`}>
                1. Complainant Personal Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Full Name
                </span>
                <p className="font-extrabold text-sm">
                  {complaint.firstName && complaint.surname
                    ? `${complaint.firstName} ${complaint.midName ? complaint.midName + ' ' : ''}${complaint.surname}`.trim()
                    : complaint.fullName}
                </p>
                <span className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                  ({complaint.firstName} {complaint.midName} {complaint.surname})
                </span>
              </div>

              <div>
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Mobile Number
                </span>
                <p className="font-mono font-extrabold text-sm flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>+91 {complaint.mobile}</span>
                </p>
                <span className="text-[10px] text-emerald-500 font-bold">✓ OTP Verified</span>
              </div>

              <div>
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Email Address
                </span>
                <p className="font-medium text-xs break-all flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{complaint.email}</span>
                </p>
              </div>

              <div className="sm:col-span-3 pt-1 border-t border-slate-700/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    State & Jurisdiction
                  </span>
                  <p className="font-bold flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{complaint.state}</span>
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    City / Police District
                  </span>
                  <p className="font-bold">{complaint.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Incident Particulars */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              themeMode === 'bright'
                ? 'bg-slate-50 border-slate-300 shadow-sm text-slate-900'
                : 'bg-[#070e22] border-blue-700/70 shadow-[0_0_16px_rgba(37,99,235,0.25)] text-white'
            }`}
          >
            <div className="flex items-center space-x-2 border-b pb-2 border-slate-700/30">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className={`text-xs font-black uppercase tracking-wider ${
                themeMode === 'bright' ? 'text-black' : 'text-yellow-400'
              }`}>
                2. Incident & Crime Particulars
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Reported Category
                </span>
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 mt-0.5">
                  {complaint.category}
                </span>
              </div>

              <div>
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Date of Incident
                </span>
                <p className="font-mono font-bold flex items-center space-x-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{complaint.incidentDate}</span>
                </p>
              </div>

              <div>
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Approximate Time
                </span>
                <p className="font-mono font-bold flex items-center space-x-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{complaint.incidentTime}</span>
                </p>
              </div>

              <div className="sm:col-span-3">
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Incident Location / Landmark
                </span>
                <p className="font-semibold mt-0.5">{complaint.incidentLocation}</p>
              </div>

              <div className="sm:col-span-3">
                <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Detailed Incident Statement / Narrative
                </span>
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed mt-1 whitespace-pre-wrap ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300 text-slate-900 font-medium'
                      : 'bg-[#0b1329] border-blue-900/60 text-slate-100 font-normal'
                  }`}
                >
                  {complaint.incidentDescription}
                </div>
              </div>

              {complaint.estimatedLoss && (
                <div className="sm:col-span-3">
                  <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Estimated Financial / Property Loss
                  </span>
                  <p className="font-bold text-amber-500 mt-0.5">{complaint.estimatedLoss}</p>
                </div>
              )}

              {complaint.suspectInfo && (
                <div className="sm:col-span-3">
                  <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Suspect Leads / Identified Info
                  </span>
                  <p className="font-medium mt-0.5 text-rose-400">{complaint.suspectInfo}</p>
                </div>
              )}

              {complaint.witnessInfo && (
                <div className="sm:col-span-3">
                  <span className={`text-[10px] block uppercase font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Witness Details
                  </span>
                  <p className="font-medium mt-0.5">{complaint.witnessInfo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Attached Evidence */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              themeMode === 'bright'
                ? 'bg-slate-50 border-slate-300 shadow-sm text-slate-900'
                : 'bg-[#070e22] border-blue-700/70 shadow-[0_0_16px_rgba(37,99,235,0.25)] text-white'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-slate-700/30">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-xs font-black uppercase tracking-wider ${
                  themeMode === 'bright' ? 'text-black' : 'text-yellow-400'
                }`}>
                  3. Digital Evidence Attachments ({complaint.evidenceFiles.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Filed: {complaint.submittedAt}
              </span>
            </div>

            {complaint.evidenceFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {complaint.evidenceFiles.map((ev, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-2.5 text-xs transition-all ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 shadow-sm'
                        : 'bg-[#0b1329] border-blue-900 shadow-[0_0_10px_rgba(30,58,138,0.2)]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      {ev.url ? (
                        <img
                          src={ev.url}
                          alt="Evidence thumbnail"
                          onClick={() => setPreviewEvidence(ev)}
                          className="w-10 h-10 rounded-md object-cover border border-slate-600/40 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold truncate text-xs ${themeMode === 'bright' ? 'text-slate-900' : 'text-white'}`}>
                          {ev.name}
                        </p>
                        <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {ev.size} • {ev.type}
                        </p>
                      </div>
                    </div>

                    {/* View Button on the right of the box */}
                    <button
                      type="button"
                      onClick={() => setPreviewEvidence(ev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
                        themeMode === 'bright'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                      }`}
                      title={`View ${ev.name}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-400">
                No initial files attached. Complainant statement recorded.
              </p>
            )}
          </div>

          {/* Section 4: Officer Remark & Decision Block */}
          <div
            className={`p-4 sm:p-5 rounded-xl border-2 space-y-3.5 ${
              themeMode === 'bright'
                ? 'bg-blue-50/50 border-blue-300 shadow-md text-slate-900'
                : 'bg-[#091124] border-blue-600/90 shadow-[0_0_24px_rgba(37,99,235,0.35)] text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h3 className={`text-xs font-black uppercase tracking-wider ${
                  themeMode === 'bright' ? 'text-black' : 'text-yellow-400'
                }`}>
                  Officer Investigation Remark & Verification
                </h3>
              </div>
              <span className={`text-[10px] font-bold ${
                themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Role: Investigating Officer
              </span>
            </div>

            <div className="space-y-1">
              <label className={`block text-xs font-bold ${
                themeMode === 'bright' ? 'text-slate-800' : 'text-yellow-300'
              }`}>
                Preliminary Officer Notes / Investigation Justification:
              </label>
              <textarea
                rows={2}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Enter field inquiry findings, complainant identity verification notes, or reason for remark..."
                className={`w-full p-2.5 rounded-lg text-xs font-medium border transition-all ${
                  themeMode === 'bright'
                    ? 'bg-white border-slate-300 text-black shadow-[0_2px_10px_rgba(147,197,253,0.3)] focus:border-blue-500'
                    : 'bg-[#0b1329] border-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.3)] focus:border-blue-400'
                }`}
              />
            </div>

            {validationError && (
              <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-bold flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Officer Action Buttons */}
            <div className="pt-2 border-t border-slate-700/30">
              <p className={`text-[11px] font-bold mb-2.5 ${
                themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Select official verdict for Complaint #{complaint.id}:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. REGISTERED (Green) */}
                <button
                  type="button"
                  onClick={() => handleAction('Registered')}
                  disabled={isSubmitting || complaint.status === 'Registered'}
                  className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-md transform active:scale-98 ${
                    complaint.status === 'Registered'
                      ? 'bg-emerald-800/40 text-emerald-300 border border-emerald-600/40 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:shadow-emerald-600/50'
                  }`}
                  title="Registers formal FIR and notifies SHO/Inspector for Investigator assignment"
                >
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>REGISTERED</span>
                  </div>
                  <span className="text-[9px] font-normal normal-case opacity-90">
                    Creates FIR & Notifies SHO/Inspector
                  </span>
                </button>

                {/* 2. FAKE (Red) */}
                <button
                  type="button"
                  onClick={() => handleAction('Fake')}
                  disabled={isSubmitting || complaint.status === 'Fake'}
                  className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-md transform active:scale-98 ${
                    complaint.status === 'Fake'
                      ? 'bg-rose-900/40 text-rose-300 border border-rose-600/40 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 hover:shadow-rose-600/50'
                  }`}
                  title="Marks complaint as Fake or Spurious"
                >
                  <div className="flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>FAKE</span>
                  </div>
                  <span className="text-[9px] font-normal normal-case opacity-90">
                    Flag as Invalid / Spurious
                  </span>
                </button>

                {/* 3. PENDING (Yellow / Amber) */}
                <button
                  type="button"
                  onClick={() => handleAction('Pending')}
                  disabled={isSubmitting}
                  className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer shadow-md transform active:scale-98 ${
                    themeMode === 'bright'
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/30'
                      : 'bg-[#facc15] hover:bg-[#eab308] text-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                  }`}
                  title="Keep under preliminary inquiry"
                >
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-4 h-4" />
                    <span>PENDING</span>
                  </div>
                  <span className="text-[9px] font-normal normal-case opacity-90">
                    Keep In Inquiry / Incomplete
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between text-xs transition-colors ${
            themeMode === 'bright'
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-[#070d1e] border-blue-900 text-slate-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono text-[11px]">Official Police Investigation Record</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 hover:bg-slate-200 text-slate-800'
                : 'bg-[#0b1329] border-blue-700 hover:bg-blue-900/50 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>

      {/* Workable Evidence Preview Modal */}
      {previewEvidence && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`relative max-w-3xl w-full rounded-2xl overflow-hidden border shadow-2xl space-y-3 p-4 ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300 text-slate-900 shadow-xl'
                : 'bg-[#090f22] border-blue-500/50 text-white shadow-[0_0_35px_rgba(30,58,138,0.5)]'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b ${
                themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0 mr-3">
                <FileCheck className="w-4 h-4 text-blue-500 shrink-0" />
                <h4
                  className={`text-sm font-black truncate ${
                    themeMode === 'bright' ? 'text-slate-900' : 'text-yellow-400'
                  }`}
                >
                  Evidence Viewer: {previewEvidence.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200 text-slate-600'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`max-h-[70vh] flex flex-col items-center justify-center overflow-auto rounded-xl p-3 min-h-[260px] ${
                themeMode === 'bright' ? 'bg-slate-100' : 'bg-black/70'
              }`}
            >
              {previewEvidence.url ? (
                previewEvidence.type?.startsWith('image/') ||
                previewEvidence.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                  <img
                    src={previewEvidence.url}
                    alt={previewEvidence.name}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="text-center p-6 space-y-4">
                    <FileText className="w-16 h-16 text-blue-400 mx-auto" />
                    <div>
                      <p className="font-bold text-sm">{previewEvidence.name}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {previewEvidence.size} • {previewEvidence.type}
                      </p>
                    </div>
                    <a
                      href={previewEvidence.url}
                      download={previewEvidence.name}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Document in New Tab</span>
                    </a>
                  </div>
                )
              ) : (
                <div className="text-center p-8 text-slate-400 space-y-2">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                  <p className="text-xs font-semibold">
                    Attached Evidence Document: {previewEvidence.name}
                  </p>
                  <p className="text-[11px] text-slate-500">{previewEvidence.size}</p>
                </div>
              )}
            </div>

            <div
              className={`flex items-center justify-between pt-2 border-t text-xs ${
                themeMode === 'bright'
                  ? 'border-slate-200 text-slate-500'
                  : 'border-slate-800 text-slate-400'
              }`}
            >
              <span className="font-mono text-[11px]">
                {previewEvidence.type || 'Digital Evidence'} • {previewEvidence.size || 'Recorded Size'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewEvidence(null)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  themeMode === 'bright'
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
