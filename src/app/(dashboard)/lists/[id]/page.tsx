'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Film, Tv, BookOpen, Music, Check, Trash2, Loader2, Filter, SortAsc, Gamepad2, Share } from 'lucide-react';
import { Button, Card, Badge, useToast } from '@/components/ui';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/ui/SortableItem';

interface Item {
    id: string;
    listId: string;
    categoryId: number;
    externalId: string | null;
    externalSource: string | null;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    releaseYear: number | null;
    description: string | null;
    isCompleted: boolean;
    completedAt: string | null;
    addedAt: string;
    notes: string | null;
    rating: number | null;
    platform: string | null;
    placeId: string | null;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    subtype: string | null;
    position: number;
}

interface List {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    isPrimary: boolean;
    shareSlug: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
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
    const router = useRouter();
    const { toast } = useToast();
    const [list, setList] = useState<List | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Dnd Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        async function fetchList() {
            try {
                const res = await fetch(`/api/lists/${id}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('List not found');
                    if (res.status === 401) throw new Error('Unauthorized');
                    throw new Error('Failed to fetch list');
                }
                const data = await res.json();
                setList(data);
                setItems(data.items || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchList();
    }, [id]);

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                const updates = newOrder.map((item, index) => ({
                    id: item.id,
                    position: index
                }));

                fetch(`/api/lists/${id}/reorder`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: updates })
                }).catch(err => {
                    console.error('Failed to save order', err);
                    toast('Failed to save order', 'error');
                });

                return newOrder;
            });
        }
    }

    async function toggleComplete(itemId: string, isCompleted: boolean) {
        try {
            await fetch(`/api/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: !isCompleted }),
            });

            setItems(prev => prev.map(item =>
                item.id === itemId ? { ...item, isCompleted: !isCompleted } : item
            ));
        } catch (error) {
            console.error('Failed to update item:', error);
        }
    }

    async function deleteItem(itemId: string) {
        if (!confirm('Remove this item from your backlog?')) return;

        try {
            await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
            setItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    }

    async function deleteList() {
        if (!list || list.isPrimary) return;
        if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete list');

            toast('List deleted', 'success');
            router.push('/lists');
        } catch (error) {
            console.error('Failed to delete list:', error);
            toast('Failed to delete list', 'error');
        }
    }

    async function toggleShare() {
        if (!list) return;

        if (list.isPublic && list.shareSlug) {
            const url = `${window.location.origin}/share/${list.shareSlug}`;
            await navigator.clipboard.writeText(url);
            toast('Link copied to clipboard!', 'success');
            return;
        }

        // If not public, make it public first
        await toggleVisibility(true);
    }

    async function toggleVisibility(makePublic?: boolean) {
        if (!list) return;

        const newPublicState = makePublic !== undefined ? makePublic : !list.isPublic;

        try {
            const res = await fetch(`/api/lists/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: list.name,
                    description: list.description,
                    isPublic: newPublicState
                }),
            });

            if (!res.ok) throw new Error('Failed to update visibility');

            const updated = await res.json();
            setList(prev => prev ? { ...prev, isPublic: newPublicState, shareSlug: updated.shareSlug } : null);

            if (newPublicState && updated.shareSlug) {
                const url = `${window.location.origin}/share/${updated.shareSlug}`;
                await navigator.clipboard.writeText(url);
                toast('List is now public. Link copied!', 'success');
            } else {
                toast('List is now private', 'success');
            }
        } catch (error) {
            console.error(error);
            toast('Failed to update visibility', 'error');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="text-4xl mb-4">🚨</div>
                <h3 className="text-lg font-semibold text-text-primary">Error loading list</h3>
                <p className="text-text-muted mt-1">{error}</p>
            </div>
        );
    }

    if (!list) {
        return (
            <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
        );
    }

    const isDragEnabled = filter === 'all' && categoryFilter === null;

    let filteredItems = items;
    if (filter === 'pending') filteredItems = items.filter(i => !i.isCompleted);
    if (filter === 'completed') filteredItems = items.filter(i => i.isCompleted);
    if (categoryFilter) filteredItems = filteredItems.filter(i => i.categoryId === categoryFilter);

    const pendingCount = items.filter(i => !i.isCompleted).length;
    const completedCount = items.filter(i => i.isCompleted).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/lists"
                        className="p-2 rounded-lg hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-text-primary">{list.name}</h1>
                            {list.isPublic && (
                                <Badge variant="secondary" className="text-xs">
                                    Public
                                </Badge>
                            )}
                            {list.isPrimary && (
                                <Badge variant="movies" className="text-xs">
                                    Master List
                                </Badge>
                            )}
                        </div>
                        {list.description && (
                            <p className="text-text-muted mt-1">{list.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
                            <Badge variant="secondary">{list.items.length} items</Badge>
                            <span>•</span>
                            <span className="text-success">{completedCount} done</span>
                            <span>•</span>
                            <span>{pendingCount} remaining</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Visibility Toggle */}
                    <Button
                        variant={list.isPublic ? 'secondary' : 'ghost'}
                        onClick={() => toggleVisibility()}
                        className={list.isPublic ? 'text-success' : 'text-text-muted'}
                    >
                        {list.isPublic ? '🌐 Public' : '🔒 Private'}
                    </Button>

                    {/* Share / Copy Link */}
                    {list.isPublic && (
                        <Button
                            variant="primary"
                            onClick={toggleShare}
                            leftIcon={<Share className="w-4 h-4" />}
                        >
                            Copy Link
                        </Button>
                    )}

                    {!list.isPrimary && (
                        <Button
                            variant="ghost"
                            onClick={deleteList}
                            className="text-error hover:bg-error/10 hover:text-error"
                            leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                            Delete List
                        </Button>
                    )}
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
                    {[1, 2, 3, 4, 5, 6].map((cat) => (
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
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(event) => setActiveId(String(event.active.id))}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredItems.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                        disabled={!isDragEnabled}
                    >
                        <div className="grid gap-3">
                            {filteredItems.map((item) => (
                                <SortableItem key={item.id} id={item.id} handle={isDragEnabled}>
                                    <div className={`relative group flex gap-4 p-4 rounded-xl bg-bg-surface border border-border-subtle transition-all ${item.isCompleted ? 'opacity-60' : ''}`}>
                                        {/* Poster */}
                                        <div className="w-16 h-24 shrink-0 bg-bg-elevated rounded-lg overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                                    {categoryEmojis[item.categoryId]}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-2 flex-wrap">
                                                <h3 className={`font-semibold text-text-primary ${item.isCompleted ? 'line-through' : ''}`}>
                                                    {item.title}
                                                </h3>
                                                <Badge variant={item.categoryId === 1 ? 'movies' : item.categoryId === 2 ? 'tv' : item.categoryId === 3 ? 'books' : item.categoryId === 5 ? 'games' : 'music'}>
                                                    {item.categoryId === 4 && item.subtype
                                                        ? (item.subtype === 'song' ? 'Song' : 'Album')
                                                        : categoryNames[item.categoryId]}
                                                </Badge>
                                            </div>
                                            {item.subtitle && <p className="text-sm text-text-muted">{item.subtitle}</p>}
                                            {item.releaseYear && !item.subtitle && <p className="text-sm text-text-muted">{item.releaseYear}</p>}
                                            {item.description && <p className="text-sm text-text-muted mt-1 line-clamp-2">{item.description}</p>}
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
                                    </div>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeId ? (
                            <Card variant="elevated" className="opacity-80 rotate-2 cursor-grabbing">
                                <div className="p-4 flex items-center gap-4">
                                    Dragging...
                                </div>
                            </Card>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}
