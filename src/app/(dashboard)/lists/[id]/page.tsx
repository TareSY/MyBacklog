'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Film, Tv, BookOpen, Music, Check, Trash2, Loader2, Filter, SortAsc, Gamepad2 } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';

interface Item {
    id: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    releaseYear: number | null;
    description: string | null;
    categoryId: number;
    isCompleted: boolean;
    completedAt: string | null;
    addedAt: string;
    notes: string | null;
    rating: number | null;
}

interface List {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    items: Item[];
}

const categoryIcons: Record<number, any> = {
    1: Film,
    2: Tv,
    3: BookOpen,
    4: Music,
    5: Gamepad2,
};

const categoryNames: Record<number, string> = {
    1: 'Movie',
    2: 'TV Show',
    3: 'Book',
    4: 'Album',
    5: 'Game',
};

const categoryEmojis: Record<number, string> = {
    1: '🎬',
    2: '📺',
    3: '📚',
    4: '🎵',
    5: '🎮',
};

export default function ListPage() {
    const { id } = useParams();
    const [list, setList] = useState<List | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

    useEffect(() => {
        async function fetchList() {
            try {
                const res = await fetch(`/api/lists/${id}`);
                const data = await res.json();

                if (data.error) {
                    console.error('API Error:', data.error);
                    setList(null); // Or set an error state
                    return;
                }

                setList(data);
            } catch (error) {
                console.error('Failed to fetch list:', error);
                setList(null);
            } finally {
                setLoading(false);
            }
        }

        fetchList();
    }, [id]);

    async function toggleComplete(itemId: string, isCompleted: boolean) {
        try {
            await fetch(`/api/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: !isCompleted }),
            });

            // Update local state
            setList(prev => prev ? {
                ...prev,
                items: prev.items.map(item =>
                    item.id === itemId ? { ...item, isCompleted: !isCompleted } : item
                ),
            } : null);
        } catch (error) {
            console.error('Failed to update item:', error);
        }
    }

    async function deleteItem(itemId: string) {
        if (!confirm('Remove this item from your backlog?')) return;

        try {
            await fetch(`/api/items/${itemId}`, { method: 'DELETE' });

            // Update local state
            setList(prev => prev ? {
                ...prev,
                items: prev.items.filter(item => item.id !== itemId),
            } : null);
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!list) {
        return (
            <div className="text-center py-16">
                <div className="text-4xl mb-4">😢</div>
                <h3 className="text-lg font-semibold text-text-primary">List not found</h3>
            </div>
        );
    }

    // Filter items
    let filteredItems = list.items;
    if (filter === 'pending') {
        filteredItems = filteredItems.filter(item => !item.isCompleted);
    } else if (filter === 'completed') {
        filteredItems = filteredItems.filter(item => item.isCompleted);
    }
    if (categoryFilter) {
        filteredItems = filteredItems.filter(item => item.categoryId === categoryFilter);
    }

    const pendingCount = list.items.filter(i => !i.isCompleted).length;
    const completedCount = list.items.filter(i => i.isCompleted).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 rounded-lg hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary">{list.name}</h1>
                        {list.description && (
                            <p className="text-text-muted mt-1">{list.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Public/Private Toggle */}
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch(`/api/lists/${id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ isPublic: !list.isPublic }),
                                });
                                if (res.ok) {
                                    setList(prev => prev ? { ...prev, isPublic: !prev.isPublic } : null);
                                }
                            } catch (error) {
                                console.error('Failed to update list visibility:', error);
                            }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${list.isPublic
                            ? 'bg-success/20 text-success hover:bg-success/30'
                            : 'bg-bg-elevated text-text-muted hover:bg-bg-surface'
                            }`}
                    >
                        {list.isPublic ? '🌐 Public' : '🔒 Private'}
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary-light">
                            {pendingCount} pending
                        </span>
                        <span className="px-3 py-1 rounded-full bg-success/20 text-success">
                            {completedCount} completed
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <div className="flex gap-1 p-1 bg-bg-elevated rounded-xl">
                    {(['all', 'pending', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === f
                                ? 'bg-primary text-white'
                                : 'text-text-muted hover:text-text-primary'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex gap-1 p-1 bg-bg-elevated rounded-xl">
                    <button
                        onClick={() => setCategoryFilter(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${categoryFilter === null
                            ? 'bg-primary text-white'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        All
                    </button>
                    {[1, 2, 3, 4].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${categoryFilter === cat
                                ? 'bg-primary text-white'
                                : 'text-text-muted hover:text-text-primary'
                                }`}
                        >
                            {categoryEmojis[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border-subtle rounded-3xl">
                    <div className="text-4xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No items yet</h3>
                    <p className="text-text-muted">
                        {filter === 'all'
                            ? 'Head to Browse to add some entertainment!'
                            : `No ${filter} items in this list.`}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredItems.map((item) => {
                        const Icon = categoryIcons[item.categoryId] || Film;
                        return (
                            <Card
                                key={item.id}
                                variant="default"
                                className={`flex gap-4 p-4 transition-all ${item.isCompleted ? 'opacity-60' : ''
                                    }`}
                            >
                                {/* Poster */}
                                <div className="w-16 h-24 shrink-0 bg-bg-elevated rounded-lg overflow-hidden">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                            {categoryEmojis[item.categoryId]}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2">
                                        <h3 className={`font-semibold text-text-primary ${item.isCompleted ? 'line-through' : ''}`}>
                                            {item.title}
                                        </h3>
                                        <Badge variant={item.categoryId === 1 ? 'movies' : item.categoryId === 2 ? 'tv' : item.categoryId === 3 ? 'books' : 'music'}>
                                            {categoryNames[item.categoryId]}
                                        </Badge>
                                    </div>
                                    {item.releaseYear && (
                                        <p className="text-sm text-text-muted">{item.releaseYear}</p>
                                    )}
                                    {item.description && (
                                        <p className="text-sm text-text-muted mt-1 line-clamp-2">{item.description}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant={item.isCompleted ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => toggleComplete(item.id, item.isCompleted)}
                                        leftIcon={<Check className="w-4 h-4" />}
                                    >
                                        {item.isCompleted ? 'Undo' : 'Done'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteItem(item.id)}
                                        className="text-error hover:bg-error/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
