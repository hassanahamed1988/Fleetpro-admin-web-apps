import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Edit2, Trash2, Shield, 
  X, UserCheck, Key, Eye, Check,
  Mail, Phone, Globe, Calendar, Briefcase, Activity, Flag, MapPin, Hash, Lock, User as UserIcon, RefreshCw, LogOut, Smartphone,
  Navigation, CreditCard, TrendingUp, Wallet, Heart, CheckCircle2, PlusCircle, Fuel, Landmark, ShoppingBag, Receipt, FileSpreadsheet, Sliders, AlertTriangle, ShieldAlert, Sparkles, CheckSquare, Square, ExternalLink, Layers, LayoutGrid, ShieldCheck, Building, Map, Mailbox, Fingerprint
} from 'lucide-react';
import { User, UserStatus } from '../types';
import { FloatingInput, FloatingSelect } from './FloatingInput';
import { useLanguage } from '../contexts/LanguageContext';
import { AnimatedSearchBar } from './AnimatedSearchBar';
import { ActionButton } from './ActionButton';
import { UserProfileModal } from './UserProfileModal';

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 15 : dir < 0 ? -15 : 0,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -15 : dir < 0 ? 15 : 0,
    opacity: 0
  })
};

export interface MobileModuleConfig {
  id: string;
  name: string;
  bnName: string;
  category: 'Trip & Travel' | 'Finance & Money' | 'Documents & Info' | 'Services & Support';
  desc: string;
  iconName: string;
}

export const MOBILE_DASHBOARD_MODULES: MobileModuleConfig[] = [
  { id: 'new_trip', name: 'New Trip', bnName: 'নতুন ট্রিপ', category: 'Trip & Travel', desc: 'Create & manage new trip bookings', iconName: 'Navigation' },
  { id: 'monthly_files', name: 'Monthly Files', bnName: 'মাসিক ফাইল', category: 'Documents & Info', desc: 'Monthly trip files & documents archive', iconName: 'Calendar' },
  { id: 'payment', name: 'Payment', bnName: 'পেমেন্ট', category: 'Finance & Money', desc: 'Process trip charges & online payments', iconName: 'CreditCard' },
  { id: 'my_income', name: 'My Income', bnName: 'আমার আয়', category: 'Finance & Money', desc: 'Driver & user total earnings summary', iconName: 'TrendingUp' },
  { id: 'wallet', name: 'Wallet', bnName: 'ওয়ালেট', category: 'Finance & Money', desc: 'In-app digital balance & transaction log', iconName: 'Wallet' },
  { id: 'contact', name: 'Contact', bnName: 'যোগাযোগ', category: 'Services & Support', desc: 'Company support & emergency contacts', iconName: 'Phone' },
  { id: 'search', name: 'Search', bnName: 'অনুসন্ধান', category: 'Services & Support', desc: 'Global search across trips & files', iconName: 'Search' },
  { id: 'family_maintenance', name: 'Family Maintenance', bnName: 'ফ্যামিলি মেইনটেন্যান্স', category: 'Services & Support', desc: 'Family welfare & maintenance allowance', iconName: 'Heart' },
  { id: 'settlement', name: 'Settlement', bnName: 'সেটেলমেন্ট', category: 'Finance & Money', desc: 'Trip balance & account final settlements', iconName: 'CheckCircle2' },
  { id: 'add_money', name: 'Add Money', bnName: 'টাকা রিচার্জ', category: 'Finance & Money', desc: 'Top-up funds into in-app digital wallet', iconName: 'PlusCircle' },
  { id: 'fuel', name: 'Fuel', bnName: 'জ্বালানি', category: 'Trip & Travel', desc: 'Vehicle refueling logs & fuel vouchers', iconName: 'Fuel' },
  { id: 'loan', name: 'Loan', bnName: 'ঋণ / লোন', category: 'Finance & Money', desc: 'Salary advance & loan requisition status', iconName: 'Landmark' },
  { id: 'purchase', name: 'Purchase', bnName: 'ক্রয় / কেনাকাটা', category: 'Finance & Money', desc: 'Vehicle spare parts & purchase orders', iconName: 'ShoppingBag' },
  { id: 'invoice', name: 'Invoice', bnName: 'ইনভয়েস', category: 'Documents & Info', desc: 'Generate customer trip invoices & tax receipts', iconName: 'Receipt' },
  { id: 'statement', name: 'Statement', bnName: 'স্টেটমেন্ট', category: 'Documents & Info', desc: 'Detailed financial statement & ledger', iconName: 'FileSpreadsheet' },
];

export const DEFAULT_MOBILE_MODULE_PERMISSIONS: Record<string, boolean> = {
  new_trip: true,
  monthly_files: true,
  payment: true,
  my_income: true,
  wallet: true,
  contact: true,
  search: true,
  family_maintenance: true,
  settlement: true,
  add_money: true,
  fuel: true,
  loan: true,
  purchase: true,
  invoice: true,
  statement: true,
};

export const renderModuleIcon = (iconName: string, className = "w-5 h-5") => {
  switch (iconName) {
    case 'Navigation': return <Navigation className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Wallet': return <Wallet className={className} />;
    case 'Phone': return <Phone className={className} />;
    case 'Search': return <Search className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'CheckCircle2': return <CheckCircle2 className={className} />;
    case 'PlusCircle': return <PlusCircle className={className} />;
    case 'Fuel': return <Fuel className={className} />;
    case 'Landmark': return <Landmark className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Receipt': return <Receipt className={className} />;
    case 'FileSpreadsheet': return <FileSpreadsheet className={className} />;
    default: return <Smartphone className={className} />;
  }
};

