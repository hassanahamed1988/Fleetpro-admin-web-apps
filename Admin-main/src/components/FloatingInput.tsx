/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, Search, X } from 'lucide-react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  themeColor?: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  rightElement?: React.ReactNode;
  icon?: React.ReactNode;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  themeColor = 'blue',
  rightElement,
  icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  React.useEffect(() => {
    let timeoutId: any;
    if (isFocused) {
      // 250ms delay gives the floating label plenty of time to animate up
      // and sit safely on the border before the placeholder fades in.
      timeoutId = setTimeout(() => {
        setShowPlaceholder(true);
      }, 250);
    } else {
      setShowPlaceholder(false);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isFocused]);

  let language = 'en';
  try {
    const langContext = useLanguage();
    if (langContext && langContext.language) {
      language = langContext.language;
    }
  } catch (e) {
    // Fail-safe fallback if not in Context
  }

  const themeFocusBorder = {
    blue: 'focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500',
    emerald: 'focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500',
    red: 'focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500',
    amber: 'focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500',
    purple: 'focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500',
  };

  const themeText = {
    blue: 'text-indigo-600 dark:text-indigo-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const hasValue = value !== undefined && value !== null && value.toString() !== '';
  const isFloating = isFocused || hasValue;
  const hasIcon = !!icon;

  // Dynamic placeholder logic based on language
  let dynamicPlaceholder = '';
  if (isFocused && showPlaceholder && !hasValue) {
    if (language === 'bn') {
      dynamicPlaceholder = `${label} লিখুন`;
    } else if (language === 'ar') {
      dynamicPlaceholder = `أدخل ${label}`;
    } else if (language === 'hi') {
      dynamicPlaceholder = `${label} दर्ज करें`;
    } else {
      dynamicPlaceholder = `Enter ${label}`;
    }
  }

  // Animation states
  const contentLeft = (hasIcon && !isFocused) ? '42px' : '14px';
  const paddingRight = rightElement ? '44px' : '14px';

  const isDisabled = props.disabled;

  return (
    <div
      className={`relative w-full h-[52px] rounded-[8px] border bg-white dark:bg-zinc-900 flex items-center transition-all ${
        isDisabled
          ? 'border-zinc-200 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-950/20 opacity-60 cursor-not-allowed'
          : `border-zinc-300 dark:border-zinc-800 ${isFocused ? 'shadow-sm' : ''} ${themeFocusBorder[themeColor]}`
      }`}
    >
      {/* Animated Icon Container */}
      {hasIcon && (
        <div 
          className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 ${
            isFocused 
              ? 'opacity-0 scale-75 transition-none' 
              : 'opacity-100 scale-100 transition-all duration-500 ease-out'
          } ${
            hasValue 
              ? `${themeText[themeColor]} scale-110` 
              : 'text-zinc-400 dark:text-zinc-500 scale-100'
          }`}
          style={{ left: '14px' }}
        >
          {icon}
        </div>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={(e) => {
          if (isDisabled) return;
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        placeholder={dynamicPlaceholder}
        className={`w-full h-full text-sm text-zinc-900 dark:text-zinc-50 bg-transparent outline-none border-none text-left transition-all duration-300 ease-out placeholder-zinc-400 dark:placeholder-zinc-500 ${
          isDisabled ? 'cursor-not-allowed' : ''
        }`}
        style={{
          paddingLeft: contentLeft,
          paddingRight: paddingRight,
        }}
        disabled={isDisabled}
        {...props}
      />
      
      {/* Floating Label (Floats UP onto the border line with buttery smooth transitions) */}
      <span
        className={`absolute transition-all duration-300 pointer-events-none select-none z-10 ${
          isFloating
            ? `top-0 -translate-y-1/2 text-[11px] font-bold bg-white dark:bg-zinc-900 px-1.5 ${
                isFocused ? themeText[themeColor] : 'text-zinc-600 dark:text-zinc-300'
              }`
            : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400 bg-transparent px-0'
        }`}
        style={{
          left: isFloating ? '12px' : contentLeft,
        }}
      >
        {label}
      </span>

      {/* Right side element e.g. password eye icon */}
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-20">
          {rightElement}
        </div>
      )}
    </div>
  );
};

interface FloatingSelectProps {
  label: string;
  value?: any;
  onChange?: (value: any) => void;
  themeColor?: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
  icon?: React.ReactNode;
  category?: string;
  fallbackOptions?: string[];
  children?: React.ReactNode;
  disabled?: boolean;
  name?: string;
}

export const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  value,
  onChange,
  themeColor = 'blue',
  icon,
  category,
  fallbackOptions = [],
  children,
  disabled = false,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  let language = 'en';
  try {
    const langContext = useLanguage();
    if (langContext && langContext.language) {
      language = langContext.language;
    }
  } catch (e) {
    // Fallback
  }

  // Local Translation Helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'Select an option from the list below': {
        bn: 'নিচের তালিকা থেকে একটি অপশন নির্বাচন করুন',
        en: 'Select an option from the list below'
      }
    };
    return translations[key]?.[language] || key;
  };

  // Parse options from either fallbackOptions or children
  const parsedOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    if (fallbackOptions && fallbackOptions.length > 0) {
      fallbackOptions.forEach(opt => {
        opts.push({ value: opt, label: opt });
      });
    } else if (children) {
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === 'option') {
            const val = child.props.value !== undefined ? child.props.value : child.props.children;
            const text = child.props.children || val;
            if (val !== '') {
              opts.push({ value: String(val), label: String(text) });
            }
          } else if (child.props && child.props.children) {
            React.Children.forEach(child.props.children, (nestedChild) => {
              if (React.isValidElement(nestedChild) && nestedChild.type === 'option') {
                const val = nestedChild.props.value !== undefined ? nestedChild.props.value : nestedChild.props.children;
                const text = nestedChild.props.children || val;
                if (val !== '') {
                  opts.push({ value: String(val), label: String(text) });
                }
              }
            });
          }
        }
      });
    }
    return opts;
  }, [fallbackOptions, children]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return parsedOptions;
    const lower = searchQuery.toLowerCase();
    return parsedOptions.filter(opt => 
      opt.label.toLowerCase().includes(lower) || 
      opt.value.toLowerCase().includes(lower)
    );
  }, [parsedOptions, searchQuery]);

  // Handle focusing search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (onChange) {
      const fnStr = onChange.toString();
      const isEventBased = fnStr.includes('.target') || fnStr.includes('event') || fnStr.includes('(e)') || fnStr.includes('currentView');
      if (isEventBased) {
        const mockEvent = {
          target: { value: optionValue, name: name || '' },
          currentTarget: { value: optionValue, name: name || '' }
        };
        onChange(mockEvent as any);
      } else {
        onChange(optionValue);
      }
    }
    setIsOpen(false);
  };

  const themeFocusBorder = {
    blue: 'border-indigo-500 ring-1 ring-indigo-500',
    emerald: 'border-emerald-500 ring-1 ring-emerald-500',
    red: 'border-rose-500 ring-1 ring-rose-500',
    amber: 'border-amber-500 ring-1 ring-amber-500',
    purple: 'border-purple-500 ring-1 ring-purple-500',
  };

  const themeText = {
    blue: 'text-indigo-600 dark:text-indigo-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-rose-600 dark:text-rose-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const themeBgActive = {
    blue: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    red: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
  };

  const hasValue = value !== undefined && value !== null && value.toString() !== '';
  const isFloating = isOpen || hasValue;
  const hasIcon = !!icon;

  const contentLeft = (hasIcon && !isOpen) ? '42px' : '14px';

  // Display label for selected value
  const selectedLabel = useMemo(() => {
    const found = parsedOptions.find(o => o.value === value);
    return found ? found.label : value || '';
  }, [parsedOptions, value]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(true)}
        className={`relative w-full h-[52px] rounded-[8px] border bg-white dark:bg-zinc-900 flex items-center justify-between text-left transition-all outline-none ${
          disabled
            ? 'border-zinc-200 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-950/20 opacity-60 cursor-not-allowed'
            : `border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 ${isOpen ? themeFocusBorder[themeColor] : ''}`
        }`}
      >
        {/* Animated Icon Container */}
        {hasIcon && (
          <div 
            className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 ${
              isOpen 
                ? 'opacity-0 scale-75 transition-none' 
                : 'opacity-100 scale-100 transition-all duration-500 ease-out'
            } ${
              hasValue 
                ? `${themeText[themeColor]} scale-110` 
                : 'text-zinc-400 dark:text-zinc-500 scale-100'
            }`}
            style={{ left: '14px' }}
          >
            {icon}
          </div>
        )}

        {/* Selected Value Text */}
        <span 
          className={`block truncate text-sm text-zinc-900 dark:text-zinc-50 font-medium transition-all duration-300 ease-out ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          style={{
            paddingLeft: contentLeft,
            paddingRight: '36px',
          }}
        >
          {selectedLabel}
        </span>

        {/* Floating Label */}
        <span
          className={`absolute transition-all duration-300 pointer-events-none select-none z-10 ${
            isFloating
              ? `top-0 -translate-y-1/2 text-[11px] font-bold bg-white dark:bg-zinc-900 px-1.5 ${
                  isOpen ? themeText[themeColor] : 'text-zinc-600 dark:text-zinc-300'
                }`
              : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400 bg-transparent px-0'
          }`}
          style={{
            left: isFloating ? '12px' : contentLeft,
          }}
        >
          {label}
        </span>

        {/* Chevron down icon */}
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Bottom-Sheet Popup Menu (Screen's Bottom Edge Aligned) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-zinc-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          />

          {/* Bottom-Sheet Sheet Container */}
          <div 
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up z-10"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 16px)'
            }}
          >
            {/* Header Handle Indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Bottom-Sheet Header */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">{label}</h3>
                <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{t('Select an option from the list below')}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar Container */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="relative flex items-center w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all px-3">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'খুঁজুন...' : language === 'ar' ? 'بحث...' : 'Search options...'}
                  className="w-full h-full text-sm text-zinc-900 dark:text-zinc-50 bg-transparent outline-none border-none pl-2.5 placeholder-zinc-400 dark:placeholder-zinc-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List Scroll Container */}
            <div className="flex-1 overflow-y-auto px-4 py-2 max-h-[45vh]">
              {filteredOptions.length > 0 ? (
                <div className="space-y-1">
                  {filteredOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-between text-left transition-all ${
                          isSelected 
                            ? themeBgActive[themeColor] 
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <span className={`w-2 h-2 rounded-full ${themeColor === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400 italic">
                  {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No options found'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

