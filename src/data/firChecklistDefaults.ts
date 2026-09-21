// NCRB-style FIR / IIF-I structure and BNSS framework initial states & sample data
export interface FirChecklistState {
  // 1. FIR / Police Station Details
  state: string;
  district: string;
  policeStation: string;
  firNumber: string;
  year: string;
  regDate: string;
  regTime: string;
  generalDiaryNo: string;
  infoReceivedDateTime: string;
  infoMode: 'Written' | 'Oral' | 'Electronic';

  // 2. Offence / Legal Provisions
  applicableAct: string;
  bnsSections: string;
  specialLawSections: string;
  subSectionClause: string;
  offenceCategory: string;

  // 3. Date, Time and Occurrence of Offence
  occurrenceDateFrom: string;
  occurrenceDateTo: string;
  occurrenceTimeFrom: string;
  occurrenceTimeTo: string;
  approxTime: string;
  isContinuingOffence: boolean;
  complainantAwarenessInfo: string;
  infoGivenToPoliceDateTime: string;

  // 4. Place of Occurrence
  exactAddress: string;
  houseBuildingNo: string;
  streetRoad: string;
  areaLocalityVillage: string;
  cityTown: string;
  placeDistrict: string;
  placeState: string;
  pinCode: string;
  nearestLandmark: string;
  jurisdictionPs: string;
  directionFromPs: string;
  distanceFromPs: string;
  beatChowkyOutpost: string;
  gpsCoordinates: string;

  // 5. Informant / Complainant Details
  informantFullName: string;
  informantParentOrSpouse: string;
  informantAgeDob: string;
  informantGender: string;
  informantNationality: string;
  informantOccupation: string;
  informantMobile: string;
  informantAltPhone: string;
  informantEmail: string;
  informantCurrentAddress: string;
  informantPermanentAddress: string;
  informantVillageCity: string;
  informantDistrict: string;
  informantState: string;
  informantPin: string;
  informantIdType: string;
  informantIdNumber: string;
  informantRelToVictim: string;
  informantRelToAccused: string;

  // 6. Victim / Person Aggrieved Details
  victimIsSameAsInformant: boolean;
  victimFullName: string;
  victimParentOrSpouse: string;
  victimAgeDob: string;
  victimGender: string;
  victimNationality: string;
  victimOccupation: string;
  victimMobile: string;
  victimEmail: string;
  victimCurrentAddress: string;
  victimPermanentAddress: string;
  victimIdDetails: string;
  victimRelToInformant: string;
  victimNatureOfLoss: string;
  victimMedicalDetails: string;

  // 7. Accused / Suspect / Unknown Person Details
  accusedFullName: string;
  accusedAlias: string;
  accusedParentOrSpouse: string;
  accusedApproxAge: string;
  accusedGender: string;
  accusedNationality: string;
  accusedOccupation: string;
  accusedCurrentAddress: string;
  accusedPermanentAddress: string;
  accusedMobile: string;
  accusedSocialOrEmail: string;
  accusedVehicleNumber: string;
  accusedPhysicalDesc: string;
  accusedHeightBuild: string;
  accusedComplexionHair: string;
  accusedClothing: string;
  accusedMarksTattoos: string;
  accusedPhotoCctvRef: string;
  accusedCount: string;

  // 8. Witness Details
  witnessFullName: string;
  witnessAge: string;
  witnessGender: string;
  witnessParentOrSpouse: string;
  witnessAddress: string;
  witnessMobile: string;
  witnessOccupation: string;
  witnessRelToVictim: string;
  witnessStatementKnowledge: string;
  witnessSupportingMaterial: string;

  // 9. Detailed Statement / Incident Narrative
  incidentNarrative: string;

