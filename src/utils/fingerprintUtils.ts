import { Suspect } from '../types';

export type FingerprintPatternType =
  | 'Plain Whorl'
  | 'Ulnar Loop'
  | 'Radial Loop'
  | 'Plain Arch'
  | 'Tented Arch'
  | 'Double Loop Whorl'
  | 'Central Pocket Whorl';

export interface MinutiaePoint {
  id: string;
  x: number; // percentage 10-90
  y: number; // percentage 10-90
  type: 'bifurcation' | 'ridge_ending' | 'core' | 'delta';
  angle: number; // degrees
}

export interface SuspectFingerprintRecord {
  suspectId: string;
  suspectName: string;
  fingerprintId: string;
  finger: string; // e.g. "Right Thumb (Digit 1)"
  patternType: FingerprintPatternType;
  ridgeCount: number;
  minutiaeCount: number;
  qualityScore: number;
  biometricHash: string;
  deltaCount: number;
  coreCount: number;
  registeredDate: string;
  minutiaePoints: MinutiaePoint[];
}

export interface LatentEvidencePrint {
  id: string;
  name: string;
  source: string;
  capturedAt: string;
  caseId?: string;
  targetSuspectId: string | null; // null if no match in database
  imageUrl?: string;
  patternHint: FingerprintPatternType;
  qualityScore: number;
  notes: string;
}

// Generate deterministic hash string from any text
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic Minutiae Generator for suspect
export function generateMinutiaePoints(seedStr: string, count: number = 28): MinutiaePoint[] {
  const seed = simpleHash(seedStr);
  const points: MinutiaePoint[] = [];

  // Core point
  points.push({
    id: `core-1`,
    x: 50 + ((seed % 7) - 3),
    y: 46 + (((seed >> 2) % 7) - 3),
    type: 'core',
    angle: 90,
  });

  // Delta points
  points.push({
    id: `delta-1`,
    x: 28 + ((seed % 5) - 2),
    y: 72 + (((seed >> 1) % 5) - 2),
    type: 'delta',
    angle: 45,
  });

  points.push({
    id: `delta-2`,
    x: 72 + (((seed >> 3) % 5) - 2),
    y: 74 + (((seed >> 4) % 5) - 2),
    type: 'delta',
    angle: 135,
  });

  const types: ('bifurcation' | 'ridge_ending')[] = ['bifurcation', 'ridge_ending', 'bifurcation'];

  for (let i = 0; i < count; i++) {
    const pSeed = simpleHash(`${seedStr}-minutiae-${i}`);
    // Radius from center 15% to 40%
    const angleRad = ((pSeed % 360) * Math.PI) / 180;
    const dist = 14 + (pSeed % 28);
    const x = Math.round(50 + Math.cos(angleRad) * dist * 0.9);
    const y = Math.round(50 + Math.sin(angleRad) * dist * 1.1);

    // Keep within bounds
    const clampedX = Math.max(16, Math.min(84, x));
    const clampedY = Math.max(18, Math.min(86, y));

    points.push({
      id: `pt-${i}`,
      x: clampedX,
      y: clampedY,
      type: types[pSeed % types.length],
      angle: pSeed % 360,
    });
  }

  return points;
}

