import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D31] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

    const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-[#1E3D31] text-white hover:bg-[#163026] shadow-sm',
      primary: 'bg-[#1E3D31] text-white hover:bg-[#163026] shadow-sm',
      secondary: 'bg-[#6F4E37] text-white hover:bg-[#5a3f2c] shadow-sm',
      gold: 'bg-[#C89B5C] text-[#1E3D31] font-semibold hover:bg-[#b88c4d] shadow-sm',
      outline:
        'border border-[#1E3D31]/30 bg-transparent text-[#1E3D31] dark:text-[#F5EFE6] dark:border-white/20 hover:bg-[#1E3D31]/10 hover:border-[#1E3D31]',
      ghost: 'bg-transparent text-[#1E3D31] dark:text-[#F5EFE6] hover:bg-[#1E3D31]/10 dark:hover:bg-white/10',
      destructive: 'bg-[#B23A34] text-white hover:bg-[#96302b] shadow-sm',
      link: 'bg-transparent text-[#1E3D31] dark:text-[#C89B5C] underline-offset-4 hover:underline',
    };

    const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
      default: 'h-11 px-6 py-2 text-sm',
      sm: 'h-9 rounded-lg px-4 text-xs',
      lg: 'h-13 rounded-2xl px-8 text-base font-semibold',
      icon: 'h-10 w-10 p-0 rounded-xl',
    };

    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