interface MobileTripsViewProps {
  users: User[];
  currentUser?: User;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => Promise<boolean>;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export function MobileTripsView({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  themeColor,
  triggerToast,
  triggerConfirm,
}: MobileTripsViewProps) {
  const { t, formatDate } = useLanguage();

  // Determine Active Admin Owner & Unique Admin Owner ID
  const activeAdminOwner = currentUser || users.find(u => u.role === 'Admin Owner' || u.role === 'Admin' || u.role === 'Super Admin') || users[0];
  // Falls back to the admin's own record id only if their unique
  // 6-8 digit adminOwnerId hasn't been assigned yet (e.g. legacy/seed data).
  const currentAdminOwnerId = activeAdminOwner?.adminOwnerId || activeAdminOwner?.id || 'AO-000';

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Live Mobile App Dashboard Preview Modal State
  const [isPreviewDashboardOpen, setIsPreviewDashboardOpen] = useState(false);
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [showDisabledInPreview, setShowDisabledInPreview] = useState(false);
  const [testingModule, setTestingModule] = useState<string | null>(null);

  // Form State (Isolated Mobile User Registration Form)
  // 1. Personal Information
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [formNationality, setFormNationality] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formReligion, setFormReligion] = useState('');
  const [formProfession, setFormProfession] = useState('');
  const [formCountryCode, setFormCountryCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [formForcePasswordReset, setFormForcePasswordReset] = useState(false);

  const handleStepChange = (newStep: number) => {
    if (newStep > currentStep) {
      setDirection(1);
    } else if (newStep < currentStep) {
      setDirection(-1);
    }
    setCurrentStep(newStep);
  };

  // 2. Identity Documentation
  const [formDocumentCountry, setFormDocumentCountry] = useState('');
  const [formDocumentType, setFormDocumentType] = useState('');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formDocumentIssueDate, setFormDocumentIssueDate] = useState('');
  const [formDocumentExpiryDate, setFormDocumentExpiryDate] = useState('');

