import { Case, Suspect } from '../types';
import { formatHearingDateTime } from './courtHearingUtils';

export interface CaseAiSummaryPoint {
  id: string;
  label: string;
  text: string;
}

export function getCaseInvestigationProgressPercentage(c: Case): number {
  try {
    const savedProg = localStorage.getItem(`investigation_progress_${c.id}`);
    if (savedProg) {
      const items = JSON.parse(savedProg);
      const completed = items.filter((i: { completed: boolean }) => i.completed).length;
      return Math.round((completed / items.length) * 100);
    }
  } catch {
    // ignore
  }

  return c.status === 'Solved'
    ? 100
    : c.status === 'Under Investigation'
    ? 65
    : c.status === 'Active'
    ? 50
    : 20;
}

export function generateCaseAiSummaryPoints(c: Case, linkedSuspects: Suspect[] = []): CaseAiSummaryPoint[] {
  const progressPercentage = getCaseInvestigationProgressPercentage(c);

  const hearingStr = c.courtHearingDate
    ? `${formatHearingDateTime(c.courtHearingDate)} at ${
        c.courtHearingLocation || 'Sessions Court'
      }${c.courtHearingNotes ? ` (${c.courtHearingNotes.slice(0, 55)}...)` : ''}`
    : 'Hearing date pending chargesheet submission';

  const suspectsStr =
    linkedSuspects.length > 0
      ? `${linkedSuspects.length} suspect(s) linked: ${linkedSuspects
          .map((s) => `${s.fullName} [${s.status}]`)
          .join(', ')}`
      : 'No suspects formally linked to dossier';

  const evidenceTypes = Array.from(new Set((c.evidence || []).map((e) => e.fileType)));
  const evidenceStr =
    c.evidence && c.evidence.length > 0
      ? `${c.evidence.length} exhibit(s) secured (${
          evidenceTypes.length > 0 ? evidenceTypes.join(', ') : 'Verified files'
        })`
      : 'Awaiting lab evidence & forensic exhibits';

  const cleanDescription = c.description
    ? c.description.trim().replace(/\s+/g, ' ')
    : 'Incident details under official police inquiry.';

  const points: CaseAiSummaryPoint[] = [
    {
      id: 'incident',
      label: 'Incident Nature',
      text: `${c.crimeType} — ${cleanDescription}`,
    },
    {
      id: 'location',
      label: 'Scene of Crime',
      text: `${c.location}${c.taluka ? ` (Taluka: ${c.taluka})` : ''}`,
    },
    {
      id: 'status',
      label: 'Status & Urgency',
      text: `${c.status} status with ${c.priority} priority classification.`,
    },
    {
      id: 'parties',
      label: 'Victim & Witness',
      text: `Victim: ${c.victimName || 'Reported on record'}${
        c.witnessName ? ` • Key Witness: ${c.witnessName}` : ''
      }.`,
    },
    {
      id: 'command',
      label: 'Lead Authority',
      text: `Lead: ${c.assignedHostName || 'Police Command'}${
        c.assignedOfficerNames && c.assignedOfficerNames.length > 0
          ? ` assisted by ${c.assignedOfficerNames.join(', ')}`
          : ''
      }.`,
    },
    {
      id: 'suspects',
      label: 'Accused Profile',
      text: suspectsStr,
    },
    {
      id: 'evidence',
      label: 'Evidence Secured',
      text: evidenceStr,
    },
    {
      id: 'hearing',
      label: 'Court Schedule',
      text: hearingStr,
    },
    {
      id: 'progress',
      label: 'Current Progress',
      text: `${progressPercentage}% investigation completed — ${
        c.status === 'Solved'
          ? 'Final report submitted to court.'
          : 'Forensic ballistics and chargesheet filing in progress.'
      }`,
    },
  ];

  if (c.assignedDistrictOfficerName || c.assignedSubdivisionOfficerName) {
    points.push({
      id: 'oversight',
      label: 'Command Oversight',
      text: c.assignedDistrictOfficerName
        ? `Monitored under District Authority (${c.assignedDistrictOfficerName}).`
        : `Monitored under Subdivisional Authority (${c.assignedSubdivisionOfficerName}).`,
    });
  }

  return points;
}
