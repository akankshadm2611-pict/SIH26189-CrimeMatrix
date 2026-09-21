import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { PasswordStrengthBar, checkPasswordRequirements } from './PasswordStrengthBar';
import {
  getStateNames,
  getDistrictsForState,
  getTalukasForDistrict,
} from '../data/indiaLocations';
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
  Trash2,
  Camera,
  ImageIcon,
  Copy,
  Check,
  ArrowLeft,
  UserPlus,
  BadgeCheck,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Home,
  HeartPulse,
  Key,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface StateGovtRegistrationViewProps {
  initialRole?: 'District Level' | 'Subdivision Level';
  currentUser: User;
  existingUsers: User[];
  onRegisterApprovedUser: (newUser: User) => void;
  onBackToDashboard: () => void;
  themeMode?: 'dark' | 'bright';
}

export const StateGovtRegistrationView: React.FC<StateGovtRegistrationViewProps> = ({
  initialRole = 'Subdivision Level',
  currentUser,
  existingUsers,
  onRegisterApprovedUser,
  onBackToDashboard,
  themeMode = 'dark',
}) => {
  const { t } = useLanguage();

  // Selected Role to register: 'District Level' or 'Subdivision Level'
  const [selectedRole, setSelectedRole] = useState<'District Level' | 'Subdivision Level'>(initialRole);

  // Active Multi-Step (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // STEP 1: Personal Info
  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'AB' | 'O'>('B');
  const [bloodRh, setBloodRh] = useState<'+' | '-'>('+');

  // STEP 2: Professional Info
  const [dateOfJoining, setDateOfJoining] = useState('');
  const allStates = useMemo(() => getStateNames(), []);
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const availableDistricts = useMemo(() => getDistrictsForState(selectedState), [selectedState]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
  const availableTalukas = useMemo(
    () => getTalukasForDistrict(selectedState, selectedDistrict),
    [selectedState, selectedDistrict]
  );
  // Multi-select for Talukas in District Level
  const [selectedTalukas, setSelectedTalukas] = useState<string[]>(['Pune City', 'Haveli']);
  const [talukaSearch, setTalukaSearch] = useState('');

  const [experience, setExperience] = useState<'1-4 Years' | '5+ Years' | '10+ Years' | '15+ Years'>('5+ Years');
  const [badgeId, setBadgeId] = useState('');
  const [currentPosting, setCurrentPosting] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Auto-generate realistic badge ID and posting when state/district/role changes
  useEffect(() => {
    if (!badgeId) {
      const code = selectedRole === 'District Level' ? 'SP-DL' : 'SDPO-SL';
      const rand = Math.floor(1000 + Math.random() * 9000);
      setBadgeId(`${code}-${rand}`);
    }
    if (!currentPosting) {
      if (selectedRole === 'District Level') {
        setCurrentPosting(`${selectedDistrict} District Police Headquarters, Crime & Law Directorate`);
      } else {
        setCurrentPosting(`${selectedDistrict} Subdivisional Police Office (SDPO)`);
      }
    }
  }, [selectedRole, selectedDistrict]);

  // When state changes, reset district to first available
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const dists = getDistrictsForState(newState);
    const newDist = dists[0] || 'Central District';
    setSelectedDistrict(newDist);
    const tals = getTalukasForDistrict(newState, newDist);
    setSelectedTalukas(tals.slice(0, 2));
  };

  // When district changes, reset talukas
  const handleDistrictChange = (newDist: string) => {
    setSelectedDistrict(newDist);
    const tals = getTalukasForDistrict(selectedState, newDist);
    setSelectedTalukas(tals.slice(0, 2));
  };

  // Taluka toggle
  const toggleTaluka = (tal: string) => {
    setSelectedTalukas((prev) =>
      prev.includes(tal) ? prev.filter((t) => t !== tal) : [...prev, tal]
    );
  };

  const selectAllTalukas = () => {
    setSelectedTalukas(availableTalukas);
  };

  const clearAllTalukas = () => {
    setSelectedTalukas([]);
  };

  // STEP 3: Account Details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-fill suggested username when name fields update
  useEffect(() => {
    if (!username && (firstName || surname)) {
      const prefix = selectedRole === 'District Level' ? 'dl_sp' : 'sdpo';
      const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
      const s = surname.toLowerCase().replace(/[^a-z]/g, '');
      if (f || s) {
        setUsername(`${prefix}_${f || s}`);
      }
    }
  }, [firstName, surname, selectedRole]);

  // STEP 4: Document Upload
  const [photoName, setPhotoName] = useState('passport_photo_official.jpg');
  const [photoSize, setPhotoSize] = useState('1.2 MB');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  );

  const [idProofType, setIdProofType] = useState<'Aadhaar' | 'Licence' | 'Pan Card'>('Aadhaar');
  const [idProofName, setIdProofName] = useState('aadhaar_card_official.pdf');
  const [idProofSize, setIdProofSize] = useState('2.4 MB');
  const [idProofUrl, setIdProofUrl] = useState<string>('');

  const [serviceIdName, setServiceIdName] = useState('state_service_credentials.pdf');
  const [serviceIdSize, setServiceIdSize] = useState('1.8 MB');
  const [serviceIdUrl, setServiceIdUrl] = useState<string>('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);
  const serviceIdInputRef = useRef<HTMLInputElement>(null);

  // STEP 5: Iris Scan
  const [isScanningIris, setIsScanningIris] = useState(false);
  const [irisScanProgress, setIrisScanProgress] = useState(0);
  const [irisSaved, setIrisSaved] = useState(false);
  const [irisToken, setIrisToken] = useState('');

  // STEP 6: Completion & Direct Credentials Display
  const [errorMessage, setErrorMessage] = useState('');
  const [successUser, setSuccessUser] = useState<User | null>(null);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePhotoUpload = (file?: File) => {
    if (file) {
      setPhotoName(file.name);
      setPhotoSize(formatFileSize(file.size));
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const handleIdProofUpload = (file?: File) => {
    if (file) {
      setIdProofName(file.name);
      setIdProofSize(formatFileSize(file.size));
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setIdProofUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const handleServiceIdUpload = (file?: File) => {
    if (file) {
      setServiceIdName(file.name);
      setServiceIdSize(formatFileSize(file.size));
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setServiceIdUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  // Iris Scan Trigger
  const handleStartIrisScan = () => {
    setIsScanningIris(true);
    setIrisScanProgress(0);
    setIrisSaved(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setIrisScanProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsScanningIris(false);
        setIrisSaved(true);
        const bioHash = `IRIS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setIrisToken(bioHash);
      }
    }, 280);
  };

  // Date formatter helper: DD/MM/YYYY auto-formatting as user types
  const handleFormattedDateChange = (
    rawInput: string,
    setter: (val: string) => void
  ) => {
    const digits = rawInput.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    setter(formatted);
  };

  // Validations per step
  const validateStep = (stepNum: number): boolean => {
    setErrorMessage('');

    if (stepNum === 1) {
      // Full name checks: Surname, First name, Middle each at least 2 characters
      if (surname.trim().length < 2) {
        setErrorMessage(t('Surname must contain at least 2 characters.'));
        return false;
      }
      if (firstName.trim().length < 2) {
        setErrorMessage(t('First name must contain at least 2 characters.'));
        return false;
      }
      if (middleName.trim().length < 2) {
        setErrorMessage(t('Middle name must contain at least 2 characters.'));
        return false;
      }

      // Mobile: compulsory 10 digits
      const cleanPhone = mobileNumber.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMessage(t('Mobile Number must be compulsory 10 digits (no more, no less).'));
        return false;
      }

      // Email: must contain '@gmail.com' at the last
      const cleanEmail = emailAddress.trim().toLowerCase();
      if (!cleanEmail.endsWith('@gmail.com') || cleanEmail.length <= 10) {
        setErrorMessage(t("Official Email Address must contain '@gmail.com' at the end."));
        return false;
      }

      // DOB: DD/MM/YYYY format check
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;
      if (!dateRegex.test(dob.trim())) {
        setErrorMessage(t('Date of Birth must be in DD/MM/YYYY format (e.g. 15/08/1990).'));
        return false;
      }

      // Residential address: at least 2 chars
      if (residentialAddress.trim().length < 2) {
        setErrorMessage(t('Residential Address must contain at least 2 characters.'));
        return false;
      }

      return true;
    }

    if (stepNum === 2) {
      // Date of Joining: DD/MM/YYYY format
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;
      if (!dateRegex.test(dateOfJoining.trim())) {
        setErrorMessage(t('Date of Joining must be in DD/MM/YYYY format (e.g. 01/06/2018).'));
        return false;
      }

      if (!selectedState) {
        setErrorMessage(t('Please select a State in India.'));
        return false;
      }

      if (!selectedDistrict) {
        setErrorMessage(t('Please select a District.'));
        return false;
      }

      // If Subdivision Level, at least one Taluka must be selected
      if (selectedRole === 'Subdivision Level' && selectedTalukas.length === 0) {
        setErrorMessage(t('Please select at least one Taluka to assign to this Subdivision Level Officer.'));
        return false;
      }

      if (!badgeId.trim()) {
        setErrorMessage(t('Please enter or verify the Badge ID.'));
        return false;
      }

      if (currentPosting.trim().length < 2) {
        setErrorMessage(t('Current Posting must contain at least 2 characters.'));
        return false;
      }

      const cleanEmerg = emergencyContact.replace(/\D/g, '');
      if (cleanEmerg.length !== 10) {
        setErrorMessage(t('Emergency contact number must be compulsory 10 digits.'));
        return false;
      }

      return true;
    }

    if (stepNum === 3) {
      // Username validation
      const cleanUser = username.trim().toLowerCase();
      if (!cleanUser || cleanUser.length < 3) {
        setErrorMessage(t('Username must be at least 3 characters.'));
        return false;
      }
      if (/\s/.test(cleanUser)) {
        setErrorMessage(t('Username cannot contain spaces. Use underscores instead.'));
        return false;
      }
      const isTaken = existingUsers.some(
        (u) => u.username.toLowerCase() === cleanUser
      );
      if (isTaken) {
        setErrorMessage(t('This username is already taken. Please choose another username.'));
        return false;
      }

      // Password requirements
      const reqs = checkPasswordRequirements(password);
      if (!reqs.hasMinLength || !reqs.hasUppercase || !reqs.hasNumber || !reqs.hasSpecialChar) {
        setErrorMessage(t('Password does not satisfy all 4 security criteria shown below.'));
        return false;
      }

      // Confirm password match
      if (password !== confirmPassword) {
        setErrorMessage(t('Confirm Password does not match Set Password.'));
        return false;
      }

      return true;
    }

    if (stepNum === 4) {
      if (!photoName) {
        setErrorMessage(t('Please attach Passport-size photograph.'));
        return false;
      }
      if (!idProofName) {
        setErrorMessage(t('Please upload applicant Identity Proof.'));
        return false;
      }
      if (!serviceIdName) {
        setErrorMessage(t('Please upload Official service ID.'));
        return false;
      }
      return true;
    }

    if (stepNum === 5) {
      if (!irisSaved) {
        setErrorMessage(t('Please complete and save the Biometric Iris Scan before proceeding.'));
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setActiveStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete Registration (Step 6)
  const handleCompleteRegistration = () => {
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setActiveStep(s);
        return;
      }
    }

    const constructedFullName = `${surname.trim()} ${firstName.trim()} ${middleName.trim()}`;
    const bloodGroupCombined = `${bloodType}${bloodRh}`;

    const newUser: User = {
      id: `u-${selectedRole === 'District Level' ? 'dl' : 'subdiv'}-${Date.now()}`,
      username: username.trim().toLowerCase(),
      fullName: constructedFullName,
      role: selectedRole,
      email: emailAddress.trim(),
      phone: mobileNumber.trim(),
      department:
        selectedRole === 'District Level'
          ? `District Police Command - ${selectedDistrict}, ${selectedState}`
          : `Subdivisional Police Office (SDPO) - ${selectedDistrict}, ${selectedState}`,
      badgeId: badgeId.trim(),
      designation:
        selectedRole === 'District Level'
          ? 'Superintendent of Police (District Head)'
          : 'Subdivisional Police Officer (SDPO)',
      experience,
      status: 'Approved',
      password,
      state: selectedRole === 'District Level' ? 'Maharashtra' : selectedState,
      district: selectedDistrict,
      talukas:
        selectedRole === 'Subdivision Level'
          ? selectedTalukas.length > 0
            ? selectedTalukas
            : availableTalukas.length > 0
            ? availableTalukas.slice(0, 2)
            : [`${selectedDistrict} Region`]
          : undefined,
      dateOfJoining,
      posting: currentPosting.trim(),
      emergencyContact: emergencyContact.trim(),
      bloodGroup: bloodGroupCombined,
      dob,
      gender,
      residentialAddress: residentialAddress.trim(),
      irisScanVerified: true,
      photoUrl,
      idProofType,
      idProofUrl,
      serviceIdUrl,
      avatarUrl:
        photoUrl ||
        (gender === 'Female'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
      registeredAt: new Date().toLocaleString(),
      approvedBy: `${currentUser.fullName} (${currentUser.role})`,
    };

    onRegisterApprovedUser(newUser);
    setSuccessUser(newUser);
  };

  const copyToClipboard = (text: string, field: 'username' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const stepsList = [
    { num: 1, title: t('Personal Info') },
    { num: 2, title: t('Professional Info') },
    { num: 3, title: t('Account Details') },
    { num: 4, title: t('Document Upload') },
    { num: 5, title: t('Iris Scan') },
    { num: 6, title: t('Direct Authorization') },
  ];

  const filteredTalukas = availableTalukas.filter((tal) =>
    tal.toLowerCase().includes(talukaSearch.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors ${
        themeMode === 'bright' ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0f1d] text-slate-100'
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Ribbon */}
        <div
          className={`p-5 rounded-2xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            themeMode === 'bright'
              ? 'bg-white border-slate-300'
              : 'bg-slate-900/90 border-blue-900/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <button
              id="btn-back-to-state-dashboard"
              onClick={onBackToDashboard}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                themeMode === 'bright'
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={t('Return to State Govt Dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 shadow-md">
              <UserPlus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-wide">
                  {t('State Govt Official Registration')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-600 border border-emerald-500/40">
                  {t('State Command Clearance')}
                </span>
              </div>
              <p
                className={`text-xs sm:text-sm font-semibold mt-0.5 ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {t('Authorized by State Govt Secretariat')}:{' '}
                <strong className={themeMode === 'bright' ? 'text-blue-900' : 'text-yellow-400'}>
                  {currentUser.fullName}
                </strong>{' '}
                ({currentUser.badgeId || 'State Govt'}). {t('Direct Cadre Activation')}.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1.5 ${
                themeMode === 'bright'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{t('Government Gazette Enrolled')}</span>
            </span>
          </div>
        </div>

        {/* 'New Registration' bar with Two Roles below */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border shadow-md space-y-3.5 ${
            themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2.5">
            <div className="flex items-center space-x-2">
              <Layers className={`w-5 h-5 ${themeMode === 'bright' ? 'text-amber-600' : 'text-amber-400'}`} />
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                {t('New Registration')}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {t('Select Role to register under State Cadre')}
            </span>
          </div>

          {/* Two Roles to select: 'District Level' and 'Subdivision Level' */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="role-tab-district-level"
              type="button"
              disabled={!!successUser}
              onClick={() => {
                setSelectedRole('District Level');
                setSelectedState('Maharashtra');
                setErrorMessage('');
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedRole === 'District Level'
                  ? themeMode === 'bright'
                    ? 'bg-blue-50 border-2 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-yellow-500/15 border-2 border-yellow-400 shadow-lg ring-2 ring-yellow-400/40'
                  : themeMode === 'bright'
                  ? 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Building2
                    className={`w-5 h-5 ${
                      selectedRole === 'District Level'
                        ? themeMode === 'bright'
                          ? 'text-blue-600'
                          : 'text-yellow-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-base font-black">{t('District Level')}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {t('Superintendent of Police (SP) with whole district jurisdiction')}
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                  selectedRole === 'District Level'
                    ? themeMode === 'bright'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-yellow-400 bg-yellow-400 text-black'
                    : 'border-slate-500'
                }`}
              >
                {selectedRole === 'District Level' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            <button
              id="role-tab-subdivision-level"
              type="button"
              disabled={!!successUser}
              onClick={() => {
                setSelectedRole('Subdivision Level');
                setErrorMessage('');
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                selectedRole === 'Subdivision Level'
                  ? themeMode === 'bright'
                    ? 'bg-blue-50 border-2 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-yellow-500/15 border-2 border-yellow-400 shadow-lg ring-2 ring-yellow-400/40'
                  : themeMode === 'bright'
                  ? 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      selectedRole === 'Subdivision Level'
                        ? themeMode === 'bright'
                          ? 'text-blue-600'
                          : 'text-yellow-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-base font-black">{t('Subdivision Level')}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {t('Subdivisional Police Officer (SDPO) for local jurisdictional policing')}
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                  selectedRole === 'Subdivision Level'
                    ? themeMode === 'bright'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-yellow-400 bg-yellow-400 text-black'
                    : 'border-slate-500'
                }`}
              >
                {selectedRole === 'Subdivision Level' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div
          className={`rounded-2xl border shadow-2xl overflow-hidden transition-all ${
            themeMode === 'bright'
              ? 'bg-white border-slate-300'
              : 'bg-slate-900/90 border-blue-900/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Success Screen */}
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
                  {t('Registration Completed & Direct Login Granted!')}
                </h2>
                <p
                  className={`max-w-xl mx-auto text-sm sm:text-base font-semibold mt-2 leading-relaxed ${
                    themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {t('The new State account for')}{' '}
                  <strong className="text-emerald-500 font-black">{successUser.fullName}</strong> {t('as a')}{' '}
                  <strong className={themeMode === 'bright' ? 'text-blue-900 font-black' : 'text-yellow-400'}>
                    {successUser.role}
                  </strong>{' '}
                  {t('has been immediately approved and saved in the system.')}
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
                      {t('Instant Login Credentials')}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-600 border border-emerald-500/40">
                    STATUS: APPROVED
                  </span>
                </div>

                <div className="space-y-3 font-mono text-sm">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/10 border border-black/10">
                    <div>
                      <span className="block text-[11px] font-sans font-bold text-slate-400">{t('Username')}</span>
                      <span className="font-bold text-base">{successUser.username}</span>
                    </div>
                    <button
                      id="btn-copy-username"
                      type="button"
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
                      <span>{copiedField === 'username' ? t('Copied') : t('Copy')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/10 border border-black/10">
                    <div>
                      <span className="block text-[11px] font-sans font-bold text-slate-400">{t('Password')}</span>
                      <span className="font-bold text-base">{successUser.password || '••••••••'}</span>
                    </div>
                    {successUser.password && (
                      <button
                        id="btn-copy-password"
                        type="button"
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
                        <span>{copiedField === 'password' ? t('Copied') : t('Copy')}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-sans">
                    <div>
                      <span className="text-slate-400 font-semibold">{t('Assigned Role')}:</span>
                      <p className="font-bold text-sm text-yellow-500">{successUser.role}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">{t('Badge / ID')}:</span>
                      <p className="font-bold font-mono text-sm">{successUser.badgeId}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 text-xs font-sans space-y-1 text-slate-400">
                    <p>
                      <strong>{t('Jurisdiction')}:</strong> {successUser.district}, {successUser.state}
                    </p>
                    {successUser.talukas && successUser.talukas.length > 0 && (
                      <p>
                        <strong>{t('Assigned Talukas')}:</strong> {successUser.talukas.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  id="btn-register-another"
                  type="button"
                  onClick={() => {
                    setSuccessUser(null);
                    setActiveStep(1);
                    setSurname('');
                    setFirstName('');
                    setMiddleName('');
                    setMobileNumber('');
                    setEmailAddress('');
                    setDob('');
                    setResidentialAddress('');
                    setDateOfJoining('');
                    setBadgeId('');
                    setCurrentPosting('');
                    setEmergencyContact('');
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
                    setIrisSaved(false);
                  }}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer"
                >
                  {t('Register Another Official')}
                </button>

                <button
                  id="btn-return-state-dash"
                  type="button"
                  onClick={onBackToDashboard}
                  className={`px-6 py-3 rounded-xl border font-black text-sm transition-all cursor-pointer ${
                    themeMode === 'bright'
                      ? 'border-slate-300 hover:bg-slate-100 text-slate-800'
                      : 'border-slate-700 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  {t('Back to State Govt Dashboard')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stepper Header (1 to 6) - Same as image.png */}
              <div
                className={`p-4 sm:p-6 border-b transition-colors overflow-x-auto ${
                  themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between min-w-[620px] gap-2">
                  {stepsList.map((step) => {
                    const isActive = activeStep === step.num;
                    const isCompleted = activeStep > step.num;

                    return (
                      <button
                        key={step.num}
                        type="button"
                        onClick={() => {
                          if (step.num < activeStep) {
                            setActiveStep(step.num);
                          }
                        }}
                        disabled={step.num > activeStep}
                        className={`flex items-center space-x-2 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? themeMode === 'bright'
                              ? 'bg-white shadow-md border border-blue-200 ring-2 ring-blue-500/20'
                              : 'bg-slate-900 shadow-lg border border-yellow-500/40 ring-1 ring-yellow-400/40'
                            : isCompleted
                            ? 'opacity-90 hover:opacity-100'
                            : 'opacity-40 cursor-not-allowed'
                        }`}
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
                              ? 'bg-slate-200 text-slate-700 font-extrabold'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                        </span>
                        <span
                          className={`text-xs font-extrabold whitespace-nowrap ${
                            isActive
                              ? themeMode === 'bright'
                                ? 'text-blue-950 font-black'
                                : 'text-yellow-400 font-bold'
                              : isCompleted
                              ? 'text-emerald-500 font-bold'
                              : themeMode === 'bright'
                              ? 'text-slate-600'
                              : 'text-slate-400'
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
                  className="mx-4 sm:mx-8 mt-5 p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-500 text-xs sm:text-sm font-bold flex items-center shadow-lg"
                >
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Content */}
              <div className="p-4 sm:p-8 space-y-6">
                {/* STEP 1: Personal Info */}
                {activeStep === 1 && (
                  <div className="space-y-6">
                    <div className="border-b pb-3 flex items-center justify-between">
                      <h3
                        className={`text-lg font-black flex items-center ${
                          themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                        }`}
                      >
                        <UserCheck className="w-5 h-5 mr-2 text-amber-500" />
                        1. {t('Personal Info')} ({selectedRole})
                      </h3>
                      <span className="text-xs font-bold text-slate-400">
                        {t('Fields marked with * are compulsory')}
                      </span>
                    </div>

                    {/* Full Name divided into Surname, First Name, Middle */}
                    <div className="space-y-2">
                      <label
                        className={`block text-xs font-extrabold uppercase tracking-wider ${
                          themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                        }`}
                      >
                        {t('Full Name')} * ({t('Divide into Surname, First name, Middle')})
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <input
                            id="input-surname"
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            placeholder={t('Surname (Min 2 chars)')}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <input
                            id="input-firstname"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={t('First name (Min 2 chars)')}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <input
                            id="input-middle"
                            type="text"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                            placeholder={t('Middle name (Min 2 chars)')}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile Number & Official Email Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Mobile Number')} * ({t('Compulsory 10 digits')})
                        </label>
                        <div className="relative">
                          <Phone
                            className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                              themeMode === 'bright' ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          />
                          <input
                            id="input-mobile-number"
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) =>
                              setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                            }
                            placeholder="e.g. 9822012345"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Official Email Address')} * ({t("must contain '@gmail.com' at the last")})
                        </label>
                        <div className="relative">
                          <Mail
                            className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                              themeMode === 'bright' ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          />
                          <input
                            id="input-official-email"
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="e.g. officer.rathore@gmail.com"
                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth & Gender */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Date of Birth')} * ({t('Format DD/MM/YYYY')})
                        </label>
                        <div className="relative">
                          <Calendar
                            className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                              themeMode === 'bright' ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          />
                          <input
                            id="input-dob"
                            type="text"
                            value={dob}
                            onChange={(e) => handleFormattedDateChange(e.target.value, setDob)}
                            placeholder="DD/MM/YYYY (e.g. 15/08/1990)"
                            maxLength={10}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Gender')} *
                        </label>
                        <select
                          id="select-gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                          }`}
                        >
                          <option value="Male">{t('Male')}</option>
                          <option value="Female">{t('Female')}</option>
                          <option value="Other">{t('Other')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Residential Address */}
                    <div>
                      <label
                        className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                          themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                        }`}
                      >
                        {t('Residential Address')} * ({t('At least 2 characters')})
                      </label>
                      <div className="relative">
                        <Home
                          className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                            themeMode === 'bright' ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        />
                        <textarea
                          id="input-residential-address"
                          rows={2}
                          value={residentialAddress}
                          onChange={(e) => setResidentialAddress(e.target.value)}
                          placeholder={t('Enter official residential quarters or address')}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Blood Group: Type (A, B, AB, O) + (+/-) */}
                    <div>
                      <label
                        className={`block text-xs font-extrabold uppercase tracking-wider mb-2 ${
                          themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                        }`}
                      >
                        <HeartPulse className="w-4 h-4 inline-block mr-1 text-red-500" />
                        {t('Blood Group')} * ({t('Select Type and Rh Factor')})
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="block text-[11px] font-bold text-slate-400 mb-1.5">
                            {t('Blood Type (A, B, AB, O)')}
                          </span>
                          <div className="grid grid-cols-4 gap-2">
                            {(['A', 'B', 'AB', 'O'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setBloodType(type)}
                                className={`py-2.5 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                                  bloodType === type
                                    ? themeMode === 'bright'
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                      : 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-md font-black'
                                    : themeMode === 'bright'
                                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="block text-[11px] font-bold text-slate-400 mb-1.5">
                            {t('Rh Factor (+ or -)')}
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {(['+', '-'] as const).map((rh) => (
                              <button
                                key={rh}
                                type="button"
                                onClick={() => setBloodRh(rh)}
                                className={`py-2.5 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                                  bloodRh === rh
                                    ? themeMode === 'bright'
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                      : 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-md font-black'
                                    : themeMode === 'bright'
                                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                                }`}
                              >
                                {rh === '+' ? '+ (Positive)' : '- (Negative)'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 font-bold">
                        {t('Selected Blood Group')}:{' '}
                        <strong className="text-red-500 font-black text-sm">
                          {bloodType}
                          {bloodRh}
                        </strong>
                      </p>
                    </div>

                    {/* Step 1 Next Button */}
                    <div className="pt-4 flex justify-end border-t border-slate-700/40">
                      <button
                        id="btn-step1-next"
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                      >
                        <span>{t('Next Step')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Professional Info */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3
                        className={`text-lg font-black flex items-center ${
                          themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                        }`}
                      >
                        <Building2 className="w-5 h-5 mr-2 text-amber-500" />
                        2. {t('Professional Info')}
                      </h3>
                      {/* Role badge */}
                      <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        {selectedRole === 'District Level' ? t('District Level') : t('Subdivision Level')}
                      </span>
                    </div>

                    {/* Date of Joining */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Date of Joining')} * ({t('Format DD/MM/YYYY')})
                        </label>
                        <div className="relative">
                          <Calendar
                            className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                              themeMode === 'bright' ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          />
                          <input
                            id="input-date-of-joining"
                            type="text"
                            value={dateOfJoining}
                            onChange={(e) => handleFormattedDateChange(e.target.value, setDateOfJoining)}
                            placeholder="DD/MM/YYYY (e.g. 01/06/2018)"
                            maxLength={10}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      {/* Years of Experience */}
                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Year of Experience')} *
                        </label>
                        <select
                          id="select-experience"
                          value={experience}
                          onChange={(e) =>
                            setExperience(
                              e.target.value as '1-4 Years' | '5+ Years' | '10+ Years' | '15+ Years'
                            )
                          }
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                          }`}
                        >
                          <option value="1-4 Years">1-4 Years</option>
                          <option value="5+ Years">5+ Years</option>
                          <option value="10+ Years">10+ Years</option>
                          <option value="15+ Years">15+ Years</option>
                        </select>
                      </div>
                    </div>

                    {/* State (Maharashtra for District Level / All States for Subdivision Level) & District (36 districts for Maharashtra) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('State (India)')} * {selectedRole === 'District Level' ? '(Maharashtra)' : `(${t('All 28 States & 8 UTs')})`}
                        </label>
                        <div className="relative">
                          <MapPin
                            className={`w-4 h-4 absolute left-3.5 top-3.5 ${
                              themeMode === 'bright' ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          />
                          <select
                            id="select-state"
                            value={selectedRole === 'District Level' ? 'Maharashtra' : selectedState}
                            disabled={selectedRole === 'District Level'}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                              selectedRole === 'District Level'
                                ? themeMode === 'bright'
                                  ? 'bg-slate-100 text-slate-700 border-slate-300 cursor-not-allowed'
                                  : 'bg-slate-800/80 text-slate-300 border-slate-700 cursor-not-allowed'
                                : themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                          >
                            {selectedRole === 'District Level' ? (
                              <option value="Maharashtra">Maharashtra</option>
                            ) : (
                              allStates.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('District')} * {selectedRole === 'District Level' ? '(Maharashtra - 36 Districts)' : `(${selectedState})`}
                        </label>
                        <select
                          id="select-district"
                          value={selectedDistrict}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                          }`}
                        >
                          {(selectedRole === 'District Level' ? getDistrictsForState('Maharashtra') : availableDistricts).map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Taluka Multi-select ONLY for Subdivision Level (not for District Level) */}
                    {selectedRole === 'Subdivision Level' && (
                      <div
                        className={`p-4 rounded-xl border space-y-3 ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-slate-900/90 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <label
                              className={`block text-xs font-extrabold uppercase tracking-wider ${
                                themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                              }`}
                            >
                              {t('Talukas')} * ({t('Select talukas under Subdivision jurisdiction')})
                            </label>
                            <span className="text-[11px] text-slate-400">
                              {`${t('Assign sub-divisional police talukas for')} ${selectedDistrict}`}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={selectAllTalukas}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 cursor-pointer"
                            >
                              {t('Select All')}
                            </button>
                            <button
                              type="button"
                              onClick={clearAllTalukas}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-700/40 text-slate-300 border border-slate-600 hover:bg-slate-700 cursor-pointer"
                            >
                              {t('Clear')}
                            </button>
                          </div>
                        </div>

                        {/* Filter box if talukas > 8 */}
                        {availableTalukas.length > 8 && (
                          <input
                            type="text"
                            value={talukaSearch}
                            onChange={(e) => setTalukaSearch(e.target.value)}
                            placeholder={t('Search taluka...')}
                            className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300'
                                : 'bg-slate-950 text-slate-200 border-slate-800'
                            }`}
                          />
                        )}

                        {/* Taluka Checkboxes grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                          {filteredTalukas.map((tal) => {
                            const isSelected = selectedTalukas.includes(tal);
                            return (
                              <button
                                key={tal}
                                type="button"
                                onClick={() => toggleTaluka(tal)}
                                className={`p-2 rounded-lg text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? themeMode === 'bright'
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                      : 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-sm font-black'
                                    : themeMode === 'bright'
                                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                                }`}
                              >
                                <span className="truncate">{tal}</span>
                                <span className="ml-1.5 shrink-0">
                                  {isSelected ? '✓' : '+'}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="text-xs font-bold pt-1 text-slate-400 flex items-center justify-between">
                          <span>
                            {t('Assigned')}:{' '}
                            <strong className="text-emerald-500">{selectedTalukas.length} taluka(s)</strong>
                          </span>
                          {selectedTalukas.length > 0 && (
                            <span className="text-[11px] text-emerald-400">
                              ✓ {selectedTalukas.slice(0, 3).join(', ')}
                              {selectedTalukas.length > 3 && ` +${selectedTalukas.length - 3} more`}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Badge ID, Current Posting, Emergency Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Badge ID')} *
                        </label>
                        <input
                          id="input-badge-id"
                          type="text"
                          value={badgeId}
                          onChange={(e) => setBadgeId(e.target.value)}
                          placeholder="e.g. DL-SP-4821"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-mono font-bold transition-all border focus:outline-hidden ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Current Posting (Text)')} *
                        </label>
                        <input
                          id="input-current-posting"
                          type="text"
                          value={currentPosting}
                          onChange={(e) => setCurrentPosting(e.target.value)}
                          placeholder="e.g. District Police Headquarters"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Emergency Contact Number')} *
                        </label>
                        <input
                          id="input-emergency-contact"
                          type="tel"
                          value={emergencyContact}
                          onChange={(e) =>
                            setEmergencyContact(e.target.value.replace(/\D/g, '').slice(0, 10))
                          }
                          placeholder="10 Digits (e.g. 9822099999)"
                          className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border focus:outline-hidden ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    {/* Step 2 Navigation */}
                    <div className="pt-4 flex items-center justify-between border-t border-slate-700/40">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                          themeMode === 'bright'
                            ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t('Back')}
                      </button>
                      <button
                        id="btn-step2-next"
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                      >
                        <span>{t('Next Step')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Account Details (Same as image.png) */}
                {activeStep === 3 && (
                  <div className="space-y-6">
                    <div className="border-b pb-3 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-amber-500" />
                      <h3
                        className={`text-lg font-black ${
                          themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                        }`}
                      >
                        3. {t('Account Details & Password Setup')}
                      </h3>
                    </div>

                    {/* Choose Username */}
                    <div>
                      <label
                        className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                          themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                        }`}
                      >
                        {t('Choose Username')} *
                      </label>
                      <input
                        id="input-username"
                        type="text"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))
                        }
                        placeholder={
                          selectedRole === 'District Level'
                            ? 'e.g. dl_sp_rathore'
                            : 'e.g. sdpo_shinde'
                        }
                        className={`w-full px-4 py-3 rounded-xl text-base font-mono font-bold transition-all border focus:outline-hidden ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                            : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                        }`}
                        required
                      />
                    </div>

                    {/* Set Password & Confirm Password (2 columns with eye toggle) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Set Password')} *
                        </label>
                        <div className="relative">
                          <input
                            id="input-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className={`w-full px-4 py-3 pr-11 rounded-xl text-base font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            }`}
                            required
                          />
                          <button
                            id="btn-toggle-password"
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            title={showPassword ? t('Hide password') : t('Show password')}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
                            themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'
                          }`}
                        >
                          {t('Confirm Password')} *
                        </label>
                        <div className="relative">
                          <input
                            id="input-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className={`w-full px-4 py-3 pr-11 rounded-xl text-base font-bold transition-all border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                                : 'bg-slate-900 text-slate-100 border-slate-700 focus:border-yellow-400'
                            } ${
                              confirmPassword && password !== confirmPassword ? 'border-red-500 ring-1 ring-red-500' : ''
                            }`}
                            required
                          />
                          <button
                            id="btn-toggle-confirm-password"
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            title={showConfirmPassword ? t('Hide password') : t('Show password')}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-xs text-red-500 font-bold mt-1.5">
                            {t('Passwords do not match!')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Password Strength Checklist & Bar Box */}
                    <div
                      className={`p-4 rounded-xl border ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-slate-900/90 border-slate-800'
                      }`}
                    >
                      <PasswordStrengthBar password={password} themeMode={themeMode} />
                    </div>

                    {/* Step 3 Navigation */}
                    <div className="pt-4 flex items-center justify-between border-t border-slate-700/40">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                          themeMode === 'bright'
                            ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t('Back')}
                      </button>
                      <button
                        id="btn-step3-next"
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                      >
                        <span>{t('Next Step')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Document Upload */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    <div className="border-b pb-3 flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-amber-500" />
                      <h3
                        className={`text-lg font-black ${
                          themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                        }`}
                      >
                        4. {t('Document Upload')}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400">
                      {t('Please upload applicant Photo, Identity Proof, and Official Service ID credentials.')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* 1. Photo */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          handlePhotoUpload(file);
                        }}
                        className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 transition-colors ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                            : 'bg-slate-900/80 border-slate-700 hover:border-yellow-400 text-slate-100'
                        }`}
                      >
                        <input
                          id="file-input-photo"
                          type="file"
                          ref={photoInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                        />
                        {photoUrl ? (
                          <div className="relative group">
                            <img
                              src={photoUrl}
                              alt="Passport Preview"
                              className="w-20 h-24 object-cover rounded-lg border-2 border-amber-500 shadow-md mx-auto"
                            />
                            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-500">
                              ✓ {photoName}
                            </span>
                          </div>
                        ) : (
                          <Camera className="w-10 h-10 text-amber-500" />
                        )}
                        <div>
                          <p className="text-sm font-extrabold">{t('1. Photo (Passport Size)')} *</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t('Drag & drop or select image')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
                        >
                          {photoUrl ? t('Change Photo') : t('Browse Photo')}
                        </button>
                      </div>

                      {/* 2. Identity Proof with Dropdown ('Aadhaar', 'Licence', 'Pan Card') */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          handleIdProofUpload(file);
                        }}
                        className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-between text-center space-y-3 transition-colors ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                            : 'bg-slate-900/80 border-slate-700 hover:border-yellow-400 text-slate-100'
                        }`}
                      >
                        <input
                          id="file-input-idproof"
                          type="file"
                          ref={idProofInputRef}
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleIdProofUpload(e.target.files?.[0])}
                        />

                        <div className="w-full">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            {t('Identity Proof Type')}
                          </label>
                          <select
                            id="select-idproof-type"
                            value={idProofType}
                            onChange={(e) =>
                              setIdProofType(e.target.value as 'Aadhaar' | 'Licence' | 'Pan Card')
                            }
                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-hidden ${
                              themeMode === 'bright'
                                ? 'bg-white text-slate-900 border-slate-300'
                                : 'bg-slate-950 text-slate-200 border-slate-700'
                            }`}
                          >
                            <option value="Aadhaar">Aadhaar</option>
                            <option value="Licence">Licence</option>
                            <option value="Pan Card">Pan Card</option>
                          </select>
                        </div>

                        <FileText className="w-9 h-9 text-blue-500" />
                        <div>
                          <p className="text-sm font-extrabold">
                            2. {idProofType} {t('Proof')} *
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                            {idProofName || t('Upload official card (PDF/JPG)')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => idProofInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 hover:bg-blue-500/30 cursor-pointer"
                        >
                          {idProofName ? t('Replace File') : t('Select Document')}
                        </button>
                      </div>

                      {/* 3. Official Service ID */}
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          handleServiceIdUpload(file);
                        }}
                        className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 transition-colors ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                            : 'bg-slate-900/80 border-slate-700 hover:border-yellow-400 text-slate-100'
                        }`}
                      >
                        <input
                          id="file-input-serviceid"
                          type="file"
                          ref={serviceIdInputRef}
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleServiceIdUpload(e.target.files?.[0])}
                        />
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        <div>
                          <p className="text-sm font-extrabold">{t('3. Official Service ID')} *</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                            {serviceIdName || t('Government ID card / Order')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => serviceIdInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer"
                        >
                          {serviceIdName ? t('Replace ID') : t('Select Service ID')}
                        </button>
                      </div>
                    </div>

                    {/* Step 4 Navigation */}
                    <div className="pt-4 flex items-center justify-between border-t border-slate-700/40">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                          themeMode === 'bright'
                            ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t('Back')}
                      </button>
                      <button
                        id="btn-step4-next"
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                      >
                        <span>{t('Next Step')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: Iris Scan */}
                {activeStep === 5 && (
                  <div className="space-y-6">
                    <div className="border-b pb-3 flex items-center space-x-2">
                      <ScanEye className="w-5 h-5 text-amber-500" />
                      <h3
                        className={`text-lg font-black ${
                          themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                        }`}
                      >
                        5. {t('Iris Scan (Biometric Verification & Saving)')}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400">
                      {t('Capture and register high-resolution ocular biometric features to enable secure biometric single-sign-on.')}
                    </p>

                    {/* Biometric Scanning Box */}
                    <div
                      className={`p-6 sm:p-8 rounded-2xl border text-center space-y-5 max-w-lg mx-auto ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-300'
                          : 'bg-slate-950 border-slate-800 shadow-xl'
                      }`}
                    >
                      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                        <div
                          className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
                            isScanningIris
                              ? 'border-amber-400 animate-spin'
                              : irisSaved
                              ? 'border-emerald-500'
                              : 'border-slate-700'
                          }`}
                        />
                        <div
                          className={`w-28 h-28 rounded-full flex items-center justify-center transition-colors ${
                            irisSaved
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : isScanningIris
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <ScanEye className="w-14 h-14" />
                        </div>
                      </div>

                      {/* Progress Bar when scanning */}
                      {isScanningIris && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                            <span>{t('Scanning Iris Patterns...')}</span>
                            <span>{irisScanProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 transition-all duration-200"
                              style={{ width: `${irisScanProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Saved status */}
                      {irisSaved && (
                        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold space-y-1">
                          <div className="flex items-center justify-center space-x-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t('Iris Scan Successfully Captured & Saved!')}</span>
                          </div>
                          <p className="font-mono text-[11px] opacity-80">Token: {irisToken}</p>
                        </div>
                      )}

                      <div>
                        <button
                          id="btn-trigger-iris-scan"
                          type="button"
                          onClick={handleStartIrisScan}
                          disabled={isScanningIris}
                          className={`px-6 py-3 rounded-xl font-black text-sm transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2 mx-auto ${
                            irisSaved
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                        >
                          <ScanEye className="w-4 h-4" />
                          <span>
                            {isScanningIris
                              ? t('Scanning...')
                              : irisSaved
                              ? t('Re-scan Iris')
                              : t('Initiate Iris Scan & Save')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Step 5 Navigation */}
                    <div className="pt-4 flex items-center justify-between border-t border-slate-700/40">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                          themeMode === 'bright'
                            ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t('Back')}
                      </button>
                      <button
                        id="btn-step5-next"
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
                      >
                        <span>{t('Next Step')}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: Verify all entered details and 'Registration Complete' button */}
                {activeStep === 6 && (
                  <div className="space-y-6">
                    <div className="border-b pb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <h3
                          className={`text-lg font-black ${
                            themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                          }`}
                        >
                          6. {t('Verify All Entered Details')}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {t('Review carefully before completing')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* 1. Personal Details Card */}
                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-amber-500 border-b pb-1">
                          1. {t('Personal Information')}
                        </h4>
                        <p>
                          <strong>{t('Full Name')}:</strong> {surname} {firstName} {middleName}
                        </p>
                        <p>
                          <strong>{t('Mobile')}:</strong> {mobileNumber}
                        </p>
                        <p>
                          <strong>{t('Email')}:</strong> {emailAddress}
                        </p>
                        <p>
                          <strong>{t('Date of Birth')}:</strong> {dob}
                        </p>
                        <p>
                          <strong>{t('Gender')}:</strong> {gender}
                        </p>
                        <p>
                          <strong>{t('Address')}:</strong> {residentialAddress}
                        </p>
                        <p>
                          <strong>{t('Blood Group')}:</strong>{' '}
                          <span className="text-red-500 font-black">
                            {bloodType}
                            {bloodRh}
                          </span>
                        </p>
                      </div>

                      {/* 2. Professional Details Card */}
                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-amber-500 border-b pb-1">
                          2. {t('Professional Information')}
                        </h4>
                        <p>
                          <strong>{t('Assigned Cadre')}:</strong>{' '}
                          <span className="text-amber-400 font-black">{selectedRole}</span>
                        </p>
                        <p>
                          <strong>{t('Date of Joining')}:</strong> {dateOfJoining}
                        </p>
                        <p>
                          <strong>{t('State')}:</strong> {selectedState}
                        </p>
                        <p>
                          <strong>{t('District')}:</strong> {selectedDistrict}
                        </p>
                        {selectedRole === 'Subdivision Level' && selectedTalukas.length > 0 && (
                          <p>
                            <strong>{t('Assigned Talukas')}:</strong>{' '}
                            {selectedTalukas.join(', ')}
                          </p>
                        )}
                        <p>
                          <strong>{t('Experience')}:</strong> {experience}
                        </p>
                        <p>
                          <strong>{t('Badge ID')}:</strong>{' '}
                          <span className="font-mono">{badgeId}</span>
                        </p>
                        <p>
                          <strong>{t('Posting')}:</strong> {currentPosting}
                        </p>
                        <p>
                          <strong>{t('Emergency Contact')}:</strong> {emergencyContact}
                        </p>
                      </div>

                      {/* 3. Account Details Card */}
                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-amber-500 border-b pb-1">
                          3. {t('Account & Access')}
                        </h4>
                        <p>
                          <strong>{t('Username')}:</strong>{' '}
                          <span className="font-mono text-emerald-400 font-bold">{username}</span>
                        </p>
                        <p>
                          <strong>{t('Security Password')}:</strong>{' '}
                          <span className="font-mono">•••••••••••• (Encrypted)</span>
                        </p>
                        <p className="text-emerald-500 font-bold">
                          ✓ {t('All 4 password strength criteria verified')}
                        </p>
                      </div>

                      {/* 4. Documents & Iris Scan Card */}
                      <div
                        className={`p-4 rounded-xl border space-y-2 ${
                          themeMode === 'bright'
                            ? 'bg-slate-50 border-slate-300'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-amber-500 border-b pb-1">
                          4 & 5. {t('Documents & Biometrics')}
                        </h4>
                        <p>
                          <strong>{t('Photograph')}:</strong> {photoName} ({photoSize})
                        </p>
                        <p>
                          <strong>{idProofType}:</strong> {idProofName} ({idProofSize})
                        </p>
                        <p>
                          <strong>{t('Service ID')}:</strong> {serviceIdName} ({serviceIdSize})
                        </p>
                        <p className="text-emerald-500 font-bold">
                          ✓ {t('Iris Biometric Scan Verified & Saved')} ({irisToken})
                        </p>
                      </div>
                    </div>

                    {/* Registration Complete Button */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-700/40">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                          themeMode === 'bright'
                            ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                            : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t('Back')}
                      </button>

                      <button
                        id="btn-registration-complete"
                        type="button"
                        onClick={handleCompleteRegistration}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <BadgeCheck className="w-5 h-5" />
                        <span>{t('Registration Complete')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
