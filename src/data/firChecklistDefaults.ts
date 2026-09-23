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

<<<<<<< HEAD
export const sampleOcrPresets: OcrPreset[] = [
  {
=======
// Authentic Maharashtra Police FIR (Form No. 1 / Sec 173 BNSS) - Hinjawadi PS ATM Robbery
export const hinjawadiAtmRobberyFirData: FirChecklistState = {
  // 1. FIR / Police Station Details
  state: 'Maharashtra',
  district: 'Pune (Rural)',
  policeStation: 'Hinjawadi Police Station',
  firNumber: '312/2026',
  year: '2026',
  regDate: '2026-07-03',
  regTime: '09:45',
  generalDiaryNo: 'GD-554/2026',
  infoReceivedDateTime: '2026-07-03 02:40 AM',
  infoMode: 'Written',

  // 2. Offence / Legal Provisions
  applicableAct: 'Bharatiya Nyaya Sanhita, 2023 (BNS)',
  bnsSections: 'Section 309(4), Section 331, Section 317, Section 61 (Criminal Conspiracy)',
  specialLawSections: 'Prevention of Damage to Public Property Act (Clause 2 & 4)',
  subSectionClause: 'Clause 2 & 4',
  offenceCategory: 'ATM Robbery / Theft',

  // 3. Date, Time and Occurrence of Offence
  occurrenceDateFrom: '2026-07-03',
  occurrenceDateTo: '2026-07-03',
  occurrenceTimeFrom: '02:10 AM',
  occurrenceTimeTo: '02:25 AM',
  approxTime: 'Around 02:15 AM',
  isContinuingOffence: false,
  complainantAwarenessInfo: 'Security guard found the ATM shutter open and immediately informed the police.',
  infoGivenToPoliceDateTime: '03/07/2026 02:40 AM',

  // 4. Place of Occurrence
  exactAddress: 'State Bank of India ATM, Plot No. 17, Rajiv Gandhi Infotech Park, Hinjawadi Phase 1',
  houseBuildingNo: 'ATM Kiosk (Outside SBI Branch)',
  streetRoad: 'Phase 1 Main Road',
  areaLocalityVillage: 'Hinjawadi IT Park',
  cityTown: 'Pune',
  placeDistrict: 'Pune (Rural)',
  placeState: 'Maharashtra',
  pinCode: '411057',
  nearestLandmark: 'Opposite Wipro Circle',
  jurisdictionPs: 'Hinjawadi Police Station',
  directionFromPs: 'South-East',
  distanceFromPs: '2.3 km',
  beatChowkyOutpost: 'Beat No. 5 / Hinjawadi Chowky',
  gpsCoordinates: '18.5902, 73.7389',

  // 5. Informant / Complainant Details
  informantFullName: 'Rohan Patil',
  informantParentOrSpouse: 'Suresh Patil',
  informantAgeDob: '32 Years (DOB: 11/06/1994)',
  informantGender: 'Male',
  informantNationality: 'Indian',
  informantOccupation: 'Security Officer (SBI)',
  informantMobile: '+91 97654 32109',
  informantAltPhone: '+91 20 4123 8890',
  informantEmail: 'rohan.patil@sbi.co.in',
  informantCurrentAddress: 'B-503, Yashwant Heights, Hinjawadi, Pune - 411057',
  informantPermanentAddress: 'Same as current address',
  informantVillageCity: 'Pune',
  informantDistrict: 'Pune (Rural)',
  informantState: 'Maharashtra',
  informantPin: '411057',
  informantIdType: 'PAN Card',
  informantIdNumber: 'ABCPP1234D',
  informantRelToVictim: 'Bank Staff (Informant)',
  informantRelToAccused: 'Unknown',

  // 6. Victim / Person Aggrieved Details
  victimIsSameAsInformant: false,
  victimFullName: 'State Bank of India (Property - ATM)',
  victimParentOrSpouse: 'N/A (Institution)',
  victimAgeDob: 'N/A',
  victimGender: 'Institutional / N/A',
  victimNationality: 'Indian',
  victimOccupation: 'Banking Institution',
  victimMobile: '1800 1234 (SBI Customer Care)',
  victimEmail: 'customercare@sbi.co.in',
  victimCurrentAddress: 'SBI Branch, Plot No. 17, Rajiv Gandhi Infotech Park, Hinjawadi Phase 1, Pune',
  victimPermanentAddress: 'State Bank Bhavan, Madame Cama Road, Nariman Point, Mumbai',
  victimIdDetails: 'RBI Institutional License: BANK-SBI-MH-01',
  victimRelToInformant: 'Employer (Bank)',
  victimNatureOfLoss: 'Cash stolen from ATM (estimated Rs. 18,75,000/-), damage to ATM machine and CCTV wiring.',
  victimMedicalDetails: 'Not applicable',

  // 7. Accused / Suspect / Unknown Person Details
  accusedFullName: 'Unknown Person 1 & Unknown Person 2',
  accusedAlias: 'Not known',
  accusedParentOrSpouse: 'Unknown',
  accusedApproxAge: '25 - 35 Years (2 persons)',
  accusedGender: 'Male (Presumed)',
  accusedNationality: 'Indian (Suspected)',
  accusedOccupation: 'Unknown',
  accusedCurrentAddress: 'Unknown (Absconding towards Hinjawadi Phase 3)',
  accusedPermanentAddress: 'Unknown',
  accusedMobile: 'Under investigation (Tower dump CDR requested)',
  accusedSocialOrEmail: 'None known',
  accusedVehicleNumber: 'MH-12-XX-4590 (Black Pulsar Motorcycle - suspected)',
  accusedPhysicalDesc: 'Person 1: approx 5 ft 9 in, medium build, wearing black hoodie, jeans, gloves, face mask. Person 2: approx 5 ft 7 in, slim build, wearing dark jacket, cap, face mask.',
  accusedHeightBuild: '5 ft 7 in to 5 ft 9 in, medium/slim athletic build',
  accusedComplexionHair: 'Concealed by dark hoods and face masks',
  accusedClothing: 'Black hoodie, dark windcheater jacket, dark trousers, heavy gloves',
  accusedMarksTattoos: 'Not visible (faces and extremities covered)',
  accusedPhotoCctvRef: 'Cam-01 (ATM front), Cam-02 (road) - timestamp 02:13 hrs',
  accusedCount: '2',

  // 8. Witness Details
  witnessFullName: 'Mahesh Jadhav (Security Guard)',
  witnessAge: '40 Years',
  witnessGender: 'Male',
  witnessParentOrSpouse: 'Dattatray Jadhav',
  witnessAddress: 'Security Quarters, Rajiv Gandhi Infotech Park, Hinjawadi Phase 1, Pune',
  witnessMobile: '+91 98901 66789',
  witnessOccupation: 'Private Security Guard (Eagle Security Services)',
  witnessRelToVictim: 'On-duty Security Guard at premises',
  witnessStatementKnowledge: 'Heard loud noise, saw two masked men using a gas cutter and fleeing in a black motorcycle.',
  witnessSupportingMaterial: 'Immediate distress call record logged at 02:26 AM',

  // 9. Detailed Statement / Incident Narrative
  incidentNarrative: 'On 03 July 2026 at approximately 02:15 AM, two unidentified men arrived at the SBI ATM located at Hinjawadi Phase 1, Pune. They were wearing masks and used a gas cutter to open the ATM. The alarm system and CCTV wiring were damaged. The accused stole approximately Rs. 18,75,000/- from the cash cassettes and fled the scene on a black motorcycle towards Hinjawadi Phase 3. The incident was witnessed by the security guard who immediately informed the police. CCTV footage and physical evidence are being collected for further investigation.',

  // 10. Property / Articles Involved
  propertyType: 'Cash Currency',
  propertyDescription: 'Cash stolen from ATM cassettes (Indian Rupee denominations 500 & 200)',
  propertyOwner: 'State Bank of India',
  propertyMakeBrand: 'NCR / Diebold ATM Machine cash cassettes',
  propertyModel: 'ATM Cassettes Model 6625',
  propertyColour: 'Metallic Gray cassettes',
  propertySerialNo: 'CAS-SBI-9912, CAS-SBI-9913',
  propertyImeiNo: 'N/A',
  propertyVehicleRegNo: 'MH-12-XX-4590',
  propertyQuantity: '3 Cash Cassettes containing currency notes',
  propertyApproxValue: '1875000',
  propertyDateLostStolen: '2026-07-03',
  propertyRecoveredStatus: 'No',
  propertyRecoveryDetails: 'Search underway; highway checkpoints and toll plazas alerted.',

  // 11. Evidence / Supporting Material
  evidenceTypes: ['CCTV Footage', 'Physical Evidence', 'Digital Log'],
  evidenceDescription: 'Gas cutter gas cylinder residue, ATM outer casing pry marks, DVR CCTV recording (02:00 to 02:35 AM), ATM sensor tamper logs.',
  evidenceDateTimeObtained: '2026-07-03 03:15 AM',

  // 12. Cyber / Digital Information
  cyberPhone: '+91 97654 32109',
  cyberEmail: 'ps.hinjawadi@mahapolice.gov.in',
  cyberUsername: 'sbi_atm_hinjawadi_ph1',
  cyberPlatform: 'SBI Central Banking ATM Monitoring Network',
  cyberWebsiteUrl: 'https://bank.sbi',
  cyberBankDetails: 'State Bank of India, Hinjawadi Branch, IFSC: SBIN0012345',
  cyberUpiId: '',
  cyberTransactionId: '',
  cyberTxnDateTime: '2026-07-03 02:15 AM',
  cyberAmountInvolved: 'Rs. 18,75,000',
  cyberDeviceType: 'ATM Terminal & Network Switch',
  cyberImei: '',
  cyberIpAddress: '10.24.118.42',
  cyberScreenshotsOrExports: 'CCTV video MP4 export & electronic sensor log',
  cyberOtherIdentifiers: 'ATM Machine ID: SBI-HINJ-004',

  // 13. Injury / Medical Details
  injuredPersonName: 'None (No physical assault reported)',
  injuryDateTime: '',
  injuryDescription: 'No physical injuries; security guard was outside the kiosk booth.',
  treatmentPlace: 'N/A',
  hospitalName: 'N/A',
  mlcReportNo: 'N/A',
  doctorDetails: 'N/A',
  medicalDocsAttached: 'No',
  fatalityOccurred: 'No',

  // 14. Vehicle Details
  vehicleType: 'Motorcycle',
  vehicleRegNo: 'MH-12-XX-4590',
  vehicleMake: 'Bajaj Pulsar',
  vehicleModel: 'Pulsar 220F / 150',
  vehicleColour: 'Black',
  vehicleOwnerName: 'Under verification with RTO Pune Rural',
  vehicleDriverName: 'Unknown Accused Operative',
  vehicleChassisNo: 'Under RTO tracing',
  vehicleEngineNo: 'Under RTO tracing',

  vehicleRoleInIncident: 'Getaway vehicle used by suspects',
  vehiclePhotoRef: 'CCTV Grab Frame #0442',

  // 15. Related / Previous Complaints or Cases
  prevComplaintNo: 'N/A',
  prevFirNo: 'N/A',
  prevPoliceStation: 'Hinjawadi Police Station',
  prevDistrictState: 'Pune, Maharashtra',
  prevDate: '',
  prevIncidentNature: 'No prior incident recorded at this specific ATM kiosk',
  prevCaseRelationship: 'First occurrence reported by SBI e-surveillance',
  prevExistingDisputeThreat: 'None reported prior to incident',
  prevConnectedReference: 'CCTV footage ref: SBI-HINJ-ATM-0703',

  // 16. Action Taken / Investigation Transfer
  policeFirNo: 'CR-2026-312 / Hinjawadi',
  policeLegalSections: 'BNS 309(4) Robbery, BNS 324(4) Mischief causing damage, BNS 3(5) Common Intention',
  policeGdRef: 'GD-554/2026',
  policeJurisdictionVerified: 'Yes - Within Hinjawadi PS Beat No. 3',
  officerReceivingInfo: 'ASI S. Deshmukh (Badge #MH/PS/3412)',
  officerRegisteringFir: 'PSI Neha Kulkarni (Badge #MH/PS/2765)',
  investigatingOfficerRankName: 'PSI Neha Kulkarni (Hinjawadi PS)',
  investigationCaseRefNo: 'CR-2026-312 / Hinjawadi',
  actionTaken: 'Registered FIR under Section 173 BNSS. Crime Scene investigated, Panchnama drawn, CCTV seized, teams dispatched.',
  transferPsInfo: 'N/A - Offence occurred fully within Hinjawadi PS jurisdiction.',
  arrestBailInfo: 'Accused unidentified; search operations actively underway.',
  statutoryEntries: 'Entry recorded in General Diary under No. GD-554/2026 at 09:45 hrs.',

  // 17. Informant Verification / Acknowledgement
  informantSignature: 'Rohan Patil',
  informantThumbImpression: false,
  informantAckDate: '2026-07-03',
  informantAckPlace: 'Hinjawadi Police Station',
  informantPreferredContact: 'Mobile (+91 97654 32109)',
  firCopyReceivedByInformant: true,

  // 18. Police Officer Authentication
  officerAuthName: 'PSI Neha Kulkarni',
  officerAuthRank: 'Police Sub-Inspector (PSI)',
  officerAuthBuckleId: 'MH/PS/2765',
  officerAuthStation: 'Hinjawadi Police Station, Pune Rural',
  officerAuthSignature: 'PSI Neha Kulkarni',
  officerAuthDateTime: '2026-07-03 09:45 hrs',
  officialSealAffixed: true,
};

export const sampleOcrPresets: OcrPreset[] = [
  {
    id: 'preset-hinjawadi-atm',
    name: 'Maharashtra Police FIR (Form No. 1): SBI ATM Robbery - Hinjawadi',
    badge: 'ATM Robbery / BNS 309(4)',
    crimeType: 'ATM Robbery',
    summary: 'Official Maharashtra Police FIR (Form No. 1, Sec 173 BNSS). Hinjawadi PS, FIR 312/2026, Complainant Rohan Patil, Rs 18.75 Lakhs cash stolen.',
    extractedData: {
      ...hinjawadiAtmRobberyFirData,
    },
  },
  {
>>>>>>> aa42170 (CrimeMtrix1)
    id: 'preset-bank-heist',
    name: 'FIR Copy: City Central Bank Armed Robbery',
    badge: 'Armed Robbery / BNS 309(4)',
    crimeType: 'Armed Robbery',
    summary: 'Scanned official handwritten & printed FIR (IIF-I) with 4 masked suspects, $2.5M vault cash, getaway SUV.',
    extractedData: {
      ...initialFirState,
      firNumber: `FIR-2026-8942`,
<<<<<<< HEAD
      policeFirNo: `CR-2026-8942`,
=======
>>>>>>> aa42170 (CrimeMtrix1)
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
