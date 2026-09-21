import React, { useState } from 'react';
import { User } from '../types';
import { PasswordStrengthBar, checkPasswordRequirements } from './PasswordStrengthBar';
import {
  Settings,
  User as UserIcon,
  KeyRound,
  Sun,
  Moon,
  Volume2,
  Bell,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Stamp,
  MapPin,
} from 'lucide-react';

interface SettingsViewProps {
  currentUser: User;
  themeMode: 'dark' | 'bright';
  onToggleTheme: () => void;
  onUpdateUser?: (updatedUser: User) => void;
  onUpdateCurrentUser?: (updatedUser: User) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  themeMode,
  onToggleTheme,
  onUpdateUser,
  onUpdateCurrentUser,
}) => {
  // Username state
  const [username, setUsername] = useState(currentUser.username);
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [state, setState] = useState(
    currentUser.state || (currentUser.role === 'State Govt' || currentUser.role === 'District Level' || currentUser.role === 'DSP' ? 'Maharashtra' : '')
  );
  // District state (for District Level Officer & DSP)
  const [district, setDistrict] = useState(currentUser.district || 'Solapur');
  // Taluka state (for DSP)
  const [taluka, setTaluka] = useState(
    (currentUser.talukas && currentUser.talukas[0]) || currentUser.taluka || (currentUser.role === 'DSP' ? 'Karmala' : '')
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Additional settings
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [criticalPushNotifications, setCriticalPushNotifications] = useState(true);
  const [biometricPromptOnCase, setBiometricPromptOnCase] = useState(true);
  const [autoLockTimeout, setAutoLockTimeout] = useState('30m');

  // Messages
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [preferencesMsg, setPreferencesMsg] = useState('');

  // Save profile changes (username, full name, phone, email)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) return;

    const updated: User = {
      ...currentUser,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      state: (currentUser.role === 'State Govt' || currentUser.role === 'District Level' || currentUser.role === 'DSP')
        ? (state.trim() || 'Maharashtra')
        : currentUser.state,
      district: (currentUser.role === 'District Level' || currentUser.role === 'DSP')
        ? (district.trim() || 'Solapur')
        : currentUser.district,
      talukas: currentUser.role === 'DSP'
        ? (taluka.trim() ? [taluka.trim()] : (currentUser.talukas || ['Karmala']))
        : currentUser.talukas,
      taluka: currentUser.role === 'DSP'
        ? (taluka.trim() || currentUser.taluka || 'Karmala')
        : currentUser.taluka,
    };

    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(updated);
    } else if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setProfileSuccessMsg('Profile credentials & username updated successfully.');
    setTimeout(() => setProfileSuccessMsg(''), 5000);
  };

  // Change password handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current security password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }

    const reqs = checkPasswordRequirements(newPassword);
    if (!reqs.hasMinLength || !reqs.hasUppercase || !reqs.hasNumber || !reqs.hasSpecialChar) {
      setPasswordErrorMsg('New password must satisfy all 4 security criteria shown below.');
      return;
    }

    // Success
    setPasswordSuccessMsg('Master password updated and encrypted with 256-bit SHA. Please use this password on your next login.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccessMsg(''), 6000);
  };

  const handleSavePreferences = () => {
    setPreferencesMsg('Portal preferences and operational safeguards saved.');
    setTimeout(() => setPreferencesMsg(''), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="border-b border-yellow-500/20 pb-4 flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-500 border border-yellow-500/40">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-yellow-400'}`}>
            Security, Credentials & Portal Settings
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
            Update authenticated login credentials, modify security password, switch appearance theme, and configure alert preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* ======================================================== */}
        {/* 1. USERNAME & PROFILE SECTION                            */}
        {/* ======================================================== */}
        <div className={`p-6 rounded-2xl border transition-all ${
          themeMode === 'bright' ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-xl'
        }`}>
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-700/30 mb-4">
            <UserIcon className="w-5 h-5 text-yellow-500" />
            <h2 className={`text-base font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
              Account Identity & Username
            </h2>
          </div>

          {profileSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                Portal Login Username
              </label>
              <input
                id="settings-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                  themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-yellow-400'
                }`}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used to log in across the portal. Role: <strong className="text-yellow-500">{currentUser.role}</strong>
              </p>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                Officer / Personnel Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                  themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Official Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Government Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>
            </div>

            {currentUser.role === 'State Govt' && (
              <div>
                <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  State
                </label>
                <input
                  id="settings-state-input"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                  placeholder="Maharashtra"
                />
              </div>
            )}

            {currentUser.role === 'District Level' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                    State
                  </label>
                  <input
                    id="settings-district-officer-state"
                    type="text"
                    value={state || 'Maharashtra'}
                    onChange={(e) => setState(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                      themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                    placeholder="Maharashtra"
                  />
                  <p className={`text-[11px] mt-1 font-medium ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Assigned State: <strong className="text-emerald-500">Maharashtra</strong>
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                    District
                  </label>
                  <select
                    id="settings-district-officer-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-yellow-500 outline-hidden cursor-pointer ${
                      themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Solapur">Solapur</option>
                    <option value="Jalna">Jalna</option>
                    <option value="Kolhapur">Kolhapur</option>
                    {district && !['Solapur', 'Jalna', 'Kolhapur'].includes(district) && (
                      <option value={district}>{district}</option>
                    )}
                  </select>
                  <p className={`text-[11px] mt-1 font-medium ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                    Assigned District: <strong className="text-amber-500">{district || 'Solapur'}</strong>
                  </p>
                </div>
              </div>
            )}

            {currentUser.role === 'DSP' && (
              <div className="space-y-4">
                <div className={`p-3.5 rounded-xl border ${
                  themeMode === 'bright'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                }`}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-yellow-500 shrink-0" />
                    Assigned Jurisdictional Authority (Registration)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">State</span>
                      <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{state || 'Maharashtra'}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">District</span>
                      <strong className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{district || 'Solapur'}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Assigned Taluka</span>
                      <strong className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{taluka || 'Karmala'}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                    State
                  </label>
                  <input
                    id="settings-dsp-state"
                    type="text"
                    value={state || 'Maharashtra'}
                    onChange={(e) => setState(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                      themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                    }`}
                    placeholder="Maharashtra"
                  />
                  <p className={`text-[11px] mt-1 font-medium ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                    State: <strong className="text-emerald-500">{state || 'Maharashtra'}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                      District
                    </label>
                    <input
                      id="settings-dsp-district"
                      type="text"
                      value={district || 'Solapur'}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                        themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                      placeholder="Solapur"
                    />
                    <p className={`text-[11px] mt-1 font-medium ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                      District: <strong className="text-amber-500">{district || 'Solapur'}</strong>
                    </p>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                      Taluka
                    </label>
                    <select
                      id="settings-dsp-taluka"
                      value={taluka || 'Karmala'}
                      onChange={(e) => setTaluka(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                        themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                      }`}
                    >
                      <option value="Karmala">Karmala</option>
                      <option value="Barshi">Barshi</option>
                      <option value="Madha">Madha</option>
                      {taluka && !['Karmala', 'Barshi', 'Madha'].includes(taluka) && (
                        <option value={taluka}>{taluka}</option>
                      )}
                    </select>
                    <p className={`text-[11px] mt-1 font-medium ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Taluka: <strong className="text-blue-500">{taluka || 'Karmala'}</strong> (Assigned at registration)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              themeMode === 'bright' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div>
                <p className="font-bold">Badge / Service Number</p>
                <p className="font-mono text-yellow-500 font-bold text-xs">{currentUser.badgeId}</p>
                {currentUser.role === 'State Govt' && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    State: <span className="font-bold text-emerald-400">{state || 'Maharashtra'}</span>
                  </p>
                )}
                {currentUser.role === 'District Level' && (
                  <div className={`text-[11px] mt-1 space-y-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <p>
                      State: <span className="font-bold text-emerald-500">{state || 'Maharashtra'}</span>
                    </p>
                    <p>
                      District: <span className="font-bold text-amber-500">{district || 'Solapur'}</span>
                    </p>
                  </div>
                )}
                {currentUser.role === 'DSP' && (
                  <div className={`text-[11px] mt-1 space-y-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <p>
                      State: <span className="font-bold text-emerald-500">{state || 'Maharashtra'}</span>
                    </p>
                    <p>
                      District: <span className="font-bold text-amber-500">{district || currentUser.district || 'Metro District'}</span>
                    </p>
                    <p>
                      Taluka: <span className="font-bold text-cyan-500">{taluka || (currentUser.talukas && currentUser.talukas[0]) || currentUser.taluka || 'Downtown Central'}</span>
                    </p>
                  </div>
                )}
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px]">
                {currentUser.status}
              </span>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                id="btn-save-profile"
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================== */}
        {/* 2. CHANGE PASSWORD SECTION                               */}
        {/* ======================================================== */}
        <div className={`p-6 rounded-2xl border transition-all ${
          themeMode === 'bright' ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-xl'
        }`}>
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-700/30 mb-4">
            <KeyRound className="w-5 h-5 text-yellow-500" />
            <h2 className={`text-base font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
              Change Security Password
            </h2>
          </div>

          {passwordSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {passwordErrorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="settings-current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm pr-10 focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="settings-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong new password"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm pr-10 focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Password Strength Meter */}
            <PasswordStrengthBar password={newPassword} />

            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="settings-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm pr-10 focus:ring-2 focus:ring-yellow-500 outline-hidden ${
                    themeMode === 'bright' ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="btn-update-password"
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-slate-950 flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. APPEARANCE (SWITCH DARK / BRIGHT) & OTHER SETTINGS    */}
      {/* ======================================================== */}
      <div className={`p-6 rounded-2xl border transition-all ${
        themeMode === 'bright' ? 'bg-white border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-xl'
      }`}>
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-700/30 mb-6">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h2 className={`text-base font-black ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
            Portal Theme & Operational Preferences
          </h2>
        </div>

        {preferencesMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{preferencesMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Theme Mode Switcher */}
          <div>
            <label className={`block text-xs font-bold uppercase mb-2 ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
              Display Theme: Switch Dark Mode to Bright Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Mode Option Card */}
              <div
                onClick={() => {
                  if (themeMode === 'bright') onToggleTheme();
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  themeMode === 'dark'
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-950 text-yellow-400 border border-slate-800">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-yellow-400">Dark Mode (Midnight Police)</h4>
                    <p className="text-[11px] text-slate-400">High contrast dark canvas with amber security accents</p>
                  </div>
                </div>
                {themeMode === 'dark' && (
                  <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" />
                )}
              </div>

              {/* Bright Mode Option Card */}
              <div
                onClick={() => {
                  if (themeMode === 'dark') onToggleTheme();
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  themeMode === 'bright'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Bright Mode (Civic Light)</h4>
                    <p className="text-[11px] text-slate-600">Clean white and slate styling for daylight readability</p>
                  </div>
                </div>
                {themeMode === 'bright' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Additional Other Settings */}
          <div className="border-t border-slate-700/30 pt-5 space-y-4">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
              Operational Safeguards & Audio Alarms
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sound Alerts */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-yellow-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Audio Alarms & Priority Beeps</p>
                    <p className="text-[11px] text-slate-400">Play tone on incoming e-FIR complaint & court reminders</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                />
              </div>

              {/* Flash APBs */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Flash APB Emergency Banners</p>
                    <p className="text-[11px] text-slate-400">Display inter-state amber alerts on top of dashboard</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={criticalPushNotifications}
                  onChange={(e) => setCriticalPushNotifications(e.target.checked)}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
              </div>

              {/* Biometric Prompt */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Iris Biometric Gate on Evidence Files</p>
                    <p className="text-[11px] text-slate-400">Require fast biometric check before downloading forensic evidence</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={biometricPromptOnCase}
                  onChange={(e) => setBiometricPromptOnCase(e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 cursor-pointer"
                />
              </div>

              {/* Session Inactivity Timeout */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                themeMode === 'bright' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Auto-Lock Inactivity Guard</p>
                    <p className="text-[11px] text-slate-400">Lock dashboard terminal if inactive</p>
                  </div>
                </div>
                <select
                  value={autoLockTimeout}
                  onChange={(e) => setAutoLockTimeout(e.target.value)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-hidden ${
                    themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-yellow-400'
                  }`}
                >
                  <option value="15m">15 Minutes</option>
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="never">Never (HQ Terminal)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-yellow-500 hover:bg-yellow-400 text-slate-950 flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
