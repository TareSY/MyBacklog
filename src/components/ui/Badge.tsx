'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Film, Tv, BookOpen, Music, Gamepad2 } from 'lucide-react';
import type { Category } from '@/types';

const badgeVariants = cva(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-bg-elevated text-text-secondary',
                movies: 'bg-movies/20 text-movies border border-movies/30',
                tv: 'bg-tv/20 text-tv border border-tv/30',
                books: 'bg-books/20 text-books border border-books/30',
                music: 'bg-music/20 text-music border border-music/30',
                success: 'bg-success/20 text-success border border-success/30',
                warning: 'bg-warning/20 text-warning border border-warning/30',
                error: 'bg-error/20 text-error border border-error/30',
                info: 'bg-info/20 text-info border border-info/30',
                games: 'bg-games/20 text-games border border-games/30',
                secondary: 'bg-bg-elevated text-text-muted border border-border-default',
            },
            size: {
                sm: 'px-2 py-0.5 text-[10px]',
                md: 'px-2.5 py-1 text-xs',
                lg: 'px-3 py-1.5 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

const categoryIcons = {
    movies: Film,
    tv: Tv,
    books: BookOpen,
    music: Music,
    games: Gamepad2,
};

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    showIcon?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant, size, showIcon, children, ...props }, ref) => {
        const Icon = variant && variant in categoryIcons
            ? categoryIcons[variant as Category]
            : null;

        return (
            <span
                ref={ref}
                className={cn(badgeVariants({ variant, size, className }))}
                {...props}
            >
                {showIcon && Icon && <Icon className="w-3 h-3" />}
                {children}
            </span>
        );
    }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
