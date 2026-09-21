import React, { useState, useEffect } from 'react';
import {
  User,
  Case,
  Suspect,
  RegistrationRequest,
  PortalNotification,
  EvidenceFile,
  TimelineEntry,
  ComplaintData,
} from './types';
import {
  initialUsers,
  initialCases,
  initialSuspects,
  initialRegistrationRequests,
  initialNotifications,
  initialComplaints,
  crimeDistributionData,
  monthlyCrimeData,
} from './data/mockData';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { RegistrationModal } from './components/RegistrationModal';
import { DspDashboard } from './components/DspDashboard';
import { HostDashboard } from './components/HostDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AdvocateDashboard } from './components/AdvocateDashboard';
import { VictimDashboard } from './components/VictimDashboard';
import { CaseDetailModal } from './components/CaseDetailModal';
import { SuspectManagement } from './components/SuspectManagement';
import { PendingApprovalModal } from './components/PendingApprovalModal';
import { ComplaintRegistrationModal } from './components/ComplaintRegistrationModal';
import { PortalSidebar, PortalViewMode } from './components/PortalSidebar';
import { CaseManagementView } from './components/CaseManagementView';
import { AlertsAndApbView } from './components/AlertsAndApbView';
import { RequestAndAccessView } from './components/RequestAndAccessView';
import { FingerprintMatchingView } from './components/FingerprintMatchingView';
import { ScheduleView } from './components/ScheduleView';
import { SettingsView } from './components/SettingsView';
import { OfficerRegistrationView } from './components/OfficerRegistrationView';
import { CitizenComplaintsView } from './components/CitizenComplaintsView';
import { StateGovtDashboard } from './components/StateGovtDashboard';
import { StateGovtRegisteredOfficersView } from './components/StateGovtRegisteredOfficersView';
import { SubdivisionDspContactView } from './components/SubdivisionDspContactView';
import { DistrictSubdivisionContactsView } from './components/DistrictSubdivisionContactsView';
import { CrimeMap } from './components/CrimeMap';
import { CaseHeatmap } from './components/CaseHeatmap';
import { DashboardCharts } from './components/DashboardCharts';
import { DistrictDashboardView } from './components/DistrictDashboardView';
import { useLanguage } from './context/LanguageContext';
import { isCaseInOfficerTalukas } from './utils/caseUtils';
import { Shield, FolderLock, Building2, MapPin, PhoneCall, ChevronRight, Edit3, ArrowRight, Eye, CheckCircle2, FolderKanban, Clock, AlertCircle, Search } from 'lucide-react';

