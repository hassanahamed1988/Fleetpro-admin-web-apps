/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, Trash2, Settings, Shield, AlertTriangle } from 'lucide-react';

interface IOSModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  cancelText?: string;
  actionLabel?: string;
  confirmText?: string;
  isDestructive?: boolean;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm: () => void;
}

export const IOSModal: React.FC<IOSModalProps> = ({
  isOpen,
  title,
  message,
  cancelLabel,
  cancelText,
  actionLabel,
  confirmText,
  isDestructive = true,
  onCancel,
  onClose,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const effectiveCancel = cancelLabel || cancelText || t('Cancel');
  const effectiveAction = actionLabel || confirmText || (isDestructive ? t('Confirm') : t('OK'));
  const handleCancel = onCancel || onClose || (() => {});

  const getCategoryIconAndColor = () => {
    const tLower = (title || '').toLowerCase();
    
    // Check for Sign Out/Logout
    if (tLower.includes('sign out') || tLower.includes('logout') || tLower.includes('লগ আউট') || tLower.includes('লগআউট')) {
      return {
        icon: <LogOut className="w-6 h-6 text-rose-500 dark:text-rose-400" />,
        bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
        borderColor: 'border-rose-500/20'
      };
    }
    
    // Check for Delete/Remove/Decommission
    if (tLower.includes('delete') || tLower.includes('decommission') || tLower.includes('remove') || tLower.includes('মুছে') || tLower.includes('ডিলিট') || tLower.includes('বাতিল')) {
      return {
        icon: <Trash2 className="w-6 h-6 text-rose-500 dark:text-rose-400" />,
        bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
        borderColor: 'border-rose-500/20'
      };
    }

    // Check for Settings
    if (tLower.includes('settings') || tLower.includes('সেটিংস') || tLower.includes('update') || tLower.includes('আপডেট')) {
      return {
        icon: <Settings className="w-6 h-6 text-sky-500 dark:text-sky-400" />,
        bgColor: 'bg-sky-500/10 dark:bg-sky-500/20',
        borderColor: 'border-sky-500/20'
      };
    }

    // Check for Permissions/Shield/Matrix
    if (tLower.includes('permission') || tLower.includes('role') || tLower.includes('রোল') || tLower.includes('অনুমতি') || tLower.includes('ম্যাট্রিক্স')) {
      return {
        icon: <Shield className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
        bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        borderColor: 'border-emerald-500/20'
      };
    }

    // Fallback/Warning/Confirm
    return {
      icon: <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/20'
    };
  };

  const { icon, bgColor, borderColor } = getCategoryIconAndColor();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* iOS Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs"
          />

          {/* iOS Dialog Container */}
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[270px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-[14px] shadow-2xl flex flex-col text-center overflow-hidden border border-zinc-200/20"
          >
            {/* Text Content with Category Icon */}
            <div className="p-5 flex flex-col items-center">
              {/* Category Icon */}
              <div className={`p-3 rounded-full mb-3 border ${bgColor} ${borderColor} flex items-center justify-center`}>
                {icon}
              </div>

              <h3 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {title}
              </h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-2 leading-snug">
                {message}
              </p>
            </div>

            {/* iOS Separator Line */}
            <div className="h-[0.5px] bg-zinc-200 dark:bg-zinc-800" />

            {/* Action Buttons (Row layout for exactly 2 buttons) */}
            <div className="flex h-11">
              <button
                onClick={handleCancel}
                className="flex-1 text-[16px] text-sky-500 active:bg-zinc-100 dark:active:bg-zinc-800/80 transition-colors font-normal flex items-center justify-center"
              >
                {effectiveCancel}
              </button>

              {/* Vertical divider */}
              <div className="w-[0.5px] bg-zinc-200 dark:bg-zinc-800" />

              <button
                onClick={onConfirm}
                className={`flex-1 text-[16px] active:bg-zinc-100 dark:active:bg-zinc-800/80 transition-colors font-semibold flex items-center justify-center ${
                  isDestructive ? 'text-rose-500' : 'text-sky-500'
                }`}
              >
                {effectiveAction}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
