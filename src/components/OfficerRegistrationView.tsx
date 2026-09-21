import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, UserRole, Case } from '../types';
import { PasswordStrengthBar, checkPasswordRequirements } from './PasswordStrengthBar';
import { IrisVerificationBox } from './IrisVerificationBox';
import { CaptchaBox } from './CaptchaBox';
import {
  UserCheck,
  ShieldCheck,
  Upload,
  FileText,
  ScanEye,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Paperclip,
  Trash2,
  Camera,
  ImageIcon,
  Copy,
  Check,
  ArrowLeft,
  UserPlus,
  BadgeCheck,
  Sparkles,
  Key,
  Shield,
  User as UserIcon,
  Search,
  FolderLock,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  'Select Department',
  'Crime Branch',
  'Cyber Crime Cell',
  'Law & Order',
  'Traffic Police',
  'Women Safety Cell',
  'Anti-Narcotics Cell',
  'Economic Offences Wing (EOW)',
  'Special Task Force (STF)',
  'Forensic Investigation Department',
  'Police Station General Duty',
  'Others',
];

const DESIGNATION_OPTIONS = [
  'Select Official Designation',
  'Police Inspector (PI)',
  'Assistant Police Inspector (API)',
  'Police Sub-Inspector (PSI)',
  'Assistant Sub-Inspector (ASI)',
  'Head Constable',
  'Police Constable',
  'Forensic Investigation Expert',
  'Cyber Crime Officer',
  'Others',
];

interface OfficerRegistrationViewProps {
  currentUser: User;
  existingUsers: User[];
  cases?: Case[];
  onRegisterApprovedUser: (newUser: User, linkedCaseIds?: string[]) => void;
  themeMode?: 'dark' | 'bright';
  onBackToDashboard?: () => void;
}

