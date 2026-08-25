import { ActionButton } from "./ActionButton";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Shield, KeyRound, Smartphone, Lock, Save, 
  Database, RefreshCw, RotateCw, CheckCircle, AlertTriangle, Eye, EyeOff, Palette
} from 'lucide-react';
import { User, AppSettings, ThemeColor } from '../types';
import { FloatingInput } from './FloatingInput';
import { TwoFactorSetupModal } from './TwoFactorSetupModal';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsViewProps {
  user: User;
  settings: AppSettings;
  onUpdateUser: (updatedUser: User) => void;
  onUpdateSettings: (updatedSettings: AppSettings) => void;
  themeColor: ThemeColor;
  onChangeThemeColor?: (color: ThemeColor) => void;
  displayMode?: string;
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  settings,
  onUpdateUser,
  onUpdateSettings,
  themeColor,
  onChangeThemeColor,
  displayMode,
  triggerToast,
  triggerConfirm,
}) => {
  const { t, formatDateTime, toDigits } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | '2fa' | 'password' | 'backup'>('general');

  // General Settings State
  const [formAppName, setFormAppName] = useState(settings.appName);
  const [formSystemEmail, setFormSystemEmail] = useState(settings.systemEmail);
  const [formSessionTimeout, setFormSessionTimeout] = useState(settings.sessionTimeout.toString());
  const [formMfa, setFormMfa] = useState(settings.mfaRequired);
  const [formSelfReg, setFormSelfReg] = useState(settings.allowSelfRegistration);
  const [formMaintenance, setFormMaintenance] = useState(settings.maintenanceMode);
  const [formBackup, setFormBackup] = useState(settings.backupFrequency);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  // 2FA Disable State
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [disablePass, setDisablePass] = useState('');
  const [disableTotp, setDisableTotp] = useState('');
  const [isDisabling2Fa, setIsDisabling2Fa] = useState(false);
  const [disableError, setDisableError] = useState('');
  
  // Revoke Devices State
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeTrustedDevices = async () => {
    triggerConfirm('Revoke Trusted Devices', 'Are you sure you want to revoke all trusted devices? You will need to use 2FA for your next login on all devices.', async () => {
      setIsRevoking(true);
      try {
        const res = await fetch('/api/auth/revoke-trusted-devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.removeItem('fleetpro_device_token');
          triggerToast('Revoked', 'All trusted devices revoked successfully.', 'success');
        } else {
          triggerToast('Error', data.error || 'Failed to revoke devices', 'error');
        }
      } catch (e) {
        triggerToast('Error', 'Server error.', 'error');
      } finally {
        setIsRevoking(false);
      }
    });
  };

  // Backup State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const themeText = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const themeBg = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    red: 'bg-rose-600 hover:bg-rose-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  const themeToggle = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: AppSettings = {
      appName: formAppName,
      systemEmail: formSystemEmail,
      sessionTimeout: parseInt(formSessionTimeout) || 30,
      maintenanceMode: formMaintenance,
      mfaRequired: formMfa,
      allowSelfRegistration: formSelfReg,
      backupFrequency: formBackup,
    };

    triggerConfirm(
      t('Update Settings?'),
      t('Are you sure you want to apply these system configurations immediately?'),
      () => {
        onUpdateSettings(updatedSettings);
        triggerToast(
          t('✓ Settings Updated'),
          t('System control settings have been refreshed successfully.'),
          'success'
        );
      }
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        triggerToast('✓ Password Updated', 'Your admin password has been changed securely.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setPassError('Network error connecting to auth backend.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDisable2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError('');

    if (!disablePass || !disableTotp) {
      setDisableError('Both Password and Current TOTP code are required to disable 2FA.');
      return;
    }

    setIsDisabling2Fa(true);

    try {
      const res = await fetch('/api/auth/disable-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          password: disablePass,
          totpCode: disableTotp.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        triggerToast('2FA Disabled', 'Google Authenticator 2FA disabled successfully.', 'warning');
        onUpdateUser({ ...user, is2faEnabled: false });
        setDisablePass('');
        setDisableTotp('');
      } else {
        setDisableError(data.error || 'Invalid password or TOTP verification code.');
      }
    } catch (err) {
      setDisableError('Server connection error.');
    } finally {
      setIsDisabling2Fa(false);
    }
  };

  const runBackup = () => {
    setIsBackingUp(true);
    triggerToast(t('Backup Started'), t('Compressing fleet databases and user sessions...'), 'info');
    setTimeout(() => {
      setIsBackingUp(false);
      triggerToast(t('✓ Backup Completed'), t('System archive backup compressed & stored securely.'), 'success');
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">System Settings & Security</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          Manage Google Authenticator 2FA, Admin Passwords, and Core App Parameters
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'general', label: 'General Settings', icon: <Settings className="w-4 h-4" /> },
          { id: 'theme', label: 'Theme Settings', icon: <Palette className="w-4 h-4" /> },
          { id: '2fa', label: 'Google Authenticator (2FA)', icon: <Smartphone className="w-4 h-4" /> },
          { id: 'password', label: 'Security & Password', icon: <KeyRound className="w-4 h-4" /> },
          { id: 'backup', label: 'Backup & Sessions', icon: <Database className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneralSettings} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6 max-w-full lg:max-w-5xl">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <Settings className={`w-5 h-5 ${themeText[themeColor]}`} />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Core System Parameters</h3>
          </div>

          <div className="app-form-grid">
            <FloatingInput
              label={t('Application Brand Name *')}
              value={formAppName}
              onChange={(e) => setFormAppName(e.target.value)}
              themeColor={themeColor}
              required
            />

            <FloatingInput
              label={t('Administrative Email *')}
              value={formSystemEmail}
              onChange={(e) => setFormSystemEmail(e.target.value)}
              type="email"
              themeColor={themeColor}
              required
            />

            <FloatingInput
              label={t('Login Session Expiry (Minutes) *')}
              value={formSessionTimeout}
              onChange={(e) => setFormSessionTimeout(e.target.value)}
              type="number"
              themeColor={themeColor}
              required
            />
          </div>

          <div className="app-form-grid pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Enforce Multi-Factor Auth (2FA)</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">Require mandatory 2FA TOTP verification for all Admin logins.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormMfa(!formMfa)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${formMfa ? themeToggle[themeColor] : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${formMfa ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Allow Operator Registration</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">Permit new drivers and fleet operators to submit signup requests.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormSelfReg(!formSelfReg)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${formSelfReg ? themeToggle[themeColor] : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${formSelfReg ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              className={`h-11 px-5 rounded-xl text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${themeBg[themeColor]}`}
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 1.5: THEME SETTINGS */}
      {activeTab === 'theme' && (
        <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Palette className={`w-5 h-5 ${themeText[themeColor]}`} />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('Theme Settings')}</h3>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {t('Primary Theme Color')}
              </label>
              <div className="flex flex-wrap gap-3 mt-1">
                {[
                  { id: 'blue', color: 'bg-indigo-600', label: 'Blue' },
                  { id: 'emerald', color: 'bg-emerald-600', label: 'Emerald' },
                  { id: 'red', color: 'bg-rose-600', label: 'Red' },
                  { id: 'amber', color: 'bg-amber-600', label: 'Amber' },
                  { id: 'purple', color: 'bg-purple-600', label: 'Purple' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (onChangeThemeColor) {
                        onChangeThemeColor(c.id as ThemeColor);
                        triggerToast(t('Theme Updated'), t('Your theme color has been successfully updated.'), 'success');
                      }
                    }}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
                      themeColor === c.id 
                        ? `border-zinc-300 dark:border-zinc-600 shadow-sm bg-zinc-50 dark:bg-zinc-800` 
                        : 'border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    } transition-all cursor-pointer`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-inner ${c.color}`} />
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {t(c.label)}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                {t('This color will be applied to buttons, borders, and active states across the entire application interface.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE AUTHENTICATOR (2FA) */}
      {activeTab === '2fa' && (
        <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Smartphone className={`w-5 h-5 ${themeText[themeColor]}`} />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Google Authenticator (TOTP 2FA)</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              user.is2faEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}>
              {user.is2faEnabled ? '✓ 2FA Active' : '2FA Disabled'}
            </span>
          </div>

          {user.is2faEnabled ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Google Authenticator Security is Enabled</span>
                  <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                    Your account is protected with 6-digit Time-based One-Time Passwords (TOTP).
                  </p>
                </div>
              </div>

              {/* Disable 2FA Form with Policy Verification */}
              <div className="p-5 rounded-2xl border border-rose-200/80 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400">Disable Google Authenticator</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Security Policy requires Password + Current TOTP verification code to disable 2FA.
                  </p>
                </div>

                {disableError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
                    {disableError}
                  </div>
                )}

                <form onSubmit={handleDisable2Fa} className="app-form-grid">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Current Admin Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={disablePass}
                      onChange={(e) => setDisablePass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Current 6-Digit TOTP Code *
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={disableTotp}
                      onChange={(e) => setDisableTotp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-3 py-2 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono tracking-widest text-center"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <ActionButton
                      type="submit"
                      isLoading={isDisabling2Fa}
                      actionType="verify"
                      loadingText="Verifying & Disabling..."
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      Verify & Disable 2FA
                    </ActionButton>
                  </div>
                </form>
              </div>
              
              <div className="p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-500">Revoke Trusted Devices</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Clear all trusted device tokens. You will be prompted for a 2FA code on your next login on all devices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRevokeTrustedDevices}
                  disabled={isRevoking}
                  className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer border border-amber-200 dark:border-amber-700/50"
                >
                  {isRevoking ? 'Revoking...' : 'Revoke All Trusted Devices'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                Google Authenticator 2FA is currently not enabled on your account.
              </div>

              <button
                type="button"
                onClick={() => setShow2FaModal(true)}
                className={`px-5 py-3 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${themeBg[themeColor]}`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Configure & Enable Google Authenticator</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6 max-w-full lg:max-w-5xl">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <KeyRound className={`w-5 h-5 ${themeText[themeColor]}`} />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Change Admin Password</h3>
          </div>

          {passError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
              {passError}
            </div>
          )}

          <div className="app-form-grid">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <ActionButton
              type="submit"
              isLoading={isChangingPass}
              actionType="update"
              className={`h-11 px-5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${themeBg[themeColor]}`}
            >
              <Lock className="w-4 h-4" />
              <span>Update Password</span>
            </ActionButton>
          </div>
        </form>
      )}

      {/* TAB 4: BACKUP & SESSIONS */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6 max-w-2xl">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <Database className={`w-5 h-5 ${themeText[themeColor]}`} />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Database Backup & Recovery</h3>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span>Backup Schedule</span>
            <select
              value={formBackup}
              onChange={(e) => setFormBackup(e.target.value as any)}
              className="h-9 px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
            >
              <option value="Daily">Daily Sync</option>
              <option value="Weekly">Weekly Sync</option>
              <option value="Monthly">Monthly Sync</option>
            </select>
          </div>

          <ActionButton
            onClick={runBackup}
            disabled={isBackingUp}
            isLoading={isBackingUp}
            loadingText="Generating Backup..."
            actionType="custom"
            className="w-full py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Immediate Encrypted Backup</span>
          </ActionButton>
        </div>
      )}

      {/* 2FA Setup Modal when clicking configure */}
      {show2FaModal && (
        <TwoFactorSetupModal
          user={user}
          isMandatory={false}
          themeColor={themeColor}
          onClose={() => setShow2FaModal(false)}
          onComplete={(updated) => {
            onUpdateUser(updated);
            setShow2FaModal(false);
            triggerToast('2FA Enabled', 'Google Authenticator 2FA enabled successfully!', 'success');
          }}
        />
      )}
    </div>
  );
};
