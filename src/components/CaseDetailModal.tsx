import React, { useState, useRef } from 'react';
import { Case, EvidenceFile, UserRole, User, TimelineEntry, Suspect } from '../types';
import { X, Upload, FileText, Video, Image, Music, Shield, AlertTriangle, Users, Calendar, Clock, Paperclip, Eye, CheckCircle, FileDown, Trash2, BarChart3, MapPin, UserX, UserPlus, Edit3, MessageSquare, Check, CalendarCheck, Scale, Building2, Sparkles, Play, Download } from 'lucide-react';
import { CaseTimelineModal } from './CaseTimelineModal';
import { InvestigationProgressModal } from './InvestigationProgressModal';
import { CaseSuspectModal } from './CaseSuspectModal';
import { CourtHearingModal } from './CourtHearingModal';
import { CaseAiInsightsModal } from './CaseAiInsightsModal';
import { CaseEvidentiaryGapDetectorModal } from './CaseEvidentiaryGapDetectorModal';
import { CaseTeamChatModal } from './CaseTeamChatModal';
import { NetworkingIcon } from './icons/NetworkingIcon';
import { CaseNetworkGraphModal } from './CaseNetworkGraphModal';
import { getHearingCountdown, formatHearingDateTime, canUserEditCourtHearing } from '../utils/courtHearingUtils';
import { generateCaseAiSummaryPoints } from '../utils/caseAiSummaryUtils';

