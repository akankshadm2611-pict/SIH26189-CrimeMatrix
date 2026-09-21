import React, { useState } from 'react';
import { User } from '../types';
import {
  PhoneCall,
  Car,
  Crosshair,
  UserSquare2,
  Cpu,
  FileCheck2,
  Clock,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Database,
  Radio,
  Send,
  Lock,
} from 'lucide-react';

interface AccessRequisition {
  id: string;
  type: 'Call Centers / CDR' | 'Vehicle Information (RTO)' | 'Mobile Location Tracing' | 'Subscriber Details (CAF)' | 'IP & Digital Forensics';
  targetEntity: string;
  caseRef: string;
  departmentAuthority: string;
  urgency: 'Immediate Emergency (Sec 91 CrPC)' | 'Court Clearance Required' | 'Standard Investigation';
  status: 'Approved & Data Stream Ready' | 'Pending Nodal Officer Clearance' | 'Processing Interception';
  requestedAt: string;
  justification: string;
  requestedBy: string;
  badgeId: string;
}

const INITIAL_REQUISITIONS: AccessRequisition[] = [
  {
    id: 'REQ-DIGI-2026-401',
    type: 'Mobile Location Tracing',
    targetEntity: '+91 98211 44332 (IMEI: 864201048821943)',
    caseRef: 'CR-2026-8942',
    departmentAuthority: 'Telecom Service Provider LBS Gateway / Cyber Cell',
    urgency: 'Immediate Emergency (Sec 91 CrPC)',
    status: 'Approved & Data Stream Ready',
    requestedAt: '14 Sep 2026, 09:15 AM',
    justification: 'Suspect fled crime scene of City Central Bank Heist. Real-time tower azimuth triangulation and historical geofence trail required.',
    requestedBy: 'SHO/Inspector Rajesh Deshmukh',
    badgeId: 'SHO-8842',
  },
  {
    id: 'REQ-DIGI-2026-389',
    type: 'Vehicle Information (RTO)',
    targetEntity: 'MH-02-DN-7741 (Chassis: MA3EW41S098231)',
    caseRef: 'CR-2026-7731',
    departmentAuthority: 'Ministry of Road Transport & Highways (Vahan Registry)',
    urgency: 'Standard Investigation',
    status: 'Approved & Data Stream Ready',
    requestedAt: '13 Sep 2026, 03:40 PM',
    justification: 'Commercial heavy vehicle spotted loading container at Harbor Docks before narcotics interception.',
    requestedBy: 'Investigator Amit Verma',
    badgeId: 'INV-4412',
  },
  {
    id: 'REQ-DIGI-2026-372',
    type: 'Call Centers / CDR',
    targetEntity: 'Toll-Free 1800-419-0021 & +91 94100 23119',
    caseRef: 'CR-2026-6119',
    departmentAuthority: 'Unified Telecom CDR Repository & National Consumer Call Center',
    urgency: 'Court Clearance Required',
    status: 'Processing Interception',
    requestedAt: '12 Sep 2026, 11:30 AM',
    justification: 'Fraud call center numbers used to target senior citizens in Apex Capital Ponzi scheme.',
    requestedBy: 'Sub-Inspector Vikram Sharma',
    badgeId: 'INS-9011',
  },
  {
    id: 'REQ-DIGI-2026-350',
    type: 'IP & Digital Forensics',
    targetEntity: 'Static IP: 185.220.101.5 / Port 8443 / VPN Node',
    caseRef: 'CR-2026-9104',
    departmentAuthority: 'CERT-In & Internet Service Provider Data Center',
    urgency: 'Immediate Emergency (Sec 91 CrPC)',
    status: 'Approved & Data Stream Ready',
    requestedAt: '11 Sep 2026, 05:20 PM',
    justification: 'Ransomware command-and-control server beacon targeting municipal power grid server infrastructure.',
    requestedBy: 'Investigator Amit Verma',
    badgeId: 'INV-4412',
  },
];

interface RequestAndAccessViewProps {
  currentUser: User;
  themeMode?: 'dark' | 'bright';
}

