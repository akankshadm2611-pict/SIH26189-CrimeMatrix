import { CrimeHotspot } from '../types';

/**
 * Dynamic JSON Array for Crime Hotspot Locations
 * Located in Solapur District (Karmala, Barshi, Madha) and Metro areas.
 */
export const initialCrimeHotspots: CrimeHotspot[] = [
  {
    id: 'hs-solapur-karmala',
    areaName: 'Karmala Bypass & Highway Transport Corridor',
    severity: 'High',
    crimeIndex: 88,
    totalCases: 48,
    mostCommonCrime: 'Armed Robbery & Freight Hijacking',
    lastUpdated: '2026-08-11 10:30',
    center: [18.412, 75.195],
    radiusMeters: 1000,
    polygonCoords: [
      [18.418, 75.188],
      [18.421, 75.202],
      [18.406, 75.205],
      [18.404, 75.189],
    ],
  },
  {
    id: 'hs-solapur-barshi',
    areaName: 'Barshi APMC Market & MIDC Agro-Chemical Hub',
    severity: 'High',
    crimeIndex: 82,
    totalCases: 54,
    mostCommonCrime: 'APMC Extortion & Chemical Sabotage',
    lastUpdated: '2026-08-15 14:15',
    center: [18.233, 75.694],
    radiusMeters: 950,
    polygonCoords: [
      [18.239, 75.688],
      [18.242, 75.701],
      [18.226, 75.703],
      [18.225, 75.689],
    ],
  },
  {
    id: 'hs-solapur-madha',
    areaName: 'Kurduvadi Railway Junction & Freight Yard, Madha',
    severity: 'Medium',
    crimeIndex: 64,
    totalCases: 38,
    mostCommonCrime: 'Railway Freight Burglary & Transformer Theft',
    lastUpdated: '2026-08-18 09:30',
    center: [18.083, 75.433],
    radiusMeters: 900,
    polygonCoords: [
      [18.089, 75.426],
      [18.092, 75.441],
      [18.076, 75.443],
      [18.075, 75.428],
    ],
  },
  {
    id: 'hs-solapur-central',
    areaName: 'Solapur District Central Commercial Zone',
    severity: 'Medium',
    crimeIndex: 58,
    totalCases: 42,
    mostCommonCrime: 'Commercial Fraud & Theft',
    lastUpdated: '2026-08-12 16:45',
    center: [17.6599, 75.9064],
    radiusMeters: 850,
    polygonCoords: [
      [17.666, 75.900],
      [17.668, 75.914],
      [17.652, 75.915],
      [17.651, 75.901],
    ],
  },
  {
    id: 'hs-101',
    areaName: 'Downtown Central Financial Sector',
    severity: 'High',
    crimeIndex: 88,
    totalCases: 142,
    mostCommonCrime: 'Armed Robbery & Bank Heist',
    lastUpdated: '2026-08-05 18:30',
    center: [18.922, 72.8346],
    radiusMeters: 900,
    polygonCoords: [
      [18.928, 72.828],
      [18.931, 72.839],
      [18.918, 72.842],
      [18.914, 72.832],
    ],
  },
];
