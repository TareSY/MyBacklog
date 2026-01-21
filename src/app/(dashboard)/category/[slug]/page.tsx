'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { Film, Tv, BookOpen, Music, Gamepad2, ArrowLeft, Loader2, List as ListIcon } from 'lucide-react';

const categoryMap: Record<string, { id: number; label: string; icon: any; color: string }> = {
    movies: { id: 1, label: 'Movies', icon: Film, color: 'text-movies' },
    tv: { id: 2, label: 'TV Shows', icon: Tv, color: 'text-tv' },
    books: { id: 3, label: 'Books', icon: BookOpen, color: 'text-books' },
    music: { id: 4, label: 'Music', icon: Music, color: 'text-music' },
    games: { id: 5, label: 'Games', icon: Gamepad2, color: 'text-games' },
};

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const category = categoryMap[slug];

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!category) {
            router.push('/dashboard');
            return;
        }

        async function fetchItems() {
            try {
                const res = await fetch(`/api/items?categoryId=${category.id}`);
                const data = await res.json();
                setItems(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch items', error);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, [category, router]);

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
        </div>
    );
}
