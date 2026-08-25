/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, Plus, Trash2, Globe, Sparkles, Map, Info, 
  MapPin, UserCheck, ShieldCheck, FileText, Compass, 
  HelpCircle, Search, Hash, Flag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface ControlPanelViewProps {
  themeColor: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  triggerToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  triggerConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

// Country mappings to get code and flag emoji/logo
const COUNTRY_LOOKUP: Record<string, { code: string; emoji: string; name: string; mobileCode: string; nationality: string }> = {
  'bangladesh': { code: 'bd', emoji: '🇧🇩', name: 'Bangladesh', mobileCode: '+880', nationality: 'Bangladeshi' },
  'qatar': { code: 'qa', emoji: '🇶🇦', name: 'Qatar', mobileCode: '+974', nationality: 'Qatari' },
  'saudi arabia': { code: 'sa', emoji: '🇸🇦', name: 'Saudi Arabia', mobileCode: '+966', nationality: 'Saudi' },
  'saudi': { code: 'sa', emoji: '🇸🇦', name: 'Saudi Arabia', mobileCode: '+966', nationality: 'Saudi' },
  'united arab emirates': { code: 'ae', emoji: '🇦🇪', name: 'United Arab Emirates', mobileCode: '+971', nationality: 'Emirati' },
  'uae': { code: 'ae', emoji: '🇦🇪', name: 'United Arab Emirates', mobileCode: '+971', nationality: 'Emirati' },
  'united states': { code: 'us', emoji: '🇺🇸', name: 'United States', mobileCode: '+1', nationality: 'American' },
  'usa': { code: 'us', emoji: '🇺🇸', name: 'United States', mobileCode: '+1', nationality: 'American' },
  'united kingdom': { code: 'gb', emoji: '🇬🇧', name: 'United Kingdom', mobileCode: '+44', nationality: 'British' },
  'uk': { code: 'gb', emoji: '🇬🇧', name: 'United Kingdom', mobileCode: '+44', nationality: 'British' },
  'oman': { code: 'om', emoji: '🇴🇲', name: 'Oman', mobileCode: '+968', nationality: 'Omani' },
  'kuwait': { code: 'kw', emoji: '🇰🇼', name: 'Kuwait', mobileCode: '+965', nationality: 'Kuwaiti' },
  'bahrain': { code: 'bh', emoji: '🇧🇭', name: 'Bahrain', mobileCode: '+973', nationality: 'Bahraini' },
  'india': { code: 'in', emoji: '🇮🇳', name: 'India', mobileCode: '+91', nationality: 'Indian' },
  'singapore': { code: 'sg', emoji: '🇸🇬', name: 'Singapore', mobileCode: '+65', nationality: 'Singaporean' },
  'malaysia': { code: 'my', emoji: '🇲🇾', name: 'Malaysia', mobileCode: '+60', nationality: 'Malaysian' },
  'canada': { code: 'ca', emoji: '🇨🇦', name: 'Canada', mobileCode: '+1', nationality: 'Canadian' },
  'australia': { code: 'au', emoji: '🇦🇺', name: 'Australia', mobileCode: '+61', nationality: 'Australian' },
  'germany': { code: 'de', emoji: '🇩🇪', name: 'Germany', mobileCode: '+49', nationality: 'German' },
  'france': { code: 'fr', emoji: '🇫🇷', name: 'France', mobileCode: '+33', nationality: 'French' },
  'italy': { code: 'it', emoji: '🇮🇹', name: 'Italy', mobileCode: '+39', nationality: 'Italian' },
  'japan': { code: 'jp', emoji: '🇯🇵', name: 'Japan', mobileCode: '+81', nationality: 'Japanese' },
};

// Interface for database categories
type ControlCategory = 
  | 'Nationality' | 'Country' | 'Mobile Code' | 'Documents Type' | 'Gender' | 'Religion' | 'Relationship' | 'Profession'
  | 'Building Number' | 'Zone Number' | 'State number' | 'Area Name' | 'City' | 'Region' | 'Police Station' | 'Post office Name' | 'Postal code';

interface ListItem {
  id: string;
  name: string;
  extraInfo?: string; // e.g. code or country mapping
  countryCode?: string; // for flag logo rendering
}

export function ControlPanelView({ themeColor, triggerToast, triggerConfirm }: ControlPanelViewProps) {
  const { t, toDigits } = useLanguage();

  // Dynamic Theme Colors
  const themeAccentBg = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    red: 'bg-rose-600 hover:bg-rose-700 text-white',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white',
    purple: 'bg-purple-650 hover:bg-purple-700 text-white',
  }[themeColor] || 'bg-blue-600 text-white';

  const themeTextActive = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-500/30',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30',
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-500/30',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-500/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-500/30',
  }[themeColor] || 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-500/30';

  const themeBorderFocus = {
    blue: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    emerald: 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
    red: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20',
    amber: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
    purple: 'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
  }[themeColor] || 'focus:border-blue-500';

  // Category Configuration
  const categories: { id: ControlCategory; label: string; icon: React.ReactNode; group: string }[] = [
    { id: 'Nationality', label: t('Nationality'), icon: <UserCheck className="w-4 h-4" />, group: t('Personal Demographics') },
    { id: 'Country', label: t('Country'), icon: <Globe className="w-4 h-4" />, group: t('Personal Demographics') },
    { id: 'Mobile Code', label: t('Mobile Code'), icon: <Flag className="w-4 h-4" />, group: t('Personal Demographics') },
    { id: 'Documents Type', label: t('Documents Type'), icon: <FileText className="w-4 h-4" />, group: t('Personal Demographics') },
    { id: 'Gender', label: t('Gender'), icon: <UserCheck className="w-4 h-4" />, group: t('Personal Demographics') },
    { id: 'Religion', label: t('Religion'), icon: <Sliders className="w-4 h-4" />, group: t('Personal Demographics') },
    { id: 'Relationship', label: t('Relationship'), icon: <HelpCircle className="w-4 h-4" />, group: t('Personal Demographics') },
    { id: 'Profession', label: t('Profession'), icon: <Sparkles className="w-4 h-4" />, group: t('Personal Demographics') },
    
    { id: 'Building Number', label: t('Building Number'), icon: <Hash className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'Zone Number', label: t('Zone Number'), icon: <Compass className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'State number', label: t('State number'), icon: <Hash className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'Area Name', label: t('Area Name'), icon: <MapPin className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'City', label: t('City'), icon: <Map className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'Region', label: t('Region'), icon: <Compass className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'Police Station', label: t('Police Station'), icon: <ShieldCheck className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'Post office Name', label: t('Post office Name'), icon: <MapPin className="w-4 h-4" />, group: t('Address & Geo Metrics') },
    { id: 'Postal code', label: t('Postal code'), icon: <Hash className="w-4 h-4" />, group: t('Address & Geo Metrics') },
  ];

  // Active Category State
  const [activeCategory, setActiveCategory] = useState<ControlCategory>('Nationality');

  // Load Database from localStorage
  const [db, setDb] = useState<Record<ControlCategory, ListItem[]>>(() => {
    const saved = localStorage.getItem('fleetpro_control_panel_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use fallback initial values below
      }
    }

    // Default seed data
    return {
      Nationality: [
        { id: 'nat-1', name: 'Bangladeshi', countryCode: 'bd' },
        { id: 'nat-2', name: 'Qatari', countryCode: 'qa' },
        { id: 'nat-3', name: 'Saudi', countryCode: 'sa' },
        { id: 'nat-4', name: 'American', countryCode: 'us' },
        { id: 'nat-5', name: 'British', countryCode: 'gb' },
        { id: 'nat-6', name: 'Indian', countryCode: 'in' },
      ],
      Country: [
        { id: 'c-1', name: 'Bangladesh', countryCode: 'bd' },
        { id: 'c-2', name: 'Qatar', countryCode: 'qa' },
        { id: 'c-3', name: 'Saudi Arabia', countryCode: 'sa' },
        { id: 'c-4', name: 'United States', countryCode: 'us' },
        { id: 'c-5', name: 'United Kingdom', countryCode: 'gb' },
        { id: 'c-6', name: 'India', countryCode: 'in' },
      ],
      'Mobile Code': [
        { id: 'mc-1', name: '+880', extraInfo: 'Bangladesh', countryCode: 'bd' },
        { id: 'mc-2', name: '+974', extraInfo: 'Qatar', countryCode: 'qa' },
        { id: 'mc-3', name: '+966', extraInfo: 'Saudi Arabia', countryCode: 'sa' },
        { id: 'mc-4', name: '+1', extraInfo: 'USA', countryCode: 'us' },
        { id: 'mc-5', name: '+44', extraInfo: 'United Kingdom', countryCode: 'gb' },
        { id: 'mc-6', name: '+91', extraInfo: 'India', countryCode: 'in' },
      ],
      'Documents Type': [
        { id: 'doc-1', name: 'NID' },
        { id: 'doc-2', name: 'Passport' },
        { id: 'doc-3', name: 'Driving License' },
        { id: 'doc-4', name: 'Birth Certificate' },
        { id: 'doc-5', name: 'QID (Qatar ID)' },
      ],
      Gender: [
        { id: 'g-1', name: 'Male' },
        { id: 'g-2', name: 'Female' },
        { id: 'g-3', name: 'Other' },
      ],
      Religion: [
        { id: 'r-1', name: 'Islam' },
        { id: 'r-2', name: 'Hinduism' },
        { id: 'r-3', name: 'Christianity' },
        { id: 'r-4', name: 'Buddhism' },
      ],
      Relationship: [
        { id: 'rel-1', name: 'Single' },
        { id: 'rel-2', name: 'Married' },
        { id: 'rel-3', name: 'Divorced' },
        { id: 'rel-4', name: 'Widowed' },
      ],
      Profession: [
        { id: 'p-1', name: 'Software Engineer' },
        { id: 'p-2', name: 'Fleet Operator' },
        { id: 'p-3', name: 'Professional Driver' },
        { id: 'p-4', name: 'Admin Manager' },
        { id: 'p-5', name: 'Field Supervisor' },
      ],
      'Building Number': [
        { id: 'b-1', name: 'Building 12' },
        { id: 'b-2', name: 'Building 45' },
        { id: 'b-3', name: 'Building 102' },
        { id: 'b-4', name: 'Villa A-22' },
      ],
      'Zone Number': [
        { id: 'z-1', name: 'Zone 5' },
        { id: 'z-2', name: 'Zone 10' },
        { id: 'z-3', name: 'Zone 56' },
        { id: 'z-4', name: 'Zone 2' },
      ],
      'State number': [
        { id: 's-1', name: 'State 1' },
        { id: 's-2', name: 'State 2' },
        { id: 's-3', name: 'State 3' },
      ],
      'Area Name': [
        { id: 'a-1', name: 'Gulshan' },
        { id: 'a-2', name: 'Banani' },
        { id: 'a-3', name: 'Al Sadd' },
        { id: 'a-4', name: 'West Bay' },
      ],
      City: [
        { id: 'ct-1', name: 'Dhaka' },
        { id: 'ct-2', name: 'Doha' },
        { id: 'ct-3', name: 'Riyadh' },
        { id: 'ct-4', name: 'New York' },
      ],
      Region: [
        { id: 'reg-1', name: 'Dhaka Division' },
        { id: 'reg-2', name: 'Ad Dawhah' },
        { id: 'reg-3', name: 'Ar Riyad' },
      ],
      'Police Station': [
        { id: 'ps-1', name: 'Gulshan Thana' },
        { id: 'ps-2', name: 'Banani Thana' },
        { id: 'ps-3', name: 'Al Sadd Precinct' },
      ],
      'Post office Name': [
        { id: 'po-1', name: 'Gulshan GPO' },
        { id: 'po-2', name: 'Doha Central GPO' },
      ],
      'Postal code': [
        { id: 'pc-1', name: '1212' },
        { id: 'pc-2', name: '1213' },
        { id: 'pc-3', name: '3050' },
      ],
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fleetpro_control_panel_db', JSON.stringify(db));
  }, [db]);

  // Form inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemExtra, setNewItemExtra] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Country Auto-matching Flag Logo State
  const [matchedCountry, setMatchedCountry] = useState<{ name: string; emoji: string; code: string } | null>(null);

  // Run country matching as user types
  useEffect(() => {
    const searchVal = newItemName.trim().toLowerCase();
    if (!searchVal || (activeCategory !== 'Country' && activeCategory !== 'Nationality' && activeCategory !== 'Mobile Code')) {
      setMatchedCountry(null);
      return;
    }

    // Attempt to match typed country name in LOOKUP
    let found = Object.entries(COUNTRY_LOOKUP).find(([key]) => key.includes(searchVal) || searchVal.includes(key));
    
    // If we're entering a mobile code, search by country name or code too
    if (!found && activeCategory === 'Mobile Code') {
      const cleanedCode = newItemName.replace('+', '').trim();
      found = Object.entries(COUNTRY_LOOKUP).find(([_, info]) => info.mobileCode.includes(cleanedCode));
    }

    if (found) {
      setMatchedCountry({
        name: found[1].name,
        emoji: found[1].emoji,
        code: found[1].code,
      });
      // Auto-set extra code info for mobile code if missing
      if (activeCategory === 'Mobile Code' && !newItemExtra) {
        setNewItemExtra(found[1].name);
      }
    } else {
      setMatchedCountry(null);
    }
  }, [newItemName, activeCategory]);

  // Handle Add New Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = newItemName.trim();
    if (!cleanedName) {
      triggerToast(t('Error'), t('Name or Value is required.'), 'warning');
      return;
    }

    // Check duplicate
    const isDuplicate = db[activeCategory].some(
      item => item.name.toLowerCase() === cleanedName.toLowerCase()
    );
    if (isDuplicate) {
      triggerToast(t('Duplicate Entry'), t('This item already exists in the drop-down list.'), 'warning');
      return;
    }

    const newItem: ListItem = {
      id: `${activeCategory.toLowerCase().replace(' ', '-')}-${Date.now()}`,
      name: cleanedName,
      extraInfo: newItemExtra.trim() || undefined,
      countryCode: matchedCountry?.code || undefined,
    };

    setDb(prev => ({
      ...prev,
      [activeCategory]: [newItem, ...prev[activeCategory]],
    }));

    triggerToast(t('Success'), t('Added new option for {category}: {item}', { category: activeCategory, item: cleanedName }), 'success');
    setNewItemName('');
    setNewItemExtra('');
    setMatchedCountry(null);
  };

  // Handle Delete Item
  const handleDeleteItem = (id: string, name: string) => {
    triggerConfirm(
      t('Delete Option'),
      t('Are you sure you want to delete "{name}" from the drop-down option database?', { name }),
      () => {
        setDb(prev => ({
          ...prev,
          [activeCategory]: prev[activeCategory].filter(item => item.id !== id),
        }));
        triggerToast(t('Deleted'), t('Successfully removed item from the options list.'), 'info');
      }
    );
  };

  // Filter list
  const filteredList = db[activeCategory].filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.extraInfo && item.extraInfo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6"
    >
      {/* Intro Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">{t('System Control Panel')}</h3>
          </div>
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-400 max-w-2xl">
            {t('Add, configure, and maintain structural drop-down option databases used in registrations, profiles, and dispatch systems.')}
          </p>
        </div>
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-2 rounded-xl border border-indigo-100/30 dark:border-indigo-900/40 flex items-center gap-2 self-start md:self-center shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {t('Dynamic Live Sync Active')}
          </span>
        </div>
      </div>

      {/* Main Layout - Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Category Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">{t('Select System Dropdown')}</h4>
            </div>
            
            <div className="overflow-y-auto p-2 space-y-3 flex-1 scrollbar-thin">
              {/* Groups mapping */}
              {Array.from(new Set(categories.map(c => c.group))).map(groupName => (
                <div key={groupName} className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400/80 px-2.5 pt-2 pb-1 block">
                    {groupName}
                  </span>
                  
                  <div className="space-y-0.5">
                    {categories.filter(c => c.group === groupName).map(cat => {
                      const isActive = activeCategory === cat.id;
                      const count = db[cat.id]?.length || 0;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveCategory(cat.id);
                            setNewItemName('');
                            setNewItemExtra('');
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                            isActive
                              ? themeTextActive + ' border font-extrabold shadow-2xs'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-white font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={isActive ? 'text-indigo-500' : 'text-zinc-400'}>{cat.icon}</span>
                            <span className="text-xs truncate">{cat.label}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                          }`}>
                            {toDigits(count)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Category Data List & Input Forms (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
            
            {/* Active Category Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                  {categories.find(c => c.id === activeCategory)?.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {t(activeCategory)} {t('Options Register')}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    {t('Used inside active registration drop-downs')}
                  </p>
                </div>
              </div>

              {/* Search filter in category */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder={t('Search inside {category}...', { category: t(activeCategory) })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:border-indigo-500"
                />
              </div>
            </div>

            {/* List entries */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[350px] scrollbar-thin">
              {filteredList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Info className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t('No options listed.')}</p>
                  <p className="text-[10px] text-zinc-400 mt-1">{t('Use the form below to add the first entry.')}</p>
                </div>
              ) : (
                <div className="app-form-grid">
                  <AnimatePresence>
                    {filteredList.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-zinc-50/60 dark:bg-zinc-800/20 p-3 rounded-xl border border-zinc-200/30 dark:border-zinc-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Flag Logo display */}
                          {item.countryCode ? (
                            <img
                              src={`https://flagcdn.com/w40/${item.countryCode}.png`}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-5.5 h-4 object-cover rounded-xs border border-zinc-200/50 dark:border-zinc-800/80 shadow-3xs"
                            />
                          ) : (
                            (activeCategory === 'Country' || activeCategory === 'Nationality' || activeCategory === 'Mobile Code') && (
                              <div className="w-5.5 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-xs flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">
                                🏳️
                              </div>
                            )
                          )}
                          <div className="truncate">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                              {item.name}
                            </span>
                            {item.extraInfo && (
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-400 font-extrabold block uppercase truncate">
                                {item.extraInfo}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
                          title={t('Delete Entry')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Input Form Box */}
            <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 shrink-0">
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/80 pb-2 mb-2">
                  <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                    {t('Add New Option to {category}', { category: t(activeCategory) })}
                  </h5>
                  
                  {/* Dynamic Flag Logo Real-Time Preview Display */}
                  {matchedCountry && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/40 shadow-3xs"
                    >
                      <img
                        src={`https://flagcdn.com/w40/${matchedCountry.code}.png`}
                        alt={matchedCountry.name}
                        referrerPolicy="no-referrer"
                        className="w-4 h-3 object-cover rounded-xs"
                      />
                      <span>
                        {matchedCountry.emoji} {matchedCountry.name}
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="app-form-grid">
                  {/* Primary Name/Value Input */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      {activeCategory === 'Mobile Code' ? t('Dial Code (+880, +974)') : t('Name / Entry Value')}
                    </label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={
                        activeCategory === 'Nationality' ? 'e.g. Bangladeshi' :
                        activeCategory === 'Country' ? 'e.g. Bangladesh' :
                        activeCategory === 'Mobile Code' ? 'e.g. +880' :
                        activeCategory === 'Documents Type' ? 'e.g. Trade License' :
                        'Type value here...'
                      }
                      className={`w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-800 dark:text-zinc-100 outline-none transition-all ${themeBorderFocus}`}
                    />
                  </div>

                  {/* Optional Extra/Secondary Code Info */}
                  {(activeCategory === 'Mobile Code' || activeCategory === 'Nationality') && (
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        {activeCategory === 'Mobile Code' ? t('Country Name (Extra Info)') : t('Country Code (e.g. bd, us)')}
                      </label>
                      <input
                        type="text"
                        value={newItemExtra}
                        onChange={(e) => setNewItemExtra(e.target.value)}
                        placeholder={activeCategory === 'Mobile Code' ? 'e.g. Bangladesh' : 'e.g. bd'}
                        className={`w-full h-10 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-800 dark:text-zinc-100 outline-none transition-all ${themeBorderFocus}`}
                      />
                    </div>
                  )}

                  {/* Action submit button */}
                  <div className={`col-span-1 sm:col-span-2 flex items-end ${!(activeCategory === 'Mobile Code' || activeCategory === 'Nationality') && 'sm:col-span-2'}`}>
                    <button
                      type="submit"
                      className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${themeAccentBg}`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('Add New Option')}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}
