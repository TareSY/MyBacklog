'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge, Modal, ModalContent, ModalHeader, ModalTitle, useToast } from '@/components/ui';
import { Film, Tv, BookOpen, Music, Gamepad2, ArrowLeft, Loader2, List as ListIcon, Sparkles, Plus, Check } from 'lucide-react';
import { curatedContent, type CuratedCategory } from '@/lib/curated-content';

const categoryMap: Record<string, { id: number; label: string; icon: any; color: string }> = {
    movies: { id: 1, label: 'Movies', icon: Film, color: 'text-movies' },
    tv: { id: 2, label: 'TV Shows', icon: Tv, color: 'text-tv' },
    books: { id: 3, label: 'Books', icon: BookOpen, color: 'text-books' },
    music: { id: 4, label: 'Music', icon: Music, color: 'text-music' },
    games: { id: 5, label: 'Games', icon: Gamepad2, color: 'text-games' },
};

interface QuickAddItem {
    title: string;
    subtitle?: string;
    year?: number;
    categoryId: number;
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params?.slug as string;
    const category = categoryMap[slug];

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLists, setUserLists] = useState<any[]>([]);
    const [selectedListId, setSelectedListId] = useState<string>('');

    // Quick add modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToAdd, setItemToAdd] = useState<QuickAddItem | null>(null);
    const [saving, setSaving] = useState(false);

    // Create a Set of lowercase titles for O(1) lookup
    const addedTitles = useMemo(() => {
        return new Set(items.map(({ item }) => item.title?.toLowerCase()));
    }, [items]);

    // Check if an item is already added
    const isAlreadyAdded = (title: string) => addedTitles.has(title.toLowerCase());

    useEffect(() => {
        if (!category) {
            router.push('/dashboard');
            return;
        }

        async function fetchData() {
            try {
                // Fetch user's items for this category
                const itemsRes = await fetch(`/api/items?categoryId=${category.id}`);
                const itemsData = await itemsRes.json();
                setItems(Array.isArray(itemsData) ? itemsData : []);

                // Fetch user's lists
                const listsRes = await fetch('/api/lists');
                const listsData = await listsRes.json();
                if (Array.isArray(listsData)) {
                    setUserLists(listsData);
                    if (listsData.length > 0) {
                        setSelectedListId(listsData[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [category, router]);

    // Open quick add modal
    function openQuickAdd(item: QuickAddItem) {
        setItemToAdd(item);
        setIsAddModalOpen(true);
    }

    // Handle quick add submit
    async function handleQuickAdd() {
        if (!itemToAdd || !selectedListId) return;

        setSaving(true);
        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listIds: [selectedListId],
                    categoryId: itemToAdd.categoryId,
                    title: itemToAdd.title,
                    subtitle: itemToAdd.subtitle || null,
                    releaseYear: itemToAdd.year || null,
                    externalSource: 'curated',
                }),
            });

            if (!res.ok) {
                if (res.status === 409) {
                    throw new Error('Already in your list');
                }
                throw new Error('Failed to add');
            }

            const newItem = await res.json();

            // Add to local items state
            const listName = userLists.find(l => l.id === selectedListId)?.name || 'My List';
            setItems(prev => [...prev, { item: newItem, listName }]);

            toast(`Added "${itemToAdd.title}" to your backlog!`, 'success');
            setIsAddModalOpen(false);
            setItemToAdd(null);
        } catch (error: any) {
            toast(error.message || 'Failed to add item', 'error');
        } finally {
            setSaving(false);
        }
    }

    if (!category) return null;

    const Icon = category.icon;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Icon className={`w-8 h-8 ${category.color}`} />
                        My {category.label}
                    </h1>
                    <p className="text-text-muted mt-1">
                        Viewing all {slug} in your backlog
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : items.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
                    {items.map(({ item, listName }: any) => (
                        <Card key={item.id} variant="default" hover className="flex flex-col h-full overflow-hidden group">
                            {item.imageUrl && (
                                <div className="aspect-video w-full overflow-hidden bg-bg-elevated relative">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-lg text-text-primary line-clamp-2" title={item.title}>
                                        {item.title}
                                    </h3>
                                    {item.isCompleted && (
                                        <Badge variant="success" className="shrink-0">Done</Badge>
                                    )}
                                </div>

                                {item.subtitle && (
                                    <p className="text-sm text-text-secondary mb-1">{item.subtitle}</p>
                                )}

                                <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                                    {item.releaseYear && <span>{item.releaseYear}</span>}
                                    {item.platform && (
                                        <>
                                            <span>•</span>
                                            <span className="uppercase">{item.platform}</span>
                                        </>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-text-secondary bg-bg-elevated px-2 py-1 rounded max-w-[70%]">
                                        <ListIcon className="w-3 h-3 shrink-0" />
                                        <span className="truncate" title={listName}>{listName}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed border-border-subtle rounded-3xl bg-bg-surface/30">
                    <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-6">
                        <Icon className="w-8 h-8 text-text-muted" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">No {category.label} found</h2>
                    <p className="text-text-muted max-w-sm mx-auto mb-8">
                        You haven't added any {category.label.toLowerCase()} to your backlog yet.
                    </p>
                    <Button onClick={() => router.push('/browse')}>
                        Start Exploring
                    </Button>
                </div>
            )}

            {/* Top Picks to Add */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-text-primary">Top {category.label} to Add</h2>
                </div>
                <p className="text-text-muted">Curated picks from the past decade</p>
                <div className="grid gap-3 md:grid-cols-2">
                    {curatedContent[slug as keyof CuratedCategory]?.map((item, idx) => {
                        const alreadyAdded = isAlreadyAdded(item.title);
                        return (
                            <Card key={idx} variant="glass" className="p-3 flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="font-medium text-text-primary truncate">{item.title}</p>
                                    <p className="text-sm text-text-muted">{item.subtitle} • {item.year}</p>
                                </div>
                                {alreadyAdded ? (
                                    <div className="flex items-center gap-1.5 text-success px-2 py-1 rounded bg-success/10">
                                        <Check className="w-4 h-4" />
                                        <span className="text-xs font-medium">Added</span>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => openQuickAdd({
                                            title: item.title,
                                            subtitle: item.subtitle,
                                            year: item.year,
                                            categoryId: category.id,
                                        })}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Quick Add Modal */}
            <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <ModalContent>
                    <ModalHeader>
                        <ModalTitle>Add to List</ModalTitle>
                    </ModalHeader>
                    <div className="space-y-4">
                        {itemToAdd && (
                            <div className="p-4 bg-bg-elevated rounded-lg">
                                <p className="font-medium text-text-primary">{itemToAdd.title}</p>
                                {itemToAdd.subtitle && (
                                    <p className="text-sm text-text-muted">{itemToAdd.subtitle}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Select a list
                            </label>
                            <select
                                value={selectedListId}
                                onChange={(e) => setSelectedListId(e.target.value)}
                                className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:border-primary focus:outline-none"
                            >
                                {userLists.map((list) => (
                                    <option key={list.id} value={list.id}>
                                        {list.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleQuickAdd}
                                disabled={saving || !selectedListId}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
}
