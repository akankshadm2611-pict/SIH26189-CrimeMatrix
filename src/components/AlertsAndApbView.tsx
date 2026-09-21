import React, { useState } from 'react';
import { User } from '../types';
import { INDIAN_STATES_AND_CITIES } from '../data/indianLocations';
import { Radio, Send, ShieldAlert, CheckCircle2, Clock, MapPin, Building2, FileText, AlertTriangle, Printer, Search, Filter } from 'lucide-react';

export interface ApbAlert {
  id: string;
  referenceNo: string;
  state: string;
  policeStation: string;
  category: 'Suspect Apprehension' | 'Vehicle Tracking' | 'Missing Person' | 'Cross-Border Narcotics' | 'Inter-State Gang' | 'General Intelligence';
  urgency: 'Normal' | 'High' | 'Flash APB (Critical)';
  purposeDescription: string;
  issuingOfficer: string;
  issuingRole: string;
  issuingDepartment: string;
  caseRefId?: string;
  timestamp: string;
  status: 'Transmitted' | 'Acknowledged' | 'Action In Progress';
}

const INITIAL_ALERTS: ApbAlert[] = [
  {
    id: 'apb-1',
    referenceNo: 'APB/INTER-ST/2026/089',
    state: 'Karnataka',
    policeStation: 'Koramangala Police Station, Bengaluru',
    category: 'Suspect Apprehension',
    urgency: 'Flash APB (Critical)',
    purposeDescription: 'Wanted prime suspect in City Central Bank Heist (Ref: CR-2026-8942) tracked moving towards Electronic City toll corridor. Coordinate apprehension and hold in transit custody.',
    issuingOfficer: 'DSP Rajesh Deshmukh',
    issuingRole: 'DSP',
    issuingDepartment: 'State Police HQ - Crime Branch',
    caseRefId: 'CR-2026-8942',
    timestamp: '14 Sep 2026, 11:20 AM',
    status: 'Action In Progress',
  },
  {
    id: 'apb-2',
    referenceNo: 'APB/INTER-ST/2026/074',
    state: 'Delhi',
    policeStation: 'Connaught Place Police Station, New Delhi',
    category: 'Inter-State Gang',
    urgency: 'High',
    purposeDescription: 'Requisition for verification of fake high-yield bond certificates linked with Apex Capital Ponzi syndicate operating interstate shells.',
    issuingOfficer: 'Host Inspector Amit Verma',
    issuingRole: 'Host',
    issuingDepartment: 'Metro Central Precinct',
    caseRefId: 'CR-2026-6119',
    timestamp: '12 Sep 2026, 04:45 PM',
    status: 'Acknowledged',
  },
  {
    id: 'apb-3',
    referenceNo: 'APB/INTER-ST/2026/058',
    state: 'Gujarat',
    policeStation: 'Kandla Port Marine Police Station',
    category: 'Cross-Border Narcotics',
    urgency: 'High',
    purposeDescription: 'Alert regarding intercepted commercial vessel shipping container routes linked to narcotic trans-shipment syndicate.',
    issuingOfficer: 'Sub-Inspector Vikram Sharma',
    issuingRole: 'Police Officer',
    issuingDepartment: 'Special Crime Cell Unit 4',
    caseRefId: 'CR-2026-7731',
    timestamp: '10 Sep 2026, 02:15 PM',
    status: 'Transmitted',
  },
];

interface AlertsAndApbViewProps {
  currentUser: User;
  themeMode?: 'dark' | 'bright';
}

