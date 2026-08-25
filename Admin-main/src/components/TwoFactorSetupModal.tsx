import { ActionButton } from "./ActionButton";
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Smartphone, Key, CheckCircle, AlertCircle, Copy, Check, Lock } from 'lucide-react';
import { User, ThemeColor } from '../types';

interface TwoFactorSetupModalProps {
  user: User;
  onComplete: (user: User) => void;
  themeColor: ThemeColor;
  isMandatory?: boolean;
  onClose?: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  user,
  onComplete,
  themeColor,
  isMandatory = true,
  onClose,
}) => {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch2FaSetup();
  }, [user]);

  const fetch2FaSetup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.success) {
        setSecret(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        setErrorMsg('Failed to initialize 2FA key. Please try again.');
      }
    } catch (e) {
      setErrorMsg('Network error connecting to auth server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Google Authenticator code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/verify-and-enable-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, secret, totpCode: totpCode.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.newDeviceToken) {
          localStorage.setItem('fleetpro_device_token', data.newDeviceToken);
        }
        const updatedUser: User = {
          ...user,
          is2faEnabled: true,
          is2faSetupRequired: false,
        };
        onComplete(updatedUser);
      } else {
        setErrorMsg(data.error || 'Invalid 2FA code. Please check your Google Authenticator app.');
      }
    } catch (e) {
      setErrorMsg('Server verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100 relative"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isMandatory ? 'Mandatory Google Authenticator Setup' : 'Enable Google Authenticator (2FA)'}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            {isMandatory
              ? 'Security Policy requires Google Authenticator 2FA setup before accessing the admin portal.'
              : 'Protect your Admin account with 6-digit Time-based One-Time Passwords (TOTP).'}
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Generating secure 2FA QR Code & secret...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1 & 2 Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
              <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-md border border-zinc-200">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-36 h-36 object-contain" />
                ) : (
                  <Smartphone className="w-24 h-24 text-zinc-400" />
                )}
                <span className="text-[10px] text-zinc-600 font-bold mt-1">Scan with Google Authenticator</span>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Install <b>Google Authenticator</b> on your Android / iOS phone.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Scan QR Code or enter secret key manually:</span>
                </div>

                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-1">
                  <code className="text-[11px] text-amber-400 font-mono break-all font-bold select-all">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
                    title="Copy Secret"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 Code Submission Form */}
            <form onSubmit={handleVerify} className="space-y-4 pt-2">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 text-center">
                  Enter 6-Digit Verification Code from Authenticator App
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 px-4 rounded-[8px] bg-zinc-950 border border-indigo-500/50 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                {!isMandatory && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                )}
                <ActionButton
                  type="submit"
                  isLoading={isVerifying}
                  disabled={totpCode.length !== 6}
                  actionType="verify"
                  loadingText="Verifying & Enabling..."
                  className={`py-3 rounded-[8px] font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 ${
                    !isMandatory && onClose ? 'w-1/2' : 'w-full'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify & Enable Google 2FA</span>
                </ActionButton>
              </div>
            </form>
          </div>
        )}

        <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>TOTP secret is stored encrypted in backend database</span>
        </div>
      </motion.div>
    </div>
  );
};
