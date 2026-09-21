import React, { useState } from 'react';
import { Case, User } from '../types';
import { X, Calendar, Clock, MapPin, FileText, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { getHearingCountdown, formatHearingDateTime, canUserEditCourtHearing } from '../utils/courtHearingUtils';

interface CourtHearingModalProps {
  caseItem: Case;
  currentUser: User;
  themeMode?: 'dark' | 'bright';
  onClose: () => void;
  onSaveHearing: (
    caseId: string,
    data: {
      courtHearingDate: string;
      courtHearingLocation: string;
      courtHearingNotes: string;
    }
  ) => void;
}

export const CourtHearingModal: React.FC<CourtHearingModalProps> = ({
  caseItem,
  currentUser,
  themeMode = 'dark',
  onClose,
  onSaveHearing,
}) => {
  const canEdit = canUserEditCourtHearing(currentUser, caseItem);

  const [dateVal, setDateVal] = useState<string>(() => {
    if (caseItem.courtHearingDate) {
      // Ensure format "YYYY-MM-DDTHH:mm" for datetime-local
      return caseItem.courtHearingDate.slice(0, 16);
    }
    // Default to 14 days from now at 10:30 AM
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    nextDate.setHours(10, 30, 0, 0);
    return nextDate.toISOString().slice(0, 16);
  });

  const [locationVal, setLocationVal] = useState<string>(
    caseItem.courtHearingLocation || 'Sessions Court Room 4B, Metro City Judicial Complex'
  );

  const [notesVal, setNotesVal] = useState<string>(
    caseItem.courtHearingNotes ||
      'Final chargesheet, verified forensic analysis, and witness testimony submissions to be completed prior to court session.'
  );

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const countdown = getHearingCountdown(dateVal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setErrorMsg('You do not have permission to modify the court hearing schedule.');
      return;
    }

    if (!dateVal) {
      setErrorMsg('Please select a valid court hearing date and time.');
      return;
    }

    if (!locationVal.trim()) {
      setErrorMsg('Please provide the court room or venue location.');
      return;
    }

    onSaveHearing(caseItem.id, {
      courtHearingDate: dateVal,
      courtHearingLocation: locationVal.trim(),
      courtHearingNotes: notesVal.trim(),
    });

    setSuccessMsg('Court hearing schedule & evidence submission target successfully updated!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all my-auto ${
          themeMode === 'bright'
            ? 'bg-white text-slate-900 border-2 border-slate-300 shadow-xl'
            : 'bg-[#0f172a] text-slate-100 border-yellow-500/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-gradient-to-r from-amber-100 via-amber-50 to-white border-amber-200 text-amber-950 shadow-xs'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400'
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black tracking-tight truncate">
                {canEdit ? 'Schedule / Update Court Hearing' : 'Court Hearing Schedule & Case Deadline'}
              </h3>
              <p
                className={`text-[11px] sm:text-xs font-semibold truncate ${
                  themeMode === 'bright' ? 'text-amber-900/80' : 'text-slate-300'
                }`}
              >
                Case #{caseItem.id} • {caseItem.caseName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
              themeMode === 'bright'
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Transparency / Objective Notice */}
          <div
            className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
              themeMode === 'bright'
                ? 'bg-blue-50/80 border-blue-200 text-blue-950 font-medium'
                : 'bg-blue-950/30 border-blue-500/30 text-blue-200 font-medium'
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block text-xs mb-0.5">Judicial Transparency & Target Deadline Notice:</strong>
              This Court Hearing date establishes the operational deadline for all assigned Police Officers and Team Members to finalize investigation reports, evidence documentation, and forensic uploads. Setting this date ensures full transparency for the Victim and expedites official court presentation.
            </div>
          </div>

          {/* Live Countdown Banner Preview */}
          {countdown && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                countdown.urgency === 'critical'
                  ? themeMode === 'bright'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                  : countdown.urgency === 'warning'
                  ? themeMode === 'bright'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : themeMode === 'bright'
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-slate-800/60 border-slate-700 text-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                  Calculated Court Countdown
                </span>
                <div className="text-base sm:text-lg font-black mt-0.5 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-500 animate-spin-slow" />
                  <span>{countdown.formattedFull}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${
                    countdown.isPast
                      ? 'bg-slate-700 text-slate-300 border-slate-600'
                      : countdown.urgency === 'critical'
                      ? 'bg-red-600 text-white border-red-700 animate-pulse'
                      : 'bg-amber-500 text-slate-950 border-amber-600'
                  }`}
                >
                  {countdown.formattedShort}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-600 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hearing Date and Time */}
            <div>
              <label
                className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1.5 ${
                  themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                }`}
              >
                Court Hearing Date & Time *
              </label>
              <input
                type="datetime-local"
                disabled={!canEdit}
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                className={`w-full px-4 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all border focus:outline-none ${
                  themeMode === 'bright'
                    ? 'bg-white text-slate-900 border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-slate-900/90 text-white border-slate-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20'
                } ${!canEdit ? 'opacity-75 cursor-not-allowed' : ''}`}
                required
              />
              <p
                className={`text-[11px] font-semibold mt-1 ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Format: YYYY-MM-DD HH:MM (Military or AM/PM local judicial schedule)
              </p>
            </div>

            {/* Court Venue / Location */}
            <div>
              <label
                className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1.5 ${
                  themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                }`}
              >
                Court Hall / Judicial Complex Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500" />
                <input
                  type="text"
                  disabled={!canEdit}
                  value={locationVal}
                  onChange={(e) => setLocationVal(e.target.value)}
                  placeholder="e.g. City Sessions Court Hall 4B, Metro District Complex"
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all border focus:outline-none ${
                    themeMode === 'bright'
                      ? 'bg-white text-slate-900 border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                      : 'bg-slate-900/90 text-white border-slate-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20'
                  } ${!canEdit ? 'opacity-75 cursor-not-allowed' : ''}`}
                  required
                />
              </div>
            </div>

            {/* Investigation & Evidence Submission Target Notes */}
            <div>
              <label
                className={`block text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1.5 ${
                  themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                }`}
              >
                Team Investigation Target & Evidence Presentation Agenda
              </label>
              <textarea
                disabled={!canEdit}
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
                rows={3}
                placeholder="Specify the evidence files, chargesheet sections, or witness statements that the police team must present during this hearing session..."
                className={`w-full px-4 py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all border focus:outline-none leading-relaxed ${
                  themeMode === 'bright'
                    ? 'bg-white text-slate-900 border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-slate-900/90 text-white border-slate-700 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20'
                } ${!canEdit ? 'opacity-75 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Last Updated Tracking Tag */}
            {caseItem.courtHearingUpdatedBy && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  themeMode === 'bright' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center">
                  <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Last Updated By: <strong className="ml-1 text-slate-900 dark:text-slate-200">{caseItem.courtHearingUpdatedBy}</strong>
                </span>
                {caseItem.courtHearingUpdatedAt && <span>{caseItem.courtHearingUpdatedAt}</span>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Cancel
              </button>

              {canEdit && (
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center space-x-1.5 cursor-pointer ${
                    themeMode === 'bright'
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-yellow-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Court Schedule</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
