'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'standard' | 'confirmation' | 'fullscreen';
  className?: string;
  showCloseButton?: boolean;
}

export function Dialog({
  open = false,
  onOpenChange,
  title,
  description,
  children,
  footer,
  variant = 'standard',
  className,
  showCloseButton = true,
}: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && onOpenChange) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onOpenChange) {
      onOpenChange(false);
    }
  };

  const variantContainerClasses: Record<NonNullable<DialogProps['variant']>, string> = {
    standard:
      'w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E2B24] p-6 shadow-2xl border border-[#E4D9C4] dark:border-[#33413A] animate-in fade-in zoom-in-95 duration-200',
    confirmation:
      'w-full max-w-md rounded-2xl bg-white dark:bg-[#1E2B24] p-6 shadow-2xl border border-[#E4D9C4] dark:border-[#33413A] animate-in fade-in zoom-in-95 duration-200 text-center',
    fullscreen:
      'w-full h-full sm:h-auto sm:max-w-3xl sm:rounded-2xl bg-white dark:bg-[#1E2B24] p-6 sm:p-8 shadow-2xl border-0 sm:border border-[#E4D9C4] dark:border-[#33413A] animate-in fade-in zoom-in-95 duration-200 flex flex-col',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn(variantContainerClasses[variant], className)} onClick={(e) => e.stopPropagation()}>
        <div className={cn('flex items-start justify-between gap-4 pb-4', variant === 'confirmation' && 'justify-center flex-col items-center')}>
          <div className={cn(variant === 'confirmation' && 'text-center w-full')}>
            {title && (
              <h2 className="font-heading text-xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[#5C5348] dark:text-[#B8A99A]">{description}</p>
            )}
          </div>
          {showCloseButton && onOpenChange && (
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-xl p-1.5 text-[#5C5348] dark:text-[#B8A99A] hover:bg-[#1E3D31]/10 dark:hover:bg-white/10 hover:text-[#1E3D31] dark:hover:text-[#F5EFE6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3D31]"
              aria-label="Tutup dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className={cn('py-2 flex-1 overflow-y-auto max-h-[80vh]', variant === 'fullscreen' && 'max-h-none')}>
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              'mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E4D9C4]/60 dark:border-[#33413A]',
              variant === 'confirmation' && 'justify-center'
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Alias Modal to Dialog for semantic usage across different modules
export const Modal = Dialog;
export type ModalProps = DialogProps;
