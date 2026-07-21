import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
      default:
        'rounded-2xl border border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] text-[#1E3D31] dark:text-[#F5EFE6] shadow-sm',
      elevated:
        'rounded-2xl border border-[#E4D9C4]/60 dark:border-[#33413A] bg-white dark:bg-[#1E2B24] text-[#1E3D31] dark:text-[#F5EFE6] shadow-md dark:shadow-xl',
      interactive:
        'rounded-2xl border border-[#E4D9C4] dark:border-[#33413A] bg-white dark:bg-[#1E2B24] text-[#1E3D31] dark:text-[#F5EFE6] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-[#C89B5C]/60 cursor-pointer',
    };

    return <div ref={ref} className={cn(variantStyles[variant], className)} {...props} />;
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-heading text-xl font-bold leading-none tracking-tight text-[#1E3D31] dark:text-[#F5EFE6]', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-[#5C5348] dark:text-[#B8A99A] leading-relaxed', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
