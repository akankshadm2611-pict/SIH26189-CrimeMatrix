import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Upload,
  FileText,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  Info,
  Check,
  AlertCircle,
  Bot,
  UserCheck,
  Home,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

import { INDIAN_STATES_AND_CITIES } from '../data/indianLocations';
import { ALL_INDIAN_STATES, getTalukasForDistrict, getDistrictsForState } from '../data/indiaLocations';
import { AiCaseCategoryAssistant } from './AiCaseCategoryAssistant';

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
  status: 'Submitted' | 'Under Review' | 'FIR Registered';
}

interface ComplaintRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (complaint: ComplaintData) => void;
  themeMode?: 'dark' | 'bright';
  isTransparent?: boolean;
  isFullPage?: boolean;
}

const ONLINE_CATEGORIES = [
  'Online fraud',
  'Lost/stolen devices',
  'Theft',
  'Burglary',
  'Identity theft',
  'Hacking',
  'Online harassment',
  'Extortion',
  'Financial fraud',
  'Property damage',
  'Missing person',
  'Physical assault',
  'Threats',
  'Domestic violence',
  'Cybercrime',
  'Ragging / Campus harassment',
];

const EMERGENCY_CATEGORIES = [
  '[Emergency] Murder',
  '[Emergency] Kidnapping in progress',
  '[Emergency] Active violent assault',
  '[Emergency] Immediate threat to life',
  '[Emergency] Armed robbery',
];

