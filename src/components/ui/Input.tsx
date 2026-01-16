'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
    'w-full text-sm leading-6 bg-bg-base border rounded-lg text-text-primary transition-all duration-200 placeholder:text-text-muted focus:outline-none',
    {
        variants: {
            variant: {
                default: 'border-border-subtle focus:border-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]',
                error: 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
                success: 'border-success focus:border-success focus:shadow-[0_0_0_3px_rgba(34,197,94,0.2)]',
            },
            inputSize: {
                sm: 'px-3 py-1.5 text-xs',
                md: 'px-4 py-2.5 text-sm',
                lg: 'px-5 py-3 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            inputSize: 'md',
        },
    }
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, inputSize, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-text-secondary mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        className={cn(
                            inputVariants({ variant: error ? 'error' : variant, inputSize, className }),
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10'
                        )}
                        ref={ref}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-error">{error}</p>
                )}
                {hint && !error && (
                    <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input, inputVariants };
