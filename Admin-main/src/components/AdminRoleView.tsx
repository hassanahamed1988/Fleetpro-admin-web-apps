/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Check, Users, Save, HelpCircle, Info } from 'lucide-react';
import { RolePermission, UserRole } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminRoleViewProps {
  permissions: RolePermission[];
  onUpdatePermissions: (updated: RolePermission[]) => void;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const AdminRoleView: React.FC<AdminRoleViewProps> = ({
  permissions,
  onUpdatePermissions,
  themeColor,
  triggerToast,
  triggerConfirm,
}) => {
  const { t } = useLanguage();
  const [localPermissions, setLocalPermissions] = useState<RolePermission[]>(() => {
    try {
      return permissions ? JSON.parse(JSON.stringify(permissions)) : [];
    } catch {
      return [];
    }
  });

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

  const themeSelectBorder = {
    blue: 'focus:border-blue-500 focus:ring-blue-500/10',
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500/10',
    red: 'focus:border-rose-500 focus:ring-rose-500/10',
    amber: 'focus:border-amber-500 focus:ring-amber-500/10',
    purple: 'focus:border-purple-500 focus:ring-purple-500/10',
  };

  const handleAccessChange = (
    roleIndex: number,
    module: 'dashboard' | 'users' | 'vehicles' | 'settings' | 'auditLogs',
    value: 'none' | 'read' | 'write'
  ) => {
    // Security Guard: Prevent modification of Super Admin & Admin Owner core permissions
    if (localPermissions[roleIndex].role === 'Super Admin' || localPermissions[roleIndex].role === 'Admin Owner') {
      triggerToast(
        t('Security Guard'),
        t('Admin Owner and Super Admin privileges cannot be modified to prevent lockouts.'),
        'warning'
      );
      return;
    }

    const nextPermissions = [...localPermissions];
    nextPermissions[roleIndex].modules[module] = value;
    setLocalPermissions(nextPermissions);
  };

  const handleSave = () => {
    triggerConfirm(
      t('Apply Role Permissions?'),
      t('Updating the security matrix will modify feature access bounds for all users in these categories instantly.'),
      () => {
        onUpdatePermissions(localPermissions);
        triggerToast(
          t('✓ Permissions Saved'),
          t('Access control matrix updated successfully.'),
          'success'
        );
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{t('admin_role.title')}</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {t('admin_role.subtitle')}
        </p>
      </div>      <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <Shield className={`w-5 h-5 ${themeText[themeColor]}`} />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{t('Security & Privileges Matrix')}</h3>
        </div>

        {/* Info notice */}
        <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            <span className="font-bold">{t('Super Admin Protection:')}</span> {t('The Super Admin role inherits static Write permissions for all core modules. This mechanism prevents administrative lockouts and guarantees database persistence control.')}
          </div>
        </div>

        {/* Permissions matrix table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/20">
                <th className="px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Role Type')}</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Dashboard View')}</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('User Directory')}</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Vehicles Management')}</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('System Settings')}</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{t('Audit logs')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {localPermissions.map((item, index) => (
                <tr key={item.role} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/10 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {t(item.role)}
                      </span>
                    </div>
                  </td>

                  {/* Modules */}
                  {(['dashboard', 'users', 'vehicles', 'settings', 'auditLogs'] as const).map((module) => (
                    <td key={module} className="px-5 py-4">
                      {item.role === 'Super Admin' ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('Full Write')}</span>
                        </div>
                      ) : (
                        <select
                          value={item.modules[module]}
                          onChange={(e) => handleAccessChange(index, module, e.target.value as any)}
                          className={`h-9 text-xs px-2.5 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none focus:ring-1 focus:ring-opacity-40 transition-all ${themeSelectBorder[themeColor]}`}
                        >
                          <option value="none">{t('No Access')}</option>
                          <option value="read">{t('Read Only')}</option>
                          <option value="write">{t('Read / Write')}</option>
                        </select>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Matrix Explainer */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-[11px] text-zinc-400">
            {t('* Remember to save updates to apply security clearance rules on active operators.')}
          </div>
          <button
            onClick={handleSave}
            className={`h-[40px] px-5 rounded-[8px] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all ${themeBg[themeColor]}`}
          >
            <Save className="w-4 h-4" />
            {t('Apply Access Control Rules')}
          </button>
        </div>

      </div>
    </div>
  );
};
