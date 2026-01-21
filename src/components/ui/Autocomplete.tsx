'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Search, Loader2 } from 'lucide-react';

interface AutocompleteItem {
    id: string;
    title: string;
    subtitle?: string | null;
    imageUrl?: string | null;
    releaseYear?: number | null;
    category?: string;
    categorySlug?: string;
}

interface AutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (item: AutocompleteItem) => void;
    categorySlug?: string;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export function Autocomplete({
    value,
    onChange,
    onSelect,
    categorySlug,
    placeholder = 'Search...',
    label,
    required,
}: AutocompleteProps) {
    const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounced search function
    const searchItems = useCallback(
        debounce(async (query: string) => {
            if (query.length < 2) {
                setSuggestions([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const categoryParam = categorySlug ? `&category=${categorySlug}` : '';
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}${categoryParam}&limit=8`);
                const data = await res.json();
                setSuggestions(data.results || []);
                setIsOpen(true);
            } catch (error) {
                console.error('Search failed:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        [categorySlug]
    );

    // Trigger search on value change
    useEffect(() => {
        if (value) {
            searchItems(value);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [value, searchItems]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    function handleKeyDown(e: React.KeyboardEvent) {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    e.preventDefault();
                    selectItem(suggestions[highlightedIndex]);
                }
                // If no selection, allow form submission with typed value
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    }

    function selectItem(item: AutocompleteItem) {
        onChange(item.title);
        onSelect?.(item);
        setIsOpen(false);
        setHighlightedIndex(-1);
    }

    return (
        <div ref={containerRef} className="relative">
            {label && (
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {label} {required && '*'}
                </label>
            )}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    required={required}
                    className="w-full px-4 py-3 pl-11 rounded-xl bg-bg-elevated border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Search className="w-4 h-4" />
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-bg-surface border border-border-default rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <ul className="max-h-64 overflow-y-auto">
                        {suggestions.map((item, index) => (
                            <li
                                key={item.id}
                                onClick={() => selectItem(item)}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${index === highlightedIndex
                                        ? 'bg-primary/20'
                                        : 'hover:bg-bg-elevated'
                                    }`}
                            >
                                {/* Thumbnail */}
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt=""
                                        className="w-10 h-14 object-cover rounded-lg shrink-0"
                                    />
                                ) : (
                                    <div className="w-10 h-14 bg-bg-elevated rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-lg">
                                            {item.categorySlug === 'movies' ? '🎬' :
                                                item.categorySlug === 'tv' ? '📺' :
                                                    item.categorySlug === 'books' ? '📚' : '🎵'}
                                        </span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-text-primary truncate">{item.title}</p>
                                    <p className="text-sm text-text-muted truncate">
                                        {item.releaseYear && `${item.releaseYear}`}
                                        {item.subtitle && ` • ${item.subtitle}`}
                                    </p>
                                </div>

                                {/* Category badge */}
                                {item.category && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted shrink-0">
                                        {item.category}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="px-4 py-2 text-xs text-text-muted border-t border-border-subtle bg-bg-elevated">
                        💡 Press Enter to use "{value}" or select from above
                    </div>
                </div>
            )}
        </div>
    );
}
