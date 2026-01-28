'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Film, Tv, BookOpen, Music, Gamepad2, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    categoryId: number;
    category: string;
}

const categoryIcons: Record<number, React.ElementType> = {
    1: Film,
    2: Tv,
    3: BookOpen,
    4: Music,
    5: Gamepad2,
};

const categoryColors: Record<number, string> = {
    1: 'text-red-400',
    2: 'text-blue-400',
    3: 'text-green-400',
    4: 'text-purple-400',
    5: 'text-orange-400',
};

export function SearchDialog() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('recentSearches');
            if (saved) {
                setRecentSearches(JSON.parse(saved).slice(0, 5));
            }
        } catch {
            // Ignore corrupted localStorage data
        }
    }, []);

    // Save to recent searches
    const saveRecentSearch = (term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // Keyboard shortcut: ⌘K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when dialog opens
    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [open]);

    // Search with debounce
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        }
    }, [results, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
        const selected = resultsRef.current?.children[selectedIndex] as HTMLElement;
        selected?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const handleSelect = (result: SearchResult) => {
        saveRecentSearch(query);
        setOpen(false);
        router.push(`/search?q=${encodeURIComponent(result.title)}`);
    };

    const handleRecentClick = (term: string) => {
        setQuery(term);
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-text-muted hover:text-text-primary hover:border-primary/50 transition-all text-sm"
            >
                <Search className="w-4 h-4" />
                <span>Search...</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-bg-surface text-xs font-mono">
                    ⌘K
                </kbd>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={() => setOpen(false)}
            />

            {/* Dialog */}
            <div className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-xl animate-scale-in">
                <div className="bg-bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search input */}
                    <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
                        <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search movies, TV, books, music, games..."
                            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-lg"
                        />
                        {loading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                        <button onClick={() => setOpen(false)} className="p-1 hover:bg-bg-elevated rounded">
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>

                    {/* Results */}
                    <div ref={resultsRef} className="max-h-80 overflow-y-auto">
                        {results.length > 0 ? (
                            results.map((result, i) => {
                                const Icon = categoryIcons[result.categoryId] || Film;
                                return (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3 text-left transition-colors',
                                            i === selectedIndex
                                                ? 'bg-primary/20 text-text-primary'
                                                : 'hover:bg-bg-elevated text-text-secondary'
                                        )}
                                    >
                                        {result.imageUrl ? (
                                            <img
                                                src={result.imageUrl}
                                                alt={result.title}
                                                className="w-10 h-14 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-10 h-14 bg-bg-elevated rounded flex items-center justify-center">
                                                <Icon className={cn('w-5 h-5', categoryColors[result.categoryId])} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{result.title}</p>
                                            {result.subtitle && (
                                                <p className="text-sm text-text-muted truncate">{result.subtitle}</p>
                                            )}
                                        </div>
                                        <span className={cn('text-xs', categoryColors[result.categoryId])}>
                                            {result.category}
                                        </span>
                                        {i === selectedIndex && (
                                            <ArrowRight className="w-4 h-4 text-primary" />
                                        )}
                                    </button>
                                );
                            })
                        ) : query.length >= 2 && !loading ? (
                            <div className="p-8 text-center text-text-muted">
                                <p>No results found for "{query}"</p>
                            </div>
                        ) : query.length < 2 && recentSearches.length > 0 ? (
                            <div className="p-4">
                                <p className="text-xs text-text-muted mb-2">Recent searches</p>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => handleRecentClick(term)}
                                            className="px-3 py-1 rounded-full bg-bg-elevated text-sm text-text-secondary hover:text-text-primary hover:bg-primary/20 transition-colors"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-text-muted">
                                <p>Type to search your backlog</p>
                            </div>
                        )}
                    </div>

                    {/* Footer hints */}
                    <div className="flex items-center justify-between px-4 py-2 border-t border-border-subtle text-xs text-text-muted">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated font-mono">↑↓</kbd>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated font-mono">↵</kbd>
                            <span>Select</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated font-mono">Esc</kbd>
                            <span>Close</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
