'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
    'rounded-xl overflow-hidden',
    {
        variants: {
            variant: {
                default: 'bg-bg-surface border border-border-subtle',
                elevated: 'bg-bg-elevated border border-border-default shadow-lg',
                glass: 'bg-bg-surface/70 backdrop-blur-xl border border-white/10',
                gradient: 'bg-bg-surface border border-border-subtle relative before:absolute before:inset-[-1px] before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-primary before:via-secondary before:to-accent before:-z-10',
            },
            hover: {
                true: 'transition-all duration-300 ease-out hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(139,92,246,0.25)] hover:-translate-y-1 hover:scale-[1.02] cursor-pointer active:scale-[0.98]',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            hover: false,
        },
    }
);

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, hover, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(cardVariants({ variant, hover, className }))}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('px-5 py-4 border-b border-border-subtle', className)}
            {...props}
        />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-lg font-semibold text-text-primary', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-sm text-text-muted mt-1', className)}
            {...props}
        />
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-5', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('px-5 py-4 border-t border-border-subtle bg-bg-base/50', className)}
            {...props}
        />
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
