'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { CreateListModal } from '@/components/CreateListModal';
import { Plus, Search, Sparkles, Film, Tv, BookOpen, Music, Gamepad2, ArrowRight, Loader2, MapPin } from 'lucide-react';

interface List {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    items?: any[];
}

interface CategoryStats {
    movies: number;
    tv: number;
    books: number;
    music: number;
    games: number;
    places: number;
}

export default function DashboardPage() {
    const [lists, setLists] = useState<List[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<CategoryStats>({ movies: 0, tv: 0, books: 0, music: 0, games: 0, places: 0 });
    const [featured, setFeatured] = useState<Record<string, any[]>>({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

                    // Calculate stats
                    if (listsData.length > 0) {
                        const aggregatedStats = { movies: 0, tv: 0, books: 0, music: 0, games: 0, places: 0 };
                        listsData.forEach((list: any) => {
                            if (list.items) {
                                aggregatedStats.movies += list.items.filter((i: any) => i.categoryId === 1).length;
                                aggregatedStats.tv += list.items.filter((i: any) => i.categoryId === 2).length;
                                aggregatedStats.books += list.items.filter((i: any) => i.categoryId === 3).length;
                                aggregatedStats.music += list.items.filter((i: any) => i.categoryId === 4).length;
                                aggregatedStats.games += list.items.filter((i: any) => i.categoryId === 5).length;
                                aggregatedStats.places += list.items.filter((i: any) => i.categoryId === 6).length;
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

    const totalItems = stats.movies + stats.tv + stats.books + stats.music + stats.games;

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Movies', slug: 'movies', count: stats.movies, color: 'text-movies', icon: Film, emoji: '🎬' },
                    { label: 'TV Shows', slug: 'tv', count: stats.tv, color: 'text-tv', icon: Tv, emoji: '📺' },
                    { label: 'Books', slug: 'books', count: stats.books, color: 'text-books', icon: BookOpen, emoji: '📚' },
                    { label: 'Music', slug: 'music', count: stats.music, color: 'text-music', icon: Music, emoji: '🎵' },
                    { label: 'Games', slug: 'games', count: stats.games, color: 'text-games', icon: Gamepad2, emoji: '🎮' },
                    { label: 'Places', slug: 'places', count: stats.places, color: 'text-accent', icon: MapPin, emoji: '📍' },
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
        </div>
    );
}
