import { ActionButton } from "./ActionButton";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Shield, Database, Clock, Key, Save, 
  RotateCw, RefreshCw, AlertTriangle, Play, HelpCircle 
} from 'lucide-react';
import { AppSettings } from '../types';
import { FloatingInput } from './FloatingInput';
import { useLanguage } from '../contexts/LanguageContext';

interface ApplicationControlViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const ApplicationControlView: React.FC<ApplicationControlViewProps> = ({
  settings,
  onUpdateSettings,
  themeColor,
  triggerToast,
  triggerConfirm,
}) => {
  const { t, formatDateTime, toDigits } = useLanguage();
  const [formAppName, setFormAppName] = useState(settings.appName);
  const [formSystemEmail, setFormSystemEmail] = useState(settings.systemEmail);
  const [formSessionTimeout, setFormSessionTimeout] = useState(settings.sessionTimeout.toString());
  const [formMfa, setFormMfa] = useState(settings.mfaRequired);
  const [formSelfReg, setFormSelfReg] = useState(settings.allowSelfRegistration);
  const [formMaintenance, setFormMaintenance] = useState(settings.maintenanceMode);
  const [formBackup, setFormBackup] = useState(settings.backupFrequency);

  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleSaveSettings = (e: React.FormEvent) => {
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
      async () => {
        setIsProcessing(true);
        await new Promise(r => setTimeout(r, 600));
        onUpdateSettings(updatedSettings);
        setIsProcessing(false);
        triggerToast(
          t('✓ Settings Updated'),
          t('System control settings have been refreshed successfully.'),
          'success'
        );
      }
    );
  };

  const runBackup = () => {
    setIsBackingUp(true);
    triggerToast(
      t('Backup Started'),
      t('Compressing fleet databases and user sessions...'),
      'info'
    );
    setTimeout(() => {
      setIsBackingUp(false);
      triggerToast(
        t('✓ Backup Completed'),
        t('System archive backup compressed & stored securely.'),
        'success'
      );
    }, 2500);
  };

  const runRestore = () => {
    triggerConfirm(
      t('Restore Database?'),
      t('WARNING: Restoring the system to the latest snapshot will overwrite current session records. Do you wish to proceed?'),
      () => {
        setIsRestoring(true);
        triggerToast(
          t('Database Restoring'),
          t('Clearing caches and retrieving snapshot archives...'),
          'info'
        );
        setTimeout(() => {
          setIsRestoring(false);
          triggerToast(
            t('✓ System Restored'),
            t('Database snapshot recovered to stable state (2026-08-16 04:00:00).'),
            'success'
          );
        }, 2000);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t('app_control.title')}</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {t('app_control.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <Settings className={`w-5 h-5 ${themeText[themeColor]}`} />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('Core System Parameters')}</h3>
          </div>

          <div className="space-y-4">
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

          {/* Core System Switches */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{t('Enforce Multi-Factor Auth (MFA)')}</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">{t('Require high-clearance admin logins to submit a code verification.')}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormMfa(!formMfa)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${formMfa ? themeToggle[themeColor] : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${formMfa ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{t('Allow Operator Registration')}</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">{t('Permit new drivers and fleet operators to submit signup requests from login page.')}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormSelfReg(!formSelfReg)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${formSelfReg ? themeToggle[themeColor] : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${formSelfReg ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
              <div>
                <span className="text-xs font-bold text-rose-500">{t('System Maintenance Lock')}</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">{t('Locks out general operators and redirects traffic to maintenance notice.')}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormMaintenance(!formMaintenance)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${formMaintenance ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${formMaintenance ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <ActionButton
              type="submit"
              isLoading={isProcessing}
              actionType="save"
              className={`h-11 px-5 rounded-[8px] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all ${themeBg[themeColor]}`}
            >
              <Save className="w-4 h-4" />
              {t('Save App Configurations')}
            </ActionButton>
          </div>
        </form>

        {/* Database backup and Security Controls */}
        <div className="space-y-6">
          
          {/* Database panel */}
          <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between h-fit gap-5">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <Database className={`w-5 h-5 ${themeText[themeColor]}`} />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('Backup & Recovery')}</h3>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t('Export complete backups containing user records, vehicle profiles, and audit registries. Backups are stored in compressed formats.')}
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                <span>{t('Frequency')}</span>
                <select
                  value={formBackup}
                  onChange={(e) => setFormBackup(e.target.value as AppSettings['backupFrequency'])}
                  className="h-9 px-2.5 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-xs"
                >
                  <option value="Daily">{t('Daily Sync')}</option>
                  <option value="Weekly">{t('Weekly Sync')}</option>
                  <option value="Monthly">{t('Monthly Sync')}</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/10 flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">{t('Latest snapshot')}</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">{formatDateTime('2026-08-16 04:00:00')}</span>
                </div>
                <span className="font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded">{toDigits('4.2')} {t('MB')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <ActionButton
                onClick={runBackup}
                disabled={isBackingUp || isRestoring}
                isLoading={isBackingUp}
                loadingText={t('Backing Up')}
                actionType="custom"
                className="h-10 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('Backup')}
              </ActionButton>

              <ActionButton
                onClick={runRestore}
                disabled={isBackingUp || isRestoring}
                isLoading={isRestoring}
                loadingText={t('Restoring')}
                actionType="custom"
                className="h-10 rounded-[8px] border border-rose-100 dark:border-rose-950/40 bg-rose-50/20 text-xs font-semibold text-rose-500 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                {t('Restore')}
              </ActionButton>
            </div>
          </div>

          {/* Session Log / Session management */}
          <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between h-fit gap-4">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <Clock className={`w-5 h-5 ${themeText[themeColor]}`} />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('Active Admin Sessions')}</h3>
            </div>

            <div className="space-y-3">
              <div className="text-xs p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100 block">mahmud@fleetpro.com</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{t('IP: {ip} (This Browser)', { ip: toDigits('103.114.172.5') })}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">{t('Active')}</span>
              </div>

              <div className="text-xs p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">anika@fleetpro.com</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{t('IP: {ip} (Chrome macOS)', { ip: toDigits('103.114.172.8') })}</span>
                </div>
                <button 
                  onClick={() => triggerToast(
                    t('Session Terminated'),
                    t('Admin session has been terminated remotely.'),
                    'info'
                  )}
                  className="text-[10px] text-rose-500 hover:underline font-bold"
                >
                  {t('Terminate')}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