export default function App() {
  // Global Language context
  const { language } = useLanguage();

  // Application Global States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'bright'>('bright');
  const [currentView, setCurrentView] = useState<PortalViewMode>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Removed non-Solapur legacy suspects
  const REMOVED_SUSPECT_IDS = new Set(['SUS-9012', 'SUS-9013', 'SUS-9014', 'SUS-9015']);

  // Shared Data States
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [suspects, setSuspects] = useState<Suspect[]>(() => {
    try {
      const saved = localStorage.getItem('portal_suspects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Remove the 4 non-Solapur suspects and keep only Solapur district suspects
          const validSaved = parsed.filter(
            (s: Suspect) => !REMOVED_SUSPECT_IDS.has(s.id) && (!s.district || s.district.toLowerCase() === 'solapur')
          );
          const merged = [...validSaved];
          initialSuspects.forEach((initSus) => {
            const idx = merged.findIndex((s: Suspect) => s.id === initSus.id);
            if (idx !== -1) {
              merged[idx] = {
                ...merged[idx],
                taluka: initSus.taluka,
                district: 'Solapur',
                state: 'Maharashtra',
              };
            } else {
              merged.push(initSus);
            }
          });
          const solapurOnly = merged
            .filter((s: Suspect) => !REMOVED_SUSPECT_IDS.has(s.id))
            .map((s: Suspect) => ({
              ...s,
              district: 'Solapur',
              state: 'Maharashtra',
            }));
          try {
            localStorage.setItem('portal_suspects', JSON.stringify(solapurOnly));
          } catch {
            // ignore
          }
          return solapurOnly;
        }
      }
    } catch {
      // ignore
    }
    return initialSuspects.filter((s) => !REMOVED_SUSPECT_IDS.has(s.id));
  });

  // Sync suspects with localStorage
  useEffect(() => {
    try {
      const cleaned = suspects
        .filter((s) => !REMOVED_SUSPECT_IDS.has(s.id))
        .map((s) => ({ ...s, district: 'Solapur', state: 'Maharashtra' }));
      localStorage.setItem('portal_suspects', JSON.stringify(cleaned));
    } catch {
      // ignore
    }
  }, [suspects]);
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>(initialRegistrationRequests);
  const [notifications, setNotifications] = useState<PortalNotification[]>(initialNotifications);
  const [complaints, setComplaints] = useState<ComplaintData[]>(initialComplaints);

  // Modals
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [selectedCaseModal, setSelectedCaseModal] = useState<Case | null>(null);
  const [isCaseModalReadOnly, setIsCaseModalReadOnly] = useState<boolean>(false);
  const [subdivisionCaseMode, setSubdivisionCaseMode] = useState<'all' | 'major'>('all');
  const [selectedPendingRequestModal, setSelectedPendingRequestModal] = useState<RegistrationRequest | null>(null);
  const [isCreateCaseTriggered, setIsCreateCaseTriggered] = useState<boolean>(false);

  // Toggle Theme Mode (Persists across all pages!)
  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  // Login Success Handler: Default to bright mode upon login
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setThemeMode('bright');
    setCurrentView('dashboard');
  };

  // Logout Handler: Reset to default bright mode
  const handleLogout = () => {
    setCurrentUser(null);
    setThemeMode('bright');
    setCurrentView('dashboard');
  };

  // Submit New Registration Request
  const handleSubmitRegistration = (req: RegistrationRequest) => {
    setPendingRequests((prev) => [req, ...prev]);

    // Push notification to Host / DSP approvers
    const newNotif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Verification Request',
      message: `${req.fullName} (${req.role}) has submitted a registration request for approval.`,
      timestamp: 'Just now',
      type: 'Registration',
      targetRole: req.assignedToRole,
      relatedRequestId: req.id,
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Submit Online Complaint (Victim Citizen Portal)
  // RULE: When submitted by victim -> Notify ONLY 'Police Officer'
  const handleSubmitComplaint = (complaint: ComplaintData) => {
    // Add to complaints state with status Pending
    const pendingComplaint: ComplaintData = {
      ...complaint,
      status: 'Pending',
    };
    setComplaints((prev) => [pendingComplaint, ...prev]);

    // Create user for victim if not already existing so they can log in to check progress
    const victimUsername = complaint.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `victim${Math.floor(100 + Math.random() * 900)}`;
    const existingVic = users.find((u) => u.username.toLowerCase() === victimUsername || u.phone === complaint.mobile);

    if (!existingVic) {
      const newVictimUser: User = {
        id: `u-victim-${Date.now()}`,
        username: victimUsername,
        fullName: complaint.fullName,
        role: 'Victim',
        email: complaint.email,
        phone: complaint.mobile,
        department: 'Citizen Complainant',
        badgeId: complaint.id,
        status: 'Approved',
      };
      setUsers((prev) => [...prev, newVictimUser]);
    }

    // Push notification ONLY to 'Police Officer'
    const newNotif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Citizen e-FIR Complaint Received',
      message: `Citizen ${complaint.fullName} submitted e-FIR complaint for '${complaint.category}' (${complaint.city}). Reference: ${complaint.id}. Action required: Review and provide remark (Registered / Fake / Pending).`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      targetRole: 'Police Officer', // NOTIFY ONLY POLICE OFFICER!
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Police Officer reviews complaint and gives remark: 'Registered', 'Fake', or 'Pending'
  // RULE: When Police Officer marks 'Registered' -> Create Case (Host Unassigned) and notify ONLY 'DSP'
  const handleReviewComplaint = (
    complaintId: string,
    remark: 'Registered' | 'Fake' | 'Pending',
    officerRemarks: string
  ) => {
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    let createdCaseId = target.registeredCaseId;

    if (remark === 'Registered' && !target.registeredCaseId) {
      createdCaseId = `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Find or establish victim user ID
      const victimUser = users.find((u) => u.phone === target.mobile || u.email === target.email);

      const newCase: Case = {
        id: createdCaseId,
        crimeType: target.category,
        dateAssigned: new Date().toISOString().split('T')[0],
        caseName: `Online FIR: ${target.category} - ${target.city}`,
        victimId: victimUser ? victimUser.id : `u-vic-${Date.now()}`,
        victimUsername: victimUser ? victimUser.username : target.email.split('@')[0],
        victimName: target.fullName,
        witnessName: target.witnessInfo,
        location: `${target.incidentLocation}, ${target.city}, ${target.state}`,
        description: `${target.incidentDescription}\n\n[Complainant Contact: +91 ${target.mobile} | Email: ${target.email}]${
          target.estimatedLoss ? `\nEstimated Loss: ${target.estimatedLoss}` : ''
        }${target.suspectInfo ? `\nSuspect Info: ${target.suspectInfo}` : ''}\n\n[Investigating Officer Verification: ${officerRemarks}]`,
        status: 'Under Investigation',
        assignedHostId: '', // Unassigned - DSP must assign Host!
        assignedHostName: 'Unassigned',
        assignedOfficerIds: [currentUser ? currentUser.id : 'u-po-1'],
        assignedOfficerNames: [currentUser ? currentUser.fullName : 'Inspector Vikram Rathore'],
        assignedAdvocateIds: [],
        assignedAdvocateNames: [],
        evidence: target.evidenceFiles.map((f, i) => ({
          id: `ev-comp-${Date.now()}-${i}`,
          caseId: createdCaseId!,
          fileName: f.name,
          fileType: f.type === 'Image' ? 'Image' : 'Document',
          description: `Evidence attached with complaint: ${f.name}`,
          uploadedBy: target.fullName,
          uploadedByRole: 'Victim',
          uploadedAt: new Date().toLocaleString(),
          fileSize: f.size,
          url: f.url,
        })),
        createdAt: new Date().toISOString().split('T')[0],
        priority: 'High',
        timeline: [
          {
            id: `tl-${Date.now()}-1`,
            timestamp: target.submittedAt,
            title: 'Online Complaint Submitted by Citizen',
            description: `Citizen filed e-FIR complaint for '${target.category}'. Acknowledgement: ${target.id}.`,
            performerName: target.fullName,
            performerRole: 'Victim',
            statusTag: 'Completed',
          },
          {
            id: `tl-${Date.now()}-2`,
            timestamp: new Date().toLocaleString(),
            title: 'Police Officer Verified & Registered as FIR',
            description: `Investigating Officer (${currentUser?.fullName || 'Police Officer'}) verified facts and approved official registration. Remarks: ${officerRemarks}`,
            performerName: currentUser?.fullName || 'Police Officer',
            performerRole: 'Police Officer',
            statusTag: 'Completed',
          },
          {
            id: `tl-${Date.now()}-3`,
            timestamp: new Date().toLocaleString(),
            title: 'Awaiting DSP Station Host Assignment',
            description: 'Case escalated to DSP Command Headquarters for assigning Station Host Inspector.',
            performerName: 'DSP Headquarters',
            performerRole: 'DSP',
            statusTag: 'Pending',
          },
        ],
      };

      setCases((prev) => [newCase, ...prev]);

      // NOTIFY ONLY THE 'DSP'!
      const dspNotif: PortalNotification = {
        id: `notif-${Date.now()}`,
        title: 'New Registered FIR - Host Assignment Required',
        message: `Officer ${currentUser?.fullName || 'Police Officer'} verified and REGISTERED complaint ${target.id} (${target.category}, ${target.city}). Action required: DSP must review case and assign Host Inspector.`,
        timestamp: 'Just now',
        type: 'CaseAssigned',
        targetRole: 'DSP', // NOTIFY ONLY DSP!
        relatedCaseId: createdCaseId,
        read: false,
      };
      setNotifications((prev) => [dspNotif, ...prev]);
    }

    // Update the complaint record
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: remark,
              officerRemarks,
              reviewedByOfficerName: currentUser?.fullName,
              reviewedByOfficerId: currentUser?.id,
              reviewedAt: new Date().toLocaleString(),
              registeredCaseId: createdCaseId,
            }
          : c
      )
    );
  };

  // Approve Pending User Request
  const handleApproveRequest = (reqId: string) => {
    const targetReq = pendingRequests.find((r) => r.id === reqId);
    if (!targetReq) return;

    // Update request status
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Approved' } : r))
    );

    // Create new approved User
    const newUser: User = {
      id: `u-${targetReq.role.toLowerCase().replace(/\s+/g, '')}-${Date.now()}`,
      username: targetReq.username,
      fullName: targetReq.fullName,
      role: targetReq.role,
      email: targetReq.email,
      phone: targetReq.phone,
      department: targetReq.department,
      badgeId: targetReq.badgeId,
      status: 'Approved',
      state: targetReq.state || (currentUser?.role === 'DSP' ? (currentUser.state || 'Maharashtra') : 'Maharashtra'),
      district: targetReq.district || (currentUser?.role === 'DSP' ? (currentUser.district || 'Solapur') : 'Solapur'),
      talukas: targetReq.talukas || (targetReq.taluka ? [targetReq.taluka] : (currentUser?.role === 'DSP' ? (currentUser.talukas || [currentUser.taluka || 'Karmala']) : ['Karmala'])),
      taluka: targetReq.taluka || (targetReq.talukas && targetReq.talukas[0]) || (currentUser?.role === 'DSP' ? (currentUser.taluka || 'Karmala') : 'Karmala'),
    };

    setUsers((prev) => [...prev, newUser]);
  };

  // Reject Pending Request
  const handleRejectRequest = (reqId: string) => {
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Rejected' } : r))
    );
  };

  // Update Case Status (e.g. automatically set to Solved when progress reaches 100%)
  const handleUpdateCaseStatus = (caseId: string, status: Case['status']) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updated = { ...c, status };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updated);
          }
          return updated;
        }
        return c;
      })
    );
  };

  // DSP Reassigns or Removes Host from Case
  const handleUpdateCaseHost = (caseId: string, hostId: string, hostName: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newTimelineEntry: TimelineEntry = {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            title: hostId ? 'Station Host Inspector Designated' : 'Host Designation Cleared',
            description: hostId
              ? `DSP Command Headquarters designated ${hostName} as the primary Station Host Inspector.`
              : 'DSP Headquarters cleared current Host designation.',
            performerName: currentUser?.fullName || 'DSP Command Headquarters',
            performerRole: 'DSP',
            statusTag: hostId ? 'Completed' : 'Pending',
          };
          return {
            ...c,
            assignedHostId: hostId,
            assignedHostName: hostName || 'Unassigned',
            timeline: [...c.timeline, newTimelineEntry],
          };
        }
        return c;
      })
    );

    if (hostId) {
      const notif: PortalNotification = {
        id: `notif-${Date.now()}`,
        title: 'Case Host Assigned by DSP',
        message: `DSP assigned Case ${caseId} to Host ${hostName}.`,
        timestamp: 'Just now',
        type: 'CaseAssigned',
        targetRole: 'Host',
        relatedCaseId: caseId,
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    if (selectedCaseModal && selectedCaseModal.id === caseId) {
      setSelectedCaseModal((prev) =>
        prev
          ? {
              ...prev,
              assignedHostId: hostId,
              assignedHostName: hostName || 'Unassigned',
            }
          : null
      );
    }
  };

  // DSP Assigns Case to Subdivision Level Officer (High Authority)
  const handleAssignSubdivision = (
    caseId: string,
    officerId: string,
    officerName: string,
    taluka?: string,
    policeStation?: string,
    notes?: string
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newTimelineEntry = {
            id: `tl-${Date.now()}`,
            timestamp:
              new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
              ', ' +
              new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            title: 'Case Escalated to Subdivision Level Officer (SDPO)',
            description: `DSP Command Headquarters transferred case enquiry to SDPO ${officerName} (${taluka || 'Subdivision'} Taluka • ${policeStation || 'Police Station'}). Directives: ${notes || 'Conduct comprehensive enquiry and supervision.'}`,
            performerName: currentUser?.fullName || 'DSP Command Headquarters',
            performerRole: 'DSP',
            statusTag: 'Under Investigation',
          };
          return {
            ...c,
            assignedSubdivisionOfficerId: officerId,
            assignedSubdivisionOfficerName: officerName,
            subdivisionTaluka: taluka,
            subdivisionStation: policeStation,
            subdivisionNotes: notes,
            subdivisionEscalatedAt: new Date().toISOString(),
            isMajorCase: true,
            subdivisionOfficerInCharge: false,
            status: c.status === 'Solved' ? 'Solved' : 'Under Investigation',
            timeline: [...c.timeline, newTimelineEntry],
          };
        }
        return c;
      })
    );

    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'High Authority Case Escalation',
      message: `DSP transferred Case ${caseId} to Subdivision Officer ${officerName} for enquiry.`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      targetRole: 'Subdivision Level',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (selectedCaseModal && selectedCaseModal.id === caseId) {
      setSelectedCaseModal((prev) =>
        prev
          ? {
              ...prev,
              assignedSubdivisionOfficerId: officerId,
              assignedSubdivisionOfficerName: officerName,
              subdivisionTaluka: taluka,
              subdivisionStation: policeStation,
              subdivisionNotes: notes,
              subdivisionEscalatedAt: new Date().toISOString(),
              isMajorCase: true,
              subdivisionOfficerInCharge: false,
              status: prev.status === 'Solved' ? 'Solved' : 'Under Investigation',
            }
          : null
      );
    }
  };

  // SDPO Assumes High Authority Charge on Investigation of Major Case
  const handleTakeChargeSubdivision = (caseId: string, directives?: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newTimelineEntry = {
            id: `tl-${Date.now()}`,
            timestamp:
              new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
              ', ' +
              new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            title: 'SDPO Assumed Investigation Charge',
            description:
              directives ||
              `High Authority investigation charge officially assumed by SDPO ${currentUser?.fullName || 'Arvind Shinde'}. Direct supervision initiated.`,
            performerName: currentUser?.fullName || 'SDPO',
            performerRole: 'Subdivision Level' as any,
            statusTag: 'In Progress',
          };
          const updated: Case = {
            ...c,
            subdivisionOfficerInCharge: true,
            inChargeOfficerName: currentUser?.fullName || 'SDPO Arvind Shinde',
            subdivisionNotes: directives || c.subdivisionNotes,
            status: c.status === 'Pending' ? 'Active' : c.status,
            timeline: [...(c.timeline || []), newTimelineEntry],
          };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updated);
          }
          return updated;
        }
        return c;
      })
    );

    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Investigation Charge Assumed',
      message: `SDPO ${currentUser?.fullName || 'Arvind Shinde'} has officially assumed high authority charge on Case ${caseId}.`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      targetRole: 'DSP',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // SDPO Updates and Modifies Major Case Details
  const handleUpdateCaseDetails = (caseId: string, updates: Partial<Case>) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newTimelineEntry = {
            id: `tl-${Date.now()}`,
            timestamp:
              new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
              ', ' +
              new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            title: 'Case Particulars Updated by SDPO',
            description: `SDPO ${currentUser?.fullName || 'Arvind Shinde'} updated case details. Status: ${updates.status || c.status}, Priority: ${updates.priority || c.priority}.${
              updates.subdivisionNotes ? ` Directives: ${updates.subdivisionNotes}` : ''
            }`,
            performerName: currentUser?.fullName || 'SDPO',
            performerRole: 'Subdivision Level' as any,
            statusTag: updates.status === 'Solved' ? 'Completed' : 'In Progress',
          };
          const updated: Case = {
            ...c,
            ...updates,
            timeline: [...(c.timeline || []), newTimelineEntry],
          };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updated);
          }
          return updated;
        }
        return c;
      })
    );

    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Case Particulars Modified',
      message: `SDPO ${currentUser?.fullName || 'Arvind Shinde'} modified parameters for Case ${caseId}.`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      targetRole: 'DSP',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // SDPO Escalates Case to Higher Authority (District Level Officer)
  const handleEscalateToHigherAuthority = (
    caseId: string,
    data: { description: string; district: string; districtOfficerId: string; districtOfficerName: string }
  ) => {
    const nowStr =
      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            isEscalatedToDistrict: true,
            district: data.district,
            assignedDistrictOfficerId: data.districtOfficerId,
            assignedDistrictOfficerName: data.districtOfficerName,
            districtNotes: data.description,
            districtEscalatedAt: new Date().toISOString(),
            districtAccessMode: 'updating',
            timeline: [
              ...(c.timeline || []),
              {
                id: `tl-dist-${Date.now()}`,
                timestamp: nowStr,
                title: 'Higher Authority Case Assignment',
                description: `Enquiry transferred to District Level Officer ${data.districtOfficerName} (${data.district} District). Directives: ${data.description}`,
                performerName: currentUser?.fullName || 'Subdivision Level Officer',
                performerRole: currentUser?.role || 'Subdivision Level',
                statusTag: 'In Progress',
              },
            ],
          };
        }
        return c;
      })
    );

    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Higher Authority Case Assignment',
      message: `SDPO ${currentUser?.fullName || 'Arvind Shinde'} assigned Case ${caseId} to District Level Officer ${data.districtOfficerName} (${data.district} District).`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      targetRole: 'District Level',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // DSP Creates New Case
  const handleCreateCase = (newCase: Case) => {
    setCases((prev) => [newCase, ...prev]);

    // Notify assigned Host
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Case Assigned by DSP',
      message: `DSP assigned Case ${newCase.id} (${newCase.caseName}) to Host ${newCase.assignedHostName}.`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      targetRole: 'Host',
      relatedCaseId: newCase.id,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Host Adds Police Officers, Advocates & Victim to Case
  const handleAddMemberToCase = (
    caseId: string,
    officerIds: string[],
    advocateIds: string[],
    victimId?: string,
    victimName?: string,
    victimUsername?: string
  ) => {
    const officerNames = users.filter((u) => officerIds.includes(u.id)).map((u) => u.fullName);
    const advocateNames = users.filter((u) => advocateIds.includes(u.id)).map((u) => u.fullName);

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          let updatedVictimId = victimId !== undefined ? victimId : c.victimId;
          let updatedVictimName = victimName !== undefined && victimName.trim() !== '' ? victimName : c.victimName;
          let updatedVictimUsername = victimUsername !== undefined ? victimUsername : c.victimUsername;

          if (victimId) {
            const vic = users.find((u) => u.id === victimId);
            if (vic) {
              updatedVictimName = vic.fullName;
              updatedVictimUsername = vic.username;
            }
          }

          return {
            ...c,
            assignedOfficerIds: officerIds,
            assignedOfficerNames: officerNames,
            assignedAdvocateIds: advocateIds,
            assignedAdvocateNames: advocateNames,
            victimId: updatedVictimId,
            victimName: updatedVictimName,
            victimUsername: updatedVictimUsername,
          };
        }
        return c;
      })
    );
  };

  // Host / DSP Assigns Team from Police Officers to Case
  const handleAssignTeamToCase = (caseId: string, officerIds: string[]) => {
    const officerNames = users
      .filter((u) => officerIds.includes(u.id))
      .map((u) => u.fullName);

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updated: Case = {
            ...c,
            assignedOfficerIds: officerIds,
            assignedOfficerNames: officerNames,
          };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updated);
          }
          return updated;
        }
        return c;
      })
    );

    const targetCase = cases.find((c) => c.id === caseId);
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Investigation Team Assigned',
      message: `${currentUser?.fullName || 'Host'} updated the police investigation team for Case ${caseId} (${targetCase?.caseName || ''}) with ${officerIds.length} officer(s).`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Upload Evidence File to Case
  const handleUploadEvidence = (caseId: string, evidence: EvidenceFile) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedEvidence = [evidence, ...c.evidence];
          const updatedCase = { ...c, evidence: updatedEvidence };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updatedCase);
          }
          return updatedCase;
        }
        return c;
      })
    );

    // Push notification to all assigned members
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Evidence Uploaded',
      message: `${evidence.uploadedBy} (${evidence.uploadedByRole}) uploaded file "${evidence.fileName}" to Case ${caseId}.`,
      timestamp: 'Just now',
      type: 'Evidence',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Update Evidence File in Case (Notes, Title, Description, Category, etc.)
  const handleUpdateEvidence = (caseId: string, updatedEvidence: EvidenceFile) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedEvidenceList = c.evidence.map((ev) =>
            ev.id === updatedEvidence.id ? updatedEvidence : ev
          );
          const updatedCase = { ...c, evidence: updatedEvidenceList };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updatedCase);
          }
          return updatedCase;
        }
        return c;
      })
    );

    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Evidence File Updated',
      message: `Evidence file "${updatedEvidence.fileName}" notes/details were updated in Case ${caseId}.`,
      timestamp: 'Just now',
      type: 'Evidence',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Delete Evidence File from Case
  const handleDeleteEvidence = (caseId: string, evidenceId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedEvidence = c.evidence.filter((ev) => ev.id !== evidenceId);
          return { ...c, evidence: updatedEvidence };
        }
        return c;
      })
    );
    setSelectedCaseModal((prevModal) => {
      if (prevModal && prevModal.id === caseId) {
        return {
          ...prevModal,
          evidence: prevModal.evidence.filter((ev) => ev.id !== evidenceId),
        };
      }
      return prevModal;
    });
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Evidence File Removed',
      message: `An evidence file was deleted from Case ${caseId}.`,
      timestamp: 'Just now',
      type: 'Evidence',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Add Timeline Entry to Case
  const handleAddTimelineEntry = (caseId: string, entry: Omit<TimelineEntry, 'id'>) => {
    const newEntry: TimelineEntry = {
      ...entry,
      id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedTimeline = [...(c.timeline || []), newEntry];
          const updatedCase = { ...c, timeline: updatedTimeline };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updatedCase);
          }
          return updatedCase;
        }
        return c;
      })
    );
  };

  // Update Timeline Entry in Case
  const handleUpdateTimelineEntry = (caseId: string, updatedEntry: TimelineEntry) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const currentTimeline = c.timeline && c.timeline.length > 0
            ? c.timeline
            : [
                {
                  id: `initial-${c.id}`,
                  timestamp: c.createdAt || `${c.dateAssigned}, 09:30 AM`,
                  title: 'Case Registered',
                  description: `Complaint received and case officially created. ${c.description}`,
                  performerName: c.assignedHostName || 'Inspector Sharma',
                  performerRole: 'Host Inspector',
                  statusTag: 'Completed' as const,
                },
              ];
          const updatedTimeline = currentTimeline.map((item, idx) => {
            const itemId = item.id || `tl-${c.id}-${idx}`;
            return (item.id === updatedEntry.id || itemId === updatedEntry.id) ? updatedEntry : item;
          });
          const updatedCase = { ...c, timeline: updatedTimeline };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updatedCase);
          }
          return updatedCase;
        }
        return c;
      })
    );
  };

  // Create New Suspect (DSP & Host)
  const handleCreateSuspect = (newSuspect: Suspect) => {
    setSuspects((prev) => [newSuspect, ...prev]);
  };

  // Update Suspects List (Node links addition/removal)
  const handleUpdateSuspects = (updatedSuspects: Suspect[]) => {
    setSuspects(updatedSuspects);
  };

  // Update Single Suspect
  const handleUpdateSuspect = (updatedSuspect: Suspect) => {
    setSuspects((prev) =>
      prev.map((s) => (s.id === updatedSuspect.id ? updatedSuspect : s))
    );
  };

  const handleManageCaseSuspects = (caseId: string, selectedSuspectIds: string[]) => {
    setSuspects((prevSuspects) =>
      prevSuspects.map((s) => {
        const isSelected = selectedSuspectIds.includes(s.id);
        const isCurrentlyLinked = s.linkedCaseIds.includes(caseId);

        if (isSelected && !isCurrentlyLinked) {
          return { ...s, linkedCaseIds: [...s.linkedCaseIds, caseId] };
        } else if (!isSelected && isCurrentlyLinked) {
          return { ...s, linkedCaseIds: s.linkedCaseIds.filter((id) => id !== caseId) };
        }
        return s;
      })
    );
  };

  // Update Court Hearing Schedule & Deadline (by Police Officer, Host, DSP, or Victim)
  const handleUpdateCourtHearing = (
    caseId: string,
    data: {
      courtHearingDate: string;
      courtHearingLocation: string;
      courtHearingNotes: string;
    }
  ) => {
    const updatedBy = `${currentUser?.fullName} (${currentUser?.role})`;
    const updatedAt = new Date().toLocaleString();

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updated = {
            ...c,
            courtHearingDate: data.courtHearingDate,
            courtHearingLocation: data.courtHearingLocation,
            courtHearingNotes: data.courtHearingNotes,
            courtHearingUpdatedBy: updatedBy,
            courtHearingUpdatedAt: updatedAt,
          };
          if (selectedCaseModal && selectedCaseModal.id === caseId) {
            setSelectedCaseModal(updated);
          }
          return updated;
        }
        return c;
      })
    );

    // Notify connected case members
    const notif: PortalNotification = {
      id: `notif-${Date.now()}`,
      title: 'Court Hearing Schedule Updated',
      message: `${updatedBy} set the next Court Hearing for Case ${caseId} to ${data.courtHearingDate.replace('T', ' ')}. All evidence and work must be finalized before this session.`,
      timestamp: 'Just now',
      type: 'CaseAssigned',
      relatedCaseId: caseId,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Render Login Page or Full-Page Register Complaint when user is not logged in
  if (!currentUser) {
    if (isComplaintModalOpen) {
      return (
        <ComplaintRegistrationModal
          isOpen={true}
          isFullPage={true}
          onClose={() => setIsComplaintModalOpen(false)}
          onSubmitComplaint={handleSubmitComplaint}
          themeMode="bright"
        />
      );
    }

    return (
      <div className="min-h-screen w-full relative text-slate-900">
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onOpenRegistration={() => setIsRegistrationOpen(true)}
          onOpenRegisterComplaint={() => setIsComplaintModalOpen(true)}
          themeMode="bright"
          existingUsers={users}
          pendingRequests={pendingRequests}
        />

        {/* New Registration Modal (Police Officer / Advocate / Host / DSP) */}
        <RegistrationModal
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onSubmitRegistration={handleSubmitRegistration}
          themeMode="bright"
        />
      </div>
    );
  }

  // Filter user lists for Host team assignment dropdowns
  const hostsList = users.filter((u) => u.role === 'Host');
  const officersList = users.filter((u) => u.role === 'Police Officer');
  const advocatesList = users.filter((u) => u.role === 'Advocate');
  const victimsList = users.filter((u) => u.role === 'Victim');
  const subdivisionOfficersList = users.filter((u) => u.role === 'Subdivision Level');

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        themeMode === 'bright'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#0a0b0d] text-slate-100'
      }`}
    >
      {/* Universal Header with Notifications Bell & Theme Toggle */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        notifications={notifications}
        pendingRequests={pendingRequests}
        cases={cases}
        onSelectCase={(c) => setSelectedCaseModal(c)}
        onOpenPendingModal={(req) => setSelectedPendingRequestModal(req)}
        onOpenSuspectManagement={() => setCurrentView('suspects')}
        currentView={currentView}
        onNavigateHome={() => setCurrentView('dashboard')}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onNavigate={(view) => setCurrentView(view)}
        pendingComplaintsCount={complaints.filter((c) => c.status === 'Pending').length}
      />

      {/* Slide-out Sidebar for Navigation (available for DSP, Host, Police Officer, Advocate) */}
      {currentUser.role !== 'Victim' && (
        <PortalSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          pendingComplaintsCount={complaints.filter((c) => c.status === 'Pending').length}
        />
      )}

      {/* Main View Router */}
      <main className="pb-12">
        {currentView === 'case-management' ? (
          <CaseManagementView
            cases={cases}
            suspects={suspects}
            currentUser={currentUser}
            hostsList={hostsList}
            officersList={officersList}
            subdivisionOfficersList={subdivisionOfficersList}
            initialSubdivMode={subdivisionCaseMode}
            onSelectCase={(c, isReadOnly) => {
              setSelectedCaseModal(c);
              setIsCaseModalReadOnly(!!isReadOnly);
            }}
            onCreateCase={handleCreateCase}
            onUpdateCaseHost={handleUpdateCaseHost}
            onDeleteHostFromCase={(caseId) => handleUpdateCaseHost(caseId, '', '')}
            onOpenSuspectsModal={() => setCurrentView('suspects')}
            onCreateSuspect={handleCreateSuspect}
            onManageCaseSuspects={handleManageCaseSuspects}
            onUpdateSuspect={handleUpdateSuspect}
            onAssignTeam={handleAssignTeamToCase}
            onAssignSubdivision={handleAssignSubdivision}
            onTakeChargeSubdivision={handleTakeChargeSubdivision}
            onUpdateCaseDetails={handleUpdateCaseDetails}
            onEscalateToHigherAuthority={handleEscalateToHigherAuthority}
            themeMode={themeMode}
          />
        ) : currentView === 'citizen-complaints' ? (
          <CitizenComplaintsView
            complaints={complaints}
            onReviewComplaint={handleReviewComplaint}
            currentUser={currentUser}
            themeMode={themeMode}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'suspects' ? (
          <SuspectManagement
            suspects={suspects}
            cases={cases}
            onCreateSuspect={handleCreateSuspect}
            onUpdateSuspects={handleUpdateSuspects}
            userRole={currentUser.role}
            currentUser={currentUser}
            hostsList={hostsList}
            onCreateCase={handleCreateCase}
            isExternalCreateCaseOpen={isCreateCaseTriggered}
            onResetExternalCreateCase={() => setIsCreateCaseTriggered(false)}
            themeMode={themeMode}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'alerts-apb' ? (
          <AlertsAndApbView
            currentUser={currentUser}
            themeMode={themeMode}
          />
        ) : currentView === 'request-access' ? (
          <RequestAndAccessView
            currentUser={currentUser}
            themeMode={themeMode}
          />
        ) : currentView === 'registered-officers' ? (
          <StateGovtRegisteredOfficersView
            currentUser={currentUser}
            users={users}
            onRegisterApprovedUser={(newUser) => {
              setUsers((prev) => [newUser, ...prev]);
              const notif: PortalNotification = {
                id: `notif-${Date.now()}`,
                title: 'State Cadre Officer Registered',
                message: `${currentUser.fullName} registered and authorized ${newUser.fullName} as a ${newUser.role} with Badge ID ${newUser.badgeId}.`,
                timestamp: 'Just now',
                type: 'Registration',
                read: false,
              };
              setNotifications((prev) => [notif, ...prev]);
            }}
            themeMode={themeMode}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'fingerprint' ? (
          <FingerprintMatchingView
            suspects={suspects}
            cases={cases}
            currentUser={currentUser}
            themeMode={themeMode}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onSelectCase={(c) => setSelectedCaseModal(c)}
          />
        ) : currentView === 'schedule' ? (
          <ScheduleView
            currentUser={currentUser}
            themeMode={themeMode}
            onExitFullScreen={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'settings' ? (
          <SettingsView
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => {
              setCurrentUser(updated);
              setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            }}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
          />
        ) : currentView === 'registration' ? (
          <OfficerRegistrationView
            currentUser={currentUser}
            existingUsers={users}
            cases={cases}
            onRegisterApprovedUser={(newUser, linkedCaseIds) => {
              // When DSP registers Host or Police Officer, inherit DSP's taluka access
              const userToSave: User = {
                ...newUser,
                state: currentUser.role === 'DSP' && (newUser.role === 'Host' || newUser.role === 'Police Officer')
                  ? (currentUser.state || 'Maharashtra')
                  : (newUser.state || 'Maharashtra'),
                district: currentUser.role === 'DSP' && (newUser.role === 'Host' || newUser.role === 'Police Officer')
                  ? (currentUser.district || 'Solapur')
                  : (newUser.district || 'Solapur'),
                talukas: currentUser.role === 'DSP' && (newUser.role === 'Host' || newUser.role === 'Police Officer')
                  ? (currentUser.talukas && currentUser.talukas.length > 0
                      ? currentUser.talukas
                      : (currentUser.taluka ? [currentUser.taluka] : ['Karmala']))
                  : newUser.talukas,
                taluka: currentUser.role === 'DSP' && (newUser.role === 'Host' || newUser.role === 'Police Officer')
                  ? (currentUser.taluka || (currentUser.talukas && currentUser.talukas[0]) || 'Karmala')
                  : newUser.taluka,
              };

              setUsers((prev) => [userToSave, ...prev]);

              // If cases were linked during registration, update the cases to connect the victim
              if (linkedCaseIds && linkedCaseIds.length > 0) {
                setCases((prevCases) =>
                  prevCases.map((c) => {
                    if (linkedCaseIds.includes(c.id)) {
                      const updatedTimeline = [
                        ...(c.timeline || []),
                        {
                          id: `tl-reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                          timestamp: new Date().toLocaleString(),
                          title: 'Victim Portal Access Linked',
                          description: `Victim ${newUser.fullName} (${newUser.username}) registered and granted limited access to view live case updates, hearings, and progress.`,
                          performerName: currentUser.fullName,
                          performerRole: currentUser.role,
                        },
                      ];

                      return {
                        ...c,
                        victimId: newUser.id,
                        victimUsername: newUser.username,
                        victimName: newUser.fullName,
                        timeline: updatedTimeline,
                      };
                    }
                    return c;
                  })
                );
              }
            }}
            themeMode={themeMode}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'contacts' ? (
          currentUser.role === 'District Level' ? (
            <DistrictSubdivisionContactsView
              currentUser={currentUser}
              users={users}
              cases={cases}
              themeMode={themeMode}
              onBackToDashboard={() => setCurrentView('dashboard')}
              onNavigateToCaseManagement={() => setCurrentView('case-management')}
              onSendNotification={(notif) => {
                const newNotif: PortalNotification = {
                  id: `notif-${Date.now()}`,
                  title: notif.title,
                  message: notif.message,
                  timestamp: 'Just now',
                  type: notif.type === 'Directive' ? 'Directive' : 'General',
                  targetRole: 'Subdivision Level',
                  read: false,
                };
                setNotifications((prev) => [newNotif, ...prev]);
              }}
            />
          ) : (
            <SubdivisionDspContactView
              currentUser={currentUser}
              users={users}
              themeMode={themeMode}
              onBackToDashboard={() => setCurrentView('dashboard')}
              onNavigateToCaseManagement={() => setCurrentView('case-management')}
              onSendNotification={(notif) => {
                const newNotif: PortalNotification = {
                  id: `notif-${Date.now()}`,
                  title: notif.title,
                  message: notif.message,
                  timestamp: 'Just now',
                  type: 'General',
                  targetRole: 'DSP',
                  read: false,
                };
                setNotifications((prev) => [newNotif, ...prev]);
              }}
            />
          )
        ) : (
          <>
            {/* Role Specific Dashboard Rendering */}
            {currentUser.role === 'DSP' && (
              <DspDashboard
                cases={cases}
                suspects={suspects}
                onCreateCase={handleCreateCase}
                onUpdateCaseHost={handleUpdateCaseHost}
                hostsList={hostsList}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                onOpenSuspectManagement={() => setCurrentView('suspects')}
                onManageCaseSuspects={handleManageCaseSuspects}
                onCreateSuspect={handleCreateSuspect}
                onUpdateSuspect={handleUpdateSuspect}
                currentUser={currentUser}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
                onOpenCaseManagement={() => setCurrentView('case-management')}
              />
            )}

            {currentUser.role === 'Host' && (
              <HostDashboard
                currentUser={currentUser}
                cases={cases}
                suspects={suspects}
                officersList={officersList}
                advocatesList={advocatesList}
                victimsList={victimsList}
                onAddMemberToCase={handleAddMemberToCase}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                onOpenSuspectManagement={() => setCurrentView('suspects')}
                onManageCaseSuspects={handleManageCaseSuspects}
                onCreateSuspect={handleCreateSuspect}
                onUpdateSuspect={handleUpdateSuspect}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
                onOpenCaseManagement={() => setCurrentView('case-management')}
              />
            )}

            {currentUser.role === 'Police Officer' && (
              <OfficerDashboard
                currentUser={currentUser}
                cases={cases}
                complaints={complaints}
                onReviewComplaint={handleReviewComplaint}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
                onOpenCaseManagement={() => setCurrentView('case-management')}
              />
            )}

            {currentUser.role === 'Victim' && (
              <VictimDashboard
                currentUser={currentUser}
                cases={cases}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                themeMode={themeMode}
                onUpdateCourtHearing={handleUpdateCourtHearing}
                onOpenRegisterComplaint={() => setIsComplaintModalOpen(true)}
              />
            )}

            {currentUser.role === 'Advocate' && (
              <AdvocateDashboard
                currentUser={currentUser}
                cases={cases}
                suspects={suspects}
                onSelectCase={(c) => setSelectedCaseModal(c)}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
              />
            )}

            {currentUser.role === 'State Govt' && (
              <StateGovtDashboard
                currentUser={currentUser}
                users={users}
                cases={cases}
                onRegisterApprovedUser={(newUser) => {
                  setUsers((prev) => [newUser, ...prev]);
                  const notif: PortalNotification = {
                    id: `notif-${Date.now()}`,
                    title: 'State Cadre Officer Registered',
                    message: `${currentUser.fullName} registered and authorized ${newUser.fullName} as a ${newUser.role} with Badge ID ${newUser.badgeId}.`,
                    timestamp: 'Just now',
                    type: 'Registration',
                    read: false,
                  };
                  setNotifications((prev) => [notif, ...prev]);
                }}
                themeMode={themeMode}
              />
            )}

            {currentUser.role === 'Subdivision Level' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {(() => {
                  const officerTalukas =
                    Array.isArray(currentUser.talukas) && currentUser.talukas.length > 0
                      ? currentUser.talukas
                      : ['Karmala', 'Barshi', 'Madha'];

                  const allTalukaCases = cases.filter((c) => isCaseInOfficerTalukas(currentUser, c));
                  const majorCases = cases.filter((c) => {
                    const isDirectlyAssigned =
                      c.assignedSubdivisionOfficerId === currentUser.id ||
                      (c.assignedSubdivisionOfficerName &&
                        c.assignedSubdivisionOfficerName.toLowerCase().includes(currentUser.fullName.toLowerCase()));
                    if (isDirectlyAssigned) return true;
                    if (c.isMajorCase && isCaseInOfficerTalukas(currentUser, c)) return true;
                    return false;
                  });

                  const relevantCasesForMapAndCharts = allTalukaCases.length > 0 ? allTalukaCases : cases;
                  const totalCasesCount = relevantCasesForMapAndCharts.length;
                  const activeCasesCount = relevantCasesForMapAndCharts.filter((c) => c.status === 'Active').length;
                  const solvedCasesCount = relevantCasesForMapAndCharts.filter((c) => c.status === 'Solved').length;
                  const pendingCasesCount = relevantCasesForMapAndCharts.filter((c) => c.status === 'Pending').length;
                  const underInvestigationCasesCount = relevantCasesForMapAndCharts.filter((c) => c.status === 'Under Investigation').length;

                  return (
                    <div className="space-y-6">
                      {/* Top SDPO Command Header */}
                      <div
                        className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                          themeMode === 'bright'
                            ? 'bg-gradient-to-r from-amber-50 via-purple-50 to-white border-2 border-amber-300 shadow-md text-slate-950'
                            : 'bg-slate-900/80 border-purple-800/40 text-slate-100 shadow-lg'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                            <Building2 className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h2 className="text-xl font-black">
                                Subdivisional Police Office (SDPO) Command
                              </h2>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                {currentUser.posting || 'Subdivision Level'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Officer: <span className="font-bold text-amber-400">{currentUser.fullName}</span> ({currentUser.badgeId}) • Allotted Talukas:{' '}
                              <span className="font-bold text-blue-400">{officerTalukas.join(', ')}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            id="btn-sdpo-contact-dsp"
                            type="button"
                            onClick={() => setCurrentView('contacts')}
                            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer flex items-center space-x-2 shrink-0 ${
                              themeMode === 'bright'
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            <PhoneCall className="w-4 h-4 text-amber-500" />
                            <span>Contact SHO/Inspector ({officerTalukas[0]})</span>
                          </button>
                        </div>
                      </div>

                      {/* Subdivision Macro Metrics Cards (Matching DSP Dashboard) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Total Cases</span>
                            <FolderKanban className="w-5 h-5 text-yellow-500" />
                          </div>
                          <p className={`text-2xl sm:text-3xl font-black mt-2 ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>{totalCasesCount}</p>
                        </div>

                        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Active Cases</span>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-red-500 mt-2">{activeCasesCount}</p>
                        </div>

                        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Solved Cases</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-2">{solvedCasesCount}</p>
                        </div>

                        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Pending</span>
                            <Clock className="w-5 h-5 text-yellow-500" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-yellow-500 mt-2">{pendingCasesCount}</p>
                        </div>

                        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Under Investigation</span>
                            <Search className="w-5 h-5 text-blue-500" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-black text-blue-500 mt-2">{underInvestigationCasesCount}</p>
                        </div>
                      </div>

                      {/* Interactive Crime Hotspot Map & Case Registration Heatmap */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch my-6">
                        <div className="flex flex-col min-w-0 h-full">
                          <CrimeMap
                            cases={relevantCasesForMapAndCharts}
                            suspects={suspects}
                            onSelectCase={(c) => {
                              setSelectedCaseModal(c);
                              setIsCaseModalReadOnly(true);
                            }}
                            themeMode={themeMode}
                          />
                        </div>
                        <div className="flex flex-col min-w-0 h-full">
                          <CaseHeatmap
                            cases={relevantCasesForMapAndCharts}
                            themeMode={themeMode}
                          />
                        </div>
                      </div>

                      {/* Analytics Charts: Crime Category Distribution & Monthly Crime and Resolution Trend */}
                      <DashboardCharts
                        distributionData={crimeDistributionData}
                        monthlyData={monthlyCrimeData}
                        themeMode={themeMode}
                      />



                    </div>
                  );
                })()}
              </div>
            )}

            {currentUser.role === 'District Level' && (
              <DistrictDashboardView
                currentUser={currentUser}
                cases={cases}
                suspects={suspects}
                distributionData={crimeDistributionData}
                monthlyData={monthlyCrimeData}
                themeMode={themeMode}
                onSelectCase={(c, readOnly) => {
                  setSelectedCaseModal(c);
                  setIsCaseModalReadOnly(Boolean(readOnly));
                }}
                onUpdateCaseDetails={handleUpdateCaseDetails}
                onNavigateToCaseManagement={() => setCurrentView('case-management')}
              />
            )}
          </>
        )}
      </main>

      {/* Case Details & Evidence Upload Modal */}
      <CaseDetailModal
        c={selectedCaseModal}
        isOpen={Boolean(selectedCaseModal)}
        onClose={() => {
          setSelectedCaseModal(null);
          setIsCaseModalReadOnly(false);
        }}
        currentUser={currentUser}
        suspects={suspects}
        onManageCaseSuspects={handleManageCaseSuspects}
        onCreateSuspect={handleCreateSuspect}
        onUpdateSuspect={handleUpdateSuspect}
        onUploadEvidence={handleUploadEvidence}
        onUpdateEvidence={handleUpdateEvidence}
        onDeleteEvidence={handleDeleteEvidence}
        onAddTimelineEntry={handleAddTimelineEntry}
        onUpdateTimelineEntry={handleUpdateTimelineEntry}
        onUpdateCaseStatus={handleUpdateCaseStatus}
        onUpdateCourtHearing={handleUpdateCourtHearing}
        isReadOnly={isCaseModalReadOnly}
        onTakeCharge={handleTakeChargeSubdivision}
        onUpdateCaseDetails={handleUpdateCaseDetails}
        themeMode={themeMode}
        allCases={cases}
      />

      {/* Candidate Verification Review Modal (Host & DSP Approvals) */}
      <PendingApprovalModal
        request={selectedPendingRequestModal}
        isOpen={Boolean(selectedPendingRequestModal)}
        onClose={() => setSelectedPendingRequestModal(null)}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        themeMode={themeMode}
      />

      {/* Citizen / Victim Complaint Registration Modal */}
      <ComplaintRegistrationModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSubmitComplaint={handleSubmitComplaint}
        themeMode={themeMode}
      />
    </div>
  );
}
