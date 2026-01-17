'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input, Card, CardContent, Badge, EmptyState } from '@/components/ui';
import { Search as SearchIcon, Film, Tv, BookOpen, Music } from 'lucide-react';
import debounce from 'lodash.debounce';

interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    releaseYear?: number;
    category: string;
    categorySlug: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
    movies: <Film className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    books: <BookOpen className="w-4 h-4" />,
    music: <Music className="w-4 h-4" />,
};

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const doSearch = useCallback(
        debounce(async (q: string, cat: string) => {
            if (q.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&category=${cat}&limit=30`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
                setSearched(true);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (query.length >= 2) {
            doSearch(query, category);
            router.replace(`/search?q=${encodeURIComponent(query)}&category=${category}`, { scroll: false });
        }
    }, [query, category]);

    const categories = [
        { slug: 'all', name: 'All' },
        { slug: 'movies', name: 'Movies' },
        { slug: 'tv', name: 'TV Shows' },
        { slug: 'books', name: 'Books' },
        { slug: 'music', name: 'Music' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                    <SearchIcon className="w-8 h-8 text-primary" />
                    Search
                </h1>
                <p className="text-text-muted mt-2">Find movies, TV shows, books, and music</p>
            </div>

            {/* Search Input */}
            <div className="space-y-4">
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for anything..."
                    leftIcon={<SearchIcon className="w-5 h-5" />}
                    className="text-lg"
                />

                {/* Category Filters */}
                <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => setCategory(cat.slug)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat.slug
                                    ? 'bg-primary text-white'
                                    : 'bg-bg-elevated text-text-secondary hover:bg-bg-surface'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-20 rounded-xl" />
                    ))}
                </div>
            ) : results.length > 0 ? (
                <div className="space-y-3">
                    <p className="text-sm text-text-muted">{results.length} results</p>
                    {results.map((result) => (
                        <Card key={result.id} variant="default" className="hover:border-primary/30 transition-colors">
                            <CardContent className="flex items-center gap-4 py-4">
                                {result.imageUrl ? (
                                    <img
                                        src={result.imageUrl}
                                        alt={result.title}
                                        className="w-16 h-20 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-20 bg-bg-elevated rounded-lg flex items-center justify-center text-text-muted">
                                        {categoryIcons[result.categorySlug] || <BookOpen className="w-6 h-6" />}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-text-primary truncate">{result.title}</h3>
                                    {result.subtitle && (
                                        <p className="text-sm text-text-muted truncate">{result.subtitle}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="default">{result.category}</Badge>
                                        {result.releaseYear && (
                                            <span className="text-xs text-text-disabled">{result.releaseYear}</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : searched && query.length >= 2 ? (
                <EmptyState
                    emoji="🔍"
                    title="No Results"
                    description={`No items found for "${query}"`}
                />
            ) : (
                <div className="text-center py-12 text-text-muted">
                    <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Start typing to search...</p>
                </div>
            )}
        </div>
    );
}
