import { ActionButton } from "./ActionButton";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, ShieldCheck, KeyRound, AlertCircle, ArrowRight, CheckCircle2, X, User, Lock } from 'lucide-react';
import { FloatingInput } from './FloatingInput';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');

  const [matchedUserId, setMatchedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Verify Email + Phone
  const handleVerifyAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !phone.trim()) {
      setErrorMsg('Please enter both registered Email Address and Mobile Number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-verify-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setMatchedUserId(data.userId);
        setNewUsername(data.userEmail);
        setStep(2); // Proceed to mandatory 2FA TOTP verification
      } else {
        setErrorMsg(data.error || 'No matching Admin account found for provided Email and Mobile Number.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify TOTP Code
  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim().length !== 6) {
      setErrorMsg('Please enter a 6-digit verification code from Google Authenticator.');
      return;
    }
    setErrorMsg('');
    setStep(3); // Proceed to Set New Credentials
  };

  // Step 3: Set New User ID & Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: matchedUserId,
          totpCode: totpCode.trim(),
          newPassword,
          newUsername: newUsername.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess(email);
      } else {
        setErrorMsg(data.error || 'Password reset failed. Please check TOTP code.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-900 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-1">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900">
            Account Credentials Recovery
          </h2>
          <p className="text-xs text-zinc-500">
            {step === 1 && 'Step 1: Match Registered Email & Mobile Number'}
            {step === 2 && 'Step 2: Mandatory Google Authenticator Verification'}
            {step === 3 && 'Step 3: Set New User ID & Password'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-indigo-600' : 'bg-zinc-200'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleVerifyAccount} className="space-y-4">
            <div>
              <FloatingInput
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Registered Email Address *"
                icon={<Mail className="w-5 h-5" />}
                themeColor="blue"
              />
            </div>

            <div>
              <FloatingInput
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                label="Registered Mobile Phone Number *"
                icon={<Phone className="w-5 h-5" />}
                themeColor="blue"
              />
            </div>

            <ActionButton
              type="submit"
              isLoading={isLoading}
              actionType="verify"
              className="w-full h-11 rounded-[8px] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
            >
              <span>Verify Account Details</span>
              <ArrowRight className="w-4 h-4" />
            </ActionButton>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyTotp} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Email & Mobile Verified! Enter 2FA code to proceed.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1.5 text-center">
                Enter 6-Digit Google Authenticator TOTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 rounded-[8px] bg-zinc-50 border border-indigo-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={totpCode.length !== 6}
              className="w-full h-11 rounded-[8px] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
            >
              <span>Verify TOTP Code</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <FloatingInput
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                label="New User ID / Username (Optional)"
                icon={<User className="w-5 h-5" />}
                themeColor="blue"
              />
            </div>

            <div>
              <FloatingInput
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                label="Set New Password *"
                icon={<Lock className="w-5 h-5" />}
                themeColor="blue"
              />
            </div>

            <div>
              <FloatingInput
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label="Confirm New Password *"
                icon={<Lock className="w-5 h-5" />}
                themeColor="blue"
              />
            </div>

            <ActionButton
              type="submit"
              isLoading={isLoading}
              actionType="save"
              className="w-full h-11 rounded-[8px] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Reset Credentials & Save</span>
            </ActionButton>
          </form>
        )}
      </motion.div>
    </div>
  );
};
