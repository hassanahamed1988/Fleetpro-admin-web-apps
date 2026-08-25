import { ActionButton } from "./ActionButton";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, Plus, Edit2, Trash2, Shield, 
  ToggleLeft, ToggleRight, X, UserCheck, Key, Eye, Check,
  Mail, Phone, Globe, Calendar, Briefcase, Activity, Flag, MapPin, FileText, Hash, Users, Heart, HeartHandshake, Award, Building, Compass, Map, Locate, Navigation, Layers, ShieldAlert, Send, Inbox, Lock, Camera, User as UserIcon
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';
import { FloatingInput } from './FloatingInput';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedSearchBar } from './AnimatedSearchBar';
import { UserProfileModal } from './UserProfileModal';

interface UserManagementViewProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => Promise<boolean>;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
  currentUserRole?: string;
}

export const getCountryFlag = (value: string): string => {
  if (!value) return '';
  const val = value.toLowerCase().trim();
  
  // Country names
  if (val.includes('bangladesh')) return '🇧🇩';
  if (val.includes('qatar')) return '🇶🇦';
  if (val.includes('saudi')) return '🇸🇦';
  if (val.includes('united states') || val.includes('usa') || val.includes('america')) return '🇺🇸';
  if (val.includes('united kingdom') || val.includes('uk') || val.includes('british')) return '🇬🇧';
  if (val.includes('india')) return '🇮🇳';
  
  // Nationalities
  if (val.includes('bangladeshi')) return '🇧🇩';
  if (val.includes('qatari')) return '🇶🇦';
  if (val.includes('saudi')) return '🇸🇦';
  if (val.includes('american')) return '🇺🇸';
  if (val.includes('british')) return '🇬🇧';
  if (val.includes('indian')) return '🇮🇳';
  
  // Country codes
  if (val === '+880') return '🇧🇩';
  if (val === '+974') return '🇶🇦';
  if (val === '+966') return '🇸🇦';
  if (val === '+1') return '🇺🇸';
  if (val === '+44') return '🇬🇧';
  if (val === '+91') return '🇮🇳';
  
  return '';
};

