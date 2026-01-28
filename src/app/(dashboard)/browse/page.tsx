'use client';

import { useState, useEffect } from 'react';
import { Film, Tv, BookOpen, Music, Gamepad2, Plus, Sparkles, Loader2, ArrowRight, Check } from 'lucide-react';
import { Button, Input, Card, Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, Badge, Autocomplete, useToast } from '@/components/ui';
import { RequestMediaModal } from '@/components/RequestMediaModal';
import { MessageSquarePlus } from 'lucide-react';
import { curatedContent, type CuratedCategory } from '@/lib/curated-content';

const categories = [
    { id: 1, name: 'Movie', icon: Film, emoji: '🎬', color: 'text-movies' },
    { id: 2, name: 'TV Show', icon: Tv, emoji: '📺', color: 'text-tv' },
    { id: 3, name: 'Book', icon: BookOpen, emoji: '📚', color: 'text-books' },
    { id: 4, name: 'Album', icon: Music, emoji: '🎵', color: 'text-music' },
    { id: 5, name: 'Game', icon: Gamepad2, emoji: '🎮', color: 'text-games' },
];

export default function BrowsePage() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [platform, setPlatform] = useState('');
    const [year, setYear] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [subtype, setSubtype] = useState<'album' | 'song'>('album');
    const [saving, setSaving] = useState(false);
    const [fetchingMetadata, setFetchingMetadata] = useState(false);

    const [userLists, setUserLists] = useState<any[]>([]);
    const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Load user lists
    useEffect(() => {
        async function loadLists() {
            try {
                const res = await fetch('/api/lists');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setUserLists(data);
                    if (data.length > 0 && selectedListIds.length === 0) {
                        setSelectedListIds([data[0].id]);
                    }
                }
            } catch (error) {
                console.error('Failed to load lists', error);
            }
        }
        loadLists();
    }, []);

    function openAddModal(categoryId: number, prefill?: any) {
        setSelectedCategory(categoryId);
        if (prefill) {
            setTitle(prefill.title);
            setSubtitle(prefill.subtitle || '');
            setPlatform(prefill.platform || '');
            setYear(prefill.releaseYear ? String(prefill.releaseYear) : '');
            setDescription(prefill.description || '');
            setImageUrl(prefill.imageUrl || null);
            if (prefill.subtype) setSubtype(prefill.subtype);
        } else {
            resetForm();
            setSelectedCategory(categoryId);
        }
        setIsOpen(true);
    }

    function resetForm() {
        setTitle('');
        setSubtitle('');
        setPlatform('');
        setYear('');
        setDescription('');
        setImageUrl(null);
        setSubtype('album');
        setIsOpen(false);
        setSelectedCategory(null);
    }

    // Fetch metadata for curated item to get image
    async function openCuratedItem(categoryId: number, categoryKey: string, item: { title: string; subtitle?: string; year: number }) {
        setSelectedCategory(categoryId);
        setTitle(item.title);
        setSubtitle(item.subtitle || '');
        setYear(String(item.year));
        setImageUrl(null);
        setIsOpen(true);
        setFetchingMetadata(true);

        try {
            const res = await fetch(`/api/metadata/search?q=${encodeURIComponent(item.title)}&category=${categoryKey}`);
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                // Find the best match by title
                const match = data.results.find((r: any) =>
                    r.title.toLowerCase() === item.title.toLowerCase()
                ) || data.results[0];

                if (match.imageUrl) setImageUrl(match.imageUrl);
                if (match.description && !description) setDescription(match.description);
            }
        } catch (error) {
            console.error('Failed to fetch metadata', error);
        } finally {
            setFetchingMetadata(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !selectedCategory) return;

        setSaving(true);
        try {
            let listIds = [...selectedListIds];

            // If no list selected (or no lists exist), create one
            if (listIds.length === 0) {
                const createRes = await fetch('/api/lists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'My Backlog' }),
                });
                const newList = await createRes.json();
                listIds = [newList.id];

                // Update lists state
                setUserLists(prev => [...prev, newList]);
                setSelectedListIds([newList.id]);
            }

            // Add item
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listIds, // Send array
                    categoryId: selectedCategory,
                    title,
                    subtitle: subtitle || null,
                    platform: platform || null,
                    releaseYear: year ? parseInt(year) : null,
                    description: description || null,
                    externalId: null, // We could capture this too if needed
                    externalSource: 'manual',
                    imageUrl: imageUrl || null,
                    subtype: selectedCategory === 4 ? subtype : null,
                }),
            });

            if (!res.ok) {
                if (res.status === 409) {
                    throw new Error('This item is already in your selected list.');
                }
                throw new Error('Failed to add item');
            }

            toast(`Added "${title}" to your backlog!`, 'success');
            resetForm();
        } catch (error: any) {
            console.error('Failed to add item:', error);
            const msg = error.message || 'Failed to add item';
            toast(msg, 'error');
        } finally {
            setSaving(false);
        }
    }

    const { toast } = useToast();

    const selectedCat = categories.find(c => c.id === selectedCategory);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                    Browse Entertainment ✨
                </h1>
                <p className="text-text-muted text-lg max-w-2xl mx-auto">
                    Pick a category to add something to your backlog
                </p>
                <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    Can't find what you're looking for? Request it
                </button>
            </div>

            {/* Request Media Modal */}
            <RequestMediaModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
            />

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => openAddModal(cat.id)}
                            className={`group relative p-6 rounded-2xl border border-border-subtle bg-bg-surface hover:border-primary/50 hover:bg-bg-elevated transition-all duration-300 flex flex-col items-center gap-3`}
                        >
                            <div className={`p-4 rounded-xl bg-bg-elevated group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-8 h-8 ${cat.color}`} />
                            </div>
                            <span className="font-semibold text-text-primary">{cat.name}</span>
                            <span className="text-3xl">{cat.emoji}</span>
                        </button>
                    );
                })}
            </div>

            {/* Curated Picks */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Top Picks of the Decade
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        { key: 'movies', label: 'Movies', emoji: '🎬', color: 'text-movies', categoryId: 1 },
                        { key: 'tv', label: 'TV Shows', emoji: '📺', color: 'text-tv', categoryId: 2 },
                        { key: 'books', label: 'Books', emoji: '📚', color: 'text-books', categoryId: 3 },
                        { key: 'music', label: 'Albums', emoji: '🎵', color: 'text-music', categoryId: 4 },
                        { key: 'games', label: 'Games', emoji: '🎮', color: 'text-games', categoryId: 5 },
                    ].map(cat => (
                        <Card key={cat.key} variant="glass" className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{cat.emoji}</span>
                                <h3 className={`font-semibold ${cat.color}`}>Top {cat.label}</h3>
                            </div>
                            <div className="space-y-2">
                                {curatedContent[cat.key as keyof CuratedCategory].slice(0, 3).map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => openCuratedItem(cat.categoryId, cat.key, {
                                            title: item.title,
                                            subtitle: item.subtitle,
                                            year: item.year
                                        })}
                                        className="w-full flex justify-between items-center text-sm p-2 -mx-2 rounded-lg hover:bg-bg-elevated transition-colors group"
                                    >
                                        <span className="text-text-primary truncate">{item.title}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-text-muted text-xs shrink-0">{item.year}</span>
                                            <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            <Modal isOpen={isOpen} onClose={resetForm}>
                <ModalContent size="md">
                    <ModalHeader>
                        <ModalTitle className="flex items-center gap-2">
                            {selectedCat && <span className="text-2xl">{selectedCat.emoji}</span>}
                            Add {selectedCat?.name}
                        </ModalTitle>
                        <ModalDescription>
                            Add a new {selectedCat?.name.toLowerCase()} to your backlog
                        </ModalDescription>
                    </ModalHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <Autocomplete
                            label="Title"
                            value={title}
                            onChange={setTitle}
                            onSelect={(item) => {
                                setTitle(item.title);
                                if (item.subtitle) setSubtitle(item.subtitle);
                                if (item.releaseYear) setYear(String(item.releaseYear));
                                if (item.imageUrl) setImageUrl(item.imageUrl);
                            }}
                            categorySlug={
                                selectedCat?.id === 1 ? 'movies' :
                                    selectedCat?.id === 2 ? 'tv' :
                                        selectedCat?.id === 3 ? 'books' :
                                            selectedCat?.id === 5 ? 'games' : 'music'
                            }
                            placeholder={`Search or type a ${selectedCat?.name.toLowerCase()}...`}
                            required
                        />

                        {/* List Selection (Multi-Select) */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">
                                Add to List(s)
                            </label>
                            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-bg-elevated border border-border-default">
                                {userLists.length > 0 ? userLists.map((list) => {
                                    const isSelected = selectedListIds.includes(list.id);
                                    return (
                                        <button
                                            key={list.id}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedListIds(prev => prev.filter(id => id !== list.id));
                                                } else {
                                                    setSelectedListIds(prev => [...prev, list.id]);
                                                }
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${isSelected
                                                ? 'bg-primary/20 text-primary-light ring-1 ring-primary'
                                                : 'text-text-secondary hover:bg-bg-surface'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                                                ? 'bg-primary border-primary'
                                                : 'border-text-muted'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            {list.name} {list.isPublic ? '(Public)' : ''}
                                        </button>
                                    );
                                }) : (
                                    <div className="text-sm text-text-muted p-2">Loading lists...</div>
                                )}
                            </div>
                        </div>

                        {selectedCat?.id === 4 && (
                            <div className="space-y-3 pt-2">
                                <label className="block text-sm font-medium text-text-secondary">Type</label>
                                <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-default">
                                    <button
                                        type="button"
                                        onClick={() => setSubtype('album')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${subtype === 'album' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                    >
                                        Album
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSubtype('song')}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${subtype === 'song' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                                    >
                                        Song
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedCat?.id === 5 && (
                            <Input
                                label="Platform"
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                placeholder="PC, PS5, Switch..."
                            />
                        )}
                        <Input
                            label={selectedCat?.id === 3 ? "Author" : selectedCat?.id === 4 ? "Artist" : selectedCat?.id === 5 ? "Developer" : "Subtitle"}
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder={selectedCat?.id === 3 ? "George Orwell" :
                                selectedCat?.id === 4 ? "The Beatles" : selectedCat?.id === 5 ? "Nintendo" : "Optional"}
                        />
                        <Input
                            label="Year"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="2024"
                            min="1800"
                            max="2100"
                        />
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Notes (optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Why do you want to watch/read/listen to this?"
                                className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={saving} className="flex-1">
                                Add to Backlog
                            </Button>
                        </div>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    );
}
