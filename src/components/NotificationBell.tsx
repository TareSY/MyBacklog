'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, UserPlus, Share2, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface Notification {
    id: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    actorName?: string;
    actorUsername?: string;
    actorImage?: string;
}

const typeIcons: Record<string, React.ElementType> = {
    friend_request: UserPlus,
    friend_accepted: Check,
    list_shared: Share2,
    item_added: List,
};

const typeColors: Record<string, string> = {
    friend_request: 'text-primary',
    friend_accepted: 'text-success',
    list_shared: 'text-secondary',
    item_added: 'text-info',
};

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    async function fetchNotifications() {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications?limit=10');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark all as read
    async function markAllRead() {
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    // Format relative time
    function formatTime(date: string) {
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!open)}
                className="relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-bg-surface border border-border-default rounded-xl shadow-xl z-50 animate-scale-in origin-top-right">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
                        <h3 className="font-semibold text-text-primary">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-primary hover:text-primary-light flex items-center gap-1"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-text-muted">
                                Loading...
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map(notif => {
                                const Icon = typeIcons[notif.type] || Bell;
                                const content = (
                                    <div
                                        className={cn(
                                            'flex items-start gap-3 p-3 hover:bg-bg-elevated transition-colors',
                                            !notif.isRead && 'bg-primary/5'
                                        )}
                                    >
                                        <div className={cn('mt-0.5', typeColors[notif.type] || 'text-text-muted')}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'text-sm',
                                                notif.isRead ? 'text-text-secondary' : 'text-text-primary font-medium'
                                            )}>
                                                {notif.title}
                                            </p>
                                            {notif.message && (
                                                <p className="text-xs text-text-muted mt-0.5 truncate">
                                                    {notif.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-text-muted mt-1">
                                                {formatTime(notif.createdAt)}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                        )}
                                    </div>
                                );

                                return notif.link ? (
                                    <Link key={notif.id} href={notif.link} onClick={() => setOpen(false)}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={notif.id}>{content}</div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="w-10 h-10 text-text-muted mx-auto mb-2" />
                                <p className="text-text-muted text-sm">No notifications yet</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-border-subtle">
                            <Link
                                href="/activity"
                                onClick={() => setOpen(false)}
                                className="block text-center py-2 text-sm text-primary hover:bg-bg-elevated transition-colors"
                            >
                                View all activity
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
