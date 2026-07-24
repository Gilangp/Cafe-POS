'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';

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
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

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

  if (!open || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onOpenChange) {
      onOpenChange(false);
    }
  };

  const variantContainerClasses: Record<NonNullable<DialogProps['variant']>, string> = {
    standard:
      'flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl bg-white dark:bg-[#1E2B24] p-6 shadow-2xl border border-[#E4D9C4] dark:border-[#33413A] animate-in fade-in zoom-in-95 duration-200',
    confirmation:
      'flex flex-col w-full max-w-md max-h-[90vh] rounded-2xl bg-white dark:bg-[#1E2B24] p-6 shadow-2xl border border-[#E4D9C4] dark:border-[#33413A] animate-in fade-in zoom-in-95 duration-200 text-center',
    fullscreen:
      'flex flex-col w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl bg-white dark:bg-[#1E2B24] p-6 sm:p-8 shadow-2xl border-0 sm:border border-[#E4D9C4] dark:border-[#33413A] animate-in fade-in zoom-in-95 duration-200',
  };

  const dialogContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn(variantContainerClasses[variant], className)} onClick={(e) => e.stopPropagation()}>
        <div className={cn('flex items-start justify-between gap-4 pb-4 shrink-0', variant === 'confirmation' && 'justify-center flex-col items-center')}>
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
              className="rounded-xl p-1.5 text-[#5C5348] dark:text-[#B8A99A] hover:bg-[#1E3D31]/10 dark:hover:bg-white/10 hover:text-[#1E3D31] dark:hover:text-[#F5EFE6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3D31] shrink-0"
              aria-label="Tutup dialog"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className={cn('py-2 flex-1 overflow-y-auto min-h-0', variant === 'fullscreen' && 'max-h-none')}>
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

  return typeof document !== 'undefined' ? createPortal(dialogContent, document.body) : null;
}

// Alias Modal to Dialog for semantic usage across different modules
export const Modal = Dialog;
export type ModalProps = DialogProps;