  // 10. Property / Articles Involved
  propertyType: string;
  propertyDescription: string;
  propertyOwner: string;
  propertyMakeBrand: string;
  propertyModel: string;
  propertyColour: string;
  propertySerialNo: string;
  propertyImeiNo: string;
  propertyVehicleRegNo: string;
  propertyQuantity: string;
  propertyApproxValue: string;
  propertyDateLostStolen: string;
  propertyRecoveredStatus: 'Yes' | 'No' | 'Unknown';
  propertyRecoveryDetails: string;

  // 11. Evidence / Supporting Material
  evidenceTypes: string[];
  evidenceDescription: string;
  evidenceDateTimeObtained: string;

  // 12. Cyber / Digital Information
  cyberPhone: string;
  cyberEmail: string;
  cyberUsername: string;
  cyberPlatform: string;
  cyberWebsiteUrl: string;
  cyberBankDetails: string;
  cyberUpiId: string;
  cyberTransactionId: string;
  cyberTxnDateTime: string;
  cyberAmountInvolved: string;
  cyberDeviceType: string;
  cyberImei: string;
  cyberIpAddress: string;
  cyberScreenshotsOrExports: string;
  cyberOtherIdentifiers: string;

  // 13. Injury / Medical Details
  injuredPersonName: string;
  injuryDateTime: string;
  injuryDescription: string;
  treatmentPlace: string;
  hospitalName: string;
  mlcReportNo: string;
  doctorDetails: string;
  medicalDocsAttached: 'Yes' | 'No';
  fatalityOccurred: 'Yes' | 'No';

  // 14. Vehicle Details
  vehicleType: string;
  vehicleRegNo: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColour: string;
  vehicleOwnerName: string;
  vehicleDriverName: string;
  vehicleChassisNo: string;
  vehicleEngineNo: string;
  vehicleRoleInIncident: string;
  vehiclePhotoRef: string;

  // 15. Related / Previous Complaints or Cases
  prevComplaintNo: string;
  prevFirNo: string;
  prevPoliceStation: string;
  prevDistrictState: string;
  prevDate: string;
  prevIncidentNature: string;
  prevCaseRelationship: string;
  prevExistingDisputeThreat: string;
  prevConnectedReference: string;

  // 16. Police-Only / Registration Fields
  policeFirNo: string;
  policeLegalSections: string;
  policeGdRef: string;
  policeJurisdictionVerified: string;
  officerReceivingInfo: string;
  officerRegisteringFir: string;
  investigatingOfficerRankName: string;
  investigationCaseRefNo: string;
  actionTaken: string;
  transferPsInfo: string;
  arrestBailInfo: string;
  statutoryEntries: string;

  // 17. Informant Verification / Acknowledgement
  informantSignature: string;
  informantThumbImpression: boolean;
  informantAckDate: string;
  informantAckPlace: string;
  informantPreferredContact: string;
  firCopyReceivedByInformant: boolean;

  // 18. Police Officer Authentication
  officerAuthName: string;
  officerAuthRank: string;
  officerAuthBuckleId: string;
  officerAuthStation: string;
  officerAuthSignature: string;
  officerAuthDateTime: string;
  officialSealAffixed: boolean;
}

