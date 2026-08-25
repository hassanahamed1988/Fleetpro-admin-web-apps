import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface AnimatedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  themeColor?: 'blue' | 'emerald' | 'red' | 'amber' | 'purple';
}

export const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({
  value,
  onChange,
  placeholder,
  themeColor = 'blue',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const themeFocusBorder = {
    blue: 'focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500',
    emerald: 'focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500',
    red: 'focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500',
    amber: 'focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500',
    purple: 'focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500',
  };

  return (
    <div className={`relative w-full md:flex-1 h-11 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-[8px] flex items-center transition-colors overflow-hidden ${themeFocusBorder[themeColor]}`}>
      <Search 
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none ${
          isFocused ? 'opacity-0' : 'opacity-100'
        }`} 
        style={{ left: '14px' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full h-full bg-transparent outline-none text-xs text-zinc-800 dark:text-zinc-200 text-left transition-all duration-500 ease-in-out"
        style={{ 
          paddingLeft: isFocused ? '14px' : '40px', 
          paddingRight: '14px' 
        }}
      />
    </div>
  );
};
