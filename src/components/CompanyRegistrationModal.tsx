/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Building2, CreditCard, Lock, Sparkles, Copy, 
  Eye, EyeOff, Check, ArrowRight, ArrowLeft, UploadCloud, 
  FileText, Printer, CheckCircle2, DollarSign, Calendar,
  Mail, Phone, Flag, Hash, MapPin, Globe, Map, Building, 
  Mailbox, Layers, LayoutGrid, Briefcase, Users, Car, Landmark, 
  Receipt, Percent
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { FloatingInput, FloatingSelect } from './FloatingInput';
import { ActionButton } from './ActionButton';

interface CompanyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const CompanyRegistrationModal: React.FC<CompanyRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  themeColor,
  triggerToast
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredData, setRegisteredData] = useState<any | null>(null);

  // Form states grouped by step
  // Step 1: Owner Info
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAltPhone, setOwnerAltPhone] = useState('');
  const [ownerDob, setOwnerDob] = useState('');
  const [ownerNationality, setOwnerNationality] = useState('Bangladeshi');
  const [ownerNid, setOwnerNid] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerCountry, setOwnerCountry] = useState('Bangladesh');
  const [ownerState, setOwnerState] = useState('');
  const [ownerCity, setOwnerCity] = useState('');
  const [ownerPostalCode, setOwnerPostalCode] = useState('');

  // Step 2: Company Info
  const [companyName, setCompanyName] = useState('');
  const [companyRegNumber, setCompanyRegNumber] = useState('');
  const [companyType, setCompanyType] = useState('Private Limited');
  const [businessCategory, setBusinessCategory] = useState('Logistics & Transport');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAltPhone, setCompanyAltPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyTaxVat, setCompanyTaxVat] = useState('');
  const [companyTradeLicense, setCompanyTradeLicense] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCountry, setCompanyCountry] = useState('Bangladesh');
  const [companyState, setCompanyState] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [companyPostalCode, setCompanyPostalCode] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 3: Subscription Info
  const [subscriptionPackage, setSubscriptionPackage] = useState('Yearly');
  const [billingType, setBillingType] = useState('Yearly Billing');
  const [subscriptionPrice, setSubscriptionPrice] = useState('120000');
  const [subscriptionDuration, setSubscriptionDuration] = useState('12 Months');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [subscriptionStatus, setSubscriptionStatus] = useState('Active');
  const [maxUserLimit, setMaxUserLimit] = useState('50');
  const [maxVehicleLimit, setMaxVehicleLimit] = useState('100');
  const [notes, setNotes] = useState('');

  // Step 4: Security & Password
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);

  // Step 5: Payment Info
  const [totalAmount, setTotalAmount] = useState('120000');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  // Cash details
  const [cashCollector, setCashCollector] = useState('');
  const [cashDate, setCashDate] = useState(new Date().toISOString().split('T')[0]);
  const [cashReceipt, setCashReceipt] = useState('');
  // Cheque details
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeBank, setChequeBank] = useState('');
  const [chequeBranch, setChequeBranch] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  // Bank Transfer details
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankSwift, setBankSwift] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Auto-fill Username when Email is typed
  useEffect(() => {
    setOwnerUsername(ownerEmail.trim().toLowerCase());
  }, [ownerEmail]);

  // Handle Dynamic Price/Duration/Limits based on Subscription Package
  useEffect(() => {
    if (subscriptionPackage === 'Monthly') {
      setSubscriptionPrice('15000');
      setSubscriptionDuration('1 Month');
      setBillingType('Monthly Billing');
      setMaxUserLimit('5');
      setMaxVehicleLimit('10');
    } else if (subscriptionPackage === 'Half-Yearly') {
      setSubscriptionPrice('75000');
      setSubscriptionDuration('6 Months');
      setBillingType('Bi-Annually Billing');
      setMaxUserLimit('25');
      setMaxVehicleLimit('50');
    } else if (subscriptionPackage === 'Yearly') {
      setSubscriptionPrice('120000');
      setSubscriptionDuration('12 Months');
      setBillingType('Yearly Billing');
      setMaxUserLimit('50');
      setMaxVehicleLimit('100');
    }
  }, [subscriptionPackage]);

  // Sync Total Amount with subscription price
  useEffect(() => {
    setTotalAmount(subscriptionPrice);
  }, [subscriptionPrice]);

  // Auto-calculate Subscription Expiry Date
  useEffect(() => {
    if (!startDate) return;
    const start = new Date(startDate);
    let monthsToAdd = 12;
    if (subscriptionPackage === 'Monthly') monthsToAdd = 1;
    if (subscriptionPackage === 'Half-Yearly') monthsToAdd = 6;
    if (subscriptionPackage === 'Yearly') monthsToAdd = 12;

    start.setMonth(start.getMonth() + monthsToAdd);
    setExpiryDate(start.toISOString().split('T')[0]);
  }, [startDate, subscriptionPackage]);

  // Generate strong password (10-12 chars: uppercase, lowercase, numbers, special)
  const generatePassword = () => {
    const length = 11;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./';
    let retVal = '';
    
    // Ensure we have at least one of each class
    retVal += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    retVal += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    retVal += '0123456789'[Math.floor(Math.random() * 10)];
    retVal += '!@#$%^&*()'[Math.floor(Math.random() * 10)];
    
    for (let i = 4; i < length; i++) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the generated password
    const shuffled = retVal.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    triggerToast(t('Password Generated'), t('A high security password has been compiled.'), 'success');
  };

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    triggerToast(t('Copied'), t('Password copied to clipboard successfully.'), 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  // Drag and Drop Logo Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast(t('Invalid File'), t('Please upload an image file (PNG/JPG).'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCompanyLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    // No validations! Admin can continue to the next step without entering any data.
    setDirection(1);
    setCurrentStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const handleCompleteRegistration = async () => {
    setIsSubmitting(true);
    
    // Assign secure fallback values for any empty fields to satisfy DB constraints
    const finalOwnerName = ownerName.trim() || `Owner-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalOwnerEmail = ownerEmail.trim() || `owner-${Math.floor(100000 + Math.random() * 900000)}@example.com`;
    const finalOwnerUsername = ownerUsername.trim() || finalOwnerEmail;
    const finalOwnerPhone = ownerPhone.trim() || `+880-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalCompanyName = companyName.trim() || `Company-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalPassword = password || `Owner@${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Gather payment info details based on method
      let paymentDetail: any = { totalAmount, paymentMethod };
      if (paymentMethod === 'Cash') {
        paymentDetail.cashInfo = JSON.stringify({ collector: cashCollector || 'Admin', date: cashDate, receipt: cashReceipt || 'REC-DEFAULT' });
      } else if (paymentMethod === 'Cheque') {
        paymentDetail.chequeNumber = chequeNumber || 'CHQ-DEFAULT';
        paymentDetail.bankName = chequeBank || 'Bank';
        paymentDetail.bankAccountNumber = chequeBranch || 'Branch'; // branch as account/meta
        paymentDetail.cashInfo = chequeDate || new Date().toISOString().split('T')[0]; // meta
      } else if (paymentMethod === 'Bank Transfer') {
        paymentDetail.bankName = bankName || 'Bank';
        paymentDetail.bankAccountNumber = bankAccount || 'ACC-DEFAULT';
        paymentDetail.accountHolderName = bankHolder || finalOwnerName;
        paymentDetail.transactionId = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        paymentDetail.cashInfo = bankSwift || 'SWIFT'; // swift as cashInfo
      }

      const payload = {
        ownerInfo: {
          name: finalOwnerName,
          email: finalOwnerEmail,
          username: finalOwnerUsername,
          phone: finalOwnerPhone,
          alternativeMobileNumber: ownerAltPhone,
          dateOfBirth: ownerDob,
          nationality: ownerNationality,
          nationalId: ownerNid,
          address: ownerAddress,
          country: ownerCountry,
          state: ownerState,
          city: ownerCity,
          postalCode: ownerPostalCode
        },
        companyInfo: {
          companyName: finalCompanyName,
          companyRegistrationNumber: companyRegNumber,
          companyType,
          businessCategory,
          companyEmail: companyEmail || finalOwnerEmail,
          companyPhone: companyPhone || finalOwnerPhone,
          alternativePhone: companyAltPhone,
          companyWebsite,
          taxVatRegistrationNumber: companyTaxVat,
          tradeLicenseNumber: companyTradeLicense,
          companyAddress,
          country: companyCountry,
          state: companyState,
          city: companyCity,
          postalCode: companyPostalCode,
          companyDescription,
          companyLogo
        },
        subscription: {
          subscriptionPackage,
          billingType,
          subscriptionPrice,
          subscriptionDuration,
          startDate,
          expiryDate,
          paymentStatus,
          subscriptionStatus,
          maxUserLimit,
          maxVehicleLimit,
          notes
        },
        password: finalPassword,
        payment: paymentDetail
      };

      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': 'Admin Owner',
          'X-User-Id': 'USR-000'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(t('Success'), t('Company and Owner accounts registered successfully.'), 'success');
        setRegisteredData({
          ...payload,
          companyId: data.companyId,
          subscriptionId: data.subscriptionId,
          paymentId: data.paymentId,
          ownerUserId: data.ownerUserId
        });
        setCurrentStep(6); // Step 6 is the dynamic printable success certificate!
      } else {
        triggerToast(t('Registration Error'), data.error || t('Failed to register company.'), 'error');
      }
    } catch (err) {
      console.error(err);
      triggerToast(t('Error'), t('A connection error occurred.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  // Stepper Header
  const steps = [
    { num: 1, name: t('Owner Info') },
    { num: 2, name: t('Company Info') },
    { num: 3, name: t('Subscription') },
    { num: 4, name: t('Security') },
    { num: 5, name: t('Payment') }
  ];

  const themeText = {
    blue: 'text-indigo-600 dark:text-indigo-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400'
  }[themeColor] || 'text-indigo-600';

  const themeBg = {
    blue: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    red: 'bg-rose-600',
    amber: 'bg-amber-600',
    purple: 'bg-purple-650'
  }[themeColor] || 'bg-indigo-600';

  const themeBorder = {
    blue: 'border-indigo-500',
    emerald: 'border-emerald-500',
    red: 'border-rose-500',
    amber: 'border-amber-500',
    purple: 'border-purple-500'
  }[themeColor] || 'border-indigo-500';

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto pointer-events-auto print:bg-white print:p-0 print:static print:inset-auto">
      <div className={`relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800 transition-all pointer-events-auto print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:static ${currentStep === 6 ? 'print:block' : 'print:hidden'}`}>
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              {t('Company Registration')}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {currentStep === 6 ? t('Registration Completed') : t('Complete all 5 steps to create and authorize a new tenant.')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header Block */}
        {currentStep <= 5 && (
          <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-150/60 dark:border-zinc-800 shrink-0 print:hidden overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px]">
              {steps.map((s, idx) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                        isActive 
                          ? `${themeBg} border-transparent text-white ring-4 ring-indigo-500/10` 
                          : isCompleted 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                      </div>
                      <span className={`text-[11px] font-bold tracking-tight whitespace-nowrap ${
                        isActive ? themeText : isCompleted ? 'text-emerald-500' : 'text-zinc-400'
                      }`}>
                        {s.name}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`h-[2px] flex-1 mx-4 transition-all ${
                        currentStep > s.num ? 'bg-emerald-500/40' : 'bg-zinc-200 dark:bg-zinc-800'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Stepper Content Frame */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 print:p-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {/* STEP 1: Owner Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold">1</div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t('Owner Information (Authorized Account)')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingInput 
                      label={t('Owner Full Name')}
                      value={ownerName}
                      onChange={e => setOwnerName(e.target.value)}
                      themeColor={themeColor}
                      icon={<User className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Email Address')}
                      type="email"
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      themeColor={themeColor}
                      icon={<Mail className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Mobile Number')}
                      value={ownerPhone}
                      onChange={e => setOwnerPhone(e.target.value)}
                      themeColor={themeColor}
                      icon={<Phone className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Alternative Phone')}
                      value={ownerAltPhone}
                      onChange={e => setOwnerAltPhone(e.target.value)}
                      themeColor={themeColor}
                      icon={<Phone className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Date of Birth')}
                      type="date"
                      value={ownerDob}
                      onChange={e => setOwnerDob(e.target.value)}
                      themeColor={themeColor}
                      icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingSelect 
                      label={t('Nationality')}
                      value={ownerNationality}
                      onChange={val => setOwnerNationality(val)}
                      category="Nationality"
                      fallbackOptions={['Bangladeshi', 'Saudi', 'Emirati', 'Qatari', 'Omani', 'Kuwaiti', 'Indian', 'Pakistani', 'American', 'British', 'Canadian']}
                      themeColor={themeColor}
                      icon={<Flag className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('National ID / Passport')}
                      value={ownerNid}
                      onChange={e => setOwnerNid(e.target.value)}
                      themeColor={themeColor}
                      icon={<Hash className="w-4 h-4 text-zinc-400" />}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('Permanent/Postal Address')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <FloatingInput 
                          label={t('Address details')}
                          value={ownerAddress}
                          onChange={e => setOwnerAddress(e.target.value)}
                          themeColor={themeColor}
                          icon={<MapPin className="w-4 h-4 text-zinc-400" />}
                        />
                      </div>
                      <FloatingSelect 
                        label={t('Country')}
                        value={ownerCountry}
                        onChange={val => setOwnerCountry(val)}
                        category="Country"
                        fallbackOptions={['Bangladesh', 'Saudi Arabia', 'Qatar', 'United Arab Emirates']}
                        themeColor={themeColor}
                        icon={<Globe className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput 
                        label={t('State / Province')}
                        value={ownerState}
                        onChange={e => setOwnerState(e.target.value)}
                        themeColor={themeColor}
                        icon={<Map className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput 
                        label={t('City')}
                        value={ownerCity}
                        onChange={e => setOwnerCity(e.target.value)}
                        themeColor={themeColor}
                        icon={<Building className="w-4 h-4 text-zinc-400" />}
                      />
                      <FloatingInput 
                        label={t('Postal Code')}
                        value={ownerPostalCode}
                        onChange={e => setOwnerPostalCode(e.target.value)}
                        themeColor={themeColor}
                        icon={<Mailbox className="w-4 h-4 text-zinc-400" />}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Company Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold">2</div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t('Company & Registration Details')}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingInput 
                      label={t('Company Name')}
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      themeColor={themeColor}
                      icon={<Building2 className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Company Registration Number')}
                      value={companyRegNumber}
                      onChange={e => setCompanyRegNumber(e.target.value)}
                      themeColor={themeColor}
                      icon={<Hash className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingSelect 
                      label={t('Company Type')}
                      value={companyType}
                      onChange={val => setCompanyType(val)}
                      category="CompanyType"
                      fallbackOptions={['Proprietorship', 'Partnership', 'Private Limited', 'Public Limited']}
                      themeColor={themeColor}
                      icon={<Layers className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingSelect 
                      label={t('Business Category')}
                      value={businessCategory}
                      onChange={val => setBusinessCategory(val)}
                      category="BusinessCategory"
                      fallbackOptions={['Logistics & Transport', 'Fleet Operator', 'E-commerce Delivery', 'Industrial Fleet']}
                      themeColor={themeColor}
                      icon={<LayoutGrid className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Company Email')}
                      type="email"
                      value={companyEmail}
                      onChange={e => setCompanyEmail(e.target.value)}
                      themeColor={themeColor}
                      icon={<Mail className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Company Contact Phone')}
                      value={companyPhone}
                      onChange={e => setCompanyPhone(e.target.value)}
                      themeColor={themeColor}
                      icon={<Phone className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Alternative Company Phone')}
                      value={companyAltPhone}
                      onChange={e => setCompanyAltPhone(e.target.value)}
                      themeColor={themeColor}
                      icon={<Phone className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Company Website (URL)')}
                      value={companyWebsite}
                      onChange={e => setCompanyWebsite(e.target.value)}
                      themeColor={themeColor}
                      icon={<Globe className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Tax / VAT Registration Number')}
                      value={companyTaxVat}
                      onChange={e => setCompanyTaxVat(e.target.value)}
                      themeColor={themeColor}
                      icon={<Percent className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Trade License Number')}
                      value={companyTradeLicense}
                      onChange={e => setCompanyTradeLicense(e.target.value)}
                      themeColor={themeColor}
                      icon={<FileText className="w-4 h-4 text-zinc-400" />}
                    />
                  </div>

                  {/* Drag and Drop Upload Logo Block */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t('Company Branding / Logo')}</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all gap-2 cursor-pointer ${
                        isDragging 
                          ? `${themeBorder} bg-zinc-50 dark:bg-zinc-800/40 scale-[0.99]` 
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 hover:bg-zinc-50 dark:hover:bg-zinc-800/25'
                      }`}
                      onClick={() => document.getElementById('companyLogoInput')?.click()}
                    >
                      <input 
                        id="companyLogoInput"
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleLogoFile(e.target.files[0]);
                          }
                        }}
                      />
                      {companyLogo ? (
                        <div className="flex items-center gap-4">
                          <img src={companyLogo} alt="Logo Preview" className="h-16 w-16 object-contain rounded-xl border border-zinc-150 p-1 bg-white" referrerPolicy="no-referrer" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{t('Logo Uploaded')}</p>
                            <p className="text-[10px] text-zinc-400">{t('Drag a new file to replace.')}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-zinc-400" />
                          <div className="text-center">
                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{t('Drag and drop logo image here')}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{t('Supports PNG, JPG, JPEG up to 2MB')}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Company Address & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <FloatingInput 
                        label={t('Company Office Address')}
                        value={companyAddress}
                        onChange={e => setCompanyAddress(e.target.value)}
                        themeColor={themeColor}
                        icon={<MapPin className="w-4 h-4 text-zinc-400" />}
                      />
                    </div>
                    <FloatingSelect 
                      label={t('Country')}
                      value={companyCountry}
                      onChange={val => setCompanyCountry(val)}
                      category="Country"
                      fallbackOptions={['Bangladesh', 'Saudi Arabia', 'Qatar', 'United Arab Emirates']}
                      themeColor={themeColor}
                      icon={<Globe className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('State / Province')}
                      value={companyState}
                      onChange={e => setCompanyState(e.target.value)}
                      themeColor={themeColor}
                      icon={<Map className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('City')}
                      value={companyCity}
                      onChange={e => setCompanyCity(e.target.value)}
                      themeColor={themeColor}
                      icon={<Building className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Postal Code')}
                      value={companyPostalCode}
                      onChange={e => setCompanyPostalCode(e.target.value)}
                      themeColor={themeColor}
                      icon={<Mailbox className="w-4 h-4 text-zinc-400" />}
                    />
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('About Company / Description')}</label>
                      <textarea
                        value={companyDescription}
                        onChange={e => setCompanyDescription(e.target.value)}
                        placeholder={t('About the business, transport scope etc.')}
                        className="w-full h-24 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent text-zinc-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Subscription */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold">3</div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t('Subscription & Licensing Package')}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingSelect 
                      label={t('Subscription Package')}
                      value={subscriptionPackage}
                      onChange={val => setSubscriptionPackage(val)}
                      category="SubscriptionPackage"
                      fallbackOptions={['Monthly', 'Half-Yearly', 'Yearly', 'Customized Subscription']}
                      themeColor={themeColor}
                      icon={<Sparkles className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingSelect 
                      label={t('Billing Frequency')}
                      value={billingType}
                      onChange={val => setBillingType(val)}
                      category="BillingFrequency"
                      fallbackOptions={['Monthly Billing', 'Quarterly Billing', 'Bi-Annually Billing', 'Yearly Billing', 'Lump Sum Payment']}
                      themeColor={themeColor}
                      icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Subscription Fee (Price)')}
                      value={subscriptionPrice}
                      onChange={e => setSubscriptionPrice(e.target.value)}
                      themeColor={themeColor}
                      icon={<DollarSign className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('License Duration')}
                      value={subscriptionDuration}
                      onChange={e => setSubscriptionDuration(e.target.value)}
                      themeColor={themeColor}
                      placeholder="e.g. 1 Month, 12 Months"
                      icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Contract Start Date')}
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      themeColor={themeColor}
                      icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Contract Expiry Date')}
                      type="date"
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      themeColor={themeColor}
                      icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingSelect 
                      label={t('Payment Status')}
                      value={paymentStatus}
                      onChange={val => setPaymentStatus(val)}
                      category="PaymentStatus"
                      fallbackOptions={['Paid', 'Partially Paid', 'Unpaid', 'Pending']}
                      themeColor={themeColor}
                      icon={<CheckCircle2 className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingSelect 
                      label={t('Subscription Status')}
                      value={subscriptionStatus}
                      onChange={val => setSubscriptionStatus(val)}
                      category="SubscriptionStatus"
                      fallbackOptions={['Active', 'Trial', 'Expired', 'Suspended', 'Grace Period']}
                      themeColor={themeColor}
                      icon={<CheckCircle2 className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Max User Limit')}
                      type="number"
                      value={maxUserLimit}
                      onChange={e => setMaxUserLimit(e.target.value)}
                      themeColor={themeColor}
                      icon={<Users className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingInput 
                      label={t('Max Vehicle Limit')}
                      type="number"
                      value={maxVehicleLimit}
                      onChange={e => setMaxVehicleLimit(e.target.value)}
                      themeColor={themeColor}
                      icon={<Car className="w-4 h-4 text-zinc-400" />}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Subscription Notes')}</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder={t('License notes, discounts or customizable terms.')}
                      className="w-full h-24 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-transparent text-zinc-800 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Security & Password */}
              {currentStep === 4 && (
                <div className="space-y-6 max-w-lg mx-auto py-4 text-center">
                  <div className="inline-flex items-center justify-center p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">{t('Owner Account Credentials & Security')}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                      {t('Credentials are automatically synchronized from step 1. Please generate a highly secure password.')}
                    </p>
                  </div>

                  {/* Mapped Information Container */}
                  <div className="text-left bg-zinc-50 dark:bg-zinc-950/60 p-5 rounded-3xl border border-zinc-150/60 dark:border-zinc-800 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('User ID (Authorized Email)')}</label>
                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">{t('Auto Mapped')}</span>
                      </div>
                      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 min-h-[38px] flex items-center select-all">
                        {ownerEmail ? ownerEmail : <span className="text-zinc-400 italic font-normal">{t('No Email Entered in Step 1')}</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Mobile Number')}</label>
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">{t('Auto Mapped')}</span>
                      </div>
                      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 min-h-[38px] flex items-center select-all">
                        {ownerPhone ? ownerPhone : <span className="text-zinc-400 italic font-normal">{t('No Mobile Number Entered in Step 1')}</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{t('Owner Password')}</label>
                      {password ? (
                        <div className="w-full flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl">
                          <span className="text-sm font-mono font-bold select-all tracking-wider text-zinc-800 dark:text-zinc-100">
                            {showPassword ? password : '••••••••••••'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all"
                              title={showPassword ? t('Hide Password') : t('Show Password')}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button 
                              type="button"
                              onClick={copyPassword}
                              className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
                              title={t('Copy Password')}
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-xs text-zinc-400 italic">
                          {t('No password generated yet.')}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={generatePassword}
                        className={`h-10 px-5 rounded-xl font-bold text-xs flex items-center gap-2 text-white shadow-lg transition-all ${themeBg} hover:opacity-90 active:scale-95`}
                      >
                        <Sparkles className="w-4 h-4" />
                        {password ? t('Regenerate Password') : t('Generate Secure Password')}
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('This temporary password will be forced to change on first login.')}</span>
                  </div>
                </div>
              )}

              {/* STEP 5: Payment Information */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold">5</div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{t('Payment Information & Checkout')}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FloatingInput 
                      label={t('Total Payable Amount')}
                      value={totalAmount}
                      onChange={e => setTotalAmount(e.target.value)}
                      themeColor={themeColor}
                      icon={<DollarSign className="w-4 h-4 text-zinc-400" />}
                    />
                    <FloatingSelect 
                      label={t('Payment Method')}
                      value={paymentMethod}
                      onChange={val => setPaymentMethod(val)}
                      category="PaymentMethod"
                      fallbackOptions={['Bank Transfer', 'Cash', 'Cheque']}
                      themeColor={themeColor}
                      icon={<CreditCard className="w-4 h-4 text-zinc-400" />}
                    />
                  </div>

                  {/* DYNAMIC FIELD CONTAINER: Renders inputs purely depending on Payment Method */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'Cash' && (
                      <motion.div 
                        key="cash"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-150/60 dark:border-zinc-800 space-y-4"
                      >
                        <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          {t('Cash Receipt Details')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FloatingInput 
                            label={t('Cash Collector Name')}
                            value={cashCollector}
                            onChange={e => setCashCollector(e.target.value)}
                            themeColor={themeColor}
                            icon={<User className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Collection Date')}
                            type="date"
                            value={cashDate}
                            onChange={e => setCashDate(e.target.value)}
                            themeColor={themeColor}
                            icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Receipt / Voucher Number')}
                            value={cashReceipt}
                            onChange={e => setCashReceipt(e.target.value)}
                            themeColor={themeColor}
                            icon={<Receipt className="w-4 h-4 text-zinc-400" />}
                          />
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'Cheque' && (
                      <motion.div 
                        key="cheque"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-150/60 dark:border-zinc-800 space-y-4"
                      >
                        <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {t('Commercial Bank Cheque')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FloatingInput 
                            label={t('Cheque Number')}
                            value={chequeNumber}
                            onChange={e => setChequeNumber(e.target.value)}
                            themeColor={themeColor}
                            icon={<Hash className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Issuing Bank Name')}
                            value={chequeBank}
                            onChange={e => setChequeBank(e.target.value)}
                            themeColor={themeColor}
                            icon={<Landmark className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Bank Branch Name')}
                            value={chequeBranch}
                            onChange={e => setChequeBranch(e.target.value)}
                            themeColor={themeColor}
                            icon={<Building className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Cheque Date')}
                            type="date"
                            value={chequeDate}
                            onChange={e => setChequeDate(e.target.value)}
                            themeColor={themeColor}
                            icon={<Calendar className="w-4 h-4 text-zinc-400" />}
                          />
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'Bank Transfer' && (
                      <motion.div 
                        key="bank"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-150/60 dark:border-zinc-800 space-y-4"
                      >
                        <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {t('Electronic Bank Transfer')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FloatingInput 
                            label={t('Recipient Bank Name')}
                            value={bankName}
                            onChange={e => setBankName(e.target.value)}
                            themeColor={themeColor}
                            icon={<Landmark className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Bank Account Number')}
                            value={bankAccount}
                            onChange={e => setBankAccount(e.target.value)}
                            themeColor={themeColor}
                            icon={<Hash className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Account Holder Name')}
                            value={bankHolder}
                            onChange={e => setBankHolder(e.target.value)}
                            themeColor={themeColor}
                            icon={<User className="w-4 h-4 text-zinc-400" />}
                          />
                          <FloatingInput 
                            label={t('Transaction Reference / ID')}
                            value={transactionId}
                            onChange={e => setTransactionId(e.target.value)}
                            themeColor={themeColor}
                            icon={<Hash className="w-4 h-4 text-zinc-400" />}
                          />
                          <div className="md:col-span-2">
                            <FloatingInput 
                              label={t('Routing Number / Swift Code')}
                              value={bankSwift}
                              onChange={e => setBankSwift(e.target.value)}
                              themeColor={themeColor}
                              icon={<Globe className="w-4 h-4 text-zinc-400" />}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* STEP 6: Success & Print Certificate */}
              {currentStep === 6 && registeredData && (
                <div className="space-y-6 py-4">
                  {/* Print Exclusion Header for Web Browser */}
                  <div className="flex flex-col items-center justify-center text-center gap-3 p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-3xl max-w-xl mx-auto print:hidden">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">{t('Registration Successful!')}</h3>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                        {t('The company and administrator credentials have been stored. Below is the official system confirmation sheet ready for immediate print.')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={handlePrint}
                        className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 flex items-center gap-1.5 shadow-sm hover:opacity-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        {t('Print A4 Report')}
                      </button>
                      <button 
                        onClick={onClose}
                        className="h-9 px-4 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-150/50 dark:hover:bg-zinc-800"
                      >
                        {t('Close Wizard')}
                      </button>
                    </div>
                  </div>

                  {/* HIGHLY PROFESSIONAL A4 PRINT LAYOUT */}
                  {/* Inside standard browser, styled elegantly. When window.print() triggers, we hide other views and force A4 dimensions */}
                  <div className="print-certified-page bg-white text-black p-8 sm:p-12 rounded-2xl border border-zinc-250 mx-auto max-w-[210mm] shadow-xl font-sans relative print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:bg-white text-left">
                    
                    {/* Page Header Accent (Not shown on printing if we want neat, or keep it) */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600 print:bg-indigo-600" />
                    
                    {/* Header Grid */}
                    <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8 mt-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {companyLogo ? (
                            <img src={companyLogo} alt="Logo" className="h-10 object-contain max-w-[120px]" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">FP</div>
                          )}
                          <h1 className="text-xl font-extrabold uppercase tracking-tight text-zinc-900">{companyName}</h1>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-medium">{t('Tenant ID:')} <span className="font-mono font-bold text-black">{registeredData.companyId}</span></p>
                        <p className="text-[10px] text-zinc-500 font-medium">{t('Trade License:')} <span className="font-semibold text-black">{companyTradeLicense || 'N/A'}</span></p>
                      </div>

                      <div className="text-right space-y-1.5">
                        <span className="inline-block bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold text-[9px] uppercase px-2.5 py-1 rounded-full">{t('System Certified')}</span>
                        <p className="text-[10px] text-zinc-500 font-medium">{t('Issue Date:')} <span className="font-semibold text-black">{new Date().toLocaleDateString()}</span></p>
                        <p className="text-[10px] text-zinc-500 font-medium">{t('Receipt Number:')} <span className="font-mono font-semibold text-black">{registeredData.paymentId}</span></p>
                      </div>
                    </div>

                    {/* Report Sections */}
                    <div className="space-y-6 py-6 text-sm">
                      
                      {/* Section 1: Entity Profile */}
                      <div>
                        <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-200 pb-1 mb-3">{t('1. Company Profile Details')}</h2>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Registration Number')}</span>
                            <span className="font-semibold text-zinc-950">{companyRegNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Company Type / Category')}</span>
                            <span className="font-semibold text-zinc-950">{companyType} / {businessCategory}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Office Email & Phone')}</span>
                            <span className="font-semibold text-zinc-950">{companyEmail || 'N/A'} / {companyPhone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Company Address')}</span>
                            <span className="font-semibold text-zinc-950">{companyAddress || 'N/A'}, {companyCity}, {companyCountry}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Owner / Administrator Account */}
                      <div>
                        <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-200 pb-1 mb-3">{t('2. Authorized Account Holder Info')}</h2>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Owner Full Name')}</span>
                            <span className="font-semibold text-zinc-950">{ownerName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('User Login ID / Email')}</span>
                            <span className="font-mono font-semibold text-zinc-950">{ownerUsername} / {ownerEmail}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Account ID Number')}</span>
                            <span className="font-mono font-semibold text-zinc-950">{registeredData.ownerUserId}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Owner Mobile / Country')}</span>
                            <span className="font-semibold text-zinc-950">{ownerPhone} / {ownerCountry}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Subscription & Licensing */}
                      <div>
                        <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-200 pb-1 mb-3">{t('3. FleetPro Subscription & Limits')}</h2>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150">
                            <span className="text-zinc-500 font-medium block">{t('Licensing Package')}</span>
                            <span className="font-bold text-zinc-950">{subscriptionPackage}</span>
                          </div>
                          <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150">
                            <span className="text-zinc-500 font-medium block">{t('User Limits')}</span>
                            <span className="font-bold text-zinc-950">{maxUserLimit} {t('Active Users')}</span>
                          </div>
                          <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150">
                            <span className="text-zinc-500 font-medium block">{t('Vehicle Limits')}</span>
                            <span className="font-bold text-zinc-950">{maxVehicleLimit} {t('Fleet Vehicles')}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-xs mt-3">
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Validity Period')}</span>
                            <span className="font-semibold text-zinc-950">{startDate} {t('to')} {expiryDate}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 font-medium block">{t('Subscription ID')}</span>
                            <span className="font-mono font-semibold text-zinc-950">{registeredData.subscriptionId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Settlement & Financial Records */}
                      <div>
                        <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-200 pb-1 mb-3">{t('4. Invoice & Payment Statement')}</h2>
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b-2 border-zinc-200 bg-zinc-50 text-zinc-500">
                              <th className="py-2 px-3 font-semibold">{t('Description')}</th>
                              <th className="py-2 px-3 font-semibold text-right">{t('Payment Method')}</th>
                              <th className="py-2 px-3 font-semibold text-right">{t('Amount Paid')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-zinc-100">
                              <td className="py-2.5 px-3 font-semibold text-zinc-950">
                                {t('FleetPro System Licensing')} ({subscriptionPackage} - {subscriptionDuration})
                              </td>
                              <td className="py-2.5 px-3 text-right text-zinc-950">{paymentMethod}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-zinc-950">৳{totalAmount}</td>
                            </tr>
                            <tr className="font-extrabold text-zinc-950 bg-zinc-50/50">
                              <td className="py-2 px-3" colSpan={2}>{t('Grand Total Paid')}</td>
                              <td className="py-2 px-3 text-right text-sm">৳{totalAmount}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Disclaimer Footnote */}
                    <div className="border-t border-zinc-200 pt-6 mt-10 text-[9px] text-zinc-400 flex justify-between items-center font-medium">
                      <p>© {new Date().getFullYear()} FleetPro Multi-Tenant Inc. All rights reserved.</p>
                      <p>{t('Page 1 of 1')} • Generated Dynamically</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Actions Footer */}
        {currentStep <= 5 && (
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 print:hidden">
            <button
              onClick={handleBackStep}
              disabled={currentStep === 1}
              className="h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-150/50 dark:hover:bg-zinc-800/60 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('Back')}
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNextStep}
                className={`h-11 px-6 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer ${themeBg} hover:opacity-90 transition-all`}
              >
                {t('Continue')}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <ActionButton
                onClick={handleCompleteRegistration}
                isLoading={isSubmitting}
                actionType="save"
                className={`h-11 px-6 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer ${themeBg} hover:opacity-90 transition-all`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('Complete Registration & Create Company')}
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
