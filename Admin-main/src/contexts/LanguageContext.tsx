/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, TranslationsDict, flatTranslations } from '../translations';

export type LanguageType = 'en' | 'bn' | 'ar' | 'hi';
export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'QAR' | 'INR' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: Record<LanguageType, string>;
  symbol: Record<LanguageType, string>;
  position: 'prefix' | 'suffix';
  exchangeRateFromBDT: number; // base reference 1 BDT = X
  decimalPlaces: number;
}

export const supportedCurrencies: CurrencyConfig[] = [
  {
    code: 'BDT',
    name: {
      en: 'Bangladesh - Taka',
      bn: 'বাংলাদেশ - টাকা',
      ar: 'بنغلاديش - تاكا',
      hi: 'बांग्लादेश - टका',
    },
    symbol: {
      en: '৳',
      bn: '৳',
      ar: 'د.ب',
      hi: '৳',
    },
    position: 'suffix',
    exchangeRateFromBDT: 1,
    decimalPlaces: 0,
  },
  {
    code: 'USD',
    name: {
      en: 'USA - US Dollar',
      bn: 'যুক্তরাষ্ট্র - মার্কিন ডলার',
      ar: 'الولايات المتحدة - دولار أمريكي',
      hi: 'यूएसए - यूएस डॉलर',
    },
    symbol: {
      en: '$',
      bn: '$',
      ar: '$',
      hi: '$',
    },
    position: 'prefix',
    exchangeRateFromBDT: 0.0083, // 1 USD ≈ 120.5 BDT
    decimalPlaces: 2,
  },
  {
    code: 'EUR',
    name: {
      en: 'Europe - Euro',
      bn: 'ইউরোপ - ইউরো',
      ar: 'أوروبا - يورو',
      hi: 'यूरोप - यूरो',
    },
    symbol: {
      en: '€',
      bn: '€',
      ar: '€',
      hi: '€',
    },
    position: 'prefix',
    exchangeRateFromBDT: 0.0076,
    decimalPlaces: 2,
  },
  {
    code: 'GBP',
    name: {
      en: 'UK - British Pound',
      bn: 'যুক্তরাজ্য - ব্রিটিশ পাউন্ড',
      ar: 'المملكة المتحدة - جنيه إسترليني',
      hi: 'यूके - ব্রিটিশ পাউন্ড',
    },
    symbol: {
      en: '£',
      bn: '£',
      ar: '£',
      hi: '£',
    },
    position: 'prefix',
    exchangeRateFromBDT: 0.0065,
    decimalPlaces: 2,
  },
  {
    code: 'SAR',
    name: {
      en: 'Saudi Arabia - Riyal',
      bn: 'সৌদি আরব - রিয়াল',
      ar: 'المملكة العربية السعودية - ريال',
      hi: 'सऊदी अरब - रियाल',
    },
    symbol: {
      en: 'SAR',
      bn: 'রিয়াল',
      ar: 'ر.س',
      hi: 'रियाल',
    },
    position: 'suffix',
    exchangeRateFromBDT: 0.031,
    decimalPlaces: 2,
  },
  {
    code: 'QAR',
    name: {
      en: 'Qatar - Riyal',
      bn: 'কাতার - রিয়াল',
      ar: 'قطر - ريال',
      hi: 'कतर - रियाल',
    },
    symbol: {
      en: 'QAR',
      bn: 'QAR',
      ar: 'ر.ق',
      hi: 'QAR',
    },
    position: 'suffix',
    exchangeRateFromBDT: 0.0302, // 1 QAR ≈ 33.1 BDT
    decimalPlaces: 2,
  },
  {
    code: 'INR',
    name: {
      en: 'India - Rupee',
      bn: 'ভারত - রুপি',
      ar: 'الهند - روبية',
      hi: 'भारत - रुपया',
    },
    symbol: {
      en: '₹',
      bn: '₹',
      ar: 'ر.ه',
      hi: '₹',
    },
    position: 'prefix',
    exchangeRateFromBDT: 0.73,
    decimalPlaces: 2,
  },
  {
    code: 'AED',
    name: {
      en: 'UAE - Dirham',
      bn: 'সংযুক্ত আরব আমিরাত - দিরহাম',
      ar: 'الإمارات - درهم',
      hi: 'यूएई दिरहम (AED)',
    },
    symbol: {
      en: 'AED',
      bn: 'দিরহাম',
      ar: 'د.إ',
      hi: 'दिरहम',
    },
    position: 'suffix',
    exchangeRateFromBDT: 0.0305,
    decimalPlaces: 2,
  },
];

// Default mapped currency for each language selection
export const defaultCurrencyByLanguage: Record<LanguageType, CurrencyCode> = {
  bn: 'BDT',
  en: 'USD',
  ar: 'SAR',
  hi: 'INR',
};

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const arDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const hiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const toLocalizedDigits = (val: string | number, lang: LanguageType): string => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (lang === 'bn') {
    return str.replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
  }
  if (lang === 'ar') {
    return str.replace(/\d/g, (d) => arDigits[parseInt(d, 10)]);
  }
  if (lang === 'hi') {
    return str.replace(/\d/g, (d) => hiDigits[parseInt(d, 10)]);
  }
  return str;
};

interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (n: number | string, decimals?: number) => string;
  formatCurrency: (amountInBDT: number | string, overrideCurrency?: CurrencyCode) => string;
  formatDate: (dateStr: string) => string;
  formatTime: (timeStr: string) => string;
  formatDateTime: (dateTimeStr: string) => string;
  toDigits: (val: string | number) => string;
  supportedLanguages: { code: LanguageType; name: string }[];
  supportedCurrencies: CurrencyConfig[];
  currentCurrencyConfig: CurrencyConfig;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const saved = localStorage.getItem('fleetpro_language');
    if (saved === 'en' || saved === 'bn' || saved === 'ar' || saved === 'hi') {
      return saved as LanguageType;
    }
    return 'en';
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const savedCurr = localStorage.getItem('fleetpro_currency');
    const isValid = supportedCurrencies.some((c) => c.code === savedCurr);
    if (isValid && savedCurr) {
      return savedCurr as CurrencyCode;
    }
    const currentLang = (localStorage.getItem('fleetpro_language') as LanguageType) || 'en';
    return defaultCurrencyByLanguage[currentLang] || 'BDT';
  });

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    localStorage.setItem('fleetpro_currency', curr);
  };

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem('fleetpro_language', lang);
    
    // Automatically switch active currency and format numbers according to the selected language!
    const autoCurrency = defaultCurrencyByLanguage[lang] || 'BDT';
    setCurrency(autoCurrency);
  };

  const supportedLanguages = [
    { code: 'bn' as LanguageType, name: 'বাংলা (Bengali)' },
    { code: 'en' as LanguageType, name: 'English (US)' },
    { code: 'ar' as LanguageType, name: 'العربية (Arabic)' },
    { code: 'hi' as LanguageType, name: 'हिन्दी (Hindi)' },
  ];

  const currentCurrencyConfig = supportedCurrencies.find((c) => c.code === currency) || supportedCurrencies[0];

  const toDigits = (val: string | number): string => {
    return toLocalizedDigits(val, language);
  };

  const formatNumber = (n: number | string, decimals?: number): string => {
    if (n === undefined || n === null) return '';
    const num = typeof n === 'string' ? parseFloat(n.replace(/,/g, '')) : n;
    if (isNaN(num)) {
      return toDigits(n);
    }
    
    const formatted = typeof decimals === 'number'
      ? num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : num.toLocaleString('en-US');
    return toDigits(formatted);
  };

  const formatCurrency = (amountInBDT: number | string, overrideCurrency?: CurrencyCode): string => {
    if (amountInBDT === undefined || amountInBDT === null) return '';
    const num = typeof amountInBDT === 'string' ? parseFloat(amountInBDT.replace(/,/g, '')) : amountInBDT;
    if (isNaN(num)) return toDigits(amountInBDT);

    const activeCurrencyCode = overrideCurrency || currency;
    const config = supportedCurrencies.find((c) => c.code === activeCurrencyCode) || currentCurrencyConfig;
    
    // Convert from base BDT
    const convertedAmount = num * config.exchangeRateFromBDT;
    const formattedNum = formatNumber(convertedAmount, config.decimalPlaces);
    const sym = config.symbol[language] || config.symbol['en'] || config.code;

    if (config.position === 'prefix') {
      return `${sym}${formattedNum}`;
    }
    return `${formattedNum} ${sym}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return toDigits(dateStr);
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    return toDigits(timeStr);
  };

  const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    return toDigits(dateTimeStr);
  };

  // Translation resolver with dynamic parameter interpolation, digit localization and fallback
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!key) return '';

    // Prepare localized params where numbers become target script digits
    const localizedParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([paramName, paramVal]) => {
        if (typeof paramVal === 'number' || /^\d+$/.test(String(paramVal))) {
          localizedParams[paramName] = toDigits(paramVal);
        } else {
          // If the string itself is a translation key (like role or category), translate it first
          const stringVal = String(paramVal);
          const translatedString = (flatTranslations[language] && flatTranslations[language][stringVal]) 
            ? flatTranslations[language][stringVal] 
            : stringVal;
          localizedParams[paramName] = translatedString;
        }
      });
    }

    // Helper to replace params in a template
    const interpolate = (template: string): string => {
      let result = template;
      Object.entries(localizedParams).forEach(([pName, pVal]) => {
        result = result.replace(new RegExp(`\\{${pName}\\}`, 'g'), pVal);
      });
      return result;
    };

    // 1. Direct match in flatTranslations for active language
    if (flatTranslations[language] && key in flatTranslations[language]) {
      return interpolate(flatTranslations[language][key]);
    }

    // 2. Nested path check in translations
    const keys = key.split('.');
    const getNestedValue = (obj: any, pathKeys: string[]): any => {
      let current = obj;
      for (const k of pathKeys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return current;
    };

    let value = getNestedValue(translations[language], keys);
    if (typeof value === 'string') {
      return interpolate(value);
    }

    // 3. Fallback to English nested path or flatTranslations
    value = getNestedValue(translations['en'], keys);
    if (typeof value === 'string') {
      return interpolate(value);
    }

    if (flatTranslations['en'] && key in flatTranslations['en']) {
      return interpolate(flatTranslations['en'][key]);
    }

    // 4. Default return with interpolated params and localized digits if purely digits
    let result = key;
    if (params) {
      result = interpolate(result);
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      currency,
      setCurrency,
      t, 
      formatNumber, 
      formatCurrency, 
      formatDate, 
      formatTime, 
      formatDateTime,
      toDigits,
      supportedLanguages,
      supportedCurrencies,
      currentCurrencyConfig,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
