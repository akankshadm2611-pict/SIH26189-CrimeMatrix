export type UserRole = 'DSP' | 'Host' | 'Police Officer' | 'Subdivision Level' | 'District Level' | 'State Govt' | 'Victim' | 'Advocate';

export type UserStatus = 'Approved' | 'Pending' | 'Rejected';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  phone: string;
  department: string;
  badgeId: string;
  badgeNumber?: string;
  status: UserStatus;
  avatarUrl?: string;
  registeredAt?: string;
  approvedBy?: string;
  assignedCases?: string[];
  password?: string;
  designation?: string;
  experience?: string;
  state?: string;
  district?: string;
  talukas?: string[];
  taluka?: string;
  dateOfJoining?: string;
  posting?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  dob?: string;
  gender?: string;
  residentialAddress?: string;
  irisScanVerified?: boolean;
  photoUrl?: string;
  idProofType?: string;
  idProofUrl?: string;
  serviceIdUrl?: string;
}

export interface RegistrationRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  bloodGroup?: string;
  role: UserRole;
  department: string;
  badgeId: string;
  experience: string;
  designation: string;
  username: string;
  idProofName: string;
  idProofUrl?: string;
  serviceIdName: string;
  serviceIdUrl?: string;
  submittedAt: string;
  status: UserStatus;
  assignedToRole: 'DSP' | 'Host'; // DSP gets Host & DSP requests; Host gets Police, Victim & Advocate requests
  state?: string;
  district?: string;
  talukas?: string[];
  taluka?: string;
}

export type CrimeType = 'Cyber Crime' | 'Homicide' | 'Armed Robbery' | 'Narcotics' | 'Fraud' | 'Kidnapping' | 'Human Trafficking' | 'Burglary' | 'Other' | (string & {});

export type CaseStatus = 'Active' | 'Solved' | 'Pending' | 'Under Investigation';

export interface EvidenceFile {
  id: string;
  caseId: string;
  fileName: string;
<<<<<<< HEAD
  fileType: 'Document' | 'Image' | 'Audio' | 'Video' | 'Forensic';
=======
  fileType: 'Document' | 'Image' | 'Audio' | 'Video';
>>>>>>> aa42170 (CrimeMtrix1)
  description: string;
  uploadedBy: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  fileSize: string;
  url?: string;
  notes?: string;
}

export interface TimelineEntry {
  id: string;
  timestamp: string; // e.g. "10 Aug 2026, 09:30 AM"
  title: string; // e.g. "Case Registered", "Crime Scene Visited"
  description: string; // e.g. "Complaint received and case officially created."
  performerName: string; // e.g. "Inspector Sharma"
  performerRole?: string; // e.g. "Police Officer", "Host Inspector", "DSP"
  statusTag?: 'Completed' | 'In Progress' | 'Pending' | string;
  suspectId?: string;
  suspectName?: string;
}

