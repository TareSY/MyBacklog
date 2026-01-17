import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: ReactNode;
    emoji?: string;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    emoji,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center py-16 px-4',
                className
            )}
        >
            {emoji && (
                <span className="text-6xl mb-4 animate-bounce">{emoji}</span>
            )}
            {icon && (
                <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
            {description && (
                <p className="text-text-muted max-w-md mb-6">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}

// Pre-built empty states
export function EmptyStateNoItems() {
    return (
        <EmptyState
            emoji="📭"
            title="No items yet"
            description="Start adding movies, shows, books, or music to your backlog!"
        />
    );
}

export function EmptyStateNoLists() {
    return (
        <EmptyState
            emoji="📋"
            title="No lists yet"
            description="Create your first list to start organizing your entertainment backlog."
        />
    );
}

export function EmptyStateSearch() {
    return (
        <EmptyState
            emoji="🔍"
            title="No results found"
            description="Try a different search term or browse our suggestions."
        />
    );
}
