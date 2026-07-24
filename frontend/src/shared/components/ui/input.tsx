import * as React from 'react';
import { cn } from '@/shared/utils/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, helperText, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#5C5348] dark:text-[#B8A99A]">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl border border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] px-4 py-2 text-sm text-[#1E3D31] dark:text-[#F5EFE6] placeholder:text-[#5C5348]/60 dark:placeholder:text-[#B8A99A]/60 focus:outline-none focus:ring-2 focus:ring-[#1E3D31] dark:focus:ring-[#C89B5C] focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F1E9DA]/50 dark:disabled:bg-[#26332C]/50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[#B23A34] focus:ring-[#B23A34] dark:border-[#D96A63] dark:focus:ring-[#D96A63]',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#5C5348] dark:text-[#B8A99A]">
              {rightIcon}
            </div>
          )}
        </div>
        {(typeof error === 'string' || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-xs font-medium',
              error ? 'text-[#B23A34] dark:text-[#D96A63]' : 'text-[#5C5348] dark:text-[#B8A99A]'
            )}
          >
            {typeof error === 'string' ? error : helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