export const initialFirState: FirChecklistState = {
  state: 'Maharashtra',
  district: 'Metro District (South Zone)',
  policeStation: 'City Central Police Station',
  firNumber: `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
  year: '2026',
  regDate: new Date().toISOString().split('T')[0],
  regTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  generalDiaryNo: `GD-${Math.floor(100 + Math.random() * 900)}/2026`,
  infoReceivedDateTime: `${new Date().toISOString().split('T')[0]} 09:30`,
  infoMode: 'Written',

  applicableAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
  bnsSections: 'BNS Section 309(4) (Robbery with deadly weapon), Section 311 (Dacoity), Section 61 (Criminal Conspiracy)',
  specialLawSections: 'Arms Act Section 25, 27',
  subSectionClause: 'Clause 2 & 4',
  offenceCategory: 'Armed Robbery',

  occurrenceDateFrom: new Date().toISOString().split('T')[0],
  occurrenceDateTo: new Date().toISOString().split('T')[0],
  occurrenceTimeFrom: '09:15',
  occurrenceTimeTo: '10:00',
  approxTime: 'Around 09:30 AM',
  isContinuingOffence: false,
  complainantAwarenessInfo: 'Immediately during the bank opening hours when armed group entered vault area',
  infoGivenToPoliceDateTime: `${new Date().toISOString().split('T')[0]} 09:40`,

  exactAddress: 'City Central Bank Main Branch, Sector 12, Financial District, Metro City',
  houseBuildingNo: 'Plot No. 42, Floor G & 1',
  streetRoad: 'Central Banking Avenue, Sector 12',
  areaLocalityVillage: 'Downtown Central Financial Sector',
  cityTown: 'Metro City',
  placeDistrict: 'Metro South',
  placeState: 'Maharashtra',
  pinCode: '400001',
  nearestLandmark: 'Opposite Reserve Exchange Tower',
  jurisdictionPs: 'City Central Police Station',
  directionFromPs: 'North-East',
  distanceFromPs: '1.8 km',
  beatChowkyOutpost: 'Beat No. 4 / Financial Chowky',
  gpsCoordinates: '18.9402, 72.8354',

  informantFullName: 'Rajesh Sharma',
  informantParentOrSpouse: 'Kailash Sharma',
  informantAgeDob: '46 Years',
  informantGender: 'Male',
  informantNationality: 'Indian',
  informantOccupation: 'Senior Bank Operations Branch Manager',
  informantMobile: '+91 98201 54321',
  informantAltPhone: '+91 022 2200 4455',
  informantEmail: 'rajesh.sharma@centralbank.co.in',
  informantCurrentAddress: 'Flat 402, Sea Breeze Apts, Marine Drive, Metro City',
  informantPermanentAddress: 'Same as current address',
  informantVillageCity: 'Metro City',
  informantDistrict: 'Metro South',
  informantState: 'Maharashtra',
  informantPin: '400020',
  informantIdType: 'Aadhaar Card',
  informantIdNumber: 'XXXX-XXXX-8921',
  informantRelToVictim: 'Employee / Officer in charge of aggrieved entity',
  informantRelToAccused: 'None (Unknown assailants)',

  victimIsSameAsInformant: false,
  victimFullName: 'City Central Bank & Staff (Branch Custodians)',
  victimParentOrSpouse: 'N/A (Institutional & Public Aggrieved)',
  victimAgeDob: 'N/A',
  victimGender: 'Other',
  victimNationality: 'Indian',
  victimOccupation: 'Scheduled Commercial Bank',
  victimMobile: '+91 022 2200 4400',
  victimEmail: 'branch.manager@centralbank.co.in',
  victimCurrentAddress: 'City Central Bank Main Branch, Sector 12, Metro City',
  victimPermanentAddress: 'Corporate HQ, Nariman Point, Metro City',
  victimIdDetails: 'Bank License RBI/2026/8942',
  victimRelToInformant: 'Employer & Workplace',
  victimNatureOfLoss: 'Armed cash theft from main vault, physical trauma to security staff',
  victimMedicalDetails: 'First aid rendered to guard Ram Singh at Metro City Civil Hospital',

  accusedFullName: 'Vikram "Ghost" Malhotra & 3 unidentified masked accomplices',
  accusedAlias: 'Ghost / V.M.',
  accusedParentOrSpouse: 'Unknown',
  accusedApproxAge: '32-38 Years',
  accusedGender: 'Male',
  accusedNationality: 'Indian',
  accusedOccupation: 'Suspected organized syndicate operator',
  accusedCurrentAddress: 'Under investigation (fled scene toward Harbor Expressway)',
  accusedPermanentAddress: 'Unknown',
  accusedMobile: '+91 98200 XXXXX (Under telecom trace)',
  accusedSocialOrEmail: 'Encrypted alias: ghost_vault_99',
  accusedVehicleNumber: 'MH-01-EA-4491 (Dark Gray SUV)',
  accusedPhysicalDesc: 'Athletic muscular build, approx 5 ft 11 inches tall, wearing tactical balaclava',
  accusedHeightBuild: '5 ft 11 in, athletic',
  accusedComplexionHair: 'Fair to wheatish, dark short hair visible under cap',
  accusedClothing: 'Black tactical jacket, cargo trousers, combat boots',
  accusedMarksTattoos: 'Scorpion/dragon ink mark observed on left wrist above glove',
  accusedPhotoCctvRef: 'Cam-03 entrance & Vault-01 frame timestamp 09:22:15',
  accusedCount: '4 persons in total',

  witnessFullName: 'Inspector Suresh Kadam (Duty Officer)',
  witnessAge: '44 Years',
  witnessGender: 'Male',
  witnessParentOrSpouse: 'Anant Kadam',
  witnessAddress: 'Staff Quarters, City Central Police Station',
  witnessMobile: '+91 98203 11223',
  witnessOccupation: 'Police Officer / First Responder',
  witnessRelToVictim: 'Neutral First Responder',
  witnessStatementKnowledge: 'Arrived within 4 minutes of panic alarm trigger; spotted getaway vehicle fleeing toward expressway.',
  witnessSupportingMaterial: 'Police Cruiser Dashcam recording CD-01 attached',

  incidentNarrative:
    'On 20 September 2026 at approximately 09:20 AM, four unidentified masked men armed with semi-automatic firearms forcibly breached the main branch of City Central Bank during morning vault balancing. The assailants held the head cashier and security guard hostage at gunpoint, disabled alarm cables, and extracted Rs 2.5 Crores ($2.5M equivalent) from the secondary safety reserve before fleeing in a dark gray SUV bearing license plate MH-01-EA-4491.',

  propertyType: 'Currency & Security Equipment',
  propertyDescription: 'Indian Rupee banknotes in strapped currency bundles and digital surveillance DVR drive',
  propertyOwner: 'City Central Bank',
  propertyMakeBrand: 'RBI Currency Issue / Hikvision Security Unit',
  propertyModel: 'Vault VaultLock Pro-900',
  propertyColour: 'Standard Bank Notes & Black DVR Box',
  propertySerialNo: 'SN-DVR-99210-CCB',
  propertyImeiNo: 'N/A',
  propertyVehicleRegNo: 'MH-01-EA-4491 (Getaway Vehicle)',
  propertyQuantity: '25 bundles & 1 DVR unit',
  propertyApproxValue: 'Rs 25,000,000 / $2.5 Million USD',
  propertyDateLostStolen: `${new Date().toISOString().split('T')[0]} 09:25`,
  propertyRecoveredStatus: 'No',
  propertyRecoveryDetails: 'Under active search and expressway roadblock interception',

  evidenceTypes: ['Photographs', 'CCTV footage', 'Video recordings', 'Forensic', 'Documents'],
  evidenceDescription: 'Forensic ballistics cartridge casing found at lobby, high-definition branch CCTV footage (Cam 1-4), and eyewitness log',
  evidenceDateTimeObtained: `${new Date().toISOString().split('T')[0]} 10:15`,

  cyberPhone: '+91 98200 44912',
  cyberEmail: 'ghost_alert@proton.me',
  cyberUsername: 'ghost_operator_99',
  cyberPlatform: 'Signal / Encrypted VoIP',
  cyberWebsiteUrl: 'N/A',
  cyberBankDetails: 'Account trace requested under BNSS 106',
  cyberUpiId: 'N/A',
  cyberTransactionId: 'N/A',
  cyberTxnDateTime: 'N/A',
  cyberAmountInvolved: 'Rs 25,000,000',
  cyberDeviceType: 'Radio Jammer & Mobile handset',
  cyberImei: '358921098271625',
  cyberIpAddress: '103.21.144.92 (Telecom tower dump)',
  cyberScreenshotsOrExports: 'Telecom tower dump CDR and CCTV raw mp4 exports',
  cyberOtherIdentifiers: 'MAC address 00:1A:2B:3C:4D:5E intercepted at nearby public Wi-Fi',

  injuredPersonName: 'Ram Singh (Head Security Guard)',
  injuryDateTime: `${new Date().toISOString().split('T')[0]} 09:21`,
  injuryDescription: 'Blunt force trauma to forehead from pistol butt strike, laceration measuring 3 cm',
  treatmentPlace: 'Government Civil Hospital, Ward 3',
  hospitalName: 'Metro City Civil Hospital',
  mlcReportNo: `MLC-${Math.floor(1000 + Math.random() * 9000)}/2026`,
  doctorDetails: 'Dr. Anita Roy, CMO on duty',
  medicalDocsAttached: 'Yes',
  fatalityOccurred: 'No',

  vehicleType: 'Sports Utility Vehicle (SUV)',
  vehicleRegNo: 'MH-01-EA-4491',
  vehicleMake: 'Mahindra',
  vehicleModel: 'Scorpio-N',
  vehicleColour: 'Deep Charcoal Grey',
  vehicleOwnerName: 'Suspected stolen or forged registration',
  vehicleDriverName: 'Unidentified accomplice in black balaclava',
  vehicleChassisNo: 'MA1TA2SKL3XXXXXX',
  vehicleEngineNo: 'ENG-229104-X',
  vehicleRoleInIncident: 'Getaway vehicle used to transport assailants and stolen loot from bank exit',
  vehiclePhotoRef: 'City Traffic Cam Intersection 14 frame snapshot #22',

  prevComplaintNo: 'NC-4412/2026',
  prevFirNo: 'FIR-2025-1102',
  prevPoliceStation: 'Harbor Gateway Police Station',
  prevDistrictState: 'Metro South, Maharashtra',
  prevDate: '2025-11-14',
  prevIncidentNature: 'Armed vault burglary attempt at commercial exchange with identical modus operandi',
  prevCaseRelationship: 'Linked to the same suspected syndicate ("Ghost" Gang)',
  prevExistingDisputeThreat: 'Security manager reported surveillance reconnaissance 3 weeks ago',
  prevConnectedReference: 'Case Dossier CR-2025-7801',

  policeFirNo: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
  policeLegalSections: 'BNS 309(4), 311, 61, Arms Act 25/27',
  policeGdRef: 'Entry #14 at 09:35 hrs',
  policeJurisdictionVerified: 'Verified within territorial limits of City Central PS',
  officerReceivingInfo: 'Sub-Inspector R. Deshmukh',
  officerRegisteringFir: 'Inspector Amit Verma (Investigator / SHO)',
  investigatingOfficerRankName: 'Investigator Amit Verma (Badge #HP-901)',
  investigationCaseRefNo: `INV-CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
  actionTaken: 'FIR registered. Crime branch mobilized. Forensic team dispatched. City-wide red alert issued.',
  transferPsInfo: 'N/A (Investigated at home station)',
  arrestBailInfo: 'All 4 accused currently absconding / Wanted',
  statutoryEntries: 'Statutory compliance under Section 173 BNSS, 2023 completed',

  informantSignature: 'Rajesh Sharma',
  informantThumbImpression: false,
  informantAckDate: new Date().toISOString().split('T')[0],
  informantAckPlace: 'City Central Police Station',
  informantPreferredContact: '+91 98201 54321 (WhatsApp & SMS)',
  firCopyReceivedByInformant: true,

  officerAuthName: 'Investigator Amit Verma',
  officerAuthRank: 'Senior Inspector of Police / Station House Officer',
  officerAuthBuckleId: 'HP-901',
  officerAuthStation: 'City Central Police Station, Metro City',
  officerAuthSignature: 'Amit Verma, Insp.',
  officerAuthDateTime: `${new Date().toISOString().split('T')[0]} 10:00 AM`,
  officialSealAffixed: true,
};

