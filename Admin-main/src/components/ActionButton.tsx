import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  actionType?: 'login' | 'create' | 'update' | 'delete' | 'save' | 'verify' | 'custom';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  isLoading: propIsLoading,
  loadingText,
  actionType,
  children,
  disabled,
  className = '',
  onClick,
  ...props
}) => {
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const isLoading = propIsLoading || localIsLoading;

  let derivedLoadingText = loadingText || 'Processing...';

  if (!loadingText) {
    if (actionType === 'login') derivedLoadingText = 'Verify...';
    else if (actionType === 'create') derivedLoadingText = 'Processing...';
    else if (actionType === 'update') derivedLoadingText = 'Updating...';
    else if (actionType === 'delete') derivedLoadingText = 'Deleting...';
    else if (actionType === 'save') derivedLoadingText = 'Saving...';
    else if (actionType === 'verify') derivedLoadingText = 'Verifying...';
    else {
      // Try to infer from text
      const inferText = (child: React.ReactNode): string | null => {
        if (typeof child === 'string') return child.toLowerCase();
        if (Array.isArray(child)) {
          for (const c of child) {
            const t = inferText(c);
            if (t) return t;
          }
        }
        return null;
      };

      const text = inferText(children);
      if (text) {
        if (text.includes('login') || text.includes('sign in')) derivedLoadingText = 'Verify...';
        else if (text.includes('create') || text.includes('add')) derivedLoadingText = 'Processing...';
        else if (text.includes('update') || text.includes('edit')) derivedLoadingText = 'Updating...';
        else if (text.includes('delete') || text.includes('remove')) derivedLoadingText = 'Deleting...';
        else if (text.includes('save')) derivedLoadingText = 'Saving...';
        else if (text.includes('verify')) derivedLoadingText = 'Verify...';
      }
    }
  }

  const handlePress = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      const result = onClick(e);
      if (result instanceof Promise) {
        try {
          setLocalIsLoading(true);
          await result;
        } finally {
          setLocalIsLoading(false);
        }
      }
    }
  };

  const isDisabled = isLoading || disabled;
  
  // ensure it's a flex container for the spinner + text
  const flexClasses = className.includes('flex') ? '' : 'flex items-center justify-center gap-2';
  
  return (
    <button
      disabled={isDisabled}
      className={`${className} ${flexClasses}`.trim()}
      onClick={handlePress}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{derivedLoadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
