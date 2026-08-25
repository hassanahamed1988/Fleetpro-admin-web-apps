/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Search, Filter, Plus, Edit2, Trash2, Shield, 
  Activity, Check, Mail, Phone, Calendar, Briefcase, 
  MapPin, FileText, Users, CreditCard, ExternalLink, X, Eye, 
  RefreshCw, CheckCircle, AlertTriangle, Play, Pause, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedSearchBar } from './AnimatedSearchBar';
import { CompanyRegistrationModal } from './CompanyRegistrationModal';
import { FloatingInput, FloatingSelect } from './FloatingInput';
import { ActionButton } from './ActionButton';

interface CompanyManagementViewProps {
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const CompanyManagementView: React.FC<CompanyManagementViewProps> = ({
  themeColor,
  triggerToast,
  triggerConfirm
}) => {
  const { t, formatNumber } = useLanguage();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [packageFilter, setPackageFilter] = useState('All');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Edit states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editType, setEditType] = useState('');
  const [editPackage, setEditPackage] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editMaxUsers, setEditMaxUsers] = useState('');
  const [editMaxVehicles, setEditMaxVehicles] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/companies', {
        headers: {
          'X-User-Role': 'Admin Owner',
          'X-User-Id': 'USR-000'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      } else {
        triggerToast(t('Error'), t('Failed to load companies.'), 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast(t('Error'), t('A connection error occurred.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDeleteCompany = (companyId: string, companyName: string) => {
    triggerConfirm(
      t('Delete Company'),
      t('Are you sure you want to delete {name}? This will permanently remove all associated users, subscription plans, and databases!', { name: companyName }),
      async () => {
        try {
          const res = await fetch(`/api/companies/${companyId}`, {
            method: 'DELETE',
            headers: {
              'X-User-Role': 'Admin Owner',
              'X-User-Id': 'USR-000'
            }
          });
          if (res.ok) {
            triggerToast(t('Deleted'), t('Company has been deleted successfully.'), 'success');
            fetchCompanies();
          } else {
            triggerToast(t('Error'), t('Failed to delete company.'), 'error');
          }
        } catch (err) {
          console.error(err);
          triggerToast(t('Error'), t('A connection error occurred.'), 'error');
        }
      }
    );
  };

  const handleToggleStatus = async (company: any) => {
    const nextStatus = company.subscription?.subscriptionStatus === 'Active' ? 'Suspended' : 'Active';
    const actionName = nextStatus === 'Active' ? t('Activate') : t('Suspend');
    
    triggerConfirm(
      `${actionName} ${t('Subscription')}`,
      t('Are you sure you want to change subscription status to {status}?', { status: nextStatus }),
      async () => {
        try {
          const res = await fetch(`/api/companies/${company.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Role': 'Admin Owner',
              'X-User-Id': 'USR-000'
            },
            body: JSON.stringify({
              subscription: {
                ...company.subscription,
                subscriptionStatus: nextStatus
              }
            })
          });
          if (res.ok) {
            triggerToast(t('Status Updated'), t('Tenant subscription status has been updated successfully.'), 'success');
            fetchCompanies();
          } else {
            triggerToast(t('Error'), t('Failed to update status.'), 'error');
          }
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  const handleOpenEdit = (company: any) => {
    setSelectedCompany(company);
    setEditName(company.companyName || '');
    setEditPhone(company.companyPhone || '');
    setEditEmail(company.companyEmail || '');
    setEditType(company.companyType || 'Private Limited');
    setEditPackage(company.subscription?.subscriptionPackage || 'Yearly');
    setEditStatus(company.subscription?.subscriptionStatus || 'Active');
    setEditMaxUsers(String(company.subscription?.maxUserLimit || '50'));
    setEditMaxVehicles(String(company.subscription?.maxVehicleLimit || '100'));
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editName) {
      triggerToast(t('Validation Error'), t('Company Name is required.'), 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'Admin Owner',
          'X-User-Id': 'USR-000'
        },
        body: JSON.stringify({
          companyInfo: {
            ...selectedCompany,
            companyName: editName,
            companyPhone: editPhone,
            companyEmail: editEmail,
            companyType: editType
          },
          subscription: {
            ...selectedCompany.subscription,
            subscriptionPackage: editPackage,
            subscriptionStatus: editStatus,
            maxUserLimit: parseInt(editMaxUsers) || 50,
            maxVehicleLimit: parseInt(editMaxVehicles) || 100
          }
        })
      });
      if (res.ok) {
        triggerToast(t('Saved'), t('Company details updated successfully.'), 'success');
        setIsEditOpen(false);
        fetchCompanies();
      } else {
        triggerToast(t('Error'), t('Failed to update company details.'), 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast(t('Error'), t('A connection error occurred.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute stats
  const totalCompanies = companies.length;
  const activeSubscriptions = companies.filter(c => c.subscription?.subscriptionStatus === 'Active').length;
  const suspendedCount = companies.filter(c => c.subscription?.subscriptionStatus === 'Suspended').length;
  const totalRevenue = companies.reduce((acc, c) => acc + (parseFloat(c.payment?.totalAmount) || 0), 0);

  // Filters and Searching
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.companyEmail?.toLowerCase().includes(search.toLowerCase()) ||
      c.owner?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.subscription?.subscriptionStatus === statusFilter;
    const matchesPackage = packageFilter === 'All' || c.subscription?.subscriptionPackage === packageFilter;

    return matchesSearch && matchesStatus && matchesPackage;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const themeBg = {
    blue: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    red: 'bg-rose-600',
    amber: 'bg-amber-600',
    purple: 'bg-purple-650'
  }[themeColor] || 'bg-indigo-600';

  const themeText = {
    blue: 'text-indigo-600',
    emerald: 'text-emerald-600',
    red: 'text-rose-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600'
  }[themeColor] || 'text-indigo-600';

  const themeBorder = {
    blue: 'border-indigo-500',
    emerald: 'border-emerald-500',
    red: 'border-rose-500',
    amber: 'border-amber-500',
    purple: 'border-purple-500'
  }[themeColor] || 'border-indigo-500';

  const themeRing = {
    blue: 'focus:ring-indigo-500',
    emerald: 'focus:ring-emerald-500',
    red: 'focus:ring-rose-500',
    amber: 'focus:ring-amber-500',
    purple: 'focus:ring-purple-500'
  }[themeColor] || 'focus:ring-indigo-500';

  return (
    <div className="space-y-6">
      
      {/* Upper Dashboard KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Total Companies')}</span>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{isLoading ? '...' : totalCompanies}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Active Tenants')}</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{isLoading ? '...' : activeSubscriptions}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Total Subscriptions Sold')}</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">৳{isLoading ? '...' : formatNumber(totalRevenue)}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Suspended Tenants')}</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{isLoading ? '...' : suspendedCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Filter & Action Row */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <AnimatedSearchBar 
            search={search}
            setSearch={setSearch}
            placeholder={t('Search Company, Email or Owner...')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Status')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 outline-none hover:bg-zinc-100/50 transition-all cursor-pointer"
            >
              <option value="All">{t('All Status')}</option>
              <option value="Active">{t('Active')}</option>
              <option value="Suspended">{t('Suspended')}</option>
              <option value="Trial">{t('Trial')}</option>
              <option value="Expired">{t('Expired')}</option>
            </select>
          </div>

          {/* Package Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Package')}:</span>
            <select
              value={packageFilter}
              onChange={(e) => { setPackageFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 outline-none hover:bg-zinc-100/50 transition-all cursor-pointer"
            >
              <option value="All">{t('All Packages')}</option>
              <option value="Monthly">{t('Monthly')}</option>
              <option value="Half-Yearly">{t('Half-Yearly')}</option>
              <option value="Yearly">{t('Yearly')}</option>
              <option value="Customized Subscription">{t('Customized')}</option>
            </select>
          </div>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className={`h-9 px-4 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${themeBg} hover:opacity-95 active:scale-95`}
          >
            <Plus className="w-4 h-4" />
            {t('Register Company')}
          </button>
        </div>
      </div>

      {/* Grid List View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-zinc-400 font-medium">{t('Loading registered companies...')}</p>
        </div>
      ) : paginatedCompanies.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150 dark:border-zinc-800 p-12 text-center">
          <Building2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">{t('No Companies Found')}</p>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">{t('Get started by creating a brand new company profile to unlock multi-tenant access.')}</p>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className={`mt-4 h-9 px-4 rounded-xl text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer ${themeBg} hover:opacity-95`}
          >
            <Plus className="w-4 h-4" />
            {t('Register Company')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCompanies.map((c) => {
            const isSuspended = c.subscription?.subscriptionStatus === 'Suspended';
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-150 dark:border-zinc-800 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
              >
                {/* Upper banner section */}
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {c.companyLogo ? (
                        <img src={c.companyLogo} alt="Company logo" className="w-11 h-11 object-contain rounded-xl border border-zinc-150 p-1 bg-white shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-11 h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-400 font-extrabold text-sm shrink-0 uppercase">
                          {c.companyName?.slice(0, 2) || 'CP'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">{c.companyName}</h3>
                        <p className="text-[10px] text-zinc-400 font-semibold">{c.businessCategory || t('Fleet Management')}</p>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      c.subscription?.subscriptionStatus === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                        : isSuspended
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {c.subscription?.subscriptionStatus || 'Inactive'}
                    </span>
                  </div>

                  {/* Limits and details */}
                  <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-950/20 p-3 rounded-2xl border border-zinc-150/40 dark:border-zinc-800/40">
                    <div className="text-center">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('User Limit')}</span>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{c.subscription?.maxUserLimit || '50'}</p>
                    </div>
                    <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{t('Vehicle Limit')}</span>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{c.subscription?.maxVehicleLimit || '100'}</p>
                    </div>
                  </div>

                  {/* Owner info block */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="truncate">{c.owner?.name || t('N/A')} ({c.owner?.email || t('No Email')})</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{t('Expires')}: <span className="font-bold text-zinc-800 dark:text-zinc-200">{c.subscription?.expiryDate || t('No Date')}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{t('Package')}: <span className="font-bold text-zinc-800 dark:text-zinc-200">{c.subscription?.subscriptionPackage || t('Yearly')}</span></span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-150/50 dark:hover:bg-zinc-800/40 transition-all`}
                      title={isSuspended ? t('Activate Subscription') : t('Suspend Subscription')}
                    >
                      {isSuspended ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4 text-rose-500" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                      title={t('Edit Details')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteCompany(c.id, c.companyName)}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                    title={t('Delete Company')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination component */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 px-5 py-3 rounded-2xl">
          <span className="text-xs text-zinc-400 font-semibold">
            {t('Showing page {current} of {total}', { current: currentPage, total: totalPages })}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Core Registration Modal Triggered by Super Admin button click */}
      <CompanyRegistrationModal 
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => { setIsRegisterOpen(false); fetchCompanies(); }}
        themeColor={themeColor}
        triggerToast={triggerToast}
      />

      {/* Edit Details Popup Modal */}
      <AnimatePresence>
        {isEditOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">{t('Edit Company Profile')}</h3>
                <button onClick={() => setIsEditOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4">
                <FloatingInput 
                  label={t('Company Name')}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  themeColor={themeColor}
                />
                <FloatingInput 
                  label={t('Company Contact Phone')}
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  themeColor={themeColor}
                />
                <FloatingInput 
                  label={t('Company Email')}
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  themeColor={themeColor}
                />
                <FloatingSelect 
                  label={t('Company Type')}
                  value={editType}
                  onChange={val => setEditType(val)}
                  category="CompanyType"
                  fallbackOptions={['Proprietorship', 'Partnership', 'Private Limited', 'Public Limited']}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput 
                    label={t('Max User Limit')}
                    type="number"
                    value={editMaxUsers}
                    onChange={e => setEditMaxUsers(e.target.value)}
                    themeColor={themeColor}
                  />
                  <FloatingInput 
                    label={t('Max Vehicle Limit')}
                    type="number"
                    value={editMaxVehicles}
                    onChange={e => setEditMaxVehicles(e.target.value)}
                    themeColor={themeColor}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="h-9 px-4 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t('Cancel')}
                </button>
                <ActionButton
                  onClick={handleSaveEdit}
                  isLoading={isSaving}
                  actionType="save"
                  className={`h-9 px-4 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 ${themeBg}`}
                >
                  {t('Save Changes')}
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
