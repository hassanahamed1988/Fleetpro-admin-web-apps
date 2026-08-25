import { ActionButton } from "./ActionButton";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Shield, Lock, Mail, ArrowRight, UserCheck, Crown, Eye, EyeOff, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { User, ThemeColor } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { FloatingInput } from './FloatingInput';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  themeColor: ThemeColor;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLoginSuccess, themeColor }) => {
  const { t } = useLanguage();
  
  const [selectedRole, setSelectedRole] = useState<'Admin Owner' | 'Super Admin' | 'Admin'>('Admin Owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [requires2fa, setRequires2fa] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  const themePrimaryButton = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
    red: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20',
  };

  const handleRolePresetSelect = (role: 'Admin Owner' | 'Super Admin' | 'Admin') => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'Admin Owner') {
      setEmail('adminownerhassan@gmail.com');
      setPassword('admin');
    } else if (role === 'Super Admin') {
      setEmail('admin@fleetpro.com');
      setPassword('admin123456');
    } else {
      const match = users.find(u => u.role === 'Admin') || users[0];
      setEmail(match.email);
      setPassword('admin123456');
    }
  };

  const handleQuickAdminOwnerLogin = async () => {
    if (requires2fa) {
       handleFormSubmit({ preventDefault: () => {} } as React.FormEvent);
       return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const trustedDeviceToken = localStorage.getItem('fleetpro_device_token') || undefined;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: 'adminownerhassan@gmail.com', 
          password: 'admin',
          trustedDeviceToken
        }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        if (data.newDeviceToken) {
          localStorage.setItem('fleetpro_device_token', data.newDeviceToken);
        }
        onLoginSuccess(data.user);
      } else if (data.requires2fa) {
        setRequires2fa(true);
        setEmail('adminownerhassan@gmail.com');
        setPassword('admin');
      } else {
        setErrorMsg(data.error || 'Quick login failed.');
      }
    } catch (e) {
      setIsLoading(false);
      setErrorMsg('Server connection error.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const trustedDeviceToken = localStorage.getItem('fleetpro_device_token') || undefined;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: email.trim(), 
          password, 
          totpCode: requires2fa ? totpCode.trim() : undefined,
          trustedDeviceToken
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.success) {
        if (data.newDeviceToken) {
          localStorage.setItem('fleetpro_device_token', data.newDeviceToken);
        }
        onLoginSuccess(data.user);
      } else if (data.requires2fa) {
        setRequires2fa(true);
      } else {
        setErrorMsg(data.error || 'Invalid User ID / Email or Password.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Server connection error.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e6e6e6] text-zinc-800 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Top Header & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/80 border border-zinc-200 text-indigo-600 mb-3.5 shadow-sm">
            <Crown className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
            FLEETPRO MANAGEMENT
          </h1>
          <p className="text-xs text-zinc-500 mt-2 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Admin Owner & Executive Control Portal</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] space-y-6">
          
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Select Role Identity (রোল সিলেক্ট করুন)
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 p-1 rounded-2xl border border-zinc-200/50">
              {(['Admin Owner', 'Super Admin', 'Admin'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRolePresetSelect(role)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                    selectedRole === role
                      ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50/50'
                  }`}
                >
                  {role === 'Admin Owner' ? 'Admin Owner' : role}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {requires2fa && (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 mb-4 animate-in fade-in slide-in-from-top-4">
                <label className="block text-xs font-bold text-indigo-600 mb-2 text-center">
                  2FA Enabled. Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 rounded-[8px] bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}

            <div className={`space-y-4.5 ${requires2fa ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <FloatingInput
                  type="email"
                  required
                  disabled={requires2fa}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label={t('Email Address')}
                  themeColor="blue"
                  icon={<Mail className="w-5 h-5" />}
                />
              </div>

              <div>
                <FloatingInput
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={requires2fa}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  label={t('Password')}
                  themeColor="blue"
                  icon={<Lock className="w-5 h-5" />}
                  rightElement={
                    <button
                      type="button"
                      disabled={requires2fa}
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-400 hover:text-zinc-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-500 hover:text-zinc-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 bg-white text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember Session</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-bold cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot User ID / Password?</span>
              </button>
            </div>

            <ActionButton
              type="submit"
              isLoading={isLoading}
              disabled={requires2fa && totpCode.length !== 6}
              actionType="login"
              className="w-full h-11 rounded-[8px] font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <UserCheck className="w-4 h-4" />
              <span>{requires2fa ? 'Verify 2FA & Login' : `Login to Dashboard (${selectedRole})`}</span>
            </ActionButton>
          </form>

          {/* Role Access Scope Info */}
          <div className="p-3 rounded-[8px] bg-zinc-50 border border-zinc-200/60 text-[11px] text-zinc-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Owner Privilege Scope:</span>
            </div>
            <p className="pl-5 text-zinc-500">
              • Access to User & Admin Accounts Management<br />
              • Vehicle & Driver data remain strictly hidden
            </p>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="text-center mt-6 text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>256-bit Encrypted Session & Audit Monitored</span>
        </div>
      </motion.div>

      {/* Forgot User ID / Password Modal */}
      {showForgotModal && (
        <ForgotPasswordModal
          onClose={() => setShowForgotModal(false)}
          onSuccess={(emailReset) => {
            setShowForgotModal(false);
            setErrorMsg(`✓ Account credentials reset successfully for ${emailReset}. You may now login.`);
            setEmail(emailReset);
          }}
        />
      )}
    </div>
  );
};
