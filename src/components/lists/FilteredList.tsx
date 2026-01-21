'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, Badge, EmptyState, Input } from '@/components/ui';
import { CheckCircle2, Search, Filter } from 'lucide-react';

interface FileredListProps {
    items: any[];
    categoryIcons: any;
}

export function FilteredList({ items, categoryIcons }: FileredListProps) {
    const [search, setSearch] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    // keyof items[0] might not include platform if strictly typed, but dealing with 'any' for now or inferred types
    const platforms = useMemo(() => {
        const allPlatforms = items
            .map(i => i.platform)
            .filter(Boolean); // Remove null/undefined
        return Array.from(new Set(allPlatforms)).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()));
            const matchesPlatform = selectedPlatform ? item.platform === selectedPlatform : true;
            return matchesSearch && matchesPlatform;
        });
    }, [items, search, selectedPlatform]);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {platforms.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <Badge
                            variant={selectedPlatform === null ? 'info' : 'default'}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => setSelectedPlatform(null)}
                        >
                            All ({items.length})
                        </Badge>
                        {platforms.map(p => (
                            <Badge
                                key={p}
                                variant={selectedPlatform === p ? 'games' : 'default'}
                                className="cursor-pointer whitespace-nowrap"
                                onClick={() => setSelectedPlatform(p)}
                            >
                                {p}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Results */}
            {filteredItems.length === 0 ? (
                <EmptyState
                    emoji="🔍"
                    title="No matches found"
                    description="Try adjusting your filters."
                />
            ) : (
                <div className="grid gap-4 animate-fade-in">
                    {filteredItems.map((item) => (
                        <Card key={item.id} variant="default" className="hover:border-primary/30 transition-colors">
                            <CardContent className="flex items-center gap-4 p-4">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-16 h-20 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-20 bg-bg-elevated rounded-lg flex items-center justify-center text-text-muted">
                                        {categoryIcons[item.categorySlug || 'movies']}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
                                        {item.isCompleted && (
                                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex gap-2 items-center text-sm text-text-muted">
                                        {item.subtitle && (
                                            <span className="truncate">{item.subtitle}</span>
                                        )}
                                        {item.subtitle && item.platform && item.platform !== item.subtitle && (
                                            <>• <span className="text-primary-light">{item.platform}</span></>
                                        )}
                                    </div>
                                    {item.releaseYear && (
                                        <p className="text-xs text-text-disabled mt-0.5">{item.releaseYear}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant={item.categorySlug as any || 'default'}>
                                        {item.categoryName || 'Unknown'}
                                    </Badge>
                                    {item.platform && item.categorySlug === 'games' && (
                                        <Badge variant="default" className="text-xs border border-border-default">
                                            {item.platform}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
