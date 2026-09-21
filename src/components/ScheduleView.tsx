import React, { useState } from 'react';
import { User, Case } from '../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Check,
  Trash2,
  Lock,
  Eye,
  Shield,
  X,
  MapPin,
  Tag,
  CalendarCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StateGovtRegistrationSchedule } from './StateGovtRegistrationSchedule';

export interface ScheduleTask {
  id: string;
  title: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dateStr: string; // e.g. "16-09-2026"
  startTime?: string;
  endTime?: string;
  priority?: 'Routine' | 'High' | 'Critical';
  category:
    | 'Court Hearing'
    | 'Forensic Lab'
    | 'Interrogation'
    | 'Patrol'
    | 'Briefing'
    | 'Raid / Tactical Op'
    | 'Duty Roster'
    | 'VIP Escort'
    | 'Evidence Review'
    | 'General';
  location?: string;
  notes?: string;
  completed: boolean;
  assignedOfficer?: string;
}

const DAYS_OF_WEEK: ScheduleTask['dayOfWeek'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Rich, distinct, non-repeating roster across all 7 days
const INITIAL_SCHEDULE_TASKS: ScheduleTask[] = [
  // Monday (Locked in week view - Past)
  {
    id: 'mon-1',
    title: 'Command Staff Intelligence & Weekly Strategy Briefing',
    dayOfWeek: 'Monday',
    dateStr: '14-09-2026',
    startTime: '10:00',
    endTime: '11:30',
    category: 'Briefing',
    priority: 'Routine',
    completed: false,
    location: 'HQ Briefing Room Alpha',
  },
  {
    id: 'mon-2',
    title: 'Sector 1 Financial District Vault Security Audit',
    dayOfWeek: 'Monday',
    dateStr: '14-09-2026',
    startTime: '14:00',
    endTime: '16:00',
    category: 'Duty Roster',
    priority: 'Routine',
    completed: false,
    location: 'Central Banking Plaza',
  },
  {
    id: 'mon-3',
    title: 'Highway Toll Plaza ANPR Automatic Surveillance Inspection',
    dayOfWeek: 'Monday',
    dateStr: '14-09-2026',
    startTime: '21:00',
    endTime: '01:00',
    category: 'Patrol',
    priority: 'High',
    completed: false,
    location: 'North Tollway Checkpost',
  },

  // Tuesday (Locked in week view - Past)
  {
    id: 'tue-1',
    title: 'Magistrate Court Remand Hearing (Suspect Bail Review)',
    dayOfWeek: 'Tuesday',
    dateStr: '15-09-2026',
    startTime: '11:00',
    endTime: '13:00',
    category: 'Court Hearing',
    priority: 'Critical',
    completed: false,
    location: 'District Courtroom 4',
  },
  {
    id: 'tue-2',
    title: 'Cyber Crime Evidence Data Extraction at Digital Forensics Lab',
    dayOfWeek: 'Tuesday',
    dateStr: '15-09-2026',
    startTime: '14:30',
    endTime: '17:00',
    category: 'Forensic Lab',
    priority: 'High',
    completed: false,
    location: 'Forensic Science Lab Suite 2',
  },
  {
    id: 'tue-3',
    title: 'Harbor Docklands Container Depot Perimeter Inspection',
    dayOfWeek: 'Tuesday',
    dateStr: '15-09-2026',
    startTime: '20:00',
    endTime: '23:30',
    category: 'Patrol',
    priority: 'Routine',
    completed: false,
    location: 'Cargo Terminal 7',
  },

  // Wednesday (Today - 16-09-2026)
  {
    id: 'wed-1',
    title: 'High Court Special Cyber Bench Trial - Bench #2',
    dayOfWeek: 'Wednesday',
    dateStr: '16-09-2026',
    startTime: '10:30',
    endTime: '12:45',
    category: 'Court Hearing',
    priority: 'Critical',
    completed: false,
    location: 'High Court Room 12',
  },
  {
    id: 'wed-2',
    title: 'Ballistics & Forensics Lab Briefing (Depot Incident)',
    dayOfWeek: 'Wednesday',
    dateStr: '16-09-2026',
    startTime: '13:30',
    endTime: '15:00',
    category: 'Forensic Lab',
    priority: 'High',
    completed: false,
    location: 'Forensic Lab Wing B',
  },
  {
    id: 'wed-3',
    title: 'Interrogation of Syndicate Courier "Razor"',
    dayOfWeek: 'Wednesday',
    dateStr: '16-09-2026',
    startTime: '15:30',
    endTime: '17:00',
    category: 'Interrogation',
    priority: 'Critical',
    completed: true,
    location: 'Interrogation Cell 3',
  },
  {
    id: 'wed-4',
    title: 'Central Metro Transit Hub Anti-Sabotage Security Sweep',
    dayOfWeek: 'Wednesday',
    dateStr: '16-09-2026',
    startTime: '21:00',
    endTime: '01:00',
    category: 'Patrol',
    priority: 'Routine',
    completed: false,
    location: 'Metro Junction Station',
  },

  // Thursday
  {
    id: 'thu-1',
    title: 'Inter-Agency Financial Intelligence Unit (FIU) Cross-Briefing',
    dayOfWeek: 'Thursday',
    dateStr: '17-09-2026',
    startTime: '11:00',
    endTime: '12:30',
    category: 'Briefing',
    priority: 'Routine',
    completed: false,
    location: 'Joint Operations Command Center',
  },
  {
    id: 'thu-2',
    title: 'Undercover Surveillance Deployment - Pier 14 Narcotics Wharf',
    dayOfWeek: 'Thursday',
    dateStr: '17-09-2026',
    startTime: '18:00',
    endTime: '22:00',
    category: 'Raid / Tactical Op',
    priority: 'Critical',
    completed: false,
    location: 'Pier 14 Logistics Yard',
  },
  {
    id: 'thu-3',
    title: 'Witness Protection Safehouse Security Evaluation',
    dayOfWeek: 'Thursday',
    dateStr: '17-09-2026',
    startTime: '22:30',
    endTime: '00:30',
    category: 'Duty Roster',
    priority: 'High',
    completed: false,
    location: 'Confidential Safehouse 5',
  },

  // Friday
  {
    id: 'fri-1',
    title: 'Sessions Court Witness Examination & Cross-Examination',
    dayOfWeek: 'Friday',
    dateStr: '18-09-2026',
    startTime: '10:00',
    endTime: '12:30',
    category: 'Court Hearing',
    priority: 'High',
    completed: false,
    location: 'District Sessions Court #3',
  },
  {
    id: 'fri-2',
    title: 'Suspect Lineup & Biometric Verification Procedure',
    dayOfWeek: 'Friday',
    dateStr: '18-09-2026',
    startTime: '14:00',
    endTime: '16:00',
    category: 'Interrogation',
    priority: 'High',
    completed: false,
    location: 'Identification Suite Alpha',
  },
  {
    id: 'fri-3',
    title: 'Sector 4 Tech Corridor Mobile Checkpost & Night Intercept',
    dayOfWeek: 'Friday',
    dateStr: '18-09-2026',
    startTime: '22:00',
    endTime: '02:30',
    category: 'Patrol',
    priority: 'Routine',
    completed: false,
    location: 'Cyber Highway Interchange',
  },

  // Saturday
  {
    id: 'sat-1',
    title: 'State Border Multi-Agency Checkpost Joint Inspection',
    dayOfWeek: 'Saturday',
    dateStr: '19-09-2026',
    startTime: '09:00',
    endTime: '13:00',
    category: 'Duty Roster',
    priority: 'Routine',
    completed: false,
    location: 'State Highway Checkpost 11',
  },
  {
    id: 'sat-2',
    title: 'VIP Dignitary Motorcade Escort & Route Sanitization',
    dayOfWeek: 'Saturday',
    dateStr: '19-09-2026',
    startTime: '15:00',
    endTime: '18:30',
    category: 'VIP Escort',
    priority: 'Critical',
    completed: false,
    location: 'Airport to Convention Center Corridor',
  },
  {
    id: 'sat-3',
    title: 'Downtown Nightclub District Special Vigilance Patrol',
    dayOfWeek: 'Saturday',
    dateStr: '19-09-2026',
    startTime: '21:30',
    endTime: '02:00',
    category: 'Patrol',
    priority: 'High',
    completed: false,
    location: 'City Center Nightlife Zone',
  },

  // Sunday
  {
    id: 'sun-1',
    title: 'Emergency Rapid Response Reserve Unit Standby',
    dayOfWeek: 'Sunday',
    dateStr: '20-09-2026',
    startTime: '08:00',
    endTime: '14:00',
    category: 'Duty Roster',
    priority: 'High',
    completed: false,
    location: 'Special Tactical Reserve HQ',
  },
  {
    id: 'sun-2',
    title: 'Evidence Vault Bi-Weekly Chain-of-Custody Inventory',
    dayOfWeek: 'Sunday',
    dateStr: '20-09-2026',
    startTime: '15:00',
    endTime: '17:30',
    category: 'Forensic Lab',
    priority: 'Routine',
    completed: false,
    location: 'Evidence Locker Secure Room',
  },
  {
    id: 'sun-3',
    title: 'Inter-District Criminal Intelligence Synchronous Review',
    dayOfWeek: 'Sunday',
    dateStr: '20-09-2026',
    startTime: '18:30',
    endTime: '20:30',
    category: 'Briefing',
    priority: 'Routine',
    completed: false,
    location: 'Virtual Strategic Operations Grid',
  },
];

interface ScheduleViewProps {
  currentUser: User;
  cases?: Case[];
  themeMode?: 'dark' | 'bright';
  onExitFullScreen?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  currentUser,
  themeMode = 'dark',
  onExitFullScreen,
}) => {
  const { t } = useLanguage();
  const isBright = themeMode === 'bright';

  // Minimal schedule dedicated exclusively for registration purpose when State Govt
  if (currentUser.role === 'State Govt') {
    return (
      <StateGovtRegistrationSchedule
        currentUser={currentUser}
        themeMode={themeMode}
        onExitFullScreen={onExitFullScreen}
      />
    );
  }

  // Tab mode: 'daily' or 'weekly'
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  // Selected day for daily view (defaults to Wednesday)
  const [selectedDailyDay, setSelectedDailyDay] = useState<ScheduleTask['dayOfWeek']>('Wednesday');

  // All tasks in the planner
  const [tasks, setTasks] = useState<ScheduleTask[]>(INITIAL_SCHEDULE_TASKS);

  // Locked days state (Monday and Tuesday locked by default)
  const [unlockedDays, setUnlockedDays] = useState<Record<string, boolean>>({
    Monday: false,
    Tuesday: false,
  });

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetDayForAdd, setTargetDayForAdd] = useState<ScheduleTask['dayOfWeek']>('Wednesday');

  // Add Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ScheduleTask['category']>('Patrol');
  const [newPriority, setNewPriority] = useState<ScheduleTask['priority']>('High');
  const [newStartTime, setNewStartTime] = useState('10:00');
  const [newEndTime, setNewEndTime] = useState('12:00');
  const [newLocation, setNewLocation] = useState('');

  // Toggle complete
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle unlock for a day
  const handleToggleUnlock = (day: string) => {
    setUnlockedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Open Add Task Modal
  const handleOpenAddModal = (day?: ScheduleTask['dayOfWeek']) => {
    setTargetDayForAdd(day || (activeTab === 'daily' ? selectedDailyDay : 'Wednesday'));
    setShowAddModal(true);
  };

  // Submit Add Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dateMap: Record<ScheduleTask['dayOfWeek'], string> = {
      Monday: '14-09-2026',
      Tuesday: '15-09-2026',
      Wednesday: '16-09-2026',
      Thursday: '17-09-2026',
      Friday: '18-09-2026',
      Saturday: '19-09-2026',
      Sunday: '20-09-2026',
    };

    const created: ScheduleTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      dayOfWeek: targetDayForAdd,
      dateStr: dateMap[targetDayForAdd] || '16-09-2026',
      startTime: newStartTime,
      endTime: newEndTime,
      priority: newPriority,
      category: newCategory,
      location: newLocation.trim() || undefined,
      completed: false,
      assignedOfficer: currentUser.fullName,
    };

    setTasks((prev) => [...prev, created]);
    setNewTitle('');
    setNewLocation('');
    setShowAddModal(false);
  };

  // Exit full screen handler
  const handleExitFullScreen = () => {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (onExitFullScreen) {
      onExitFullScreen();
    }
  };

  // High-contrast, attractive category badges tailored explicitly for bright and dark modes
  const renderCategoryBadge = (cat: ScheduleTask['category']) => {
    switch (cat) {
      case 'Court Hearing':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs'
                : 'bg-purple-950/70 text-purple-300 border-purple-800/80'
            }`}
          >
            {t('Court Hearing')}
          </span>
        );
      case 'Forensic Lab':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
            }`}
          >
            {t('Forensic Lab')}
          </span>
        );
      case 'Interrogation':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-amber-950/70 text-amber-300 border-amber-800/80'
            }`}
          >
            {t('Interrogation')}
          </span>
        );
      case 'Patrol':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-2xs'
                : 'bg-sky-950/70 text-sky-300 border-sky-800/80'
            }`}
          >
            {t('Patrol')}
          </span>
        );
      case 'Briefing':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-2xs'
                : 'bg-teal-950/70 text-teal-300 border-teal-800/80'
            }`}
          >
            {t('Briefing')}
          </span>
        );
      case 'Raid / Tactical Op':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs'
                : 'bg-rose-950/70 text-rose-300 border-rose-800/80'
            }`}
          >
            {t('Raid / Tactical Op')}
          </span>
        );
      case 'Duty Roster':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {t('Duty Roster')}
          </span>
        );
      case 'VIP Escort':
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                : 'bg-indigo-950/70 text-indigo-300 border-indigo-800/80'
            }`}
          >
            {t('VIP Escort')}
          </span>
        );
      default:
        return (
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-tight whitespace-nowrap border ${
              isBright
                ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {cat}
          </span>
        );
    }
  };

  const dailyTasks = tasks.filter((t) => t.dayOfWeek === selectedDailyDay);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isBright ? 'bg-slate-100/90 text-slate-900' : 'bg-[#0b1120] text-slate-100'
      }`}
    >
      {/* MAIN CONTENT AREA */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Title Bar & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isBright ? 'text-slate-900' : 'text-white'
              }`}
            >
              {t('Schedule')}
            </h1>
            <p className={`text-xs sm:text-sm font-medium mt-0.5 ${
              isBright ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {t('Weekly tactical patrol deployments, court hearings, lab briefings, and investigation roster.')}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onExitFullScreen && (
              <button
                id="btn-schedule-exit-fullscreen"
                onClick={handleExitFullScreen}
                className={`px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer ${
                  isBright
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{t('Exit Full Screen')}</span>
              </button>
            )}
            <button
              id="btn-schedule-add-task"
              onClick={() => handleOpenAddModal()}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                isBright
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                  : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('Add Task')}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs: 1) Daily schedule | 2) Weekly schedule */}
        <div className="flex items-center space-x-2">
          <button
            id="tab-daily-schedule"
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'daily'
                ? isBright
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-400 text-slate-950 shadow-sm'
                : isBright
                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1) {t('Daily schedule')}</span>
          </button>

          <button
            id="tab-weekly-schedule"
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'weekly'
                ? isBright
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-400 text-slate-950 shadow-sm'
                : isBright
                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>2) {t('Weekly schedule')}</span>
          </button>
        </div>

        {/* VIEW 1: DAILY SCHEDULE */}
        {activeTab === 'daily' && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            {/* Sub-header row: Today's Schedule pill + Date + task count */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <div
                  className={`px-3.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 border ${
                    isBright
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-sky-950/50 text-sky-200 border-sky-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    {t("Today's Schedule")} ({t(selectedDailyDay)})
                  </span>
                </div>

                <span
                  className={`text-xs font-bold ${
                    isBright ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {selectedDailyDay === 'Wednesday'
                    ? '16-09-2026'
                    : tasks.find((t) => t.dayOfWeek === selectedDailyDay)?.dateStr || '16-09-2026'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Day selector */}
                <select
                  value={selectedDailyDay}
                  onChange={(e) => setSelectedDailyDay(e.target.value as ScheduleTask['dayOfWeek'])}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${
                    isBright
                      ? 'bg-white border-slate-300 text-slate-800 shadow-2xs'
                      : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                  title="Switch Day"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    isBright
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {dailyTasks.length} {t('tasks scheduled')}
                </span>
              </div>
            </div>

            {/* Daily Task Rows / Cards */}
            <div className="space-y-3">
              {dailyTasks.length === 0 ? (
                <div
                  className={`p-12 text-center rounded-2xl border text-sm ${
                    isBright
                      ? 'bg-white border-slate-200 text-slate-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {t('No tasks scheduled for this day.')}
                </div>
              ) : (
                dailyTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
                      task.completed
                        ? isBright
                          ? 'bg-emerald-50/40 border-emerald-200/90'
                          : 'bg-emerald-950/20 border-emerald-900/40'
                        : isBright
                        ? 'bg-white border-slate-200/90 hover:border-sky-300'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Left: Checkbox + Title + Time/Location Details */}
                    <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-all shrink-0 mt-0.5 sm:mt-0 ${
                          task.completed
                            ? 'bg-emerald-600 text-white'
                            : isBright
                            ? 'border-2 border-slate-300 hover:border-sky-600 bg-white'
                            : 'border-2 border-slate-600 hover:border-sky-400 bg-slate-800'
                        }`}
                        title={task.completed ? t('Mark incomplete') : t('Mark complete')}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span
                            className={`text-sm font-black tracking-tight leading-snug ${
                              task.completed
                                ? isBright
                                  ? 'line-through text-slate-400'
                                  : 'line-through text-slate-500'
                                : isBright
                                ? 'text-slate-900'
                                : 'text-slate-100'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        {/* Extra metadata: time & location */}
                        <div className="flex items-center space-x-3 mt-1 text-[11px] font-semibold text-slate-500">
                          {task.startTime && task.endTime && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {task.startTime} - {task.endTime}
                              </span>
                            </span>
                          )}
                          {task.location && (
                            <span className="flex items-center space-x-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{task.location}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Badge + Trash Button */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      {renderCategoryBadge(task.category)}

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className={`p-1.5 transition-colors cursor-pointer rounded-lg ${
                          isBright
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title={t('Delete task')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: WEEKLY SCHEDULE */}
        {activeTab === 'weekly' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3.5 items-stretch animate-in fade-in duration-150">
            {DAYS_OF_WEEK.map((day) => {
              const dayTasks = tasks.filter((t) => t.dayOfWeek === day);
              const isLockedByDefault = (day === 'Monday' || day === 'Tuesday') && !unlockedDays[day];

              return (
                <div
                  key={day}
                  className={`rounded-2xl border p-3 flex flex-col justify-between transition-all min-h-[580px] shadow-xs ${
                    isBright
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  {/* Top Column Header */}
                  <div>
                    <div
                      className={`flex items-center justify-between pb-2.5 border-b mb-3 ${
                        isBright ? 'border-slate-100' : 'border-slate-800/80'
                      }`}
                    >
                      {isLockedByDefault ? (
                        <>
                          <div className="flex items-center space-x-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span
                              className={`font-black text-xs tracking-wider uppercase ${
                                isBright ? 'text-amber-800' : 'text-amber-400'
                              }`}
                            >
                              {t(day)}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${
                              isBright
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-amber-950/60 text-amber-400 border-amber-800'
                            }`}
                          >
                            {t('Locked')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            className={`font-black text-xs tracking-wider uppercase ${
                              isBright ? 'text-sky-700' : 'text-sky-400'
                            }`}
                          >
                            {t(day)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(day)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              isBright
                                ? 'hover:bg-sky-50 text-slate-500 hover:text-sky-700'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                            title={`Add task for ${day}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Column Tasks List */}
                    <div className="space-y-2.5">
                      {dayTasks.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 italic font-medium">
                          {t('No tasks')}
                        </div>
                      ) : (
                        dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`rounded-xl border p-2.5 space-y-2 transition-all shadow-2xs ${
                              task.completed
                                ? isBright
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-emerald-950/20 border-emerald-800/40'
                                : isLockedByDefault
                                ? isBright
                                  ? 'bg-amber-50/30 border-amber-200/70 hover:border-amber-300'
                                  : 'bg-amber-950/20 border-amber-900/40'
                                : isBright
                                ? 'bg-slate-50/80 hover:bg-white border-slate-200/90 hover:border-sky-300 hover:shadow-xs'
                                : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              {isLockedByDefault ? (
                                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleTask(task.id)}
                                  className={`w-4 h-4 rounded flex items-center justify-center cursor-pointer transition-all shrink-0 mt-0.5 ${
                                    task.completed
                                      ? 'bg-emerald-600 text-white'
                                      : isBright
                                      ? 'border-2 border-slate-300 hover:border-sky-600 bg-white'
                                      : 'border-2 border-slate-600 hover:border-sky-400 bg-slate-900'
                                  }`}
                                  title={task.completed ? t('Mark incomplete') : t('Mark complete')}
                                >
                                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                </button>
                              )}

                              <p
                                className={`text-xs font-bold leading-snug line-clamp-2 flex-1 ${
                                  task.completed
                                    ? isBright
                                      ? 'line-through text-slate-400'
                                      : 'line-through text-slate-500'
                                    : isBright
                                    ? 'text-slate-900'
                                    : 'text-slate-100'
                                }`}
                              >
                                {task.title}
                              </p>

                              {!isLockedByDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className={`transition-colors cursor-pointer shrink-0 ${
                                    isBright
                                      ? 'text-slate-400 hover:text-rose-600'
                                      : 'text-slate-500 hover:text-rose-400'
                                  }`}
                                  title={t('Delete task')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Extra Time info */}
                            {task.startTime && task.endTime && (
                              <div
                                className={`text-[10px] font-semibold flex items-center space-x-1 ${
                                  isBright ? 'text-slate-500' : 'text-slate-400'
                                }`}
                              >
                                <Clock className="w-2.5 h-2.5" />
                                <span>
                                  {task.startTime} - {task.endTime}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-end pt-0.5">
                              {renderCategoryBadge(task.category)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Bottom of Column Button */}
                  <div
                    className={`pt-3 border-t mt-3 ${
                      isBright ? 'border-slate-100' : 'border-slate-800/80'
                    }`}
                  >
                    {isLockedByDefault ? (
                      <button
                        type="button"
                        onClick={() => handleToggleUnlock(day)}
                        className={`w-full text-xs font-bold flex items-center justify-center space-x-1.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          isBright
                            ? 'bg-amber-50 hover:bg-amber-100/90 text-amber-800 border-amber-200/80'
                            : 'bg-amber-950/30 hover:bg-amber-950/60 text-amber-400 border-amber-800/60'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('Open for seeing')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(day)}
                        className={`w-full text-xs font-bold flex items-center justify-center space-x-1 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          isBright
                            ? 'bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border-slate-200'
                            : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('Add task')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. ADD TASK MODAL (Fully operative) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl animate-in zoom-in-95 duration-150 ${
              isBright
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-900 border-slate-800 text-slate-100'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b mb-4 ${
                isBright ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isBright ? 'bg-sky-50 text-sky-600' : 'bg-sky-500/10 text-sky-400'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3
                  className={`text-sm font-black ${
                    isBright ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {t('Add Task to Schedule')}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded-lg ${
                  isBright
                    ? 'text-slate-400 hover:text-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${
                    isBright ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {t('Task Title')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Sessions Court Summary Hearing"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-hidden transition-all ${
                    isBright
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                      : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-sky-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {t('Day')}
                  </label>
                  <select
                    value={targetDayForAdd}
                    onChange={(e) => setTargetDayForAdd(e.target.value as ScheduleTask['dayOfWeek'])}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      isBright
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {t('Category')}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ScheduleTask['category'])}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      isBright
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Court Hearing">{t('Court Hearing')}</option>
                    <option value="Forensic Lab">{t('Forensic Lab')}</option>
                    <option value="Interrogation">{t('Interrogation')}</option>
                    <option value="Patrol">{t('Patrol')}</option>
                    <option value="Briefing">{t('Briefing')}</option>
                    <option value="Raid / Tactical Op">{t('Raid / Tactical Op')}</option>
                    <option value="Duty Roster">{t('Duty Roster')}</option>
                    <option value="VIP Escort">{t('VIP Escort')}</option>
                    <option value="Evidence Review">{t('Evidence Review')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {t('Start Time')}
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                      isBright
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isBright ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {t('End Time')}
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                      isBright
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${
                    isBright ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {t('Location / Venue (Optional)')}
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Sector 4 Cyber Corridor"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                    isBright
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    isBright
                      ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                      : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {t('Cancel')}
                </button>

                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-xs ${
                    isBright
                      ? 'bg-sky-600 hover:bg-sky-700 text-white'
                      : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                  }`}
                >
                  {t('Save Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
