'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter, Button, useToast } from '@/components/ui';
import { Send, Loader2 } from 'lucide-react';

interface RequestItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultCategory?: string;
}

const categories = [
    { value: 'movies', label: '🎬 Movies' },
    { value: 'tv', label: '📺 TV Shows' },
    { value: 'books', label: '📚 Books' },
    { value: 'music', label: '🎵 Music' },
    { value: 'games', label: '🎮 Games' },
];

export function RequestMediaModal({ isOpen, onClose, defaultCategory }: RequestItemModalProps) {
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(defaultCategory || 'movies');
    const [year, setYear] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!title.trim()) {
            toast('Please enter a title', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    category,
                    year: year.trim() || undefined,
                    notes: notes.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            toast(data.message || 'Request submitted!', 'success');

            // Reset form and close
            setTitle('');
            setYear('');
            setNotes('');
            onClose();

        } catch (error: any) {
            toast(error.message || 'Failed to submit request', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>Request Media</ModalTitle>
                    </ModalHeader>
                    <ModalBody className="space-y-4">
                        <p className="text-sm text-text-muted">
                            Can't find what you're looking for? Let us know and we'll try to add it!
                        </p>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., The Great Gatsby"
                                className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                                maxLength={200}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary focus:border-primary focus:outline-none"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Year <span className="text-text-muted">(optional)</span>
                            </label>
                            <input
                                type="text"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="e.g., 2020 or late 90s"
                                className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                                maxLength={50}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Notes <span className="text-text-muted">(optional)</span>
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any extra details to help us find it (e.g., 'the one with Tom Hanks')"
                                className="w-full px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none resize-none"
                                rows={3}
                                maxLength={500}
                            />
                            <p className="text-xs text-text-muted mt-1 text-right">
                                {notes.length}/500
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={submitting || !title.trim()}
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submit Request
                                </>
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
