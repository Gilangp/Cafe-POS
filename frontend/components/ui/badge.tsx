import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'danger'
    | 'active'
    | 'inactive'
    | 'available'
    | 'out_of_stock'
    | 'pending'
    | 'confirmed'
    | 'rejected'
    | 'bestseller'
    | 'gold';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-[#1E3D31] text-white hover:bg-[#163026]',
    secondary: 'bg-[#6F4E37] text-white hover:bg-[#5a3f2c]',
    outline: 'border border-[#E4D9C4] dark:border-[#33413A] text-[#1E3D31] dark:text-[#F5EFE6]',
    success: 'bg-[#4C7A4C]/15 text-[#4C7A4C] dark:bg-[#6FA96F]/20 dark:text-[#6FA96F] border border-[#4C7A4C]/30',
    warning: 'bg-[#C79A3C]/15 text-[#C79A3C] dark:bg-[#E0B75C]/20 dark:text-[#E0B75C] border border-[#C79A3C]/30',
    destructive: 'bg-[#B23A34]/15 text-[#B23A34] dark:bg-[#D96A63]/20 dark:text-[#D96A63] border border-[#B23A34]/30',
    danger: 'bg-[#B23A34]/15 text-[#B23A34] dark:bg-[#D96A63]/20 dark:text-[#D96A63] border border-[#B23A34]/30',
    active: 'bg-[#4C7A4C]/15 text-[#4C7A4C] dark:bg-[#6FA96F]/20 dark:text-[#6FA96F] border border-[#4C7A4C]/30',
    inactive: 'bg-[#5C5348]/15 text-[#5C5348] dark:bg-[#B8A99A]/20 dark:text-[#B8A99A] border border-[#5C5348]/30',
    available: 'bg-[#4C7A4C]/15 text-[#4C7A4C] dark:bg-[#6FA96F]/20 dark:text-[#6FA96F] border border-[#4C7A4C]/30',
    out_of_stock: 'bg-[#B23A34]/15 text-[#B23A34] dark:bg-[#D96A63]/20 dark:text-[#D96A63] border border-[#B23A34]/30',
    pending: 'bg-[#C79A3C]/15 text-[#C79A3C] dark:bg-[#E0B75C]/20 dark:text-[#E0B75C] border border-[#C79A3C]/30',
    confirmed: 'bg-[#4C7A4C]/15 text-[#4C7A4C] dark:bg-[#6FA96F]/20 dark:text-[#6FA96F] border border-[#4C7A4C]/30',
    rejected: 'bg-[#B23A34]/15 text-[#B23A34] dark:bg-[#D96A63]/20 dark:text-[#D96A63] border border-[#B23A34]/30',
    bestseller: 'bg-[#C89B5C] text-[#1E3D31] font-bold tracking-wider shadow-sm',
    gold: 'bg-[#C89B5C] text-[#1E3D31] font-bold tracking-wider shadow-sm',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3D31] focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
