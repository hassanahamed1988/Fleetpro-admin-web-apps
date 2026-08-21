import React from 'react';
import { User, ThemeColor } from '../types';
import { UserCircle, Mail, Phone, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileViewProps {
  user: User;
  themeColor: ThemeColor;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, themeColor }) => {
  const { t } = useLanguage();

  const themeClasses = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  }[themeColor] || 'text-blue-500 bg-blue-500/10 border-blue-500/20';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{t('My Profile')}</h2>
          <p className="text-sm text-zinc-500 mt-1">{t('View and manage your account details.')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center border ${themeClasses}`}>
            <UserCircle className="w-12 h-12" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{user.name}</h3>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t(user.role)}
            </div>
          </div>
          <div className="text-center md:text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {t(user.status)}
            </span>
          </div>
        </div>

        <div className="p-8">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider">{t('Contact & Department')}</h4>
          <div className="app-form-grid">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{t('Email Address')}</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{t('Phone Number')}</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.phone || t('Not provided')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{t('Department')}</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-500 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{t('Join Date')}</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