export const RequestAndAccessView: React.FC<RequestAndAccessViewProps> = ({
  currentUser,
  themeMode = 'dark',
}) => {
  const [requisitions, setRequisitions] = useState<AccessRequisition[]>(INITIAL_REQUISITIONS);
  const [activeCategory, setActiveCategory] = useState<
    'call-center' | 'vehicle' | 'location' | 'subscriber' | 'cyber'
  >('call-center');

  // Form states
  const [targetEntity, setTargetEntity] = useState('');
  const [caseRef, setCaseRef] = useState('CR-2026-8942');
  const [urgency, setUrgency] = useState<AccessRequisition['urgency']>('Immediate Emergency (Sec 91 CrPC)');
  const [justification, setJustification] = useState('');
  const [extraParam, setExtraParam] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Lookup results simulator state
  const [simulatedResult, setSimulatedResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'call-center':
        return 'Call Centers & CDR Records Interception';
      case 'vehicle':
        return 'Vehicle Information & Vahan/RTO Registry Lookup';
      case 'location':
        return 'Mobile Location Tracing & Cellular GPS Triangulation';
      case 'subscriber':
        return 'Subscriber Details & CAF KYC Verification Requisition';
      case 'cyber':
        return 'IP Address Logs & Digital Forensics Interception';
    }
  };

  const getDepartmentAuthority = () => {
    switch (activeCategory) {
      case 'call-center':
        return 'Telecom Central Monitoring System & 112 Command Call Center';
      case 'vehicle':
        return 'Vahan 4.0 National Registry / Traffic Automated Number Plate Recognition';
      case 'location':
        return 'Telecom Service Provider Real-Time LBS & Tower Azimuth Gateway';
      case 'subscriber':
        return 'Customer Application Form (CAF) & UIDAI KYC Repository';
      case 'cyber':
        return 'CERT-In National Cyber Coordination Centre (NCCC) & ISP Gateway';
    }
  };

  const handleSimulateLookup = () => {
    if (!targetEntity.trim()) {
      alert('Please enter a target identifier to query.');
      return;
    }

    setIsSearching(true);
    setSimulatedResult(null);

    setTimeout(() => {
      setIsSearching(false);
      if (activeCategory === 'vehicle') {
        setSimulatedResult({
          type: 'Vehicle',
          registration: targetEntity.toUpperCase(),
          owner: 'Devrat S. Gaikwad',
          chassis: 'MA3EW41S098231' + Math.floor(100 + Math.random() * 900),
          engine: 'K15B-662819',
          makerModel: 'Mahindra Scorpio-N 4x4 Luxury',
          fuelType: 'Diesel BS-VI',
          rcStatus: 'Active (Fitness Valid till 2038)',
          rtoOffice: 'MH-02 Mumbai West RTO, Andheri',
          fastagTransit: 'Last scanned: Khed-Shivapur Toll Plaza (Lane 4) at 06:14 AM today',
          blacklistFlag: 'CRIME BRANCH ALERT FLAGGED',
        });
      } else if (activeCategory === 'location') {
        setSimulatedResult({
          type: 'Location',
          phone: targetEntity,
          imei: '864201048821943',
          operator: 'Airtel India (Maharashtra & Goa Circle)',
          status: 'Active on Network (VoLTE Attached)',
          currentTowerCellId: 'CELL-MUM-W-4122 (Azimuth: 140°)',
          estimatedAddress: 'Near Sector 18 Junction, Navi Mumbai Expressway',
          accuracyRadius: '42 meters (Cellular + WiFi SSID Fingerprint)',
          lastHandover: 'Tower MUM-4119 -> MUM-4122 at 11:08:42 AM',
        });
      } else if (activeCategory === 'subscriber') {
        setSimulatedResult({
          type: 'Subscriber',
          msisdn: targetEntity,
          subscriberName: 'Arjun Ramesh Kadam',
          guardianName: 'Ramesh Kadam',
          registeredAddress: 'Flat 402, Sai Sagar Heights, Sector 12, Metro City',
          alternateNumber: '+91 97654 00921',
          simActivationDate: '18 April 2021',
          kycProofType: 'Aadhaar Card (UIDAI Verified)',
          imsi: '404450123982711',
        });
      } else if (activeCategory === 'call-center') {
        setSimulatedResult({
          type: 'CDR',
          target: targetEntity,
          recordsFound: '1,428 Calls in Selected Window',
          outgoingCalls: 842,
          incomingCalls: 586,
          frequentContacts: [
            '+91 98221 44556 (32 calls, total 184 mins)',
            '+91 99887 76655 (28 calls, total 142 mins)',
            '+91 91234 56789 (19 calls, total 76 mins)',
          ],
          voipInterceptions: '2 WhatsApp audio sessions via proxy IP 185.220.101.5',
        });
      } else {
        setSimulatedResult({
          type: 'Cyber',
          targetIp: targetEntity,
          isp: 'Tata Communications Ltd / AS4755',
          reverseDns: 'node-89.vpn-transit.in',
          geoCity: 'Mumbai, Maharashtra, India',
          portsDetected: '443 (HTTPS), 8443 (Alt HTTPS), 22 (SSH)',
          threatScore: 'High Risk (TOR / Proxy Exit Node)',
          connectionTimeline: 'Active connections established with Metro City Municipal SCADA gateway.',
        });
      }
    }, 1200);
  };

  const handleFormalRequisitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEntity.trim() || !justification.trim()) {
      alert('Please fill out the Target Entity and Legal Justification fields.');
      return;
    }

    const typeMapping = {
      'call-center': 'Call Centers / CDR',
      vehicle: 'Vehicle Information (RTO)',
      location: 'Mobile Location Tracing',
      subscriber: 'Subscriber Details (CAF)',
      cyber: 'IP & Digital Forensics',
    } as const;

    const newReq: AccessRequisition = {
      id: `REQ-DIGI-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: typeMapping[activeCategory],
      targetEntity: targetEntity.trim(),
      caseRef: caseRef.trim() || 'CR-2026-8942',
      departmentAuthority: getDepartmentAuthority(),
      urgency,
      status: urgency.includes('Immediate') ? 'Approved & Data Stream Ready' : 'Pending Nodal Officer Clearance',
      requestedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      justification: justification.trim(),
      requestedBy: currentUser.fullName,
      badgeId: currentUser.badgeId,
    };

    setRequisitions([newReq, ...requisitions]);
    setFeedbackSuccess(`Requisition #${newReq.id} lodged with ${newReq.departmentAuthority}. Access authorization granted.`);
    setJustification('');
    setTimeout(() => setFeedbackSuccess(''), 7000);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-yellow-500/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-yellow-400'}`}>
              Departmental Request & Intelligence Access Portal
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
              Requisition call centers, vehicle RTO registries, cellular tower location tracing, subscriber CAF, and digital IP forensics.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Authorized Officer: {currentUser.role}</span>
          </span>
        </div>
      </div>

      {/* 5 Departmental Categories Navigation Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Call Centers */}
        <button
          id="btn-req-callcenter"
          onClick={() => {
            setActiveCategory('call-center');
            setSimulatedResult(null);
            setTargetEntity('1800-419-0021');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === 'call-center'
              ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg font-black transform -translate-y-0.5'
              : themeMode === 'bright'
              ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <PhoneCall className="w-5 h-5" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/15">CDR / Dial 112</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">Call Centers & CDR</p>
            <p className="text-[11px] opacity-80 mt-0.5">Toll-free, inbound/outbound logs</p>
          </div>
        </button>

        {/* 2. Vehicle Info */}
        <button
          id="btn-req-vehicle"
          onClick={() => {
            setActiveCategory('vehicle');
            setSimulatedResult(null);
            setTargetEntity('MH-02-DN-7741');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === 'vehicle'
              ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg font-black transform -translate-y-0.5'
              : themeMode === 'bright'
              ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Car className="w-5 h-5" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/15">Vahan 4.0</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">Vehicle Information</p>
            <p className="text-[11px] opacity-80 mt-0.5">RTO owner, FASTag & chassis</p>
          </div>
        </button>

        {/* 3. Location Tracing */}
        <button
          id="btn-req-location"
          onClick={() => {
            setActiveCategory('location');
            setSimulatedResult(null);
            setTargetEntity('+91 98211 44332');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === 'location'
              ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg font-black transform -translate-y-0.5'
              : themeMode === 'bright'
              ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Crosshair className="w-5 h-5 text-red-500" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/15">Tower / LBS</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">Location Tracing</p>
            <p className="text-[11px] opacity-80 mt-0.5">Mobile triangulation & azimuth</p>
          </div>
        </button>

        {/* 4. Subscriber Details */}
        <button
          id="btn-req-subscriber"
          onClick={() => {
            setActiveCategory('subscriber');
            setSimulatedResult(null);
            setTargetEntity('+91 99887 76655');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeCategory === 'subscriber'
              ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg font-black transform -translate-y-0.5'
              : themeMode === 'bright'
              ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <UserSquare2 className="w-5 h-5" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/15">CAF / KYC</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">Subscriber Details</p>
            <p className="text-[11px] opacity-80 mt-0.5">SIM registration & ID verification</p>
          </div>
        </button>

        {/* 5. IP & Digital Forensics */}
        <button
          id="btn-req-cyber"
          onClick={() => {
            setActiveCategory('cyber');
            setSimulatedResult(null);
            setTargetEntity('185.220.101.5');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1 ${
            activeCategory === 'cyber'
              ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-lg font-black transform -translate-y-0.5'
              : themeMode === 'bright'
              ? 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/15">ISP / CERT-In</span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-tight">IP & Digital Forensics</p>
            <p className="text-[11px] opacity-80 mt-0.5">IP logs, proxy nodes, cloud forensics</p>
          </div>
        </button>
      </div>

      {feedbackSuccess && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 transition-all ${
          themeMode === 'bright' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm font-bold">{feedbackSuccess}</p>
        </div>
      )}

      {/* Query & Requisition Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Query & Formal Requisition */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border transition-all ${
          themeMode === 'bright' ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-xl'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/30 mb-5">
            <div>
              <h2 className={`text-base font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-yellow-400'}`}>
                {getCategoryTitle()}
              </h2>
              <p className={`text-xs mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                Authority: <span className="font-semibold">{getDepartmentAuthority()}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleFormalRequisitionSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                Target Identifier / Query Value <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  placeholder={
                    activeCategory === 'vehicle'
                      ? 'e.g. MH-02-DN-7741 or Engine / Chassis No'
                      : activeCategory === 'location'
                      ? 'e.g. +91 98211 44332 or 15-digit IMEI'
                      : activeCategory === 'subscriber'
                      ? 'e.g. +91 99887 76655 or Aadhaar / CAF Ref'
                      : activeCategory === 'call-center'
                      ? 'e.g. 1800-419-0021 / Dial 112 Event ID'
                      : 'e.g. 185.220.101.5 / Domain / MAC'
                  }
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={handleSimulateLookup}
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  title="Query live database bridge"
                >
                  <Search className="w-4 h-4" />
                  <span>{isSearching ? 'Querying...' : 'Live Query'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Linked Case / FIR Number
                </label>
                <input
                  type="text"
                  value={caseRef}
                  onChange={(e) => setCaseRef(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Requisition Authorization Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="Immediate Emergency (Sec 91 CrPC)">Immediate Emergency (Sec 91 CrPC)</option>
                  <option value="Court Clearance Required">Court Order / Judicial Clearance</option>
                  <option value="Standard Investigation">Standard Station Requisition</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                Investigation Justification & Departmental Clearance Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Specify precise legal reason (e.g. Trace escaping suspects, verify stolen vehicle transit at highway toll plaza, authenticate SIM identity for ransom caller, correlate server attack payload)..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-yellow-500 outline-hidden leading-relaxed ${
                  themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                }`}
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                Liaison Nodal Officer: <strong className="text-yellow-500">{currentUser.fullName}</strong> ({currentUser.badgeId})
              </p>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit Requisition</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview: Live Search Result Card */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border transition-all flex flex-col justify-between ${
          themeMode === 'bright' ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-xl'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30 mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-500 flex items-center space-x-1.5">
                <Radio className="w-4 h-4" />
                <span>Live Data Feed / Intelligence Payload</span>
              </span>
              {simulatedResult && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Data Stream
                </span>
              )}
            </div>

            {isSearching ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-yellow-500 animate-pulse">Contacting Nodal Database Gateway...</p>
                <p className="text-[11px] text-slate-400">Authenticating Section 91 CrPC police token</p>
              </div>
            ) : simulatedResult ? (
              <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-blue-900/40 text-slate-100'
              }`}>
                {simulatedResult.type === 'Vehicle' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                      <span className="font-mono text-sm font-black text-yellow-500">{simulatedResult.registration}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded">{simulatedResult.blacklistFlag}</span>
                    </div>
                    <p><strong>Registered Owner:</strong> {simulatedResult.owner}</p>
                    <p><strong>Make & Model:</strong> {simulatedResult.makerModel} ({simulatedResult.fuelType})</p>
                    <p><strong>Chassis No:</strong> <span className="font-mono">{simulatedResult.chassis}</span></p>
                    <p><strong>Engine No:</strong> <span className="font-mono">{simulatedResult.engine}</span></p>
                    <p><strong>RTO Authority:</strong> {simulatedResult.rtoOffice}</p>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-400">
                      <strong>FASTag Transit Hit:</strong> {simulatedResult.fastagTransit}
                    </div>
                  </>
                )}

                {simulatedResult.type === 'Location' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                      <span className="font-mono text-sm font-black text-yellow-500">{simulatedResult.phone}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">LIVE TOWER LOCK</span>
                    </div>
                    <p><strong>Network Operator:</strong> {simulatedResult.operator}</p>
                    <p><strong>IMEI Hardware:</strong> <span className="font-mono">{simulatedResult.imei}</span></p>
                    <p><strong>Active Cell ID:</strong> {simulatedResult.currentTowerCellId}</p>
                    <p><strong>Estimated Geofence:</strong> {simulatedResult.estimatedAddress}</p>
                    <p><strong>Precision Radius:</strong> {simulatedResult.accuracyRadius}</p>
                    <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300">
                      <strong>Handover Log:</strong> {simulatedResult.lastHandover}
                    </div>
                  </>
                )}

                {simulatedResult.type === 'Subscriber' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                      <span className="font-mono text-sm font-black text-yellow-500">{simulatedResult.msisdn}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">KYC VERIFIED</span>
                    </div>
                    <p><strong>Subscriber Full Name:</strong> {simulatedResult.subscriberName}</p>
                    <p><strong>Guardian:</strong> {simulatedResult.guardianName}</p>
                    <p><strong>Billing Address:</strong> {simulatedResult.registeredAddress}</p>
                    <p><strong>Alternate Contact:</strong> {simulatedResult.alternateNumber}</p>
                    <p><strong>Verification Proof:</strong> {simulatedResult.kycProofType}</p>
                    <p><strong>Activation Date:</strong> {simulatedResult.simActivationDate}</p>
                  </>
                )}

                {simulatedResult.type === 'CDR' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                      <span className="font-mono text-sm font-black text-yellow-500">{simulatedResult.target}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">{simulatedResult.recordsFound}</span>
                    </div>
                    <p><strong>Call Ratio:</strong> Outgoing: {simulatedResult.outgoingCalls} | Incoming: {simulatedResult.incomingCalls}</p>
                    <div className="space-y-1">
                      <p className="font-bold">Top Intercepted Connections:</p>
                      {simulatedResult.frequentContacts.map((c: string, idx: number) => (
                        <div key={idx} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                          {c}
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-red-400 font-semibold">{simulatedResult.voipInterceptions}</p>
                  </>
                )}

                {simulatedResult.type === 'Cyber' && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/30">
                      <span className="font-mono text-sm font-black text-yellow-500">{simulatedResult.targetIp}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-600 text-white rounded">{simulatedResult.threatScore}</span>
                    </div>
                    <p><strong>ISP & AS Number:</strong> {simulatedResult.isp}</p>
                    <p><strong>Reverse DNS:</strong> {simulatedResult.reverseDns}</p>
                    <p><strong>Location:</strong> {simulatedResult.geoCity}</p>
                    <p><strong>Open Ports:</strong> {simulatedResult.portsDetected}</p>
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
                      <strong>SCADA Attack Analysis:</strong> {simulatedResult.connectionTimeline}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={`p-8 rounded-xl border border-dashed text-center space-y-2 ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}>
                <Crosshair className="w-8 h-8 text-yellow-500 mx-auto opacity-70" />
                <p className="text-xs font-bold">No Query Performed Yet</p>
                <p className="text-[11px]">
                  Enter a target identifier and click <strong>"Live Query"</strong> to pull encrypted departmental intelligence.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-[11px] text-slate-400">
            <span>Secure Tunnel: Encrypted 256-bit SHA</span>
            <span className="text-yellow-500 font-semibold">Government of India Intranet</span>
          </div>
        </div>
      </div>

      {/* Requisitions Active Ledger */}
      <div className={`p-6 rounded-2xl border transition-all ${
        themeMode === 'bright' ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-xl'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30 mb-4">
          <div className="flex items-center space-x-2.5">
            <FileCheck2 className="w-5 h-5 text-yellow-500" />
            <h3 className={`text-sm sm:text-base font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
              Lodged Requisitions & Departmental Permits Ledger ({requisitions.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b ${themeMode === 'bright' ? 'border-slate-200 text-slate-600 bg-slate-50' : 'border-slate-800 text-slate-400 bg-slate-950/50'}`}>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Requisition Domain</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Case Reference</th>
                <th className="p-3">Legal Basis</th>
                <th className="p-3">Status</th>
                <th className="p-3">Officer</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeMode === 'bright' ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {requisitions.map((req) => (
                <tr key={req.id} className={themeMode === 'bright' ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}>
                  <td className="p-3 font-mono font-bold text-yellow-500">{req.id}</td>
                  <td className="p-3 font-semibold">{req.type}</td>
                  <td className="p-3 font-mono">{req.targetEntity}</td>
                  <td className="p-3 font-bold text-blue-400">{req.caseRef}</td>
                  <td className="p-3">{req.urgency}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status.includes('Approved')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">{req.requestedBy}</p>
                    <p className="text-[10px] text-slate-400">{req.badgeId}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
