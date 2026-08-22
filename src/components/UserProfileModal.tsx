/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Shield, Sliders, Lock, History, Smartphone, 
  CheckCircle2, AlertCircle, Clock, XCircle, RefreshCw, 
  Trash2, Plus, Laptop, Tablet, Globe, Check, Eye, EyeOff, 
  Copy, Key, ShieldCheck, ShieldAlert, Cpu, Database, 
  Calendar, Phone, Mail, Building, MapPin, Radio, Wifi,
  LogOut, AlertTriangle, ArrowRight
} from 'lucide-react';
import { User as UserType, UserRole, UserStatus, UserDeviceRecord, UserLoginHistoryRecord } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void | Promise<void>;
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

type TabType = 'personal' | 'access' | 'control' | 'security' | 'history' | 'devices';

// Feature ID Mapping for Mobile App features
export const FEATURE_MAP: Record<string, { id: string; label: string; desc: string; category: string }> = {
  '1': { id: '1', label: 'Dashboard Overview', desc: 'Real-time fleet metrics and analytics', category: 'Core' },
  '2': { id: '2', label: 'Live GPS Tracking', desc: 'Real-time vehicle map tracking', category: 'Fleet' },
  '3': { id: '3', label: 'Vehicle Dispatch', desc: 'Assign & manage trip orders', category: 'Fleet' },
  '4': { id: '4', label: 'Driver Management', desc: 'Driver duty & assignment profiles', category: 'Fleet' },
  '5': { id: '5', label: 'Billing & Invoice', desc: 'Generate customer invoices and receipts', category: 'Finance' },
  '6': { id: '6', label: 'Fuel Management', desc: 'Monitor fuel usage, receipts and logs', category: 'Fleet' },
  '7': { id: '7', label: 'Maintenance Logs', desc: 'Service schedules and repair tickets', category: 'Fleet' },
  '8': { id: '8', label: 'Chat & Messaging', desc: 'In-app driver and operator messaging', category: 'Communication' },
  '9': { id: '9', label: 'Reports & Exports', desc: 'Export PDF, Excel and CSV reports', category: 'Core' },
  '10': { id: '10', label: 'Client Alerts', desc: 'Client push notifications & SMS', category: 'Communication' },
  '11': { id: '11', label: 'Geofencing Alerts', desc: 'Virtual boundary enter/exit notifications', category: 'Fleet' },
  '12': { id: '12', label: 'Route Optimization', desc: 'AI-assisted trip routing & speedways', category: 'Fleet' },
  '13': { id: '13', label: 'Speed Monitoring', desc: 'Over-speed alarms and driver scoring', category: 'Fleet' },
  '14': { id: '14', label: 'Document Wallet', desc: 'Digital vehicle papers and licenses', category: 'Core' },
  '15': { id: '15', label: 'Trip History', desc: 'Historical playback and route logs', category: 'Fleet' },
  '16': { id: '16', label: 'Expense Tracker', desc: 'Toll, food, parking & trip costs', category: 'Finance' },
  '17': { id: '17', label: 'Push Notifications', desc: 'System push notifications to device', category: 'Core' },
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  triggerToast,
  triggerConfirm,
}) => {
  const { t, formatDate, toDigits } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic column spanning based on length of value
  const getDynamicColSpan = (value: any) => {
    const valStr = String(value || '').trim();
    if (valStr.length > 25) {
      return 'col-span-1 sm:col-span-4';
    }
    if (valStr.length > 15) {
      return 'col-span-1 sm:col-span-2';
    }
    return 'col-span-1';
  };

  // Security tab state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Device tab new device state
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<UserDeviceRecord['deviceType']>('Mobile (Android)');
  const [newDeviceIp, setNewDeviceIp] = useState('103.145.72.24');

  // History search filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('All');

  // Initialize and ensure devices array exists
  const userDevices = useMemo<UserDeviceRecord[]>(() => {
    if (user.devices && Array.isArray(user.devices) && user.devices.length > 0) {
      return user.devices;
    }
    const safeId = String(user.id || '0000');
    const safeName = user.name || 'User';
    // Fallback seed devices based on user properties
    const defaultDevices: UserDeviceRecord[] = [
      {
        id: `dev-${safeId}-1`,
        deviceName: `${safeName}'s Primary Phone (Galaxy S24)`,
        deviceType: 'Mobile (Android)',
        deviceIdentifier: `ANDR-${safeId.slice(-4).toUpperCase()}-9482`,
        ipAddress: '103.145.72.19',
        location: 'Dhaka, BD',
        firstLogin: user.joinDate || '2025-01-15T09:00:00Z',
        lastActive: user.lastLogin && user.lastLogin !== 'Never' ? user.lastLogin : new Date().toISOString(),
        status: 'Approved',
        browserOrApp: 'FleetPro Android v2.4.1',
      },
      {
        id: `dev-${safeId}-2`,
        deviceName: 'Workstation Chrome (Windows 11)',
        deviceType: 'Desktop (Web)',
        deviceIdentifier: `WIN-${safeId.slice(-4).toUpperCase()}-8831`,
        ipAddress: '103.145.72.50',
        location: 'Dhaka HQ',
        firstLogin: user.joinDate || '2025-01-16T11:20:00Z',
        lastActive: user.lastLogin && user.lastLogin !== 'Never' ? user.lastLogin : new Date().toISOString(),
        status: user.status === 'Active' ? 'Approved' : 'Pending',
        browserOrApp: 'Chrome 122.0 / Windows',
      },
    ];
    return defaultDevices;
  }, [user]);

  // Initialize and ensure login history array exists
  const userLoginHistory = useMemo<UserLoginHistoryRecord[]>(() => {
    if (user.loginHistory && Array.isArray(user.loginHistory) && user.loginHistory.length > 0) {
      return user.loginHistory;
    }
    const safeId = String(user.id || '0000');
    const hasLastLogin = user.lastLogin && user.lastLogin !== 'Never';
    const lastLoginDate = hasLastLogin && typeof user.lastLogin === 'string' && user.lastLogin.includes('T') 
      ? user.lastLogin.split('T')[0] 
      : '2025-02-17';

    const defaultHistory: UserLoginHistoryRecord[] = [
      {
        id: `log-${safeId}-1`,
        timestamp: hasLastLogin && typeof user.lastLogin === 'string' ? user.lastLogin : new Date().toISOString(),
        date: lastLoginDate,
        time: '10:45 AM',
        deviceName: 'Galaxy S24 Ultra',
        deviceType: 'Mobile (Android)',
        ipAddress: '103.145.72.19',
        location: 'Dhaka, Bangladesh',
        status: 'Success',
        browserOrApp: 'FleetPro App v2.4.1',
      },
      {
        id: `log-${user.id}-2`,
        timestamp: '2025-02-16T08:30:00Z',
        date: '2025-02-16',
        time: '08:30 AM',
        deviceName: 'Workstation Chrome',
        deviceType: 'Desktop (Web)',
        ipAddress: '103.145.72.50',
        location: 'Dhaka HQ',
        status: 'Success',
        browserOrApp: 'Chrome 122.0',
      },
      {
        id: `log-${user.id}-3`,
        timestamp: '2025-02-14T22:15:00Z',
        date: '2025-02-14',
        time: '10:15 PM',
        deviceName: 'Unknown Device',
        deviceType: 'Mobile (Android)',
        ipAddress: '185.220.101.5',
        location: 'Frankfurt, Germany',
        status: 'Blocked',
        browserOrApp: 'Automated Agent',
      },
      {
        id: `log-${user.id}-4`,
        timestamp: '2025-02-10T14:10:00Z',
        date: '2025-02-10',
        time: '02:10 PM',
        deviceName: 'Galaxy S24 Ultra',
        deviceType: 'Mobile (Android)',
        ipAddress: '103.145.72.19',
        location: 'Dhaka, Bangladesh',
        status: 'Success',
        browserOrApp: 'FleetPro App v2.4.1',
      }
    ];
    return defaultHistory;
  }, [user]);

  // Safe User Updates Helper
  const handleUpdate = async (updates: Partial<UserType>, successMessage?: string) => {
    setIsSaving(true);
    try {
      const updatedUser: UserType = {
        ...user,
        ...updates,
        devices: updates.devices || user.devices || userDevices,
        loginHistory: updates.loginHistory || user.loginHistory || userLoginHistory,
      };
      await onUpdateUser(updatedUser);
      if (successMessage) {
        triggerToast(t('Success'), successMessage, 'success');
      }
    } catch (err) {
      console.error('Failed to update user profile', err);
      triggerToast(t('Error'), t('Failed to update user profile'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Device Management Actions
  const handleApproveDevice = (deviceId: string) => {
    const updatedDevices = userDevices.map(d => 
      d.id === deviceId ? { ...d, status: 'Approved' as const, lastActive: new Date().toISOString() } : d
    );
    const targetDev = userDevices.find(d => d.id === deviceId);
    const tokens = new Set<string>(user.trustedDeviceTokens || []);
    if (targetDev?.deviceIdentifier) {
      tokens.add(targetDev.deviceIdentifier);
    }
    handleUpdate({
      devices: updatedDevices,
      trustedDeviceTokens: Array.from(tokens),
    }, t('Device approved successfully! Trusted access granted.'));
  };

  const handleRevokeDevice = (deviceId: string) => {
    triggerConfirm(
      t('Revoke Device Access'),
      t('Are you sure you want to revoke access for this device? The active session will be invalidated immediately.'),
      () => {
        const updatedDevices = userDevices.map(d => 
          d.id === deviceId ? { ...d, status: 'Revoked' as const } : d
        );
        const targetDev = userDevices.find(d => d.id === deviceId);
        const tokens = (user.trustedDeviceTokens || []).filter(t => t !== targetDev?.deviceIdentifier);
        
        handleUpdate({
          devices: updatedDevices,
          trustedDeviceTokens: tokens,
        }, t('Device access revoked and session terminated.'));
      }
    );
  };

  const handleDeleteDevice = (deviceId: string) => {
    triggerConfirm(
      t('Delete Device Record'),
      t('Are you sure you want to permanently delete this device record?'),
      () => {
        const updatedDevices = userDevices.filter(d => d.id !== deviceId);
        handleUpdate({
          devices: updatedDevices,
        }, t('Device record removed successfully.'));
      }
    );
  };

  const handleRevokeAllOtherDevices = () => {
    triggerConfirm(
      t('Revoke All Other Devices'),
      t('Are you sure you want to revoke and terminate all sessions on all devices for this user?'),
      () => {
        const updatedDevices = userDevices.map(d => ({ ...d, status: 'Revoked' as const }));
        handleUpdate({
          devices: updatedDevices,
          trustedDeviceTokens: [],
        }, t('All device sessions revoked. User must re-authenticate.'));
      }
    );
  };

  const handleAddNewDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) {
      triggerToast(t('Error'), t('Device name is required'), 'warning');
      return;
    }
    const newRecord: UserDeviceRecord = {
      id: `dev-${user.id}-${Date.now()}`,
      deviceName: newDeviceName.trim(),
      deviceType: newDeviceType,
      deviceIdentifier: `DEV-${Date.now().toString(36).toUpperCase()}`,
      ipAddress: newDeviceIp.trim() || '103.145.72.1',
      location: 'Authorized Admin Setup',
      firstLogin: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'Approved',
      browserOrApp: 'Admin Provisioned',
    };
    const updatedDevices = [newRecord, ...userDevices];
    const tokens = new Set<string>(user.trustedDeviceTokens || []);
    tokens.add(newRecord.deviceIdentifier);

    handleUpdate({
      devices: updatedDevices,
      trustedDeviceTokens: Array.from(tokens),
    }, t('New trusted device registered successfully!'));
    setNewDeviceName('');
    setIsAddDeviceOpen(false);
  };

  // Password generator helper
  const handleGenerateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setConfirmPassword(pwd);
    setShowPassword(true);
    triggerToast(t('Password Generated'), t('Secure password generated. Make sure to copy it before saving.'), 'info');
  };

  const handleSavePassword = () => {
    if (!newPassword) {
      triggerToast(t('Error'), t('Please enter a new password'), 'warning');
      return;
    }
    if (newPassword.length < 6) {
      triggerToast(t('Error'), t('Password must be at least 6 characters long'), 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast(t('Error'), t('Passwords do not match'), 'error');
      return;
    }

    handleUpdate({
      password: newPassword,
      mustChangeCredentials: true,
    }, t('User password updated successfully! User will be prompted on next sign-in.'));
    setNewPassword('');
    setConfirmPassword('');
  };

  // Safe object renderer & helper
  const renderSafeValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      try {
        if (Array.isArray(val)) {
          return val.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
        }
        return Object.entries(val)
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
          .join(' | ');
      } catch (e) {
        return 'Object Data';
      }
    }
    return String(val);
  };

  const formatKeyName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  };

  // Filter dynamic/custom fields
  const additionalFields = useMemo(() => {
    const standardKeys = [
      'id', 'name', 'email', 'phone', 'role', 'status', 'department', 'joinDate', 
      'lastLogin', 'permissions', 'avatarUrl', 'username', 'mustChangeCredentials',
      'is2faEnabled', 'is2faSetupRequired', 'totpSecretEncrypted', 'passwordHash',
      'password', 'trustedDeviceTokens', 'features', 'allowedFeatures', 'dbSource',
      'devices', 'loginHistory', '__v', 'accountType', 'mobileModulePermissions',
      'firstName', 'lastName', 'dateOfBirth', 'nationality', 'gender', 'religion', 'profession', 'mobileCode',
      'documentId', 'documentIssueDate', 'documentExpiryDate',
      'country', 'region', 'city', 'policeStation', 'postOfficeName', 'postalCode', 'buildingNumber', 'zoneNumber', 'stateNumber', 'areaName'
    ];
    return Object.entries(user).filter(([k, v]) => {
      if (standardKeys.includes(k)) return false;
      if (v === null || v === undefined) return false;
      if (typeof v === 'string' && v.trim() === '') return false;
      if (typeof v === 'object' && Object.keys(v).length === 0) return false;
      return true;
    });
  }, [user]);

  // Extract Assigned Features
  const featuresList = useMemo<Array<{ id: string; label: string; allowed: boolean; desc: string; category: string }>>(() => {
    let rawAllowed: string[] = [];
    if (Array.isArray((user as any).features)) {
      rawAllowed = (user as any).features.map(String);
    } else if (typeof (user as any).features === 'object' && (user as any).features !== null) {
      rawAllowed = Object.entries((user as any).features)
        .filter(([_, allowed]) => !!allowed)
        .map(([name]) => String(name));
    } else if (Array.isArray((user as any).allowedFeatures)) {
      rawAllowed = (user as any).allowedFeatures.map(String);
    }

    return Object.entries(FEATURE_MAP).map(([id, info]) => {
      const labelLower = (info.label || '').toLowerCase();
      const isAllowed = 
        rawAllowed.includes(id) || 
        (info.label && rawAllowed.includes(info.label)) || 
        (labelLower && rawAllowed.includes(labelLower));
      return {
        id,
        label: info.label,
        desc: info.desc,
        category: info.category,
        allowed: isAllowed,
      };
    });
  }, [user]);

  // Toggle single feature
  const handleToggleFeature = (featureId: string, currentAllowed: boolean) => {
    const currentFeatures = Array.isArray((user as any).features) ? [...(user as any).features] : [];
    let updatedFeatures: string[];
    if (currentAllowed) {
      updatedFeatures = currentFeatures.filter(f => String(f) !== featureId);
    } else {
      updatedFeatures = [...currentFeatures, featureId];
    }
    handleUpdate({
      features: updatedFeatures,
      allowedFeatures: updatedFeatures,
    }, t('Feature access updated.'));
  };

  // Filtered login history
  const filteredHistory = useMemo(() => {
    const sLower = (historySearch || '').toLowerCase();
    return userLoginHistory.filter(item => {
      const devName = (item?.deviceName || '').toLowerCase();
      const ip = (item?.ipAddress || '').toLowerCase();
      const loc = (item?.location || '').toLowerCase();
      const devType = (item?.deviceType || '').toLowerCase();

      const matchSearch = 
        !sLower ||
        devName.includes(sLower) ||
        ip.includes(sLower) ||
        loc.includes(sLower) ||
        devType.includes(sLower);
      
      const matchStatus = historyStatusFilter === 'All' || item?.status === historyStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [userLoginHistory, historySearch, historyStatusFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative w-full app-fluid-modal bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200/40 dark:border-zinc-800 flex flex-col max-h-[85vh]"
      >
        {/* Top Passport Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-zinc-50/80 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3.5">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                referrerPolicy="no-referrer" 
                alt={user.name} 
                className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-zinc-800 shadow-xs shrink-0" 
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {user.name}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  user.status === 'Active'
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : user.status === 'Pending'
                    ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                    : 'bg-rose-100/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  {t(user.status)}
                </span>
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-400 font-medium truncate max-w-xs sm:max-w-md">
                {user.email} • ID: <span className="font-mono text-zinc-600 dark:text-zinc-300 font-semibold">{toDigits(user.id)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="hidden md:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
              {t(user.role)}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title={t('Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="border-b border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 px-3 sm:px-5 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2 py-2 min-w-max">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'personal'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('Personal Information')}</span>
            </button>

            <button
              onClick={() => setActiveTab('access')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'access'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('Access Permission')}</span>
            </button>

            <button
              onClick={() => setActiveTab('control')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'control'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('User Control')}</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('Security & Password')}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('Login History')}</span>
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'devices'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('Devices')}</span>
              {userDevices.some(d => d.status === 'Pending') && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with Transition */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-zinc-800 dark:text-zinc-200">
          <AnimatePresence mode="wait">
            
            {/* ======================================================== */}
            {/* TAB 1: PERSONAL INFORMATION                              */}
            {/* ======================================================== */}
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                {/* Admin Owner ID & Ownership Mapping Card */}
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Mapped Admin Owner ID
                      </div>
                      <div className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{user.adminOwnerId || (user.role === 'Admin Owner' ? 'AO-000' : 'AO-000')}</span>
                        <span className="text-xs font-sans font-normal text-zinc-500 dark:text-zinc-400">
                          (Created By: <strong className="text-zinc-700 dark:text-zinc-200">{user.createdBy || 'Admin Owner'}</strong>)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                      Immutable Ownership Record
                    </span>
                  </div>
                </div>

                {/* CATEGORY 1: PERSONAL INFORMATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('1. Personal Information')}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Row 1: First Name, Last Name, Date of Birth */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
                      <div className="col-span-1 md:col-span-2 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('First Name')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.firstName || user.name?.split(' ')[0] || 'N/A'}</span>
                      </div>

                      <div className="col-span-1 md:col-span-2 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Last Name')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.lastName || user.name?.split(' ').slice(1).join(' ') || 'N/A'}</span>
                      </div>

                      <div className="col-span-1 md:col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Date of Birth')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.dateOfBirth ? formatDate(user.dateOfBirth) : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Row 2: Nationality, Gender, Religion, Profession */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Nationality')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.nationality || 'N/A'}</span>
                      </div>

                      <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Gender')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{t(user.gender) || 'N/A'}</span>
                      </div>

                      <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Religion')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{t(user.religion) || 'N/A'}</span>
                      </div>

                      <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Profession')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{t(user.profession) || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Row 3: Country Code, Phone Number, Email Address */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Country Code')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.mobileCode || 'N/A'}</span>
                      </div>

                      <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Phone Number')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.phone ? toDigits(user.phone) : 'N/A'}</span>
                      </div>

                      <div className="col-span-1 md:col-span-2 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Email Address')}</span>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 2: IDENTITY DOCUMENTATION */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('2. Identity Documentation')}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Document / Passport Number')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.documentId || 'N/A'}</span>
                    </div>

                    <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Document Issue Date')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.documentIssueDate ? formatDate(user.documentIssueDate) : 'N/A'}</span>
                    </div>

                    <div className="col-span-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Expiry Date')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.documentExpiryDate ? formatDate(user.documentExpiryDate) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 3: ADDRESS COORDINATES */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('3. Address Coordinates')}
                    </h4>
                  </div>

                  <div className="app-form-grid">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Country')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.country || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Region')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.region || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('City')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.city || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Police Station')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.policeStation || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Post office Name')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.postOfficeName || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Postal code')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.postalCode || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Building Number')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.buildingNumber || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Zone Number')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.zoneNumber || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('State number')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.stateNumber || 'N/A'}</span>
                    </div>

                    <div className="col-span-1 md:col-span-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Area Name')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.areaName || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 4: SYSTEM CREDENTIALS */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      {t('4. System Credentials')}
                    </h4>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {t('Database Source')}: <strong className="text-indigo-600 dark:text-indigo-400 uppercase">{user.dbSource || 'admin'}</strong>
                    </span>
                  </div>

                  <div className="app-form-grid">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('User ID')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 font-mono block truncate">{toDigits(user.id)}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Account Username')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.username || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('System Role')}</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block truncate">{t(user.role)}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Department')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{t(user.department) || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Account Type')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{user.accountType || 'N/A'}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Registration Date')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">{formatDate(user.joinDate)}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Last Login Session')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">
                        {user.lastLogin === 'Never' ? t('Never') : formatDate(user.lastLogin)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block mb-1">{t('Security Channel')}</span>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 block truncate">
                        {user.is2faEnabled ? t('2FA Authenticator Active') : t('Standard Password')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Mobile App Custom Registration Fields */}
                {additionalFields.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      {t('Mobile App Custom Registration Fields')} ({toDigits(additionalFields.length)})
                    </h4>
                    
                    <div className="app-form-grid">
                      {additionalFields.map(([key, val]) => {
                        const safeVal = typeof val === 'boolean' ? (val ? t('Yes') : t('No')) : toDigits(renderSafeValue(val));
                        return (
                          <div 
                            key={key} 
                            className={`bg-zinc-50/70 dark:bg-zinc-800/20 p-3.5 rounded-xl border border-zinc-200/30 dark:border-zinc-800/40 flex flex-col justify-between gap-1 ${getDynamicColSpan(safeVal)}`}
                          >
                            <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider block truncate">{formatKeyName(key)}</span>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 break-words line-clamp-2 overflow-y-auto max-h-[60px]">
                              {safeVal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: ACCESS PERMISSION                                 */}
            {/* ======================================================== */}
            {activeTab === 'access' && (
              <motion.div
                key="access"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                {/* Core Web App Permissions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      {t('Web Management Modules Access')}
                    </h4>
                    <span className="text-[11px] text-zinc-400">{t('Click toggle to grant/revoke')}</span>
                  </div>

                  <div className="app-form-grid">
                    {Object.entries(user.permissions).map(([moduleKey, isGranted]) => (
                      <div 
                        key={moduleKey}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isGranted 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30' 
                            : 'bg-zinc-50 dark:bg-zinc-800/20 border-zinc-200/30 dark:border-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${isGranted ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          <div>
                            <span className="text-xs font-bold capitalize text-zinc-800 dark:text-zinc-100 block">
                              {moduleKey === 'dashboard' ? t('Dashboard') : moduleKey === 'users' ? t('Users Directory') : moduleKey === 'vehicles' ? t('Vehicles Fleet') : moduleKey === 'settings' ? t('App Control') : moduleKey === 'auditLogs' ? t('Audit Logs') : moduleKey}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {isGranted ? t('Granted Access') : t('Restricted')}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const newPerms = { ...user.permissions, [moduleKey]: !isGranted };
                            handleUpdate({ permissions: newPerms }, t('Module permission updated'));
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isGranted
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300'
                          }`}
                        >
                          {isGranted ? t('Enabled') : t('Disabled')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile App Privileges & Features (Interactive Feature Matrix) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                      {t('Mobile App Assigned Features & Privileges')} ({toDigits(featuresList.filter(f => f.allowed).length)} / {toDigits(featuresList.length)})
                    </h4>
                  </div>

                  <div className="app-form-grid">
                    {featuresList.map((f) => (
                      <div 
                        key={f.id}
                        onClick={() => handleToggleFeature(f.id, f.allowed)}
                        className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all flex flex-col justify-between gap-2 ${
                          f.allowed
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-900/30'
                            : 'bg-zinc-50 dark:bg-zinc-800/10 border-zinc-200/30 dark:border-zinc-800/40 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            f.allowed ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                          }`}>
                            {f.category}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${f.allowed ? 'bg-indigo-500' : 'bg-zinc-400'}`} />
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{t(f.label)}</h5>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{f.desc}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/50 text-[10px] font-bold">
                          <span className="text-zinc-400">ID: #{toDigits(f.id)}</span>
                          <span className={f.allowed ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}>
                            {f.allowed ? t('Active') : t('Disabled')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: USER CONTROL                                      */}
            {/* ======================================================== */}
            {activeTab === 'control' && (
              <motion.div
                key="control"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                {/* Account Status Control */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    {t('Account State & Lifecycle Status')}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t('Changing the status immediately changes user login permissions and application availability.')}
                  </p>

                  <div className="app-form-grid pt-1">
                    <button
                      onClick={() => handleUpdate({ status: 'Active' }, t('User status set to Active'))}
                      className={`p-3 rounded-xl border flex items-center gap-3 font-bold text-xs transition-all ${
                        user.status === 'Active'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <div className="text-left">
                        <div>{t('Active')}</div>
                        <div className="text-[10px] font-normal opacity-80">{t('Full System Access')}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUpdate({ status: 'Pending' }, t('User status set to Pending Review'))}
                      className={`p-3 rounded-xl border flex items-center gap-3 font-bold text-xs transition-all ${
                        user.status === 'Pending'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-amber-400'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <div className="text-left">
                        <div>{t('Pending')}</div>
                        <div className="text-[10px] font-normal opacity-80">{t('Awaiting Admin Approval')}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUpdate({ status: 'Inactive' }, t('User status set to Inactive (Disabled)'))}
                      className={`p-3 rounded-xl border flex items-center gap-3 font-bold text-xs transition-all ${
                        user.status === 'Inactive'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-rose-400'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <div className="text-left">
                        <div>{t('Inactive')}</div>
                        <div className="text-[10px] font-normal opacity-80">{t('Login Blocked / Suspended')}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Role and Department Assignment */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    {t('Role & Department Reassignment')}
                  </h4>

                  <div className="app-form-grid">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5">{t('Assigned Role')}</label>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdate({ role: e.target.value as UserRole }, t('User role updated'))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Admin Owner">{t('Admin Owner')}</option>
                        <option value="Super Admin">{t('Super Admin')}</option>
                        <option value="Admin">{t('Admin')}</option>
                        <option value="Manager">{t('Manager')}</option>
                        <option value="Operator">{t('Operator')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5">{t('Assigned Department')}</label>
                      <input
                        type="text"
                        defaultValue={user.department}
                        onBlur={(e) => {
                          if (e.target.value !== user.department) {
                            handleUpdate({ department: e.target.value.trim() }, t('Department updated'));
                          }
                        }}
                        placeholder="e.g. Operations, Logistics, Fleet Support"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5">{t('Account Status')}</label>
                      <select
                        value={user.status}
                        onChange={(e) => handleUpdate({ status: e.target.value as UserStatus }, t('Account status updated'))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Active">{t('Active (Enabled)')}</option>
                        <option value="Pending">{t('Pending (Under Review)')}</option>
                        <option value="Inactive">{t('Inactive (Suspended)')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Session & Account Enforcement Actions */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    {t('Administrative Account Actions')}
                  </h4>

                  <div className="app-form-grid pt-1">
                    <button
                      onClick={() => {
                        const newFlag = !user.mustChangeCredentials;
                        handleUpdate({ mustChangeCredentials: newFlag }, newFlag ? t('Password change enforced on next login') : t('Password change requirement removed'));
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                        user.mustChangeCredentials
                          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-800 dark:text-amber-300'
                          : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div>
                        <div>{t('Force Password Reset')}</div>
                        <div className="text-[10px] font-normal text-zinc-400">{t('User must update password on next login')}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] shrink-0 ml-2 ${user.mustChangeCredentials ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}>
                        {user.mustChangeCredentials ? t('Required') : t('Off')}
                      </span>
                    </button>

                    <button
                      onClick={handleRevokeAllOtherDevices}
                      className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-left text-xs font-bold transition-all flex items-center justify-between hover:bg-rose-100/50"
                    >
                      <div>
                        <div>{t('Terminate All Sessions')}</div>
                        <div className="text-[10px] font-normal text-rose-500/80">{t('Invalidate all device tokens & force re-login')}</div>
                      </div>
                      <LogOut className="w-4 h-4 shrink-0 ml-2" />
                    </button>

                    <button
                      onClick={() => {
                        const new2fa = !user.is2faEnabled;
                        handleUpdate({ is2faEnabled: new2fa, is2faSetupRequired: new2fa }, new2fa ? t('2FA Enforced') : t('2FA Relaxed'));
                      }}
                      className="p-3 rounded-xl border border-indigo-200/60 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-left text-xs font-bold transition-all flex items-center justify-between hover:bg-indigo-100/50"
                    >
                      <div>
                        <div>{user.is2faEnabled ? t('2FA Mandatory') : t('Enforce 2FA')}</div>
                        <div className="text-[10px] font-normal opacity-80">{user.is2faEnabled ? t('Security policy active') : t('Require authenticator app')}</div>
                      </div>
                      <ShieldCheck className="w-4 h-4 shrink-0 ml-2" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: SECURITY & PASSWORD                               */}
            {/* ======================================================== */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-6"
              >
                {/* 2FA Status Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                      {t('Two-Factor Authentication (2FA / MFA)')}
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      user.is2faEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {user.is2faEnabled ? t('2FA Active') : t('2FA Disabled')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t('Two-factor authentication requires an authenticator app (Google Authenticator, Microsoft Authenticator) code on login.')}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        const new2faState = !user.is2faEnabled;
                        handleUpdate({ 
                          is2faEnabled: new2faState,
                          is2faSetupRequired: new2faState,
                        }, new2faState ? t('2FA enabled for user') : t('2FA disabled for user'));
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        user.is2faEnabled
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900/30'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {user.is2faEnabled ? t('Disable 2FA') : t('Enforce 2FA Security')}
                    </button>

                    {user.totpSecretEncrypted && (
                      <button
                        onClick={() => {
                          triggerConfirm(
                            t('Reset 2FA Secret'),
                            t('Are you sure you want to reset this user\'s 2FA authenticator key? They will have to scan a new QR code upon signing in.'),
                            () => {
                              handleUpdate({
                                totpSecretEncrypted: '',
                                is2faEnabled: false,
                                is2faSetupRequired: true,
                              }, t('2FA Authenticator reset successfully.'));
                            }
                          );
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-all"
                      >
                        {t('Reset 2FA Secret Key')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct Admin Password Reset */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/20 border border-zinc-200/30 dark:border-zinc-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-indigo-500" />
                      {t('Admin Password Reset & Credential Override')}
                    </h4>
                    <button
                      type="button"
                      onClick={handleGenerateSecurePassword}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {t('Generate Strong Password')}
                    </button>
                  </div>

                  <div className="app-form-grid">
                    <div className="relative">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5">{t('New Password')}</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('Enter 6+ characters')}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5">{t('Confirm Password')}</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('Re-enter new password')}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1.5">{t('Action')}</label>
                      <button
                        type="button"
                        onClick={handleSavePassword}
                        disabled={!newPassword || isSaving}
                        className="w-full h-[42px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        <span>{t('Save & Update Password')}</span>
                      </button>
                    </div>
                  </div>

                  {newPassword && (
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30">
                      <div className="text-xs">
                        <span className="text-zinc-400 block text-[10px] uppercase font-bold">{t('Generated Password Preview')}</span>
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 select-all">{newPassword}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(newPassword);
                          setPasswordCopied(true);
                          setTimeout(() => setPasswordCopied(false), 2000);
                          triggerToast(t('Copied'), t('Password copied to clipboard'), 'info');
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 hover:bg-zinc-50"
                      >
                        {passwordCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{passwordCopied ? t('Copied') : t('Copy')}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSavePassword}
                      disabled={!newPassword || isSaving}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>{t('Save & Update Password')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: LOGIN HISTORY                                     */}
            {/* ======================================================== */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="w-full sm:w-72">
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder={t('Search IP, Device, Location...')}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {['All', 'Success', 'Failed', 'Blocked'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setHistoryStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          historyStatusFilter === st
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                        }`}
                      >
                        {t(st)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Login Records Table / Grid */}
                <div className="border border-zinc-200/40 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200/40 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                        <tr>
                          <th className="p-3.5">{t('Date & Time')}</th>
                          <th className="p-3.5">{t('Device & Client')}</th>
                          <th className="p-3.5">{t('IP Address')}</th>
                          <th className="p-3.5">{t('Location')}</th>
                          <th className="p-3.5 text-right">{t('Status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                        {filteredHistory.length > 0 ? (
                          filteredHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="font-bold text-zinc-800 dark:text-zinc-200">{formatDate(item.timestamp)}</div>
                                <div className="text-[10px] text-zinc-400">{item.time || 'Logged in'}</div>
                              </td>
                              <td className="p-3.5">
                                <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                  {(item?.deviceType || '').includes('Mobile') ? (
                                    <Smartphone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  ) : (item?.deviceType || '').includes('Tablet') ? (
                                    <Tablet className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                  ) : (
                                    <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  )}
                                  <span className="truncate">{item.deviceName}</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate">{item.browserOrApp}</div>
                              </td>
                              <td className="p-3.5 whitespace-nowrap font-mono text-zinc-600 dark:text-zinc-300 font-semibold">
                                {toDigits(item.ipAddress)}
                              </td>
                              <td className="p-3.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-zinc-400" />
                                  <span>{item.location || 'Unknown'}</span>
                                </div>
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  item.status === 'Success'
                                    ? 'bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                    : item.status === 'Failed'
                                    ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                    : item.status === 'Blocked'
                                    ? 'bg-rose-100/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                  {item.status === 'Success' ? <Check className="w-3 h-3" /> : item.status === 'Blocked' ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                  {t(item.status)}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-400 font-medium">
                              {t('No login records found matching your filters.')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 6: DEVICES                                           */}
            {/* ======================================================== */}
            {activeTab === 'devices' && (
              <motion.div
                key="devices"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-5"
              >
                {/* Header with Stats & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                      {t('Authorized Devices & Session Control')}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t('Total')} {toDigits(userDevices.length)} {t('devices logged with')} {toDigits(userDevices.filter(d => d.status === 'Approved').length)} {t('approved')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddDeviceOpen(!isAddDeviceOpen)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('Register New Device')}</span>
                    </button>

                    <button
                      onClick={handleRevokeAllOtherDevices}
                      className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 hover:bg-rose-100 font-bold text-xs transition-all flex items-center gap-1"
                      title={t('Revoke All Devices')}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('Revoke All')}</span>
                    </button>
                  </div>
                </div>

                {/* Add Device Inline Form */}
                {isAddDeviceOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddNewDevice}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3"
                  >
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{t('Provision New Trusted Device')}</h5>
                    
                    <div className="app-form-grid">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">{t('Device Name/Model')}</label>
                        <input
                          type="text"
                          value={newDeviceName}
                          onChange={(e) => setNewDeviceName(e.target.value)}
                          placeholder="e.g. iPad Pro M2 (Dispatch Unit)"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">{t('Device Type')}</label>
                        <select
                          value={newDeviceType}
                          onChange={(e) => setNewDeviceType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                        >
                          <option value="Mobile (Android)">{t('Mobile (Android)')}</option>
                          <option value="Mobile (iOS)">{t('Mobile (iOS)')}</option>
                          <option value="Tablet (iPad)">{t('Tablet (iPad)')}</option>
                          <option value="Desktop (Web)">{t('Desktop (Web)')}</option>
                          <option value="Desktop (App)">{t('Desktop (App)')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">{t('Static/Allowed IP')}</label>
                        <input
                          type="text"
                          value={newDeviceIp}
                          onChange={(e) => setNewDeviceIp(e.target.value)}
                          placeholder="103.145.72.1"
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddDeviceOpen(false)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-xs font-bold"
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        {t('Authorize & Save Device')}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Device Cards Grid (Responsive 3-Column on Desktop, 2 on Tablet, 1 on Mobile) */}
                <div className="app-form-grid">
                  {userDevices.map((dev) => (
                    <div 
                      key={dev.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        dev.status === 'Approved'
                          ? 'bg-white dark:bg-zinc-800/30 border-zinc-200/50 dark:border-zinc-800/60 shadow-xs'
                          : dev.status === 'Pending'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/40'
                          : 'bg-zinc-50/80 dark:bg-zinc-800/10 border-zinc-200/30 dark:border-zinc-800/30 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            dev.status === 'Approved'
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                              : dev.status === 'Pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {(dev?.deviceType || '').includes('Mobile') ? (
                              <Smartphone className="w-5 h-5" />
                            ) : (dev?.deviceType || '').includes('Tablet') ? (
                              <Tablet className="w-5 h-5" />
                            ) : (
                              <Laptop className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                              {dev.deviceName}
                            </h5>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              ID: {dev.deviceIdentifier}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                          dev.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : dev.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            dev.status === 'Approved' ? 'bg-emerald-500' : dev.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {t(dev.status)}
                        </span>
                      </div>

                      {/* Device Meta info */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                        <div>
                          <span className="text-zinc-400 block">{t('First Authorized')}</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(dev.firstLogin)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">{t('Last Activity')}</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatDate(dev.lastActive)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">{t('IP Address')}</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{toDigits(dev.ipAddress)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block">{t('Client Platform')}</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate block">{dev.browserOrApp || dev.deviceType}</span>
                        </div>
                      </div>

                      {/* Device Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                        {dev.status === 'Pending' && (
                          <button
                            onClick={() => handleApproveDevice(dev.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('Approve Device')}</span>
                          </button>
                        )}

                        {dev.status === 'Approved' && (
                          <button
                            onClick={() => handleRevokeDevice(dev.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 hover:bg-amber-100 font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{t('Revoke Access')}</span>
                          </button>
                        )}

                        {dev.status === 'Revoked' && (
                          <button
                            onClick={() => handleApproveDevice(dev.id)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>{t('Restore Access')}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteDevice(dev.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-400 hover:text-rose-600 transition-colors"
                          title={t('Delete Record')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400 font-medium hidden sm:block">
            {t('User ID')}: <span className="font-mono font-bold text-zinc-600 dark:text-zinc-300">{toDigits(user.id)}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors ml-auto"
          >
            {t('Close Passport')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
