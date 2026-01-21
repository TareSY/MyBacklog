'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Film,
    Tv,
    BookOpen,
    Music,
    CheckCircle2,
    Plus,
    List,
    Users,
    Gamepad2,
    Utensils,
    PartyPopper,
    MapPin
} from 'lucide-react';
import type { Category } from '@/types';

interface SidebarProps {
    listId?: string;
    categoryCounts?: Record<Category, number>;
    completedCount?: number;
}

const categories: { id: Category; label: string; icon: typeof Film; color: string }[] = [
    { id: 'movies', label: 'Movies', icon: Film, color: 'text-movies' },
    { id: 'tv', label: 'TV Shows', icon: Tv, color: 'text-tv' },
    { id: 'books', label: 'Books', icon: BookOpen, color: 'text-books' },
    { id: 'games', label: 'Games', icon: Gamepad2, color: 'text-games' },
    { id: 'music', label: 'Music', icon: Music, color: 'text-music' },
];

export function Sidebar({ listId, categoryCounts, completedCount = 0 }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
    const listPath = listId ? `/lists/${listId}` : '/dashboard';

    return (
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] fixed top-16 left-0 bg-bg-surface/50 border-r border-border-subtle p-4">
            {/* Main navigation */}
            <nav className="flex flex-col gap-1">
                <Link
                    href="/dashboard"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive('/dashboard') && !pathname.includes('/lists/')
                            ? 'bg-primary/20 text-primary-light'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    )}
                >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                </Link>
                <Link
                    href="/friends"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive('/friends')
                            ? 'bg-primary/20 text-primary-light'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    )}
                >
                    <Users className="w-5 h-5" />
                    Friends
                </Link>
            </nav>

            {/* Divider */}
            <div className="my-4 h-px bg-border-subtle" />

            {/* Categories */}
            <div className="flex-1 overflow-y-auto">
                <h3 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Categories
                </h3>
                <nav className="flex flex-col gap-1">
                    {categories.map(({ id, label, icon: Icon, color }) => (
                        <Link
                            key={id}
                            href={`/category/${id}`}
                            className={cn(
                                'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                                pathname === `/category/${id}`
                                    ? 'bg-bg-elevated text-text-primary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn('w-4 h-4', color)} />
                                {label}
                            </div>
                            {categoryCounts && (
                                <span className="text-xs text-text-muted">
                                    {categoryCounts[id] || 0}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Completed section */}
                <div className="mt-4">
                    <Link
                        href={`${listPath}?completed=true`}
                        className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                            pathname.includes('completed')
                                ? 'bg-success/20 text-success'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            Completed
                        </div>
                        <span className="text-xs text-text-muted">{completedCount}</span>
                    </Link>
                </div>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-border-subtle" />

            {/* Lists section */}
            <div>
                <div className="flex items-center justify-between px-3 mb-2">
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        My Lists
                    </h3>
                    <button className="p-1 rounded hover:bg-bg-elevated transition-colors">
                        <Plus className="w-4 h-4 text-text-muted" />
                    </button>
                </div>
                <nav className="flex flex-col gap-1">
                    <Link
                        href="/lists"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all"
                    >
                        <List className="w-4 h-4" />
                        View All Lists
                    </Link>
                </nav>
            </div>
        </aside>
    );
}
