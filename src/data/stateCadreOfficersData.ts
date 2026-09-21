export interface DistrictLevelOfficerCard {
  id: string;
  name: string;
  district: string;
  photoUrl: string;
  badgeId: string;
  designation: string;
  phone: string;
  email: string;
}

export interface SubdivisionLevelOfficerCard {
  id: string;
  name: string;
  district: string;
  talukas: string[];
  photoUrl: string;
  badgeId: string;
  designation: string;
  phone: string;
  email: string;
}

// 3 Mock District Level Officers as requested
export const MOCK_DISTRICT_LEVEL_OFFICERS: DistrictLevelOfficerCard[] = [
  {
    id: 'dlo-solapur-1',
    name: 'Shri Rajesh Deshmukh, IAS',
    district: 'Solapur',
    badgeId: 'DLO-SOL-001',
    designation: 'District Magistrate & Collector',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98220 11442',
    email: 'dm.solapur@maharashtra.gov.in',
  },
  {
    id: 'dlo-jalna-2',
    name: 'Dr. Shrikant Jivtode, IPS',
    district: 'Jalna',
    badgeId: 'DLO-JAL-002',
    designation: 'Superintendent of Police (SP)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98220 22553',
    email: 'sp.jalna@mahapolice.gov.in',
  },
  {
    id: 'dlo-kolhapur-3',
    name: 'Smt. Rekha Sharma, IAS',
    district: 'Kolhapur',
    badgeId: 'DLO-KOL-003',
    designation: 'District Magistrate & Collector',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98220 33664',
    email: 'dm.kolhapur@maharashtra.gov.in',
  },
];

// All 36 Districts of Maharashtra with top 3: Solapur, Jalna, Kolhapur
export const MAHARASHTRA_36_DISTRICTS: string[] = [
  // Main 3 displayed at top
  'Solapur',
  'Jalna',
  'Kolhapur',
  // Remaining 33 districts
  'Ahmednagar (Ahilyanagar)',
  'Akola',
  'Amravati',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Chhatrapati Sambhajinagar (Aurangabad)',
  'Dhule',
  'Dharashiv (Osmanabad)',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Latur',
  'Mumbai City',
  'Mumbai Suburban',
  'Nagpur',
  'Nanded',
  'Nandurbar',
  'Nashik',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
];

// Subdivision Level Officers for Solapur: 11 talukas in 3, 2, 2, 2, 2 format
// Talukas: Akkalkot, Barshi, Karmala, Madha, Malshiras, Mangalvedha, Mohol, Pandharpur, Sangole, Solapur North, Solapur South
export const SOLAPUR_SUBDIVISION_OFFICERS: SubdivisionLevelOfficerCard[] = [
  {
    id: 'sdpo-sol-1',
    name: 'Shri Vijay Mane, MCS',
    district: 'Solapur',
    talukas: ['Akkalkot', 'Barshi', 'Karmala'],
    badgeId: 'SDPO-SOL-01',
    designation: 'Sub-Divisional Magistrate (SDM)',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98231 10101',
    email: 'sdm.barshi@solapur.gov.in',
  },
  {
    id: 'sdpo-sol-2',
    name: 'Smt. Anjali Gaikwad, DySP',
    district: 'Solapur',
    talukas: ['Madha', 'Malshiras'],
    badgeId: 'SDPO-SOL-02',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98231 20202',
    email: 'sdpo.madha@solapur.gov.in',
  },
  {
    id: 'sdpo-sol-3',
    name: 'Shri Santosh Kadam, SDPO',
    district: 'Solapur',
    talukas: ['Mangalvedha', 'Mohol'],
    badgeId: 'SDPO-SOL-03',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98231 30303',
    email: 'sdpo.mohol@solapur.gov.in',
  },
  {
    id: 'sdpo-sol-4',
    name: 'Shri Pravin Patil, DySP',
    district: 'Solapur',
    talukas: ['Pandharpur', 'Sangole'],
    badgeId: 'SDPO-SOL-04',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98231 40404',
    email: 'sdpo.pandharpur@solapur.gov.in',
  },
  {
    id: 'sdpo-sol-5',
    name: 'Smt. Neeta Shinde, MCS',
    district: 'Solapur',
    talukas: ['Solapur North', 'Solapur South'],
    badgeId: 'SDPO-SOL-05',
    designation: 'Sub-Divisional Magistrate (SDM - Urban)',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98231 50505',
    email: 'sdm.solapur.city@solapur.gov.in',
  },
];