interface CaseDetailModalProps {
  c: Case | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  suspects?: Suspect[];
  onManageCaseSuspects?: (caseId: string, suspectIds: string[]) => void;
  onCreateSuspect?: (newSuspect: Suspect) => void;
  onUpdateSuspect?: (updatedSuspect: Suspect) => void;
  onUploadEvidence: (caseId: string, evidence: EvidenceFile) => void;
  onUpdateEvidence?: (caseId: string, evidence: EvidenceFile) => void;
  onDeleteEvidence?: (caseId: string, evidenceId: string) => void;
  onAddTimelineEntry?: (caseId: string, entry: Omit<TimelineEntry, 'id'>) => void;
  onUpdateTimelineEntry?: (caseId: string, entry: TimelineEntry) => void;
  onUpdateCaseStatus?: (caseId: string, status: Case['status']) => void;
  onUpdateCourtHearing?: (
    caseId: string,
    data: {
      courtHearingDate: string;
      courtHearingLocation: string;
      courtHearingNotes: string;
    }
  ) => void;
  isReadOnly?: boolean;
  onTakeCharge?: (caseId: string, directives?: string) => void;
  onUpdateCaseDetails?: (caseId: string, updates: Partial<Case>) => void;
  themeMode?: 'dark' | 'bright';
  allCases?: Case[];
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  c,
  isOpen,
  onClose,
  currentUser,
  suspects = [],
  onManageCaseSuspects,
  onCreateSuspect,
  onUpdateSuspect,
  onUploadEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
  onAddTimelineEntry,
  onUpdateTimelineEntry,
  onUpdateCaseStatus,
  onUpdateCourtHearing,
  isReadOnly = false,
  onTakeCharge,
  onUpdateCaseDetails,
  themeMode = 'dark',
  allCases = [],
}) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSuspectModal, setShowSuspectModal] = useState(false);
  const [showCourtHearingModal, setShowCourtHearingModal] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showNetworkGraphModal, setShowNetworkGraphModal] = useState(false);
  const [showGapDetector, setShowGapDetector] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<EvidenceFile['fileType']>('Document');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; title: string } | null>(null);
  const [previewVideoModal, setPreviewVideoModal] = useState<{
    url: string;
    title: string;
    notes?: string;
    uploadedBy?: string;
    uploadedByRole?: string;
    uploadedAt?: string;
  } | null>(null);
  const DEFAULT_SURVEILLANCE_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Evidence Edit state
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [editFileType, setEditFileType] = useState<EvidenceFile['fileType']>('Document');
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !c) return null;

  const linkedSuspects = suspects.filter((s) => s.linkedCaseIds.includes(c.id));

  // Retrieve progress bar details
  let progressItems: Array<{ label: string; completed: boolean }> = [];
  try {
    const savedProg = localStorage.getItem(`investigation_progress_${c.id}`);
    if (savedProg) {
      progressItems = JSON.parse(savedProg);
    }
  } catch (e) {}

  if (progressItems.length === 0) {
    progressItems = [
      { label: 'Complaint / FIR Registered', completed: true },
      { label: 'Incident Scene Inspection & Evidence Collection', completed: c.status !== 'Pending' },
      { label: 'Witness Statements Recorded', completed: c.status === 'Under Investigation' || c.status === 'Active' || c.status === 'Solved' },
      { label: 'Suspect Interrogation & Digital Forensics', completed: c.status === 'Active' || c.status === 'Solved' },
      { label: 'Forensic & Ballistics Lab Reports Attached', completed: c.status === 'Solved' },
      { label: 'Final Investigation Report Submitted & Chargesheet Filed', completed: c.status === 'Solved' },
    ];
  }

  const completedStepsCount = progressItems.filter((i) => i.completed).length;
  const progressPercentage = Math.round((completedStepsCount / progressItems.length) * 100);

  const handleDownloadPdf = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Please allow popups for this site to open the PDF page.');
      return;
    }

    const evidenceList = c.evidence || [];
    const officerNames = c.assignedOfficerNames || [];
    const advocateNames = c.assignedAdvocateNames || [];

    // Retrieve timeline details
    const timelineEntries =
      c.timeline && c.timeline.length > 0
        ? c.timeline
        : [
            {
              id: `tl-default-${c.id}`,
              timestamp: c.dateAssigned ? `${c.dateAssigned} 09:00 AM` : new Date().toLocaleString(),
              title: 'Complaint / Case Registered',
              description: `Official case complaint registered in system database. Assigned to Investigator ${
                c.assignedHostName || 'SHO/Inspector Authority'
              }. Initial FIR dossier opened.`,
              investigatorName: c.assignedHostName || 'Investigator Authority',
              investigatorRole: 'Investigator',
              statusTag: 'Completed',
            },
          ];

    const evidenceRows = evidenceList
      .map((ev, idx) => {
        const isVideo =
          ev.fileType === 'Video' ||
          ev.fileName.toLowerCase().endsWith('.mp4') ||
          ev.fileName.toLowerCase().includes('cctv') ||
          ev.fileName.toLowerCase().includes('video');
        return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; vertical-align: top;">${idx + 1}</td>
          <td style="padding: 10px; vertical-align: top;">
            <div style="font-weight: 900; font-family: monospace; color: #000;">${ev.fileName}</div>
            <div style="font-size: 11px; color: #4a5568; margin-top: 2px;">${ev.description || ''}</div>
            ${
              isVideo
                ? `
              <div style="margin-top: 6px; padding: 6px 10px; background-color: #fef3c7; border: 1px solid #f59e0b; color: #78350f; font-weight: 800; font-size: 11px; border-radius: 4px; display: inline-block;">
                📹 Video File: ${ev.fileName} — <strong>Go to the website and watch the video</strong>
              </div>
            `
                : ''
            }
          </td>
          <td style="padding: 10px; font-weight: bold; vertical-align: top;">${ev.fileType}</td>
          <td style="padding: 10px; vertical-align: top;">${ev.uploadedBy}<br/><span style="font-size: 10px; color: #718096;">(${ev.uploadedByRole})</span></td>
          <td style="padding: 10px; font-size: 11px; font-family: monospace; vertical-align: top;">${ev.uploadedAt}<br/>${ev.fileSize}</td>
        </tr>
      `;
      })
      .join('');

    const suspectRowsHtml = linkedSuspects.length > 0
      ? linkedSuspects.map((s) => `
        <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; display: flex; gap: 12px; align-items: flex-start;">
          <img src="${s.photoUrl}" alt="${s.fullName}" style="width: 52px; height: 52px; border-radius: 6px; object-fit: cover; border: 1px solid #dc2626; shrink: 0;" />
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 900; font-size: 13px; color: #0f172a;">${s.fullName}</span>
              <span style="font-size: 10px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px;">${s.status}</span>
            </div>
            <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-top: 2px;">ID: ${s.id} • Age: ${s.age} • Gender: ${s.gender}</div>
            <div style="font-size: 11px; font-weight: 700; color: #b91c1c; margin-top: 3px;">📍 Address: ${s.address}</div>
            ${s.allegedCrime ? `<div style="font-size: 11px; color: #334155; margin-top: 2px;">Alleged Offense: <strong>${s.allegedCrime}</strong></div>` : ''}
          </div>
        </div>
      `).join('')
      : `<p style="font-size: 11px; color: #64748b; font-style: italic; text-align: center; padding: 12px; border: 1px dashed #cbd5e1; border-radius: 6px;">No suspects currently linked to this case record.</p>`;

    const aiSummaryPoints = generateCaseAiSummaryPoints(c, linkedSuspects);
    const aiSummaryRowsHtml = aiSummaryPoints
      .map(
        (pt, idx) => `
        <div style="display: flex; align-items: flex-start; gap: 10px; padding: 7px 10px; border-radius: 6px; background: #ffffff; border: 1px solid #e2e8f0;">
          <span style="font-weight: 900; font-family: monospace; font-size: 10px; color: #b45309; background: #fef3c7; border: 1px solid #fde68a; padding: 1px 6px; border-radius: 4px; flex-shrink: 0; margin-top: 1px;">#${idx + 1}</span>
          <div style="font-size: 11px; line-height: 1.45; color: #1e293b;">
            <strong style="text-transform: uppercase; font-size: 10px; color: #475569; letter-spacing: 0.3px;">${pt.label}:</strong>
            <span style="font-weight: 600; color: #0f172a; margin-left: 4px;">${pt.text}</span>
          </div>
        </div>
      `
      )
      .join('');

    const progressRowsHtml = progressItems.map((item) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; font-size: 11px; border-bottom: 1px solid #f1f5f9;">
        <span style="font-weight: ${item.completed ? '800' : '500'}; color: ${item.completed ? '#0f172a' : '#94a3b8'};">
          ${item.completed ? '✓' : '○'} ${item.label}
        </span>
        <span style="font-weight: 900; font-size: 10px; color: ${item.completed ? '#16a34a' : '#94a3b8'};">
          ${item.completed ? 'COMPLETED' : 'PENDING'}
        </span>
      </div>
    `).join('');

    const timelineRowsHtml = timelineEntries.map((tl) => `
      <div style="padding: 10px 12px; border-left: 3px solid #2563eb; margin-bottom: 10px; background: #f8fafc; border-radius: 0 6px 6px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 800; color: #2563eb; margin-bottom: 4px;">
          <span>📅 ${tl.timestamp}</span>
          ${tl.statusTag ? `<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px;">${tl.statusTag}</span>` : ''}
        </div>
        <div style="font-weight: 900; font-size: 12px; color: #0f172a; margin-bottom: 2px;">${tl.title}</div>
        <div style="font-size: 11px; color: #334155; line-height: 1.4;">${tl.description}</div>
        <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-top: 4px;">Investigator: ${tl.investigatorName} (${tl.investigatorRole || 'Officer'})</div>
      </div>
    `).join('');

    const photoPages = evidenceList.filter(ev => ev.url || ev.fileType === 'Image').map((ev, pIdx) => `
      <div style="page-break-before: always; break-before: page; padding-top: 20px;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 900; text-transform: uppercase;">EVIDENCE ATTACHMENT PHOTO PAGE #${pIdx + 1}</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 700; color: #4a5568;">CASE ID: ${c.id} • ${c.caseName || c.title || ''}</p>
          </div>
          <span style="font-family: monospace; font-size: 11px; font-weight: 900; background-color: #000; color: #fff; padding: 4px 8px; border-radius: 4px;">PHOTO EXHIBIT</span>
        </div>

        <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #cbd5e1; background-color: #f8fafc; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <strong style="font-size: 10px; text-transform: uppercase; color: #64748b; display: block;">Photo Title / File Name:</strong>
            <span style="font-weight: 900; color: #000;">${ev.fileName}</span>
          </div>
          <div>
            <strong style="font-size: 10px; text-transform: uppercase; color: #64748b; display: block;">Uploaded By:</strong>
            <span style="font-weight: 700; color: #000;">${ev.uploadedBy} (${ev.uploadedByRole})</span>
          </div>
          <div>
            <strong style="font-size: 10px; text-transform: uppercase; color: #64748b; display: block;">Upload Timestamp & Size:</strong>
            <span style="font-family: monospace; color: #000;">${ev.uploadedAt} (${ev.fileSize})</span>
          </div>
          <div>
            <strong style="font-size: 10px; text-transform: uppercase; color: #64748b; display: block;">Relevance / Description:</strong>
            <span style="color: #000;">${ev.description || 'No description provided.'}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; padding: 16px; border: 2px solid #000; border-radius: 8px; background: #fff;">
          ${ev.url ? `<img src="${ev.url}" alt="${ev.fileName}" style="max-height: 650px; max-width: 100%; object-fit: contain; border-radius: 4px;" />` : `<p style="color: #64748b;">[Attached file: ${ev.fileName}]</p>`}
        </div>
        <p style="text-align: center; font-size: 10px; font-family: monospace; color: #64748b; text-transform: uppercase; margin-top: 16px;">
          Official Evidence Exhibit Photo Document • Judicial Information System
        </p>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Case_Dossier_${c.id}</title>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; padding: 20px; background: #fff; color: #000; }
              .container { max-width: 100% !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0d1117;
              background-color: #f1f5f9;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 850px;
              margin: 30px auto;
              background: #fff;
              padding: 40px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
              border-radius: 12px;
            }
            .action-bar {
              position: sticky;
              top: 0;
              background: #0f172a;
              color: #fff;
              padding: 14px 28px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 1000;
            }
            .btn {
              padding: 9px 18px;
              border-radius: 8px;
              font-weight: 800;
              font-size: 13px;
              cursor: pointer;
              border: none;
              transition: all 0.2s;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .btn-primary {
              background: linear-gradient(135deg, #f59e0b, #eab308);
              color: #0f172a;
              box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
            }
            .btn-primary:hover {
              background: #d97706;
              transform: translateY(-1px);
            }
            .btn-secondary {
              background: #334155;
              color: #f8fafc;
            }
            .btn-secondary:hover {
              background: #475569;
            }
          </style>
        </head>
        <body>
          <div class="action-bar no-print">
            <div style="font-weight: 800; font-size: 14px; letter-spacing: -0.2px;">📄 Judicial Case Dossier Document — ${c.id}</div>
            <div style="display: flex; gap: 12px;">
              <button class="btn btn-primary" onclick="window.print()">📥 Download PDF / Save File</button>
              <button class="btn btn-secondary" onclick="window.close()">Close Page</button>
            </div>
          </div>

          <div class="container">
            <!-- Header -->
            <div style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px;">JUDICIAL INFORMATION SYSTEM • CASE DOSSIER</h1>
                <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">State Cyber & Crime Branch • Official Investigation Record</p>
              </div>
              <div style="text-align: right; font-family: monospace; font-size: 11px;">
                <div style="font-weight: 900;">CASE REF: ${c.id}</div>
                <div>Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
                <div style="font-weight: 900; color: #dc2626; text-transform: uppercase;">PRIORITY: ${c.priority}</div>
              </div>
            </div>

            <!-- Core Details -->
            <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 12px;">
                <div>
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">Case Title</div>
                  <div style="font-size: 14px; font-weight: 900; color: #0f172a;">${c.caseName || c.title || ''}</div>
                </div>
                <div>
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">Crime Category & Status</div>
                  <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${c.crimeType || c.crimeCategory || ''} (${c.status || ''})</div>
                </div>
                <div>
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">Victim Name</div>
                  <div style="font-weight: 800; color: #0f172a;">👤 ${c.victimName || 'N/A'}</div>
                </div>
                <div>
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">Witness Name</div>
                  <div style="font-weight: 800; color: #0f172a;">👤 ${c.witnessName || 'N/A'}</div>
                </div>
                <div>
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">Incident Location</div>
                  <div style="font-weight: 800; color: #dc2626; font-size: 12px;">📍 ${c.location || 'Location Not Specified'}</div>
                </div>
                <div>
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">Date Assigned</div>
                  <div style="font-weight: 700; color: #0f172a;">${c.dateAssigned || ''}</div>
                </div>
              </div>
              <div style="padding-top: 12px; border-top: 1px solid #e2e8f0;">
                <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b;">Case Description & Overview</div>
                <div style="font-size: 12px; color: #1e293b; line-height: 1.5; margin-top: 4px; font-weight: 500;">${c.description || ''}</div>
              </div>
            </div>

            <!-- Investigation Team -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px;">Assigned Investigation Team</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 12px;">
                <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block;">Investigator</span>
                  <span style="font-weight: 800; color: #0f172a;">${c.assignedHostName || 'Unassigned'}</span>
                </div>
                <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block;">Police Officers (${officerNames.length})</span>
                  <span style="font-weight: 800; color: #0f172a;">${officerNames.length > 0 ? officerNames.join(', ') : 'None assigned'}</span>
                </div>
                <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; display: block;">Advocates (${advocateNames.length})</span>
                  <span style="font-weight: 800; color: #0f172a;">${advocateNames.length > 0 ? advocateNames.join(', ') : 'None assigned'}</span>
                </div>
              </div>
            </div>

            <!-- Linked Suspects & Addresses -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px;">
                Linked Suspects & Addresses (${linkedSuspects.length})
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${suspectRowsHtml}
              </div>
            </div>

            <!-- Summary (AI Insights) -->
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px;">
                <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin: 0;">Summary</h3>
                <span style="font-size: 10px; font-weight: 800; color: #b45309; background: #fef3c7; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
                  ✨ AI Insights
                </span>
              </div>
              <div style="padding: 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc;">
                <div style="margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
                  <div style="font-family: monospace; font-size: 11px; font-weight: 900; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px;">
                    Case ID: ${c.id}
                  </div>
                  <div style="font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 2px;">
                    ${c.caseName || c.title || ''}
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 7px;">
                  ${aiSummaryRowsHtml}
                </div>
              </div>
            </div>

            <!-- Investigation Progress Bar -->
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px;">
                <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin: 0;">Investigation Progress</h3>
                <span style="font-size: 12px; font-weight: 900; color: #0284c7;">${progressPercentage}% Completed</span>
              </div>
              <div style="width: 100%; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin-bottom: 12px;">
                <div style="width: ${progressPercentage}%; height: 100%; background: #0284c7;"></div>
              </div>
              <div style="border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
                ${progressRowsHtml}
              </div>
            </div>

            <!-- Sequential Timeline -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px;">
                Case Sequential Timeline (${timelineEntries.length} Records)
              </h3>
              ${timelineRowsHtml}
            </div>

            <!-- Evidence Inventory -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px;">
                Case Evidence Vault Inventory (${evidenceList.length} Files)
              </h3>
              ${
                evidenceList.length > 0
                  ? `
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
                  <thead>
                    <tr style="background: #f1f5f9; border-bottom: 2px solid #000;">
                      <th style="padding: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase;">#</th>
                      <th style="padding: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase;">File / Record Title</th>
                      <th style="padding: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Category</th>
                      <th style="padding: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Uploaded By</th>
                      <th style="padding: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase;">Size & Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${evidenceRows}
                  </tbody>
                </table>
              `
                  : `
                <p style="font-size: 12px; color: #64748b; font-style: italic; padding: 16px; border: 1px dashed #cbd5e1; text-align: center; border-radius: 6px;">
                  No evidence files recorded for this case dossier yet.
                </p>
              `
              }
            </div>

            <!-- Evidence Photos -->
            ${photoPages}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);

    // Calculate size
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb >= 1) {
      setFileSizeStr(`${sizeInMb.toFixed(1)} MB`);
    } else {
      const sizeInKb = file.size / 1024;
      setFileSizeStr(`${sizeInKb.toFixed(0)} KB`);
    }

    // Auto detect category
    if (file.type.startsWith('image/')) {
      setFileType('Image');
    } else if (file.type.startsWith('video/')) {
      setFileType('Video');
    } else if (file.type.startsWith('audio/')) {
      setFileType('Audio');
<<<<<<< HEAD
    } else if (file.name.toLowerCase().includes('report') || file.name.toLowerCase().includes('analysis') || file.name.toLowerCase().includes('forensic')) {
      setFileType('Forensic');
=======
>>>>>>> aa42170 (CrimeMtrix1)
    } else {
      setFileType('Document');
    }

    // Generate preview data URL if image or video
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      try {
        const objectUrl = URL.createObjectURL(file);
        setFilePreviewUrl(objectUrl);
      } catch (err) {
        console.error('Error generating video preview URL:', err);
      }
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const resetForm = () => {
    setFileName('');
    setDescription('');
    setNotes('');
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setFileSizeStr('');
    setShowUploadForm(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !description.trim()) return;

    const newEv: EvidenceFile = {
      id: `ev-${Date.now()}`,
      caseId: c.id,
      fileName: fileName.trim(),
      fileType,
      description: description.trim(),
      notes: notes.trim() || undefined,
      uploadedBy: currentUser.fullName,
      uploadedByRole: currentUser.role,
      uploadedAt: new Date().toLocaleString(),
      fileSize: fileSizeStr || `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
      url: filePreviewUrl || undefined,
    };

    onUploadEvidence(c.id, newEv);
    resetForm();
  };

  const handleStartEditEvidence = (ev: EvidenceFile) => {
    setEditingEvidenceId(ev.id);
    setEditFileName(ev.fileName);
    setEditFileType(ev.fileType);
    setEditDescription(ev.description);
    setEditNotes(ev.notes || '');
    setEditPreviewUrl(ev.url || null);
  };

  const handleSaveEditEvidence = (ev: EvidenceFile) => {
    if (!editFileName.trim() || !editDescription.trim()) return;

    const updatedEv: EvidenceFile = {
      ...ev,
      fileName: editFileName.trim(),
      fileType: editFileType,
      description: editDescription.trim(),
      notes: editNotes.trim() || undefined,
      url: editPreviewUrl || ev.url,
    };

    if (onUpdateEvidence) {
      onUpdateEvidence(c.id, updatedEv);
    } else {
      onUploadEvidence(c.id, updatedEv);
    }
    setEditingEvidenceId(null);
  };

  const getFileIcon = (type: EvidenceFile['fileType']) => {
    switch (type) {
      case 'Image':
<<<<<<< HEAD
        return <Image className="w-4 h-4 text-emerald-400" />;
      case 'Video':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'Audio':
        return <Music className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
=======
        return <Image className={`w-4 h-4 ${themeMode === 'bright' ? 'text-emerald-600' : 'text-emerald-400'}`} />;
      case 'Video':
        return <Video className={`w-4 h-4 ${themeMode === 'bright' ? 'text-purple-600' : 'text-purple-400'}`} />;
      case 'Audio':
        return <Music className={`w-4 h-4 ${themeMode === 'bright' ? 'text-amber-600' : 'text-amber-400'}`} />;
      default:
        return <FileText className={`w-4 h-4 ${themeMode === 'bright' ? 'text-blue-600' : 'text-blue-400'}`} />;
>>>>>>> aa42170 (CrimeMtrix1)
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] w-screen h-screen flex flex-col overflow-hidden bg-black/95">
      <div
        className={`relative w-full h-full flex flex-col overflow-hidden transition-all ${
          themeMode === 'bright'
            ? 'bg-slate-100 text-slate-900'
            : 'bg-slate-950 text-slate-100'
        }`}
      >
        {/* Case Header */}
        <div className={`p-4 sm:px-8 sm:py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
          themeMode === 'bright'
            ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-sky-200 text-blue-950 shadow-sm'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-yellow-500/20 text-yellow-400'
        }`}>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1">
              <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg ${
                themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950'
              }`}>
                {c.id}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                themeMode === 'bright'
                  ? 'bg-blue-100 text-blue-950 border border-blue-200'
                  : 'text-amber-300 bg-amber-500/10 border border-amber-500/30'
              }`}>
                {c.crimeType}
              </span>
              <button
                type="button"
                id="btn-case-network-detail"
                onClick={() => setShowNetworkGraphModal(true)}
                className={`p-1 rounded-md border transition-all cursor-pointer active:scale-90 flex items-center justify-center ${
                  themeMode === 'bright'
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400 shadow-xs'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-yellow-400 hover:text-yellow-300 border-slate-700 hover:border-yellow-500/50 shadow-xs'
                }`}
                title="Investigative Link & Entity Network Graph"
              >
                <NetworkingIcon className="w-3.5 h-3.5" />
              </button>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                c.status === 'Solved'
                  ? themeMode === 'bright'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black'
                  : c.status === 'Under Investigation'
                  ? themeMode === 'bright'
                    ? 'bg-orange-100 text-orange-800 border border-orange-300 font-extrabold'
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-black'
                  : c.status === 'Active'
                  ? themeMode === 'bright'
                    ? 'bg-red-100 text-red-800 border border-red-300 font-extrabold'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 font-black'
                  : themeMode === 'bright'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 font-extrabold'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-black'
              }`}>
                ● {c.status}
              </span>
            </div>
            <h2 className={`text-xl sm:text-3xl font-black leading-tight ${
              themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
            }`}>{c.caseName}</h2>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2.5 self-end sm:self-center shrink-0">
            {/* Case Team Chat Button */}
            <button
              type="button"
              id="btn-case-team-chat"
              onClick={() => setShowChatModal(true)}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2 transition-all border shadow-sm cursor-pointer active:scale-95 ${
                themeMode === 'bright'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-blue-600/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-blue-500/20 font-black'
              }`}
              title="Team Discussion & Secure Case Chat"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            <button
              type="button"
              id="btn-case-ai-insights"
              onClick={() => setShowAiInsights(true)}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2 transition-all border shadow-sm cursor-pointer active:scale-95 ${
                themeMode === 'bright'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-amber-500/20'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 border-yellow-400 shadow-yellow-500/20 font-black'
              }`}
              title="View Case Summary & Insights"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Insights</span>
            </button>

            <button
              onClick={onClose}
              id="btn-close-case-detail"
              className={`p-2 sm:px-4 sm:py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2 transition-all border shadow-sm cursor-pointer ${
                themeMode === 'bright' ? 'bg-white hover:bg-slate-200 text-slate-900 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
              }`}
              title="Close Full Screen Case Details"
            >
              <X className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 w-full max-w-7xl mx-auto space-y-6">
          {/* Subdivision Level: All Cases View-Only Jurisdiction Banner */}
          {isReadOnly && (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                themeMode === 'bright'
                  ? 'bg-blue-50/90 border-2 border-blue-300 text-blue-950 shadow-sm'
                  : 'bg-blue-950/30 border border-blue-800/60 text-blue-200 shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black uppercase tracking-wider">
                      Taluka Jurisdiction Oversight • View-Only Mode
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      {c.taluka || c.subdivisionTaluka || 'Jurisdictional Taluka'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This case occurred or was registered in your assigned taluka. As Subdivision Level Officer, you have view-only monitoring privileges over this case record.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-blue-600/20 text-blue-300 border border-blue-500/40 shrink-0 self-start sm:self-center">
                🔒 Read-Only Oversight
              </span>
            </div>
          )}

          {/* Subdivision Level: Major Case (High Authority Charge & Directives) Banner */}
          {!isReadOnly && currentUser.role === 'Subdivision Level' && (c.isMajorCase || c.assignedSubdivisionOfficerId === currentUser.id) && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                themeMode === 'bright'
                  ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-white border-2 border-amber-400 text-amber-950 shadow-md'
                  : 'bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-yellow-500/50 text-slate-100 shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base font-black">
                      Major Case — High Authority SDPO Investigation
                    </h3>
                    {c.subdivisionOfficerInCharge ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        ✓ In Active Charge (SDPO {c.inChargeOfficerName || currentUser.fullName})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                        ● SHO/Inspector Escalation — Charge Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Assigned by SHO/Inspector Command Headquarters for high-authority supervisory investigation. You have full authority to modify case details, issue directives, and direct the investigation.
                  </p>
                  {c.subdivisionNotes && (
                    <div className="mt-2 text-xs p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-medium">
                      <strong>SHO/Inspector Directives:</strong> {c.subdivisionNotes}
                    </div>
                  )}
                </div>
              </div>

              {!c.subdivisionOfficerInCharge && onTakeCharge && (
                <button
                  id="btn-modal-take-charge"
                  type="button"
                  onClick={() => onTakeCharge(c.id, 'Assumed High Authority investigative and supervisory charge by mandate of SHO/Inspector Command.')}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shrink-0 cursor-pointer transition-all transform hover:scale-105"
                >
                  <Shield className="w-4 h-4" />
                  <span>Take Charge of Investigation</span>
                </button>
              )}
            </div>
          )}

          {/* Description & Overview */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            themeMode === 'bright'
              ? 'bg-white border-2 border-slate-300 text-slate-900 shadow-sm'
              : 'bg-slate-900/60 border border-slate-800 text-slate-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-200 dark:border-slate-800">
              <h4 className={`text-xs font-black uppercase tracking-wider ${
                themeMode === 'bright' ? 'text-amber-900' : 'text-amber-300'
              }`}>Case Overview</h4>
              <div className="flex items-center text-xs font-black text-red-600 dark:text-red-400">
                <MapPin className="w-4 h-4 mr-1 shrink-0 text-red-500 animate-pulse" />
                <span>Location: {c.location || 'Not Specified'}</span>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${
              themeMode === 'bright' ? 'text-slate-800 font-semibold' : 'text-slate-300'
            }`}>{c.description}</p>
            <div className={`flex flex-wrap gap-4 pt-2 text-xs border-t ${
              themeMode === 'bright' ? 'text-slate-700 border-slate-200 font-bold' : 'text-slate-400 border-slate-800/80'
            }`}>
              <span className="flex items-center"><Calendar className={`w-3.5 h-3.5 mr-1 ${themeMode === 'bright' ? 'text-amber-700' : 'text-yellow-400'}`} /> Assigned: {c.dateAssigned}</span>
              <span className="flex items-center"><Shield className={`w-3.5 h-3.5 mr-1 ${themeMode === 'bright' ? 'text-amber-700' : 'text-yellow-400'}`} /> Priority: <strong className="ml-1 text-red-600 font-extrabold">{c.priority}</strong></span>
              <span className="flex items-center"><Clock className={`w-3.5 h-3.5 mr-1 ${themeMode === 'bright' ? 'text-amber-700' : 'text-yellow-400'}`} /> Investigator: {c.assignedHostName}</span>
            </div>
          </div>

          {/* Next Court Hearing & Team Target Deadline Banner */}
          {(() => {
            const countdown = c.courtHearingDate ? getHearingCountdown(c.courtHearingDate) : null;
            const canEditHearing = !isReadOnly && canUserEditCourtHearing(currentUser, c);

            return (
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                  themeMode === 'bright'
                    ? 'bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border-2 border-amber-300 shadow-sm text-slate-900'
                    : 'bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border-yellow-500/30 text-slate-100 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-amber-200/80 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        Official Judicial Hearing Schedule
                      </span>
                      <h4 className={`text-sm sm:text-base font-black ${
                        themeMode === 'bright' ? 'text-amber-950' : 'text-yellow-400'
                      }`}>
                        Next Court Hearing & Evidence Target Deadline
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {countdown && (
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                          countdown.isPast
                            ? 'bg-slate-700 text-slate-300'
                            : countdown.urgency === 'critical'
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {countdown.formattedShort}
                      </span>
                    )}

                    {canEditHearing && (
                      <button
                        type="button"
                        onClick={() => setShowCourtHearingModal(true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1 shadow-sm cursor-pointer ${
                          themeMode === 'bright'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{c.courtHearingDate ? 'Update Date' : 'Set Date'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${
                    themeMode === 'bright' ? 'bg-white border-amber-200' : 'bg-slate-900/60 border-slate-700'
                  }`}>
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                      Court Date & Venue
                    </span>
                    <div className="font-extrabold flex items-center text-xs sm:text-sm">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0" />
                      <span>{formatHearingDateTime(c.courtHearingDate)}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1 text-red-500 shrink-0" />
                      <span className="truncate">{c.courtHearingLocation || 'Sessions Court Room, District Complex'}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border ${
                    themeMode === 'bright' ? 'bg-white border-amber-200' : 'bg-slate-900/60 border-slate-700'
                  }`}>
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                      Police Investigation Target / Evidence Agenda
                    </span>
                    <p className="font-medium text-[11px] leading-relaxed line-clamp-2">
                      {c.courtHearingNotes ||
                        'All forensic evidence, verified chargesheet, and witness testimonies must be prepared prior to this hearing.'}
                    </p>
                  </div>
                </div>

                {c.courtHearingUpdatedBy && (
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>Last Updated: <strong>{c.courtHearingUpdatedBy}</strong></span>
                    {c.courtHearingUpdatedAt && <span>{c.courtHearingUpdatedAt}</span>}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Assigned Team Members */}
          <div className="space-y-3">
            <h4 className={`text-xs font-black uppercase tracking-wider flex items-center ${
              themeMode === 'bright' ? 'text-amber-900' : 'text-yellow-400'
            }`}>
              <Users className="w-4 h-4 mr-1.5" /> Assigned Investigation Team
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`p-3.5 rounded-xl border ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-slate-300 shadow-sm'
                  : 'bg-slate-900/40 border border-slate-800'
              }`}>
                <span className={`text-[10px] font-black uppercase ${
                  themeMode === 'bright' ? 'text-amber-800' : 'text-amber-400'
                }`}>Investigator</span>
                <p className={`text-xs font-extrabold mt-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                  {c.assignedHostName || 'Unassigned'}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-slate-300 shadow-sm'
                  : 'bg-slate-900/40 border border-slate-800'
              }`}>
                <span className={`text-[10px] font-black uppercase ${
                  themeMode === 'bright' ? 'text-blue-800' : 'text-blue-400'
                }`}>Police Officers ({(c.assignedOfficerNames || []).length})</span>
                <p className={`text-xs font-bold mt-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                  {(c.assignedOfficerNames || []).length > 0 ? (c.assignedOfficerNames || []).join(', ') : 'None assigned yet'}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-slate-300 shadow-sm'
                  : 'bg-slate-900/40 border border-slate-800'
              }`}>
                <span className={`text-[10px] font-black uppercase ${
                  themeMode === 'bright' ? 'text-purple-800' : 'text-purple-400'
                }`}>Victim / Complainant</span>
                <p className={`text-xs font-bold mt-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                  {c.victimName || 'Citizen Complainant'}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-slate-300 shadow-sm'
                  : 'bg-slate-900/40 border border-slate-800'
              }`}>
                <span className={`text-[10px] font-black uppercase ${
                  themeMode === 'bright' ? 'text-teal-800' : 'text-teal-400'
                }`}>Key Witness</span>
                <p className={`text-xs font-bold mt-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                  {c.witnessName || 'None recorded'}
                </p>
              </div>
              {c.assignedSubdivisionOfficerName && (
                <div className={`p-3.5 rounded-xl border ${
                  themeMode === 'bright'
                    ? 'bg-purple-50 border-2 border-purple-200 shadow-sm'
                    : 'bg-purple-950/20 border border-purple-800/50'
                }`}>
                  <span className={`text-[10px] font-black uppercase ${
                    themeMode === 'bright' ? 'text-purple-800' : 'text-purple-300'
                  }`}>Subdivision Level Officer (SDPO)</span>
                  <p className={`text-xs font-extrabold mt-1 ${themeMode === 'bright' ? 'text-purple-950' : 'text-purple-200'}`}>
                    {c.assignedSubdivisionOfficerName}
                  </p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate mt-0.5">
                    {c.subdivisionTaluka ? `${c.subdivisionTaluka} Taluka` : ''} {c.subdivisionStation ? `• ${c.subdivisionStation}` : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Linked Suspects & Locations (Visible to assigned team members, Host, DSP, Subdivision Level, and District Level) */}
          {(() => {
            const isAssigned =
              currentUser.role === 'DSP' ||
              currentUser.role === 'Subdivision Level' ||
              currentUser.role === 'District Level' ||
              c.assignedDistrictOfficerId === currentUser.id ||
              c.assignedSubdivisionOfficerId === currentUser.id ||
              c.assignedHostId === currentUser.id ||
              (c.assignedOfficerIds || []).includes(currentUser.id) ||
              (c.assignedAdvocateIds || []).includes(currentUser.id);

            if (!isAssigned) return null;

            const linkedSuspects = suspects.filter((s) => s.linkedCaseIds.includes(c.id));
            const canManage = !isReadOnly && (
              currentUser.role === 'DSP' ||
              currentUser.role === 'Subdivision Level' ||
              currentUser.role === 'District Level' ||
              currentUser.role === 'Host'
            );

            return (
              <div className={`space-y-3 p-3.5 rounded-xl border ${
                themeMode === 'bright'
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-rose-500/30 bg-rose-950/20'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-black uppercase tracking-wider flex items-center ${
                    themeMode === 'bright' ? 'text-red-900' : 'text-rose-300'
                  }`}>
                    <UserX className={`w-4 h-4 mr-1.5 ${themeMode === 'bright' ? 'text-red-600' : 'text-rose-400'}`} /> Linked Suspects & Addresses ({linkedSuspects.length})
                  </h4>

                  {canManage && (
                    c.status === 'Solved' ? (
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold rounded-lg text-xs flex items-center space-x-1">
                        <span>🔒 Case Solved (Read-Only)</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSuspectModal(true)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow-sm cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add / Edit Suspects</span>
                      </button>
                    )
                  )}
                </div>

                {linkedSuspects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {linkedSuspects.map((s) => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border flex items-start space-x-3 ${
                          themeMode === 'bright'
                            ? 'bg-white border-red-200 text-slate-900 shadow-xs'
                            : 'bg-slate-900/90 border-rose-500/40 text-slate-100'
                        }`}
                      >
                        <img
                          src={s.photoUrl}
                          alt={s.fullName}
                          className={`w-11 h-11 rounded-lg object-cover border shrink-0 ${
                            themeMode === 'bright' ? 'border-red-300' : 'border-rose-400/50'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-xs truncate">{s.fullName}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                              themeMode === 'bright'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              {s.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.id} • {s.age} yrs • {s.gender}</p>
                          <p className={`text-[11px] font-bold mt-1 flex items-start ${
                            themeMode === 'bright' ? 'text-red-700' : 'text-rose-300'
                          }`}>
                            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 mt-0.5" />
                            <span>{s.address}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center border border-dashed rounded-lg text-slate-400 text-xs">
                    No suspects currently linked to this case. {canManage && 'Click "Add / Edit Suspects" above to assign or create suspects.'}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Evidence Vault / File Repository */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-black flex items-center ${
                  themeMode === 'bright' ? 'text-amber-950' : 'text-yellow-400'
                }`}>
                  <FileText className="w-4 h-4 mr-1.5" /> Case Evidence Vault ({(c.evidence || []).length})
                </h4>
                <p className={`text-xs font-semibold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>All files are securely visible to assigned team members.</p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Gap Detector Button placed on the left side of Upload Evidence */}
                <button
                  type="button"
                  id="btn-gap-detector"
                  onClick={() => setShowGapDetector(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-lg text-xs flex items-center space-x-1.5 shadow-md shadow-purple-600/30 hover:scale-[1.02] transition-all cursor-pointer border border-purple-400/40"
                  title="Run AI Gap Detection on Case Evidence & Investigation Progress"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>Gap Detector</span>
                </button>

                {isReadOnly ? (
                  <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 font-bold rounded-lg text-xs flex items-center space-x-1">
                    <span>🔒 View-Only Mode</span>
                  </span>
                ) : c.status === 'Solved' ? (
                  <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold rounded-lg text-xs flex items-center space-x-1">
                    <span>🔒 Case Solved (Vault Locked)</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="px-3.5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black rounded-lg text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Evidence</span>
                  </button>
                )}
              </div>
            </div>

            {/* Evidence Upload Form */}
            {showUploadForm && (
              <form onSubmit={handleUploadSubmit} className={`p-4 rounded-xl border space-y-3.5 ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-amber-400 shadow-md'
                  : 'bg-slate-900/90 border border-yellow-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <h5 className={`text-xs font-black uppercase ${themeMode === 'bright' ? 'text-amber-900' : 'text-yellow-400'}`}>Upload New Evidence / Photo</h5>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${themeMode === 'bright' ? 'bg-amber-100 text-amber-900' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    Authorized Uploader: {currentUser.fullName} ({currentUser.role})
                  </span>
                </div>

                {/* File / Photo Upload Dropzone */}
                <div>
                  <label className={`block text-[11px] font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                    Select File or Photo from Device *
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                      dragActive
                        ? 'border-yellow-400 bg-yellow-500/10'
                        : selectedFile
                        ? themeMode === 'bright'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-emerald-500/50 bg-emerald-500/10'
                        : themeMode === 'bright'
                        ? 'border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50/50'
                        : 'border-slate-700 bg-slate-950/60 hover:border-yellow-500/60 hover:bg-slate-900'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />

                    {selectedFile ? (
                      <div className="flex flex-col items-center space-y-2">
                        {filePreviewUrl ? (
                          fileType === 'Video' || (selectedFile && selectedFile.type.startsWith('video/')) ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-500 shadow-md bg-black flex items-center justify-center">
                              <video src={filePreviewUrl} className="w-full h-full object-cover" muted playsInline />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-7 h-7 text-white fill-white drop-shadow-md" />
                              </div>
                              <span className="absolute bottom-1 right-1 text-[8px] bg-red-600 text-white font-mono px-1 rounded font-black tracking-wider leading-none">
                                VIDEO
                              </span>
                            </div>
                          ) : (
                            <img src={filePreviewUrl} alt="Selected preview" className="w-20 h-20 object-cover rounded-lg border-2 border-emerald-500 shadow-md" />
                          )
                        ) : (
                          <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                          </div>
                        )}
                        <div className="text-center">
                          <p className={`text-xs font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>{selectedFile.name}</p>
                          <p className={`text-[10px] font-mono font-bold ${themeMode === 'bright' ? 'text-emerald-800' : 'text-emerald-400'}`}>{fileSizeStr} • File attached successfully</p>
                        </div>
                        <span className="text-[10px] underline text-amber-500 font-bold hover:text-amber-400">Click or drop another file to replace</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1.5 py-1">
                        <div className={`p-2.5 rounded-full ${themeMode === 'bright' ? 'bg-amber-100 text-amber-800' : 'bg-slate-800 text-yellow-400'}`}>
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <p className={`text-xs font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Click here to select a file/photo from your device
                        </p>
                        <p className={`text-[10px] font-semibold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
<<<<<<< HEAD
                          Or drag and drop files directly here (Images, Videos, PDFs, Forensic Reports)
=======
                          Or drag and drop files directly here (Images, Videos, PDFs, Documents)
>>>>>>> aa42170 (CrimeMtrix1)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>Document / File Title *</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="e.g. Ballistics_Analysis_Report.pdf"
                      className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>File Category</label>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value as EvidenceFile['fileType'])}
                      className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                    >
                      <option value="Document">Document / Report</option>
                      <option value="Image">Image / Photograph</option>
                      <option value="Video">CCTV / Video Recording</option>
                      <option value="Audio">Audio / Wiretap</option>
<<<<<<< HEAD
                      <option value="Forensic">Forensic Analysis</option>
=======
>>>>>>> aa42170 (CrimeMtrix1)
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>Brief Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe relevance to case, key observations, or chain of custody notes..."
                    className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                    Notes / Comments
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Add notes, officer comments, or investigation remarks..."
                    className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-400'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-3 py-1.5 rounded text-xs font-bold ${
                      themeMode === 'bright'
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded text-xs font-black shadow-sm flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Confirm Upload & Notify Team</span>
                  </button>
                </div>
              </form>
            )}

            {/* Evidence List */}
            <div className="space-y-2">
              {(c.evidence || []).length > 0 ? (
                (c.evidence || []).map((ev) => (
                  editingEvidenceId === ev.id ? (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-xl border space-y-3 transition-colors ${
                        themeMode === 'bright'
                          ? 'bg-blue-50/90 border-2 border-blue-400 text-slate-900 shadow-md'
                          : 'bg-slate-900 border-2 border-blue-500/50 text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-2 border-blue-200 dark:border-slate-800">
                        <span className={`text-xs font-black uppercase flex items-center gap-1.5 ${themeMode === 'bright' ? 'text-blue-900' : 'text-blue-400'}`}>
                          <Edit3 className="w-3.5 h-3.5" /> Edit Evidence & Notes
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${themeMode === 'bright' ? 'bg-blue-100 text-blue-900' : 'bg-slate-800 text-slate-300'}`}>
                          {ev.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                            Document / File Title *
                          </label>
                          <input
                            type="text"
                            value={editFileName}
                            onChange={(e) => setEditFileName(e.target.value)}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                              themeMode === 'bright'
                                ? 'bg-white border-2 border-slate-300 text-slate-900'
                                : 'bg-slate-950 border-slate-700 text-slate-100'
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                            Category
                          </label>
                          <select
                            value={editFileType}
                            onChange={(e) => setEditFileType(e.target.value as EvidenceFile['fileType'])}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                              themeMode === 'bright'
                                ? 'bg-white border-2 border-slate-300 text-slate-900'
                                : 'bg-slate-950 border-slate-700 text-slate-100'
                            }`}
                          >
                            <option value="Document">Document / Report</option>
                            <option value="Image">Image / Photograph</option>
                            <option value="Video">CCTV / Video Recording</option>
                            <option value="Audio">Audio / Wiretap</option>
<<<<<<< HEAD
                            <option value="Forensic">Forensic Analysis</option>
=======
>>>>>>> aa42170 (CrimeMtrix1)
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                          Brief Description *
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                            themeMode === 'bright'
                              ? 'bg-white border-2 border-slate-300 text-slate-900'
                              : 'bg-slate-950 border-slate-700 text-slate-100'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-[11px] font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                          Notes / Comments
                        </label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          placeholder="Add or update notes and comments..."
                          className={`w-full px-3 py-1.5 rounded-lg text-xs border font-bold ${
                            themeMode === 'bright'
                              ? 'bg-white border-2 border-slate-300 text-slate-900'
                              : 'bg-slate-950 border-slate-700 text-slate-100'
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingEvidenceId(null)}
                          className={`px-3 py-1.5 rounded text-xs font-bold ${
                            themeMode === 'bright'
                              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditEvidence(ev)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-black shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={ev.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-3 transition-colors ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 shadow-sm hover:border-slate-400'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
<<<<<<< HEAD
                        <div className={`p-2 rounded-lg border mt-0.5 shrink-0 ${
                          themeMode === 'bright'
                            ? 'bg-slate-100 border-slate-300'
=======
                        <div className={`p-2 rounded-lg border mt-0.5 shrink-0 flex items-center justify-center ${
                          themeMode === 'bright'
                            ? 'bg-slate-100 border-slate-300 shadow-2xs'
>>>>>>> aa42170 (CrimeMtrix1)
                            : 'bg-slate-800 border-slate-700'
                        }`}>
                          {getFileIcon(ev.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
<<<<<<< HEAD
                          <div className="flex items-center space-x-2 flex-wrap">
                            <p className={`text-xs font-black font-mono ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>{ev.fileName}</p>
                            <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                              themeMode === 'bright'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-slate-800 text-slate-300'
=======
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <p className={`text-xs sm:text-sm font-black tracking-tight break-all ${
                              themeMode === 'bright'
                                ? 'font-mono text-slate-950 font-black'
                                : 'font-mono text-slate-100'
                            }`}>
                              {ev.fileName}
                            </p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                              themeMode === 'bright'
                                ? 'bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
>>>>>>> aa42170 (CrimeMtrix1)
                            }`}>
                              {ev.fileSize}
                            </span>
                          </div>
<<<<<<< HEAD
                          <p className={`text-xs mt-0.5 font-semibold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>{ev.description}</p>
                          {ev.notes && (
                            <div className={`mt-2 p-2 rounded-lg text-xs font-medium flex items-start gap-1.5 border ${
                              themeMode === 'bright'
                                ? 'bg-amber-50 border-amber-300 text-amber-950'
                                : 'bg-slate-950/70 border-yellow-500/30 text-amber-200'
                            }`}>
                              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                              <div>
                                <span className={`font-extrabold text-[11px] block ${themeMode === 'bright' ? 'text-amber-900' : 'text-amber-400'}`}>Notes / Comments:</span>
=======
                          <p className={`text-xs mt-1 font-semibold leading-relaxed ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>{ev.description}</p>
                          {ev.notes && (
                            <div className={`mt-2 p-2.5 rounded-lg text-xs font-medium flex items-start gap-2 border ${
                              themeMode === 'bright'
                                ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-2xs'
                                : 'bg-slate-950/70 border-yellow-500/30 text-amber-200'
                            }`}>
                              <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                              <div>
                                <span className={`font-black text-[11px] block ${themeMode === 'bright' ? 'text-amber-950' : 'text-amber-400'}`}>Notes / Comments:</span>
>>>>>>> aa42170 (CrimeMtrix1)
                                <span className="leading-snug">{ev.notes}</span>
                              </div>
                            </div>
                          )}
<<<<<<< HEAD
                          <p className={`text-[10px] mt-1 font-bold ${themeMode === 'bright' ? 'text-amber-900' : 'text-yellow-400/80'}`}>
                            Uploaded by: <strong>{ev.uploadedBy}</strong> ({ev.uploadedByRole}) • {ev.uploadedAt}
=======
                          <p className={`text-[10px] mt-1.5 font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-yellow-400/80'}`}>
                            Uploaded by: <strong className={themeMode === 'bright' ? 'text-slate-900 font-extrabold' : 'text-slate-200'}>{ev.uploadedBy}</strong> ({ev.uploadedByRole}) • {ev.uploadedAt}
>>>>>>> aa42170 (CrimeMtrix1)
                          </p>
                        </div>
                      </div>

                      {/* Image / Video / File Preview & Action Buttons */}
                      <div className="sm:self-center shrink-0 flex items-center space-x-2">
                        {(() => {
                          const isVideo =
                            ev.fileType === 'Video' ||
                            ev.fileName.toLowerCase().endsWith('.mp4') ||
                            ev.fileName.toLowerCase().endsWith('.webm') ||
                            ev.fileName.toLowerCase().endsWith('.mov') ||
                            ev.fileName.toLowerCase().endsWith('.mkv') ||
                            ev.fileName.toLowerCase().endsWith('.avi') ||
                            ev.fileName.toLowerCase().includes('cctv') ||
                            ev.fileName.toLowerCase().includes('video');

                          if (isVideo) {
                            const videoUrl = ev.url || DEFAULT_SURVEILLANCE_VIDEO_URL;
                            return (
                              <>
                                {/* Video Thumbnail Preview */}
                                <div
                                  onClick={() =>
                                    setPreviewVideoModal({
                                      url: videoUrl,
                                      title: ev.fileName,
                                      notes: ev.notes,
                                      uploadedBy: ev.uploadedBy,
                                      uploadedByRole: ev.uploadedByRole,
                                      uploadedAt: ev.uploadedAt,
                                    })
                                  }
                                  className="relative w-10 h-10 rounded-lg overflow-hidden border border-purple-500/60 cursor-pointer group bg-black shrink-0 hover:border-yellow-400 hover:scale-105 transition-all shadow-xs"
                                  title={`Play CCTV / Video: ${ev.fileName}`}
                                >
                                  <video
                                    src={videoUrl}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    muted
                                    playsInline
                                    preload="metadata"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                                    <Play className="w-3.5 h-3.5 text-white fill-white drop-shadow-md group-hover:scale-110 transition-transform" />
                                  </div>
                                  <span className="absolute bottom-0.5 right-0.5 text-[7px] bg-red-600 text-white font-mono px-0.5 rounded leading-tight font-black tracking-wider">
                                    REC
                                  </span>
                                </div>

                                {/* View Video Button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewVideoModal({
                                      url: videoUrl,
                                      title: ev.fileName,
                                      notes: ev.notes,
                                      uploadedBy: ev.uploadedBy,
                                      uploadedByRole: ev.uploadedByRole,
                                      uploadedAt: ev.uploadedAt,
                                    })
                                  }
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all ${
                                    themeMode === 'bright'
                                      ? 'bg-purple-100 text-purple-950 border border-purple-300 hover:bg-purple-200'
                                      : 'bg-purple-950/60 text-purple-300 border border-purple-500/40 hover:bg-purple-900/60 hover:text-purple-200'
                                  }`}
                                  title="Watch CCTV Footage / Video"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>View Video</span>
                                </button>
                              </>
                            );
                          }

                          if (ev.url) {
                            return (
                              <>
                                <img
                                  src={ev.url}
                                  alt={ev.fileName}
                                  className="w-10 h-10 object-cover rounded-lg border border-yellow-500/50 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                                  onClick={() => setPreviewModalUrl({ url: ev.url!, title: ev.fileName })}
                                />
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalUrl({ url: ev.url!, title: ev.fileName })}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer ${
                                    themeMode === 'bright'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                      : 'bg-slate-800 text-yellow-400 border border-yellow-500/30 hover:bg-slate-700'
                                  }`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Photo</span>
                                </button>
                              </>
                            );
                          }

                          return null;
                        })()}

                        {!isReadOnly && c.status !== 'Solved' && (
                          <button
                            type="button"
                            onClick={() => handleStartEditEvidence(ev)}
                            title="Edit Evidence / Notes"
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                              themeMode === 'bright'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}

                        {!isReadOnly && c.status !== 'Solved' && onDeleteEvidence && (
                          confirmDeleteId === ev.id ? (
                            <div className="flex items-center space-x-1 animate-fadeIn">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteEvidence(c.id, ev.id);
                                  setConfirmDeleteId(null);
                                }}
                                title="Confirm Deletion"
                                className="px-2.5 py-1.5 rounded-lg text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center space-x-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Confirm Delete</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className={`px-2 py-1.5 rounded-lg text-xs font-bold ${
                                  themeMode === 'bright'
                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(ev.id)}
                              title="Delete / Remove Evidence File"
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors ${
                                themeMode === 'bright'
                                  ? 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className={`p-8 text-center text-xs font-bold border border-dashed rounded-xl ${
                  themeMode === 'bright' ? 'text-slate-600 border-slate-300 bg-slate-100/50' : 'text-slate-500 border-slate-800'
                }`}>
                  No evidence uploaded yet for this case. Use "Upload Evidence" to choose a file/photo from your device.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Close and Download PDF Action Buttons */}
        <div className={`p-3.5 sm:p-5 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 ${
          themeMode === 'bright'
            ? 'bg-slate-100 border-slate-300'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between sm:justify-start">
            <span className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>
              Case Dossier Ref: <strong className="font-mono text-amber-500 ml-1">{c.id}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setShowTimeline(true)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md hover:scale-[1.02] ${
                themeMode === 'bright'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">Time-line</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProgressModal(true)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md hover:scale-[1.02] ${
                themeMode === 'bright'
                  ? 'bg-sky-100 hover:bg-sky-200 text-blue-950 border border-sky-300'
                  : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-yellow-400 shrink-0" />
              <span className="truncate">Progress</span>
            </button>

            <button
              type="button"
              id="btn-modal-suspects"
              onClick={() => setShowSuspectModal(true)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md hover:scale-[1.02] ${
                themeMode === 'bright'
                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-950 border border-rose-300'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              }`}
              title="Manage & Add Suspects"
            >
              <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="truncate">Suspects ({linkedSuspects.length})</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              <span className="truncate">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Case Timeline Page / Modal Overlay */}
      {showTimeline && (
        <CaseTimelineModal
          caseItem={c}
          themeMode={themeMode}
          currentUser={currentUser}
          suspects={suspects}
          onClose={() => setShowTimeline(false)}
          onAddEntry={(caseId, entry) => {
            if (onAddTimelineEntry) {
              onAddTimelineEntry(caseId, entry);
            }
          }}
          onUpdateEntry={(caseId, entry) => {
            if (onUpdateTimelineEntry) {
              onUpdateTimelineEntry(caseId, entry);
            }
          }}
        />
      )}

      {/* Investigation Progress Modal Overlay */}
      {showProgressModal && (
        <InvestigationProgressModal
          caseItem={c}
          themeMode={themeMode}
          currentUser={currentUser}
          onClose={() => setShowProgressModal(false)}
          onUpdateCaseStatus={onUpdateCaseStatus}
        />
      )}

      {/* Court Hearing Schedule & Deadline Modal Overlay */}
      {showCourtHearingModal && (
        <CourtHearingModal
          caseItem={c}
          themeMode={themeMode}
          currentUser={currentUser}
          onClose={() => setShowCourtHearingModal(false)}
          onSaveHearing={(caseId, data) => {
            if (onUpdateCourtHearing) {
              onUpdateCourtHearing(caseId, data);
            }
          }}
        />
      )}

      {/* AI Insights Modal Overlay */}
      {showAiInsights && (
        <CaseAiInsightsModal
          c={c}
          isOpen={showAiInsights}
          onClose={() => setShowAiInsights(false)}
          linkedSuspects={linkedSuspects}
          themeMode={themeMode}
        />
      )}

      {/* Printable Case Dossier layout (Hidden on screen, styled specifically for window.print() and PDF generation) */}
      <div id="printable-case-dossier" className="hidden print:block p-8 font-sans text-black bg-white">
        {/* Dossier Header */}
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black uppercase">CRIME MATRIX SYSTEM • OFFICIAL CASE DOSSIER</h1>
            <p className="text-xs text-gray-700 font-bold uppercase tracking-wider mt-1">State Cyber & Crime Branch • Confidential Judicial Investigation Record</p>
          </div>
          <div className="text-right font-mono text-xs">
            <p className="font-bold">CASE REF: {c.id}</p>
            <p>Printed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            <p className="font-bold text-red-700 uppercase">PRIORITY: {c.priority}</p>
          </div>
        </div>

        {/* Core Case Information */}
        <div className="mb-6 p-4 border border-gray-400 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Case Title</p>
              <p className="text-sm font-black text-black">{c.caseName || c.title}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Crime Category & Status</p>
              <p className="text-sm font-bold text-black">{c.crimeType || c.crimeCategory} ({c.status})</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Victim Name</p>
              <p className="font-bold text-black">👤 {c.victimName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Witness Name</p>
              <p className="font-bold text-black">👤 {c.witnessName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Incident Location</p>
              <p className="font-bold text-red-700">📍 {c.location || 'Location Not Specified'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-bold uppercase text-[10px]">Date Assigned</p>
              <p className="font-semibold text-black">{c.dateAssigned}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-300">
            <p className="text-gray-500 font-bold uppercase text-[10px]">Full Case Description & Overview</p>
            <p className="text-xs text-black leading-relaxed mt-1 font-medium">{c.description}</p>
          </div>
        </div>

        {/* Assigned Investigation Team */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider border-b border-black pb-1 mb-3">Assigned Investigation Team</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 border border-gray-300 rounded bg-gray-50">
              <span className="font-bold text-gray-600 block text-[10px] uppercase">Investigator</span>
              <span className="font-bold text-black">{c.assignedHostName || 'Unassigned'}</span>
            </div>
            <div className="p-3 border border-gray-300 rounded bg-gray-50">
              <span className="font-bold text-gray-600 block text-[10px] uppercase">Assigned Officers ({c.assignedOfficerNames.length})</span>
              <span className="font-bold text-black">{c.assignedOfficerNames.length > 0 ? c.assignedOfficerNames.join(', ') : 'None assigned'}</span>
            </div>
            <div className="p-3 border border-gray-300 rounded bg-gray-50">
              <span className="font-bold text-gray-600 block text-[10px] uppercase">Assigned Advocates ({c.assignedAdvocateNames.length})</span>
              <span className="font-bold text-black">{c.assignedAdvocateNames.length > 0 ? c.assignedAdvocateNames.join(', ') : 'None assigned'}</span>
            </div>
          </div>
        </div>

        {/* Linked Suspects & Addresses */}
        {(() => {
          const linkedSuspects = suspects.filter((s) => s.linkedCaseIds.includes(c.id));
          return (
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider border-b border-black pb-1 mb-3">
                Linked Suspects & Addresses ({linkedSuspects.length})
              </h3>
              {linkedSuspects.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {linkedSuspects.map((s) => (
                    <div key={`print-suspect-${s.id}`} className="p-3 border border-gray-300 rounded bg-gray-50 flex space-x-3 items-start">
                      <img src={s.photoUrl} alt="" className="w-12 h-12 rounded object-cover border border-red-500 shrink-0" />
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-black text-black text-xs">{s.fullName}</span>
                          <span className="text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">{s.status}</span>
                        </div>
                        <p className="text-[10px] font-mono text-gray-600">ID: {s.id} • {s.age} yrs • {s.gender}</p>
                        <p className="text-[11px] font-bold text-red-700 mt-1">📍 Address: {s.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic p-3 border border-dashed border-gray-300 rounded text-center">
                  No suspects currently linked to this case record.
                </p>
              )}
            </div>
          );
        })()}

        {/* Case Summary (AI Insights Points) */}
        {(() => {
          const linkedSuspectsList = suspects.filter((s) => s.linkedCaseIds.includes(c.id));
          const aiSummaryPoints = generateCaseAiSummaryPoints(c, linkedSuspectsList);
          return (
            <div className="mb-6">
              <div className="border-b border-black pb-1 mb-3 flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider">Summary</h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded uppercase">
                  ✨ AI Insights
                </span>
              </div>
              <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <p className="font-mono text-xs font-black text-blue-700 uppercase">Case ID: {c.id}</p>
                  <p className="text-sm font-black text-black mt-0.5">{c.caseName || c.title}</p>
                </div>
                <div className="space-y-2 text-xs">
                  {aiSummaryPoints.map((pt, idx) => (
                    <div key={`print-summary-pt-${pt.id}`} className="flex items-start space-x-2.5 p-2 rounded bg-white border border-gray-200">
                      <span className="font-mono text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="leading-relaxed">
                        <strong className="text-[10px] font-bold uppercase text-gray-600 tracking-wider mr-1.5">{pt.label}:</strong>
                        <span className="font-semibold text-gray-900">{pt.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Investigation Progress */}
        <div className="mb-6">
          <div className="border-b border-black pb-1 mb-3 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider">Investigation Progress</h3>
            <span className="text-xs font-black text-sky-700">{progressPercentage}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-sky-600" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="border border-gray-300 rounded-lg bg-gray-50 divide-y divide-gray-200 text-xs">
            {progressItems.map((item, pIdx) => (
              <div key={`print-prog-${pIdx}`} className="p-2 flex justify-between items-center">
                <span className={`font-semibold ${item.completed ? 'text-black' : 'text-gray-400'}`}>
                  {item.completed ? '✓' : '○'} {item.label}
                </span>
                <span className={`text-[10px] font-black uppercase ${item.completed ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {item.completed ? 'COMPLETED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sequential Timeline */}
        {(() => {
          const timelineEntries = c.timeline && c.timeline.length > 0 ? c.timeline : [
            {
              id: `tl-default-${c.id}`,
              timestamp: c.dateAssigned ? `${c.dateAssigned} 09:00 AM` : new Date().toLocaleString(),
              title: 'Complaint / Case Registered',
              description: `Official case complaint registered in system database. Assigned to Investigator ${c.assignedHostName || 'SHO/Inspector Authority'}. Initial FIR dossier opened.`,
              investigatorName: c.assignedHostName || 'Investigator Authority',
              investigatorRole: 'Investigator',
              statusTag: 'Completed',
            }
          ];
          return (
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider border-b border-black pb-1 mb-3">
                Case Sequential Timeline ({timelineEntries.length} Records)
              </h3>
              <div className="space-y-2 text-xs">
                {timelineEntries.map((tl, idx) => (
                  <div key={`print-tl-${tl.id || idx}`} className="p-3 border-l-4 border-blue-600 bg-gray-50 rounded-r border-t border-b border-r border-gray-300">
                    <div className="flex justify-between font-bold text-[10px] text-blue-700 mb-1">
                      <span>📅 {tl.timestamp}</span>
                      {tl.statusTag && <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">{tl.statusTag}</span>}
                    </div>
                    <p className="font-black text-black text-xs">{tl.title}</p>
                    <p className="text-gray-800 text-xs mt-1 leading-relaxed">{tl.description}</p>
                    <p className="text-[10px] text-gray-600 font-bold mt-1">Investigator: {tl.investigatorName} ({tl.investigatorRole || 'Officer'})</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Case Evidence Inventory Table */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider border-b border-black pb-1 mb-3">
            Case Evidence Vault Inventory ({c.evidence.length} Files)
          </h3>
          {c.evidence.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-100">
                  <th className="py-2 px-2 font-bold uppercase text-[10px]">#</th>
                  <th className="py-2 px-2 font-bold uppercase text-[10px]">File / Record Name</th>
                  <th className="py-2 px-2 font-bold uppercase text-[10px]">Category</th>
                  <th className="py-2 px-2 font-bold uppercase text-[10px]">Uploaded By</th>
                  <th className="py-2 px-2 font-bold uppercase text-[10px]">Size & Upload Time</th>
                </tr>
              </thead>
              <tbody>
                {c.evidence.map((ev, idx) => {
                  const isVideo = ev.fileType === 'Video' || ev.fileName.toLowerCase().endsWith('.mp4') || ev.fileName.toLowerCase().includes('cctv') || ev.fileName.toLowerCase().includes('video');
                  return (
                    <tr key={`print-ev-${ev.id}`} className="border-b border-gray-300">
                      <td className="py-2.5 px-2 font-bold align-top">{idx + 1}</td>
                      <td className="py-2.5 px-2 align-top">
                        <p className="font-black text-black">{ev.fileName}</p>
                        <p className="text-[11px] text-gray-700 mt-0.5">{ev.description}</p>
                        {isVideo && (
                          <div className="mt-1.5 p-1.5 bg-amber-100 border border-amber-400 text-amber-950 font-black text-[10px] rounded inline-block">
                            📹 CCTV / Video File: {ev.fileName} — <strong>Go to the website and watch the video</strong>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 font-bold text-gray-900 align-top">{ev.fileType}</td>
                      <td className="py-2.5 px-2 align-top">{ev.uploadedBy}<br /><span className="text-[10px] text-gray-600">({ev.uploadedByRole})</span></td>
                      <td className="py-2.5 px-2 font-mono text-[11px] align-top">{ev.uploadedAt}<br />{ev.fileSize}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-500 italic p-4 border border-dashed border-gray-300 rounded text-center">
              No evidence files recorded for this case dossier yet.
            </p>
          )}
        </div>

        {/* Separate Page Break for Each Uploaded Evidence Photo */}
        {c.evidence.filter(ev => ev.url || ev.fileType === 'Image').map((ev, pIdx) => (
          <div key={`print-photo-page-${ev.id}`} className="page-break pt-8">
            <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black uppercase text-black">EVIDENCE ATTACHMENT PHOTO PAGE #{pIdx + 1}</h2>
                <p className="text-xs font-bold text-gray-700">CASE ID: {c.id} • {c.title}</p>
              </div>
              <span className="text-xs font-mono font-black bg-black text-white px-3 py-1 rounded">PHOTO RECORD EXCLUSION</span>
            </div>

            <div className="mb-4 p-3 border border-gray-300 rounded bg-gray-50 text-xs grid grid-cols-2 gap-3">
              <div>
                <p className="font-bold text-gray-600 text-[10px] uppercase">Photo Name / Title:</p>
                <p className="font-black text-black">{ev.fileName}</p>
              </div>
              <div>
                <p className="font-bold text-gray-600 text-[10px] uppercase">Uploaded By Officer:</p>
                <p className="font-semibold text-black">{ev.uploadedBy} ({ev.uploadedByRole})</p>
              </div>
              <div>
                <p className="font-bold text-gray-600 text-[10px] uppercase">Timestamp & File Size:</p>
                <p className="font-mono text-black">{ev.uploadedAt} ({ev.fileSize})</p>
              </div>
              <div>
                <p className="font-bold text-gray-600 text-[10px] uppercase">Notes / Description:</p>
                <p className="text-black font-medium">{ev.description}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border-2 border-black rounded-lg bg-white my-4">
              {ev.url ? (
                <img
                  src={ev.url}
                  alt={ev.fileName}
                  className="max-h-[680px] max-w-full object-contain rounded shadow"
                />
              ) : (
                <div className="p-16 text-center text-gray-500 font-bold border border-dashed border-gray-400 rounded-lg w-full">
                  [Photo file attached on system portal: {ev.fileName}]
                </div>
              )}
            </div>
            <p className="text-center text-[10px] font-mono text-gray-500 uppercase mt-4">
              Official Evidence Exhibit Photo Document • State Crime Matrix Portal
            </p>
          </div>
        ))}
      </div>

      {/* Case Suspect Modal */}
      {showSuspectModal && (
        <CaseSuspectModal
          c={c}
          isOpen={showSuspectModal}
          onClose={() => setShowSuspectModal(false)}
          suspects={suspects}
          currentUser={currentUser}
          onManageCaseSuspects={onManageCaseSuspects || (() => {})}
          onCreateSuspect={onCreateSuspect || (() => {})}
          onUpdateSuspect={onUpdateSuspect || (() => {})}
          themeMode={themeMode}
        />
      )}

      {/* AI Evidentiary Gap Detector Modal */}
      {showGapDetector && (
        <CaseEvidentiaryGapDetectorModal
          c={c}
          isOpen={showGapDetector}
          onClose={() => setShowGapDetector(false)}
          allCases={allCases.length > 0 ? allCases : [c]}
          themeMode={themeMode}
          suspects={suspects}
          onOpenUploadEvidence={(prefillTitle, prefillNotes) => {
            if (prefillTitle) setFileName(prefillTitle);
            if (prefillNotes) {
              setDescription(prefillNotes);
              setNotes(prefillNotes);
            }
            setShowUploadForm(true);
            setShowGapDetector(false);
          }}
          onCatalogAddressedGap={(gapTitle, note) => {
            const newEv: EvidenceFile = {
              id: `ev-${Date.now()}`,
              caseId: c.id,
              fileName: `Requisition: ${gapTitle}`,
              fileType: 'Document',
              description: note || `Addressed evidentiary gap: ${gapTitle}`,
              notes: 'Statutory compliance requisition under BNSS / BSA framework.',
              uploadedBy: currentUser.fullName,
              uploadedByRole: currentUser.role,
              uploadedAt: new Date().toLocaleString(),
              fileSize: '1.2 MB',
            };
            onUploadEvidence(c.id, newEv);
          }}
        />
      )}

      {/* Case Team Chat Modal for Assigned Members */}
      {showChatModal && (
        <CaseTeamChatModal
          c={c}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          currentUser={currentUser}
          themeMode={themeMode}
        />
      )}

      {/* Case Investigation Link & Entity Network Graph Modal */}
      {showNetworkGraphModal && (
        <CaseNetworkGraphModal
          c={c}
          isOpen={showNetworkGraphModal}
          onClose={() => setShowNetworkGraphModal(false)}
          themeMode={themeMode}
          suspects={suspects}
        />
      )}

      {/* Full Size Evidence Photo Viewer Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-yellow-500/40 rounded-2xl overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-black text-yellow-400 font-mono truncate mr-2">{previewModalUrl.title}</h4>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-auto rounded-xl bg-black/60 p-2">
              {previewModalUrl.url.toLowerCase().endsWith('.mp4') || previewModalUrl.url.toLowerCase().endsWith('.webm') || previewModalUrl.url.toLowerCase().endsWith('.mov') ? (
                <video src={previewModalUrl.url} controls autoPlay className="max-h-[65vh] object-contain rounded-lg" />
              ) : (
                <img src={previewModalUrl.url} alt={previewModalUrl.title} className="max-h-[65vh] object-contain rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* CCTV / Video Player Pop-up Modal Window */}
      {previewVideoModal && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-slate-950 border-2 border-yellow-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-yellow-500/20 shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest">
                      CCTV SURVEILLANCE FEED • RECORDING EXHIBIT
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white font-mono truncate max-w-md sm:max-w-xl">
                    {previewVideoModal.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewVideoModal(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player Container with Authentic Surveillance Overlay */}
            <div className="relative bg-black flex items-center justify-center flex-1 min-h-[300px] max-h-[68vh] overflow-hidden group">
              <video
                src={previewVideoModal.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[68vh] object-contain bg-black"
              >
                Your browser does not support HTML5 video streaming.
              </video>

              {/* Watermark / Digital Evidence Badge in Top Left */}
              <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-0.5 bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded border border-white/10 font-mono text-[10px] text-emerald-400 select-none">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="font-black text-white">CAM-02 [VAULT CORRIDOR]</span>
                </div>
                <div className="text-[9px] text-slate-300">SEC-63 BSA CERTIFIED • 30 FPS</div>
              </div>
            </div>

            {/* Modal Footer with Metadata */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                {previewVideoModal.notes && (
                  <p className="text-xs text-amber-300 font-medium truncate">
                    <strong className="text-yellow-400 font-bold">Observation Notes: </strong>
                    {previewVideoModal.notes}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Uploaded by: <strong className="text-slate-200">{previewVideoModal.uploadedBy || 'Investigating Officer'}</strong> {previewVideoModal.uploadedByRole ? `(${previewVideoModal.uploadedByRole})` : ''} • {previewVideoModal.uploadedAt || 'Cataloged'}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <a
                  href={previewVideoModal.url}
                  download={previewVideoModal.title}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Clip</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewVideoModal(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-black transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

