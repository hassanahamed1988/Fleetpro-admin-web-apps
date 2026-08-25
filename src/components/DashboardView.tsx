/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Car, DollarSign, Activity, Bell, 
  TrendingUp, TrendingDown, ArrowUpRight, Shield, RefreshCw, Key, Lock, UserCheck, Smartphone, Sparkles
} from 'lucide-react';
import { User, Vehicle, ActivityLog, SystemNotification, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ActionButton } from './ActionButton';

interface DashboardViewProps {
  users: User[];
  vehicles: Vehicle[];
  activityLogs: ActivityLog[];
  notifications: SystemNotification[];
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  currentUserRole?: UserRole;
  onNavigate: (view: string) => void;
  onUpdateUser?: (user: User) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  users,
  vehicles,
  activityLogs,
  notifications,
  themeColor,
  currentUserRole = 'Super Admin',
  onNavigate,
  onUpdateUser,
}) => {
  const { language, t, formatNumber, formatCurrency, formatDate, formatTime, toDigits } = useLanguage();

  const isAdminOwner = currentUserRole === 'Admin Owner';

  // Derive user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
  const pendingUsers = users.filter(u => u.status === 'Pending').length;
  const adminOwnerCount = users.filter(u => u.role === 'Admin Owner').length;
  const superAdminCount = users.filter(u => u.role === 'Super Admin').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const managerCount = users.filter(u => u.role === 'Manager').length;
  const operatorCount = users.filter(u => u.role === 'Operator').length;

  const totalAdminAccounts = adminOwnerCount + superAdminCount + adminCount;

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'Maintenance').length;

  // Active notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Predefined theme classes
  const themeBgText = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    red: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  };

  const themeText = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const themeBar = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-rose-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  };

  // Compute fuel counts dynamically from real vehicles
  const cngCount = vehicles.filter(v => v.fuelType === 'CNG').length;
  const dieselCount = vehicles.filter(v => v.fuelType === 'Diesel').length;
  const octaneCount = vehicles.filter(v => v.fuelType === 'Octane').length;
  const electricCount = vehicles.filter(v => v.fuelType === 'Electric').length;

  const cngPct = totalVehicles > 0 ? Math.round((cngCount / totalVehicles) * 100) : 0;
  const dieselPct = totalVehicles > 0 ? Math.round((dieselCount / totalVehicles) * 100) : 0;
  const octanePct = totalVehicles > 0 ? Math.round((octaneCount / totalVehicles) * 100) : 0;
  const electricPct = totalVehicles > 0 ? Math.round((electricCount / totalVehicles) * 100) : 0;

  // Role percentages for Admin Owner
  const ownerPct = totalUsers > 0 ? Math.round((adminOwnerCount / totalUsers) * 100) : 0;
  const superAdminPct = totalUsers > 0 ? Math.round((superAdminCount / totalUsers) * 100) : 0;
  const adminRolePct = totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0;
  const managerPct = totalUsers > 0 ? Math.round((managerCount / totalUsers) * 100) : 0;
  const operatorPct = totalUsers > 0 ? Math.round((operatorCount / totalUsers) * 100) : 0;

  // Recent user registrations
  const recentUsers = [...users]
    .sort((a, b) => (b.joinDate || '').localeCompare(a.joinDate || ''))
    .slice(0, 5);

  // Security logs
  const securityLogs = activityLogs
    .filter(log => log.category === 'Security' || log.category === 'User Management' || log.category === 'System')
    .slice(0, 3);

  // General recent activity
  const recentActivities = activityLogs
    .filter(log => !isAdminOwner || log.category === 'User Management' || log.category === 'Security' || log.category === 'Settings' || log.category === 'System')
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Admin Owner Mode Notice Header */}
      {isAdminOwner && (
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500 text-white shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Admin Owner Executive Dashboard</span>
                <span className="px-2 py-0.5 text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-full font-extrabold uppercase">
                  Owner Level
                </span>
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Displaying User & Admin Accounts management overview only. Vehicles & Driver information are hidden.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('User Management')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            Manage User Accounts
          </button>
        </div>
      )}

      {/* Real-time Mobile App Registration Approvals (Admin Owner only) */}
      {isAdminOwner && (
        <div className="mb-6 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <span>Mobile App Registration Requests</span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                    Real-Time Firestore Sync
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Users registered on your mobile app are synced here. Verify and approve them to grant full access.
                </p>
              </div>
            </div>
            
            {/* Sync Status Info */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl font-medium shrink-0 self-start sm:self-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Direct Firestore Database Connected</span>
            </div>
          </div>

          {/* Pending Users List */}
          {users.filter(u => u.status === 'Pending').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">All mobile app user registrations are approved</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">Whenever a new user registers on the Firestore mobile app, they will appear here in real-time.</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[350px] overflow-y-auto pr-1">
              {users.filter(u => u.status === 'Pending').map((pendingUser) => {
                return (
                  <div key={pendingUser.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 shrink-0 text-xs mt-0.5">
                        {pendingUser.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{pendingUser.name}</h4>
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded font-medium">
                            {pendingUser.department || 'General User'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{pendingUser.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-400">
                          <span>Phone: {pendingUser.phone || 'N/A'}</span>
                          <span>•</span>
                          <span>Registered: {pendingUser.joinDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <ActionButton
                        onClick={async () => {
                          if (onUpdateUser) {
                            await onUpdateUser({
                              ...pendingUser,
                              status: 'Active'
                            });
                          }
                        }}
                        actionType="create"
                        className="h-8 px-3 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                      >
                        Approve & Activate
                      </ActionButton>
                      <ActionButton
                        onClick={async () => {
                          if (onUpdateUser) {
                            await onUpdateUser({
                              ...pendingUser,
                              status: 'Inactive'
                            });
                          }
                        }}
                        actionType="delete"
                        className="h-8 px-3 rounded-lg text-[11px] font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        Decline
                      </ActionButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Grid of Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('dashboard.totalUsers')}</span>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNumber(totalUsers)}</h2>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
                {formatNumber(activeUsers)} {t('Active')}
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-medium">
                {formatNumber(pendingUsers)} {t('Pending')}
              </span>
            </div>
          </div>
          <div className={`p-3.5 rounded-xl ${themeBgText[themeColor]}`}>
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Admin & Owner Accounts (For Admin Owner) or Total Vehicles (For Others) */}
        {isAdminOwner ? (
          <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Admin & Owner Accounts</span>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNumber(totalAdminAccounts)}</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium">
                  {formatNumber(adminOwnerCount)} Owner
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
                  {formatNumber(superAdminCount)} Super Admin
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Key className="w-6 h-6" />
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('nav.vehicles')}</span>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNumber(totalVehicles)}</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatNumber(activeVehicles)} {t('Active')}
                </span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-medium">
                  {formatNumber(maintenanceVehicles)} {t('Service')}
                </span>
              </div>
            </div>
            <div className={`p-3.5 rounded-xl ${themeBgText[themeColor]}`}>
              <Car className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Card 3: Active User Accounts (For Admin Owner) or Loan Summary (For Others) */}
        {isAdminOwner ? (
          <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Active User Sessions</span>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatNumber(activeUsers)}</h2>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{formatNumber(activeUsers)} active & verified</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Loan Outstanding')}</span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{formatCurrency(0)}</h2>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-zinc-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('{count} Active contracts', { count: 0 })}</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Card 4: System Health / Security Audit */}
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('dashboard.systemHealth')}</span>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
              {formatNumber(securityLogs.length)} {t('today')}
            </h2>
            <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-500 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>{t('Security audit clean')}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Analytical Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {isAdminOwner ? (
          /* User & Admin Accounts Role Distribution (For Admin Owner) */
          <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-1 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">User Role Distribution</h3>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">Account types across the system</p>
            </div>
            
            <div className="py-6 flex justify-center items-center relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="60" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="16" fill="none" />
                {totalUsers > 0 && (
                  <>
                    <circle cx="80" cy="80" r="60" className="stroke-indigo-600" strokeWidth="16" fill="none" strokeDasharray="376.9" strokeDashoffset={`${376.9 * (1 - ownerPct / 100)}`} />
                    <circle cx="80" cy="80" r="60" className="stroke-blue-500" strokeWidth="16" fill="none" strokeDasharray="376.9" strokeDashoffset={`${376.9 * (1 - (ownerPct + superAdminPct) / 100)}`} />
                    <circle cx="80" cy="80" r="60" className="stroke-emerald-500" strokeWidth="16" fill="none" strokeDasharray="376.9" strokeDashoffset={`${376.9 * (1 - (ownerPct + superAdminPct + adminRolePct) / 100)}`} />
                  </>
                )}
              </svg>
              <div className="absolute text-center">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 block">USERS</span>
                <span className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100">{formatNumber(totalUsers)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">Admin Owner ({toDigits(adminOwnerCount)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">Super Admin ({toDigits(superAdminCount)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">Admin ({toDigits(adminCount)})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">Manager ({toDigits(managerCount)})</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400 inline-block" />
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">Operator ({toDigits(operatorCount)})</span>
              </div>
            </div>
          </div>
        ) : (
          /* Vehicles Fuel Distribution (SVG chart) */
          <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-1 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t('dashboard.fuelDistribution')}</h3>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('Distribution across active fleet')}</p>
            </div>
            
            <div className="py-6 flex justify-center items-center relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="60" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="16" fill="none" />
                {totalVehicles > 0 && (
                  <>
                    <circle cx="80" cy="80" r="60" className="stroke-blue-500" strokeWidth="16" fill="none" strokeDasharray="376.9" strokeDashoffset={`${376.9 * (1 - cngPct / 100)}`} />
                    <circle cx="80" cy="80" r="60" className="stroke-emerald-500" strokeWidth="16" fill="none" strokeDasharray="376.9" strokeDashoffset={`${376.9 * (1 - dieselPct / 100)}`} />
                    <circle cx="80" cy="80" r="60" className="stroke-amber-500" strokeWidth="16" fill="none" strokeDasharray="376.9" strokeDashoffset={`${376.9 * (1 - octanePct / 100)}`} />
                  </>
                )}
              </svg>
              <div className="absolute text-center">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 block">{t('FLEET')}</span>
                <span className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100">{formatNumber(totalVehicles)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                <span className="text-zinc-500 dark:text-zinc-400">{t('{fuel} ({percent}%)', { fuel: t('CNG'), percent: toDigits(cngPct) })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span className="text-zinc-500 dark:text-zinc-400">{t('{fuel} ({percent}%)', { fuel: t('Diesel'), percent: toDigits(dieselPct) })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span className="text-zinc-500 dark:text-zinc-400">{t('{fuel} ({percent}%)', { fuel: t('Octane'), percent: toDigits(octanePct) })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" />
                <span className="text-zinc-500 dark:text-zinc-400">{t('{fuel} ({percent}%)', { fuel: t('Electric'), percent: toDigits(electricPct) })}</span>
              </div>
            </div>
          </div>
        )}

        {isAdminOwner ? (
          /* User & Admin Accounts Status Breakdown (For Admin Owner) */
          <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">User Account Status & Permissions Summary</h3>
                  <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">Account state and administrative privilege ratios</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  User Accounts
                </span>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  <span>Admin Owner & Super Admin Accounts</span>
                  <span>{formatNumber(adminOwnerCount + superAdminCount)} / {formatNumber(totalUsers)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${totalUsers > 0 ? ((adminOwnerCount + superAdminCount) / totalUsers) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  <span>Active Verified Accounts</span>
                  <span>{formatNumber(activeUsers)} / {formatNumber(totalUsers)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  <span>Pending Approval Accounts</span>
                  <span>{formatNumber(pendingUsers)} / {formatNumber(totalUsers)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${totalUsers > 0 ? (pendingUsers / totalUsers) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-2">
              <div className="flex-1">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase font-medium">Total Admin Accounts</span>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{formatNumber(totalAdminAccounts)}</p>
              </div>
              <div className="w-[1px] bg-zinc-100 dark:bg-zinc-800/80" />
              <div className="flex-1">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase font-medium">Active System Users</span>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{formatNumber(activeUsers)}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Budget Allocation (Clean CSS progress bars) */
          <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-2 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t('dashboard.budgetAllocation')}</h3>
                  <p className="text-[12px] text-zinc-400 dark:text-zinc-500 mt-0.5">{t('Budget allocations and payouts this cycle')}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${themeBgText[themeColor]}`}>
                  {t('August 2026')}
                </span>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  <span>{t('Fuel Expenditures')}</span>
                  <span>{formatCurrency(0)} / {formatCurrency(0)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className={`h-full rounded-full ${themeBar[themeColor]}`} style={{ width: '0%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  <span>{t('Vehicle Maintenance & Servicing')}</span>
                  <span>{formatCurrency(0)} / {formatCurrency(0)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '0%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  <span>{t('Operator & Driver Allowances')}</span>
                  <span>{formatCurrency(0)} / {formatCurrency(0)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '0%' }} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-2">
              <div className="flex-1">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase font-medium">{t('Total Paid')}</span>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{formatCurrency(0)}</p>
              </div>
              <div className="w-[1px] bg-zinc-100 dark:bg-zinc-800/80" />
              <div className="flex-1">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase font-medium">{t('dashboard.remaining')}</span>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{formatCurrency(0)}</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Lower Feed Segment (Recent Activities & Users) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Feed */}
        <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t('dashboard.recentLogs')}</h3>
            <button 
              onClick={() => onNavigate('Activity Logs')}
              className={`text-xs font-medium hover:underline flex items-center gap-1 ${themeText[themeColor]}`}
            >
              {t('See all logs')}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-4">{t('dashboard.noRecentLogs')}</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t(activity.action)}</span>
                      <span className="text-zinc-400">{formatTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-zinc-500 mt-0.5 leading-relaxed">{t(activity.details)}</p>
                    <span className="text-[10px] text-zinc-400 inline-block mt-0.5 bg-zinc-50 dark:bg-zinc-800/40 px-1.5 py-0.5 rounded">
                      {t('by {user} ({category})', { user: t(activity.userName), category: t(activity.category) })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registrations & Notifications */}
        <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">User Accounts Feed</h3>
              <button 
                onClick={() => onNavigate('User Management')}
                className={`text-xs font-medium hover:underline flex items-center gap-1 ${themeText[themeColor]}`}
              >
                {t('Manage Users')}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {recentUsers.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-4">{t('dashboard.noRecentUsers')}</p>
              ) : (
                recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} referrerPolicy="no-referrer" alt={u.name} className="w-9 h-9 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{t(u.name)}</h4>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            u.role === 'Admin Owner' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' :
                            u.role === 'Super Admin' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                            'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400">{formatDate(u.joinDate)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        u.status === 'Active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                          : u.status === 'Pending' 
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}>
                        {t(u.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Bell className="w-4 h-4 text-amber-500" />
              {t('{count} Unread Alerts', { count: unreadNotificationsCount })}
            </span>
            <button 
              onClick={() => onNavigate('Notifications')}
              className={`font-semibold hover:underline ${themeText[themeColor]}`}
            >
              {t('View Inbox')}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