export const OfficerRegistrationView: React.FC<OfficerRegistrationViewProps> = ({
  currentUser,
  existingUsers,
  cases = [],
  onRegisterApprovedUser,
  themeMode = 'dark',
  onBackToDashboard,
}) => {
  const isDsp = currentUser.role === 'DSP';
  const isPoliceOfficer = currentUser.role === 'Police Officer';

  // Active Form Tab: 'Victim' or 'Police Officer'
  // DSP only registers Officers; Police Officer only registers Victims
  const [selectedForm, setSelectedForm] = useState<'Victim' | 'Police Officer'>(
    isDsp ? 'Police Officer' : 'Victim'
  );

  useEffect(() => {
    if (isDsp && selectedForm !== 'Police Officer') {
      setSelectedForm('Police Officer');
    } else if (isPoliceOfficer && selectedForm !== 'Victim') {
      setSelectedForm('Victim');
    }
  }, [isDsp, isPoliceOfficer, selectedForm]);

  // Role Selection for Officer registration: 'DSP' | 'Host' | 'Police Officer'
  // Role Selection for Officer registration: 'DSP' | 'Host' | 'Police Officer'
  const [officerRole, setOfficerRole] = useState<'DSP' | 'Host' | 'Police Officer'>('Police Officer');

  // If DSP registration, force role to not be DSP (only 'Host' or 'Police Officer')
  useEffect(() => {
    if (isDsp && officerRole === 'DSP') {
      setOfficerRole('Police Officer');
      setBadgeId(`INS-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [isDsp, officerRole]);

  // Active Multi-Step (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // STEP 1: Personal Information
  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [midName, setMidName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('1995-05-12');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [bloodGroupType, setBloodGroupType] = useState<'A' | 'B' | 'AB' | 'O'>('B');
  const [bloodRhFactor, setBloodRhFactor] = useState<'+' | '-'>('+');

  // STEP 2: Case Selection for Victim & Professional Info for Officer
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseFilterTab, setCaseFilterTab] = useState<'matched' | 'all'>('matched');

  const [selectedDepartment, setSelectedDepartment] = useState('Select Department');
  const [customDepartment, setCustomDepartment] = useState('');
  const [badgeId, setBadgeId] = useState(`INS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [experience, setExperience] = useState('5 Years');
  const [selectedDesignation, setSelectedDesignation] = useState('Select Official Designation');
  const [customDesignation, setCustomDesignation] = useState('');

  // STEP 3: Account Details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STEP 4: Document Uploads
  const [idProofName, setIdProofName] = useState('');
  const [idProofSize, setIdProofSize] = useState('');
  const [serviceIdName, setServiceIdName] = useState('');
  const [serviceIdSize, setServiceIdSize] = useState('');
  const [passportPhotoName, setPassportPhotoName] = useState('');
  const [passportPhotoSize, setPassportPhotoSize] = useState('');
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string | null>(null);

  const idProofInputRef = useRef<HTMLInputElement | null>(null);
  const serviceIdInputRef = useRef<HTMLInputElement | null>(null);
  const passportPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // STEP 5: Biometric Verification
  const [irisScanVerified, setIrisScanVerified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // STEP 6: Undertaking
  const [agreedTerms, setAgreedTerms] = useState(false);

  // UI States
  const [errorMessage, setErrorMessage] = useState('');
  const [successUser, setSuccessUser] = useState<User | null>(null);
  const [recentRegistrations, setRecentRegistrations] = useState<User[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dynamic Case Matching for Victim's Case
  const matchedCases = useMemo(() => {
    if (!cases || cases.length === 0) return [];
    const cleanName = fullName.toLowerCase().trim();
    if (!cleanName) return [];
    const tokens = cleanName.split(/\s+/).filter((t) => t.length >= 2);

    return cases.filter((c) => {
      const vName = (c.victimName || '').toLowerCase();
      const cName = (c.caseName || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();

      // Direct full name substring match
      if (vName && (vName.includes(cleanName) || cleanName.includes(vName))) return true;
      // Token match against victim name
      if (tokens.some((token) => vName.includes(token))) return true;
      // Token match against case name or description
      if (tokens.some((token) => cName.includes(token) || desc.includes(token))) return true;
      return false;
    });
  }, [cases, fullName]);

  const displayedCases = useMemo(() => {
    if (!cases) return [];
    let baseList = cases;
    if (caseFilterTab === 'matched' && matchedCases.length > 0) {
      baseList = matchedCases;
    }
    const q = caseSearchQuery.toLowerCase().trim();
    if (!q) return baseList;
    return baseList.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.caseName.toLowerCase().includes(q) ||
        c.crimeType.toLowerCase().includes(q) ||
        (c.victimName && c.victimName.toLowerCase().includes(q)) ||
        c.location.toLowerCase().includes(q)
    );
  }, [cases, matchedCases, caseFilterTab, caseSearchQuery]);

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId]
    );
  };

  // Step 2: Particular Case lookup for Victim Registration (asking only for Case ID)
  const dialedCaseId = caseSearchQuery.trim();
  const foundCase = useMemo(() => {
    if (!dialedCaseId || !cases || cases.length === 0) return null;
    const q = dialedCaseId.toLowerCase();
    const exact = cases.find((c) => c.id.toLowerCase() === q);
    if (exact) return exact;
    const cleanQ = q.replace(/[^a-z0-9]/g, '');
    const cleanMatch = cases.find((c) => c.id.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanQ);
    if (cleanMatch) return cleanMatch;
    if (q.length >= 3) {
      return cases.find((c) => c.id.toLowerCase().includes(q));
    }
    return null;
  }, [cases, dialedCaseId]);

  // Automatically enable case update access when a valid case ID is dialed
  const [autoLinkedCaseId, setAutoLinkedCaseId] = useState<string | null>(null);
  useEffect(() => {
    if (foundCase && autoLinkedCaseId !== foundCase.id) {
      setSelectedCaseIds([foundCase.id]);
      setAutoLinkedCaseId(foundCase.id);
    }
  }, [foundCase, autoLinkedCaseId]);

  // Switch form tab (Victim / Officer) and reset wizard
  const handleSwitchForm = (formType: 'Victim' | 'Police Officer') => {
    setSelectedForm(formType);
    setActiveStep(1);
    setErrorMessage('');
    setSuccessUser(null);
    setIrisScanVerified(false);
    setCaptchaVerified(false);
    setAgreedTerms(false);
    setSelectedCaseIds([]);
    setCaseSearchQuery('');
    setCaseFilterTab('matched');
    // Refresh pre-filled badge ID if officer
    if (formType === 'Police Officer') {
      const prefix = officerRole === 'DSP' ? 'DSP' : officerRole === 'Host' ? 'HOST' : 'INS';
      setBadgeId(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  // Document Helpers
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleIdProofFile = (file?: File) => {
    if (!file) return;
    setIdProofName(file.name);
    setIdProofSize(formatFileSize(file.size));
  };

  const clearIdProof = () => {
    setIdProofName('');
    setIdProofSize('');
    if (idProofInputRef.current) idProofInputRef.current.value = '';
  };

  const handleServiceIdFile = (file?: File) => {
    if (!file) return;
    setServiceIdName(file.name);
    setServiceIdSize(formatFileSize(file.size));
  };

  const clearServiceId = () => {
    setServiceIdName('');
    setServiceIdSize('');
    if (serviceIdInputRef.current) serviceIdInputRef.current.value = '';
  };

  const handlePassportPhotoFile = (file?: File) => {
    if (!file) return;
    setPassportPhotoName(file.name);
    setPassportPhotoSize(formatFileSize(file.size));
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPassportPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPassportPhotoPreview(null);
    }
  };

  const clearPassportPhoto = () => {
    setPassportPhotoName('');
    setPassportPhotoSize('');
    setPassportPhotoPreview(null);
    if (passportPhotoInputRef.current) passportPhotoInputRef.current.value = '';
  };

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    setErrorMessage('');

    if (step === 1) {
      if (!surname.trim() || surname.trim().length < 2) {
        setErrorMessage('Please enter Surname (at least 2 characters).');
        return false;
      }
      if (!firstName.trim() || firstName.trim().length < 2) {
        setErrorMessage('Please enter First Name (at least 2 characters).');
        return false;
      }
      if (!midName.trim() || midName.trim().length < 2) {
        setErrorMessage('Please enter Mid Name (at least 2 characters).');
        return false;
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMessage('Phone Number must contain exactly 10 digits.');
        return false;
      }
      if (!email.trim() || !email.includes('@gmail.com')) {
        setErrorMessage('Official Email Address must be a valid email containing @gmail.com.');
        return false;
      }
      if (!address.trim()) {
        setErrorMessage('Please enter residential address.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (selectedForm === 'Police Officer') {
        if (selectedDepartment === 'Select Department') {
          setErrorMessage('Please choose a Police Department / Branch.');
          return false;
        }
        if (selectedDepartment === 'Others' && !customDepartment.trim()) {
          setErrorMessage('Please specify your Department name.');
          return false;
        }
        if (!badgeId.trim()) {
          setErrorMessage('Please enter the Badge ID / Service Number.');
          return false;
        }
        if (selectedDesignation === 'Select Official Designation') {
          setErrorMessage('Please choose the Official Designation.');
          return false;
        }
        if (selectedDesignation === 'Others' && !customDesignation.trim()) {
          setErrorMessage('Please specify your Designation.');
          return false;
        }
      }
      // For Victim, credentials are automatically handled as citizen complainant
      return true;
    }

    if (step === 3) {
      const cleanUsername = username.toLowerCase().trim();
      if (!cleanUsername) {
        setErrorMessage('Please choose a username for this account.');
        return false;
      }
      if (cleanUsername.length < 3) {
        setErrorMessage('Username must be at least 3 characters long.');
        return false;
      }
      if (existingUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
        setErrorMessage(`Username '${username}' is already taken. Please choose a different unique username.`);
        return false;
      }
      if (!password) {
        setErrorMessage('Please enter a password.');
        return false;
      }
      const reqs = checkPasswordRequirements(password);
      if (!reqs.hasMinLength || !reqs.hasUppercase || !reqs.hasNumber || !reqs.hasSpecialChar) {
        setErrorMessage('Password does not meet all 4 security criteria (8+ chars, uppercase, number, symbol).');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify the confirm password field.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!idProofName) {
        setErrorMessage(
          selectedForm === 'Victim'
            ? 'Please upload Identity Proof (Aadhaar Card).'
            : 'Please upload Identity Proof document (Aadhaar / Passport / DL).'
        );
        return false;
      }
      if (!serviceIdName) {
        setErrorMessage(
          selectedForm === 'Victim'
            ? 'Please upload the Applicant Photograph.'
            : 'Please upload the Official Service ID / Credential.'
        );
        return false;
      }
      if (selectedForm !== 'Victim' && !passportPhotoName) {
        setErrorMessage('Please upload Passport Size Photo.');
        return false;
      }
      return true;
    }

    if (step === 5) {
      if (selectedForm === 'Victim') {
        if (!captchaVerified) {
          setErrorMessage('Please complete and verify the Security CAPTCHA code.');
          return false;
        }
      } else {
        if (!irisScanVerified) {
          setErrorMessage('Iris Biometric scan verification is mandatory for police officer registration.');
          return false;
        }
      }
      return true;
    }

    if (step === 6) {
      if (!agreedTerms) {
        setErrorMessage('Please review and check the Official Security Undertaking & Direct Induction Authorization.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextClick = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleStepClick = (stepNum: number) => {
    // If trying to jump ahead, validate current step
    if (stepNum > activeStep) {
      if (!validateStep(activeStep)) return;
    }
    setActiveStep(stepNum);
  };

  // Submit Final Registration (Immediate Direct Approval!)
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    const dept =
      selectedForm === 'Victim'
        ? 'Citizen Complainant / Victim'
        : selectedDepartment === 'Others'
        ? customDepartment.trim()
        : selectedDepartment;

    const finalBadgeId =
      selectedForm === 'Victim'
        ? `VIC-${Math.floor(1000 + Math.random() * 9000)}`
        : badgeId.trim();

    const finalRole: UserRole = selectedForm === 'Victim' ? 'Victim' : officerRole;

    const finalFullName =
      [surname.trim(), firstName.trim(), midName.trim()].filter(Boolean).join(' ') || fullName.trim();

    // Inherit taluka access from registering DSP
    const dspState = currentUser.state || 'Maharashtra';
    const dspDistrict = currentUser.district || 'Solapur';
    const dspTalukas = currentUser.talukas && currentUser.talukas.length > 0
      ? currentUser.talukas
      : (currentUser.taluka ? [currentUser.taluka] : ['Karmala']);
    const dspTaluka = currentUser.taluka || dspTalukas[0] || 'Karmala';

    // DIRECTLY APPROVED USER OBJECT
    // User does NOT need further approval from Host or DSP!
    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: finalFullName,
      username: username.toLowerCase().trim(),
      role: finalRole,
      department: dept,
      badgeId: finalBadgeId,
      email: email.trim(),
      phone: phone.trim(),
      status: 'Approved', // DIRECT APPROVAL AS REQUESTED!
      password: password, // Saved so user can log in immediately with this password!
      registeredAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      approvedBy: `${currentUser.role} ${currentUser.fullName} (${currentUser.badgeId})`,
      assignedCases: selectedForm === 'Victim' ? selectedCaseIds : [],
      avatarUrl: passportPhotoPreview || undefined,
      photoUrl: passportPhotoPreview || undefined,
      // When DSP registers Host or Police Officer, assign the exact same taluka access!
      state: isDsp ? dspState : (currentUser.state || 'Maharashtra'),
      district: isDsp ? dspDistrict : (currentUser.district || 'Solapur'),
      talukas: isDsp ? dspTalukas : (currentUser.talukas || [dspTaluka]),
      taluka: isDsp ? dspTaluka : (currentUser.taluka || dspTaluka),
    };

    // Propagate up to global users state in App.tsx
    onRegisterApprovedUser(newUser, selectedForm === 'Victim' ? selectedCaseIds : []);

    // Save locally for quick reference
    setRecentRegistrations((prev) => [newUser, ...prev]);
    setSuccessUser(newUser);
  };

  // Reset form to register another person
  const handleRegisterAnother = () => {
    setSuccessUser(null);
    setActiveStep(1);
    setFullName('');
    setSurname('');
    setFirstName('');
    setMidName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    clearIdProof();
    clearServiceId();
    clearPassportPhoto();
    setIrisScanVerified(false);
    setCaptchaVerified(false);
    setAgreedTerms(false);
    setSelectedCaseIds([]);
    setCaseSearchQuery('');
    setCaseFilterTab('matched');
    setErrorMessage('');
    if (isDsp) {
      setOfficerRole('Police Officer');
    }
    if (selectedForm === 'Police Officer' || isDsp) {
      const prefix = officerRole === 'DSP' ? 'DSP' : officerRole === 'Host' ? 'HOST' : 'INS';
      setBadgeId(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSelectedDepartment('Select Department');
      setSelectedDesignation('Select Official Designation');
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const steps = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: selectedForm === 'Victim' ? 'Citizen Enrolment' : 'Professional Info' },
    { num: 3, title: 'Account Details' },
    { num: 4, title: selectedForm === 'Victim' ? 'Aadhaar & Photo' : 'Document Upload' },
    { num: 5, title: selectedForm === 'Victim' ? 'CAPTCHA' : 'Iris Scan' },
    { num: 6, title: 'Direct Authorization' },
  ];

  return (
    <div
      id="officer-registration-page"
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors ${
        themeMode === 'bright' ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0f1d] text-slate-100'
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Ribbon */}
        <div
          className={`p-5 rounded-2xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            themeMode === 'bright'
              ? 'bg-white border-slate-300'
              : 'bg-slate-900/90 border-blue-900/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            {onBackToDashboard && (
              <button
                id="btn-back-to-dashboard"
                onClick={onBackToDashboard}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  themeMode === 'bright'
                    ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={isDsp ? 'Return to SHO/Inspector Dashboard' : 'Return to Officer Dashboard'}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-slate-950 shadow-md">
              <UserPlus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wide">
                  {isDsp
                    ? 'Officer & Personnel Registration'
                    : isPoliceOfficer
                    ? 'Victim & Citizen Registration'
                    : 'Internal Personnel Registration'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 border border-emerald-500/40">
                  Direct Login Clearance
                </span>
              </div>
              <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                Authorized by {isDsp ? 'SHO/Inspector Command Headquarters' : 'Police Officer'}: <strong className={themeMode === 'bright' ? 'text-blue-900' : 'text-yellow-400'}>{currentUser.fullName}</strong> ({currentUser.badgeId}). Registrations bypass Investigator / SHO/Inspector approval.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${
                themeMode === 'bright'
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : 'bg-blue-950/40 border-blue-800 text-blue-300'
              }`}
            >
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              <span>Instant Approval Mode</span>
            </span>
          </div>
        </div>

        {/* Form Selector Banner / Tabs */}
        {isPoliceOfficer ? (
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
              themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 border border-blue-500/30">
                <UserIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-base font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                    Victim Registration
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-blue-500/20 text-blue-600 font-bold border border-blue-500/30">
                    Citizen Portal
                  </span>
                </div>
                <p className={`text-xs font-semibold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Register citizens and crime complainants directly with immediate login clearance and case linkage.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
              Citizen Portal Active
            </span>
          </div>
        ) : !isDsp ? (
          <div
            className={`p-2 rounded-2xl border shadow-sm grid grid-cols-2 gap-2 ${
              themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <button
              id="tab-reg-victim"
              type="button"
              onClick={() => handleSwitchForm('Victim')}
              className={`p-3.5 sm:p-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
                selectedForm === 'Victim'
                  ? themeMode === 'bright'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 font-black'
                  : themeMode === 'bright'
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span>1. Victim Registration</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block ${
                  selectedForm === 'Victim'
                    ? themeMode === 'bright'
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-950 text-yellow-400 font-bold'
                    : 'bg-slate-500/20 text-slate-400'
                }`}
              >
                Citizen Portal
              </span>
            </button>

            <button
              id="tab-reg-officer"
              type="button"
              onClick={() => handleSwitchForm('Police Officer')}
              className={`p-3.5 sm:p-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
                selectedForm === 'Police Officer'
                  ? themeMode === 'bright'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 font-black'
                  : themeMode === 'bright'
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>2. Officer Registration</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:inline-block ${
                  selectedForm === 'Police Officer'
                    ? themeMode === 'bright'
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-950 text-yellow-400 font-bold'
                    : 'bg-slate-500/20 text-slate-400'
                }`}
              >
                Law Enforcement
              </span>
            </button>
          </div>
        ) : (
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border shadow-sm flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-white border-slate-300'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-base font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                    Officer Registration
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-yellow-500/20 text-yellow-500 font-bold border border-yellow-500/30">
                    Law Enforcement Personnel
                  </span>
                </div>
                <p className={`text-xs font-semibold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Register and induct Police Officers, Investigators, and SHO/Inspector personnel directly with immediate login clearance.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              SHO/Inspector Direct Induction
            </span>
          </div>
        )}

        {/* Main Card */}
        <div
          className={`rounded-2xl border shadow-2xl overflow-hidden transition-all ${
            themeMode === 'bright'
              ? 'bg-white border-slate-300'
              : 'bg-slate-900/90 border-blue-900/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* If Success: Show Direct Activation Card */}
          {successUser ? (
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 mx-auto animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div>
                <h2
                  className={`text-2xl sm:text-3xl font-black ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}
                >
                  Registration Completed & Direct Login Granted!
                </h2>
                <p
                  className={`max-w-xl mx-auto text-sm sm:text-base font-semibold mt-2 leading-relaxed ${
                    themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  The new account for <strong className="text-emerald-600 font-black">{successUser.fullName}</strong> as a{' '}
                  <strong className={themeMode === 'bright' ? 'text-blue-900 font-black' : 'text-yellow-400'}>
                    {successUser.role === 'DSP' ? 'SHO/Inspector' : successUser.role === 'Host' ? 'Investigator' : successUser.role}
                  </strong>{' '}
                  is <strong className="text-emerald-500 font-black">immediately Approved</strong>. No further approvals by the Investigator or SHO/Inspector are required!
                </p>
              </div>

              {/* Login Ready Credentials Box */}
              <div
                className={`p-6 rounded-2xl border max-w-lg mx-auto text-left space-y-4 shadow-xl ${
                  themeMode === 'bright'
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-slate-950/80 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <Key className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-black tracking-wide uppercase">
                      Instant Login Credentials
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-600 border border-emerald-500/40">
                    STATUS: APPROVED
                  </span>
                </div>

                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/10 border border-black/10">
                    <div>
                      <span className="block text-[11px] font-sans font-bold text-slate-400">Username</span>
                      <span className="font-bold text-base">{successUser.username}</span>
                    </div>
                    <button
                      id="btn-copy-username"
                      onClick={() => copyToClipboard(successUser.username, 'username')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                        copiedField === 'username'
                          ? 'bg-emerald-600 text-white'
                          : themeMode === 'bright'
                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {copiedField === 'username' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'username' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/10 border border-black/10">
                    <div>
                      <span className="block text-[11px] font-sans font-bold text-slate-400">Password</span>
                      <span className="font-bold text-base">{successUser.password || '••••••••'}</span>
                    </div>
                    {successUser.password && (
                      <button
                        id="btn-copy-password"
                        onClick={() => copyToClipboard(successUser.password || '', 'password')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          copiedField === 'password'
                            ? 'bg-emerald-600 text-white'
                            : themeMode === 'bright'
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {copiedField === 'password' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'password' ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 font-sans font-semibold">Assigned Role:</span>
                      <p className="font-bold font-sans text-sm text-yellow-500">{successUser.role}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans font-semibold">Badge / ID:</span>
                      <p className="font-bold font-mono text-sm">{successUser.badgeId}</p>
                    </div>
                  </div>

                  {/* Connected Cases for Victim */}
                  {successUser.role === 'Victim' && successUser.assignedCases && successUser.assignedCases.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-left space-y-2 pt-2">
                      <div className="flex items-center space-x-1.5 font-black text-blue-400">
                        <FolderLock className="w-4 h-4" />
                        <span>Connected Case(s) for Victim Dashboard:</span>
                      </div>
                      <div className="space-y-1.5">
                        {successUser.assignedCases.map((cId) => {
                          const cObj = cases.find((c) => c.id === cId);
                          return (
                            <div
                              key={cId}
                              className="p-2 rounded-lg bg-black/25 border border-white/5 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-mono font-bold text-xs text-yellow-400 block">
                                  {cId}
                                </span>
                                <span className="text-[11px] text-slate-300 truncate block">
                                  {cObj?.caseName || 'Police Case File'}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                ✓ Live Updates Enabled
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`p-3 rounded-xl text-xs font-bold space-y-1 ${
                  themeMode === 'bright' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/50'
                }`}>
                  <p className="flex items-center space-x-1.5 font-black">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>How to Login Immediately:</span>
                  </p>
                  <p className="font-medium text-[11px] leading-relaxed">
                    1. Log out or open the Login Page.<br />
                    2. Select Role as <strong>'{successUser.role}'</strong>.<br />
                    3. Enter username <strong>'{successUser.username}'</strong> and your set password.<br />
                    4. Complete verification ({successUser.role === 'Victim' ? 'CAPTCHA' : 'Iris Scan'}) and click Login!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  id="btn-register-another"
                  onClick={handleRegisterAnother}
                  className="px-6 py-3 rounded-xl text-sm font-black bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-lg cursor-pointer"
                >
                  + Register Another Person
                </button>
                {onBackToDashboard && (
                  <button
                    id="btn-return-dashboard"
                    onClick={onBackToDashboard}
                    className={`px-6 py-3 rounded-xl text-sm font-black border transition-colors cursor-pointer ${
                      themeMode === 'bright'
                        ? 'border-slate-300 hover:bg-slate-200 text-slate-800'
                        : 'border-slate-700 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    Return to Dashboard
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Step Navigation Bar */}
              <div
                className={`px-4 sm:px-8 py-3.5 border-b overflow-x-auto ${
                  themeMode === 'bright' ? 'bg-sky-50/60 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between min-w-[650px] gap-2">
                  {steps.map((step) => {
                    const isActive = activeStep === step.num;
                    const isCompleted = activeStep > step.num;

                    return (
                      <button
                        key={step.num}
                        id={`btn-step-${step.num}`}
                        type="button"
                        onClick={() => handleStepClick(step.num)}
                        className="flex items-center space-x-2 focus:outline-none group cursor-pointer"
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-md'
                              : isActive
                              ? themeMode === 'bright'
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-md font-black'
                                : 'bg-yellow-500 text-black ring-2 ring-yellow-400/60 shadow-md shadow-yellow-500/30'
                              : themeMode === 'bright'
                              ? 'bg-slate-200 text-slate-700 font-extrabold group-hover:bg-slate-300'
                              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                          }`}
                        >
                          {step.num}
                        </span>
                        <span
                          className={`text-xs font-extrabold whitespace-nowrap ${
                            isActive
                              ? themeMode === 'bright'
                                ? 'text-blue-950 font-black'
                                : 'text-yellow-400 font-bold'
                              : isCompleted
                              ? 'text-emerald-700 font-bold'
                              : themeMode === 'bright'
                              ? 'text-slate-600 group-hover:text-slate-900'
                              : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                        >
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div
                  id="reg-error-alert"
                  className="mx-4 sm:mx-8 mt-5 p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-600 text-xs sm:text-sm font-bold flex items-center shadow-lg"
                >
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Multi-Step Form */}
              <form onSubmit={handleSubmitRegistration} className="p-4 sm:p-8 space-y-6">
                {/* STEP 1: Personal Information */}
                {activeStep === 1 && (
                  <div className="space-y-5">
                    <h3
                      className={`text-lg font-black flex items-center border-b pb-2.5 ${
                        themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                      }`}
                    >
                      <UserCheck className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 1. Personal Information ({isDsp ? 'Officer' : selectedForm})
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="col-span-1 sm:col-span-2 space-y-2">
                        <label className={`block text-sm font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Full Legal Name (Surname, First Name, Mid Name) *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                              Surname *
                            </label>
                            <input
                              id="input-surname"
                              type="text"
                              value={surname}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSurname(val);
                                setFullName([val.trim(), firstName.trim(), midName.trim()].filter(Boolean).join(' '));
                              }}
                              placeholder="Surname"
                              className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                                themeMode === 'bright'
                                  ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                  : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400'
                              }`}
                              required
                            />
                          </div>

                          <div>
                            <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                              First Name *
                            </label>
                            <input
                              id="input-firstname"
                              type="text"
                              value={firstName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFirstName(val);
                                setFullName([surname.trim(), val.trim(), midName.trim()].filter(Boolean).join(' '));
                              }}
                              placeholder="First Name"
                              className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                                themeMode === 'bright'
                                  ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                  : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400'
                              }`}
                              required
                            />
                          </div>

                          <div>
                            <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                              Mid Name *
                            </label>
                            <input
                              id="input-midname"
                              type="text"
                              value={midName}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMidName(val);
                                setFullName([surname.trim(), firstName.trim(), val.trim()].filter(Boolean).join(' '));
                              }}
                              placeholder="Mid Name"
                              className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                                themeMode === 'bright'
                                  ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                  : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400'
                              }`}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Phone Number (Exactly 10 Digits) *
                        </label>
                        <input
                          id="input-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          className={`w-full px-4 py-3 rounded-xl text-base font-mono font-bold transition-all border focus:outline-none ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                              : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Official Email Address (Must contain @gmail.com) *
                        </label>
                        <input
                          id="input-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. applicant.ramesh@gmail.com"
                          className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900/90 text-slate-100 border-blue-500'
                          }`}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                            Date of Birth
                          </label>
                          <input
                            id="input-dob"
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className={`w-full px-3.5 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                            Gender
                          </label>
                          <select
                            id="select-gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className={`w-full px-3.5 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            }`}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Residential Address & Blood Group */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Residential Address *
                        </label>
                        <textarea
                          id="textarea-address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={3.5}
                          placeholder="Enter complete residential address with landmark and city"
                          className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900/90 text-slate-100 border-blue-500'
                          }`}
                          required
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Blood Group *
                        </label>
                        <div
                          className={`p-3 rounded-xl border space-y-2.5 ${
                            themeMode === 'bright'
                              ? 'bg-slate-50 border-slate-300 text-slate-900'
                              : 'border-blue-500 bg-slate-900/90'
                          }`}
                        >
                          <div>
                            <span className={`block text-xs font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                              Select Type
                            </span>
                            <div className="grid grid-cols-4 gap-1">
                              {(['A', 'B', 'AB', 'O'] as const).map((g) => (
                                <button
                                  key={g}
                                  id={`btn-blood-${g}`}
                                  type="button"
                                  onClick={() => setBloodGroupType(g)}
                                  className={`py-1.5 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${
                                    bloodGroupType === g
                                      ? themeMode === 'bright'
                                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                        : 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                                      : themeMode === 'bright'
                                      ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className={`block text-xs font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
                              Rh Factor (+ / -)
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {(['+', '-'] as const).map((rh) => (
                                <button
                                  key={rh}
                                  id={`btn-rh-${rh === '+' ? 'plus' : 'minus'}`}
                                  type="button"
                                  onClick={() => setBloodRhFactor(rh)}
                                  className={`py-1.5 text-sm font-black rounded-lg border transition-all cursor-pointer ${
                                    bloodRhFactor === rh
                                      ? 'bg-red-600 text-white border-red-700'
                                      : themeMode === 'bright'
                                      ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                                  }`}
                                >
                                  {rh}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div
                            className={`text-center pt-1 border-t flex items-center justify-between px-1 ${
                              themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
                            }`}
                          >
                            <span className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>
                              Selected:
                            </span>
                            <span className={`font-mono font-black text-sm ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>
                              {bloodGroupType}{bloodRhFactor}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Professional Details / Role Verification */}
                {activeStep === 2 && (
                  <div className="space-y-5">
                    <h3
                      className={`text-lg font-black flex items-center border-b pb-2.5 ${
                        themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                      }`}
                    >
                      <ShieldCheck className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 2.{' '}
                      {selectedForm === 'Victim' ? 'Citizen Complainant Enrolment' : 'Officer Professional Details & Role Selection'}
                    </h3>

                    {selectedForm === 'Victim' ? (
                      <div className="space-y-5">
                        <div
                          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                            themeMode === 'bright'
                              ? 'bg-blue-50/80 border-2 border-blue-200 text-slate-900'
                              : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-100'
                          }`}
                        >
                          <div className="flex items-start space-x-3.5">
                            <div
                              className={`p-3 rounded-xl shrink-0 ${
                                themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950 font-black'
                              }`}
                            >
                              <UserCheck className="w-6 h-6" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <h4
                                className={`text-base font-black ${
                                  themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                                }`}
                              >
                                Citizen Complainant Enrolment
                              </h4>
                              <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                                Department firm, police badge numbers, years of service experience, and internal service ranks are{' '}
                                <strong>not required</strong> for Citizen / Victim accounts.
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs font-mono pt-1">
                                <span className="px-2.5 py-1 rounded-lg bg-black/10 border border-black/10">
                                  Role: <strong>Victim</strong>
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-black/10 border border-black/10">
                                  Clearance: <strong>Direct Police Station Approval</strong>
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-black/10 border border-black/10">
                                  Dashboard: <strong>Victim Investigation Portal</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ======================================================== */}
                        {/* VICTIM'S CASE SECTION                                    */}
                        {/* ======================================================== */}
                        <div
                          className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white border-2 border-blue-300 shadow-md'
                              : 'bg-[#091024] border-blue-600/70 shadow-[0_0_25px_rgba(37,99,235,0.2)]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-700/30">
                            <div className="flex items-center space-x-3">
                              <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shrink-0">
                                <FolderLock className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4
                                    className={`text-base sm:text-lg font-black tracking-tight ${
                                      themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                                    }`}
                                  >
                                    Victim's Case Details
                                  </h4>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40">
                                    Case Linking & Updates
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Enter the Case ID to link this case. The victim will be able to see case updates and court updates.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Case ID Input Field */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor="input-victim-case-id"
                                className={`block text-xs sm:text-sm font-extrabold ${
                                  themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                                }`}
                              >
                                Case ID *
                              </label>
                              <span className="text-[11px] text-slate-400">
                                Dial or type the registered Case ID
                              </span>
                            </div>
                            <div className="relative">
                              <Search
                                className={`w-4 h-4 absolute left-3.5 top-3 ${
                                  themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'
                                }`}
                              />
                              <input
                                id="input-victim-case-id"
                                type="text"
                                value={caseSearchQuery}
                                onChange={(e) => setCaseSearchQuery(e.target.value)}
                                placeholder="Dial / Enter Case ID (e.g. CR-2026-8942)"
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all focus:outline-hidden ${
                                  themeMode === 'bright'
                                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                                    : 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-blue-500'
                                }`}
                              />
                            </div>

                            {/* Available Case ID quick pills */}
                            {cases.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                                <span className="text-[11px] text-slate-400 font-medium">
                                  Available Cases in Station:
                                </span>
                                {cases.slice(0, 5).map((c) => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCaseSearchQuery(c.id)}
                                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                                      caseSearchQuery.trim().toLowerCase() === c.id.toLowerCase()
                                        ? 'bg-blue-600 text-white border-blue-500'
                                        : themeMode === 'bright'
                                        ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                                    }`}
                                  >
                                    {c.id}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Display that particular case if found */}
                          {foundCase ? (
                            <div className="space-y-3">
                              <div
                                className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3.5 ${
                                  selectedCaseIds.includes(foundCase.id)
                                    ? themeMode === 'bright'
                                      ? 'bg-blue-50/70 border-2 border-blue-600 shadow-sm'
                                      : 'bg-yellow-500/10 border-2 border-yellow-400/90 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
                                    : themeMode === 'bright'
                                    ? 'bg-slate-50 border-slate-300'
                                    : 'bg-slate-900/80 border-slate-800'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-black text-sm text-yellow-400 px-2.5 py-0.5 rounded bg-black/40 border border-yellow-400/30">
                                      {foundCase.id}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                      {foundCase.crimeType}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                                        foundCase.status === 'Active'
                                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                      }`}
                                    >
                                      {foundCase.status}
                                    </span>
                                  </div>

                                  <span className="text-[11px] font-mono text-emerald-400 flex items-center self-start sm:self-auto">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                    Case Dossier Found
                                  </span>
                                </div>

                                <div>
                                  <h5
                                    className={`text-base font-black ${
                                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                                    }`}
                                  >
                                    {foundCase.caseName}
                                  </h5>
                                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    {foundCase.description}
                                  </p>
                                </div>

                                {/* Case Metadata Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/40">
                                  <div className="flex items-center space-x-1.5">
                                    <UserIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    <span className="text-slate-400">Recorded Victim:</span>
                                    <strong className="text-slate-200">
                                      {foundCase.victimName || 'Not recorded'}
                                    </strong>
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    <span className="text-slate-400 truncate">
                                      {foundCase.location}
                                    </span>
                                  </div>
                                </div>

                                {/* Transparent Court & Case Updates Banner */}
                                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center space-x-2.5">
                                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                                  <span className="leading-snug">
                                    Victim will be able to see live case updates, investigation timeline, and court hearing updates.
                                  </span>
                                </div>

                                {/* Checkbox for limited access about the case updation */}
                                <div
                                  id="checkbox-limited-access-box"
                                  onClick={() => toggleCaseSelection(foundCase.id)}
                                  className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                                    selectedCaseIds.includes(foundCase.id)
                                      ? themeMode === 'bright'
                                        ? 'bg-blue-100/70 border-blue-600'
                                        : 'bg-yellow-500/20 border-yellow-400'
                                      : themeMode === 'bright'
                                      ? 'bg-white border-slate-300 hover:bg-slate-100'
                                      : 'bg-black/30 border-slate-800 hover:border-slate-600'
                                  }`}
                                >
                                  <input
                                    id="checkbox-limited-access"
                                    type="checkbox"
                                    checked={selectedCaseIds.includes(foundCase.id)}
                                    onChange={() => toggleCaseSelection(foundCase.id)}
                                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer mt-0.5 shrink-0"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`text-xs sm:text-sm font-black ${
                                          selectedCaseIds.includes(foundCase.id)
                                            ? themeMode === 'bright'
                                              ? 'text-blue-950 font-black'
                                              : 'text-yellow-400'
                                            : themeMode === 'bright'
                                            ? 'text-slate-900'
                                            : 'text-slate-200'
                                        }`}
                                      >
                                        Limited access about the case updation
                                      </span>
                                      {selectedCaseIds.includes(foundCase.id) && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                          ✓ Limited Access Authorized
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                      Allow this victim account limited access to see live case updates, investigation progress, and court hearing updates for Case {foundCase.id} on their Victim Dashboard.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : dialedCaseId ? (
                            <div className="p-6 text-center border rounded-xl border-dashed border-slate-700/50 space-y-2">
                              <FolderLock className="w-8 h-8 mx-auto text-amber-500/70" />
                              <p className="text-sm font-bold text-amber-400">
                                No case found matching Case ID "{dialedCaseId}".
                              </p>
                              <p className="text-xs text-slate-400">
                                Please check the Case ID and try again, or click one of the available Case IDs above.
                              </p>
                            </div>
                          ) : (
                            <div className="p-6 text-center border rounded-xl border-dashed border-slate-700/50 space-y-2">
                              <FolderLock className="w-8 h-8 mx-auto text-slate-500/50" />
                              <p className="text-sm font-bold text-slate-400">
                                Please enter the Case ID above to display the case details and authorize limited access for case updates.
                              </p>
                            </div>
                          )}

                          {/* Selected Cases Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 text-xs">
                            <span className="font-bold text-slate-400">
                              Selected for Victim Access: <strong>{selectedCaseIds.length} case(s)</strong>
                            </span>
                            {selectedCaseIds.length > 0 && (
                              <span className="text-emerald-400 font-black">
                                ✓ Case updates & court update access authorized
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Option for Role Selection: Host, Police Officer for DSP; DSP, Host, Police Officer for other roles */}
                        <div>
                          <label className={`block text-sm font-extrabold mb-2 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                            Select Role *
                          </label>
                          <div className={`grid grid-cols-1 ${isDsp ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
                            {(isDsp ? (['Host', 'Police Officer'] as const) : (['DSP', 'Host', 'Police Officer'] as const)).map((r) => (
                              <button
                                key={r}
                                id={`btn-select-role-${r.toLowerCase().replace(/\s+/g, '-')}`}
                                type="button"
                                onClick={() => {
                                  setOfficerRole(r);
                                  if (r === 'DSP') {
                                    setBadgeId(`DSP-${Math.floor(1000 + Math.random() * 9000)}`);
                                  } else if (r === 'Host') {
                                    setBadgeId(`HOST-${Math.floor(1000 + Math.random() * 9000)}`);
                                  } else if (r === 'Police Officer') {
                                    setBadgeId(`INS-${Math.floor(1000 + Math.random() * 9000)}`);
                                  }
                                }}
                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                  officerRole === r
                                    ? themeMode === 'bright'
                                      ? 'bg-blue-50 border-2 border-blue-600 text-blue-950 font-black ring-2 ring-blue-500/30 shadow-sm'
                                      : 'bg-yellow-500/20 border-2 border-yellow-400 text-yellow-300 font-black ring-2 ring-yellow-400/60 shadow-md'
                                    : themeMode === 'bright'
                                    ? 'bg-white border border-slate-300 text-slate-900 font-bold hover:bg-slate-50'
                                    : 'bg-slate-900/80 border-blue-500 text-slate-300 hover:border-blue-400'
                                }`}
                              >
                                <div>
                                  <span className="text-base font-extrabold block">{r === 'DSP' ? 'SHO/Inspector' : r === 'Host' ? 'Investigator' : r}</span>
                                  <span className={`text-xs block mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {r === 'DSP' ? 'Station House Officer / Inspector' : r === 'Host' ? 'Investigator / Station Officer' : 'Field Police Officer'}
                                  </span>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                                  officerRole === r
                                    ? themeMode === 'bright' ? 'border-blue-600 bg-blue-600 text-white' : 'border-yellow-400 bg-yellow-400 text-black'
                                    : 'border-slate-400'
                                }`}>
                                  {officerRole === r && <span className="text-xs font-black">✓</span>}
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Taluka and District Jurisdiction Inheritance Banner */}
                          <div
                            className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              themeMode === 'bright'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-950'
                                : 'bg-slate-900/90 border-yellow-500/40 text-slate-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2.5 rounded-lg shrink-0 ${
                                  themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950 font-bold'
                                }`}
                              >
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="text-xs font-black uppercase tracking-wider">
                                  Assigned Taluka Jurisdiction Access
                                </h5>
                                <p className="text-xs opacity-90 mt-0.5">
                                  State: <strong className="font-mono font-bold">{currentUser.state || 'Maharashtra'}</strong> | District:{' '}
                                  <strong className="font-mono font-bold">{currentUser.district || 'Solapur'}</strong> | Taluka:{' '}
                                  <strong className={`font-mono font-black ${themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'}`}>
                                    {currentUser.taluka || (currentUser.talukas && currentUser.talukas[0]) || 'Karmala'}
                                  </strong>
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-[11px] font-black px-2.5 py-1 rounded-full uppercase border whitespace-nowrap self-start sm:self-center ${
                                themeMode === 'bright'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                              }`}
                            >
                              Inherited from SHO/Inspector
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                            Police Department / Branch *
                          </label>
                          <select
                            id="select-department"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            }`}
                          >
                            {DEPARTMENT_OPTIONS.map((dept) => (
                              <option key={dept} value={dept} disabled={dept === 'Select Department'}>
                                {dept}
                              </option>
                            ))}
                          </select>

                          {selectedDepartment === 'Others' && (
                            <input
                              id="input-custom-department"
                              type="text"
                              value={customDepartment}
                              onChange={(e) => setCustomDepartment(e.target.value)}
                              placeholder="Type Police Department / Firm Name"
                              className={`w-full mt-2.5 px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                                themeMode === 'bright'
                                  ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                  : 'bg-slate-900/90 text-slate-100 border-blue-500'
                              }`}
                              required
                            />
                          )}
                        </div>

                        <div>
                          <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                            Badge ID / Official Service No. *
                          </label>
                          <input
                            id="input-badge-id"
                            type="text"
                            value={badgeId}
                            onChange={(e) => setBadgeId(e.target.value)}
                            placeholder="e.g. INS-8812"
                            className={`w-full px-4 py-3 rounded-xl text-base font-mono font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                            Years of Police Service / Experience
                          </label>
                          <select
                            id="select-experience"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            }`}
                          >
                            <option value="1-3 Years">1 - 3 Years</option>
                            <option value="5 Years">5 Years</option>
                            <option value="10+ Years">10+ Years</option>
                            <option value="15+ Years (Senior)">15+ Years (Senior)</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                            Official Designation *
                          </label>
                          <select
                            id="select-designation"
                            value={selectedDesignation}
                            onChange={(e) => setSelectedDesignation(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            }`}
                          >
                            {DESIGNATION_OPTIONS.map((desig) => (
                              <option key={desig} value={desig} disabled={desig === 'Select Official Designation'}>
                                {desig}
                              </option>
                            ))}
                          </select>

                          {selectedDesignation === 'Others' && (
                            <input
                              id="input-custom-designation"
                              type="text"
                              value={customDesignation}
                              onChange={(e) => setCustomDesignation(e.target.value)}
                              placeholder="Type Official Designation"
                              className={`w-full mt-2.5 px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                                themeMode === 'bright'
                                  ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                  : 'bg-slate-900/90 text-slate-100 border-blue-500'
                              }`}
                              required
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                )}

                {/* STEP 3: Account Details & Password Security */}
                {activeStep === 3 && (
                  <div className="space-y-5">
                    <h3
                      className={`text-lg font-black flex items-center border-b pb-2.5 ${
                        themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                      }`}
                    >
                      <FileText className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 3. Account Details & Password Setup
                    </h3>

                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                        Choose Username *
                      </label>
                      <input
                        id="input-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        placeholder={selectedForm === 'Victim' ? 'e.g. victim_ramesh' : 'e.g. officer_ramesh'}
                        className={`w-full px-4 py-3 rounded-xl text-base font-mono font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500'
                        }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Set Password *
                        </label>
                        <div className="relative">
                          <input
                            id="input-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className={`w-full px-4 py-3 pr-11 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            }`}
                            required
                          />
                          <button
                            id="btn-toggle-show-password"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer ${
                              themeMode === 'bright'
                                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            id="input-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className={`w-full px-4 py-3 pr-11 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900/90 text-slate-100 border-blue-500'
                            } ${confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`}
                            required
                          />
                          <button
                            id="btn-toggle-show-confirm-password"
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer ${
                              themeMode === 'bright'
                                ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                            title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {confirmPassword && !passwordsMatch && (
                          <p className="text-xs text-red-600 font-bold mt-1.5">Passwords do not match!</p>
                        )}
                      </div>
                    </div>

                    {/* Password Strength Checklist */}
                    <div
                      className={`p-4 rounded-xl border ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-slate-900/90 border border-blue-500'
                      }`}
                    >
                      <PasswordStrengthBar password={password} themeMode={themeMode} />
                    </div>
                  </div>
                )}

                {/* STEP 4: Document & Photograph Upload */}
                {activeStep === 4 && (
                  <div className="space-y-5">
                    <h3
                      className={`text-lg font-black flex items-center border-b pb-2.5 ${
                        themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                      }`}
                    >
                      <Upload className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 4.{' '}
                      {selectedForm === 'Victim' ? 'Aadhaar Identity Proof & Photo Upload' : 'Service Credential & Document Upload'}
                    </h3>

                    <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                      {selectedForm === 'Victim'
                        ? 'Attach applicant identity proof (Aadhaar Card) and Passport-size photo directly from your device.'
                        : 'Attach applicant identity proof (Aadhaar/Passport/DL), Official Police Service Credential, and Passport Size Photo.'}
                    </p>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${selectedForm === 'Victim' ? '' : 'lg:grid-cols-3'} gap-5`}>
                      {/* Document 1: ID Proof */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          handleIdProofFile(file);
                        }}
                        className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 transition-colors ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                            : 'bg-slate-900/80 border-blue-500 hover:border-blue-400 text-slate-100'
                        }`}
                      >
                        <input
                          id="file-input-idproof"
                          type="file"
                          ref={idProofInputRef}
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          className="hidden"
                          onChange={(e) => handleIdProofFile(e.target.files?.[0])}
                        />
                        <FileText className={`w-10 h-10 ${themeMode === 'bright' ? 'text-blue-600' : 'text-yellow-400'}`} />
                        <div>
                          <p className={`text-sm font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                            {selectedForm === 'Victim' ? '1. Identity Proof (Aadhaar Card) *' : '1. Identity Proof (Aadhaar/DL) *'}
                          </p>
                          <p className={`text-xs mt-0.5 font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                            Drag & drop or select file from computer
                          </p>
                        </div>

                        {idProofName ? (
                          <div className="w-full space-y-2">
                            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-700 flex items-center justify-between text-left font-bold">
                              <div className="truncate mr-2">
                                <p className="font-mono font-bold truncate">✓ {idProofName}</p>
                                {idProofSize && <p className="text-[10px] text-emerald-800">{idProofSize}</p>}
                              </div>
                              <button
                                id="btn-remove-idproof"
                                type="button"
                                onClick={clearIdProof}
                                className="p-1 text-slate-500 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                                title="Remove document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => idProofInputRef.current?.click()}
                              className={`text-xs font-bold hover:underline cursor-pointer ${themeMode === 'bright' ? 'text-blue-700' : 'text-amber-500'}`}
                            >
                              Change File
                            </button>
                          </div>
                        ) : (
                          <button
                            id="btn-upload-idproof"
                            type="button"
                            onClick={() => idProofInputRef.current?.click()}
                            className={`px-4 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
                              themeMode === 'bright'
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300'
                                : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-blue-500'
                            }`}
                          >
                            <Paperclip className="w-4 h-4" />
                            <span>{selectedForm === 'Victim' ? 'Select Aadhaar ID' : 'Select ID Proof'}</span>
                          </button>
                        )}
                      </div>

                      {/* Document 2: Photo (Victim) or Service ID (Officer) */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          handleServiceIdFile(file);
                        }}
                        className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 transition-colors ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                            : 'bg-slate-900/80 border-blue-500 hover:border-blue-400 text-slate-100'
                        }`}
                      >
                        <input
                          id="file-input-serviceid"
                          type="file"
                          ref={serviceIdInputRef}
                          accept={selectedForm === 'Victim' ? '.png,.jpg,.jpeg,.webp' : '.pdf,.png,.jpg,.jpeg,.doc,.docx'}
                          className="hidden"
                          onChange={(e) => handleServiceIdFile(e.target.files?.[0])}
                        />
                        {selectedForm === 'Victim' ? (
                          <Camera className={`w-10 h-10 ${themeMode === 'bright' ? 'text-blue-600' : 'text-yellow-400'}`} />
                        ) : (
                          <ShieldCheck className={`w-10 h-10 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-400'}`} />
                        )}
                        <div>
                          <p className={`text-sm font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                            {selectedForm === 'Victim' ? '2. Applicant Photograph *' : '2. Official Service ID Credential *'}
                          </p>
                          <p className={`text-xs mt-0.5 font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                            {selectedForm === 'Victim' ? 'Upload passport photo (JPG, PNG)' : 'Upload police service badge/ID file'}
                          </p>
                        </div>

                        {serviceIdName ? (
                          <div className="w-full space-y-2">
                            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-700 flex items-center justify-between text-left font-bold">
                              <div className="truncate mr-2">
                                <p className="font-mono font-bold truncate">✓ {serviceIdName}</p>
                                {serviceIdSize && <p className="text-[10px] text-emerald-800">{serviceIdSize}</p>}
                              </div>
                              <button
                                id="btn-remove-serviceid"
                                type="button"
                                onClick={clearServiceId}
                                className="p-1 text-slate-500 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                                title="Remove photo/document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => serviceIdInputRef.current?.click()}
                              className={`text-xs font-bold hover:underline cursor-pointer ${themeMode === 'bright' ? 'text-blue-700' : 'text-amber-500'}`}
                            >
                              Change File
                            </button>
                          </div>
                        ) : (
                          <button
                            id="btn-upload-serviceid"
                            type="button"
                            onClick={() => serviceIdInputRef.current?.click()}
                            className={`px-4 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
                              themeMode === 'bright'
                                ? 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-blue-500'
                            }`}
                          >
                            {selectedForm === 'Victim' ? <ImageIcon className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                            <span>{selectedForm === 'Victim' ? 'Select Photograph' : 'Select Service ID'}</span>
                          </button>
                        )}
                      </div>

                      {/* Document 3: Passport Size Photo (for Officer Registration) */}
                      {selectedForm !== 'Victim' && (
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            handlePassportPhotoFile(file);
                          }}
                          className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 transition-colors ${
                            themeMode === 'bright'
                              ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                              : 'bg-slate-900/80 border-blue-500 hover:border-blue-400 text-slate-100'
                          }`}
                        >
                          <input
                            id="file-input-passportphoto"
                            type="file"
                            ref={passportPhotoInputRef}
                            accept=".png,.jpg,.jpeg,.webp"
                            className="hidden"
                            onChange={(e) => handlePassportPhotoFile(e.target.files?.[0])}
                          />
                          {passportPhotoPreview ? (
                            <img
                              src={passportPhotoPreview}
                              alt="Passport Photo Preview"
                              className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500 shadow-sm"
                            />
                          ) : (
                            <Camera className={`w-10 h-10 ${themeMode === 'bright' ? 'text-blue-600' : 'text-yellow-400'}`} />
                          )}
                          <div>
                            <p className={`text-sm font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                              3. Passport Size Photo *
                            </p>
                            <p className={`text-xs mt-0.5 font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                              Upload recent passport size photo (JPG, PNG)
                            </p>
                          </div>

                          {passportPhotoName ? (
                            <div className="w-full space-y-2">
                              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-700 flex items-center justify-between text-left font-bold">
                                <div className="truncate mr-2">
                                  <p className="font-mono font-bold truncate">✓ {passportPhotoName}</p>
                                  {passportPhotoSize && <p className="text-[10px] text-emerald-800">{passportPhotoSize}</p>}
                                </div>
                                <button
                                  id="btn-remove-passportphoto"
                                  type="button"
                                  onClick={clearPassportPhoto}
                                  className="p-1 text-slate-500 hover:text-red-600 transition-colors shrink-0 cursor-pointer"
                                  title="Remove passport photo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => passportPhotoInputRef.current?.click()}
                                className={`text-xs font-bold hover:underline cursor-pointer ${themeMode === 'bright' ? 'text-blue-700' : 'text-amber-500'}`}
                              >
                                Change Photo
                              </button>
                            </div>
                          ) : (
                            <button
                              id="btn-upload-passportphoto"
                              type="button"
                              onClick={() => passportPhotoInputRef.current?.click()}
                              className={`px-4 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
                                themeMode === 'bright'
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300'
                                  : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-blue-500'
                              }`}
                            >
                              <Paperclip className="w-4 h-4" />
                              <span>Select Passport Photo</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 5: Biometric / Security Verification */}
                {activeStep === 5 && (
                  <div className="space-y-5">
                    {selectedForm === 'Victim' ? (
                      <>
                        <h3
                          className={`text-lg font-black flex items-center border-b pb-2.5 ${
                            themeMode === 'bright' ? 'text-slate-950 border-slate-200' : 'text-white border-slate-800'
                          }`}
                        >
                          <ShieldCheck className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : 'text-cyan-400'}`} /> 5. Security CAPTCHA Verification
                        </h3>

                        <CaptchaBox onVerify={(isValid) => setCaptchaVerified(isValid)} themeMode={themeMode} />

                        {captchaVerified && (
                          <div className={`p-3.5 border rounded-xl font-bold text-sm flex items-center justify-center space-x-2.5 shadow-sm ${
                            themeMode === 'bright'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                          }`}>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span>Security CAPTCHA Verified Successfully!</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 ${
                          themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
                        }`}>
                          <h3
                            className={`text-lg font-black flex items-center ${
                              themeMode === 'bright' ? 'text-slate-950' : 'text-white'
                            }`}
                          >
                            <ScanEye className={`w-5.5 h-5.5 mr-2.5 ${themeMode === 'bright' ? 'text-blue-600' : 'text-cyan-400'}`} />
                            5. Iris Scan Biometric Capture
                          </h3>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto border ${
                            irisScanVerified
                              ? themeMode === 'bright'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : themeMode === 'bright'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-900 text-cyan-300 border-slate-700'
                          }`}>
                            {irisScanVerified ? '✓ Biometric Verified' : 'Mandatory Officer Enrolment'}
                          </span>
                        </div>

                        {/* Instructional banner */}
                        <div className={`p-3.5 rounded-xl border flex items-start space-x-3 text-xs ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300'
                        }`}>
                          <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${
                            themeMode === 'bright' ? 'text-blue-600' : 'text-cyan-400'
                          }`} />
                          <div className="space-y-0.5">
                            <p className="font-bold">
                              National Police Digital Biometric Vault
                            </p>
                            <p className={themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}>
                              Please align your eye with the biometric reticle or initiate the optical sensor scan to record cryptographic iris coordinates.
                            </p>
                          </div>
                        </div>

                        <div className="max-w-xl mx-auto py-1">
                          <IrisVerificationBox
                            onVerify={(isValid) => setIrisScanVerified(isValid)}
                            themeMode={themeMode}
                            title="Officer Iris Biometric Scan"
                            subtitle="Law Enforcement Officer Iris Enrolment"
                          />
                        </div>

                        {irisScanVerified && (
                          <div className={`p-3.5 border rounded-xl font-bold text-sm flex items-center justify-center space-x-2.5 shadow-sm ${
                            themeMode === 'bright'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                          }`}>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span>Iris Biometric Scan Enrolled & Verified with Central Police Database!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 6: Official Undertaking & Direct Authorization */}
                {activeStep === 6 && (
                  <div className="space-y-5">
                    <h3
                      className={`text-lg font-black flex items-center border-b pb-2.5 ${
                        themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                      }`}
                    >
                      <FileText className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 6. Official Undertaking & Direct Login Authorization
                    </h3>

                    <div
                      className={`p-5 rounded-2xl border text-sm font-medium space-y-3 leading-relaxed ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border border-slate-300 text-slate-900'
                          : 'bg-slate-900/90 border border-blue-500 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-emerald-600 font-black">
                        <BadgeCheck className="w-5 h-5" />
                        <span>Direct Police Station Clearance Authority:</span>
                      </div>
                      <p>
                        1. As {isDsp ? 'SHO/Inspector Command Officer' : 'Police Officer'} <strong>{currentUser.fullName}</strong> ({currentUser.badgeId}), I certify that I have verified the identity of{' '}
                        <strong>{[surname, firstName, midName].filter(Boolean).join(' ') || fullName}</strong>.
                      </p>
                      <p>
                        2. <strong>Immediate Direct Login:</strong> Upon submission, this account will be marked as{' '}
                        <strong className="text-emerald-500">Approved</strong> in the system. The registrant will NOT require further review or approvals from the Investigator or SHO/Inspector, and can log in directly using their username and password.
                      </p>
                      <p>
                        3. All actions and logs will be indexed under Station Reference ID:{' '}
                        <span className="font-mono font-bold text-amber-500">{`STA-${Date.now().toString().slice(-6)}`}</span>.
                      </p>

                      {selectedForm === 'Victim' && (
                        <div className="pt-2 border-t border-slate-700/40">
                          <p className="text-xs font-bold text-slate-300 mb-1.5">
                            Connected Case(s) for Victim Dashboard Access:
                          </p>
                          {selectedCaseIds.length > 0 ? (
                            <div className="space-y-1">
                              {selectedCaseIds.map((cId) => {
                                const caseObj = cases.find((c) => c.id === cId);
                                return (
                                  <div
                                    key={cId}
                                    className="p-1.5 rounded-lg bg-black/20 text-xs font-mono flex items-center justify-between"
                                  >
                                    <span className="font-bold text-yellow-400">{cId}</span>
                                    <span className="font-sans text-[11px] truncate max-w-[240px]">
                                      {caseObj?.caseName || 'Case Dossier'}
                                    </span>
                                    <span className="font-sans text-[10px] font-bold text-emerald-400">
                                      ✓ Limited Access Enabled
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400">
                              No specific case connected. Citizen will have access to file e-FIR complaints.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <label className="flex items-start space-x-3 cursor-pointer pt-2">
                      <input
                        id="checkbox-terms"
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="w-5 h-5 accent-blue-600 rounded border border-slate-300 mt-0.5"
                      />
                      <span className={`text-sm font-extrabold leading-snug ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                        I authorize and grant IMMEDIATE DIRECT LOGIN clearance for this {selectedForm === 'Victim' ? 'Victim' : officerRole === 'DSP' ? 'SHO/Inspector' : officerRole === 'Host' ? 'Investigator' : officerRole} account without requiring Investigator or SHO/Inspector approvals.
                      </span>
                    </label>
                  </div>
                )}

                {/* Wizard Footer Controls */}
                <div
                  className={`flex items-center justify-between pt-5 border-t ${
                    themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
                  }`}
                >
                  {activeStep > 1 ? (
                    <button
                      id="btn-prev-step"
                      type="button"
                      onClick={() => setActiveStep((prev) => prev - 1)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-colors cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {activeStep < 6 ? (
                    <button
                      id="btn-next-step"
                      type="button"
                      onClick={handleNextClick}
                      className={`px-7 py-3 rounded-xl text-sm sm:text-base font-black transition-all shadow-lg cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-blue-500/20'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                      }`}
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      id="btn-submit-registration"
                      type="submit"
                      className={`px-7 py-3 font-black rounded-xl text-sm sm:text-base shadow-xl transition-all flex items-center space-x-2 cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-blue-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>Complete Registration & Authorize Direct Login</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Recently Registered by Officer (Ledger Table) */}
        {recentRegistrations.length > 0 && (
          <div
            className={`p-5 rounded-2xl border shadow-lg space-y-3 ${
              themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BadgeCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-black">
                  Recently Enrolled by You (Direct Login Ready)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {recentRegistrations.length} account{recentRegistrations.length > 1 ? 's' : ''} active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b ${themeMode === 'bright' ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-medium">
                  {recentRegistrations.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-3 font-bold">{u.fullName}</td>
                      <td className="py-3 px-3 font-mono font-bold text-yellow-500">{u.username}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'Victim' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved (Direct Login)</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">{u.registeredAt || 'Today'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => copyToClipboard(u.username, `ledger-${u.id}`)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            copiedField === `ledger-${u.id}`
                              ? 'bg-emerald-600 text-white'
                              : themeMode === 'bright'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {copiedField === `ledger-${u.id}` ? 'Copied' : 'Copy Username'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
