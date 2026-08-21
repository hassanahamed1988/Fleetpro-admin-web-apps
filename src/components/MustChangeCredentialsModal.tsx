import { ActionButton } from "./ActionButton";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, UserCheck, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface MustChangeCredentialsModalProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export const MustChangeCredentialsModal: React.FC<MustChangeCredentialsModalProps> = ({
  user,
  onComplete,
}) => {
  const [username, setUsername] = useState(user.username || user.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('User ID / Username is required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/update-initial-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newUsername: username.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const updatedUser: User = {
          ...user,
          username: username.trim(),
          mustChangeCredentials: false,
        };
        onComplete(updatedUser);
      } else {
        setErrorMsg(data.error || 'Failed to update credentials.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Mandatory Credential Change Required
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            As a newly registered Admin account created by the Owner, you must set your permanent User ID and Password before accessing FleetPro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Permanent User ID / Username *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin_john"
              className="w-full px-4 py-2.5 rounded-[8px] bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Set New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-[8px] bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-[8px] bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <ActionButton
            type="submit"
            isLoading={isLoading}
            actionType="save"
            className="w-full py-3 rounded-[8px] font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Save New Credentials & Proceed</span>
          </ActionButton>
        </form>

        <div className="text-[11px] text-zinc-500 text-center">
          Temporary password will be invalidated immediately.
        </div>
      </motion.div>
    </div>
  );
};
