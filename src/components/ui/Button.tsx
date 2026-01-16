'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 font-medium text-sm rounded-lg transition-all duration-200 cursor-pointer border-none outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-br from-primary to-primary-dark text-white hover:from-primary-light hover:to-primary hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]',
                secondary: 'bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-overlay hover:border-primary-light',
                ghost: 'bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                danger: 'bg-gradient-to-br from-error to-red-700 text-white hover:from-red-400 hover:to-error',
                success: 'bg-gradient-to-br from-success to-green-700 text-white hover:from-green-400 hover:to-success',
            },
            size: {
                sm: 'px-3 py-1.5 text-xs',
                md: 'px-5 py-2.5 text-sm',
                lg: 'px-6 py-3 text-base',
                icon: 'p-2.5',
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
