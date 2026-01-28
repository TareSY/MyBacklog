'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Modal, ModalContent, ModalHeader, ModalTitle, useToast, ModalBody, ModalFooter } from '@/components/ui';
import { CreateListModal } from '@/components/CreateListModal';
import { Plus, Search, Sparkles, Film, Tv, BookOpen, Music, Gamepad2, ArrowRight, Loader2, Check } from 'lucide-react';
import { curatedContent, categoryIdToKey } from '@/lib/curated-content';

interface List {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    stats?: CategoryStats;
}

interface CategoryStats {
    movies: number;
    tv: number;
    books: number;
    music: number;
    games: number;
}

interface QuickAddItem {
    title: string;
    subtitle?: string;
    year?: number;
    categoryId: number;
    categoryKey?: string;
    imageUrl?: string | null;
}

export default function DashboardPage() {
    const { toast } = useToast();
    const [lists, setLists] = useState<List[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<CategoryStats>({ movies: 0, tv: 0, books: 0, music: 0, games: 0 });
    const [featured, setFeatured] = useState<Record<string, any[]>>({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Quick add modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToAdd, setItemToAdd] = useState<QuickAddItem | null>(null);
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [fetchingImage, setFetchingImage] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Parallel fetch for lists, featured, and friends
                const [listsRes, featuredRes, friendsRes] = await Promise.all([
                    fetch('/api/lists'),
                    fetch('/api/featured'),
                    fetch('/api/friends')
                ]);

                const listsData = await listsRes.json();
                const featuredData = await featuredRes.json();
                const friendsData = await friendsRes.json();

                if (Array.isArray(listsData)) {
                    setLists(listsData);
                    if (listsData.length > 0) {
                        setSelectedListId(listsData[0].id);
                    }

                    // Calculate stats from list.stats (API returns stats object per list)
                    if (listsData.length > 0) {
                        const aggregatedStats = { movies: 0, tv: 0, books: 0, music: 0, games: 0 };
                        listsData.forEach((list: List) => {
                            if (list.stats) {
                                aggregatedStats.movies += list.stats.movies || 0;
                                aggregatedStats.tv += list.stats.tv || 0;
                                aggregatedStats.books += list.stats.books || 0;
                                aggregatedStats.music += list.stats.music || 0;
                                aggregatedStats.games += list.stats.games || 0;
                            }
                        });
                        setStats(aggregatedStats);
                    }
                }

                if (featuredData && !featuredData.error) {
                    setFeatured(featuredData);
                }

                if (friendsData?.friends) {
                    setFriends(friendsData.friends);
                }

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Open quick add modal and fetch image
    async function openQuickAdd(item: QuickAddItem) {
        setItemToAdd(item);
        setIsAddModalOpen(true);

        // Fetch metadata to get image
        if (item.categoryKey) {
            setFetchingImage(true);
            try {
                const res = await fetch(`/api/metadata/search?q=${encodeURIComponent(item.title)}&category=${item.categoryKey}`);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const match = data.results.find((r: any) => r.title.toLowerCase() === item.title.toLowerCase()) || data.results[0];
                    if (match.imageUrl) {
                        setItemToAdd(prev => prev ? { ...prev, imageUrl: match.imageUrl } : null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch metadata', error);
            } finally {
                setFetchingImage(false);
            }
        }
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
                    imageUrl: itemToAdd.imageUrl || null,
                    externalSource: 'curated',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 409) {
                    throw new Error(data.error || 'Already in your list');
                }
                throw new Error(data.error || 'Failed to add');
            }

            toast(`Added "${itemToAdd.title}" to your backlog!`, 'success');
            setIsAddModalOpen(false);
            setItemToAdd(null);

            // Optionally update stats/lists locally if we wanted immediate feedback
            // keeping it simple for now as stats are aggregated from listsData which is complex to update
        } catch (error: any) {
            toast(error.message || 'Failed to add item', 'error');
        } finally {
            setSaving(false);
        }
    }

    const totalItems = stats.movies + stats.tv + stats.books + stats.music + stats.games;

    const categoryConfig = [
        { key: 'movies', label: 'Top Movies', emoji: '🎬', color: 'text-movies', id: 1 },
        { key: 'tv', label: 'Top TV Shows', emoji: '📺', color: 'text-tv', id: 2 },
        { key: 'books', label: 'Top Books', emoji: '📚', color: 'text-books', id: 3 },
        { key: 'music', label: 'Top Albums', emoji: '🎵', color: 'text-music', id: 4 },
        { key: 'games', label: 'Top Games', emoji: '🎮', color: 'text-games', id: 5 },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 sm:p-12">
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {totalItems === 0 ? 'Welcome to Your Backlog! ✨' : `You have ${totalItems} items to explore! 🎉`}
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl mb-8">
                        {totalItems === 0
                            ? "Your collection is looking a bit empty. Let's find some entertainment to track!"
                            : "Keep going! Your next great experience is waiting."}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/browse">
                            <Button
                                className="bg-white text-primary hover:bg-white/90 border-none"
                                size="lg"
                                leftIcon={<Search className="w-5 h-5" />}
                            >
                                Find Entertainment
                            </Button>
                        </Link>
                        {lists.length > 0 && (
                            <Link href={lists.length === 1 ? `/lists/${lists[0].id}` : '/lists'}>
                                <Button
                                    variant="secondary"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                    size="lg"
                                    leftIcon={<ArrowRight className="w-5 h-5" />}
                                >
                                    View My {lists.length === 1 ? 'List' : 'Lists'}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-[40px] -ml-10 -mb-10 pointer-events-none" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Movies', slug: 'movies', count: stats.movies, color: 'text-movies', icon: Film, emoji: '🎬' },
                    { label: 'TV Shows', slug: 'tv', count: stats.tv, color: 'text-tv', icon: Tv, emoji: '📺' },
                    { label: 'Books', slug: 'books', count: stats.books, color: 'text-books', icon: BookOpen, emoji: '📚' },
                    { label: 'Music', slug: 'music', count: stats.music, color: 'text-music', icon: Music, emoji: '🎵' },
                    { label: 'Games', slug: 'games', count: stats.games, color: 'text-games', icon: Gamepad2, emoji: '🎮' },
                ].map((stat) => (
                    <Link key={stat.label} href={`/category/${stat.slug}`}>
                        <Card variant="glass" hover className="p-4 flex items-center justify-between cursor-pointer">
                            <div>
                                <p className="text-text-muted text-sm font-medium">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.count}</p>
                            </div>
                            <span className="text-2xl">{stat.emoji}</span>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Featured / Jump Back In Sections */}
            {!loading && Object.values(featured).some((arr: any) => arr && arr.length > 0) && (
                <div className="space-y-8">
                    <h2 className="text-xl font-bold text-text-primary">Jump Back In</h2>

                    {[
                        { key: 'movies', label: 'Recent Movies', icon: Film, color: 'text-movies' },
                        { key: 'tv', label: 'Recent TV Shows', icon: Tv, color: 'text-tv' },
                        { key: 'books', label: 'Recent Books', icon: BookOpen, color: 'text-books' },
                        { key: 'music', label: 'Recent Music', icon: Music, color: 'text-music' },
                        { key: 'games', label: 'Recent Games', icon: Gamepad2, color: 'text-games' },
                    ].map(category => {
                        const items = featured[category.key];
                        if (!items || items.length === 0) return null;

                        return (
                            <div key={category.key} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <category.icon className={`w-5 h-5 ${category.color}`} />
                                    <h3 className="font-semibold text-text-primary">{category.label}</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {items.map((item: any) => (
                                        <Link key={item.id} href={`/lists/${item.listId}`}>
                                            <div className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-elevated border border-border-default hover:border-primary/50 transition-all">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-bg-surface/50">
                                                        {category.key === 'movies' ? '🎬' : category.key === 'tv' ? '📺' : category.key === 'books' ? '📚' : category.key === 'music' ? '🎵' : '🎮'}
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                    <p className="text-white font-medium text-sm line-clamp-2">{item.title}</p>
                                                    {item.releaseYear && <p className="text-white/60 text-xs">{item.releaseYear}</p>}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Suggested For You */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-text-primary">Suggested For You</h2>
                </div>
                <p className="text-text-muted">Top picks from the past decade — add them to your backlog!</p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categoryConfig.map((cat) => (
                        <Card key={cat.key} variant="glass" className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{cat.emoji}</span>
                                <h3 className={`font-semibold ${cat.color}`}>{cat.label}</h3>
                            </div>
                            <div className="space-y-2">
                                {curatedContent[cat.key as keyof typeof curatedContent].slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm group">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <span className="text-text-primary truncate block">{item.title}</span>
                                            <span className="text-text-muted text-xs">{item.year}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Add to backlog"
                                            onClick={() => openQuickAdd({
                                                title: item.title,
                                                subtitle: item.subtitle,
                                                year: item.year,
                                                categoryId: cat.id,
                                                categoryKey: cat.key
                                            })}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Link href={`/category/${cat.key}`}>
                                <Button variant="ghost" size="sm" className="w-full mt-2">
                                    See all →
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Friends Activity */}
            {friends.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-text-primary">Friends Activity</h2>
                        <Link href="/friends">
                            <Button size="sm" variant="ghost">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {friends.slice(0, 4).map((friend) => (
                            <Link key={friend.id} href={`/friends/${friend.id}`}>
                                <Card variant="glass" hover className="p-4 flex items-center gap-3 cursor-pointer">
                                    {friend.image ? (
                                        <img src={friend.image} alt="" className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {(friend.name || friend.username)?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium text-text-primary truncate">{friend.name || friend.username}</p>
                                        <p className="text-sm text-text-muted">@{friend.username}</p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Lists Section */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : lists.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-text-primary">Your Lists</h2>
                        <Button
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Create List
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {lists.map((list) => (
                            <Link key={list.id} href={`/lists/${list.id}`}>
                                <Card variant="default" hover className="p-6 h-full">
                                    <h3 className="font-semibold text-text-primary mb-2">{list.name}</h3>
                                    {list.description && (
                                        <p className="text-sm text-text-muted mb-4">{list.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                        {list.isPublic ? '🌐 Public' : '🔒 Private'}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border-subtle rounded-3xl bg-bg-surface/30">
                    <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-6 animate-bounce">
                        <Sparkles className="w-8 h-8 text-primary-light" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">
                        Your backlog is waiting
                    </h2>
                    <p className="text-text-muted max-w-md mb-8">
                        Search for titles you want to experience or create custom lists to organize your collection.
                    </p>
                    <Link href="/browse">
                        <Button>Start Exploring</Button>
                    </Link>
                </div>
            )}

            {/* Create List Modal */}
            <CreateListModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={(newList) => setLists(prev => [...prev, newList])}
            />

            {/* Quick Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <ModalContent>
                    <ModalHeader>
                        <ModalTitle>Add to List</ModalTitle>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
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
                                {lists.map((list) => (
                                    <option key={list.id} value={list.id}>
                                        {list.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </ModalBody>
                    <ModalFooter className="flex gap-3">
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
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
