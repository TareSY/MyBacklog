'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Sparkles } from 'lucide-react';

interface ChangelogEntry {
    version: string;
    date: string;
    content: string;
}

const changelog: ChangelogEntry[] = [
    {
        version: 'v0.1.18',
        date: '2026-01-28',
        content: '🥚💥', // Cracking egg
    },
    {
        version: 'v0.1.16',
        date: '2026-01-28',
        content: '🥚',
    },
];

export default function ChangelogPage() {
    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">What's New</span>
                    </div>
                    <h1 className="text-4xl font-bold text-text-primary mb-2">
                        Changelog
                    </h1>
                    <p className="text-text-muted">
                        A totally serious log of all the serious changes.
                    </p>
                </div>

                {/* Changelog entries */}
                <div className="space-y-6">
                    {changelog.map((entry) => (
                        <Card key={entry.version} variant="elevated">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-mono text-primary">
                                        {entry.version}
                                    </CardTitle>
                                    <span className="text-xs text-text-muted">
                                        {entry.date}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl text-center py-8">
                                    {entry.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Easter egg hint */}
                <p className="text-center text-text-muted text-sm mt-12">
                    More updates coming soon... maybe. 👀
                </p>
            </div>
        </div>
    );
}
