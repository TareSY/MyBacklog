'use client';

import { useState, useEffect } from 'react';
import { Film, Tv, BookOpen, Music, Gamepad2, Plus, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Button, Input, Card, Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, Badge, Autocomplete, useToast } from '@/components/ui';

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
    const [saving, setSaving] = useState(false);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    const [userLists, setUserLists] = useState<any[]>([]);
    const [selectedListId, setSelectedListId] = useState('');

    // Load user lists
    useEffect(() => {
        async function loadLists() {
            try {
                const res = await fetch('/api/lists');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setUserLists(data);
                    if (data.length > 0 && !selectedListId) {
                        setSelectedListId(data[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to load lists', error);
            }
        }
        loadLists();
    }, []);

    // Load suggestions (public lists)
    useEffect(() => {
        async function loadSuggestions() {
            try {
                const res = await fetch('/api/lists?type=public');
                const data = await res.json();
                setSuggestions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load suggestions', error);
            } finally {
                setLoadingSuggestions(false);
            }
        }
        loadSuggestions();
    }, []);

    function openAddModal(categoryId: number, prefill?: any) {
        setSelectedCategory(categoryId);
        if (prefill) {
            setTitle(prefill.title);
            setSubtitle(prefill.subtitle || '');
            setPlatform(prefill.platform || '');
            setYear(prefill.releaseYear || '');
            setDescription(prefill.description || '');
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
        setIsOpen(false);
        setSelectedCategory(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !selectedCategory) return;

        setSaving(true);
        try {
            let listId = selectedListId;

            // If no list selected (or no lists exist), create one
            if (!listId) {
                const createRes = await fetch('/api/lists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'My Backlog' }),
                });
                const newList = await createRes.json();
                listId = newList.id;

                // Update lists state
                setUserLists(prev => [...prev, newList]);
                setSelectedListId(newList.id);
            }

            // Add item
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listId,
                    categoryId: selectedCategory,
                    title,
                    subtitle: subtitle || null,
                    platform: platform || null,
                    releaseYear: year ? parseInt(year) : null,
                    description: description || null,
                    externalId: null,
                    externalSource: 'manual',
                    imageUrl: null,
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
            <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                    <span>Add to Backlog</span>
                    <span className="text-2xl">✨</span>
                </h1>
                <p className="text-text-muted mt-2">
                    What do you want to watch, read, listen to, or play next?
                </p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(({ id, name, icon: Icon, emoji, color }) => (
                    <Card
                        key={id}
                        variant="glass"
                        hover
                        className="p-6 cursor-pointer group text-center"
                        onClick={() => openAddModal(id)}
                    >
                        <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">
                            {emoji}
                        </div>
                        <h3 className={`text-lg font-bold ${color} mb-2`}>Add {name}</h3>
                        <p className="text-text-muted text-sm">
                            Track a new {name.toLowerCase()}
                        </p>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4 w-full opacity-0 group-hover:opacity-100 transition-opacity"
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Add
                        </Button>
                    </Card>
                ))}
            </div>

            {/* Suggestions Section */}
            {suggestions.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">Featured Suggestions</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {suggestions.map((list) => (
                            <Card key={list.id} variant="default" className="p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    {list.name}
                                    <span className="text-xs font-normal text-text-muted px-2 py-0.5 rounded-full bg-bg-elevated">Featured</span>
                                </h3>
                                <div className="space-y-3">
                                    {list.items && list.items.slice(0, 5).map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated hover:bg-bg-surface transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">
                                                    {item.categoryId === 1 ? '🎬' : item.categoryId === 3 ? '📚' : '📺'}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-text-primary text-sm">{item.title}</p>
                                                    <p className="text-xs text-text-muted">
                                                        {item.releaseYear} {item.subtitle && `• ${item.subtitle}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openAddModal(item.categoryId, item)}
                                                leftIcon={<Plus className="w-4 h-4" />}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

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
                            }}
                            categorySlug={
                                selectedCat?.id === 1 ? 'movies' :
                                    selectedCat?.id === 2 ? 'tv' :
                                        selectedCat?.id === 3 ? 'books' :
                                            selectedCat?.id === 5 ? 'games' : 'music'
                            }
                            placeholder={selectedCat?.id === 1 ? "Search or type a movie..." :
                                selectedCat?.id === 2 ? "Search or type a TV show..." :
                                    selectedCat?.id === 3 ? "Search or type a book..." :
                                        selectedCat?.id === 5 ? "Search or type a game..." : "Search or type an album..."}
                            required
                        />

                        {/* List Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">
                                Add to List
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedListId}
                                    onChange={(e) => setSelectedListId(e.target.value)}
                                    className="w-full appearance-none px-4 py-3 rounded-xl bg-bg-elevated border border-border-default text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
                                >
                                    {userLists.map((list) => (
                                        <option key={list.id} value={list.id}>
                                            {list.name} {list.isPublic ? '(Public)' : '(Private)'}
                                        </option>
                                    ))}
                                    {userLists.length === 0 && <option value="">Loading lists...</option>}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

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