  // 3. Address Coordinates
  const [formCountry, setFormCountry] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPoliceStation, setFormPoliceStation] = useState('');
  const [formPostOfficeName, setFormPostOfficeName] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formBuildingNumber, setFormBuildingNumber] = useState('');
  const [formZoneNumber, setFormZoneNumber] = useState('');
  const [formStateNumber, setFormStateNumber] = useState('');
  const [formAreaName, setFormAreaName] = useState('');

  // 4. Account & Tenant Details
  const [formName, setFormName] = useState('');
  const [formStatus, setFormStatus] = useState<UserStatus | ''>('');
  const [formDepartment, setFormDepartment] = useState('Mobile App Users');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formGeneratedUserId, setFormGeneratedUserId] = useState('');
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formPassword, setFormPassword] = useState('');

  const isValid7DigitUserId = (val?: string) => {
    return typeof val === 'string' && /^UserId\d{7}$/.test(val.trim());
  };

  const generateNumericUserId = (excludeUserId?: string) => {
    const existingIds = new Set<string>();
    (users || []).forEach(u => {
      if (excludeUserId && u.id === excludeUserId) return;
      if (u.generatedUserId) existingIds.add(u.generatedUserId.trim());
      if (u.employeeId) existingIds.add(u.employeeId.trim());
    });

    let generated = '';
    let attempts = 0;
    do {
      const random7Digits = Math.floor(1000000 + Math.random() * 9000000);
      generated = `UserId${random7Digits}`;
      attempts++;
    } while (existingIds.has(generated) && attempts < 10000);

    return generated;
  };

  // 5. Module Permissions Access State (15 Dashboard Modules)
  const [formMobileModulePermissions, setFormMobileModulePermissions] = useState<Record<string, boolean>>(
    { ...DEFAULT_MOBILE_MODULE_PERMISSIONS }
  );

  // Theme Styling
  const themeBg = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    red: 'bg-red-600 hover:bg-red-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  // Filter mobile users only (role = Users or USER or accountType = MOBILE_APP)
  const mobileUsers = users.filter((u) => {
    const isMobileRole = 
      (u.role as string) === 'Users' || 
      (u.role as string) === 'USER' || 
      u.accountType === 'MOBILE_APP' ||
      u.department === 'Mobile App Users';
    if (!isMobileRole) return false;

    const sLower = search.toLowerCase();
    const uName = (u.name || '').toLowerCase();
    const uEmail = (u.email || '').toLowerCase();
    const uPhone = (u.phone || '').toLowerCase();

    const matchesSearch =
      !search ||
      uName.includes(sLower) ||
      uEmail.includes(sLower) ||
      uPhone.includes(sLower);

    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(mobileUsers.length / itemsPerPage) || 1;
  const paginatedUsers = mobileUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open Registration Modal
  const openAddModal = () => {
    setFormName('');
    setFormFirstName('');
    setFormLastName('');
    setFormDateOfBirth('');
    setFormNationality('');
    setFormGender('');
    setFormReligion('');
    setFormProfession('');
    setFormCountryCode('');
    setFormPhone('');
    setFormEmail('');

    setFormDocumentCountry('');
    setFormDocumentType('');
    setFormIdNumber('');
    setFormDocumentIssueDate('');
    setFormDocumentExpiryDate('');

    setFormCountry('');
    setFormRegion('');
    setFormCity('');
    setFormPoliceStation('');
    setFormPostOfficeName('');
    setFormPostalCode('');
    setFormBuildingNumber('');
    setFormZoneNumber('');
    setFormStateNumber('');
    setFormAreaName('');

    setFormStatus('Active');
    setFormDepartment('Mobile App Users');
    setFormCompanyId(`CMP-MOBILE-${Math.floor(100 + Math.random() * 900)}`);
    const newNumericId = generateNumericUserId();
    setFormGeneratedUserId(newNumericId);
    setFormEmployeeId(newNumericId);
    setFormPassword('');
    setCurrentStep(1);
    setDirection(0);
    setFormForcePasswordReset(false);

    // Reset module permissions to default (all 15 enabled)
    setFormMobileModulePermissions({ ...DEFAULT_MOBILE_MODULE_PERMISSIONS });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name || '');
    setFormFirstName(user.firstName || '');
    setFormLastName(user.lastName || '');
    setFormDateOfBirth(user.dateOfBirth || '');
    setFormNationality(user.nationality || 'Qatari');
    setFormGender(user.gender || 'Male');
    setFormReligion(user.religion || 'Islam');
    setFormProfession(user.profession || user.jobTitle || 'Engineer');
    setFormCountryCode(user.countryCode || '+974');
    setFormPhone(user.phone || '');
    setFormEmail(user.email || '');

    setFormDocumentCountry(user.documentCountry || user.idIssueCountry || '');
    setFormDocumentType(user.documentType || 'QID / National ID');
    setFormIdNumber(user.idNumber || user.nationalId || '');
    setFormDocumentIssueDate(user.documentIssueDate || '');
    setFormDocumentExpiryDate(user.documentExpiryDate || '');

    setFormCountry(user.country || 'Qatar');
    setFormRegion(user.region || 'Doha Municipality');
    setFormCity(user.city || 'Doha');
    setFormPoliceStation(user.policeStation || '');
    setFormPostOfficeName(user.postOfficeName || '');
    setFormPostalCode(user.postalCode || '');
    setFormBuildingNumber(user.buildingNumber || '');
    setFormZoneNumber(user.zoneNumber || '');
    setFormStateNumber(user.stateNumber || '');
    setFormAreaName(user.areaName || '');

    setFormStatus(user.status || 'Pending');
    setFormDepartment(user.department || 'Mobile App Users');
    setFormCompanyId(user.companyId || 'CMP-MOBILE-101');
    // Existing user ID migration to new 7-digit numeric UserIdXXXXXXX format:
    let migratedUserId = '';
    if (isValid7DigitUserId(user.generatedUserId)) {
      migratedUserId = user.generatedUserId!.trim();
    } else if (isValid7DigitUserId(user.employeeId)) {
      migratedUserId = user.employeeId!.trim();
    } else {
      // Auto-generate new unique 7-digit numeric User ID format for existing user
      migratedUserId = generateNumericUserId(user.id);
    }
    setFormGeneratedUserId(migratedUserId);
    setFormEmployeeId(migratedUserId);
    setFormPassword('');
    setCurrentStep(1);
    setDirection(0);
    setFormForcePasswordReset(user.mustChangeCredentials || user.forcePasswordReset || false);

    // Load existing permissions or merge with default
    const existingPerms = user.mobileModulePermissions || {};
    const merged: Record<string, boolean> = { ...DEFAULT_MOBILE_MODULE_PERMISSIONS };
    MOBILE_DASHBOARD_MODULES.forEach(mod => {
      if (existingPerms[mod.id] !== undefined) {
        merged[mod.id] = !!existingPerms[mod.id];
      }
    });
    setFormMobileModulePermissions(merged);
    setIsEditModalOpen(true);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName && !formFirstName) {
      triggerToast(t('Error'), t('Please provide user name.'), 'error');
      return;
    }
    if (!formEmail) {
      triggerToast(t('Error'), t('Please enter a valid email address.'), 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const fullName = formName || `${formFirstName} ${formLastName}`.trim();

      if (isAddModalOpen) {
        // Enforce Admin Owner ID registration control
        if (!activeAdminOwner || (activeAdminOwner.role !== 'Admin Owner' && activeAdminOwner.role !== 'Admin' && activeAdminOwner.role !== 'Super Admin')) {
          triggerToast(t('Registration Rejected'), t('Mobile User Registration requires a valid Admin Owner ID. User account cannot be created under non-Admin Owners.'), 'error');
          setIsProcessing(false);
          return;
        }

        const newUser: User = {
          id: `usr_mob_${Date.now()}`,
          name: fullName,
          firstName: formFirstName,
          lastName: formLastName,
          dateOfBirth: formDateOfBirth,
          nationality: formNationality,
          gender: formGender,
          religion: formReligion,
          profession: formProfession,
          jobTitle: formProfession,
          countryCode: formCountryCode,
          phone: formPhone,
          email: formEmail,

          // Admin Owner ID & CreatedBy Automatic Security Mapping
          adminOwnerId: currentAdminOwnerId || 'AO-000',
          createdBy: activeAdminOwner.name || activeAdminOwner.email || 'Admin Owner',

          documentType: formDocumentType,
          documentCountry: formDocumentCountry,
          idIssueCountry: formDocumentCountry,
          idNumber: formIdNumber,
          nationalId: formIdNumber,
          documentIssueDate: formDocumentIssueDate,
          documentExpiryDate: formDocumentExpiryDate,

          country: formCountry,
          region: formRegion,
          city: formCity,
          policeStation: formPoliceStation,
          postOfficeName: formPostOfficeName,
          postalCode: formPostalCode,
          buildingNumber: formBuildingNumber,
          zoneNumber: formZoneNumber,
          stateNumber: formStateNumber,
          areaName: formAreaName,

          role: 'Users',
          accountType: 'MOBILE_APP',
          status: formStatus || 'Active',
          department: formDepartment,
          // Mobile App accounts created from the Admin Panel do not get an
          // employeeId — only the Auto-Generated User ID (generatedUserId).
          // employeeId is reserved for Company Account section roles
          // (Admin Owner / Super Admin / Admin / Manager / Operator).
          generatedUserId: formGeneratedUserId || formEmployeeId,
          companyId: formCompanyId,
          username: formEmail.trim().toLowerCase(),
          loginEmail: formEmail.trim().toLowerCase(),
          mobileNumber: formPhone,
          password: formPassword || 'default123456',
          joinDate: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString(),
          permissions: {
            dashboard: true,
            users: false,
            vehicles: false,
            settings: false,
            auditLogs: false,
          },
          mobileModulePermissions: { ...formMobileModulePermissions },
          features: ['chat', 'notifications'],
          mustChangeCredentials: formForcePasswordReset,
          forcePasswordReset: formForcePasswordReset,
        };
        onAddUser(newUser);
        triggerToast(t('Success'), t(`Mobile App User registered and mapped under Admin Owner ID (${currentAdminOwnerId})!`), 'success');
        setIsAddModalOpen(false);
      } else if (isEditModalOpen && selectedUser) {
        const updatedUser: User = {
          ...selectedUser,
          name: fullName,
          firstName: formFirstName,
          lastName: formLastName,
          avatar: selectedUser.avatar, // Ensure existing Profile Photo is strictly unchanged
          dateOfBirth: formDateOfBirth,
          nationality: formNationality,
          gender: formGender,
          religion: formReligion,
          profession: formProfession,
          jobTitle: formProfession,
          countryCode: formCountryCode,
          phone: formPhone,
          email: formEmail,
          username: formEmail.trim().toLowerCase(),
          loginEmail: formEmail.trim().toLowerCase(),
          mobileNumber: formPhone,
          ...(formPassword ? { password: formPassword } : {}),

          documentType: formDocumentType,
          documentCountry: formDocumentCountry,
          idIssueCountry: formDocumentCountry,
          idNumber: formIdNumber,
          nationalId: formIdNumber,
          documentIssueDate: formDocumentIssueDate,
          documentExpiryDate: formDocumentExpiryDate,

          country: formCountry,
          region: formRegion,
          city: formCity,
          policeStation: formPoliceStation,
          postOfficeName: formPostOfficeName,
          postalCode: formPostalCode,
          buildingNumber: formBuildingNumber,
          zoneNumber: formZoneNumber,
          stateNumber: formStateNumber,
          areaName: formAreaName,

          status: formStatus || selectedUser.status || 'Active',
          department: formDepartment || selectedUser.department || 'Mobile App Users',
          // Mobile App accounts don't get an employeeId — only the
          // Auto-Generated User ID (generatedUserId). employeeId is reserved
          // for Company Account section roles (Admin Owner / Super Admin /
          // Admin / Manager / Operator).
          employeeId: undefined,
          generatedUserId: formGeneratedUserId || formEmployeeId,
          companyId: formCompanyId || selectedUser.companyId,
          mobileModulePermissions: { ...formMobileModulePermissions },
          mustChangeCredentials: formForcePasswordReset,
          forcePasswordReset: formForcePasswordReset,
        };
        onUpdateUser(updatedUser);
        triggerToast(t('Success'), t('Mobile App User profile, credentials and User ID updated successfully!'), 'success');
        setIsEditModalOpen(false);
      }
      setIsProcessing(false);
    }, 400);
  };

  // Toggle Block / Activate Status
  const handleToggleStatus = (user: User) => {
    const nextStatus: UserStatus = user.status === 'Active' ? 'Blocked' : 'Active';
    triggerConfirm(
      t('Change User Access Status'),
      `Are you sure you want to set status to "${nextStatus}" for ${user.name}?`,
      () => {
        onUpdateUser({ ...user, status: nextStatus });
        triggerToast(t('Status Updated'), `${user.name} is now ${nextStatus}.`, 'info');
      }
    );
  };

  // Delete User Action
  const handleDelete = (user: User) => {
    triggerConfirm(
      t('Delete Mobile User'),
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      async () => {
        // Only confirm removal once the backend actually deletes the
        // record. If it fails, onDeleteUser already shows an error toast.
        const deleted = await onDeleteUser(user.id);
        if (deleted) {
          triggerToast(t('User Deleted'), `${user.name} has been removed.`, 'warning');
        }
      }
    );
  };

  // Test API Level Validation on Mobile Dashboard Preview Click
  const handleTestModuleAccess = async (user: User, mod: MobileModuleConfig) => {
    setTestingModule(mod.id);
    try {
      const response = await fetch('/api/mobile/validate-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, moduleId: mod.id })
      });
      const data = await response.json();
      
      if (response.ok && data.allowed) {
        triggerToast(
          'API Permission Granted',
          `Backend HTTP 200 OK — User ${user.name} is authorized for module '${mod.name}' (${mod.bnName}).`,
          'success'
        );
      } else {
        triggerToast(
          'API Access Blocked (HTTP 403)',
          `Backend Security Enforcement: ${data.error || 'Access Denied by Module Permission Rules.'}`,
          'error'
        );
      }
    } catch (err) {
      // Fallback local check if server offline
      const isAllowed = user.mobileModulePermissions?.[mod.id] !== false && user.status === 'Active';
      if (isAllowed) {
        triggerToast('Module Access Granted', `Local Permission Check Passed for '${mod.name}'.`, 'success');
      } else {
        triggerToast('Access Blocked', `Permission Denied for '${mod.name}'. Cannot access API or Route.`, 'error');
      }
    } finally {
      setTestingModule(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            {t('Mobile App Controls — User Management')}
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {t('Manage mobile application users, registration details, 15 dynamic module permissions, and app dashboards.')}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className={`h-[40px] px-4 rounded-[8px] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${themeBg[themeColor]}`}
        >
          <Plus className="w-4 h-4" />
          {t('Add New Mobile User')}
        </button>
      </div>

      {/* Filter Segment */}
      <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row gap-4 items-center shadow-xs">
        <AnimatedSearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder={t('Search mobile users by name, email, phone...')}
          themeColor={themeColor}
        />

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
            <option value="Blocked">{t('Blocked')}</option>
          </select>
        </div>
      </div>

      {/* Users List Table (Desktop) & Mobile Cards (Phone) */}
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">{t('User Name')}</th>
                <th className="py-3.5 px-4">{t('Admin Owner ID')}</th>
                <th className="py-3.5 px-4">{t('Contact & Tenant')}</th>
                <th className="py-3.5 px-4">{t('Dashboard Permissions')}</th>
                <th className="py-3.5 px-4">{t('Account Status')}</th>
                <th className="py-3.5 px-4 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-300">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Smartphone className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                      <p className="font-medium text-zinc-500 dark:text-zinc-400">{t('No mobile app users found.')}</p>
                      <button
                        onClick={openAddModal}
                        className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t('Add New Mobile User')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const perms = u.mobileModulePermissions || DEFAULT_MOBILE_MODULE_PERMISSIONS;
                  const allowedCount = MOBILE_DASHBOARD_MODULES.filter(m => perms[m.id] !== false).length;

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <span>{u.companyId || 'CMP-MOBILE-101'}</span>
                              <span>•</span>
                              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{u.generatedUserId || u.employeeId || 'UserId2627378'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                            <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            {u.adminOwnerId || u.createdBy || 'AO-000'}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">By: {u.createdBy || 'Admin Owner'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-zinc-900 dark:text-zinc-100 font-medium">{u.email}</div>
                        <div className="text-[11px] text-zinc-400">{u.phone || 'N/A'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            allowedCount === 15
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50'
                              : allowedCount > 0
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                          }`}>
                            <Sliders className="w-3 h-3" />
                            {allowedCount} / 15 Modules
                          </span>

                          <button
                            onClick={() => {
                              setPreviewUser(u);
                              setIsPreviewDashboardOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all text-[11px] font-bold flex items-center gap-1 border border-indigo-200 dark:border-indigo-900/50"
                            title="Preview Mobile App Dashboard"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            Preview
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : u.status === 'Pending'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                            : u.status === 'Blocked'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'Active' ? 'bg-emerald-500' : u.status === 'Pending' ? 'bg-amber-500' : u.status === 'Blocked' ? 'bg-rose-500' : 'bg-zinc-400'
                          }`} />
                          {t(u.status)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsViewProfileOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            title={t('View Profile')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all"
                            title={t('Edit Mobile User Permissions')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-all ${
                              u.status === 'Active'
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={u.status === 'Active' ? t('Block Mobile Access') : t('Activate Mobile Access')}
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                            title={t('Delete User')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards (for phones & tablets) */}
        <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {paginatedUsers.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('No mobile app users found.')}</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                {t('There are no registered mobile users matching your filter. Click below to add a new mobile user.')}
              </p>
              <button
                onClick={openAddModal}
                className={`mt-4 mx-auto px-4 py-2 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm ${themeBg[themeColor]}`}
              >
                <Plus className="w-4 h-4" />
                {t('Add New Mobile User')}
              </button>
            </div>
          ) : (
            paginatedUsers.map((u) => {
              const perms = u.mobileModulePermissions || DEFAULT_MOBILE_MODULE_PERMISSIONS;
              const allowedCount = MOBILE_DASHBOARD_MODULES.filter(m => perms[m.id] !== false).length;

              return (
                <div key={u.id} className="p-4 space-y-3">
                  {/* Top: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{u.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</div>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                      u.status === 'Active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : u.status === 'Pending'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        : u.status === 'Blocked'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        u.status === 'Active' ? 'bg-emerald-500' : u.status === 'Pending' ? 'bg-amber-500' : u.status === 'Blocked' ? 'bg-rose-500' : 'bg-zinc-400'
                      }`} />
                      {t(u.status)}
                    </span>
                  </div>

                  {/* Middle details: Admin Owner ID & Permissions */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-semibold">{t('Admin Owner')}</div>
                      <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        {u.adminOwnerId || u.createdBy || 'AO-000'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-semibold">{t('Permissions')}</div>
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Sliders className="w-3 h-3" />
                        {allowedCount} / 15 Modules
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setPreviewUser(u);
                        setIsPreviewDashboardOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-xs font-semibold flex items-center gap-1.5 border border-indigo-200/60 dark:border-indigo-900/50"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      {t('Preview App')}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsViewProfileOpen(true);
                        }}
                        className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title={t('View Profile')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        title={t('Edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-2 rounded-lg ${
                          u.status === 'Active' ? 'text-amber-500' : 'text-emerald-500'
                        }`}
                        title={u.status === 'Active' ? t('Block') : t('Activate')}
                      >
                        <Shield className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(u)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title={t('Delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-zinc-400 px-1">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, mobileUsers.length)} of {mobileUsers.length} mobile users
          </div>
          <div className="flex gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ISOLATED MOBILE REGISTRATION / EDIT MODAL */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full app-fluid-modal max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-500" />
                    {isAddModalOpen ? t('Add New Mobile App User') : t('Edit Mobile App User')}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {t('Mobile application user registration with dynamic 15-module permission control.')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 5-Step Side-by-Side Horizontal Navigation Stepper */}
                <div className="flex items-center gap-1.5 pb-4 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-none select-none relative">
                  {[
                    { id: 1, label: t('Personal Information'), icon: <UserIcon className="w-4 h-4" /> },
                    { id: 2, label: t('Identity Documentation'), icon: <Shield className="w-4 h-4" /> },
                    { id: 3, label: t('Address Coordinates'), icon: <MapPin className="w-4 h-4" /> },
                    { id: 4, label: t('Module Permissions Access'), icon: <Sliders className="w-4 h-4" /> },
                    { id: 5, label: t('Security & Password'), icon: <Lock className="w-4 h-4" /> },
                  ].map((step) => {
                    const isActive = currentStep === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStepChange(step.id)}
                        className="relative flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-colors shrink-0 outline-none select-none"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeStepHighlight"
                            className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl shadow-2xs"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
                          {step.icon}
                          <span>{step.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="overflow-hidden relative">
                  <AnimatePresence mode="wait" initial={false}>
                    {/* STEP 1: PERSONAL INFORMATION */}
                    {currentStep === 1 && (
                      <motion.div
                        key={1}
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="space-y-6"
                      >
                    {/* Admin Owner ID Registration Security Control Box */}
                    <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                            Admin Owner Registration Control
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                          Automated Ownership Mapping
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-0.5">
                        <div className="bg-white dark:bg-zinc-900/90 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                          <div className="text-[10px] uppercase font-bold text-zinc-400">Admin Owner ID</div>
                          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                            {isEditModalOpen && selectedUser ? (selectedUser.adminOwnerId || 'AO-000') : currentAdminOwnerId}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900/90 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                          <div className="text-[10px] uppercase font-bold text-zinc-400">Sponsoring Admin Owner</div>
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs truncate mt-0.5">
                            {isEditModalOpen && selectedUser ? (selectedUser.createdBy || 'Admin Owner') : (activeAdminOwner?.name || activeAdminOwner?.email || 'Admin Owner')}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                        🔒 Mobile user registration is restricted under Admin Owner ID mapping. CreatedBy/AdminOwnerID is automatically attached and enforced immutably on backend.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <UserIcon className="w-4 h-4" />
                        <span>1. Personal Information</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <FloatingInput
                          label="First Name *"
                          value={formFirstName}
                          onChange={(e) => {
                            setFormFirstName(e.target.value);
                            if (!formName) setFormName(`${e.target.value} ${formLastName}`.trim());
                          }}
                          icon={<UserIcon className="w-4 h-4 text-zinc-400" />}
                        />
                        <FloatingInput
                          label="Last Name *"
                          value={formLastName}
                          onChange={(e) => {
                            setFormLastName(e.target.value);
                            if (!formName) setFormName(`${formFirstName} ${e.target.value}`.trim());
                          }}
                          icon={<UserIcon className="w-4 h-4 text-zinc-400" />}
                        />
                        <FloatingInput
                          label="Date of Birth *"
                          type="date"
                          value={formDateOfBirth}
                          onChange={(e) => setFormDateOfBirth(e.target.value)}
                          icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                        />
                        <FloatingInput
                          label="Nationality"
                          value={formNationality}
                          onChange={(e) => setFormNationality(e.target.value)}
                          icon={<Flag className="w-4 h-4 text-zinc-400" />}
                        />
                        <FloatingSelect
                          label="Gender"
                          value={formGender}
                          onChange={(e) => setFormGender(e.target.value)}
                          icon={<UserIcon className="w-4 h-4 text-zinc-400" />}
                        >
                          <option value=""></option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </FloatingSelect>
                        <FloatingInput
                          label="Religion"
                          value={formReligion}
                          onChange={(e) => setFormReligion(e.target.value)}
                          icon={<Globe className="w-4 h-4 text-zinc-400" />}
                        />
                        <FloatingInput
                          label="Profession"
                          value={formProfession}
                          onChange={(e) => setFormProfession(e.target.value)}
                          icon={<Briefcase className="w-4 h-4 text-zinc-400" />}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <FloatingInput
                            label="Code"
                            value={formCountryCode}
                            onChange={(e) => setFormCountryCode(e.target.value)}
                            icon={<Globe className="w-3.5 h-3.5 text-zinc-400" />}
                          />
                          <div className="col-span-2">
                            <FloatingInput
                              label="Phone Number"
                              value={formPhone}
                              onChange={(e) => setFormPhone(e.target.value)}
                              icon={<Phone className="w-4 h-4 text-zinc-400" />}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <FloatingInput
                            label="Email Address *"
                            type="email"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            icon={<Mail className="w-4 h-4 text-zinc-400" />}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: IDENTITY DOCUMENTATION */}
                {currentStep === 2 && (
                  <motion.div
                    key={2}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                      <Shield className="w-4 h-4" />
                      <span>2. Identity Documentation</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <FloatingSelect
                        label="Document Issuing Country"
                        value={formDocumentCountry}
                        onChange={(e) => setFormDocumentCountry(e.target.value)}
                        icon={<Globe className="w-4 h-4 text-zinc-400" />}
                      >
                        <option value=""></option>
                        <option value="Qatar">Qatar</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="India">India</option>
                        <option value="Nepal">Nepal</option>
                        <option value="Pakistan">Pakistan</option>
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Oman">Oman</option>
                        <option value="Kuwait">Kuwait</option>
                        <option value="Bahrain">Bahrain</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                      </FloatingSelect>
                      <FloatingSelect
                        label="Document Type"
                        value={formDocumentType}
                        onChange={(e) => setFormDocumentType(e.target.value)}
                        icon={<Shield className="w-4 h-4 text-zinc-400" />}
                      >
                        <option value=""></option>
                        <option value="QID / National ID">QID / National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Residence Permit">Residence Permit</option>
                        <option value="Driver License">Driver License</option>
                      </FloatingSelect>
                      {formDocumentType && (
                        <>
                          <FloatingInput
                            label={
                              formDocumentType === 'QID / National ID'
                                ? 'National ID Number'
                                : formDocumentType === 'Passport'
                                ? 'Passport Number'
                                : formDocumentType === 'Residence Permit'
                                ? 'Residence Permit Number'
                                : formDocumentType === 'Driver License'
                                ? 'Driver License Number'
                                : 'ID Number'
                            }
                            value={formIdNumber}
                            onChange={(e) => setFormIdNumber(e.target.value)}
                            icon={
                              formDocumentType === 'Passport' ? (
                                <Fingerprint className="w-4 h-4 text-zinc-400" />
                              ) : formDocumentType === 'QID / National ID' || formDocumentType === 'Residence Permit' ? (
                                <CreditCard className="w-4 h-4 text-zinc-400" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                              )
                            }
                          />
                          <FloatingInput
                            label="Document Issue Date"
                            type="date"
                            value={formDocumentIssueDate}
                            onChange={(e) => setFormDocumentIssueDate(e.target.value)}
                            icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput
                            label="Expiry Date"
                            type="date"
                            value={formDocumentExpiryDate}
                            onChange={(e) => setFormDocumentExpiryDate(e.target.value)}
                            icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: ADDRESS COORDINATES */}
                {currentStep === 3 && (
                  <motion.div
                    key={3}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                      <MapPin className="w-4 h-4" />
                      <span>3. Address Coordinates</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <FloatingInput
                        label="Country"
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        icon={<Globe className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="Region"
                        value={formRegion}
                        onChange={(e) => setFormRegion(e.target.value)}
                        icon={<MapPin className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="City"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        icon={<MapPin className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="Police Station"
                        value={formPoliceStation}
                        onChange={(e) => setFormPoliceStation(e.target.value)}
                        icon={<Shield className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="Post Office Name"
                        value={formPostOfficeName}
                        onChange={(e) => setFormPostOfficeName(e.target.value)}
                        icon={<Mailbox className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="Postal Code"
                        value={formPostalCode}
                        onChange={(e) => setFormPostalCode(e.target.value)}
                        icon={<Mail className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="Building Number"
                        value={formBuildingNumber}
                        onChange={(e) => setFormBuildingNumber(e.target.value)}
                        icon={<Building className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="Zone Number"
                        value={formZoneNumber}
                        onChange={(e) => setFormZoneNumber(e.target.value)}
                        icon={<Map className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="State Number"
                        value={formStateNumber}
                        onChange={(e) => setFormStateNumber(e.target.value)}
                        icon={<Flag className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput
                        label="Area Name"
                        value={formAreaName}
                        onChange={(e) => setFormAreaName(e.target.value)}
                        icon={<MapPin className="w-4 h-4 text-zinc-400" />}
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: MODULE PERMISSIONS ACCESS */}
                {currentStep === 4 && (
                  <motion.div
                    key={4}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        <Sliders className="w-4 h-4" />
                        <span>4. Module Permissions Access</span>
                        <span className="ml-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {Object.values(formMobileModulePermissions).filter(Boolean).length} / {MOBILE_DASHBOARD_MODULES.length} Allowed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const allTrue: Record<string, boolean> = {};
                            MOBILE_DASHBOARD_MODULES.forEach(m => { allTrue[m.id] = true; });
                            setFormMobileModulePermissions(allTrue);
                          }}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const allFalse: Record<string, boolean> = {};
                            MOBILE_DASHBOARD_MODULES.forEach(m => { allFalse[m.id] = false; });
                            setFormMobileModulePermissions(allFalse);
                          }}
                          className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400">
                      Admin selects which Dashboard Modules/Icons are visible to this Mobile App User. Modules without permission will be completely hidden on the Mobile App Dashboard and rejected at the API/Backend level.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {MOBILE_DASHBOARD_MODULES.map((mod) => {
                        const isAllowed = !!formMobileModulePermissions[mod.id];
                        return (
                          <div
                            key={mod.id}
                            onClick={() => {
                              setFormMobileModulePermissions(prev => ({
                                ...prev,
                                [mod.id]: !isAllowed
                              }));
                            }}
                            className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex flex-col justify-between gap-2.5 ${
                              isAllowed
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-2xs'
                                : 'bg-zinc-50/60 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className={`p-2 rounded-lg ${
                                isAllowed
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                              }`}>
                                {renderModuleIcon(mod.iconName, "w-4 h-4")}
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isAllowed ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                              }`}>
                                {mod.category}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{mod.name}</h5>
                                <span className="text-[10px] text-zinc-400 font-medium">({mod.bnName})</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{mod.desc}</p>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px]">
                              <span className="font-semibold text-zinc-400">Dashboard Status</span>
                              <span className={`font-bold px-1.5 py-0.5 rounded ${
                                isAllowed ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                              }`}>
                                {isAllowed ? 'VISIBLE' : 'HIDDEN'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: ACCOUNT CONTROL */}
                {currentStep === 5 && (
                  <motion.div
                    key={5}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                      <Lock className="w-4 h-4" />
                      <span>5. {t('Security & Password')}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FloatingInput
                        label={t('User ID (Email Address)')}
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        icon={<Mail className="w-4 h-4 text-zinc-400" />}
                        disabled={true}
                      />
                      <FloatingInput
                        label={t('Auto-Generated User ID')}
                        value={formGeneratedUserId}
                        onChange={(e) => setFormGeneratedUserId(e.target.value)}
                        icon={<UserIcon className="w-4 h-4 text-zinc-400" />}
                        disabled={true}
                      />
                      <FloatingInput
                        label={t('Registered Mobile Number')}
                        value={formCountryCode ? `${formCountryCode} ${formPhone}`.trim() : formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        icon={<Phone className="w-4 h-4 text-zinc-400" />}
                        disabled={true}
                      />
                      <FloatingInput
                        label={isEditModalOpen ? t("New Password (Leave blank to keep current)") : t("Set Access Password")}
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        icon={<Lock className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingSelect
                        label={t('Account Status')}
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                        icon={<Shield className="w-4 h-4 text-zinc-400" />}
                      >
                        <option value="Active">{t('Active')}</option>
                        <option value="Inactive">{t('Inactive')}</option>
                        <option value="Pending">{t('Pending')}</option>
                        <option value="Blocked">{t('Blocked')}</option>
                      </FloatingSelect>

                      <div className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10">
                        <input
                          type="checkbox"
                          id="forcePasswordReset"
                          checked={formForcePasswordReset}
                          onChange={(e) => setFormForcePasswordReset(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="forcePasswordReset" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                          {t('Force Password Reset on Next Login')}
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footers buttons with Stepper controllers */}
                <div className="pt-5 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                    }}
                    className="h-10 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                  >
                    Cancel
                  </button>

                  <div className="flex gap-2">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => handleStepChange(currentStep - 1)}
                        className="h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        Back
                      </button>
                    )}
                    {currentStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => handleStepChange(currentStep + 1)}
                        className={`h-10 px-5 rounded-xl text-white text-xs font-semibold shadow-sm ${themeBg[themeColor]}`}
                      >
                        Next
                      </button>
                    ) : (
                      <ActionButton
                        type="submit"
                        isLoading={isProcessing}
                        actionType={isEditModalOpen ? 'update' : 'create'}
                        className={`h-10 px-5 rounded-xl text-white text-xs font-semibold shadow-sm ${themeBg[themeColor]}`}
                      >
                        {isEditModalOpen ? t('Save Changes') : t('Register Mobile User')}
                      </ActionButton>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE INTERACTIVE MOBILE APP DASHBOARD PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewDashboardOpen && previewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-[36px] bg-zinc-950 border-4 border-zinc-800 shadow-2xl p-4 text-white relative overflow-hidden flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              {/* Phone Notch / Speaker Bar */}
              <div className="w-32 h-4 bg-zinc-900 rounded-b-xl mx-auto mb-3 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-10 h-1 bg-zinc-800 rounded-full" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsPreviewDashboardOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Phone Content Container */}
              <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-1 custom-scrollbar text-zinc-100">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                      {previewUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold truncate max-w-[150px]">{previewUser.name}</h4>
                      <p className="text-[10px] text-zinc-400">{previewUser.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    previewUser.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {previewUser.status}
                  </span>
                </div>

                {/* Balance / Wallet Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border border-indigo-700/50 shadow-md">
                  <div className="text-[10px] uppercase font-bold text-indigo-300 flex justify-between items-center">
                    <span>FLEETPRO DIGITAL WALLET</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div className="text-xl font-extrabold mt-1 text-white">৳ 12,450.00</div>
                  <div className="text-[10px] text-indigo-200 mt-1 flex justify-between">
                    <span>Tenant: {previewUser.companyId || 'CMP-MOBILE-101'}</span>
                    <span>User ID: {previewUser.employeeId || previewUser.generatedUserId || 'UserId2627378'}</span>
                  </div>
                </div>

                {/* Dashboard Title & Perms Count */}
                {(() => {
                  const perms = previewUser.mobileModulePermissions || DEFAULT_MOBILE_MODULE_PERMISSIONS;
                  const allowedModules = MOBILE_DASHBOARD_MODULES.filter(m => perms[m.id] !== false);

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Mobile Dashboard</span>
                        </h5>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {allowedModules.length} / {MOBILE_DASHBOARD_MODULES.length} Icons
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                        <span>Show Hidden Icons:</span>
                        <button
                          onClick={() => setShowDisabledInPreview(!showDisabledInPreview)}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                            showDisabledInPreview ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {showDisabledInPreview ? 'ON (Debug)' : 'OFF (User View)'}
                        </button>
                      </div>

                      {/* Dynamic Dashboard Icons Grid */}
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        {MOBILE_DASHBOARD_MODULES.map((mod) => {
                          const isAllowed = perms[mod.id] !== false && previewUser.status === 'Active';

                          if (!isAllowed && !showDisabledInPreview) {
                            return null; // Strict UI Hide requirement!
                          }

                          return (
                            <button
                              key={mod.id}
                              disabled={testingModule === mod.id}
                              onClick={() => handleTestModuleAccess(previewUser, mod)}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 relative select-none ${
                                isAllowed
                                  ? 'bg-zinc-900/90 hover:bg-indigo-950/60 border-zinc-800 hover:border-indigo-600 text-zinc-100 shadow-sm active:scale-95'
                                  : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-600 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <div className={`p-2 rounded-xl ${
                                isAllowed ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30' : 'bg-zinc-800 text-zinc-600'
                              }`}>
                                {renderModuleIcon(mod.iconName, "w-5 h-5")}
                              </div>

                              <div className="w-full">
                                <div className="text-[11px] font-bold truncate leading-tight">{mod.name}</div>
                                <div className="text-[9px] text-zinc-400 truncate mt-0.5">{mod.bnName}</div>
                              </div>

                              {!isAllowed && showDisabledInPreview && (
                                <span className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800" title="Permission Denied">
                                  <Lock className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {allowedModules.length === 0 && !showDisabledInPreview && (
                        <div className="py-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800 p-4 space-y-2">
                          <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
                          <h6 className="text-xs font-bold text-zinc-300">No Dashboard Modules Allowed</h6>
                          <p className="text-[10px] text-zinc-500">
                            Admin has not enabled any module permissions for this user.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Phone Footer Navigation */}
              <div className="pt-3 border-t border-zinc-800/80 flex justify-around text-zinc-500 text-[10px] font-bold">
                <span className="text-indigo-400 flex flex-col items-center gap-0.5">
                  <Smartphone className="w-4 h-4" /> Home
                </span>
                <span className="flex flex-col items-center gap-0.5">
                  <Activity className="w-4 h-4" /> Activity
                </span>
                <span className="flex flex-col items-center gap-0.5">
                  <UserIcon className="w-4 h-4" /> Profile
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Detail View Modal */}
      {selectedUser && isViewProfileOpen && (
        <UserProfileModal
          user={selectedUser}
          isOpen={isViewProfileOpen}
          onClose={() => setIsViewProfileOpen(false)}
          onUpdateUser={onUpdateUser}
          themeColor={themeColor}
          triggerToast={triggerToast}
          triggerConfirm={triggerConfirm}
        />
      )}
    </div>
  );
}
