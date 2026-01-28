'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { SearchDialog } from '@/components/SearchDialog';
import { NotificationBell } from '@/components/NotificationBell';
import {
    Library,
    Search,
    Settings,
    LogOut,
    User,
    Users,
    Menu,
    X,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
    user?: {
        email: string;
        username?: string;
        avatarUrl?: string;
    } | null;
    onLogout?: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: '/dashboard', label: 'My Backlog', icon: Library },
        { href: '/browse', label: 'Browse', icon: Search },
        { href: '/friends', label: 'Friends', icon: Users },
        { href: '/changelog', label: 'Changelog', icon: Sparkles },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-40 glass-strong">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                            <Library className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
                            MyBacklog
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        isActive(href)
                                            ? 'bg-primary/20 text-primary-light'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {user && <SearchDialog />}
                        {user ? (
                            <>
                                <NotificationBell />
                                <Link href="/settings">
                                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                                        <Settings className="w-5 h-5" />
                                    </Button>
                                </Link>

                                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border-subtle">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.username || 'User'}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm text-text-secondary max-w-[120px] truncate">
                                            {user.username || user.email}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onLogout}
                                        className="text-text-muted hover:text-error"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Mobile menu button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Log in</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button variant="primary" size="sm">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                {user && mobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 top-16 z-30 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="md:hidden py-4 border-t border-border-subtle animate-slide-down relative z-40 bg-bg-surface/95 backdrop-blur-xl">
                            <nav className="flex flex-col gap-1">
                                {navLinks.map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                                            isActive(href)
                                                ? 'bg-primary/20 text-primary-light'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {label}
                                    </Link>
                                ))}
                                <Link
                                    href="/settings"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                                >
                                    <Settings className="w-5 h-5" />
                                    Settings
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        onLogout?.();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/10"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Log out
                                </button>
                            </nav>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
