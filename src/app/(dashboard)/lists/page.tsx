'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { CreateListModal } from '@/components/CreateListModal';
import { Plus, List as ListIcon, Loader2, Lock, Globe, Crown } from 'lucide-react';

interface List {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    stats?: {
        movies: number;
        tv: number;
        books: number;
        music: number;
        games: number;
    };
}

export default function ListsPage() {
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        async function fetchLists() {
            try {
                const res = await fetch('/api/lists');
                const data = await res.json();
                setLists(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch lists:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLists();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">My Lists</h1>
                    <p className="text-text-muted mt-2">Manage your backlog collections</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-5 h-5" />}>
                    Create List
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : lists.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {lists.map((list) => {
                        const totalItems = list.stats
                            ? (list.stats.movies + list.stats.tv + list.stats.books + list.stats.music + list.stats.games)
                            : 0;

                        return (
                            <Link key={list.id} href={`/lists/${list.id}`}>
                                <Card variant="default" hover className="p-6 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-lg bg-bg-elevated">
                                            <ListIcon className="w-6 h-6 text-primary" />
                                        </div>
                                        {list.isPublic ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                                                <Globe className="w-3.5 h-3.5" />
                                                Public
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated text-text-muted text-xs font-medium">
                                                <Lock className="w-3.5 h-3.5" />
                                                Private
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1 flex items-center gap-2">
                                        {list.name}
                                        {lists.indexOf(list) === 0 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium" title="Default List">
                                                <Crown className="w-3 h-3" />
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-text-muted text-sm line-clamp-2 mb-6 flex-1">
                                        {list.description || 'No description provided.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle text-sm">
                                        <span className="text-text-secondary">{totalItems} items</span>
                                        <span className="text-primary group-hover:translate-x-1 transition-transform">
                                            View List &rarr;
                                        </span>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed border-border-subtle rounded-3xl bg-bg-surface/30">
                    <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-6">
                        <ListIcon className="w-8 h-8 text-text-muted" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">No lists found</h2>
                    <p className="text-text-muted max-w-sm mx-auto mb-8">
                        Create your first list to start tracking items in your backlog.
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        Create New List
                    </Button>
                </div>
            )}

            <CreateListModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={(newList) => setLists(prev => [...prev, newList])}
            />
        </div>
    );
}
