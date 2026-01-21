'use client';

import { useState } from 'react';
import { Button, Input, Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/components/ui';
import { Plus, Globe, Lock } from 'lucide-react';

interface CreateListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (list: any) => void;
}

export function CreateListModal({ isOpen, onClose, onCreated }: CreateListModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function resetForm() {
        setName('');
        setDescription('');
        setIsPublic(false);
        setError(null);
        onClose();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setError('List name is required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                    isPublic,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to create list');
            }

            const newList = await res.json();
            onCreated(newList);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to create list');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={resetForm}>
            <ModalContent size="md">
                <ModalHeader>
                    <ModalTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Create New List
                    </ModalTitle>
                    <ModalDescription>
                        Organize your entertainment with custom lists
                    </ModalDescription>
                </ModalHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                            {error}
                        </div>
                    )}

                    <Input
                        label="List Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Movies to Watch, Summer Reading"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this list for?"
                            className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            rows={2}
                        />
                    </div>

                    {/* Public/Private Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated border border-border-subtle">
                        <div className="flex items-center gap-3">
                            {isPublic ? (
                                <Globe className="w-5 h-5 text-success" />
                            ) : (
                                <Lock className="w-5 h-5 text-text-muted" />
                            )}
                            <div>
                                <p className="font-medium text-text-primary">
                                    {isPublic ? 'Public List' : 'Private List'}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {isPublic
                                        ? 'Anyone can view this list'
                                        : 'Only you can see this list'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-success' : 'bg-bg-surface'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={resetForm}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={saving} className="flex-1">
                            Create List
                        </Button>
                    </div>
                </form>
            </ModalContent>
        </Modal>
    );
}
