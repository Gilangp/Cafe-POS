import * as React from 'react';
import { cn } from '@/shared/utils/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[90px] w-full rounded-xl border border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] px-4 py-3 text-sm text-[#1E3D31] dark:text-[#F5EFE6] placeholder:text-[#5C5348]/60 dark:placeholder:text-[#B8A99A]/60 focus:outline-none focus:ring-2 focus:ring-[#1E3D31] dark:focus:ring-[#C89B5C] focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F1E9DA]/50 dark:disabled:bg-[#26332C]/50 resize-y',
            error && 'border-[#B23A34] focus:ring-[#B23A34] dark:border-[#D96A63] dark:focus:ring-[#D96A63]',
            className
          )}
          ref={ref}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          {...props}
        />
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
Textarea.displayName = 'Textarea';

export { Textarea };
