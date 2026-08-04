import * as React from 'react';
import { cn } from '@/shared/utils/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

    const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
      primary: 'bg-accent text-primary font-bold hover:bg-accent/90 shadow-md',
      secondary: 'bg-primary text-accent hover:bg-primary/90 shadow-sm',
      gold: 'bg-accent text-primary font-bold hover:bg-accent/90 shadow-md',
      outline:
        'border border-input bg-transparent text-foreground hover:bg-accent/10 hover:text-accent-foreground',
      ghost: 'bg-transparent text-foreground hover:bg-accent/10',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
      link: 'bg-transparent text-primary underline-offset-4 hover:underline',
    };

    const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-9 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-xl px-8 text-base font-semibold',
      icon: 'h-10 w-10 p-0 rounded-lg',
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
