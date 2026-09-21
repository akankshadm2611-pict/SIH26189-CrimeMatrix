import React, { useState, useEffect, useRef } from 'react';
import { Case, User, UserRole } from '../types';
import {
  X,
  Send,
  MessageSquare,
  Users,
  Shield,
  Paperclip,
  CheckCheck,
  Sparkles,
  Clock,
  RotateCcw,
  ChevronDown,
  UserCheck,
  AlertCircle,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export interface CaseChatMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderBadge?: string;
  message: string;
  timestamp: string;
  isSelf?: boolean;
  tag?: string;
}

export interface AssignedMember {
  id: string;
  name: string;
  role: string;
  badge: string;
  color: string;
  isOnline: boolean;
}

interface CaseTeamChatModalProps {
  c: Case;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  themeMode?: 'dark' | 'bright';
}

export const CaseTeamChatModal: React.FC<CaseTeamChatModalProps> = ({
  c,
  isOpen,
  onClose,
  currentUser,
  themeMode = 'dark',
}) => {
  const isBright = themeMode === 'bright';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive all members assigned to this specific case
  const assignedMembers: AssignedMember[] = React.useMemo(() => {
    const list: AssignedMember[] = [];

    // Investigator
    if (c.assignedHostName) {
      list.push({
        id: c.assignedHostId || 'host-admin',
        name: c.assignedHostName,
        role: 'Investigator',
        badge: 'INV',
        color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40',
        isOnline: true,
      });
    }

    // Assigned Police Officers
    const officerNames = c.assignedOfficerNames || [];
    const officerIds = c.assignedOfficerIds || [];
    if (officerNames.length > 0) {
      officerNames.forEach((name, idx) => {
        list.push({
          id: officerIds[idx] || `officer-${idx}`,
          name: name,
          role: 'Investigating Officer',
          badge: 'POLICE',
          color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
          isOnline: true,
        });
      });
    } else {
      list.push({
        id: 'officer-default',
        name: 'Duty Investigating Officer',
        role: 'Investigating Officer',
        badge: 'POLICE',
        color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
        isOnline: true,
      });
    }

    // Victim / Complainant
    if (c.victimName) {
      list.push({
        id: c.victimId || 'victim-user',
        name: c.victimName,
        role: 'Victim / Complainant',
        badge: 'COMPLAINANT',
        color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40',
        isOnline: true,
      });
    }

    // Key Witness
    if (c.witnessName) {
      list.push({
        id: 'witness-key',
        name: c.witnessName,
        role: 'Key Witness',
        badge: 'WITNESS',
        color: 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/40',
        isOnline: false,
      });
    }

    // Assigned Advocates
    const advocateNames = c.assignedAdvocateNames || [];
    const advocateIds = c.assignedAdvocateIds || [];
    advocateNames.forEach((name, idx) => {
      list.push({
        id: advocateIds[idx] || `advocate-${idx}`,
        name: name,
        role: 'Legal Counsel / Advocate',
        badge: 'ADVOCATE',
        color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
        isOnline: true,
      });
    });

    // Subdivision Level Officer (SDPO)
    if (c.assignedSubdivisionOfficerName) {
      list.push({
        id: c.assignedSubdivisionOfficerId || 'sdpo-officer',
        name: c.assignedSubdivisionOfficerName,
        role: 'Subdivision Officer (SDPO)',
        badge: 'SDPO',
        color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/40',
        isOnline: true,
      });
    }

    // District Level Officer
    if (c.assignedDistrictOfficerName) {
      list.push({
        id: c.assignedDistrictOfficerId || 'district-officer',
        name: c.assignedDistrictOfficerName,
        role: 'District Supervisory Officer',
        badge: 'DISTRICT',
        color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40',
        isOnline: true,
      });
    }

    // SHO/Inspector (Command Supervisor)
    list.push({
      id: 'dsp-command',
      name: 'SHO/Inspector Command Oversight',
      role: 'Supervisory Commander',
      badge: 'SHO',
      color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40',
      isOnline: true,
    });

    return list;
  }, [c]);

  // Active sender selector: defaults to current logged in user, but allows switching between any assigned member
  const [activeSenderId, setActiveSenderId] = useState<string>(() => {
    // Check if currentUser matches any assigned member
    const match = assignedMembers.find(
      (m) => m.id === currentUser.id || m.name.toLowerCase() === currentUser.fullName.toLowerCase()
    );
    return match ? match.id : currentUser.id;
  });

  const [activeSenderCustom, setActiveSenderCustom] = useState<AssignedMember>(() => {
    const match = assignedMembers.find(
      (m) => m.id === currentUser.id || m.name.toLowerCase() === currentUser.fullName.toLowerCase()
    );
    if (match) return match;
    return {
      id: currentUser.id,
      name: currentUser.fullName,
      role: currentUser.role,
      badge: currentUser.role.toUpperCase(),
      color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
      isOnline: true,
    };
  });

  const [showMemberSidebar, setShowMemberSidebar] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Local storage message persistence
  const storageKey = `case_team_chat_${c.id}`;

  const getDefaultMessages = (): CaseChatMessage[] => {
    const hostName = c.assignedHostName || 'Investigator Amit Verma';
    const officerName = (c.assignedOfficerNames && c.assignedOfficerNames[0]) || 'Sub-Inspector Vikram Sharma';
    const victim = c.victimName || 'Citizen Complainant';

    return [
      {
        id: `msg-${c.id}-1`,
        caseId: c.id,
        senderId: 'host-seed',
        senderName: hostName,
        senderRole: 'Investigator',
        senderBadge: 'INV',
        message: `Case ${c.id} (${c.caseName}) investigation team initialized. Priority level set to ${c.priority}. Please coordinate on all physical evidence collection and forensic protocols.`,
        timestamp: 'Today, 09:15 AM',
        tag: 'Case Directive',
      },
      {
        id: `msg-${c.id}-2`,
        caseId: c.id,
        senderId: 'officer-seed',
        senderName: officerName,
        senderRole: 'Investigating Officer',
        senderBadge: 'POLICE',
        message: `Understood, Sir. Crime scene inspected at ${c.location || 'site'}. Preliminary seizure memo created and chain of custody initiated.`,
        timestamp: 'Today, 09:42 AM',
        tag: 'Investigation Progress',
      },
      {
        id: `msg-${c.id}-3`,
        caseId: c.id,
        senderId: 'victim-seed',
        senderName: victim,
        senderRole: 'Victim / Complainant',
        senderBadge: 'COMPLAINANT',
        message: 'Thank you Officers. All requested initial documents and transaction logs have been submitted to the station record.',
        timestamp: 'Today, 10:05 AM',
        tag: 'Evidence Submission',
      },
    ];
  };

  const [messages, setMessages] = useState<CaseChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return getDefaultMessages();
  });

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages, storageKey]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update active sender object when activeSenderId changes
  const handleSelectSender = (senderId: string) => {
    setActiveSenderId(senderId);
    const found = assignedMembers.find((m) => m.id === senderId);
    if (found) {
      setActiveSenderCustom(found);
    } else {
      setActiveSenderCustom({
        id: currentUser.id,
        name: currentUser.fullName,
        role: currentUser.role,
        badge: currentUser.role.toUpperCase(),
        color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40',
        isOnline: true,
      });
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: CaseChatMessage = {
      id: `msg-${Date.now()}`,
      caseId: c.id,
      senderId: activeSenderCustom.id,
      senderName: activeSenderCustom.name,
      senderRole: activeSenderCustom.role,
      senderBadge: activeSenderCustom.badge,
      message: trimmed,
      timestamp: `Today, ${timeStr}`,
      isSelf: activeSenderCustom.id === currentUser.id || activeSenderCustom.name === currentUser.fullName,
      tag: selectedTag || undefined,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setSelectedTag('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResetChat = () => {
    if (window.confirm('Reset this case discussion to default initial messages?')) {
      const defaults = getDefaultMessages();
      setMessages(defaults);
      try {
        localStorage.setItem(storageKey, JSON.stringify(defaults));
      } catch {
        // ignore
      }
    }
  };

  const quickActionTags = [
    { label: 'Urgent Directive', text: 'URGENT: Immediate forensic response required for this exhibit.' },
    { label: 'Hearing Prep', text: 'Please ensure all witness depositions and chargesheet exhibits are finalized for the upcoming court date.' },
    { label: 'Evidence Uploaded', text: 'New documentary evidence and verification certificates have been cataloged in the evidence vault.' },
    { label: 'Suspect Update', text: 'Suspect interrogation notes and location trace data have been cross-checked with the database.' },
  ];

  if (!isOpen) return null;

  return (
    <div
      id="modal-case-team-chat-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="modal-case-team-chat"
        className={`w-full max-w-4xl h-[90vh] max-h-[820px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
          isBright
            ? 'bg-slate-50 border-slate-300 text-slate-900'
            : 'bg-[#0b1120] border-yellow-500/40 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-3.5 sm:p-4 border-b shrink-0 flex items-center justify-between gap-3 ${
            isBright
              ? 'bg-white border-slate-200 shadow-xs'
              : 'bg-[#0f172a] border-slate-800'
          }`}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  {c.id}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                    c.status === 'Active'
                      ? isBright
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                      : isBright
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  ● {c.status}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    isBright ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  Priority: {c.priority}
                </span>
              </div>
              <h2
                className={`text-sm sm:text-base font-black truncate mt-0.5 ${
                  isBright ? 'text-slate-900' : 'text-slate-100'
                }`}
                title={c.caseName}
              >
                {c.caseName} — <span className="font-medium opacity-80">Assigned Team Discussion</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Toggle Assigned Members Panel */}
            <button
              type="button"
              id="btn-toggle-team-members"
              onClick={() => setShowMemberSidebar(!showMemberSidebar)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all border cursor-pointer ${
                showMemberSidebar
                  ? isBright
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-blue-600 text-white border-blue-500'
                  : isBright
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Show Assigned Members for this Case"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Assigned Team</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300">
                {assignedMembers.length}
              </span>
            </button>

            {/* Reset chat button */}
            <button
              type="button"
              id="btn-reset-case-chat"
              onClick={handleResetChat}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isBright
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-600'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-400'
              }`}
              title="Reset Chat History"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close modal */}
            <button
              type="button"
              id="btn-close-case-chat-header"
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isBright
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-600'
                  : 'border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Assigned Team Members Bar / Drawer */}
        {showMemberSidebar && (
          <div
            id="case-assigned-members-bar"
            className={`p-3 border-b shrink-0 transition-all ${
              isBright
                ? 'bg-blue-50/80 border-blue-200 text-slate-900'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-black uppercase tracking-wider flex items-center ${
                isBright ? 'text-blue-950' : 'text-yellow-400'
              }`}>
                <Shield className="w-3.5 h-3.5 mr-1" />
                Authorized Case Personnel ({assignedMembers.length} Assigned)
              </span>
              <span className="text-[10px] text-slate-500">
                Click member to send message as that role
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {assignedMembers.map((m) => {
                const isSelected = activeSenderCustom.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectSender(m.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? isBright
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-400'
                          : 'bg-blue-600 text-white border-blue-500 shadow-xs ring-2 ring-blue-400'
                        : isBright
                        ? 'bg-white text-slate-800 border-slate-300 hover:border-blue-400'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="truncate max-w-[130px]">{m.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded font-black opacity-80 uppercase bg-black/20 text-inherit">
                      {m.badge}
                    </span>
                    {isSelected && <BadgeCheck className="w-3.5 h-3.5 text-yellow-300 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sender Switcher Bar */}
        <div
          className={`px-3 sm:px-4 py-2 border-b shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs ${
            isBright
              ? 'bg-slate-100/90 border-slate-200 text-slate-800'
              : 'bg-[#0d1527] border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chatting as:
            </span>
            <div className="relative">
              <select
                id="select-case-chat-sender"
                value={activeSenderCustom.id}
                onChange={(e) => handleSelectSender(e.target.value)}
                aria-label="Select Assigned Member to chat as"
                className={`text-xs font-black py-1 pl-2.5 pr-7 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isBright
                    ? 'bg-white border-slate-300 text-blue-950'
                    : 'bg-slate-800 border-slate-700 text-yellow-400'
                }`}
              >
                {assignedMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role}) {m.id === currentUser.id ? '• (You)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
            </div>

            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${activeSenderCustom.color}`}
            >
              {activeSenderCustom.role}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>End-to-End Case Record Log</span>
          </div>
        </div>

        {/* Message Feed Area */}
        <div
          id="case-chat-messages-container"
          className={`flex-1 overflow-y-auto p-4 space-y-3.5 ${
            isBright ? 'bg-slate-50' : 'bg-[#090d16]'
          }`}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <MessageSquare className="w-12 h-12 mb-2 opacity-30" />
              <p className="font-bold text-sm">No messages yet</p>
              <p className="text-xs max-w-sm mt-1">
                Start the investigation discussion with all assigned officers, host administrator, and parties.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser =
                msg.senderId === currentUser.id ||
                msg.senderName.toLowerCase() === currentUser.fullName.toLowerCase() ||
                msg.isSelf;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Header Line */}
                  <div
                    className={`flex items-center space-x-1.5 mb-1 text-[11px] font-bold ${
                      isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}
                  >
                    <span
                      className={`font-black ${
                        isCurrentUser
                          ? isBright
                            ? 'text-blue-900'
                            : 'text-blue-400'
                          : isBright
                          ? 'text-slate-900'
                          : 'text-slate-200'
                      }`}
                    >
                      {msg.senderName} {isCurrentUser ? '(You)' : ''}
                    </span>

                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                        msg.senderBadge === 'HOST'
                          ? isBright
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : msg.senderBadge === 'POLICE'
                          ? isBright
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : msg.senderBadge === 'COMPLAINANT'
                          ? isBright
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : msg.senderBadge === 'WITNESS'
                          ? isBright
                            ? 'bg-teal-100 text-teal-900 border-teal-300'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : msg.senderBadge === 'SDPO'
                          ? isBright
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : isBright
                          ? 'bg-slate-200 text-slate-800 border-slate-300'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {msg.senderBadge || msg.senderRole}
                    </span>

                    <span className="text-[10px] text-slate-400 font-normal">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl shadow-sm text-xs sm:text-sm font-medium leading-relaxed break-words ${
                      isCurrentUser
                        ? isBright
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-blue-600/20'
                        : isBright
                        ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-xs'
                        : 'bg-[#151c2e] text-slate-100 border border-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.tag && (
                      <div className="mb-1.5">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                            isCurrentUser
                              ? 'bg-white/20 text-white'
                              : isBright
                              ? 'bg-blue-50 text-blue-900 border border-blue-200'
                              : 'bg-blue-950/40 text-blue-300 border border-blue-800/60'
                          }`}
                        >
                          <span>🏷️ {msg.tag}</span>
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Suggestion Chips */}
        <div
          className={`px-3 py-1.5 border-t shrink-0 flex items-center space-x-2 overflow-x-auto no-scrollbar text-xs ${
            isBright
              ? 'bg-white border-slate-200 text-slate-700'
              : 'bg-[#0f172a] border-slate-800 text-slate-300'
          }`}
        >
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
            Quick Update:
          </span>
          {quickActionTags.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setInputText(item.text);
                setSelectedTag(item.label);
                if (inputRef.current) inputRef.current.focus();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border cursor-pointer ${
                selectedTag === item.label
                  ? isBright
                    ? 'bg-blue-100 text-blue-900 border-blue-400'
                    : 'bg-blue-900/50 text-blue-300 border-blue-600'
                  : isBright
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className={`p-3 sm:p-4 border-t shrink-0 flex items-center space-x-2 ${
            isBright
              ? 'bg-white border-slate-200'
              : 'bg-[#0f172a] border-slate-800'
          }`}
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              id="input-case-chat-message"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message assigned members as ${activeSenderCustom.name} (${activeSenderCustom.role})...`}
              className={`w-full py-2.5 pl-3 pr-20 rounded-xl text-xs sm:text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isBright
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
            {selectedTag && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white flex items-center space-x-1">
                <span>{selectedTag}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTag('')}
                  className="hover:text-red-300 cursor-pointer ml-1"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <button
            type="submit"
            id="btn-send-case-chat"
            disabled={!inputText.trim()}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
              isBright
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
