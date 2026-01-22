'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 font-medium text-sm rounded-lg transition-all duration-200 ease-out cursor-pointer border-none outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-br from-primary to-primary-dark text-white hover:from-primary-light hover:to-primary hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)]',
                secondary: 'bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-overlay hover:border-primary-light hover:shadow-[0_4px_15px_rgba(139,92,246,0.2)]',
                ghost: 'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                danger: 'bg-gradient-to-br from-error to-red-700 text-white hover:from-red-400 hover:to-error hover:shadow-[0_4px_20px_rgba(251,113,133,0.4)]',
                success: 'bg-gradient-to-br from-success to-green-700 text-white hover:from-green-400 hover:to-success hover:shadow-[0_4px_20px_rgba(74,222,128,0.4)]',
            },
            size: {
                sm: 'px-3 py-1.5 text-xs min-h-[32px]',
                md: 'px-5 py-2.5 text-sm min-h-[44px]',
                lg: 'px-6 py-3 text-base min-h-[48px]',
                icon: 'p-2.5 min-w-[44px] min-h-[44px]',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
