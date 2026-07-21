import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  error?: boolean | string;
  helperText?: string;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, helperText, placeholder, children, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            className={cn(
              'flex h-11 w-full appearance-none rounded-xl border border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] px-4 py-2 pr-10 text-sm text-[#1E3D31] dark:text-[#F5EFE6] focus:outline-none focus:ring-2 focus:ring-[#1E3D31] dark:focus:ring-[#C89B5C] focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F1E9DA]/50 dark:disabled:bg-[#26332C]/50',
              error && 'border-[#B23A34] focus:ring-[#B23A34] dark:border-[#D96A63] dark:focus:ring-[#D96A63]',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((option) => (
                  <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5C5348] dark:text-[#B8A99A]">
            <ChevronDown size={18} />
          </div>
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
Select.displayName = 'Select';

export { Select };
