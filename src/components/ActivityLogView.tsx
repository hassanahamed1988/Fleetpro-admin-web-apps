/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ShieldAlert, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { ActivityLog } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedSearchBar } from './AnimatedSearchBar';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, themeColor }) => {
  const { t, formatDateTime, toDigits } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const themeText = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const filteredLogs = logs.filter((log) => {
    const sLower = (search || '').toLowerCase();
    const matchesSearch =
      (log?.action || '').toLowerCase().includes(sLower) ||
      (log?.details || '').toLowerCase().includes(sLower) ||
      (log?.userName || '').toLowerCase().includes(sLower);
    const matchesCategory = categoryFilter === 'All' || log?.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || log?.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {t('System Audit Trails')}
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {t('Read-only cryptographic historical ledger tracing administrative actions and logins.')}
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row gap-4 items-center shadow-xs">
        {/* Search */}
        <AnimatedSearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder={t('Search action, details, actor name...')}
          themeColor={themeColor}
        />

        {/* Category & Status dropdowns */}
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 text-xs px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none"
          >
            <option value="All">{t('All Categories')}</option>
            <option value="User Management">{t('User Admin')}</option>
            <option value="Vehicle">{t('Vehicle Operations')}</option>
            <option value="Settings">{t('System Config')}</option>
            <option value="Security">{t('Logins & Auth')}</option>
            <option value="Backup">{t('Database Backup')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 text-xs px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none"
          >
            <option value="All">{t('All Statuses')}</option>
            <option value="Success">{t('Success')}</option>
            <option value="Failed">{t('Failed')}</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/80">
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Timestamp')}</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Administrator / Actor')}</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Category')}</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Action Conducted')}</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Result')}</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Network Host IP')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(log.timestamp)}</span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-100 block">{t(log.userName)}</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">{log.userEmail}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                        {log.category === 'User Management' ? t('User Admin') 
                          : log.category === 'Vehicle' ? t('Vehicle Operations') 
                          : log.category === 'Settings' ? t('System Config') 
                          : log.category === 'Security' ? t('Logins & Auth') 
                          : log.category === 'Backup' ? t('Database Backup') 
                          : t(log.category)}
                      </span>
                    </td>

                    {/* Action & details */}
                    <td className="px-6 py-4 max-w-sm">
                      <div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-100 block">{t(log.action)}</span>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{t(log.details)}</p>
                      </div>
                    </td>

                    {/* Result status */}
                    <td className="px-6 py-4">
                      {log.status === 'Success' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t('Success')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
                          <XCircle className="w-3.5 h-3.5" />
                          {t('Failed')}
                        </span>
                      )}
                    </td>

                    {/* Network IP */}
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono">
                      {toDigits(log.ipAddress)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-zinc-400">
                    {t('No matching log trails found.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
