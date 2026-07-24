'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: 'bottom' | 'left' | 'right';
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({
  open = false,
  onOpenChange,
  position = 'bottom',
  title,
  description,
  children,
  footer,
  className,
}: DrawerProps) {
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

  const positionContainerClasses: Record<NonNullable<DrawerProps['position']>, string> = {
    bottom:
      'fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-white dark:bg-[#1E2B24] border-t border-[#E4D9C4] dark:border-[#33413A] shadow-2xl animate-in slide-in-from-bottom duration-300',
    left:
      'fixed inset-y-0 left-0 z-50 flex h-full w-4/5 max-w-sm flex-col bg-white dark:bg-[#1E2B24] border-r border-[#E4D9C4] dark:border-[#33413A] shadow-2xl animate-in slide-in-from-left duration-300',
    right:
      'fixed inset-y-0 right-0 z-50 flex h-full w-4/5 max-w-sm flex-col bg-white dark:bg-[#1E2B24] border-l border-[#E4D9C4] dark:border-[#33413A] shadow-2xl animate-in slide-in-from-right duration-300',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => onOpenChange && onOpenChange(false)}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn(positionContainerClasses[position], className)} onClick={(e) => e.stopPropagation()}>
        {position === 'bottom' && (
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#E4D9C4] dark:bg-[#33413A]" />
        )}

        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E4D9C4]/60 dark:border-[#33413A]">
          <div>
            {title && <h3 className="font-heading text-lg font-bold text-[#1E3D31] dark:text-[#F5EFE6]">{title}</h3>}
            {description && <p className="text-xs text-[#5C5348] dark:text-[#B8A99A] mt-0.5">{description}</p>}
          </div>
          {onOpenChange && (
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-xl p-1.5 text-[#5C5348] dark:text-[#B8A99A] hover:bg-[#1E3D31]/10 dark:hover:bg-white/10 hover:text-[#1E3D31] dark:hover:text-[#F5EFE6] transition-colors focus:outline-none"
              aria-label="Tutup drawer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="border-t border-[#E4D9C4]/60 dark:border-[#33413A] p-4 px-6 bg-[#FAF3E7]/50 dark:bg-[#14201A]/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