export interface Case {
  id: string; // Unique Case ID e.g. CR-2026-8942
  title?: string; // Optional case title alias
  crimeCategory?: string; // Optional crime category alias
  crimeType: CrimeType;
  dateAssigned: string;
  caseName: string;
  victimName: string; // Compulsory Victim Name
  victimId?: string; // Optional linked victim user id
  victimUsername?: string; // Optional linked victim username
  witnessName?: string; // Optional Witness Name
  location: string; // Incident location / address e.g. "Downtown Central Financial Sector, Metro City"
  coordinates?: [number, number]; // Lat, Lng e.g. [18.922, 72.8346]
  description: string;
  status: CaseStatus;
  assignedHostId: string; // DSP assigns Host
  assignedHostName: string;
  assignedOfficerIds: string[]; // Host adds officers
  assignedOfficerNames: string[];
  assignedAdvocateIds: string[]; // Host adds advocates
  assignedAdvocateNames: string[];
  evidence: EvidenceFile[];
  createdAt: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  timeline?: TimelineEntry[];
  suspects?: any;
  courtHearingDate?: string; // e.g. "2026-09-18T10:30"
  courtHearingLocation?: string; // e.g. "Sessions Court Room 4B"
  courtHearingNotes?: string; // Target work & evidence presentation deadline notes
  courtHearingUpdatedBy?: string; // e.g. "Sub-Inspector Vikram Sharma"
  courtHearingUpdatedAt?: string;
  assignedSubdivisionOfficerId?: string; // DSP assigns to Subdivision Level Officer
  assignedSubdivisionOfficerName?: string;
  subdivisionTaluka?: string;
  subdivisionStation?: string;
  subdivisionNotes?: string;
  subdivisionEscalatedAt?: string;
  taluka?: string; // Taluka jurisdiction where incident occurred
  isMajorCase?: boolean; // Whether case is escalated/marked as Major Case
  subdivisionOfficerInCharge?: boolean; // When SDPO takes supervisory charge
  inChargeOfficerName?: string;
  isEscalatedToDistrict?: boolean; // Whether case is escalated to District Level
  assignedDistrictOfficerId?: string; // Assigned District Level Officer ID
  assignedDistrictOfficerName?: string; // Assigned District Level Officer Name
  district?: string; // District jurisdiction
  districtNotes?: string; // Description/notes provided for District Level escalation
  districtEscalatedAt?: string; // Escalation timestamp
  districtAccessMode?: 'updating' | 'view'; // Access mode for District Level officer
  firDetails?: Record<string, any>; // Full 18-section NCRB/BNSS Information Checklist details
  state?: string; // State jurisdiction e.g. Maharashtra
}

export type SuspectStatus = 'Wanted' | 'Under Arrest' | 'Missing' | 'On Bail' | 'Sentenced' | 'Under Investigation';

export interface SuspectNodeConnection {
  targetSuspectId: string;
  targetSuspectName: string;
  relationship: string; // e.g. "Co-accused in Cyber Syndicate", "Known Associate", "Gang Leader"
  caseId: string;
}

export interface Suspect {
  id: string; // Unique Suspect ID e.g. SUS-5501
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  crime: string;
  allegedCrime?: string;
  address: string;
  status: SuspectStatus;
  photoUrl: string;
  linkedCaseIds: string[];
  connectedSuspects: SuspectNodeConnection[];
  notes?: string;
  taluka?: string; // e.g. Downtown Central, Karmala, Barshi
  district?: string; // e.g. Metro District, Solapur
  state?: string; // e.g. Maharashtra
  fingerprintId?: string;
  fingerprintPattern?: string;
  fingerprintRidgeCount?: number;
  fingerprintMinutiaePoints?: number;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'Registration' | 'Evidence' | 'CaseAssigned' | 'General' | 'Directive';
  targetRole?: UserRole;
  relatedRequestId?: string;
  relatedCaseId?: string;
  read: boolean;
}

export interface CrimeDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyCrimeData {
  month: string;
  reported: number;
  resolved: number;
}

export type CrimeSeverity = 'High' | 'Medium' | 'Low';

export interface CrimeHotspot {
  id: string;
  areaName: string;
  severity: CrimeSeverity;
  crimeIndex: number;
  totalCases: number;
  mostCommonCrime: string;
  lastUpdated: string;
  center: [number, number];
  polygonCoords?: [number, number][];
  radiusMeters?: number;
}

export type ComplaintStatus = 'Pending' | 'Registered' | 'Fake' | 'Submitted' | 'Under Review' | 'FIR Registered';

export interface ComplaintData {
  id: string; // CMP-2026-XXXX
  surname: string;
  midName: string;
  firstName: string;
  fullName: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  taluka?: string;
  locationArea?: string;
  category: string;
  isEmergency: boolean;
  incidentDate: string; // DD/MM/YYYY
  incidentTime: string;
  incidentLocation: string;
  incidentDescription: string;
  estimatedLoss?: string;
  suspectInfo?: string;
  witnessInfo?: string;
  evidenceFiles: {
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
  submittedAt: string;
  status: ComplaintStatus;
  officerRemarks?: string;
  reviewedByOfficerName?: string;
  reviewedByOfficerId?: string;
  reviewedAt?: string;
  registeredCaseId?: string;
}
