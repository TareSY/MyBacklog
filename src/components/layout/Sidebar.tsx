'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button, Input, Modal, ModalContent, ModalHeader, ModalTitle, useToast } from '@/components/ui';
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
    PartyPopper
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
    const [lists, setLists] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
    const listPath = listId ? `/lists/${listId}` : '/dashboard';

    useEffect(() => {
        fetch('/api/lists?type=mine')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLists(data);
                }
            })
            .catch(err => console.error('Failed to fetch lists:', err));

        // Fetch friends
        fetch('/api/friends')
            .then(res => res.json())
            .then(data => {
                if (data?.friends) {
                    setFriends(data.friends);
                }
            })
            .catch(err => console.error('Failed to fetch friends:', err));
    }, []);

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newListName }),
            });

            if (!res.ok) throw new Error('Failed to create list');

            const newList = await res.json();
            setLists(prev => [...prev, newList]);
            setNewListName('');
            setIsCreateOpen(false);
            toast('List created successfully', 'success');
        } catch (error) {
            console.error('Error creating list:', error);
            toast('Failed to create list', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
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
                <div className="max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between px-3 mb-2">
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            My Lists
                        </h3>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="p-1 rounded hover:bg-bg-elevated transition-colors"
                        >
                            <Plus className="w-4 h-4 text-text-muted" />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {lists.map((list) => (
                            <Link
                                key={list.id}
                                href={`/lists/${list.id}`}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                                    pathname === `/lists/${list.id}`
                                        ? 'bg-bg-elevated text-text-primary'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                                )}
                            >
                                <List className="w-4 h-4" />
                                {list.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Create New List
                        </button>
                        <Link
                            href="/lists"
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                isActive('/lists') && !pathname.match(/\/lists\/[a-zA-Z0-9-]+/)
                                    ? 'bg-primary/20 text-text-primary'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                            )}
                        >
                            <List className="w-4 h-4" />
                            All Lists
                        </Link>
                    </nav>
                </div>

                {/* Friends section */}
                {friends.length > 0 && (
                    <>
                        <div className="my-4 h-px bg-border-subtle" />
                        <div className="max-h-32 overflow-y-auto">
                            <h3 className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Friends
                            </h3>
                            <nav className="flex flex-col gap-1">
                                {friends.slice(0, 5).map((friend) => (
                                    <Link
                                        key={friend.id}
                                        href={`/friends/${friend.id}`}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                                            pathname === `/friends/${friend.id}`
                                                ? 'bg-bg-elevated text-text-primary'
                                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                                        )}
                                    >
                                        {friend.image ? (
                                            <img src={friend.image} alt="" className="w-5 h-5 rounded-full" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                                {(friend.name || friend.username)?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <span className="truncate">{friend.name || friend.username}</span>
                                    </Link>
                                ))}
                                {friends.length > 5 && (
                                    <Link
                                        href="/friends"
                                        className="px-3 py-2 text-sm text-primary-light hover:text-primary transition-colors"
                                    >
                                        View all {friends.length} friends
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </>
                )}
            </aside>

            {/* Create List Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
                <ModalContent>
                    <ModalHeader>
                        <ModalTitle>Create New List</ModalTitle>
                    </ModalHeader>
                    <form onSubmit={handleCreateList} className="space-y-4 py-4">
                        <Input
                            placeholder="List Name (e.g., Summer Reading)"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!newListName.trim() || isCreating}>
                                {isCreating ? 'Creating...' : 'Create List'}
                            </Button>
                        </div>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
}
