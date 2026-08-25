/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Check, Trash2, Eye, MailOpen, Mail, AlertCircle, 
  CheckCircle, ShieldAlert, AlertTriangle, Info 
} from 'lucide-react';
import { SystemNotification } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationViewProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const NotificationView: React.FC<NotificationViewProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  themeColor,
  triggerToast,
}) => {
  const { t, formatDateTime } = useLanguage();
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Read'>('All');

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

  const themeBadge = {
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    red: 'bg-rose-500/10 text-rose-500',
    amber: 'bg-amber-500/10 text-amber-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'Unread') return !notif.read;
    if (filter === 'Read') return notif.read;
    return true;
  });

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />;
      case 'error':
        return <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />;
      default:
        return <Info className="w-4.5 h-4.5 text-sky-500" />;
    }
  };

  const handleMarkAll = () => {
    onMarkAllRead();
    triggerToast(
      t('✓ Notifications Read'),
      t('All notifications have been marked as read.'),
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('System Notifications')}
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {t('Log of warning triggers, registration request prompts, and system alerts.')}
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAll}
            className={`h-9 px-4 rounded-[8px] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${themeBg[themeColor]}`}
          >
            <Check className="w-4 h-4" />
            {t('Mark All Read')}
          </button>
        )}
      </div>

      {/* Tabs / Filter bar */}
      <div className="flex gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        {(['All', 'Unread', 'Read'] as const).map((tVal) => (
          <button
            key={tVal}
            onClick={() => setFilter(tVal)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors relative ${
              filter === tVal
                ? `${themeText[themeColor]} bg-zinc-100 dark:bg-zinc-800/80`
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            {tVal === 'All' ? t('common.filterAll') : tVal === 'Unread' ? t('Unread') : t('Read')}
            {tVal === 'Unread' && notifications.some(n => !n.read) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-zinc-950" />
            )}
          </button>
        ))}
      </div>

      {/* Grid of Notifications */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border ${
                  notif.read 
                    ? 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/40' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800 shadow-sm'
                } flex gap-4 items-start relative transition-all group`}
              >
                {/* Status dot */}
                {!notif.read && (
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}

                {/* Icon category */}
                <div className={`p-2 rounded-lg ${notif.read ? 'bg-zinc-100 dark:bg-zinc-850 text-zinc-400' : 'bg-zinc-50 dark:bg-zinc-800'}`}>
                  {getIcon(notif.type)}
                </div>

                {/* Text Context */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs font-bold leading-tight ${notif.read ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-800 dark:text-zinc-50'}`}>
                      {t(notif.title)}
                    </h4>
                    <span className="text-[10px] text-zinc-400">{formatDateTime(notif.timestamp)}</span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${notif.read ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {t(notif.message)}
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {notif.category === 'User Management' ? t('User Admin') 
                      : notif.category === 'Vehicle' ? t('Vehicle Operations') 
                      : notif.category === 'Settings' ? t('System Config') 
                      : notif.category === 'Security' ? t('Logins & Auth') 
                      : notif.category === 'Backup' ? t('Database Backup') 
                      : t(notif.category)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.read && (
                    <button
                      onClick={() => onMarkRead(notif.id)}
                      title={t('Mark as Read')}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      <MailOpen className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNotification(notif.id)}
                    title={t('Delete Notification')}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
              <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              {t('Your inbox is perfectly clean.')}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