// Generates a unique 6-8 digit numeric ID for an Admin Owner / Super Admin /
// Admin account. This ID is later stamped onto every mobile app user account
// that admin creates (see MobileApp.tsx / server.ts), purely so the system
// can record which admin created which mobile user. It is unrelated to,
// and does not change, the mobile user's own UserId format.
const generateAdminUniqueId = (existingUsers: User[], excludeUserId?: string): string => {
  const existingIds = new Set<string>();
  (existingUsers || []).forEach(u => {
    if (excludeUserId && u.id === excludeUserId) return;
    if (u.adminOwnerId) existingIds.add(String(u.adminOwnerId).trim());
  });

  let generated = '';
  let attempts = 0;
  do {
    const digitLength = 6 + Math.floor(Math.random() * 3); // 6, 7, or 8
    const min = Math.pow(10, digitLength - 1);
    const max = Math.pow(10, digitLength) - 1;
    generated = String(Math.floor(min + Math.random() * (max - min + 1)));
    attempts++;
  } while (existingIds.has(generated) && attempts < 10000);

  return generated;
};

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  themeColor,
  triggerToast,
  triggerConfirm,
  currentUserRole,
}) => {
  const { language, t, formatNumber, formatDate, toDigits } = useLanguage();
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'role' | 'status' | 'joinDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Operator');
  const [formStatus, setFormStatus] = useState<UserStatus>('Pending');
  const [formDepartment, setFormDepartment] = useState('');
  const [formPermissions, setFormPermissions] = useState({
    dashboard: true,
    users: false,
    vehicles: false,
    settings: false,
    auditLogs: false,
  });
  const [formCustomFields, setFormCustomFields] = useState<Array<{ key: string; value: string }>>([]);
  const [formFeatures, setFormFeatures] = useState<Array<string>>([]);

  // 17 Custom Profile Form States
  const [formNationality, setFormNationality] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formMobileCode, setFormMobileCode] = useState('');
  const [formDocumentsType, setFormDocumentsType] = useState('');
  const [formDocumentNumber, setFormDocumentNumber] = useState('');
  const [formDocumentIssueDate, setFormDocumentIssueDate] = useState('');
  const [formDocumentExpiryDate, setFormDocumentExpiryDate] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formReligion, setFormReligion] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formProfession, setFormProfession] = useState('');
  const [formBuildingNumber, setFormBuildingNumber] = useState('');
  const [formZoneNumber, setFormZoneNumber] = useState('');
  const [formStateNumber, setFormStateNumber] = useState('');
  const [formAreaName, setFormAreaName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formPoliceStation, setFormPoliceStation] = useState('');
  const [formPostOfficeName, setFormPostOfficeName] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');

  // Additional New Profile States
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formMustChangePassword, setFormMustChangePassword] = useState(true);
  const [formRequireMFA, setFormRequireMFA] = useState(false);

  // User ID and Account Type states
  const [formUsername, setFormUsername] = useState('');
  const [formAccountType, setFormAccountType] = useState('');

  // Helper to load dropdown options from local Control Panel database
  const getDropdownOptions = (category: string, fallback: string[]): string[] => {
    try {
      const saved = localStorage.getItem('fleetpro_control_panel_db');
      if (saved) {
        const db = JSON.parse(saved);
        if (db && Array.isArray(db[category]) && db[category].length > 0) {
          return db[category].map((item: any) => item.name);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return fallback;
  };

  // Reusable Floating Select dropdown component that matches the global style perfectly
  const FloatingSelect = ({
    label,
    value,
    onChange,
    category,
    fallbackOptions,
    icon,
    disabled = false,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    category: string;
    fallbackOptions: string[];
    icon?: React.ReactNode;
    disabled?: boolean;
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const options = getDropdownOptions(category, fallbackOptions);

    const themeFocusBorder = {
      blue: 'focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500',
      emerald: 'focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500',
      red: 'focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500',
      amber: 'focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500',
      purple: 'focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500',
    };

    const themeLabelText = {
      blue: 'text-indigo-600 dark:text-indigo-400',
      emerald: 'text-emerald-600 dark:text-emerald-400',
      red: 'text-rose-600 dark:text-rose-400',
      amber: 'text-amber-600 dark:text-amber-400',
      purple: 'text-purple-600 dark:text-purple-400',
    };

    const hasValue = value !== undefined && value !== null && value !== '';
    const isFloating = isFocused || hasValue;
    const hasIcon = !!icon;
    const contentLeft = hasIcon ? '44px' : '14px';

    return (
      <div
        className={`relative w-full h-[52px] rounded-[8px] border bg-white dark:bg-zinc-900 flex items-center transition-all ${
          disabled
            ? 'border-zinc-200 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-950/20 opacity-60 cursor-not-allowed'
            : `border-zinc-300 dark:border-zinc-800 ${isFocused ? 'shadow-sm' : ''} ${themeFocusBorder[themeColor]}`
        }`}
      >
        {/* Animated Icon */}
        {hasIcon && (
          <div 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 text-zinc-500 dark:text-zinc-400"
          >
            {icon}
          </div>
        )}

        <select
          value={value}
          onChange={(e) => {
            if (disabled) return;
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (disabled) return;
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`w-full h-full text-sm text-zinc-900 dark:text-zinc-50 bg-transparent outline-none border-none appearance-none ${
            disabled ? 'cursor-not-allowed text-zinc-400' : 'cursor-pointer'
          }`}
          style={{ paddingLeft: contentLeft, paddingRight: '34px' }}
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-zinc-400"></option>
          {options.map((opt) => {
            const countryFlag = getCountryFlag(opt);
            const displayText = countryFlag ? `${countryFlag} ${opt}` : opt;
            return (
              <option key={opt} value={opt} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                {displayText}
              </option>
            );
          })}
        </select>

        {/* Floating Label */}
        <span
          className={`absolute transition-all duration-300 pointer-events-none select-none z-10 ${
            isFloating
              ? `top-0 -translate-y-1/2 text-[11px] font-bold px-1.5 bg-white dark:bg-zinc-900 ${
                  isFocused ? themeLabelText[themeColor] : 'text-zinc-600 dark:text-zinc-300'
                }`
              : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400 bg-transparent'
          }`}
          style={{ left: isFloating ? '12px' : contentLeft }}
        >
          {t(label)}
        </span>
        
        {/* custom indicator arrow for clean look */}
        <div className="absolute right-3.5 pointer-events-none text-zinc-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  };

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

  const themeFocusRing = {
    blue: 'focus:ring-blue-500/20 focus:border-blue-500',
    emerald: 'focus:ring-emerald-500/20 focus:border-emerald-500',
    red: 'focus:ring-rose-500/20 focus:border-rose-500',
    amber: 'focus:ring-amber-500/20 focus:border-amber-500',
    purple: 'focus:ring-purple-500/20 focus:border-purple-500',
  };

  const themeCheckBg = {
    blue: 'checked:bg-blue-500',
    emerald: 'checked:bg-emerald-500',
    red: 'checked:bg-rose-500',
    amber: 'checked:bg-amber-500',
    purple: 'checked:bg-purple-500',
  };

  // Filtered & Sorted users
  const filteredUsers = users
    .filter((u) => {
      const sLower = (search || '').toLowerCase();
      const uName = (u?.name || '').toLowerCase();
      const uEmail = (u?.email || '').toLowerCase();
      const uPhone = String(u?.phone || '');

      const matchesSearch =
        uName.includes(sLower) ||
        uEmail.includes(sLower) ||
        uPhone.includes(search || '');

      const matchesRole = roleFilter === 'All' || u?.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || u?.status === statusFilter;
      const isMobileAppUser = u?.accountType === 'MOBILE_APP' || u?.role === 'Users' || u?.role === 'USER';
      return matchesSearch && matchesRole && matchesStatus && u?.role !== 'Admin Owner' && !isMobileAppUser;
    })
    .sort((a, b) => {
      const aVal = String(a[sortField] ?? '');
      const bVal = String(b[sortField] ?? '');
      if (sortOrder === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: 'name' | 'role' | 'status' | 'joinDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const openViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsViewProfileOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    const nameParts = (user.name || '').trim().split(/\s+/);
    setFormFirstName(nameParts[0] || '');
    setFormLastName(nameParts.slice(1).join(' ') || '');
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormDepartment(user.department);
    setFormPermissions({ ...user.permissions });

    // Initialize 17 custom profile states from editing user
    setFormNationality(user.nationality || '');
    setFormCountry(user.country || '');
    setFormMobileCode(user.mobileCode || '');
    setFormDocumentsType(user.documentsType || '');
    setFormDocumentNumber(user.documentNumber || '');
    setFormDocumentIssueDate(user.documentIssueDate || '');
    setFormDocumentExpiryDate(user.documentExpiryDate || '');
    setFormGender(user.gender || '');
    setFormReligion(user.religion || '');
    setFormRelationship(user.relationship || '');
    setFormProfession(user.profession || '');
    setFormBuildingNumber(user.buildingNumber || '');
    setFormZoneNumber(user.zoneNumber || '');
    setFormStateNumber(user.stateNumber || '');
    setFormAreaName(user.areaName || '');
    setFormCity(user.city || '');
    setFormRegion(user.region || '');
    setFormPoliceStation(user.policeStation || '');
    setFormPostOfficeName(user.postOfficeName || '');
    setFormPostalCode(user.postalCode || '');

    // Additional Profile States
    setFormDateOfBirth(user.dateOfBirth || '');
    setFormAvatarUrl(user.avatarUrl || '');
    setFormPassword('');
    setFormMustChangePassword(user.mustChangeCredentials !== false);
    setFormRequireMFA(user.is2faSetupRequired === true);
    setFormUsername(user.username || '');
    setFormAccountType(user.accountType || '');

    // Extract mobile app custom profile fields
    const standardKeys = [
      'id', 'name', 'email', 'phone', 'role', 'status', 'department', 'joinDate', 
      'lastLogin', 'passwordHash', 'permissions', 'dbSource', 'avatar', 'avatarUrl', 
      'mustChangeCredentials', 'forcePasswordReset', 'is2faEnabled', 'is2faSetupRequired', 
      'totpSecretEncrypted', 'trustedDeviceTokens', 'username', 'features', 'allowedFeatures',
      'generatedUserId', 'employeeId', 'adminOwnerId', 'createdBy', 'loginEmail', 'mobileNumber',
      'mobileModulePermissions', 'companyId'
    ];
    const custom = Object.entries(user)
      .filter(([key, val]) => !standardKeys.includes(key) && (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean'))
      .map(([key, val]) => ({ key, value: String(val) }));
    setFormCustomFields(custom);

    // Extract mobile app feature access list
    let feats: string[] = [];
    if (Array.isArray((user as any).features)) {
      feats = (user as any).features;
    } else if (typeof (user as any).features === 'object' && (user as any).features !== null) {
      feats = Object.entries((user as any).features)
        .filter(([_, allowed]) => !!allowed)
        .map(([name]) => name);
    } else if (Array.isArray((user as any).allowedFeatures)) {
      feats = (user as any).allowedFeatures;
    }
    setFormFeatures(feats);

    setIsEditModalOpen(true);
  };

  const openAddModal = () => {
    setFormName('');
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Operator');
    setFormStatus('Pending');
    setFormDepartment('Operations');
    setFormPermissions({
      dashboard: true,
      users: false,
      vehicles: false,
      settings: false,
      auditLogs: false,
    });
    setFormCustomFields([]);
    setFormFeatures([]);

    // Clear 17 custom profile states
    setFormNationality('');
    setFormCountry('');
    setFormMobileCode('');
    setFormDocumentsType('');
    setFormDocumentNumber('');
    setFormDocumentIssueDate('');
    setFormDocumentExpiryDate('');
    setFormGender('');
    setFormReligion('');
    setFormRelationship('');
    setFormProfession('');
    setFormBuildingNumber('');
    setFormZoneNumber('');
    setFormStateNumber('');
    setFormAreaName('');
    setFormCity('');
    setFormRegion('');
    setFormPoliceStation('');
    setFormPostOfficeName('');
    setFormPostalCode('');

    // Additional Profile States
    setFormDateOfBirth('');
    setFormAvatarUrl('');
    setFormPassword('');
    setFormMustChangePassword(true);
    setFormRequireMFA(false);
    setFormUsername('');
    setFormAccountType('');

    setIsAddModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      triggerToast(
        t('Validation Error'),
        t('Name and Email are required fields.'),
        'error'
      );
      return;
    }

    // SECURITY: Only Admin Owner can assign Super Admin or Admin role
    if (['Super Admin', 'Admin'].includes(formRole) && currentUserRole !== 'Admin Owner') {
      triggerToast(
        t('Access Denied'),
        t('Only Admin Owner can assign Super Admin or Admin roles.'),
        'error'
      );
      return;
    }
    
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 600));

    if (selectedUser) {
      const updatedUser: User = {
        ...selectedUser,
        name: formName,
        email: formEmail,
        phone: formPhone,
        role: formRole,
        status: formStatus,
        department: formDepartment,
        permissions: formPermissions,
        nationality: formNationality,
        country: formCountry,
        mobileCode: formMobileCode,
        documentsType: formDocumentsType,
        documentNumber: formDocumentNumber,
        gender: formGender,
        religion: formReligion,
        relationship: formRelationship,
        profession: formProfession,
        buildingNumber: formBuildingNumber,
        zoneNumber: formZoneNumber,
        stateNumber: formStateNumber,
        areaName: formAreaName,
        city: formCity,
        region: formRegion,
        policeStation: formPoliceStation,
        postOfficeName: formPostOfficeName,
        postalCode: formPostalCode,
        dateOfBirth: formDateOfBirth,
        avatarUrl: formAvatarUrl,
        mustChangeCredentials: formMustChangePassword,
        is2faSetupRequired: formRequireMFA,
        username: formUsername || formEmail,
        accountType: formAccountType,
        documentIssueDate: formDocumentIssueDate,
        documentExpiryDate: formDocumentExpiryDate,
        generatedUserId: selectedUser.generatedUserId,
        employeeId: selectedUser.employeeId || selectedUser.generatedUserId,
        adminOwnerId: selectedUser.adminOwnerId,
        createdBy: selectedUser.createdBy,
        loginEmail: selectedUser.loginEmail || formEmail,
        mobileNumber: selectedUser.mobileNumber || formPhone,
        mobileModulePermissions: selectedUser.mobileModulePermissions,
        companyId: selectedUser.companyId,
        ...(formPassword ? { password: formPassword } : {}),
      };

      // Clean up previous non-standard keys so deleted ones are cleared
      const standardKeys = [
        'id', 'name', 'email', 'phone', 'role', 'status', 'department', 'joinDate', 
        'lastLogin', 'passwordHash', 'permissions', 'dbSource', 'avatar', 'avatarUrl', 
        'mustChangeCredentials', 'forcePasswordReset', 'is2faEnabled', 'is2faSetupRequired', 
        'totpSecretEncrypted', 'trustedDeviceTokens', 'username', 'features', 'allowedFeatures',
        'nationality', 'country', 'mobileCode', 'documentsType', 'documentNumber', 'gender', 'religion', 'relationship',
        'profession', 'buildingNumber', 'zoneNumber', 'stateNumber', 'areaName', 'city', 'region',
        'policeStation', 'postOfficeName', 'postalCode', 'dateOfBirth', 'accountType', 'documentIssueDate', 'documentExpiryDate',
        'generatedUserId', 'employeeId', 'adminOwnerId', 'createdBy', 'loginEmail', 'mobileNumber', 'mobileModulePermissions', 'companyId'
      ];
      Object.keys(updatedUser).forEach(key => {
        if (!standardKeys.includes(key)) {
          delete (updatedUser as any)[key];
        }
      });

      // Insert updated custom fields
      formCustomFields.forEach(field => {
        if (field.key.trim()) {
          (updatedUser as any)[field.key.trim()] = field.value;
        }
      });

      // Insert updated features list
      (updatedUser as any).features = formFeatures;
      (updatedUser as any).allowedFeatures = formFeatures;

      setIsProcessing(false);
      setIsEditModalOpen(false);
      onUpdateUser(updatedUser);
      triggerToast(
        t('✓ User Updated'),
        t('User information has been successfully updated.'),
        'success'
      );
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      triggerToast(
        t('Validation Error'),
        t('Name and Email are required.'),
        'error'
      );
      return;
    }

    // SECURITY: Only Admin Owner can create Super Admin or Admin accounts
    if (['Super Admin', 'Admin'].includes(formRole) && currentUserRole !== 'Admin Owner') {
      triggerToast(
        t('Access Denied'),
        t('Only Admin Owner can create Super Admin or Admin accounts.'),
        'error'
      );
      return;
    }
    
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 600));
    
    const ADMIN_ROLES_WITH_OWN_ID: UserRole[] = ['Admin Owner', 'Super Admin', 'Admin'];
    const newUser: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      // Admin Owner / Super Admin / Admin accounts each get their own unique
      // 6-8 digit ID. This gets stamped onto every mobile app user account
      // this admin later creates, purely so the system can record which
      // admin created which mobile user. Mobile users' own ID format is
      // untouched by this.
      adminOwnerId: ADMIN_ROLES_WITH_OWN_ID.includes(formRole)
        ? generateAdminUniqueId(users)
        : undefined,
      name: formName,
      email: formEmail,
      username: formUsername || formEmail,
      accountType: formAccountType,
      phone: formPhone,
      role: formRole,
      status: formStatus,
      department: formDepartment,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      is2faEnabled: false,
      permissions: formPermissions,
      nationality: formNationality,
      country: formCountry,
      mobileCode: formMobileCode,
      documentsType: formDocumentsType,
      documentNumber: formDocumentNumber,
      documentIssueDate: formDocumentIssueDate,
      documentExpiryDate: formDocumentExpiryDate,
      gender: formGender,
      religion: formReligion,
      relationship: formRelationship,
      profession: formProfession,
      buildingNumber: formBuildingNumber,
      zoneNumber: formZoneNumber,
      stateNumber: formStateNumber,
      areaName: formAreaName,
      city: formCity,
      region: formRegion,
      policeStation: formPoliceStation,
      postOfficeName: formPostOfficeName,
      postalCode: formPostalCode,
      dateOfBirth: formDateOfBirth,
      avatarUrl: formAvatarUrl,
      mustChangeCredentials: formMustChangePassword,
      is2faSetupRequired: formRequireMFA,
      password: formPassword || 'temp1234',
      dbSource: 'mobile',
    };

    // Insert custom fields
    formCustomFields.forEach(field => {
      if (field.key.trim()) {
        (newUser as any)[field.key.trim()] = field.value;
      }
    });

    // Insert features list
    (newUser as any).features = formFeatures;
    (newUser as any).allowedFeatures = formFeatures;

    onAddUser(newUser);
    setIsProcessing(false);
    setIsAddModalOpen(false);
    triggerToast(
      t('✓ User Created'),
      t('{name} has been registered as {role}.', { name: formName, role: t(formRole) }),
      'success'
    );
  };

  const handleDeleteClick = (user: User) => {
    triggerConfirm(
      t('Delete User?'),
      t('This action cannot be undone. Are you sure you want to delete {name}?', { name: user.name }),
      async () => {
        // Wait for confirmation that the backend actually deleted the
        // record before telling the admin it succeeded. If the delete
        // failed, onDeleteUser already surfaced an error toast, so we
        // simply skip the success toast here.
        const deleted = await onDeleteUser(user.id);
        if (deleted) {
          triggerToast(
            t('✓ User Deleted'),
            t('The user account was successfully deleted.'),
            'success'
          );
        }
      }
    );
  };

  const toggleStatus = (user: User) => {
    const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const updatedUser: User = { ...user, status: nextStatus };
    triggerConfirm(
      nextStatus === 'Active' ? t('Activate User?') : t('Deactivate User?'),
      t("Are you sure you want to set {name}'s status to {status}?", { name: user.name, status: t(nextStatus) }),
      () => {
        onUpdateUser(updatedUser);
        triggerToast(
          nextStatus === 'Active' ? t('✓ User Activated') : t('✓ User Deactivated'),
          t('User account status changed to {status}.', { status: t(nextStatus) }),
          'success'
        );
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('User Directory')}
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {t('Manage administrative credentials, system roles, and account access permissions.')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className={`h-[40px] px-4 rounded-[8px] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${themeBg[themeColor]}`}
        >
          <Plus className="w-4 h-4" />
          {t('Add New User')}
        </button>
      </div>

      {/* Filters Segment */}
      <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row gap-4 items-center shadow-xs">
        {/* Search */}
        <AnimatedSearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder={t('Search by name, email, phone...')}
          themeColor={themeColor}
        />

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3.5 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-medium">{t('Role:')}</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 text-xs px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="All">{t('All Roles')}</option>
              <option value="Admin Owner">{t('Admin Owner')}</option>
              <option value="Super Admin">{t('Super Admin')}</option>
              <option value="Admin">{t('Admin')}</option>
              <option value="Manager">{t('Manager')}</option>
              <option value="Operator">{t('Operator')}</option>
              <option value="Users">{t('Users')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-medium">{t('Status:')}</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 text-xs px-3 rounded-[8px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="All">{t('All Statuses')}</option>
              <option value="Active">{t('Active')}</option>
              <option value="Inactive">{t('Inactive')}</option>
              <option value="Pending">{t('Pending')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Responsive User Listing */}
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800/80">
                <th 
                  onClick={() => handleSort('name')}
                  className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {t('User Info')} {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th 
                  onClick={() => handleSort('role')}
                  className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {t('Role')} {sortField === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {t('Department')}
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {t('Status')} {sortField === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th 
                  onClick={() => handleSort('joinDate')}
                  className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {t('Joined')} {sortField === 'joinDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-6 py-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider text-right">
                  {t('Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} referrerPolicy="no-referrer" alt={user.name} className="w-10 h-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-sm">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{t(user.name)}</h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{user.email}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{toDigits(user.phone)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                        <Shield className="w-3.5 h-3.5 text-zinc-400" />
                        {t(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {t(user.department)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : user.status === 'Pending'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : user.status === 'Blocked'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Pending' ? 'bg-amber-500' : user.status === 'Blocked' ? 'bg-rose-500' : 'bg-zinc-400'
                        }`} />
                        {t(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {formatDate(user.joinDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() => toggleStatus(user)}
                          title={user.status === 'Active' ? t('Deactivate User') : t('Activate User')}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                          {user.status === 'Active' ? (
                            <ToggleRight className={`w-5 h-5 ${themeText[themeColor]}`} />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-zinc-400" />
                          )}
                        </button>
                        
                        {/* View profile */}
                        <button
                          onClick={() => openViewProfile(user)}
                          title={t('View Profile Details')}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit user */}
                        <button
                          onClick={() => openEditModal(user)}
                          title={t('Edit User Info')}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete user */}
                        <button
                          onClick={() => handleDeleteClick(user)}
                          title={t('Delete User')}
                          disabled={user.role === 'Admin Owner'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.role === 'Admin Owner' 
                              ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' 
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-zinc-400">
                    {t('No users matching your search filters.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div key={user.id} className="p-4 space-y-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} referrerPolicy="no-referrer" alt={user.name} className="w-10 h-10 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-sm">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{t(user.name)}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    user.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : user.status === 'Pending'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : user.status === 'Blocked'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {t(user.status)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] bg-zinc-50 dark:bg-zinc-800/30 p-2.5 rounded-lg text-zinc-500 dark:text-zinc-400">
                  <div>
                    <span className="font-medium text-zinc-400">{t('Role:')} </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t(user.role)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-400">{t('Joined')}: </span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200">{formatDate(user.joinDate)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-1 border-t border-zinc-50 dark:border-zinc-800/40">
                  <button
                    onClick={() => toggleStatus(user)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 flex items-center gap-1.5 text-xs font-medium"
                  >
                    {t('Status')}
                    {user.status === 'Active' ? (
                      <ToggleRight className={`w-4 h-4 ${themeText[themeColor]}`} />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>

                  <button
                    onClick={() => openViewProfile(user)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('View')}
                  </button>

                  <button
                    onClick={() => openEditModal(user)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {t('Edit')}
                  </button>

                  <button
                    onClick={() => handleDeleteClick(user)}
                    disabled={user.role === 'Admin Owner'}
                    className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium ${
                      user.role === 'Admin Owner'
                        ? 'border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                        : 'border-rose-100 dark:border-rose-950/40 text-rose-400 hover:text-rose-600'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('Delete')}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-zinc-400">
              {t('No users matching your search filters.')}
            </div>
          )}
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/10 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {t('Showing {start} - {end} of {total} users', {
                start: formatNumber((currentPage - 1) * itemsPerPage + 1),
                end: formatNumber(Math.min(currentPage * itemsPerPage, filteredUsers.length)),
                total: formatNumber(filteredUsers.length)
              })}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 disabled:opacity-40"
              >
                {t('Prev')}
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 disabled:opacity-40"
              >
                {t('Next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Popup - Complete Responsive Section & Device Management */}
      {selectedUser && (
        <UserProfileModal
          isOpen={isViewProfileOpen}
          onClose={() => setIsViewProfileOpen(false)}
          user={selectedUser}
          onUpdateUser={(updated) => {
            setSelectedUser(updated);
            onUpdateUser(updated);
          }}
          triggerToast={triggerToast}
          triggerConfirm={triggerConfirm}
        />
      )}

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {(isEditModalOpen || isAddModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setIsAddModalOpen(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full app-fluid-modal bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200/20 max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {isEditModalOpen 
                    ? t('Modify User Profile') 
                    : t('Register New User')}
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsAddModalOpen(false);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={isEditModalOpen ? handleUpdate : handleAdd} className="overflow-y-auto flex-1 p-6 space-y-8">
                {/* CATEGORY 1: PERSONAL INFORMATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('1. Personal Information')}
                    </h4>
                  </div>

                  {/* Profile Photo Upload Frame / Avatar Selector */}
                  <div className="flex flex-col items-center justify-center gap-3 p-4 bg-zinc-50/50 dark:bg-zinc-800/10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-zinc-900 shadow-md">
                      <img 
                        src={formAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'} 
                        alt="Avatar Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-200">
                        <Camera className="w-4 h-4 text-white mb-0.5" />
                        <span className="text-[9px] text-white font-semibold">{t('Upload')}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Simulate successful local photo upload with preset mock images
                              const mockUrls = [
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
                                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
                                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
                              ];
                              const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
                              setFormAvatarUrl(randomUrl);
                              triggerToast(t('✓ Photo Uploaded'), t('Profile picture updated successfully.'), 'success');
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const presetAvatars = [
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
                            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
                            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80',
                            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80'
                          ];
                          const randomAvatar = presetAvatars[Math.floor(Math.random() * presetAvatars.length)];
                          setFormAvatarUrl(randomAvatar);
                        }}
                        className="text-[10px] font-bold px-3 py-1 rounded-[6px] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                      >
                        {t('Pick Random Avatar')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormAvatarUrl('')}
                        className="text-[10px] font-bold px-3 py-1 rounded-[6px] border border-rose-100 dark:border-rose-950/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                      >
                        {t('Remove')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Row 1: First Name, Last Name, Date of Birth */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
                      <div className="col-span-1 md:col-span-2">
                        <FloatingInput
                          label={t('First Name *')}
                          value={formFirstName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormFirstName(val);
                            setFormName(`${val.trim()} ${formLastName.trim()}`.trim());
                          }}
                          themeColor={themeColor}
                          icon={<UserIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                          required
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <FloatingInput
                          label={t('Last Name *')}
                          value={formLastName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormLastName(val);
                            setFormName(`${formFirstName.trim()} ${val.trim()}`.trim());
                          }}
                          themeColor={themeColor}
                          icon={<UserIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                          required
                        />
                      </div>

                      <div className="col-span-1 md:col-span-1">
                        <FloatingInput
                          label={t('Date of Birth')}
                          value={formDateOfBirth}
                          onChange={(e) => setFormDateOfBirth(e.target.value)}
                          type="date"
                          themeColor={themeColor}
                          icon={<Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        />
                      </div>
                    </div>

                    {/* Row 2: Nationality, Gender, Religion, Profession */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <div className="col-span-1">
                        <FloatingSelect
                          label="Nationality"
                          value={formNationality}
                          onChange={setFormNationality}
                          category="Nationality"
                          fallbackOptions={['Bangladeshi', 'Qatari', 'Saudi', 'American', 'British', 'Indian']}
                          icon={<Flag className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        />
                      </div>

                      <div className="col-span-1">
                        <FloatingSelect
                          label="Gender"
                          value={formGender}
                          onChange={setFormGender}
                          category="Gender"
                          fallbackOptions={['Male', 'Female', 'Other']}
                          icon={<Users className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        />
                      </div>

                      <div className="col-span-1">
                        <FloatingSelect
                          label="Religion"
                          value={formReligion}
                          onChange={setFormReligion}
                          category="Religion"
                          fallbackOptions={['Islam', 'Hinduism', 'Christianity', 'Buddhism']}
                          icon={<Heart className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        />
                      </div>

                      <div className="col-span-1">
                        <FloatingSelect
                          label="Profession"
                          value={formProfession}
                          onChange={setFormProfession}
                          category="Profession"
                          fallbackOptions={['Software Engineer', 'Fleet Operator', 'Professional Driver', 'Admin Manager', 'Field Supervisor']}
                          icon={<Award className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        />
                      </div>
                    </div>

                    {/* Row 3: Country Code, Phone Number, Email Address */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <div className="col-span-1">
                        <FloatingSelect
                          label="Country Code"
                          value={formMobileCode}
                          onChange={setFormMobileCode}
                          category="Mobile Code"
                          fallbackOptions={['+880', '+974', '+966', '+1', '+44', '+91']}
                          icon={<Globe className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        />
                      </div>

                      <div className="col-span-1">
                        <FloatingInput
                          label={t('Phone Number')}
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          themeColor={themeColor}
                          icon={<Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <FloatingInput
                          label={t('Email Address *')}
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          type="email"
                          themeColor={themeColor}
                          icon={<Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CATEGORY 2: IDENTITY DOCUMENTATION */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('2. Identity Documentation')}
                    </h4>
                  </div>

                  <div className="app-form-grid">
                    <div className="col-span-1">
                      <FloatingSelect
                        label="Documents Type"
                        value={formDocumentsType}
                        onChange={setFormDocumentsType}
                        category="Documents Type"
                        fallbackOptions={['NID', 'Passport', 'Driving License', 'Birth Certificate', 'QID (Qatar ID)']}
                        icon={<FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      />
                    </div>

                    {/* Dynamic Document Number, Issue Date, Expiry Date Input Boxes */}
                    {formDocumentsType && (
                      <>
                        <div className="col-span-1">
                          <FloatingInput
                            label={(() => {
                              const tLower = formDocumentsType.toLowerCase().trim();
                              if (tLower.includes('passport')) return t('Passport Number');
                              if (tLower.includes('nid') || tLower.includes('id') || tLower.includes('qid')) return t('Enter ID Number');
                              if (tLower.includes('driving') || tLower.includes('license')) return t('Driving license numbers');
                              return t('{docType} Number', { docType: formDocumentsType });
                            })()}
                            value={formDocumentNumber}
                            onChange={(e) => setFormDocumentNumber(e.target.value)}
                            themeColor={themeColor}
                            icon={<Hash className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                            required
                          />
                        </div>

                        <div className="col-span-1">
                          <FloatingInput
                            label={t('Document Issue Date')}
                            value={formDocumentIssueDate}
                            onChange={(e) => setFormDocumentIssueDate(e.target.value)}
                            type="date"
                            themeColor={themeColor}
                            icon={<Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                          />
                        </div>

                        <div className="col-span-1">
                          <FloatingInput
                            label={t('Expiry Date')}
                            value={formDocumentExpiryDate}
                            onChange={(e) => setFormDocumentExpiryDate(e.target.value)}
                            type="date"
                            themeColor={themeColor}
                            icon={<Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* CATEGORY 3: ADDRESS COORDINATES */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('3. Address Coordinates')}
                    </h4>
                  </div>

                  <div className="app-form-grid">
                    <FloatingSelect
                      label="Country"
                      value={formCountry}
                      onChange={setFormCountry}
                      category="Country"
                      fallbackOptions={['Bangladesh', 'Qatar', 'Saudi Arabia', 'United States', 'United Kingdom', 'India']}
                      icon={<MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                    />

                    <FloatingSelect
                      label="Region"
                      value={formRegion}
                      onChange={setFormRegion}
                      category="Region"
                      fallbackOptions={['Dhaka Division', 'Ad Dawhah', 'Ar Riyad']}
                      icon={<Layers className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <FloatingSelect
                      label="City"
                      value={formCity}
                      onChange={setFormCity}
                      category="City"
                      fallbackOptions={['Dhaka', 'Doha', 'Riyadh', 'New York']}
                      icon={<Navigation className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <FloatingSelect
                      label="Police Station"
                      value={formPoliceStation}
                      onChange={setFormPoliceStation}
                      category="Police Station"
                      fallbackOptions={['Gulshan Thana', 'Banani Thana', 'Al Sadd Precinct']}
                      icon={<ShieldAlert className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <FloatingSelect
                      label="Post office Name"
                      value={formPostOfficeName}
                      onChange={setFormPostOfficeName}
                      category="Post office Name"
                      fallbackOptions={['Gulshan GPO', 'Doha Central GPO']}
                      icon={<Send className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <FloatingSelect
                      label="Postal code"
                      value={formPostalCode}
                      onChange={setFormPostalCode}
                      category="Postal code"
                      fallbackOptions={['1212', '1213', '3050']}
                      icon={<Inbox className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <FloatingInput
                      label={t('Building Number')}
                      value={formBuildingNumber}
                      onChange={(e) => setFormBuildingNumber(e.target.value)}
                      themeColor={themeColor}
                      icon={<Building className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <FloatingInput
                      label={t('Zone Number')}
                      value={formZoneNumber}
                      onChange={(e) => setFormZoneNumber(e.target.value)}
                      themeColor={themeColor}
                      icon={<Compass className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <FloatingInput
                      label={t('State number')}
                      value={formStateNumber}
                      onChange={(e) => setFormStateNumber(e.target.value)}
                      themeColor={themeColor}
                      icon={<Map className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      disabled={!formCountry}
                    />

                    <div className="col-span-1 md:col-span-3">
                      <FloatingInput
                        label={t('Area Name')}
                        value={formAreaName}
                        onChange={(e) => setFormAreaName(e.target.value)}
                        themeColor={themeColor}
                        icon={<Locate className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                        disabled={!formCountry}
                      />
                    </div>
                  </div>
                </div>

                {/* CATEGORY 4: ACCESS & PERMISSIONS */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('4. Access & Permissions')}
                    </h4>
                  </div>

                  <div className="app-form-grid">
                    <FloatingSelect
                      label="Account Type"
                      value={formAccountType}
                      onChange={setFormAccountType}
                      category="Account Type"
                      fallbackOptions={[
                        'Manager',
                        'Accounting Manager',
                        'Supervisor',
                        'Assistant Officer',
                        'Transport Operation Manager',
                        'Executive Officer',
                        'Operations Coordinator',
                        'Fleet Controller',
                        'Logistics Supervisor'
                      ]}
                      icon={<UserCheck className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                    />

                    <FloatingInput
                      label={t('Department')}
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      themeColor={themeColor}
                      icon={<Briefcase className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                    />

                    <FloatingSelect
                      label="Role"
                      value={formRole}
                      onChange={(val) => setFormRole(val as UserRole)}
                      category="Role"
                      fallbackOptions={
                        currentUserRole === 'Admin Owner'
                          ? ['Admin Owner', 'Super Admin', 'Admin', 'Manager', 'Accountant', 'Accounting Manager', 'Assistant', 'Officer', 'Supervisor', 'Operator', 'Users']
                          : ['Manager', 'Accountant', 'Accounting Manager', 'Assistant', 'Officer', 'Supervisor', 'Operator', 'Users']
                      }
                      icon={<Shield className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                    />

                    <FloatingSelect
                      label="Status"
                      value={formStatus}
                      onChange={(val) => setFormStatus(val as UserStatus)}
                      category="Status"
                      fallbackOptions={['Active', 'Inactive', 'Pending']}
                      icon={<Activity className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                    />
                  </div>

                  {/* Module Permissions Matrix checkboxes */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 block">
                      {t('Module Permissions Access')}
                    </label>
                    <div className="app-form-grid">
                      {Object.keys(formPermissions).map((perm) => (
                        <label key={perm} className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium cursor-pointer p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-all">
                          <input
                            type="checkbox"
                            checked={formPermissions[perm as keyof typeof formPermissions]}
                            onChange={(e) => setFormPermissions({
                              ...formPermissions,
                              [perm]: e.target.checked
                            })}
                            className={`w-4.5 h-4.5 rounded border-zinc-300 text-white cursor-pointer focus:ring-0 ${themeCheckBg[themeColor]}`}
                          />
                          <span className="capitalize font-semibold truncate">
                            {perm === 'dashboard' ? t('Dashboard') : perm === 'users' ? t('Users Directory') : perm === 'vehicles' ? t('Vehicles') : perm === 'settings' ? t('App Control') : perm === 'auditLogs' ? t('Audit Logs') : perm.replace(/([A-Z])/g, ' $1')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CATEGORY 5: SECURITY & CREDENTIALS */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="w-1.5 h-4 rounded-full bg-zinc-400" />
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                      {t('5. Security & Credentials')}
                    </h4>
                  </div>

                  <div className="app-form-grid">
                    <FloatingInput
                      label={t('User ID / Username')}
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      themeColor={themeColor}
                      icon={<UserIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                      required={!isEditModalOpen}
                    />

                    <FloatingInput
                      label={t('Account Password')}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      type="password"
                      themeColor={themeColor}
                      icon={<Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
                    />

                    <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 col-span-1 md:col-span-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{t('Require Password Reset')}</span>
                        <span className="text-[10px] text-zinc-400">{t('Force password reset at next sign-in')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormMustChangePassword(!formMustChangePassword)}
                        className="text-zinc-500 dark:text-zinc-400"
                      >
                        {formMustChangePassword ? (
                          <ToggleRight className={`w-10 h-10 ${themeText[themeColor]}`} />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 col-span-1 md:col-span-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{t('Multi-Factor Auth (MFA)')}</span>
                        <span className="text-[10px] text-zinc-400">{t('Enforce 2FA/MFA setup for credentials')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormRequireMFA(!formRequireMFA)}
                        className="text-zinc-500 dark:text-zinc-400"
                      >
                        {formRequireMFA ? (
                          <ToggleRight className={`w-10 h-10 ${themeText[themeColor]}`} />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Profile Fields Removed */}

                {/* Mobile App Feature Access Control Checklist - 3 Columns on Desktop */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">
                        {t('Mobile App Feature Access Control')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newFeature = prompt(t('Enter new feature name:'));
                          if (newFeature && newFeature.trim()) {
                            const cleanName = newFeature.trim().toLowerCase();
                            if (!formFeatures.includes(cleanName)) {
                              setFormFeatures([...formFeatures, cleanName]);
                            }
                          }
                        }}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Add New Feature Rule
                      </button>
                    </div>

                    {(() => {
                      const standardFeatures = Array.from(new Set([
                        'chat', 'billing', 'reports', 'liveTracking', 'notifications', 'analytics', 'history', ...formFeatures
                      ]));
                      return (
                        <div className="app-form-grid">
                          {standardFeatures.map((feat) => {
                            const isAllowed = formFeatures.includes(feat);
                            return (
                              <label
                                key={feat}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isAllowed
                                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-100'
                                    : 'bg-zinc-50/50 dark:bg-zinc-800/20 border-zinc-200/50 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormFeatures([...formFeatures, feat]);
                                    } else {
                                      setFormFeatures(formFeatures.filter(f => f !== feat));
                                    }
                                  }}
                                  className="rounded text-indigo-600 focus:ring-indigo-500/20"
                                />
                                <span className="text-xs font-bold capitalize">{feat.replace(/([A-Z])/g, ' $1')}</span>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddModalOpen(false);
                    }}
                    className="h-10 px-4 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-all"
                  >
                    {t('Cancel')}
                  </button>
                  <ActionButton
                    type="submit"
                    isLoading={isProcessing}
                    actionType={isEditModalOpen ? 'update' : 'create'}
                    className={`h-10 px-4 rounded-[8px] text-white text-xs font-semibold transition-all ${themeBg[themeColor]}`}
                  >
                    {isEditModalOpen 
                      ? t('Save Changes') 
                      : t('Register User')}
                  </ActionButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
