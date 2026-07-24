'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import type { ToastItem, ToastVariant } from './use-toast';

export interface ToastProps extends ToastItem {
  onDismiss?: (id: string) => void;
}

const variantStyles: Record<ToastVariant, { bg: string; icon: React.ReactNode }> = {
  default: {
    bg: 'border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] text-[#1E3D31] dark:text-[#F5EFE6]',
    icon: <Info className="h-5 w-5 text-[#1E3D31] dark:text-[#C89B5C]" />,
  },
  success: {
    bg: 'border-[#4C7A4C]/40 bg-[#4C7A4C]/10 dark:bg-[#6FA96F]/15 text-[#1E3D31] dark:text-[#F5EFE6]',
    icon: <CheckCircle className="h-5 w-5 text-[#4C7A4C] dark:text-[#6FA96F]" />,
  },
  error: {
    bg: 'border-[#B23A34]/40 bg-[#B23A34]/10 dark:bg-[#D96A63]/15 text-[#1E3D31] dark:text-[#F5EFE6]',
    icon: <AlertCircle className="h-5 w-5 text-[#B23A34] dark:text-[#D96A63]" />,
  },
  warning: {
    bg: 'border-[#C79A3C]/40 bg-[#C79A3C]/10 dark:bg-[#E0B75C]/15 text-[#1E3D31] dark:text-[#F5EFE6]',
    icon: <AlertTriangle className="h-5 w-5 text-[#C79A3C] dark:text-[#E0B75C]" />,
  },
  info: {
    bg: 'border-[#1E3D31]/30 bg-[#1E3D31]/10 dark:bg-white/10 text-[#1E3D31] dark:text-[#F5EFE6]',
    icon: <Info className="h-5 w-5 text-[#1E3D31] dark:text-[#C89B5C]" />,
  },
};

export function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  const { bg, icon } = variantStyles[variant];

  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-start gap-3 rounded-2xl border p-4 shadow-lg transition-all animate-in slide-in-from-right-full duration-300',
        bg
      )}
      role="alert"
    >
      <div className="shrink-0 pt-0.5">{icon}</div>
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-heading text-sm font-bold">{title}</h4>}
        {description && <p className="text-xs text-[#5C5348] dark:text-[#B8A99A] leading-relaxed">{description}</p>}
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(id)}
          className="rounded-lg p-1 text-[#5C5348] dark:text-[#B8A99A] opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
