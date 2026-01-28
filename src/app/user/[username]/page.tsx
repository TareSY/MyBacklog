'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Badge, EmptyState, Button } from '@/components/ui';
import { User, Calendar, Film, Tv, BookOpen, Music, Gamepad2, List, ArrowLeft } from 'lucide-react';

interface ProfileData {
    user: {
        name: string;
        username: string;
        image?: string;
        createdAt: string;
    };
    stats: {
        totalItems: number;
        publicLists: number;
        categories: { categoryId: number; categoryName: string; count: number }[];
    };
    lists: { id: string; name: string; description?: string; url: string }[];
}

const categoryIcons: Record<number, React.ElementType> = {
    1: Film,
    2: Tv,
    3: BookOpen,
    4: Music,
    5: Gamepad2,
};

const categoryColors: Record<number, string> = {
    1: 'bg-red-500/20 text-red-400',
    2: 'bg-blue-500/20 text-blue-400',
    3: 'bg-green-500/20 text-green-400',
    4: 'bg-purple-500/20 text-purple-400',
    5: 'bg-orange-500/20 text-orange-400',
};

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/users/${username}`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    const err = await res.json();
                    setError(err.error || 'User not found');
                }
            } catch {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        if (username) fetchProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-bg-elevated" />
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-bg-elevated rounded" />
                        <div className="h-4 w-32 bg-bg-elevated rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-bg-elevated rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <EmptyState
                emoji="🔒"
                title="Profile Not Found"
                description={error || 'This user does not exist or has no public content'}
                action={<Link href="/browse"><Button>Browse Content</Button></Link>}
            />
        );
    }

    const { user, stats, lists } = data;
    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Back link */}
            <Link href="/browse" className="text-primary-light hover:text-primary text-sm inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Browse
            </Link>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {user.image ? (
                    <img
                        src={user.image}
                        alt={user.name || user.username}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="w-12 h-12 text-white" />
                    </div>
                )}
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-text-primary">
                        {user.name || user.username}
                    </h1>
                    <p className="text-text-muted">@{user.username}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {joinDate}</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card variant="glass">
                    <CardContent className="py-4 text-center">
                        <p className="text-3xl font-bold text-primary">{stats.totalItems}</p>
                        <p className="text-sm text-text-muted">Total Items</p>
                    </CardContent>
                </Card>
                <Card variant="glass">
                    <CardContent className="py-4 text-center">
                        <p className="text-3xl font-bold text-secondary">{stats.publicLists}</p>
                        <p className="text-sm text-text-muted">Public Lists</p>
                    </CardContent>
                </Card>
                <Card variant="glass" className="col-span-2">
                    <CardContent className="py-4">
                        <p className="text-sm text-text-muted mb-2">Categories</p>
                        <div className="flex flex-wrap gap-2">
                            {stats.categories.map(cat => {
                                const Icon = categoryIcons[cat.categoryId] || Film;
                                return (
                                    <Badge
                                        key={cat.categoryId}
                                        className={categoryColors[cat.categoryId]}
                                    >
                                        <Icon className="w-3 h-3 mr-1" />
                                        {cat.count} {cat.categoryName}
                                    </Badge>
                                );
                            })}
                            {stats.categories.length === 0 && (
                                <span className="text-text-muted text-sm">No public items</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Public Lists */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <List className="w-5 h-5 text-primary" />
                        Public Lists
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {lists.length > 0 ? (
                        <div className="grid gap-3">
                            {lists.map(list => (
                                <Link
                                    key={list.id}
                                    href={list.url}
                                    className="block p-4 rounded-xl bg-bg-elevated hover:bg-bg-elevated/80 transition-colors"
                                >
                                    <p className="font-medium text-text-primary">{list.name}</p>
                                    {list.description && (
                                        <p className="text-sm text-text-muted mt-1 line-clamp-2">
                                            {list.description}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-muted text-center py-8">
                            No public lists yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