// Subdivision Level Officers for Jalna: 8 talukas in 2, 2, 2, 2 format
// Talukas: Ambad, Badnapur, Bhokardan, Ghansawangi, Jafrabad, Jalna, Mantha, Partur
export const JALNA_SUBDIVISION_OFFICERS: SubdivisionLevelOfficerCard[] = [
  {
    id: 'sdpo-jal-1',
    name: 'Shri Ganesh Pawar, DySP',
    district: 'Jalna',
    talukas: ['Ambad', 'Badnapur'],
    badgeId: 'SDPO-JAL-01',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98232 10101',
    email: 'sdpo.ambad@jalna.gov.in',
  },
  {
    id: 'sdpo-jal-2',
    name: 'Smt. Sunita Bhosale, MCS',
    district: 'Jalna',
    talukas: ['Bhokardan', 'Ghansawangi'],
    badgeId: 'SDPO-JAL-02',
    designation: 'Sub-Divisional Magistrate (SDM)',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98232 20202',
    email: 'sdm.bhokardan@jalna.gov.in',
  },
  {
    id: 'sdpo-jal-3',
    name: 'Shri Nitin Jadhav, SDPO',
    district: 'Jalna',
    talukas: ['Jafrabad', 'Jalna'],
    badgeId: 'SDPO-JAL-03',
    designation: 'Sub-Divisional Police Officer (SDPO - Sadar)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98232 30303',
    email: 'sdpo.jalna@jalna.gov.in',
  },
  {
    id: 'sdpo-jal-4',
    name: 'Shri Deepak Solanke, DySP',
    district: 'Jalna',
    talukas: ['Mantha', 'Partur'],
    badgeId: 'SDPO-JAL-04',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98232 40404',
    email: 'sdpo.partur@jalna.gov.in',
  },
];

// Subdivision Level Officers for Kolhapur: 12 talukas in 2, 2, 2, 2, 2, 2 format
// Talukas: Shahuwadi, Panhala, Hatkanangale, Shirol, Karveer, Gaganbavada, Radhanagari, Kagal, Bhudargad, Ajara, Gadhinglaj, Chandgad
export const KOLHAPUR_SUBDIVISION_OFFICERS: SubdivisionLevelOfficerCard[] = [
  {
    id: 'sdpo-kol-1',
    name: 'Shri Suhas Kamble, DySP',
    district: 'Kolhapur',
    talukas: ['Shahuwadi', 'Panhala'],
    badgeId: 'SDPO-KOL-01',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98233 10101',
    email: 'sdpo.panhala@kolhapur.gov.in',
  },
  {
    id: 'sdpo-kol-2',
    name: 'Smt. Vandana Salunkhe, MCS',
    district: 'Kolhapur',
    talukas: ['Hatkanangale', 'Shirol'],
    badgeId: 'SDPO-KOL-02',
    designation: 'Sub-Divisional Magistrate (SDM)',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98233 20202',
    email: 'sdm.shirol@kolhapur.gov.in',
  },
  {
    id: 'sdpo-kol-3',
    name: 'Shri Abhijit More, SDPO',
    district: 'Kolhapur',
    talukas: ['Karveer', 'Gaganbavada'],
    badgeId: 'SDPO-KOL-03',
    designation: 'Sub-Divisional Police Officer (SDPO - Karveer)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98233 30303',
    email: 'sdpo.karveer@kolhapur.gov.in',
  },
  {
    id: 'sdpo-kol-4',
    name: 'Shri Mahendra Desai, DySP',
    district: 'Kolhapur',
    talukas: ['Radhanagari', 'Kagal'],
    badgeId: 'SDPO-KOL-04',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98233 40404',
    email: 'sdpo.kagal@kolhapur.gov.in',
  },
  {
    id: 'sdpo-kol-5',
    name: 'Smt. Swati Kulkarni, MCS',
    district: 'Kolhapur',
    talukas: ['Bhudargad', 'Ajara'],
    badgeId: 'SDPO-KOL-05',
    designation: 'Sub-Divisional Magistrate (SDM)',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98233 50505',
    email: 'sdm.ajara@kolhapur.gov.in',
  },
  {
    id: 'sdpo-kol-6',
    name: 'Shri Rohan Sawant, SDPO',
    district: 'Kolhapur',
    talukas: ['Gadhinglaj', 'Chandgad'],
    badgeId: 'SDPO-KOL-06',
    designation: 'Sub-Divisional Police Officer (SDPO)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    phone: '+91 98233 60606',
    email: 'sdpo.gadhinglaj@kolhapur.gov.in',
  },
];
