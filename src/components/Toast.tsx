/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <AnimatePresence>
      {toasts.length > 0 && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/20 dark:bg-black/40 backdrop-blur-[2px] z-[90] pointer-events-auto"
          />
          
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
            <div className="flex flex-col gap-3 items-center w-full">
              <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                  <ToastCard key={toast.id} toast={toast} removeToast={removeToast} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

interface ToastCardProps {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, removeToast }) => {
  const [status, setStatus] = useState<'loading' | 'success'>('loading');

  useEffect(() => {
    // Initial loading phase
    const loadTimer = setTimeout(() => {
      setStatus('success');
    }, 1200);

    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (status === 'success') {
      // Stay visible for a bit after success, then dismiss
      const dismissTimer = setTimeout(() => {
        removeToast(toast.id);
      }, 1500);
      return () => clearTimeout(dismissTimer);
    }
  }, [status, removeToast, toast.id]);

  const getStatusIcon = () => {
    const isSuccess = status === 'success';

    return (
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="w-16 h-16" viewBox="0 0 50 50">
          {/* THE SINGLE GREEN CIRCLE - A bit bigger (r=21), No size changes, no background ripple */}
          <motion.circle
            cx="25"
            cy="25"
            r="21"
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="stroke-emerald-500"
            style={{ originX: 0.5, originY: 0.5 }}
            animate={isSuccess ? {
              rotate: 360,
              pathLength: 1
            } : {
              rotate: [0, 360],
              pathLength: 0.75
            }}
            transition={isSuccess ? {
              pathLength: { duration: 0.4, ease: "easeInOut" },
              rotate: { duration: 0.4, ease: "easeOut" }
            } : {
              rotate: {
                repeat: Infinity,
                duration: 1.0,
                ease: "linear"
              },
              pathLength: {
                duration: 0.3
              }
            }}
          />

          {/* THE SINGLE CHECKMARK - Starts drawing only AFTER the circle completes itself (delay: 0.4s) */}
          {isSuccess && (
            <motion.path
              d="M16 25 L22 31 L34 19"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-emerald-500"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
                delay: 0.4 // Exact delay to wait until ring completion is 100% complete
              }}
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ 
        type: 'spring', 
        stiffness: 320, 
        damping: 26 
      }}
      className="pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-zinc-200/50 dark:border-zinc-800/80 rounded-[32px] px-10 py-8 flex flex-col items-center gap-5 min-w-[320px] max-w-sm text-center"
    >
      {getStatusIcon()}

      <div className="flex flex-col items-center gap-1.5">
        <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-[260px]">
            {toast.message}
          </p>
        )}
      </div>
    </motion.div>
  );
};
