import React, { useState } from 'react';
import { UserRole, User, RegistrationRequest } from '../types';
import { LogoHeader } from './LogoHeader';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { checkPasswordRequirements } from './PasswordStrengthBar';
import { CaptchaBox } from './CaptchaBox';
import { IrisVerificationBox } from './IrisVerificationBox';
import { Shield, LogIn, AlertCircle, FileText, Scan, ScanEye, CheckCircle2, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import courtroomLoginBg from '../assets/images/image6.jpg.jpeg';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenRegistration: () => void;
  onOpenRegisterComplaint: () => void;
  themeMode?: 'dark' | 'bright';
  onToggleTheme?: () => void;
  existingUsers: User[];
  pendingRequests?: RegistrationRequest[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenRegisterComplaint,
  existingUsers,
  pendingRequests = [],
}) => {
  // Always keep bright mode strictly on login page as per user instructions
  const themeMode = 'bright';
  const { t } = useLanguage();

  // Initial demo users for instant testing convenience
  const defaultOfficer = existingUsers.find((u) => u.role === 'Police Officer');
  const defaultVictim = existingUsers.find((u) => u.role === 'Victim');

  // --- Left Box: Officer Login State ---
  const [officerRole, setOfficerRole] = useState<UserRole>('Police Officer');
  const [officerUsername, setOfficerUsername] = useState(defaultOfficer?.username || 'officer_shinde');
  const [officerPassword, setOfficerPassword] = useState('Justice#2026');
  const [showOfficerPassword, setShowOfficerPassword] = useState(false);
  const [officerIrisVerified, setOfficerIrisVerified] = useState(false);
  const [isIrisModalOpen, setIsIrisModalOpen] = useState(false);
  const [officerError, setOfficerError] = useState('');

  // --- Right Box: Victim Login State ---
  const [victimUsername, setVictimUsername] = useState(defaultVictim?.username || 'victim_sanjay');
  const [victimPassword, setVictimPassword] = useState('Justice#2026');
  const [showVictimPassword, setShowVictimPassword] = useState(false);
  const [victimCaptchaVerified, setVictimCaptchaVerified] = useState(false);
  const [victimError, setVictimError] = useState('');

  // Officer roles list: 'DSP', 'Host', 'Police Officer', 'Subdivision Level', 'District Level', 'State Govt'
  const officerRoles: { role: UserRole; label: string }[] = [
    { role: 'DSP', label: t('SHO/Inspector') },
    { role: 'Host', label: t('Investigator') },
    { role: 'Police Officer', label: t('Police Officer') },
    { role: 'Subdivision Level', label: t('Subdivision Level') },
    { role: 'District Level', label: t('District Level') },
    { role: 'State Govt', label: t('State Govt') },
  ];

  // Auto-fill demo credentials when clicking an officer role button
  const handleOfficerRoleSelect = (role: UserRole) => {
    setOfficerRole(role);
    setOfficerError('');
    setOfficerIrisVerified(false);
    const demoUser = existingUsers.find((u) => u.role === role);
    if (demoUser) {
      setOfficerUsername(demoUser.username);
      setOfficerPassword('Justice#2026');
    } else {
      setOfficerUsername('');
      setOfficerPassword('');
    }
  };

  // Handle Officer Login Form Submission
  const handleOfficerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError('');

    if (!officerUsername.trim()) {
      setOfficerError('Please enter your agency identification / username.');
      return;
    }

    if (!officerPassword) {
      setOfficerError('Please enter your security password.');
      return;
    }

    const reqs = checkPasswordRequirements(officerPassword);
    const isPassValid = reqs.hasMinLength && reqs.hasUppercase && reqs.hasNumber && reqs.hasSpecialChar;

    if (!isPassValid) {
      setOfficerError('Password does not meet all security criteria (8+ chars, Uppercase, Number, Special char).');
      return;
    }

    if (!officerIrisVerified) {
      setOfficerError('Iris Verification required. Please complete Iris Biometric scan to proceed.');
      return;
    }

    const trimmedUsername = officerUsername.toLowerCase().trim();
    const matchedUser = existingUsers.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (matchedUser) {
      if (matchedUser.role !== officerRole) {
        const displayRole = matchedUser.role === 'DSP' ? 'SHO/Inspector' : matchedUser.role === 'Host' ? 'Investigator' : matchedUser.role;
        setOfficerError(`Role Mismatch: Account '${officerUsername}' is registered as '${displayRole}'. Please select '${displayRole}' above.`);
        return;
      }

      if (matchedUser.status === 'Pending') {
        setOfficerError('Access Denied: Your registration is currently Pending approval by Investigator or SHO/Inspector.');
        return;
      }

      if (matchedUser.status === 'Rejected') {
        setOfficerError('Access Denied: Your registration application was Rejected by Investigator / SHO/Inspector.');
        return;
      }

      if (matchedUser.password && matchedUser.password !== officerPassword) {
        setOfficerError('Invalid password. Please enter the password registered with this account.');
        return;
      }

      onLoginSuccess(matchedUser);
      return;
    }

    const matchedRequest = pendingRequests.find(
      (req) => req.username.toLowerCase() === trimmedUsername
    );

    if (matchedRequest) {
      if (matchedRequest.status === 'Pending') {
        setOfficerError(
          `Approval Pending: Account '${officerUsername}' was submitted for registration but is currently awaiting approval from ${matchedRequest.assignedToRole}.`
        );
        return;
      }

      if (matchedRequest.status === 'Rejected') {
        setOfficerError(
          `Registration Rejected: Account '${officerUsername}' application was rejected by ${matchedRequest.assignedToRole}.`
        );
        return;
      }
    }

    setOfficerError(
      `Account Not Registered: Officer username '${officerUsername}' is not registered or approved.`
    );
  };

  // Handle Victim Login Form Submission
  const handleVictimLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVictimError('');

    if (!victimUsername.trim()) {
      setVictimError('Please enter your agency identification / username.');
      return;
    }

    if (!victimPassword) {
      setVictimError('Please enter your security password.');
      return;
    }

    const reqs = checkPasswordRequirements(victimPassword);
    const isPassValid = reqs.hasMinLength && reqs.hasUppercase && reqs.hasNumber && reqs.hasSpecialChar;

    if (!isPassValid) {
      setVictimError('Password does not meet all security criteria (8+ chars, Uppercase, Number, Special char).');
      return;
    }

    if (!victimCaptchaVerified) {
      setVictimError('Security CAPTCHA verification required. Please enter the correct text.');
      return;
    }

    const trimmedUsername = victimUsername.toLowerCase().trim();
    const matchedUser = existingUsers.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (matchedUser) {
      if (matchedUser.role !== 'Victim') {
        setVictimError(`Role Mismatch: Account '${victimUsername}' is registered as an officer (${matchedUser.role}). Please use the Officer Login on the left.`);
        return;
      }

      if (matchedUser.status === 'Pending') {
        setVictimError('Access Denied: Your registration is currently Pending approval.');
        return;
      }

      if (matchedUser.status === 'Rejected') {
        setVictimError('Access Denied: Your registration application was Rejected.');
        return;
      }

      if (matchedUser.password && matchedUser.password !== victimPassword) {
        setVictimError('Invalid password. Please enter the password registered with this account.');
        return;
      }

      onLoginSuccess(matchedUser);
      return;
    }

    const matchedRequest = pendingRequests.find(
      (req) => req.username.toLowerCase() === trimmedUsername
    );

    if (matchedRequest) {
      if (matchedRequest.status === 'Pending') {
        setVictimError(
          `Approval Pending: Account '${victimUsername}' was submitted but is currently awaiting review.`
        );
        return;
      }

      if (matchedRequest.status === 'Rejected') {
        setVictimError(
          `Registration Rejected: Account '${victimUsername}' application was rejected.`
        );
        return;
      }
    }

    setVictimError(
      `Account Not Registered: Victim account '${victimUsername}' is not found. Please click 'Register Complaint' to file an e-FIR.`
    );
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 overflow-x-hidden font-sans ${
        themeMode === 'bright'
          ? 'text-slate-900'
          : 'text-slate-100'
      }`}
    >
      {/* Background Image: using image6.jpg.jpeg as full screen background as it is */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <img
          src={courtroomLoginBg || '/image6.jpg.jpeg'}
          alt="Courtroom Justice Background"
          className="w-full h-full object-cover object-center select-none"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = '/image6.jpg.jpeg';
          }}
        />
      </div>

      {/* Top Header Controls: Language Switcher (Theme is locked to Bright Mode on Login Page) */}
      <div className="absolute top-4 right-4 sm:right-8 z-40 flex items-center space-x-2 sm:space-x-3">
        <LanguageSwitcher themeMode={themeMode} isLoginPage={true} />
      </div>

      {/* Main Login Cards Container (Divided into two side-by-side boxes placed at center) */}
      <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl my-4 sm:my-6 px-3 sm:px-4">
        {/* Logo & Header */}
        <div className="mb-4 sm:mb-6">
          <LogoHeader size="lg" themeMode={themeMode} forceDarkText={false} isLoginPage={true} />
        </div>

        {/* Two side-by-side boxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* ========================================================================= */}
          {/* LEFT BOX: OFFICER LOGIN                                                   */}
          {/* ========================================================================= */}
          <div
            className="flex flex-col justify-between h-full p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all border border-white/20 bg-slate-950/45 text-white ring-1 ring-white/10"
          >
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Heading: Officer Login */}
                <div className="text-center mb-5 pb-3 border-b border-white/15 min-h-[96px] flex flex-col justify-center">
                  <div className="inline-flex items-center justify-center p-2.5 rounded-xl border border-blue-400/40 bg-blue-500/20 text-blue-300 shadow-inner mb-2 mx-auto">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center space-x-2 text-white drop-shadow-sm">
                    <span>{t('Officer Login')}</span>
                  </h2>
                  <p className="text-xs mt-1 font-semibold text-slate-300">
                    {t('Authorized Police & Command Personnel')}
                  </p>
                </div>

                {/* 1. Ask Role: Dropdown */}
                <div className="mb-4">
                  <label htmlFor="officer-role-select" className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-slate-200">
                    {t('Select Role:')}
                  </label>
                  <div className="relative">
                    <select
                      id="officer-role-select"
                      value={officerRole}
                      onChange={(e) => handleOfficerRoleSelect(e.target.value as UserRole)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-bold focus:outline-none transition-all cursor-pointer appearance-none border border-white/20 bg-slate-900/60 hover:bg-slate-900/75 focus:bg-slate-900/90 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 shadow-inner"
                    >
                      {officerRoles.map((r) => (
                        <option
                          key={r.role}
                          value={r.role}
                          className="bg-slate-900 text-white font-bold"
                        >
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5">
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>

                {/* Officer Form */}
                <form onSubmit={handleOfficerLoginSubmit} className="space-y-3.5">
                  {/* Error Message */}
                  {officerError && (
                    <div className="p-2.5 rounded-md bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{officerError}</span>
                    </div>
                  )}

                  {/* 2. Agency Identification/ Username */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5 text-slate-200">
                      {t('Agency Identification/ Username')}
                    </label>
                    <input
                      type="text"
                      value={officerUsername}
                      onChange={(e) => setOfficerUsername(e.target.value)}
                      placeholder={t('Enter agency ID')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-all border border-white/20 bg-slate-900/60 hover:bg-slate-900/75 focus:bg-slate-900/90 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 shadow-inner"
                      required
                    />
                  </div>

                  {/* 3. Security Password */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5 text-slate-200">
                      {t('Security Password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showOfficerPassword ? 'text' : 'password'}
                        value={officerPassword}
                        onChange={(e) => setOfficerPassword(e.target.value)}
                        placeholder={t('Enter security password')}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-all border border-white/20 bg-slate-900/60 hover:bg-slate-900/75 focus:bg-slate-900/90 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 shadow-inner"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOfficerPassword((prev) => !prev)}
                        aria-label={showOfficerPassword ? t('Hide password') : t('Show password')}
                        title={showOfficerPassword ? t('Hide password') : t('Show password')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        {showOfficerPassword ? (
                          <EyeOff className="w-4 h-4 stroke-[2.2]" />
                        ) : (
                          <Eye className="w-4 h-4 stroke-[2.2]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 4. Iris Verification Button */}
                  <div className="p-3 rounded-xl border border-white/20 bg-slate-900/40 backdrop-blur-md shadow-inner transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-200">
                        <ScanEye className="w-4 h-4 text-cyan-400" />
                        <span>{t('Iris Verification')}</span>
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                        officerIrisVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800/80 text-slate-300 border-white/15'
                      }`}>
                        {officerIrisVerified ? t('✓ Verified') : t('Pending')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsIrisModalOpen(true)}
                      className={`w-full py-2.5 px-4 rounded-lg font-black text-xs sm:text-sm tracking-wide flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm active:scale-[0.99] ${
                        officerIrisVerified
                          ? 'bg-emerald-950/60 border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-950/80'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-950/50 border border-blue-400/30'
                      }`}
                    >
                      {officerIrisVerified ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                          <span>{t('Iris Verified (Biometric Confirmed)')}</span>
                        </>
                      ) : (
                        <>
                          <Scan className="w-4 h-4 stroke-[2.5]" />
                          <span>{t('Start Iris Scan')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 6. Authorize Login */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer transform active:scale-[0.99] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-950/50 border border-blue-400/30"
                    >
                      <LogIn className="w-4 h-4 stroke-[3]" />
                      <span>{t('AUTHORIZE LOGIN')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* System Footer Bar */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>ENCRYPTION: AES-256</span>
              <span>OFFICER GATEWAY</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT BOX: VICTIM LOGIN                                                  */}
          {/* ========================================================================= */}
          <div
            className="flex flex-col justify-between h-full p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all border border-white/20 bg-slate-950/45 text-white ring-1 ring-white/10"
          >
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Heading: Victim Login */}
                <div className="text-center mb-5 pb-3 border-b border-white/15 min-h-[96px] flex flex-col justify-center">
                  <div className="inline-flex items-center justify-center p-2.5 rounded-xl border border-blue-400/40 bg-blue-500/20 text-blue-300 shadow-inner mb-2 mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center space-x-2 text-white drop-shadow-sm">
                    <span>{t('Victim Login')}</span>
                  </h2>
                  <p className="text-xs mt-1 font-semibold text-slate-300">
                    {t('Case Complainant & Citizen Portal')}
                  </p>
                </div>

                {/* Victim Form */}
                <form onSubmit={handleVictimLoginSubmit} className="space-y-3.5">
                  {/* Error Message */}
                  {victimError && (
                    <div className="p-2.5 rounded-md bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-bold flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{victimError}</span>
                    </div>
                  )}

                  {/* 1. Agency Identification/ Username */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5 text-slate-200">
                      {t('Agency Identification/ Username')}
                    </label>
                    <input
                      type="text"
                      value={victimUsername}
                      onChange={(e) => setVictimUsername(e.target.value)}
                      placeholder={t('Enter your ID / username')}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-all border border-white/20 bg-slate-900/60 hover:bg-slate-900/75 focus:bg-slate-900/90 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 shadow-inner"
                      required
                    />
                  </div>

                  {/* 2. Security Password */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5 text-slate-200">
                      {t('Security Password')}
                    </label>
                    <div className="relative">
                      <input
                        type={showVictimPassword ? 'text' : 'password'}
                        value={victimPassword}
                        onChange={(e) => setVictimPassword(e.target.value)}
                        placeholder={t('Enter security password')}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-all border border-white/20 bg-slate-900/60 hover:bg-slate-900/75 focus:bg-slate-900/90 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/25 shadow-inner"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowVictimPassword((prev) => !prev)}
                        aria-label={showVictimPassword ? t('Hide password') : t('Show password')}
                        title={showVictimPassword ? t('Hide password') : t('Show password')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        {showVictimPassword ? (
                          <EyeOff className="w-4 h-4 stroke-[2.2]" />
                        ) : (
                          <Eye className="w-4 h-4 stroke-[2.2]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3. Two Step Verification (CAPTCHA) */}
                  <div className="pt-0.5">
                    <CaptchaBox onVerify={setVictimCaptchaVerified} themeMode={themeMode} isTransparent={true} />
                  </div>

                  {/* 5. Authorize Login & 6. Register Complaint */}
                  <div className="pt-2 space-y-2.5">
                    {/* Authorize Login */}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer transform active:scale-[0.99] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-950/50 border border-blue-400/30"
                    >
                      <LogIn className="w-4 h-4 stroke-[3]" />
                      <span>{t('AUTHORIZE LOGIN')}</span>
                    </button>

                    {/* Register Complaint */}
                    <button
                      type="button"
                      onClick={onOpenRegisterComplaint}
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider border border-white/20 bg-slate-900/60 hover:bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition-all flex items-center justify-center space-x-2 cursor-pointer transform active:scale-[0.99] ring-1 ring-white/10"
                    >
                      <FileText className="w-4 h-4 shrink-0 stroke-[2.5] text-cyan-400" />
                      <span>{t('REGISTER COMPLAINT')}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* System Footer Bar */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>ENCRYPTION: AES-256</span>
              <span>CITIZEN PORTAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Eye Scan Card Modal */}
      {isIrisModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsIrisModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/20 p-6 transition-all backdrop-blur-2xl shadow-2xl bg-slate-950/65 text-white ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Card Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/15">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl border border-blue-400/40 bg-blue-500/20 text-cyan-400 shadow-inner">
                  <ScanEye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    {t('Official Iris Biometric Scanner')}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {t('Complete biometric eye scan to authorize officer clearance')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsIrisModalOpen(false)}
                className="p-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Card Body: IrisVerificationBox */}
            <div className="py-1">
              <IrisVerificationBox
                onVerify={(isValid) => {
                  setOfficerIrisVerified(isValid);
                  if (isValid) {
                    setOfficerError('');
                  }
                }}
                themeMode={themeMode}
                title={t('Iris Verification')}
                subtitle={t('Biometric Retinal & Iris Pattern Recognition')}
                isTransparent={true}
              />
            </div>

            {/* Modal Card Footer */}
            <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsIrisModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  officerIrisVerified
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                }`}
              >
                {officerIrisVerified ? t('Proceed to Login') : t('Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