export const ComplaintRegistrationModal: React.FC<ComplaintRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
  themeMode = 'bright',
}) => {
  const isBright = themeMode === 'bright';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Step: 1 = Personal Info, 2 = Incident Details, 3 = Evidence Upload, 4 = Submitted
  const [activeStep, setActiveStep] = useState<number>(1);

  // STEP 1: Personal Information
  const [surname, setSurname] = useState('');
  const [midName, setMidName] = useState('');
  const [firstName, setFirstName] = useState('');

  // Mobile & OTP
  const [mobile, setMobile] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Email
  const [email, setEmail] = useState('');

  // Date of Birth / Complainant Date & Gender
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');

  // Address
  const [residentialAddress, setResidentialAddress] = useState('');

  // State & City/District, Taluka & Location Area
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target as Node)) {
        setIsStateDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Legal Declaration
  const [isLegalDeclarationAccepted, setIsLegalDeclarationAccepted] = useState(false);

  // STEP 2: Incident Details
  const [selectedCategory, setSelectedCategory] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [estimatedLoss, setEstimatedLoss] = useState('');
  const [suspectInfo, setSuspectInfo] = useState('');
  const [witnessInfo, setWitnessInfo] = useState('');

  // AI Case Category Assistant
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const handleConfirmAiCategory = (
    category: string,
    incidentStatement: string,
    _aiSummary: string
  ) => {
    setSelectedCategory(category);
    setStepError('');
    if (!incidentDescription.trim() && incidentStatement.trim()) {
      setIncidentDescription(incidentStatement);
    }
  };

  // STEP 3: Evidence Upload
  const [attachedFiles, setAttachedFiles] = useState<
    { name: string; size: string; type: string; url?: string }[]
  >([]);

  // Feedback & State
  const [stepError, setStepError] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState<ComplaintData | null>(null);

  if (!isOpen) return null;

  // Derive cities for the selected state
  const matchedStateData = INDIAN_STATES_AND_CITIES.find(
    (s) => s.state.toLowerCase() === selectedState.trim().toLowerCase()
  );
  const availableCities = matchedStateData ? matchedStateData.cities : getDistrictsForState(selectedState);

  // Derive talukas strictly for the selected state & district
  const availableTalukas = (() => {
    if (!selectedState || !selectedCity) return [];
    return getTalukasForDistrict(selectedState, selectedCity);
  })();

  // Sync composed location string
  const updateComposedLocation = (newLocArea: string, newTaluka: string, newCity: string, newState: string) => {
    const parts = [newLocArea.trim(), newTaluka.trim(), newCity.trim(), newState.trim()].filter(Boolean);
    if (parts.length > 0) {
      setIncidentLocation(parts.join(', '));
    }
  };

  // State input handler - letters and spaces only
  const handleStateChange = (val: string) => {
    const lettersOnly = val.replace(/[^a-zA-Z\s]/g, '');
    setSelectedState(lettersOnly);
    setSelectedCity('');
    setSelectedTaluka('');
    setLocationArea('');
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedTaluka('');
    setLocationArea('');
    updateComposedLocation('', '', city, selectedState);
  };

  const handleTalukaChange = (taluka: string) => {
    setSelectedTaluka(taluka);
    updateComposedLocation(locationArea, taluka, selectedCity, selectedState);
  };

  const handleLocationAreaChange = (val: string) => {
    setLocationArea(val);
    updateComposedLocation(val, selectedTaluka, selectedCity, selectedState);
  };

  const handleFocusLocationInput = () => {
    if (locationInputRef.current) {
      locationInputRef.current.focus();
      locationInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Check if selected category is emergency
  const isEmergencySelected = EMERGENCY_CATEGORIES.includes(selectedCategory);

  // Format File Size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Mobile number input handler - strictly numbers and max 10 digits
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(rawVal);
    // Reset OTP verification if user changes phone number
    if (isOtpVerified) {
      setIsOtpVerified(false);
      setIsOtpSent(false);
      setGeneratedOtp(null);
      setEnteredOtp('');
    }
  };

  // Generate Dummy OTP
  const handleSendOtp = () => {
    if (mobile.length !== 10) {
      setOtpError('Please enter exactly 10 digits of your mobile number before requesting OTP.');
      return;
    }
    const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(dummyOtp);
    setIsOtpSent(true);
    setOtpError('');
    setEnteredOtp('');
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    setOtpError('');
    if (!enteredOtp || enteredOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit OTP.');
      return;
    }
    if (enteredOtp === generatedOtp) {
      setIsOtpVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code entered. Please check the dummy code or resend.');
    }
  };

  // Handle DD/MM/YYYY auto-formatting
  const handleDateChange = (val: string, setter: (s: string) => void) => {
    let v = val.replace(/\D/g, '').slice(0, 8);
    if (v.length > 4) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    setter(v);
  };

  // Handle File Upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: { name: string; size: string; type: string; url?: string }[] = [];

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(file.name);
      const url = URL.createObjectURL(file);
      newFiles.push({
        name: file.name,
        size: formatFileSize(file.size),
        type: isImg ? 'Image' : 'Document',
        url,
      });
    });

    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = () => {
    setStepError('');

    // Surname validation (at least 2 letters, letters only)
    if (!surname.trim() || surname.trim().length < 2 || !/^[A-Za-z\s]+$/.test(surname.trim())) {
      setStepError('Surname is required and must contain at least 2 letters (alphabetical characters only).');
      return;
    }

    // First name validation (at least 2 letters, letters only)
    if (!firstName.trim() || firstName.trim().length < 2 || !/^[A-Za-z\s]+$/.test(firstName.trim())) {
      setStepError('First name is required and must contain at least 2 letters (alphabetical characters only).');
      return;
    }

    // Mid name validation (at least 2 letters, letters only)
    if (!midName.trim() || midName.trim().length < 2 || !/^[A-Za-z\s]+$/.test(midName.trim())) {
      setStepError('Mid name is required and must contain at least 2 letters (alphabetical characters only).');
      return;
    }

    // Mobile validation (exactly 10 digits)
    if (mobile.length !== 10) {
      setStepError('Mobile Number must be exactly 10 numeric digits.');
      return;
    }

    // Mobile OTP verification check
    if (!isOtpVerified) {
      setStepError('Please complete Mobile OTP Verification before proceeding.');
      return;
    }

    // Email validation (must contain @gmail.com at the end)
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.endsWith('@gmail.com') || trimmedEmail === '@gmail.com') {
      setStepError("Email Address must be a valid email ending with '@gmail.com'.");
      return;
    }

    // Residential Address validation
    if (!residentialAddress.trim() || residentialAddress.trim().length < 2) {
      setStepError('Residential Address must contain at least 2 characters.');
      return;
    }

    // State validation
    if (!selectedState.trim()) {
      setStepError('Please enter or select your State in India.');
      return;
    }

    // City/District validation
    if (!selectedCity.trim()) {
      setStepError('Please select or specify your City / District.');
      return;
    }

    // Taluka validation
    if (!selectedTaluka.trim()) {
      setStepError(`Please select your Taluka / Tehsil in ${selectedCity}.`);
      return;
    }

    // Location Area validation
    if (!locationArea.trim()) {
      setStepError("Please provide your exact location under 'Location Area'.");
      return;
    }

    // Ensure incidentLocation is filled
    if (!incidentLocation.trim()) {
      const fullLoc = [locationArea.trim(), selectedTaluka.trim(), selectedCity.trim(), selectedState.trim()].filter(Boolean).join(', ');
      setIncidentLocation(fullLoc);
    }

    // Legal Declaration checkbox
    if (!isLegalDeclarationAccepted) {
      setStepError('You must tick and accept the Legal Declaration for Truthfulness to proceed.');
      return;
    }

    setActiveStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToStep3 = () => {
    setStepError('');

    if (!selectedCategory) {
      setStepError('Please select a Case / Crime Category from the list.');
      return;
    }

    if (isEmergencySelected) {
      // Emergency categories cannot proceed further!
      return;
    }

    // Date validation DD/MM/YYYY
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;
    if (!incidentDate.trim() || !dateRegex.test(incidentDate.trim())) {
      setStepError('Please enter a valid Date of Incident in DD/MM/YYYY format (e.g. 14/09/2026).');
      return;
    }

    // Time of occurrence
    if (!incidentTime.trim()) {
      setStepError('Please enter the Approximate Time of Occurrence (e.g. 10:30 PM).');
      return;
    }

    // Location
    if (!incidentLocation.trim() || incidentLocation.trim().length < 3) {
      setStepError('Please provide a valid Incident Location / Address.');
      return;
    }

    // Description
    if (!incidentDescription.trim() || incidentDescription.trim().length < 10) {
      setStepError('Detailed Incident Description must be at least 10 characters describing the event.');
      return;
    }

    setActiveStep(3);
  };

  // Step 3 Submission
  const handleSubmitFinal = () => {
    setStepError('');

    const fullNameCombined = `${firstName.trim()} ${midName.trim()} ${surname.trim()}`;
    const generatedId = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint: ComplaintData = {
      id: generatedId,
      surname: surname.trim(),
      midName: midName.trim(),
      firstName: firstName.trim(),
      fullName: fullNameCombined,
      mobile,
      email: email.trim(),
      state: selectedState.trim(),
      city: selectedCity.trim(),
      taluka: selectedTaluka.trim(),
      locationArea: locationArea.trim(),
      category: selectedCategory,
      isEmergency: false,
      incidentDate: incidentDate.trim() || dob.trim(),
      incidentTime: incidentTime.trim() || '12:00 PM',
      incidentLocation: incidentLocation.trim() || residentialAddress.trim(),
      incidentDescription: incidentDescription.trim(),
      estimatedLoss: estimatedLoss.trim() || undefined,
      suspectInfo: suspectInfo.trim() || undefined,
      witnessInfo: witnessInfo.trim() || undefined,
      evidenceFiles: attachedFiles,
      submittedAt: new Date().toLocaleString(),
      status: 'Submitted',
    };

    setSubmittedComplaint(newComplaint);
    onSubmitComplaint(newComplaint);
    setActiveStep(4); // Success screen
  };

  // Reset & return to Login
  const handleBackToLoginPortal = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 min-h-screen w-full flex flex-col overflow-y-auto ${
        isBright
          ? 'bg-slate-100 text-slate-900 selection:bg-blue-200'
          : 'bg-[#070b14] text-white selection:bg-blue-500/30'
      }`}
      style={{ colorScheme: isBright ? 'light' : 'dark' }}
    >
      {/* Top Header */}
      <header
        className={`sticky top-0 z-40 w-full px-4 sm:px-8 lg:px-12 py-3 border-b backdrop-blur-md flex items-center justify-between ${
          isBright
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
            : 'bg-slate-950/90 border-white/10 text-white shadow-md'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isBright
                ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-xs'
                : 'bg-blue-500/20 border-blue-400/40 text-cyan-300'
            }`}
          >
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-black tracking-widest uppercase font-serif ${
                isBright ? 'text-amber-700' : 'text-amber-400'
              }`}>
                CRIME MATRIX
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                isBright ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-blue-500/20 text-cyan-300 border-blue-400/30'
              }`}>
                Citizen e-FIR Portal
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center">
              <span>Register Complaint</span>
              <span className={`text-xs font-normal ml-2 hidden sm:inline ${
                isBright ? 'text-slate-500' : 'text-slate-400'
              }`}>
                — Official Crime Matrix Incident Verification & Enrolment System
              </span>
            </h1>
          </div>
        </div>

        {/* Back to Portal / Close Button */}
        <button
          type="button"
          onClick={handleBackToLoginPortal}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 border ${
            isBright
              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portal</span>
        </button>
      </header>

      {/* Stepper Navigation (Only shown for steps 1, 2, 3) */}
      {activeStep <= 3 && (
        <div className={`w-full px-4 sm:px-8 lg:px-12 py-3 border-b ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-white/10'
        }`}>
          <div className="max-w-5xl mx-auto flex items-center justify-between overflow-x-auto py-1 text-xs gap-3">
            {/* Step 1 */}
            <div className="flex items-center space-x-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  activeStep === 1
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm'
                    : activeStep > 1
                    ? 'bg-emerald-600 text-white'
                    : isBright
                    ? 'bg-slate-100 text-slate-400 border border-slate-300'
                    : 'bg-slate-800 text-slate-400 border border-white/15'
                }`}
              >
                {activeStep > 1 ? '✓' : '1'}
              </div>
              <span
                className={`font-bold uppercase tracking-tight text-xs ${
                  activeStep === 1
                    ? isBright ? 'text-blue-900 font-black' : 'text-white font-black'
                    : activeStep > 1
                    ? 'text-emerald-600 font-bold'
                    : isBright ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                1. Personal Info
              </span>
            </div>

            <span className={isBright ? 'text-slate-300' : 'text-slate-600'}>───</span>

            {/* Step 2 */}
            <div className="flex items-center space-x-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  activeStep === 2
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm'
                    : activeStep > 2
                    ? 'bg-emerald-600 text-white'
                    : isBright
                    ? 'bg-slate-100 text-slate-400 border border-slate-300'
                    : 'bg-slate-800 text-slate-400 border border-white/15'
                }`}
              >
                {activeStep > 2 ? '✓' : '2'}
              </div>
              <span
                className={`font-bold uppercase tracking-tight text-xs ${
                  activeStep === 2
                    ? isBright ? 'text-blue-900 font-black' : 'text-white font-black'
                    : activeStep > 2
                    ? 'text-emerald-600 font-bold'
                    : isBright ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                2. Incident Details
              </span>
            </div>

            <span className={isBright ? 'text-slate-300' : 'text-slate-600'}>───</span>

            {/* Step 3 */}
            <div className="flex items-center space-x-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  activeStep === 3
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm'
                    : isBright
                    ? 'bg-slate-100 text-slate-400 border border-slate-300'
                    : 'bg-slate-800 text-slate-400 border border-white/15'
                }`}
              >
                3
              </div>
              <span
                className={`font-bold uppercase tracking-tight text-xs ${
                  activeStep === 3
                    ? isBright ? 'text-blue-900 font-black' : 'text-white font-black'
                    : isBright ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                3. Evidence Upload
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className={`max-w-5xl mx-auto mt-2 h-1 w-full rounded-full overflow-hidden ${
            isBright ? 'bg-slate-200' : 'bg-white/10'
          }`}>
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{
                width: activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '100%',
              }}
            />
          </div>
        </div>
      )}

      {/* Main Form Body */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-6">
          {/* Validation Error Alert */}
          {stepError && (
            <div
              className={`p-3.5 rounded-xl text-xs font-bold flex items-start space-x-2 border ${
                isBright
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{stepError}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: PERSONAL INFORMATION (Matches Reference Image)    */}
          {/* ======================================================== */}
          {activeStep === 1 && (
            <div
              className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
                isBright
                  ? 'bg-white border-slate-200 shadow-md text-slate-900'
                  : 'bg-slate-950/75 border-white/15 shadow-xl text-white'
              }`}
            >
              {/* Header inside Form Card */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2 ${
                isBright ? 'border-slate-200' : 'border-white/10'
              }`}>
                <h3 className={`text-base sm:text-lg font-black flex items-center ${
                  isBright ? 'text-blue-950' : 'text-blue-300'
                }`}>
                  <UserCheck className="w-5 h-5 mr-2 text-amber-500" />
                  1. Personal Info (Citizen Complainant Level)
                </h3>
                <span className={`text-xs font-bold ${isBright ? 'text-slate-400' : 'text-slate-400'}`}>
                  Fields marked with * are compulsory
                </span>
              </div>

              {/* 1. Full Name (Three Forms: Surname, First name, Middle) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                  isBright ? 'text-slate-900' : 'text-slate-200'
                }`}>
                  Full Name * (Divide into Surname, First Name, Middle)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Surname */}
                  <div>
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => {
                        const letters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setSurname(letters);
                      }}
                      placeholder="Surname (Min 2 chars)"
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                      required
                    />
                  </div>

                  {/* First Name */}
                  <div>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        const letters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setFirstName(letters);
                      }}
                      placeholder="First name (Min 2 chars)"
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                      required
                    />
                  </div>

                  {/* Middle Name */}
                  <div>
                    <input
                      type="text"
                      value={midName}
                      onChange={(e) => {
                        const letters = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setMidName(letters);
                      }}
                      placeholder="Middle name (Min 2 chars)"
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Mobile Number & Official Email Address (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mobile Number & OTP */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Mobile Number * (Compulsory 10 Digits)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={handleMobileChange}
                      placeholder="e.g. 9822012345"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                      required
                    />
                  </div>

                  {/* OTP Verification Sub-block */}
                  <div className="pt-1 space-y-2">
                    {!isOtpVerified ? (
                      <div>
                        {!isOtpSent ? (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={mobile.length !== 10}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ${
                              mobile.length === 10
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                            }`}
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Send OTP</span>
                          </button>
                        ) : (
                          <div className={`p-3 rounded-xl border space-y-2.5 ${
                            isBright ? 'bg-blue-50/70 border-blue-200 text-slate-800' : 'bg-blue-950/40 border-blue-400/30 text-white'
                          }`}>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-blue-900">Generated OTP (Demo Mode):</span>
                              <span className="font-mono font-black text-sm px-2 py-0.5 rounded bg-blue-600 text-white">
                                {generatedOtp}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                maxLength={6}
                                value={enteredOtp}
                                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit OTP"
                                className={`w-36 px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-widest text-center border ${
                                  isBright
                                    ? 'bg-white border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500'
                                    : 'bg-slate-900 border-white/20 text-white'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-95"
                              >
                                Verify OTP
                              </button>
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                className={`text-xs font-bold hover:underline ${
                                  isBright ? 'text-blue-600' : 'text-cyan-300'
                                }`}
                              >
                                Resend
                              </button>
                            </div>

                            {otpError && (
                              <p className="text-[11px] font-bold text-rose-600">{otpError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Mobile Verified (OTP Confirmed)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Official Email Address */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Official Email Address * (Must contain '@gmail.com' at the last)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. citizen.complainant@gmail.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. Date of Birth / Complainant Date & Gender (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Date of Birth / Incident Date * (Format DD/MM/YYYY)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => handleDateChange(e.target.value, setDob)}
                      placeholder="DD/MM/YYYY (e.g. 15/08/1990)"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                      isBright
                        ? 'border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-500'
                        : 'border-white/20 bg-slate-900/60 text-white focus:outline-none focus:border-blue-400'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* 4. Residential Address */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                  isBright ? 'text-slate-900' : 'text-slate-200'
                }`}>
                  Residential Address * (At least 2 characters)
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <textarea
                    rows={2}
                    value={residentialAddress}
                    onChange={(e) => setResidentialAddress(e.target.value)}
                    placeholder="Enter official residential quarters or address"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                      isBright
                        ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* 5. State, District & Taluka Jurisdiction (3 columns) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                  isBright ? 'text-slate-900' : 'text-slate-200'
                }`}>
                  State, District & Taluka Jurisdiction *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* State Autocomplete Input */}
                  <div className="relative" ref={stateDropdownRef}>
                    <input
                      type="text"
                      value={selectedState}
                      onChange={(e) => {
                        handleStateChange(e.target.value);
                        setIsStateDropdownOpen(true);
                      }}
                      onFocus={() => setIsStateDropdownOpen(true)}
                      placeholder="State (e.g. Maharashtra)"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500'
                          : 'border-white/20 bg-slate-900 text-white placeholder:text-slate-400'
                      }`}
                      required
                    />
                    {isStateDropdownOpen && (
                      <div className={`absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-xl border shadow-xl z-50 ${
                        isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                      }`}>
                        {ALL_INDIAN_STATES.filter((st) =>
                          st.state.toLowerCase().includes(selectedState.toLowerCase())
                        ).map((st) => (
                          <div
                            key={st.state}
                            onClick={() => {
                              setSelectedState(st.state);
                              setSelectedCity('');
                              setSelectedTaluka('');
                              setLocationArea('');
                              setIsStateDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${
                              isBright ? 'hover:bg-blue-50 text-slate-800' : 'hover:bg-white/10 text-white'
                            }`}
                          >
                            {st.state}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* District / City Dropdown */}
                  <div>
                    <select
                      value={selectedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      disabled={!selectedState}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-blue-500'
                          : 'border-white/20 bg-slate-900 text-white disabled:opacity-50'
                      }`}
                      required
                    >
                      <option value="">{selectedState ? 'Select District / City' : 'Choose State first'}</option>
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Taluka Dropdown */}
                  <div>
                    <select
                      value={selectedTaluka}
                      onChange={(e) => handleTalukaChange(e.target.value)}
                      disabled={!selectedCity}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-blue-500'
                          : 'border-white/20 bg-slate-900 text-white disabled:opacity-50'
                      }`}
                      required
                    >
                      <option value="">{selectedCity ? 'Select Taluka / Tehsil' : 'Choose District first'}</option>
                      {availableTalukas.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. Location Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Location Area *
                  </label>
                  <button
                    type="button"
                    onClick={handleFocusLocationInput}
                    className={`text-xs font-bold flex items-center space-x-1 hover:underline cursor-pointer ${
                      isBright ? 'text-blue-600' : 'text-cyan-400'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Write Exact Location</span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={locationArea}
                    onChange={(e) => handleLocationAreaChange(e.target.value)}
                    placeholder="e.g. Sector 17 near City Plaza, Main Market"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                      isBright
                        ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* 7. Legal Declaration for Truthfulness */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isBright ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-white/15 text-slate-300'
              }`}>
                <div className="flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold uppercase tracking-wide text-amber-700">
                      Legal Declaration for Truthfulness
                    </p>
                    <p className="leading-relaxed text-slate-600">
                      I solemnly affirm that the statements made herein are truthful to the best of my knowledge. I understand that submitting false or fabricated complaints to law enforcement authorities is a punishable offence under the Bharatiya Nyaya Sanhita (BNS) / Indian Penal Code.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="legal-truthfulness-checkbox"
                    checked={isLegalDeclarationAccepted}
                    onChange={(e) => setIsLegalDeclarationAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <label
                    htmlFor="legal-truthfulness-checkbox"
                    className={`text-xs font-bold cursor-pointer select-none ${
                      isBright ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    I solemnly declare that all particulars submitted herein are authentic and accurate. *
                  </label>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="px-8 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-md bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: INCIDENT DETAILS                                 */}
          {/* ======================================================== */}
          {activeStep === 2 && (
            <div
              className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
                isBright
                  ? 'bg-white border-slate-200 shadow-md text-slate-900'
                  : 'bg-slate-950/75 border-white/15 shadow-xl text-white'
              }`}
            >
              {/* Header inside Form Card */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2 ${
                isBright ? 'border-slate-200' : 'border-white/10'
              }`}>
                <h3 className={`text-base sm:text-lg font-black flex items-center ${
                  isBright ? 'text-blue-950' : 'text-blue-300'
                }`}>
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  2. Incident Details (Crime Category & Statement)
                </h3>
                <span className={`text-xs font-bold ${isBright ? 'text-slate-400' : 'text-slate-400'}`}>
                  Fields marked with * are compulsory
                </span>
              </div>

              {/* Case Category Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Case / Crime Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAiAssistantOpen(true)}
                    className={`text-xs font-bold flex items-center space-x-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer shadow-xs ${
                      isBright
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                        : 'bg-blue-500/20 border-blue-400/40 text-cyan-300 hover:bg-blue-500/30'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Don't know Category? Let AI Analyze</span>
                  </button>
                </div>

                <div className="relative" ref={categoryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                    className={`w-full px-4 py-3 rounded-xl text-left text-sm font-bold border transition-all flex items-center justify-between shadow-xs ${
                      isBright
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-900/60 border-white/20 text-white'
                    }`}
                  >
                    <span>{selectedCategory || '— Select Crime / Incident Category —'}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className={`absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-2xl max-h-60 overflow-y-auto z-50 p-2 space-y-1 ${
                      isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
                    }`}>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                        Online FIR Eligible Categories
                      </div>
                      {ONLINE_CATEGORIES.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            selectedCategory === cat
                              ? 'bg-blue-600 text-white'
                              : isBright
                              ? 'hover:bg-slate-100 text-slate-800'
                              : 'hover:bg-white/10 text-white'
                          }`}
                        >
                          {cat}
                        </div>
                      ))}

                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 px-2 pt-2 pb-1">
                        Critical Emergency (Requires Police Dispatch 112)
                      </div>
                      {EMERGENCY_CATEGORIES.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors text-rose-600 ${
                            selectedCategory === cat
                              ? 'bg-rose-600 text-white'
                              : isBright
                              ? 'hover:bg-rose-50'
                              : 'hover:bg-rose-950/40'
                          }`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Warning Banner if emergency chosen */}
              {isEmergencySelected && (
                <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 space-y-3 shadow-xs animate-shake">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wide text-rose-700">
                        CRITICAL EMERGENCY DETECTED
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed text-rose-800">
                        This online complaint registration portal does not handle real-time emergency dispatches. For crimes involving active violence or immediate danger to human life, call Police Helpline 112 immediately.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="tel:112"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Police (112)</span>
                    </a>
                    <a
                      href="tel:100"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-xs"
                    >
                      <span>Control Room (100)</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleBackToLoginPortal}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs"
                    >
                      Back to Login Portal
                    </button>
                  </div>
                </div>
              )}

              {/* Date of Incident & Approximate Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Date of Incident * (DD/MM/YYYY)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={incidentDate}
                      onChange={(e) => handleDateChange(e.target.value, setIncidentDate)}
                      placeholder="DD/MM/YYYY (e.g. 14/09/2026)"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    Approximate Time of Occurrence *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                      placeholder="e.g. 10:30 PM or 14:00 hrs"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                        isBright
                          ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500'
                          : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Incident Location */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                  isBright ? 'text-slate-900' : 'text-slate-200'
                }`}>
                  Incident Location / Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    placeholder="Location where the incident occurred"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-bold transition-all border shadow-xs ${
                      isBright
                        ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500'
                        : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Detailed Incident Statement / Description */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-extrabold uppercase tracking-wider ${
                  isBright ? 'text-slate-900' : 'text-slate-200'
                }`}>
                  Detailed Incident Statement / Narrative * (Min 10 characters)
                </label>
                <textarea
                  rows={4}
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Provide comprehensive details of the incident: what occurred, how the suspect approached you, mode of offence, and any financial transaction or device details."
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all border shadow-xs ${
                    isBright
                      ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500'
                      : 'border-white/20 bg-slate-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400'
                  }`}
                  required
                />
              </div>

              {/* Estimated Loss, Suspect Info, Witness Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-[11px] font-bold uppercase mb-1 ${
                    isBright ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Estimated Loss (₹ / Items)
                  </label>
                  <input
                    type="text"
                    value={estimatedLoss}
                    onChange={(e) => setEstimatedLoss(e.target.value)}
                    placeholder="e.g. ₹ 45,000 or iPhone 14"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border shadow-xs ${
                      isBright ? 'border-slate-300 bg-white text-slate-900' : 'border-white/20 bg-slate-900 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase mb-1 ${
                    isBright ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Suspect Name / Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={suspectInfo}
                    onChange={(e) => setSuspectInfo(e.target.value)}
                    placeholder="e.g. Unknown caller / Rohit Verma"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border shadow-xs ${
                      isBright ? 'border-slate-300 bg-white text-slate-900' : 'border-white/20 bg-slate-900 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold uppercase mb-1 ${
                    isBright ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Witness Info (Optional)
                  </label>
                  <input
                    type="text"
                    value={witnessInfo}
                    onChange={(e) => setWitnessInfo(e.target.value)}
                    placeholder="e.g. Shopkeeper adjacent"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border shadow-xs ${
                      isBright ? 'border-slate-300 bg-white text-slate-900' : 'border-white/20 bg-slate-900 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 ${
                    isBright
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  disabled={isEmergencySelected}
                  className={`px-8 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-md ${
                    isEmergencySelected
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  }`}
                >
                  <span>NEXT</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: EVIDENCE UPLOAD & SUBMISSION                     */}
          {/* ======================================================== */}
          {activeStep === 3 && (
            <div
              className={`p-6 sm:p-8 rounded-2xl border space-y-6 ${
                isBright
                  ? 'bg-white border-slate-200 shadow-md text-slate-900'
                  : 'bg-slate-950/75 border-white/15 shadow-xl text-white'
              }`}
            >
              {/* Header inside Form Card */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2 ${
                isBright ? 'border-slate-200' : 'border-white/10'
              }`}>
                <h3 className={`text-base sm:text-lg font-black flex items-center ${
                  isBright ? 'text-blue-950' : 'text-blue-300'
                }`}>
                  <Upload className="w-5 h-5 mr-2 text-blue-600" />
                  3. Evidence Upload & Final Verification
                </h3>
                <span className={`text-xs font-bold ${isBright ? 'text-slate-400' : 'text-slate-400'}`}>
                  Digital verification stage
                </span>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-3 cursor-pointer transition-all ${
                  isBright
                    ? 'border-slate-300 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-500'
                    : 'border-white/20 bg-slate-900/40 hover:bg-slate-900/70 hover:border-blue-400'
                }`}
              >
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  isBright ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-cyan-300'
                }`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className={`font-extrabold text-sm ${isBright ? 'text-slate-900' : 'text-white'}`}>
                    Click here to attach evidence from this device
                  </p>
                  <p className="text-xs mt-0.5 text-slate-500">
                    Supports Images (JPG, PNG), Documents (PDF, DOCX), Audio, and CCTV screenshots
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isBright
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
                    : 'bg-white/10 border-white/20 text-white'
                }`}>
                  Select Files from Device
                </span>
              </div>

              {/* Uploaded Files List */}
              {attachedFiles.length > 0 ? (
                <div className="space-y-2">
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${
                    isBright ? 'text-slate-900' : 'text-white'
                  }`}>
                    Attached Evidence ({attachedFiles.length} files)
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {attachedFiles.map((f, index) => (
                      <div
                        key={`${f.name}-${index}`}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isBright
                            ? 'bg-slate-50 border-slate-200 text-slate-900'
                            : 'bg-slate-900/60 border-white/15 text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {f.url && f.type === 'Image' ? (
                            <img
                              src={f.url}
                              alt="Thumbnail"
                              className="w-9 h-9 rounded-lg object-cover border shrink-0"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isBright ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-cyan-300'
                            }`}>
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold truncate text-xs">{f.name}</p>
                            <p className="text-[10px] text-slate-400">{f.size} • {f.type}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-center text-slate-400">
                  No evidence attached yet. (You may still proceed to submit your complaint).
                </p>
              )}

              {/* Summary Checklist Box */}
              <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                isBright ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/50 border-white/15 text-slate-300'
              }`}>
                <h5 className="font-extrabold uppercase tracking-wider text-[11px] text-blue-600">
                  Complaint Filing Summary
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Complainant: </span>
                    <span className="font-bold">{firstName} {midName} {surname}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Contact: </span>
                    <span className="font-bold">+91 {mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Category: </span>
                    <span className="font-bold">{selectedCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Incident Date: </span>
                    <span className="font-bold">{incidentDate || dob}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 ${
                    isBright
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  className="px-8 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>SUBMIT COMPLAINT</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: SUBMISSION SUCCESS SCREEN                         */}
          {/* ======================================================== */}
          {activeStep === 4 && submittedComplaint && (
            <div className={`p-8 sm:p-12 rounded-2xl border text-center space-y-6 ${
              isBright
                ? 'bg-white border-slate-200 shadow-md text-slate-900'
                : 'bg-slate-950/75 border-white/15 shadow-xl text-white'
            }`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Your case is Submitted
                </h3>
                <p className="text-xs sm:text-sm mt-1 max-w-md mx-auto font-medium text-slate-500">
                  Your formal digital complaint has been securely registered in the central Crime Matrix database for Investigator & SHO/Inspector review.
                </p>
              </div>

              {/* Acknowledgement Certificate Box */}
              <div className={`p-5 rounded-2xl border max-w-md mx-auto text-left space-y-3 shadow-sm ${
                isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-white/20 text-white'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                    Acknowledgement No.
                  </span>
                  <span className="font-mono font-black text-sm text-blue-600">
                    {submittedComplaint.id}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Complainant:</span>
                    <span className="font-bold">{submittedComplaint.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Crime Category:</span>
                    <span className="font-bold">{submittedComplaint.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-bold truncate max-w-[200px]">
                      {submittedComplaint.incidentLocation}, {submittedComplaint.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submission Time:</span>
                    <span className="font-bold">{submittedComplaint.submittedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                      Pending Station Review
                    </span>
                  </div>
                </div>
              </div>

              {/* Back to Login Portal Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBackToLoginPortal}
                  className="px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center space-x-2 mx-auto cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3]" />
                  <span>BACK TO LOGIN PORTAL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Case Category Identification Assistant Modal */}
      <AiCaseCategoryAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onConfirmCategory={handleConfirmAiCategory}
        currentCategory={selectedCategory}
      />
    </div>
  );
};