export const AlertsAndApbView: React.FC<AlertsAndApbViewProps> = ({
  currentUser,
  themeMode = 'dark',
}) => {
  const [alerts, setAlerts] = useState<ApbAlert[]>(INITIAL_ALERTS);

  // Form State
  const [selectedState, setSelectedState] = useState<string>(INDIAN_STATES_AND_CITIES[0]?.state || 'Maharashtra');
  const [policeStation, setPoliceStation] = useState<string>('');
  const [category, setCategory] = useState<ApbAlert['category']>('Suspect Apprehension');
  const [urgency, setUrgency] = useState<ApbAlert['urgency']>('High');
  const [purposeDescription, setPurposeDescription] = useState<string>('');
  const [caseRefId, setCaseRefId] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('ALL');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedState || !policeStation.trim() || !purposeDescription.trim()) {
      alert('Please select a State, enter the Police Station name, and specify the description/purpose.');
      return;
    }

    const newAlert: ApbAlert = {
      id: `apb-${Date.now()}`,
      referenceNo: `APB/INTER-ST/2026/${Math.floor(100 + Math.random() * 900)}`,
      state: selectedState,
      policeStation: policeStation.trim(),
      category,
      urgency,
      purposeDescription: purposeDescription.trim(),
      issuingOfficer: currentUser.fullName,
      issuingRole: currentUser.role,
      issuingDepartment: currentUser.department || `${currentUser.role} Unit`,
      caseRefId: caseRefId.trim() || undefined,
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'Transmitted',
    };

    setAlerts([newAlert, ...alerts]);
    setPoliceStation('');
    setPurposeDescription('');
    setCaseRefId('');
    setSuccessMessage(`APB Broadcast #${newAlert.referenceNo} successfully transmitted to ${newAlert.policeStation} (${newAlert.state}).`);
    setTimeout(() => setSuccessMessage(''), 6000);
    setActiveTab('history');
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.policeStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.purposeDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = filterState === 'ALL' || a.state === filterState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="border-b border-yellow-500/20 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-500 border border-red-500/40">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-yellow-400'}`}>
                Inter-State Alerts & All Points Bulletin (APBs)
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                Official coordination network for dispatching priority alerts and contacting police stations across India.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className={`flex items-center space-x-1 p-1 rounded-xl text-xs font-bold border ${
          themeMode === 'bright' ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-blue-900/50'
        }`}>
          <button
            id="tab-apb-create"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-yellow-500 text-slate-950 font-black shadow-md'
                : themeMode === 'bright'
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transmit New Alert
          </button>
          <button
            id="tab-apb-history"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-yellow-500 text-slate-950 font-black shadow-md'
                : themeMode === 'bright'
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Broadcast Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">{alerts.length}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 transition-all ${
          themeMode === 'bright' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Main Tab: Create and Transmit Alert */}
      {activeTab === 'create' && (
        <div className={`p-5 sm:p-7 rounded-2xl border transition-all ${
          themeMode === 'bright'
            ? 'bg-white border-slate-300 shadow-md'
            : 'bg-slate-900/80 border-blue-900/50 shadow-xl'
        }`}>
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-700/30 mb-6">
            <Send className="w-5 h-5 text-yellow-500" />
            <h2 className={`text-base sm:text-lg font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
              Contact Other State Police Stations & Issue APB
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Indian State Selector */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  1. Select Target State (India) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="apb-state-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-yellow-500 outline-hidden transition-all ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                    required
                  >
                    {INDIAN_STATES_AND_CITIES.map((st) => (
                      <option key={st.state} value={st.state}>
                        {st.state}
                      </option>
                    ))}
                  </select>
                </div>
                <p className={`text-[11px] mt-1.5 flex items-center ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <MapPin className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                  Broadcast routes to all state jurisdiction dispatch servers
                </p>
              </div>

              {/* 2. Police Station Name Text Box */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  2. Police Station Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="apb-police-station-input"
                    type="text"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    placeholder="e.g. Koramangala Police Station / Cyber Cell HQ"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-yellow-500 outline-hidden transition-all ${
                      themeMode === 'bright'
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
                <p className={`text-[11px] mt-1.5 ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Specify the target station, commissionerate, or district outpost
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Category */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-yellow-500 outline-hidden transition-all ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="Suspect Apprehension">Suspect Apprehension</option>
                  <option value="Vehicle Tracking">Vehicle Tracking</option>
                  <option value="Missing Person">Missing Person</option>
                  <option value="Cross-Border Narcotics">Cross-Border Narcotics</option>
                  <option value="Inter-State Gang">Inter-State Gang</option>
                  <option value="General Intelligence">General Intelligence</option>
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-yellow-500 outline-hidden transition-all ${
                    urgency === 'Flash APB (Critical)'
                      ? 'text-red-500'
                      : urgency === 'High'
                      ? 'text-amber-500'
                      : 'text-blue-500'
                  } ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-950 border-slate-700'
                  }`}
                >
                  <option value="Normal">Routine Coordination</option>
                  <option value="High">High Urgency</option>
                  <option value="Flash APB (Critical)">Flash APB (Immediate Action)</option>
                </select>
              </div>

              {/* Case Reference ID (Optional) */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Linked Case / FIR ID (Optional)
                </label>
                <input
                  type="text"
                  value={caseRefId}
                  onChange={(e) => setCaseRefId(e.target.value)}
                  placeholder="e.g. CR-2026-8942"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-yellow-500 outline-hidden transition-all ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>

            {/* 3. Description / Purpose Box */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                3. Description & Purpose of Contact <span className="text-red-500">*</span>
              </label>
              <textarea
                id="apb-description-textarea"
                rows={4}
                value={purposeDescription}
                onChange={(e) => setPurposeDescription(e.target.value)}
                placeholder="Write the exact description for what purpose you are contacting this police station (e.g. Suspect physical description, vehicle license number, last known location ping, request for CCTV backup, joint raid coordination, arrest warrant execution assistance)..."
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-yellow-500 outline-hidden leading-relaxed transition-all ${
                  themeMode === 'bright'
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500'
                }`}
                required
              />
              <p className={`text-[11px] mt-1.5 ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                Transmitted securely with your authenticated credentials: <span className="font-semibold text-yellow-500">{currentUser.fullName} ({currentUser.role}, {currentUser.badgeId})</span>
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                id="apb-submit-button"
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 shadow-lg shadow-red-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Alert & Dispatch APB</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast History & Received Responses */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts, police station, or reference..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-hidden ${
                  themeMode === 'bright'
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-yellow-500" />
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border outline-hidden ${
                  themeMode === 'bright'
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                <option value="ALL">All States</option>
                {Array.from(new Set(alerts.map((a) => a.state))).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Alerts Cards */}
          <div className="space-y-3.5">
            {filteredAlerts.length === 0 ? (
              <div className={`p-8 rounded-2xl border text-center space-y-2 ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-600' : 'bg-slate-900/40 border-slate-800 text-slate-400'
              }`}>
                <ShieldAlert className="w-8 h-8 text-yellow-500 mx-auto" />
                <p className="text-sm font-bold">No Alerts Found</p>
                <p className="text-xs">No APBs match your filter criteria.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    themeMode === 'bright'
                      ? 'bg-white border-slate-300 shadow-sm text-slate-900'
                      : 'bg-slate-900/80 border-blue-900/50 text-slate-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/30">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                        {alert.referenceNo}
                      </span>
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                        alert.urgency === 'Flash APB (Critical)'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : alert.urgency === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                      }`}>
                        {alert.urgency}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        themeMode === 'bright' ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {alert.category}
                      </span>
                      {alert.caseRefId && (
                        <span className="text-[11px] font-semibold text-blue-400">
                          Ref: {alert.caseRefId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.status === 'Action In Progress'
                          ? 'bg-amber-500/20 text-amber-400'
                          : alert.status === 'Acknowledged'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.status}
                      </span>
                      <span className={`text-[11px] ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {alert.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">
                          Recipient Station: <span className="text-yellow-500">{alert.policeStation}</span> ({alert.state})
                        </p>
                      </div>
                    </div>

                    <p className={`text-xs sm:text-sm pl-6 leading-relaxed ${themeMode === 'bright' ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                      {alert.purposeDescription}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 ${
                    themeMode === 'bright' ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
                  }`}>
                    <span>
                      Dispatched By: <strong className="text-slate-200 font-semibold">{alert.issuingOfficer}</strong> ({alert.issuingRole}, {alert.issuingDepartment})
                    </span>
                    <button
                      onClick={() => window.alert(`Printing official APB Dispatch Order for Reference ${alert.referenceNo}...`)}
                      className={`inline-flex items-center space-x-1 font-bold transition-colors cursor-pointer ${
                        themeMode === 'bright' ? 'text-blue-700 hover:text-blue-900' : 'text-yellow-400 hover:text-yellow-300'
                      }`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print APB Dispatch Slip</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