// Map suspect to mock fingerprint record
export function getSuspectFingerprint(suspect: Suspect): SuspectFingerprintRecord {
  const seed = simpleHash(suspect.id);

  const patterns: FingerprintPatternType[] = [
    'Plain Whorl',
    'Double Loop Whorl',
    'Ulnar Loop',
    'Radial Loop',
    'Central Pocket Whorl',
    'Tented Arch',
    'Plain Arch',
  ];

  const fingers = [
    'Right Thumb (R1)',
    'Right Index (R2)',
    'Right Middle (R3)',
    'Left Thumb (L1)',
    'Left Index (L2)',
  ];

  const patternType = suspect.fingerprintPattern
    ? (suspect.fingerprintPattern as FingerprintPatternType)
    : patterns[seed % patterns.length];

  const ridgeCount = suspect.fingerprintRidgeCount || 14 + (seed % 9);
  const minutiaeCount = suspect.fingerprintMinutiaePoints || 26 + (seed % 16);
  const qualityScore = 92 + (seed % 8);

  const hexHash = Array.from({ length: 8 })
    .map((_, idx) => ((seed * (idx + 1) * 31) % 65535).toString(16).padStart(4, '0'))
    .join(':')
    .toUpperCase();

  const isWhorl = patternType.includes('Whorl');
  const deltaCount = isWhorl ? 2 : patternType.includes('Arch') ? 0 : 1;
  const coreCount = isWhorl && patternType.includes('Double') ? 2 : 1;

  const minutiaePoints = generateMinutiaePoints(suspect.id, minutiaeCount);

  return {
    suspectId: suspect.id,
    suspectName: suspect.fullName,
    fingerprintId: suspect.fingerprintId || `FP-AFIS-${suspect.id}-01`,
    finger: fingers[seed % fingers.length],
    patternType,
    ridgeCount,
    minutiaeCount,
    qualityScore,
    biometricHash: `AFIS-SHA256:${hexHash}`,
    deltaCount,
    coreCount,
    registeredDate: '2026-03-12',
    minutiaePoints,
  };
}

// Built-in Latent Crime Scene Evidence Prints for immediate testing
export const initialEvidenceSamples: LatentEvidencePrint[] = [
  {
    id: 'LATENT-BANK-VAULT-8942',
    name: 'Crime Scene Latent #1 — Vault Safe Surface',
    source: 'Karmala Bank Vault (Case CR-2026-8942)',
    capturedAt: '15 Aug 2026, 02:40 AM',
    caseId: 'CR-2026-8942',
    targetSuspectId: 'SUS-5501', // Matches Pandurang "Gavthi" Jadhav
    patternHint: 'Plain Whorl',
    qualityScore: 96,
    notes: 'Lifted with black magnetic powder from primary electronic safe combination dial.',
  },
  {
    id: 'LATENT-SERVER-HUB-9104',
    name: 'Crime Scene Latent #2 — Chemical Storage Facility Console',
    source: 'Barshi MIDC Terminal Console (Case CR-2026-9104)',
    capturedAt: '22 Jul 2026, 03:15 PM',
    caseId: 'CR-2026-9104',
    targetSuspectId: 'SUS-5601', // Matches Sachin "Viper" Gaikwad
    patternHint: 'Double Loop Whorl',
    qualityScore: 94,
    notes: 'Recovered using cyanoacrylate fuming from master terminal console keypad.',
  },
  {
    id: 'LATENT-PORT-DOCKS-7731',
    name: 'Crime Scene Latent #3 — Railway Freight Yard Latch',
    source: 'Kurduvadi Railway Goods Shed (Case CR-2026-7731)',
    capturedAt: '10 Jun 2026, 10:15 AM',
    caseId: 'CR-2026-7731',
    targetSuspectId: 'SUS-5701', // Matches Ganesh "Bhaiya" Kale
    patternHint: 'Ulnar Loop',
    qualityScore: 91,
    notes: 'Ninhydrin developed print on freight wagon security padlock.',
  },
  {
    id: 'LATENT-APEX-FIN-6119',
    name: 'Crime Scene Latent #4 — Canal Pump Substation Lever',
    source: 'Bhimanagar Irrigation Pump Station (Case CR-2026-6119)',
    capturedAt: '04 May 2026, 12:30 PM',
    caseId: 'CR-2026-6119',
    targetSuspectId: 'SUS-5704', // Matches Laxman "Driver" Waghmare
    patternHint: 'Central Pocket Whorl',
    qualityScore: 95,
    notes: 'Laser fluorescence detection on stolen transformer intake housing.',
  },
  {
    id: 'LATENT-COLD-CASE-UNKNOWN',
    name: 'Crime Scene Latent #5 — Broken Escape Window Glass',
    source: 'Unresolved Alleyway Burglary (Latent Trace #994)',
    capturedAt: '02 Sep 2026, 11:20 PM',
    targetSuspectId: null, // DOES NOT MATCH ANY SUSPECT IN DATABASE -> "No match"!
    patternHint: 'Tented Arch',
    qualityScore: 88,
    notes: 'Unidentified latent print collected from shattered perimeter glass. Not matched to any current suspect.',
  },
];
