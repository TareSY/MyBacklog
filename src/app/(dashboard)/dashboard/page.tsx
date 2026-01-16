'use client';

import { Card, Button } from '@/components/ui';
import { Plus, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 sm:p-12">
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Welcome to Your Backlog! ✨
                    </h1>
                    <p className="text-white/80 text-lg max-w-2xl mb-8">
                        Your collection is looking a bit empty. Let's find some entertainment to track!
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/browse">
                            <Button
                                className="bg-white text-primary hover:bg-white/90 border-none"
                                size="lg"
                                leftIcon={<Search className="w-5 h-5" />}
                            >
                                Find Movies & Books
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                            size="lg"
                            leftIcon={<Plus className="w-5 h-5" />}
                        >
                            Create New List
                        </Button>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-[40px] -ml-10 -mb-10 pointer-events-none" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Movies', count: 0, color: 'text-movies', icon: '🎬' },
                    { label: 'TV Shows', count: 0, color: 'text-tv', icon: '📺' },
                    { label: 'Books', count: 0, color: 'text-books', icon: '📚' },
                    { label: 'Music', count: 0, color: 'text-music', icon: '🎵' },
                ].map((stat) => (
                    <Card key={stat.label} variant="glass" hover className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-text-muted text-sm font-medium">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.count}</p>
                        </div>
                        <span className="text-2xl">{stat.icon}</span>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border-subtle rounded-3xl bg-bg-surface/30">
                <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-6 animate-bounce">
                    <Sparkles className="w-8 h-8 text-primary-light" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                    Your backlog is waiting
                </h2>
                <p className="text-text-muted max-w-md mb-8">
                    Search for titles you want to experience or create custom lists to organize your collection.
                </p>
                <Link href="/browse">
                    <Button>Start Exploring</Button>
                </Link>
            </div>
        </div>
    );
}
