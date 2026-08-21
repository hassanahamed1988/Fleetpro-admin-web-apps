/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

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
  const iconLeft = isFocused ? '-20px' : '14px';
  const contentLeft = isFocused ? '14px' : (hasIcon ? '44px' : '14px');
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
      {/* Animated Icon */}
      {hasIcon && (
        <div 
          className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10 ${
            isFocused ? 'opacity-0' : 'opacity-100'
          } ${
            isFocused ? themeText[themeColor] : 'text-zinc-500 dark:text-zinc-400'
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
        className={`w-full h-full text-sm text-zinc-900 dark:text-zinc-50 bg-transparent outline-none border-none text-left transition-all duration-300 ease-in-out placeholder-zinc-400 dark:placeholder-zinc-500 ${
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
        className={`absolute transition-all duration-300 pointer-events-none select-none z-10 px-1.5 ${
          isFloating
            ? `top-0 -translate-y-1/2 text-[11px] font-bold bg-white dark:bg-zinc-900 ${
                isFocused ? themeText[themeColor] : 'text-zinc-600 dark:text-zinc-300'
              }`
            : 'top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400 bg-transparent'
        }`}
        style={{
          left: isFloating ? '12px' : (hasIcon ? '44px' : '14px'),
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
