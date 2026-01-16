'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { Plus, Search, Sparkles, Film, Tv, BookOpen, Music, ArrowRight, Loader2 } from 'lucide-react';

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
}

export default function DashboardPage() {
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<CategoryStats>({ movies: 0, tv: 0, books: 0, music: 0 });

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/lists');
                const data = await res.json();
                setLists(Array.isArray(data) ? data : []);

                // Calculate stats from first list if it has items
                if (data.length > 0 && data[0].items) {
                    const items = data[0].items;
                    setStats({
                        movies: items.filter((i: any) => i.categoryId === 1).length,
                        tv: items.filter((i: any) => i.categoryId === 2).length,
                        books: items.filter((i: any) => i.categoryId === 3).length,
                        music: items.filter((i: any) => i.categoryId === 4).length,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch lists:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const totalItems = stats.movies + stats.tv + stats.books + stats.music;

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
                                Find Movies & Shows
                            </Button>
                        </Link>
                        {lists.length > 0 && (
                            <Link href={`/lists/${lists[0].id}`}>
                                <Button
                                    variant="secondary"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                                    size="lg"
                                    leftIcon={<ArrowRight className="w-5 h-5" />}
                                >
                                    View My List
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Movies', count: stats.movies, color: 'text-movies', icon: Film, emoji: '🎬' },
                    { label: 'TV Shows', count: stats.tv, color: 'text-tv', icon: Tv, emoji: '📺' },
                    { label: 'Books', count: stats.books, color: 'text-books', icon: BookOpen, emoji: '📚' },
                    { label: 'Music', count: stats.music, color: 'text-music', icon: Music, emoji: '🎵' },
                ].map((stat) => (
                    <Card key={stat.label} variant="glass" hover className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm font-medium">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.count}</p>
                        </div>
                        <span className="text-2xl">{stat.emoji}</span>
                    </Card>
                ))}
            </div>

            {/* Lists Section */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
            ) : lists.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-text-primary">Your Lists</h2>
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
        </div>
    );
}
