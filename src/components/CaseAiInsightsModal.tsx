import React, { useState } from 'react';
import { Case, Suspect } from '../types';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Shield,
  MapPin,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { formatHearingDateTime } from '../utils/courtHearingUtils';
import { generateCaseAiSummaryPoints } from '../utils/caseAiSummaryUtils';

interface CaseAiInsightsModalProps {
  c: Case;
  isOpen: boolean;
  onClose: () => void;
  linkedSuspects?: Suspect[];
  themeMode?: 'dark' | 'bright';
}

interface SummaryPoint {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

export const CaseAiInsightsModal: React.FC<CaseAiInsightsModalProps> = ({
  c,
  isOpen,
  onClose,
  linkedSuspects = [],
  themeMode = 'dark',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !c) return null;

  const basePoints = generateCaseAiSummaryPoints(c, linkedSuspects);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    incident: AlertCircle,
    location: MapPin,
    status: Activity,
    parties: Users,
    command: Shield,
    suspects: Users,
    evidence: FileText,
    hearing: Calendar,
    progress: CheckCircle2,
    oversight: Shield,
  };

  const points: SummaryPoint[] = basePoints.map((bp) => ({
    ...bp,
    icon: iconMap[bp.id] || Sparkles,
  }));

  const handleCopySummary = () => {
    const plainText = [
      `Case ID: ${c.id}`,
      `Case Name: ${c.caseName}`,
      '',
      'AI Case Summary (Points):',
      ...points.map((p) => `• ${p.label}: ${p.text}`),
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      id="modal-ai-insights-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="modal-ai-insights"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 ${
          themeMode === 'bright'
            ? 'bg-white border-slate-300 text-slate-900'
            : 'bg-slate-900 border-yellow-500/40 text-slate-100'
        }`}
      >
        {/* Template Header: Case ID and below that Case Name */}
        <div
          className={`p-4 sm:p-5 border-b shrink-0 flex items-start justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-gradient-to-r from-amber-50 via-white to-sky-50 border-slate-200'
              : 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border-slate-800'
          }`}
        >
          <div className="min-w-0 flex-1">
            {/* Header Top: Case ID and AI badge */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                id="ai-insights-case-id"
                className="font-mono text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg bg-blue-600 text-white tracking-wider shadow-xs"
              >
                {c.id}
              </span>
              <span
                className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${
                  themeMode === 'bright'
                    ? 'bg-amber-100 text-amber-950 border-amber-300'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Insights</span>
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Point-Wise Case Summary
              </span>
            </div>

            {/* Below Case ID: Case Name */}
            <h2
              id="ai-insights-case-name"
              className={`text-lg sm:text-2xl font-black leading-snug tracking-tight ${
                themeMode === 'bright' ? 'text-slate-900' : 'text-yellow-400'
              }`}
            >
              {c.caseName}
            </h2>
          </div>

          {/* Close button in header */}
          <button
            type="button"
            id="btn-close-ai-insights-header"
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              themeMode === 'bright'
                ? 'border-slate-300 hover:bg-slate-100 text-slate-600'
                : 'border-slate-700 hover:bg-slate-800 text-slate-300'
            }`}
            title="Close Insights"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Body: Whole summary of the case displayed in points */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              themeMode === 'bright'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-bold">
                Synthesized Case Dossier • {points.length} Essential Points
              </span>
            </div>
            <span className="text-[11px] font-semibold opacity-80">
              Minimal & High-Precision Overview
            </span>
          </div>

          {/* The Points List */}
          <ul className="space-y-2" id="ai-insights-points-list">
            {points.map((pt, idx) => {
              const IconComp = pt.icon;
              return (
                <li
                  key={pt.id}
                  id={`ai-point-${pt.id}`}
                  className={`p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                    themeMode === 'bright'
                      ? 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-900'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      themeMode === 'bright'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-800 text-yellow-400'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-[10px] font-mono font-black text-slate-400">
                        #{idx + 1}
                      </span>
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${
                          themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'
                        }`}
                      >
                        {pt.label}:
                      </span>
                    </div>
                    <p
                      className={`text-xs sm:text-sm font-semibold mt-0.5 leading-relaxed ${
                        themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      {pt.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Template Footer Actions */}
        <div
          className={`p-3 sm:p-4 border-t shrink-0 flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            type="button"
            id="btn-copy-ai-insights"
            onClick={handleCopySummary}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white border-emerald-400'
                : themeMode === 'bright'
                ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 shadow-xs'
            }`}
            title="Copy summary points to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Points Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Points</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-close-ai-insights-bottom"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
              themeMode === 'bright'
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
