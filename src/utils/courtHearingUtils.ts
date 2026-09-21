import { Case, User } from '../types';
import { isUserAssignedToCase } from './caseUtils';

export interface HearingCountdownResult {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  formattedShort: string;
  formattedFull: string;
  urgency: 'critical' | 'warning' | 'normal' | 'past';
}

/**
 * Calculates countdown details from now to the court hearing date.
 */
export function getHearingCountdown(hearingDateStr?: string): HearingCountdownResult | null {
  if (!hearingDateStr) return null;

  try {
    const targetDate = new Date(hearingDateStr).getTime();
    if (isNaN(targetDate)) return null;

    const now = Date.now();
    const diffMs = targetDate - now;

    if (diffMs <= 0) {
      return {
        isPast: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalHours: 0,
        formattedShort: 'Concluded / Past',
        formattedFull: 'Court Hearing Date Has Passed',
        urgency: 'past',
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

    let urgency: 'critical' | 'warning' | 'normal' = 'normal';
    if (totalHours <= 48) {
      urgency = 'critical';
    } else if (days <= 7) {
      urgency = 'warning';
    }

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);

    return {
      isPast: false,
      days,
      hours,
      minutes,
      seconds,
      totalHours,
      formattedShort: `In ${parts.join(' ')}`,
      formattedFull: `${days > 0 ? `${days} Days, ` : ''}${hours} Hours, ${minutes} Mins remaining`,
      urgency,
    };
  } catch {
    return null;
  }
}

/**
 * Formats a court hearing date into a human readable string.
 * e.g. "18 Sep 2026, 10:30 AM"
 */
export function formatHearingDateTime(hearingDateStr?: string): string {
  if (!hearingDateStr) return 'Not Scheduled';
  try {
    const d = new Date(hearingDateStr);
    if (isNaN(d.getTime())) return hearingDateStr;

    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return hearingDateStr;
  }
}

/**
 * Determines whether a user has permission to set/edit the court hearing.
 * - Police Officers connected to the case
 * - The Victim linked to the case
 * - Host assigned to the case
 * - DSP Authority
 */
export function canUserEditCourtHearing(currentUser: User | null | undefined, c: Case | null | undefined): boolean {
  if (!currentUser || !c) return false;
  if (c.status === 'Solved') return false; // Lock once solved

  if (currentUser.role === 'DSP' || currentUser.role === 'Subdivision Level') return true;
  if (currentUser.role === 'Host' && isUserAssignedToCase(currentUser, c)) return true;
  if (currentUser.role === 'Police Officer' && isUserAssignedToCase(currentUser, c)) return true;
  if (currentUser.role === 'Victim' && isUserAssignedToCase(currentUser, c)) return true;

  return false;
}