// Preset OCR Scenarios for instant test / extraction
export interface OcrPreset {
  id: string;
  name: string;
  badge: string;
  crimeType: string;
  summary: string;
  extractedData: Partial<FirChecklistState>;
}

export const sampleOcrPresets: OcrPreset[] = [
  {
    id: 'preset-bank-heist',
    name: 'FIR Copy: City Central Bank Armed Robbery',
    badge: 'Armed Robbery / BNS 309(4)',
    crimeType: 'Armed Robbery',
    summary: 'Scanned official handwritten & printed FIR (IIF-I) with 4 masked suspects, $2.5M vault cash, getaway SUV.',
    extractedData: {
      ...initialFirState,
      firNumber: `FIR-2026-8942`,
      policeFirNo: `CR-2026-8942`,
      offenceCategory: 'Armed Robbery',
      informantFullName: 'Rajesh Sharma',
      victimFullName: 'City Central Bank & Staff',
      exactAddress: 'City Central Bank Main Branch, Sector 12, Financial District, Metro City',
      incidentNarrative:
        'Four armed masked men held cashier and guard at gunpoint, extracted cash from vault and fled in dark gray SUV MH-01-EA-4491.',
    },
  },
  {
    id: 'preset-cyber-phishing',
    name: 'FIR Copy: Multi-Crore Corporate Cyber Phishing',
    badge: 'Cyber Crime / IT Act 66D',
    crimeType: 'Cyber Crime',
    summary: 'Extracted digital FIR: Spoofed executive email, unauthorized RTGS transfer of Rs 1.8 Crores.',
    extractedData: {
      ...initialFirState,
      firNumber: `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      policeFirNo: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      offenceCategory: 'Cyber Crime',
      applicableAct: 'Information Technology Act, 2000 & BNS, 2023',
      bnsSections: 'BNS Section 318(4) (Cheating), Section 336 (Forgery), Section 61 (Conspiracy)',
      specialLawSections: 'IT Act Section 43, 66, 66C, 66D',
      informantFullName: 'Sunita Mehra (Finance Controller)',
      victimFullName: 'Apex FinTech Solutions Pvt Ltd',
      exactAddress: 'Tower 4, Infotech Cyber City, Sector 5, Metro City',
      accusedFullName: 'Unknown cyber syndicate operating under alias "FinExec_Gateway"',
      cyberEmail: 'cfo_executive_spoof@mail-secure-portal.com',
      cyberAmountInvolved: 'Rs 18,500,000 ($220,000 USD)',
      incidentNarrative:
        'Phishing attack compromised internal finance clearance pipeline; fraudulent RTGS transaction authorized to mule accounts across 3 states.',
    },
  },
  {
    id: 'preset-diamond-burglary',
    name: 'FIR Copy: Night Vault Diamond Jewellery Burglary',
    badge: 'Burglary / BNS 305',
    crimeType: 'Burglary',
    summary: 'Extracted commercial FIR: Broken security grille, alarm bypass, diamond ornaments valued at Rs 85 Lakhs.',
    extractedData: {
      ...initialFirState,
      firNumber: `FIR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      policeFirNo: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      offenceCategory: 'Burglary',
      applicableAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
      bnsSections: 'BNS Section 305 (Theft in dwelling / shop), Section 331 (House-trespass)',
      specialLawSections: 'None',
      informantFullName: 'Devendra Choksi (Proprietor)',
      victimFullName: 'Choksi Heritage Jewellers',
      exactAddress: 'Shop 14, Gold Souk Market, Zaveri Bazaar Road, Metro City',
      accusedFullName: 'Two unidentified operatives captured on night infrared CCTV in hooded raincoats',
      propertyDescription: 'Cut diamond sets, unmounted solitaire gems, certified gold necklaces',
      propertyApproxValue: 'Rs 8,500,000',
      incidentNarrative:
        'Perpetrators cut rear ventilation grille during heavy rainfall, bypassed sensor wiring, drilled into secondary safe and absconded with diamond inventory.',
    },
  },
];
